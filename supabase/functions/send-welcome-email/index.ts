import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Lightweight handler for Supabase Auth hooks (signup / recovery / magiclink)
// Returns 200 immediately and sends email in background (Resend recommended)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function welcomeHtml(name: string) {
  return `<h1>Willkommen, ${name || "Nutzer"}!</h1><p>Ihr Konto wurde erstellt.</p>`;
}
function confirmHtml(link: string) {
  return `<h1>E-Mail bestätigen</h1><p><a href="${link}">Jetzt bestätigen</a></p>`;
}
function resetHtml(link: string) {
  return `<h1>Passwort zurücksetzen</h1><p><a href="${link}">Jetzt zurücksetzen</a></p>`;
}

async function sendWithResend({ to, subject, html }: { to: string; subject: string; html: string }) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set – skipping email send");
    return;
  }
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Daily Fun X Connect <no-reply@daily-fun.app>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!resp.ok) {
    console.error("Resend send failed", resp.status, await resp.text());
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = await req.json();
    const { user, email_data } = payload || {};
    const email: string | undefined = user?.email;
    const displayName: string = user?.user_metadata?.display_name || "Nutzer";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    if (!email) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let subject = "Willkommen bei Daily Fun X Connect!";
    let html = welcomeHtml(displayName);

    const action = email_data?.email_action_type as string | undefined;
    const token = email_data?.token_hash as string | undefined;
    const redirectTo = email_data?.redirect_to || Deno.env.get("SITE_URL") || "";
    const redirectPart = redirectTo ? `&redirect_to=${encodeURIComponent(redirectTo)}` : "";

    if (action === "signup" && token && supabaseUrl) {
      const link = `${supabaseUrl}/auth/v1/verify?token=${token}&type=signup${redirectPart}`;
      subject = "E-Mail bestätigen - Daily Fun X Connect";
      html = confirmHtml(link);
    } else if ((action === "recovery" || action === "magiclink") && token && supabaseUrl) {
      const link = `${supabaseUrl}/auth/v1/verify?token=${token}&type=${action}${redirectPart}`;
      subject = "Passwort zurücksetzen - Daily Fun X Connect";
      html = resetHtml(link);
    }

    // Fire-and-forget
    EdgeRuntime.waitUntil(sendWithResend({ to: email, subject, html }));

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-welcome-email error", e);
    // Still return 200 so the signup doesn't fail
    return new Response(JSON.stringify({ ok: true, note: "error logged" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});