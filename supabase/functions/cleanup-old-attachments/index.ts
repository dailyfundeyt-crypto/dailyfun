import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

/**
 * Cron job to clean up old attachments from storage
 * Run this daily via Supabase cron jobs
 * This deletes files older than 7 days from message-attachments bucket
 */
Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const DAYS_TO_KEEP = 7
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_KEEP)

    console.log(`Cleaning up attachments older than ${cutoffDate.toISOString()}`)

    // List all files in message-attachments bucket
    const { data: files, error: listError } = await supabase.storage
      .from('message-attachments')
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' }
      })

    if (listError) throw listError

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No files to clean up' }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Filter files older than cutoff date
    const filesToDelete = files.filter(file => {
      const fileDate = new Date(file.created_at)
      return fileDate < cutoffDate
    })

    console.log(`Found ${filesToDelete.length} files to delete`)

    if (filesToDelete.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No old files found' }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Delete old files
    const filePaths = filesToDelete.map(file => file.name)
    const { error: deleteError } = await supabase.storage
      .from('message-attachments')
      .remove(filePaths)

    if (deleteError) throw deleteError

    console.log(`Successfully deleted ${filePaths.length} old files`)

    return new Response(
      JSON.stringify({ 
        success: true,
        deleted: filePaths.length,
        files: filePaths
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error cleaning up attachments:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
