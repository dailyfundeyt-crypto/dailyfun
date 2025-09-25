import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic, language = 'en' } = await req.json()

    if (!topic) {
      throw new Error('Missing topic')
    }

    console.log('Fetching news for topic:', topic, 'in language:', language)

    // Try Guardian API first (free)
    try {
      const guardianApiKey = Deno.env.get('GUARDIAN_API_KEY');
      if (!guardianApiKey) {
        throw new Error('GUARDIAN_API_KEY not configured');
      }

      console.log('🗞️ Trying Guardian API for:', topic);
      const guardianUrl = `https://content.guardianapis.com/search?q=${encodeURIComponent(topic)}&api-key=${guardianApiKey}&show-fields=thumbnail,trailText&page-size=5&order-by=relevance`;
      
      const guardianResponse = await fetch(guardianUrl);
      if (guardianResponse.ok) {
        const guardianData = await guardianResponse.json();
        const results = guardianData.response?.results || [];
        
        if (results.length > 0) {
          console.log('✅ Guardian API successful, found', results.length, 'articles');
          
          const articles = results.map((article: any) => ({
            title: article.webTitle,
            url: article.webUrl,
            description: article.fields?.trailText || '',
            thumbnail: article.fields?.thumbnail || '',
            source: 'Guardian'
          }));
          
          return new Response(
            JSON.stringify({ 
              articles,
              source: 'Guardian'
            }),
            {
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }
      }
    } catch (guardianError) {
      console.error('❌ Guardian API failed:', guardianError);
    }

    // Fallback to GNews API
    try {
      const gnewsApiKey = Deno.env.get('GNEWS_API_KEY');
      if (!gnewsApiKey) {
        throw new Error('GNEWS_API_KEY not configured');
      }

      console.log('🗞️ Trying GNews API as fallback for:', topic);
      const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&token=${gnewsApiKey}&lang=${language === 'de' ? 'de' : 'en'}&country=${language === 'de' ? 'de' : 'us'}&max=5&sortby=relevance`;
      
      const gnewsResponse = await fetch(gnewsUrl);
      if (gnewsResponse.ok) {
        const gnewsData = await gnewsResponse.json();
        const results = gnewsData.articles || [];
        
        if (results.length > 0) {
          console.log('✅ GNews API successful, found', results.length, 'articles');
          
          const articles = results.map((article: any) => ({
            title: article.title,
            url: article.url,
            description: article.description || '',
            thumbnail: article.image || '',
            source: 'GNews'
          }));
          
          return new Response(
            JSON.stringify({ 
              articles,
              source: 'GNews'
            }),
            {
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }
      } else {
        throw new Error(`GNews API error: ${gnewsResponse.status}`);
      }
    } catch (gnewsError) {
      console.error('❌ GNews API also failed:', gnewsError);
    }

    // Both APIs failed
    throw new Error('All news APIs failed');

  } catch (error) {
    console.error('Error fetching news:', error)
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Failed to fetch news',
        articles: []
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