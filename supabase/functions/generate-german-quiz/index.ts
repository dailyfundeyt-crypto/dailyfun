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

    // Use Llama 3.1 via OpenRouter API for better German quiz generation
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://dailyfun.app',
        'X-Title': 'Daily Fun - German Quiz Generation'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-405b-instruct:free',
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
    })

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status, await response.text())
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    const quizContent = data.choices?.[0]?.message?.content?.trim() || ''
    
    console.log('Raw AI response:', quizContent)

    if (!quizContent) {
      throw new Error('No content from AI')
    }

    // Try to extract JSON from the response
    let quiz
    try {
      // Look for JSON in the response
      const jsonMatch = quizContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        quiz = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError)
      
      // Fallback: try to parse line by line
      const lines = quizContent.split('\n').map(line => line.trim()).filter(Boolean)
      
      // Look for structured content
      let question = ''
      let answers = []
      let correctAnswer = ''
      let explanation = ''
      
      for (const line of lines) {
        if (line.includes('?') && !question) {
          question = line.replace(/["':]/g, '').trim()
        } else if (line.match(/^[A-D]\)|^\d+\.|^-/) && answers.length < 4) {
          const answer = line.replace(/^[A-D]\)|^\d+\.|^-\s*/, '').replace(/["',]/g, '').trim()
          if (answer) answers.push(answer)
        }
      }
      
      if (question && answers.length === 4) {
        correctAnswer = answers[0] // Assume first answer is correct as fallback
        explanation = `Die richtige Antwort ist "${correctAnswer}".`
        
        quiz = {
          question,
          answers,
          correctAnswer,
          explanation
        }
      } else {
        throw new Error('Could not parse quiz from AI response')
      }
    }

    // Validate quiz structure
    if (!quiz.question || !Array.isArray(quiz.answers) || quiz.answers.length !== 4) {
      throw new Error('Invalid quiz structure from AI')
    }
    
    if (!quiz.answers.includes(quiz.correctAnswer)) {
      console.warn('Correct answer not found in answers array, fixing...')
      quiz.correctAnswer = quiz.answers[0]
    }

    // Ensure all fields are strings and clean
    quiz.question = String(quiz.question).trim()
    quiz.answers = quiz.answers.map(answer => String(answer).trim())
    quiz.correctAnswer = String(quiz.correctAnswer).trim()
    quiz.explanation = String(quiz.explanation || `Die richtige Antwort ist "${quiz.correctAnswer}".`).trim()

    console.log('Generated quiz:', quiz)

    return new Response(
      JSON.stringify({ quiz }),
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
        error: error.message || 'Failed to generate quiz' 
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