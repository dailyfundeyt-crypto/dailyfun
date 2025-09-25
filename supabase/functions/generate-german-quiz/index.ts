import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic } = await req.json()

    const query = (topic || '').toString().trim()
    if (!query) {
      throw new Error('Missing topic')
    }

    console.log('Generating German quiz for topic:', query)

    // Try multiple AI models for better reliability
    const aiModels = [
      { name: 'Llama 3.1 405B', model: 'meta-llama/llama-3.1-405b-instruct:free' },
      { name: 'Llama 3.1 70B', model: 'meta-llama/llama-3.1-70b-instruct:free' },
      { name: 'Llama 3.2 11B', model: 'meta-llama/llama-3.2-11b-instruct:free' }
    ];

    let quiz = null;
    let successfulModel = null;

    // Try each model sequentially until one succeeds
    for (const aiModel of aiModels) {
      try {
        console.log(`Trying AI model: ${aiModel.name}`);
        
        const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
        if (!openRouterApiKey) {
          throw new Error('OPENROUTER_API_KEY not configured');
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://dailyfun.app',
            'X-Title': 'Daily Fun - German Quiz Generation'
          },
          body: JSON.stringify({
            model: aiModel.model,
            messages: [
              {
                role: 'system',
                content: `Du bist ein Experte für die Erstellung von deutschen Quiz-Fragen. Erstelle ein interessantes Multiple-Choice-Quiz zum gegebenen Thema.

WICHTIGE REGELN:
1. Die Frage muss auf Deutsch sein
2. Alle 4 Antwortmöglichkeiten müssen auf Deutsch sein
3. Genau eine Antwort muss korrekt sein
4. Die anderen 3 Antworten müssen plausibel aber falsch sein
5. Füge eine kurze Erklärung zur richtigen Antwort hinzu
6. Verwende aktuelles Wissen und interessante Fakten

FORMAT (verwende genau dieses JSON-Format):
{
  "question": "Die Quiz-Frage hier",
  "answers": ["Antwort 1", "Antwort 2", "Antwort 3", "Antwort 4"],
  "correctAnswer": "Die richtige Antwort (muss exakt eine der 4 Antworten sein)",
  "explanation": "Kurze Erklärung zur richtigen Antwort"
}`
              },
              {
                role: 'user',
                content: `Erstelle ein Quiz zum Thema: ${query}`
              }
            ],
            temperature: 0.8,
            max_tokens: 600
          })
        });

        if (!response.ok) {
          console.error(`${aiModel.name} API error:`, response.status, await response.text());
          throw new Error(`${aiModel.name} API error: ${response.status}`);
        }

        const data = await response.json();
        const quizContent = data.choices?.[0]?.message?.content?.trim() || '';
        
        console.log(`Raw AI response from ${aiModel.name}:`, quizContent);

        if (!quizContent) {
          throw new Error(`No content from ${aiModel.name}`);
        }

        // Try to extract JSON from the response
        let parsedQuiz;
        try {
          // Look for JSON in the response
          const jsonMatch = quizContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedQuiz = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.error(`JSON parsing failed for ${aiModel.name}:`, parseError);
          
          // Fallback: try to parse line by line
          const lines = quizContent.split('\n').map((line: string) => line.trim()).filter(Boolean);
          
          let question = '';
          let answers = [];
          let correctAnswer = '';
          let explanation = '';
          
          for (const line of lines) {
            if (line.includes('?') && !question) {
              question = line.replace(/["':]/g, '').trim();
            } else if (line.match(/^[A-D]\)|^\d+\.|^-/) && answers.length < 4) {
              const answer = line.replace(/^[A-D]\)|^\d+\.|^-\s*/, '').replace(/["',]/g, '').trim();
              if (answer) answers.push(answer);
            }
          }
          
          if (question && answers.length === 4) {
            correctAnswer = answers[0]; // Assume first answer is correct as fallback
            explanation = `Die richtige Antwort ist "${correctAnswer}".`;
            
            parsedQuiz = {
              question,
              answers,
              correctAnswer,
              explanation
            };
          } else {
            throw new Error(`Could not parse quiz from ${aiModel.name} response`);
          }
        }

        // Validate quiz structure
        if (!parsedQuiz.question || !Array.isArray(parsedQuiz.answers) || parsedQuiz.answers.length !== 4) {
          throw new Error(`Invalid quiz structure from ${aiModel.name}`);
        }
        
        if (!parsedQuiz.answers.includes(parsedQuiz.correctAnswer)) {
          console.warn(`Correct answer not found in answers array for ${aiModel.name}, fixing...`);
          parsedQuiz.correctAnswer = parsedQuiz.answers[0];
        }

        // Ensure all fields are strings and clean
        parsedQuiz.question = String(parsedQuiz.question).trim();
        parsedQuiz.answers = parsedQuiz.answers.map((answer: any) => String(answer).trim());
        parsedQuiz.correctAnswer = String(parsedQuiz.correctAnswer).trim();
        parsedQuiz.explanation = String(parsedQuiz.explanation || `Die richtige Antwort ist "${parsedQuiz.correctAnswer}".`).trim();

        quiz = parsedQuiz;
        successfulModel = aiModel.name;
        console.log(`✅ Successfully generated quiz using ${aiModel.name}:`, quiz);
        break;

      } catch (modelError) {
        console.error(`❌ ${aiModel.name} failed:`, modelError);
      }
    }

    // If all AI models failed, create a fallback quiz
    if (!quiz) {
      console.log('All AI models failed, creating fallback quiz');
      
      const fallbackQuizzes = {
        'Katzen': {
          question: 'Wie viele Stunden schlafen Katzen durchschnittlich pro Tag?',
          answers: ['12-16 Stunden', '8-10 Stunden', '18-20 Stunden', '6-8 Stunden'],
          correctAnswer: '12-16 Stunden',
          explanation: 'Katzen schlafen durchschnittlich 12-16 Stunden pro Tag, da sie Raubtiere sind und Energie für die Jagd sparen müssen.'
        },
        'Hunde': {
          question: 'Welche Hunderasse gilt als die intelligenteste?',
          answers: ['Border Collie', 'Golden Retriever', 'Deutscher Schäferhund', 'Labrador'],
          correctAnswer: 'Border Collie',
          explanation: 'Border Collies gelten als die intelligenteste Hunderasse und sind besonders gut im Befolgen von Kommandos und beim Problemlösen.'
        },
        'Geschichte': {
          question: 'In welchem Jahr fiel die Berliner Mauer?',
          answers: ['1989', '1987', '1991', '1985'],
          correctAnswer: '1989',
          explanation: 'Die Berliner Mauer fiel am 9. November 1989, was ein wichtiger Moment in der deutschen Geschichte war.'
        },
        'Wissenschaft': {
          question: 'Welches ist das häufigste Element im Universum?',
          answers: ['Wasserstoff', 'Sauerstoff', 'Kohlenstoff', 'Helium'],
          correctAnswer: 'Wasserstoff',
          explanation: 'Wasserstoff ist das häufigste Element im Universum und macht etwa 75% der sichtbaren Materie aus.'
        },
        'Default': {
          question: `Was ist ein interessanter Fakt über ${query}?`,
          answers: [`${query} ist faszinierend`, `${query} ist wichtig`, `${query} ist komplex`, `${query} ist spannend`],
          correctAnswer: `${query} ist faszinierend`,
          explanation: `${query} ist ein vielschichtiges Thema mit vielen interessanten Aspekten.`
        }
      };
      
      const normalizedTopic = query.toLowerCase();
      let selectedQuiz = fallbackQuizzes['Default'];
      
      for (const topicKey of Object.keys(fallbackQuizzes)) {
        if (normalizedTopic.includes(topicKey.toLowerCase())) {
          selectedQuiz = fallbackQuizzes[topicKey as keyof typeof fallbackQuizzes];
          break;
        }
      }
      
      quiz = selectedQuiz;
      successfulModel = 'Fallback Quiz Database';
      console.log(`Generated fallback quiz for topic "${query}":`, quiz);
    }

    return new Response(
      JSON.stringify({ 
        quiz,
        model: successfulModel 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error generating German quiz:', error)
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Failed to generate quiz' 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})