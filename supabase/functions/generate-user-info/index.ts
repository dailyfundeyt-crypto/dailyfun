import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userName, userBio, userProfession, userLocation } = await req.json()

    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openrouterApiKey) {
      throw new Error('OpenRouter API key not found')
    }

    // Generate AI information about the user
    const prompt = `Generate interesting and engaging information about a user based on their profile:
    
Name: ${userName}
Bio: ${userBio || 'No bio provided'}
Profession: ${userProfession || 'Not specified'}
Location: ${userLocation || 'Not specified'}

Please generate:
1. A creative and engaging description about this person (2-3 sentences)
2. Possible interests based on their profession and location
3. Fun facts or insights about their background
4. Professional achievements they might have

Keep it positive, creative, and interesting. Make it sound like this person is accomplished and fascinating. Write in German.

Format the response as JSON with keys: description, interests, funFacts, achievements`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'Daily Fun User Info Generator'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    const aiContent = data.choices[0].message.content

    // Try to parse as JSON, if it fails, create a structured response
    let generatedInfo
    try {
      generatedInfo = JSON.parse(aiContent)
    } catch {
      // If JSON parsing fails, create a basic structure
      generatedInfo = {
        description: aiContent.split('\n')[0] || `${userName} ist eine faszinierende Persönlichkeit mit vielen interessanten Facetten.`,
        interests: [`Basierend auf ${userProfession || 'ihrer Tätigkeit'}`, 'Persönliche Entwicklung', 'Community Engagement'],
        funFacts: ['Hat wahrscheinlich interessante Geschichten zu erzählen', 'Bringt einzigartige Perspektiven mit'],
        achievements: ['Aktives Mitglied der Daily Fun Community', 'Teilt wertvolle Einblicke und Erfahrungen']
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: generatedInfo 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error generating user info:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: (error as Error).message,
      // Fallback data
      data: {
        description: 'Ein interessantes Mitglied unserer Community mit einzigartigen Erfahrungen und Perspektiven.',
        interests: ['Community Engagement', 'Persönliche Entwicklung', 'Kreativität'],
        funFacts: ['Ist Teil der Daily Fun Community', 'Bringt frische Ideen mit'],
        achievements: ['Aktiver Community-Teilnehmer', 'Teilt wertvolle Beiträge']
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})