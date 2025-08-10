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

    // Use German Wikipedia to generate a multiple-choice quiz without API keys
    const lang = 'de'
    const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`

    const searchRes = await fetch(searchUrl)
    if (!searchRes.ok) {
      throw new Error(`Wikipedia search failed: ${searchRes.status}`)
    }
    const searchData = await searchRes.json()
    const first = searchData?.query?.search?.[0]

    if (!first) {
      throw new Error('Keine Wikipedia-Ergebnisse gefunden')
    }

    const title = first.title
    const summaryUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    const summaryRes = await fetch(summaryUrl)
    if (!summaryRes.ok) {
      throw new Error(`Wikipedia summary failed: ${summaryRes.status}`)
    }
    const sum = await summaryRes.json()

    const extract: string = sum?.extract || ''
    const description: string = sum?.description || ''

    const toSentences = (text: string) => text.split(/(?<=[.!?])\s+/).filter(Boolean)
    const summarize = (text: string, max = 2) => toSentences(text).slice(0, max).join(' ')

    // Build quiz
    const question = `Was beschreibt "${title}" am besten?`

    const wrongTypes = [
      'fiktive Figur',
      'Programmiersprache',
      'Gebirge',
      'Fluss',
      'Chemisches Element',
      'Sportverein',
      'Musikalbum',
      'Computerspiel'
    ]

    let correct = description || ''

    if (!correct) {
      // Try to extract a short description from the first sentence
      const firstSentence = toSentences(extract)[0] || ''
      const match = firstSentence.match(/ist\s+(ein|eine|ein)\s+([^.,;]+)/i)
      correct = match ? match[2].trim() : 'Begriff aus Wikipedia'
    }

    // Ensure distinct options
    const unique = new Set<string>()
    unique.add(correct)

    // pick 3 wrong options
    for (const w of wrongTypes) {
      if (unique.size >= 4) break
      if (!unique.has(w)) unique.add(w)
    }

    const answers = Array.from(unique).slice(0, 4)

    // Shuffle answers
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[answers[i], answers[j]] = [answers[j], answers[i]]
    }

    const quiz = {
      question,
      answers,
      correctAnswer: correct,
      explanation: summarize(extract || `Weitere Informationen auf Wikipedia zu "${title}".`)
    }

    // Validate
    if (!quiz.question || !Array.isArray(quiz.answers) || quiz.answers.length !== 4) {
      throw new Error('Ungültige Quiz-Struktur')
    }
    if (!quiz.answers.includes(quiz.correctAnswer)) {
      // In case shuffling removed correct text due to trimming, ensure presence by forcing first option
      quiz.answers[0] = quiz.correctAnswer
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
  }

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