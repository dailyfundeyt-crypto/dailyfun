import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, timeframe = 'today', query, articleContent } = await req.json()

    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    const guardianApiKey = Deno.env.get('GUARDIAN_API_KEY')
    const gnewsApiKey = Deno.env.get('GNEWS_API_KEY')

    if (!openrouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not configured')
    }

    // Action 1: Aggregate news and summarize
    if (action === 'aggregate_news') {
      console.log(`🔍 Aggregating news for timeframe: ${timeframe}`)
      
      const allArticles: any[] = []

      // Get date range based on timeframe
      const now = new Date()
      let fromDate = new Date()
      
      switch (timeframe) {
        case 'today':
          fromDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          fromDate.setDate(now.getDate() - 7)
          break
        case 'month':
          fromDate.setDate(now.getDate() - 30)
          break
      }

      // Try Guardian API
      if (guardianApiKey) {
        try {
          const guardianUrl = `https://content.guardianapis.com/search?api-key=${guardianApiKey}&from-date=${fromDate.toISOString().split('T')[0]}&to-date=${now.toISOString().split('T')[0]}&show-fields=thumbnail,trailText&page-size=10&order-by=relevance`
          
          const guardianResponse = await fetch(guardianUrl)
          if (guardianResponse.ok) {
            const guardianData = await guardianResponse.json()
            const results = guardianData.response?.results || []
            
            results.forEach((article: any) => {
              allArticles.push({
                title: article.webTitle,
                summary: article.fields?.trailText || article.webTitle,
                source: 'Guardian'
              })
            })
          }
        } catch (error) {
          console.error('Guardian API error:', error)
        }
      }

      // Try GNews API
      if (gnewsApiKey) {
        try {
          const gnewsUrl = `https://gnews.io/api/v4/top-headlines?token=${gnewsApiKey}&lang=de&country=de&max=10`
          
          const gnewsResponse = await fetch(gnewsUrl)
          if (gnewsResponse.ok) {
            const gnewsData = await gnewsResponse.json()
            const results = gnewsData.articles || []
            
            results.forEach((article: any) => {
              allArticles.push({
                title: article.title,
                summary: article.description || article.title,
                source: 'GNews'
              })
            })
          }
        } catch (error) {
          console.error('GNews API error:', error)
        }
      }

      if (allArticles.length === 0) {
        throw new Error('Keine aktuellen Artikel gefunden')
      }

      // Prepare headlines for OpenRouter
      const headlines = allArticles.map(article => `${article.title} (${article.source})`).join('\n')
      
      const prompt = `Fasse die wichtigsten Informationen aus diesen aktuellen Schlagzeilen zusammen und gebe nur die wichtigsten Themen des Tages/der Woche/des Monats aus. Gib nur Überschriften und kurze Zusammenfassungen aus:

${headlines}

Antworte im Format:
**Heute ist das passiert:**
- [Hauptthema 1]: [Kurze Zusammenfassung]
- [Hauptthema 2]: [Kurze Zusammenfassung]
- [Hauptthema 3]: [Kurze Zusammenfassung]`

      const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-405b-instruct',
          messages: [
            { role: 'system', content: 'Du bist ein Nachrichten-Analyst. Fasse nur die wichtigsten Informationen zusammen.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000
        })
      })

      const openrouterData = await openrouterResponse.json()
      const summary = openrouterData.choices?.[0]?.message?.content || 'Fehler bei der Zusammenfassung'

      return new Response(
        JSON.stringify({ 
          summary,
          timeframe,
          articlesFound: allArticles.length
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Action 2: Convert user query to search term
    if (action === 'query_to_search') {
      const prompt = `Wandle diese Nutzerfrage in eine präzise Suchbegriffe für eine News-API um. Gib nur die Suchbegriffe aus, ohne zusätzlichen Text:

Nutzerfrage: "${query}"

Antworte nur mit den Suchbegriffen, zum Beispiel: "Trump Putin Treffen" oder "Klimawandel Deutschland"`

      const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-405b-instruct',
          messages: [
            { role: 'system', content: 'Du wandelst Fragen in Suchbegriffe um. Antworte nur mit den Suchbegriffen.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 50
        })
      })

      const openrouterData = await openrouterResponse.json()
      const searchTerms = openrouterData.choices?.[0]?.message?.content?.trim() || query

      return new Response(
        JSON.stringify({ searchTerms }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Action 3: Get detailed article and answer questions
    if (action === 'detailed_search') {
      console.log(`🔍 Searching for: ${query}`)
      
      // Search Guardian for specific topic
      if (!guardianApiKey) {
        throw new Error('Guardian API Key nicht verfügbar')
      }

      const guardianUrl = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&api-key=${guardianApiKey}&show-fields=body,trailText&page-size=1&order-by=relevance`
      
      const guardianResponse = await fetch(guardianUrl)
      if (!guardianResponse.ok) {
        throw new Error('Artikel nicht gefunden')
      }

      const guardianData = await guardianResponse.json()
      const results = guardianData.response?.results || []
      
      if (results.length === 0) {
        throw new Error('Keine relevanten Artikel gefunden')
      }

      const article = results[0]
      const articleText = article.fields?.body || article.fields?.trailText || article.webTitle

      return new Response(
        JSON.stringify({ 
          articleContent: articleText,
          articleTitle: article.webTitle,
          articleUrl: article.webUrl
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Action 4: Answer questions based on article content
    if (action === 'answer_question') {
      if (!articleContent || !query) {
        throw new Error('Artikel-Inhalt und Frage erforderlich')
      }

      const prompt = `Basierend auf diesem Artikel, beantworte die folgende Frage:

Artikel: ${articleContent.substring(0, 3000)}

Frage: ${query}

Antworte präzise und beziehe dich nur auf die Informationen aus dem Artikel.`

      const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-405b-instruct',
          messages: [
            { role: 'system', content: 'Du beantwortest Fragen basierend auf gegebenen Artikelinhalten. Sei präzise und beziehe dich nur auf die verfügbaren Informationen.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000
        })
      })

      const openrouterData = await openrouterResponse.json()
      const answer = openrouterData.choices?.[0]?.message?.content || 'Antwort konnte nicht generiert werden'

      return new Response(
        JSON.stringify({ answer }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    throw new Error('Ungültige Aktion')

  } catch (error) {
    console.error('Error in news-intelligence function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unbekannter Fehler'
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