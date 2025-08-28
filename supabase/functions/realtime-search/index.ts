import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const guardianApiKey = Deno.env.get('GUARDIAN_API_KEY');
const newsApiKey = Deno.env.get('NEWSAPI_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, language = 'de' } = await req.json();
    console.log(`Searching for: ${query} in language: ${language}`);

    const results = [];

    // 1. Wikipedia Search
    try {
      const wikiLang = language === 'de' ? 'de' : 'en';
      const wikiResponse = await fetch(
        `https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
      );
      
      if (wikiResponse.ok) {
        const wikiData = await wikiResponse.json();
        if (wikiData.extract) {
          results.push({
            source: 'Wikipedia',
            title: wikiData.title,
            content: wikiData.extract,
            url: wikiData.content_urls?.desktop?.page,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Wikipedia search error:', error);
    }

    // 2. The Guardian API Search (English only)
    if (guardianApiKey) {
      try {
        const guardianResponse = await fetch(
          `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&show-fields=headline,trailText,webUrl&page-size=3&api-key=${guardianApiKey}`
        );
        
        if (guardianResponse.ok) {
          const guardianData = await guardianResponse.json();
          if (guardianData.response?.results) {
            guardianData.response.results.forEach((article: any) => {
              results.push({
                source: 'The Guardian',
                title: article.fields?.headline || article.webTitle,
                content: article.fields?.trailText || 'No excerpt available',
                url: article.webUrl,
                timestamp: article.webPublicationDate
              });
            });
          }
        }
      } catch (error) {
        console.error('Guardian search error:', error);
      }
    }

    // 3. NewsAPI Search
    if (newsApiKey) {
      try {
        const newsLang = language === 'de' ? 'de' : 'en';
        const newsResponse = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=${newsLang}&sortBy=publishedAt&pageSize=3&apiKey=${newsApiKey}`
        );
        
        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          if (newsData.articles) {
            newsData.articles.forEach((article: any) => {
              if (article.title && article.description) {
                results.push({
                  source: article.source?.name || 'News',
                  title: article.title,
                  content: article.description,
                  url: article.url,
                  timestamp: article.publishedAt
                });
              }
            });
          }
        }
      } catch (error) {
        console.error('NewsAPI search error:', error);
      }
    }

    // 4. Additional Wikipedia Search (broader search)
    try {
      const wikiLang = language === 'de' ? 'de' : 'en';
      const wikiSearchResponse = await fetch(
        `https://${wikiLang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=3&namespace=0&format=json&origin=*`
      );
      
      if (wikiSearchResponse.ok) {
        const [, titles, descriptions, urls] = await wikiSearchResponse.json();
        for (let i = 0; i < Math.min(titles.length, 2); i++) {
          if (titles[i] && descriptions[i]) {
            results.push({
              source: 'Wikipedia',
              title: titles[i],
              content: descriptions[i],
              url: urls[i],
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    } catch (error) {
      console.error('Wikipedia broader search error:', error);
    }

    // Sort by timestamp (most recent first)
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    console.log(`Found ${results.length} results for query: ${query}`);

    return new Response(JSON.stringify({ 
      success: true, 
      results: results.slice(0, 10), // Limit to 10 results
      query,
      language 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in realtime-search function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      results: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});