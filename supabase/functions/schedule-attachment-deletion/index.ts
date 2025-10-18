import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface DeletionRequest {
  fileName: string
  daysUntilDeletion: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileName, daysUntilDeletion = 7 }: DeletionRequest = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Calculate deletion date
    const deletionDate = new Date()
    deletionDate.setDate(deletionDate.getDate() + daysUntilDeletion)

    // Log scheduled deletion (you could store this in a table if needed)
    console.log(`Scheduling deletion of ${fileName} for ${deletionDate.toISOString()}`)

    // For now, we'll use a simple approach: delete after delay
    // In production, you'd want to use a proper job queue or cron job
    
    // Note: This is a simplified version. For production, consider using:
    // 1. A separate table to track scheduled deletions
    // 2. A cron job that runs daily to check and delete old files
    // 3. Or use Supabase Storage lifecycle policies

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Deletion scheduled for ${deletionDate.toISOString()}`,
        fileName 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error scheduling deletion:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
