import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    // EHLO
    await conn.write(encoder.encode(`EHLO ${smtpHost}\r\n`));
    const ehloResp = new Uint8Array(1024);
    await conn.read(ehloResp);

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
  try {
    const payload = await req.json();
    console.log('Received auth hook payload:', JSON.stringify(payload, null, 2));

    const { user, email_data } = payload;
    
    if (!user || !user.email) {
      throw new Error('User email is required');
    }

    const displayName = user.user_metadata?.display_name || 'Neuer Nutzer';
    const email = user.email;

    // Send welcome email
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
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Willkommen bei Daily Fun X Connect!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px;">
                <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                  Hallo ${displayName},
                </p>
                <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                  vielen Dank für Ihre Registrierung bei Daily Fun X Connect! Wir freuen uns, Sie in unserer Community begrüßen zu dürfen.
                </p>
                <table role="presentation" style="width: 100%; margin: 30px 0;">
                  <tr>
                    <td align="center">
                      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px;">
                        <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 10px;">
                          🎉 Ihr Konto ist aktiviert!
                        </p>
                        <p style="color: #ffffff; font-size: 14px; margin: 0;">
                          Sie können sich jetzt einloggen und alle Funktionen nutzen.
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
                <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                  <strong>Was Sie jetzt tun können:</strong>
                </p>
                <ul style="margin: 0 0 20px; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                  <li>Erstellen Sie Ihr Profil</li>
                  <li>Entdecken Sie interessante Artikel</li>
                  <li>Vernetzen Sie sich mit anderen Nutzern</li>
                  <li>Teilen Sie Ihre eigenen Inhalte</li>
                </ul>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
                  <p style="margin: 0 0 10px; color: #374151; font-size: 14px; font-weight: 600;">
                    💡 Tipp:
                  </p>
                  <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                    Vervollständigen Sie Ihr Profil, um das Beste aus Ihrer Daily Fun X Connect Erfahrung herauszuholen!
                  </p>
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

    await sendEmail(email, 'Willkommen bei Daily Fun X Connect!', htmlContent);
    console.log('✅ Welcome email sent successfully to:', email);

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in send-welcome-email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
