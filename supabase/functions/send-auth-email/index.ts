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

function getWelcomeEmailHTML(displayName: string): string {
  return `<!DOCTYPE html>
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
}

function getConfirmEmailHTML(confirmLink: string): string {
  return `<!DOCTYPE html>
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
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">E-Mail bestätigen</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px;">
                <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                  Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren.
                </p>
                <table role="presentation" style="width: 100%; margin: 30px 0;">
                  <tr>
                    <td align="center">
                      <a href="${confirmLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                        E-Mail bestätigen
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                  Falls der Button nicht funktioniert, kopieren Sie bitte diesen Link in Ihren Browser:
                </p>
                <p style="margin: 0; padding: 12px; background-color: #f9fafb; border-radius: 6px; font-size: 12px; word-break: break-all; color: #666666;">
                  ${confirmLink}
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                  Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                  © ${new Date().getFullYear()} Daily Fun X Connect. Alle Rechte vorbehalten.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function getPasswordResetHTML(resetLink: string): string {
  return `<!DOCTYPE html>
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
                  Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.
                </p>
                <table role="presentation" style="width: 100%; margin: 30px 0;">
                  <tr>
                    <td align="center">
                      <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                        Passwort zurücksetzen
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                  <strong>Wichtig:</strong> Dieser Link läuft in <strong>1 Stunde</strong> ab.
                </p>
                <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                  Falls der Button nicht funktioniert, kopieren Sie bitte diesen Link in Ihren Browser:
                </p>
                <p style="margin: 0; padding: 12px; background-color: #f9fafb; border-radius: 6px; font-size: 12px; word-break: break-all; color: #666666;">
                  ${resetLink}
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
                  <p style="margin: 0 0 10px; color: #374151; font-size: 14px; font-weight: 600;">
                    🔒 Sicherheitshinweise:
                  </p>
                  <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 13px; line-height: 1.6;">
                    <li>Teilen Sie diesen Link niemals mit anderen</li>
                    <li>Unser Team wird Sie niemals nach diesem Link fragen</li>
                    <li>Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail</li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                  © ${new Date().getFullYear()} Daily Fun X Connect. Alle Rechte vorbehalten.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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
    const emailActionType = email_data?.email_action_type;

    let subject = '';
    let htmlContent = '';

    // Determine email type and content
    if (emailActionType === 'signup') {
      // Confirmation email for new signups
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const confirmLink = `${supabaseUrl}/auth/v1/verify?token=${email_data.token_hash}&type=signup&redirect_to=${email_data.redirect_to || window.location.origin}`;
      
      subject = 'E-Mail bestätigen - Daily Fun X Connect';
      htmlContent = getConfirmEmailHTML(confirmLink);
    } else if (emailActionType === 'recovery' || emailActionType === 'magiclink') {
      // Password reset or magic link email
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const resetLink = `${supabaseUrl}/auth/v1/verify?token=${email_data.token_hash}&type=${emailActionType}&redirect_to=${email_data.redirect_to || window.location.origin}`;
      
      subject = 'Passwort zurücksetzen - Daily Fun X Connect';
      htmlContent = getPasswordResetHTML(resetLink);
    } else {
      // Default welcome email
      subject = 'Willkommen bei Daily Fun X Connect!';
      htmlContent = getWelcomeEmailHTML(displayName);
    }

    await sendEmail(email, subject, htmlContent);
    console.log(`✅ Email sent successfully to: ${email} (type: ${emailActionType || 'welcome'})`);

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in send-auth-email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
