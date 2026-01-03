/**
 * Vercel Serverless Function for sending emails via Resend
 * POST /api/send-email
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const RESEND_API_URL = 'https://api.resend.com/emails';
const ADMIN_EMAIL = 'Petrosyan12123@gmail.com';

interface EmailPayload {
  to: string[];
  subject: string;
  text: string;
  from?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, text, from } = req.body as EmailPayload;

    // Validate required fields
    if (!to || !Array.isArray(to) || to.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid "to" field' });
    }
    if (!subject) {
      return res.status(400).json({ error: 'Missing "subject" field' });
    }
    if (!text) {
      return res.status(400).json({ error: 'Missing "text" field' });
    }

    // Get Resend API key from environment variables only
    // NEVER hardcode API keys in the codebase
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set');
      return res.status(500).json({ 
        error: 'Email service configuration error. Please contact support.' 
      });
    }
    
    // Validate that the API key is not a placeholder or example value
    if (RESEND_API_KEY.includes('your_api_key') || RESEND_API_KEY.includes('example') || RESEND_API_KEY.length < 20) {
      console.error('Invalid RESEND_API_KEY format detected');
      return res.status(500).json({ 
        error: 'Email service configuration error. Please contact support.' 
      });
    }

    const emailPayload = {
      from: from || 'onboarding@resend.dev', // Default Resend sender
      to,
      subject,
      text,
    };

    console.log('Sending email via Resend API...');
    console.log('To:', to);
    console.log('Subject:', subject);

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      });
      return res.status(response.status).json({
        error: 'Failed to send email',
        details: responseData,
      });
    }

    console.log('✅ Email sent successfully! Email ID:', responseData.id);
    return res.status(200).json({
      success: true,
      id: responseData.id,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

