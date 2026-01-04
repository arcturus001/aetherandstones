/**
 * Resend password setup email endpoint
 * POST /api/users/resend-password-setup - Generate new token and resend password setup email
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, initializeDatabase } from '../db';
import { generateToken, hashToken } from '../utils/security';
import { sendPasswordSetupEmail } from '../utils/email';
import { validateSession, SESSION_COOKIE_NAME } from '../utils/sessions';

const APP_URL = process.env.APP_URL || process.env.VITE_APP_URL || 'http://localhost:3000';

/**
 * Get session token from cookie
 */
function getSessionToken(req: VercelRequest): string | null {
  const cookies = req.headers.cookie || '';
  const cookieMatch = cookies.match(new RegExp(`(^| )${SESSION_COOKIE_NAME}=([^;]+)`));
  return cookieMatch ? cookieMatch[2] : null;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', APP_URL);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await initializeDatabase();

  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const session = await validateSession(sessionToken);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  try {
    // Get user details
    const userResult = await query<{
      id: string;
      email: string;
      name: string;
      password_hash: string | null;
    }>(
      `SELECT id, email, name, password_hash FROM users WHERE id = $1`,
      [session.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // If user already has password, no need to resend
    if (user.password_hash) {
      return res.status(400).json({ error: 'User already has a password' });
    }

    // Generate new token
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Invalidate old tokens for this user (optional - we can keep multiple valid tokens)
    // For now, we'll create a new token and keep old ones valid

    const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await query(
      `INSERT INTO password_setup_tokens (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [tokenId, user.id, tokenHash, expiresAt]
    );

    // Send password setup email
    const emailResult = await sendPasswordSetupEmail(user.email, user.name, token, tokenHash);

    if (emailResult.success && !emailResult.skipped) {
      console.log(`✅ Password setup email resent to ${user.email.substring(0, 3)}***`);
      return res.status(200).json({
        success: true,
        message: 'Password setup email sent',
        token, // Return token for frontend use
      });
    } else if (emailResult.skipped) {
      return res.status(200).json({
        success: true,
        message: 'Email was already sent recently',
        token, // Still return token
      });
    } else {
      return res.status(500).json({
        error: 'Failed to send email',
        message: emailResult.error || 'An error occurred',
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error resending password setup email:', errorMessage);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred. Please try again later.',
    });
  }
}

