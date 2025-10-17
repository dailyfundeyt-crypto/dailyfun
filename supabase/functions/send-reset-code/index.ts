import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { corsHeaders } from "../_shared/cors.ts";

// Simple SMTP client function
async function sendEmail(to: string, subject: string, html: string) {
  const smtpHost = Deno.env.get('SMTP_HOST')!;
  const smtpPort = Number(Deno.env.get('SMTP_PORT')!);
  const username = Deno.env.get('SMTP_USERNAME')!;
  const password = Deno.env.get('SMTP_PASSWORD')!;
  const from = 'Daily Fun X Connect <no-reply@daily-fun.app>';

  try {
    const conn = await Deno.connectTls({
      hostname: smtpHost,
      port: smtpPort,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Read server greeting
    const greeting = new Uint8Array(1024);
    await conn.read(greeting);
    console.log('Server greeting:', decoder.decode(greeting));

    // EHLO
    await conn.write(encoder.encode(`EHLO ${smtpHost}\r\n`));
    const ehloResp = new Uint8Array(1024);
    await conn.read(ehloResp);
    console.log('EHLO response:', decoder.decode(ehloResp));

    // AUTH LOGIN
    await conn.write(encoder.encode('AUTH LOGIN\r\n'));
    const authResp = new Uint8Array(1024);
    await conn.read(authResp);

    // Send username
    await conn.write(encoder.encode(btoa(username) + '\r\n'));
    const userResp = new Uint8Array(1024);
    await conn.read(userResp);

    // Send password
    await conn.write(encoder.encode(btoa(password) + '\r\n'));
    const passResp = new Uint8Array(1024);
    await conn.read(passResp);
    console.log('AUTH response:', decoder.decode(passResp));

    // MAIL FROM
    await conn.write(encoder.encode(`MAIL FROM:<${username}>\r\n`));
    const mailResp = new Uint8Array(1024);
    await conn.read(mailResp);

    // RCPT TO
    await conn.write(encoder.encode(`RCPT TO:<${to}>\r\n`));
    const rcptResp = new Uint8Array(1024);
    await conn.read(rcptResp);

    // DATA
    await conn.write(encoder.encode('DATA\r\n'));
    const dataResp = new Uint8Array(1024);
    await conn.read(dataResp);

    // Email content
    const emailContent = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      html,
      '',
      '.',
    ].join('\r\n');

    await conn.write(encoder.encode(emailContent + '\r\n'));
    const contentResp = new Uint8Array(1024);
    await conn.read(contentResp);
    console.log('Content response:', decoder.decode(contentResp));

    // QUIT
    await conn.write(encoder.encode('QUIT\r\n'));
    
    conn.close();
    return true;
  } catch (error) {
    console.error('SMTP Error:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    if (!email) {
      throw new Error('Email is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user exists
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    const user = users?.find(u => u.email === email);

    if (!user) {
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save code to database
    const { error: insertError } = await supabase
      .from('password_reset_codes')
      .insert({
        user_id: user.id,
        email: email,
        code: code,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (insertError) {
      console.error('Error saving reset code:', insertError);
      throw new Error('Failed to generate reset code');
    }

    // Send email with code
    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 40px 0;">
          <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <tr>
              <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Passwort zurücksetzen</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px;">
                <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                  Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt. Verwenden Sie den folgenden Bestätigungscode:
                </p>
                <table role="presentation" style="width: 100%; margin: 30px 0;">
                  <tr>
                    <td align="center">
                      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; display: inline-block;">
                        <span style="color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                          ${code}
                        </span>
                      </div>
                    </td>
                  </tr>
                </table>
                <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                  <strong>Wichtig:</strong> Dieser Code läuft in <strong>5 Minuten</strong> ab.
                </p>
                <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                  Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren. Ihr Passwort bleibt unverändert.
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
                  <p style="margin: 0 0 10px; color: #374151; font-size: 14px; font-weight: 600;">
                    🔒 Sicherheitshinweise:
                  </p>
                  <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 13px; line-height: 1.6;">
                    <li>Teilen Sie diesen Code niemals mit anderen</li>
                    <li>Unser Team wird Sie niemals nach diesem Code fragen</li>
                    <li>Verwenden Sie ein starkes, einzigartiges Passwort</li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                  © ${new Date().getFullYear()} Daily Fun X Connect. Alle Rechte vorbehalten.
                </p>
                <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                  Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese Nachricht.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    try {
      await sendEmail(email, 'Passwort zurücksetzen - Ihr Bestätigungscode', htmlContent);
      console.log('✅ Reset code sent successfully to:', email);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      throw new Error('Failed to send email');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-reset-code:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
