/**
 * Email service utilities
 * Uses Resend API for sending transactional emails
 */

const RESEND_API_URL = 'https://api.resend.com/emails';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.APP_URL || process.env.VITE_APP_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

/**
 * Send email via Resend API
 */
async function sendEmailViaResend(
  to: string[],
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY environment variable is not set');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text fallback
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      });
      return { success: false, error: responseData.message || 'Failed to send email' };
    }

    console.log(`✅ Email sent successfully! Email ID: ${responseData.id}`);
    return { success: true, id: responseData.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate password setup email HTML template
 */
function generatePasswordSetupEmailHTML(name: string, setupUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Set Your Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #000; color: #fff; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Aether & Stones</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 32px; border-radius: 0 0 8px 8px;">
    <h2 style="color: #000; margin-top: 0; font-size: 20px; font-weight: bold;">Set Your Password</h2>
    
    <p style="color: #666; font-size: 16px; margin-bottom: 24px;">
      Hi ${name ? name.split(' ')[0] : 'there'},
    </p>
    
    <p style="color: #666; font-size: 16px; margin-bottom: 24px;">
      Welcome to Aether & Stones! Your account has been created. To access your account and track your orders, please set a password by clicking the button below.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${setupUrl}" 
         style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Set Your Password
      </a>
    </div>
    
    <p style="color: #999; font-size: 14px; margin-top: 32px; margin-bottom: 0;">
      Or copy and paste this link into your browser:<br>
      <a href="${setupUrl}" style="color: #666; word-break: break-all;">${setupUrl}</a>
    </p>
    
    <p style="color: #999; font-size: 12px; margin-top: 24px; margin-bottom: 0; border-top: 1px solid #e0e0e0; padding-top: 24px;">
      This link expires in 24 hours. If you didn't create an account with us, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate password setup email text version
 */
function generatePasswordSetupEmailText(name: string, setupUrl: string): string {
  return `
Set Your Password for Aether & Stones

Hi ${name ? name.split(' ')[0] : 'there'},

Welcome to Aether & Stones! Your account has been created. To access your account and track your orders, please set a password by visiting the link below:

${setupUrl}

This link expires in 24 hours. If you didn't create an account with us, you can safely ignore this email.

---
Aether & Stones
  `.trim();
}

/**
 * Send password setup email
 * Retry-safe: checks if token exists before sending to prevent duplicate emails
 * 
 * @param email - Recipient email address
 * @param name - Recipient name
 * @param token - Password setup token (plain, not hash)
 * @param tokenHash - Token hash to check if email was already sent
 * @returns Success status and email ID if sent
 */
export async function sendPasswordSetupEmail(
  email: string,
  name: string,
  token: string,
  tokenHash: string
): Promise<{ success: boolean; id?: string; error?: string; skipped?: boolean }> {
  // Check if token exists in database (retry-safe check)
  // If token doesn't exist, it means it was already used or expired, so don't send email
  const { query } = await import('../db');
  
  try {
    const tokenCheck = await query<{ id: string; used_at: Date | null }>(
      `SELECT id, used_at FROM password_setup_tokens WHERE token_hash = $1`,
      [tokenHash]
    );

    // If token doesn't exist or was already used, skip sending email
    if (tokenCheck.rows.length === 0) {
      logger.info('Token not found or already used, skipping email', {
        email: email.substring(0, 3) + '***',
      });
      return { success: true, skipped: true };
    }

    if (tokenCheck.rows[0].used_at) {
      logger.info('Token already used, skipping email', {
        email: email.substring(0, 3) + '***',
      });
      return { success: true, skipped: true };
    }

    // Token exists and is valid, send email
    const setupUrl = `${APP_URL}/set-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    const html = generatePasswordSetupEmailHTML(name, setupUrl);
    const text = generatePasswordSetupEmailText(name, setupUrl);

    const result = await sendEmailViaResend(
      [email],
      'Set your password for Aether & Stones',
      html,
      text
    );

    if (result.success) {
      logger.info('Password setup email sent', {
        email: email.substring(0, 3) + '***',
        emailId: result.id,
      });
    } else {
      logger.error('Failed to send password setup email', undefined, {
        email: email.substring(0, 3) + '***',
        error: result.error,
      });
    }

    return result;
  } catch (error) {
    console.error('Error checking token or sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

