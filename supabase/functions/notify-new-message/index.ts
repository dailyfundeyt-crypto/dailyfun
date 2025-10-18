import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { message, conversation_id } = await req.json();

    console.log('New message notification:', { message, conversation_id });

    // Get conversation details
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('user_one_id, user_two_id')
      .eq('id', conversation_id)
      .single();

    if (convError || !conversation) {
      console.error('Error fetching conversation:', convError);
      throw convError;
    }

    // Determine recipient (the user who did NOT send the message)
    const recipient_id = message.sender_id === conversation.user_one_id 
      ? conversation.user_two_id 
      : conversation.user_one_id;

    // Get sender profile for notification
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', message.sender_id)
      .single();

    const senderName = senderProfile?.display_name || 'Ein Nutzer';

    // Determine notification content based on message type
    let title = `Neue Nachricht von ${senderName}`;
    let body = message.content;
    let icon = '/lovable-uploads/daily-fun-logo.png';

    if (message.message_type === 'article' && message.article_data) {
      title = `${senderName} hat einen Artikel geteilt`;
      body = message.article_data.title;
      icon = message.article_data.image_url || icon;
    } else if (message.message_type === 'image') {
      body = 'Hat dir ein Bild gesendet';
    } else if (message.message_type === 'pdf') {
      body = 'Hat dir ein PDF-Dokument gesendet';
    }

    // Call send-push-notification function
    const { error: notifError } = await supabase.functions.invoke('send-push-notification', {
      body: {
        recipient_id,
        title,
        body,
        icon,
        url: '/messages',
      },
    });

    if (notifError) {
      console.error('Error sending push notification:', notifError);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in notify-new-message:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
