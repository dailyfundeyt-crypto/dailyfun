import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic } = await req.json()
    
    // Get Perplexity API key from environment
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')
    
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY not found in environment variables')
    }

    const prompt = `Erstelle ein deutsches Multiple-Choice-Quiz über ${topic}. 
    Antworte nur mit einem JSON-Objekt in folgendem Format:
    {
      "question": "Die Quizfrage auf Deutsch",
      "answers": ["Antwort A", "Antwort B", "Antwort C", "Antwort D"],
      "correctAnswer": "Die richtige Antwort",
      "explanation": "Kurze Erklärung warum diese Antwort richtig ist"
    }
    
    Stelle sicher, dass:
    - Die Frage interessant und nicht zu schwer ist
    - Alle 4 Antworten plausibel klingen
    - Die Erklärung informativ aber kurz ist
    - Alles auf Deutsch ist`

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Experte für deutsche Quizfragen. Antworte nur mit validen JSON-Objekten ohne zusätzlichen Text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 500,
        return_images: false,
        return_related_questions: false
      }),
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content received from Perplexity API')
    }

    // Try to parse JSON from the response
    let quiz
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content]
      const jsonText = jsonMatch[1] || content
      quiz = JSON.parse(jsonText.trim())
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError)
      throw new Error('Invalid JSON response from AI')
    }

    // Validate the quiz structure
    if (!quiz.question || !quiz.answers || !quiz.correctAnswer || !quiz.explanation) {
      throw new Error('Invalid quiz structure')
    }

    if (!Array.isArray(quiz.answers) || quiz.answers.length !== 4) {
      throw new Error('Quiz must have exactly 4 answers')
    }

    if (!quiz.answers.includes(quiz.correctAnswer)) {
      throw new Error('Correct answer must be one of the provided answers')
    }

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