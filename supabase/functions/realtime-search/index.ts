import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const guardianApiKey = Deno.env.get('GUARDIAN_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, language = 'de' } = await req.json();
    
    console.log(`Realtime search request: ${query} (${language})`);

    const results: any = {
      wikipedia: [],
      guardian: [],
      news: [],
      summary: ''
    };

    // 1. Wikipedia API Search
    try {
      const wikiLang = language === 'de' ? 'de' : 'en';
      const wikiResponse = await fetch(
        `https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
      );
      
      if (wikiResponse.ok) {
        const wikiData = await wikiResponse.json();
        results.wikipedia.push({
          title: wikiData.title,
          extract: wikiData.extract,
          url: wikiData.content_urls?.desktop?.page,
          thumbnail: wikiData.thumbnail?.source
        });
      } else {
        // If direct page not found, try search
        const searchResponse = await fetch(
          `https://${wikiLang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=3&namespace=0&format=json`
        );
        
        if (searchResponse.ok) {
          const [, titles, descriptions, urls] = await searchResponse.json();
          for (let i = 0; i < Math.min(titles.length, 3); i++) {
            results.wikipedia.push({
              title: titles[i],
              extract: descriptions[i],
              url: urls[i]
            });
          }
        }
      }
    } catch (error) {
      console.error('Wikipedia API error:', error);
    }

    // 2. The Guardian API Search
    if (guardianApiKey) {
      try {
        const guardianResponse = await fetch(
          `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&api-key=${guardianApiKey}&show-fields=headline,byline,trailText&page-size=3&order-by=newest`
        );
        
        if (guardianResponse.ok) {
          const guardianData = await guardianResponse.json();
          if (guardianData.response?.results) {
            results.guardian = guardianData.response.results.map((article: any) => ({
              title: article.fields?.headline || article.webTitle,
              extract: article.fields?.trailText,
              url: article.webUrl,
              author: article.fields?.byline,
              publishedAt: article.webPublicationDate
            }));
          }
        }
      } catch (error) {
        console.error('Guardian API error:', error);
      }
    }

    // 3. NewsAPI for additional sources (using free tier)
    try {
      const newsResponse = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=${language}&sortBy=publishedAt&pageSize=3&apiKey=demo` // Using demo key for now
      );
      
      if (newsResponse.ok) {
        const newsData = await newsResponse.json();
        if (newsData.articles) {
          results.news = newsData.articles.slice(0, 3).map((article: any) => ({
            title: article.title,
            extract: article.description,
            url: article.url,
            author: article.author,
            publishedAt: article.publishedAt,
            source: article.source?.name
          }));
        }
      }
    } catch (error) {
      console.error('NewsAPI error:', error);
    }

    // 4. Create comprehensive summary
    const allSources = [
      ...results.wikipedia,
      ...results.guardian,
      ...results.news
    ];

    let summary = '';
    if (allSources.length > 0) {
      const wikiInfo = results.wikipedia.length > 0 ? 
        `**Wikipedia:** ${results.wikipedia[0].extract}\n\n` : '';
      
      const guardianInfo = results.guardian.length > 0 ? 
        `**Aktuelle Nachrichten (The Guardian):** ${results.guardian[0].extract}\n\n` : '';
      
      const additionalSources = allSources.slice(0, 5).map(source => 
        `- **${source.title}**: ${source.extract || 'Keine Beschreibung verfügbar'}`
      ).join('\n');

      summary = language === 'de' ? 
        `Basierend auf aktuellen Echtzeitdaten zu "${query}":\n\n${wikiInfo}${guardianInfo}**Weitere Quellen:**\n${additionalSources}` :
        `Based on current real-time data for "${query}":\n\n${wikiInfo}${guardianInfo}**Additional sources:**\n${additionalSources}`;
    } else {
      summary = language === 'de' ? 
        `Entschuldigung, ich konnte keine aktuellen Informationen zu "${query}" finden. Versuchen Sie es mit anderen Suchbegriffen.` :
        `Sorry, I couldn't find current information about "${query}". Try different search terms.`;
    }

    results.summary = summary;

    console.log(`Realtime search completed for: ${query}`);
    console.log(`Found ${allSources.length} sources total`);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in realtime-search function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      summary: 'Es ist ein Fehler beim Abrufen der Echtzeit-Informationen aufgetreten.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});