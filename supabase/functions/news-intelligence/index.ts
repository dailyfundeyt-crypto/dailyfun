import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, timeframe = 'today', query, articleContent, language = 'en' } = await req.json()

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    const guardianApiKey = Deno.env.get('GUARDIAN_API_KEY')
    const gnewsApiKey = Deno.env.get('GNEWS_API_KEY')

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    // Action 1: Aggregate news and summarize
    if (action === 'aggregate_news') {
      console.log(`🔍 Aggregating news for timeframe: ${timeframe}, language: ${language}`)
      
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
          const gnewsLang = language === 'de' ? 'de' : 'en';
          const gnewsCountry = gnewsLang === 'de' ? 'de' : 'us';
          const gnewsUrl = `https://gnews.io/api/v4/top-headlines?token=${gnewsApiKey}&lang=${gnewsLang}&country=${gnewsCountry}&max=10`;
          
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
        const noArticlesMessage = language === 'de' ? 'Keine aktuellen Artikel gefunden' : 'No recent articles found'
        throw new Error(noArticlesMessage)
      }

      // Prepare headlines for OpenRouter
      const headlines = allArticles.map(article => `${article.title} (${article.source})`).join('\n')
      
      const timeframeLabel = language === 'de'
        ? (timeframe === 'today' ? 'Heute' : timeframe === 'week' ? 'Diese Woche' : 'Diesen Monat')
        : (timeframe === 'today' ? 'Today' : timeframe === 'week' ? 'This week' : 'This month')
      const dateStr = now.toISOString().split('T')[0]
      const prompt = language === 'de'
        ? `Datum: ${dateStr}\n\nNutze ausschließlich die folgenden Schlagzeilen (und ggf. Kurztexte). Fasse die wichtigsten Informationen zusammen und gib nur die wichtigsten Themen aus. Nur Überschriften mit sehr kurzen Zusammenfassungen, keine zusätzliche Erzählung.\n\n${headlines}\n\nAntworte im Format:\n**${timeframeLabel}:**\n- [Hauptthema 1]: [kurz]\n- [Hauptthema 2]: [kurz]\n- [Hauptthema 3]: [kurz]`
        : `Date: ${dateStr}\n\nUse only the headlines below (and any provided short descriptions). Summarize the key developments and output only the most important topics. Headlines with very short summaries only; no extra commentary.\n\n${headlines}\n\nAnswer in the format:\n**${timeframeLabel}:**\n- [Key topic 1]: [short]\n- [Key topic 2]: [short]\n- [Key topic 3]: [short]`
      const systemMessage = language === 'de'
        ? 'Du bist ein Nachrichten-Analyst. Antworte ausschließlich auf Deutsch. Nutze nur die gegebenen Schlagzeilen und erfinde keine Informationen.'
        : 'You are a news analyst. Answer strictly in English. Use only the provided headlines and do not fabricate information.'

      const lovableResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000
        })
      })

      if (!lovableResponse.ok) {
        const errorText = await lovableResponse.text()
        console.error('Lovable AI Gateway error:', lovableResponse.status, errorText)
        throw new Error(`AI Gateway error: ${lovableResponse.status}`)
      }

      const lovableData = await lovableResponse.json()
      const summary = lovableData.choices?.[0]?.message?.content || (language === 'de' ? 'Fehler bei der Zusammenfassung' : 'Failed to generate summary')

      return new Response(
        JSON.stringify({ 
          summary,
          timeframe,
          articlesFound: allArticles.length,
          language
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
      const prompt = language === 'de'
        ? `Wandle diese Nutzerfrage in prägnante Suchbegriffe für eine News-API um. Gib nur die Suchbegriffe aus, ohne zusätzlichen Text.\n\nNutzerfrage: "${query}"\n\nAntworte nur mit den Suchbegriffen, z. B.: "Trump Putin Treffen", "Klimawandel Deutschland".`
        : `Convert this user question into concise search terms for a news API. Output only the search terms, with no extra text.\n\nUser question: "${query}"\n\nReturn only the search terms, e.g.: "Trump Putin meeting", "climate change Germany".`

      const systemMessage = language === 'de'
        ? 'Du wandelst Fragen in Suchbegriffe um. Antworte ausschließlich mit den Suchbegriffen.'
        : 'You convert questions into search terms. Respond only with the search terms.'

      const lovableResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
          ],
          max_tokens: 50
        })
      })

      if (!lovableResponse.ok) {
        const errorText = await lovableResponse.text()
        console.error('Lovable AI Gateway error:', lovableResponse.status, errorText)
        throw new Error(`AI Gateway error: ${lovableResponse.status}`)
      }

      const lovableData = await lovableResponse.json()
      const searchTerms = lovableData.choices?.[0]?.message?.content?.trim() || query

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
        throw new Error(language === 'de' ? 'Guardian API Key nicht verfügbar' : 'Guardian API key not available')
      }

      const guardianUrl = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&api-key=${guardianApiKey}&show-fields=body,trailText&page-size=1&order-by=relevance`
      
      const guardianResponse = await fetch(guardianUrl)
      if (!guardianResponse.ok) {
        throw new Error(language === 'de' ? 'Artikel nicht gefunden' : 'Article not found')
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

      const prompt = language === 'de'
        ? `Basierend auf diesem Artikel beantworte die folgende Frage auf Deutsch. Beziehe dich nur auf den Artikel und erfinde nichts.\n\nArtikel (gekürzt): ${articleContent.substring(0, 3000)}\n\nFrage: ${query}\n\nAntworte präzise, ohne unnötige Einleitung.`
        : `Based on this article, answer the following question in English. Use only the article content and do not invent facts.\n\nArticle (truncated): ${articleContent.substring(0, 3000)}\n\nQuestion: ${query}\n\nAnswer concisely with no unnecessary preamble.`

      const lovableResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: (language === 'de'
              ? 'Du beantwortest Fragen basierend auf gegebenen Artikelinhalten. Antworte ausschließlich auf Deutsch und beziehe dich nur auf die verfügbaren Informationen.'
              : 'You answer questions based on provided article content. Answer strictly in English and only use the available information.'
            ) },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000
        })
      })

      if (!lovableResponse.ok) {
        const errorText = await lovableResponse.text()
        console.error('Lovable AI Gateway error:', lovableResponse.status, errorText)
        throw new Error(`AI Gateway error: ${lovableResponse.status}`)
      }

      const lovableData = await lovableResponse.json()
      const answer = lovableData.choices?.[0]?.message?.content || 'Antwort konnte nicht generiert werden'

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

    throw new Error(language === 'de' ? 'Ungültige Aktion' : 'Invalid action')

  } catch (error) {
    console.error('Error in news-intelligence function:', error)
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Unknown error'
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