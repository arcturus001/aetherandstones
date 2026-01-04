/**
 * Login endpoint
 * POST /api/auth/login - Login with email/password, set session cookie
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, initializeDatabase } from '../db';
import { verifyPassword } from '../utils/security';
import { createSession, SESSION_COOKIE_NAME } from '../utils/sessions';
import { serialize } from 'cookie';
import { logger } from '../utils/logger';

const isProduction = process.env.NODE_ENV === 'production';
const APP_URL = process.env.APP_URL || process.env.VITE_APP_URL || 'http://localhost:3000';

/**
 * Set session cookie
 */
function setSessionCookie(res: VercelResponse, token: string, expiresAt: Date): void {
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // Only send over HTTPS in production
    sameSite: 'lax' as const, // CSRF protection
    path: '/',
    expires: expiresAt,
  };

  const cookie = serialize(SESSION_COOKIE_NAME, token, cookieOptions);
  res.setHeader('Set-Cookie', cookie);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', APP_URL);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // Required for cookies

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await initializeDatabase();

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
        const result = await query<{
          id: string;
          email: string;
          name: string;
          phone: string | null;
          password_hash: string | null;
        }>(
          `SELECT id, email, name, phone, password_hash FROM users WHERE email = $1`,
          [email.toLowerCase()]
        );

    if (result.rows.length === 0) {
      // Don't reveal if email exists (security best practice)
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Password not set. Please set your password first.' });
    }

        // Verify password using argon2
        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
          logger.warn('Failed login attempt', {
            email: email.toLowerCase().substring(0, 3) + '***',
          });
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create session
        const { token, expiresAt } = await createSession(user.id);

        // Set session cookie
        setSessionCookie(res, token, expiresAt);

        logger.auth('login', user.id, {
          email: user.email.substring(0, 3) + '***',
        });
        return res.status(200).json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
          },
        });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error logging in', error, {
      email: email.toLowerCase().substring(0, 3) + '***',
    });
    return res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred. Please try again later.',
    });
  }
}

