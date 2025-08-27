import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface SearchResult {
  source: string;
  title: string;
  content: string;
  url?: string;
  publishedAt?: string;
  author?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, language = 'de', sources = ['wikipedia', 'guardian'] } = await req.json()

    if (!query) {
      throw new Error('Missing search query')
    }

    const results: SearchResult[] = []

    // Wikipedia Search
    if (sources.includes('wikipedia')) {
      try {
        const lang = language === 'de' ? 'de' : 'en'
        const wikiSearchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&srlimit=3`
        
        const wikiResponse = await fetch(wikiSearchUrl)
        if (wikiResponse.ok) {
          const wikiData = await wikiResponse.json()
          const wikiResults = wikiData?.query?.search || []

          for (const result of wikiResults.slice(0, 2)) {
            try {
              const summaryUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(result.title)}`
              const summaryResponse = await fetch(summaryUrl)
              
              if (summaryResponse.ok) {
                const summary = await summaryResponse.json()
                results.push({
                  source: 'Wikipedia',
                  title: result.title,
                  content: summary.extract || result.snippet,
                  url: summary.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(result.title)}`,
                  publishedAt: new Date().toISOString()
                })
              }
            } catch (e) {
              console.error('Wikipedia summary error:', e)
            }
          }
        }
      } catch (e) {
        console.error('Wikipedia search error:', e)
      }
    }

    // The Guardian Search (requires API key)
    if (sources.includes('guardian')) {
      try {
        const guardianApiKey = Deno.env.get('GUARDIAN_API_KEY')
        if (guardianApiKey) {
          const guardianUrl = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&api-key=${guardianApiKey}&show-fields=body,headline,byline,firstPublicationDate&page-size=3`
          
          const guardianResponse = await fetch(guardianUrl)
          if (guardianResponse.ok) {
            const guardianData = await guardianResponse.json()
            const articles = guardianData?.response?.results || []

            for (const article of articles.slice(0, 2)) {
              const content = article.fields?.body?.replace(/<[^>]*>/g, '').substring(0, 500) || ''
              results.push({
                source: 'The Guardian',
                title: article.fields?.headline || article.webTitle,
                content: content + '...',
                url: article.webUrl,
                publishedAt: article.fields?.firstPublicationDate || article.webPublicationDate,
                author: article.fields?.byline || 'The Guardian'
              })
            }
          }
        }
      } catch (e) {
        console.error('Guardian search error:', e)
      }
    }

    // News API Search (requires API key)
    if (sources.includes('newsapi')) {
      try {
        const newsApiKey = Deno.env.get('NEWSAPI_KEY')
        if (newsApiKey) {
          const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=${language}&sortBy=publishedAt&pageSize=3&apiKey=${newsApiKey}`
          
          const newsResponse = await fetch(newsUrl)
          if (newsResponse.ok) {
            const newsData = await newsResponse.json()
            const articles = newsData?.articles || []

            for (const article of articles.slice(0, 2)) {
              if (article.title && article.description) {
                results.push({
                  source: article.source?.name || 'News API',
                  title: article.title,
                  content: article.description + (article.content ? ' ' + article.content.split('[+')[0] : ''),
                  url: article.url,
                  publishedAt: article.publishedAt,
                  author: article.author
                })
              }
            }
          }
        }
      } catch (e) {
        console.error('NewsAPI search error:', e)
      }
    }

    // Hacker News Search
    if (sources.includes('hackernews')) {
      try {
        const hnSearchUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=3`
        
        const hnResponse = await fetch(hnSearchUrl)
        if (hnResponse.ok) {
          const hnData = await hnResponse.json()
          const stories = hnData?.hits || []

          for (const story of stories.slice(0, 2)) {
            if (story.title && story.url) {
              results.push({
                source: 'Hacker News',
                title: story.title,
                content: story.url,
                url: story.url,
                publishedAt: story.created_at,
                author: story.author
              })
            }
          }
        }
      } catch (e) {
        console.error('Hacker News search error:', e)
      }
    }

    // Reddit Search
    if (sources.includes('reddit')) {
      try {
        const redditUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=3`
        
        const redditResponse = await fetch(redditUrl, {
          headers: {
            'User-Agent': 'Daily-Fun-Bot/1.0'
          }
        })
        
        if (redditResponse.ok) {
          const redditData = await redditResponse.json()
          const posts = redditData?.data?.children || []

          for (const post of posts.slice(0, 2)) {
            const data = post.data
            if (data.title && data.selftext) {
              results.push({
                source: `Reddit - r/${data.subreddit}`,
                title: data.title,
                content: data.selftext.substring(0, 300) + '...',
                url: `https://reddit.com${data.permalink}`,
                publishedAt: new Date(data.created_utc * 1000).toISOString(),
                author: data.author
              })
            }
          }
        }
      } catch (e) {
        console.error('Reddit search error:', e)
      }
    }

    return new Response(
      JSON.stringify({ 
        results,
        query,
        timestamp: new Date().toISOString(),
        sources_searched: sources
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Realtime search error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to search realtime sources',
        results: []
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