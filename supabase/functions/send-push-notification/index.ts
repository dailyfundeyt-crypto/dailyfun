import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  recipient_id: string;
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { recipient_id, title, body, icon, url }: NotificationPayload = await req.json();

    console.log('Sending push notification to:', recipient_id);

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', recipient_id);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found for user');
      return new Response(
        JSON.stringify({ message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Get VAPID keys from environment
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      throw new Error('VAPID keys not configured');
    }

    // Send push notification to all subscriptions
    const promises = subscriptions.map(async (sub) => {
      try {
        const subscription = sub.subscription as {
          endpoint: string;
          keys: { p256dh: string; auth: string };
        };

        // Web Push notification payload
        const payload = JSON.stringify({
          title,
          body,
          icon: icon || '/lovable-uploads/daily-fun-logo.png',
          url: url || '/',
          timestamp: Date.now(),
        });

        // Use web-push-deno library
        const webpush = await import('https://deno.land/x/web_push@0.0.6/mod.ts');
        
        await webpush.sendNotification({
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth,
            },
          },
          payload,
          options: {
            vapidDetails: {
              subject: 'mailto:dailyfun@example.com',
              publicKey: vapidPublicKey,
              privateKey: vapidPrivateKey,
            },
            TTL: 60 * 60 * 24, // 24 hours
          },
        });

        console.log('Push notification sent successfully');
      } catch (error) {
        console.error('Error sending to subscription:', error);
        // If subscription is invalid, remove it
        if (error.message?.includes('410') || error.message?.includes('404')) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', recipient_id)
            .eq('subscription', sub.subscription);
        }
      }
    });

    await Promise.all(promises);

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
