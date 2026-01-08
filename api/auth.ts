/**
 * Consolidated Auth API endpoint
 * GET /api/auth - Get current user from session
 * POST /api/auth?action=login - Login with email/password, set session cookie
 * POST /api/auth?action=logout - Logout and clear session cookie
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, initializeDatabase } from './utils/db';
import { verifyPassword } from './utils/security';
import { createSession, validateSession, deleteSession, getSessionToken, SESSION_COOKIE_NAME } from './utils/sessions';
import { serialize } from 'cookie';
import { logger } from './utils/logger';

const isProduction = process.env.NODE_ENV === 'production';
const APP_URL = process.env.APP_URL || process.env.VITE_APP_URL || 'http://localhost:3000';

/**
 * Set session cookie
 */
function setSessionCookie(res: VercelResponse, token: string, expiresAt: Date): void {
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt,
  };

  const cookie = serialize(SESSION_COOKIE_NAME, token, cookieOptions);
  res.setHeader('Set-Cookie', cookie);
}

/**
 * Clear session cookie
 */
function clearSessionCookie(res: VercelResponse): void {
  const cookie = serialize(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
  res.setHeader('Set-Cookie', cookie);
}

/**
 * Handle login
 */
async function handleLogin(req: VercelRequest, res: VercelResponse) {
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
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Password not set. Please set your password first.' });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      logger.warn('Failed login attempt', {
        email: email.toLowerCase().substring(0, 3) + '***',
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { token, expiresAt } = await createSession(user.id);
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
    logger.error('Error logging in', error, {
      email: email.toLowerCase().substring(0, 3) + '***',
    });
    return res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred. Please try again later.',
    });
  }
}

/**
 * Handle logout
 */
async function handleLogout(req: VercelRequest, res: VercelResponse) {
  const sessionToken = getSessionToken(req);

  if (sessionToken) {
    await deleteSession(sessionToken);
  }

  clearSessionCookie(res);
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

/**
 * Handle get current user (me)
 */
async function handleMe(req: VercelRequest, res: VercelResponse) {
  const sessionToken = getSessionToken(req);

  if (!sessionToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const session = await validateSession(sessionToken);

  if (!session) {
    clearSessionCookie(res);
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const userResult = await query<{
    id: string;
    email: string;
    name: string;
    phone: string | null;
    created_at: Date;
  }>(
    `SELECT id, email, name, phone, created_at FROM users WHERE id = $1`,
    [session.userId]
  );

  if (userResult.rows.length === 0) {
    await deleteSession(sessionToken);
    clearSessionCookie(res);
    return res.status(401).json({ error: 'User not found' });
  }

  const user = userResult.rows[0];
  return res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      createdAt: user.created_at.toISOString(),
    },
  });
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', APP_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await initializeDatabase();

  const action = req.query.action as string | undefined;

  // GET /api/auth - Get current user
  if (req.method === 'GET') {
    return handleMe(req, res);
  }

  // POST /api/auth?action=login
  if (req.method === 'POST' && action === 'login') {
    return handleLogin(req, res);
  }

  // POST /api/auth?action=logout
  if (req.method === 'POST' && action === 'logout') {
    return handleLogout(req, res);
  }

  // POST /api/auth without action - default to login for backwards compatibility
  if (req.method === 'POST' && !action) {
    return handleLogin(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
