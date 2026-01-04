/**
 * Current user endpoint
 * GET /api/auth/me - Get current user from session
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, initializeDatabase } from '../db';
import { validateSession, deleteSession, SESSION_COOKIE_NAME } from '../utils/sessions';
import { serialize } from 'cookie';

const isProduction = process.env.NODE_ENV === 'production';
const APP_URL = process.env.APP_URL || process.env.VITE_APP_URL || 'http://localhost:3000';

/**
 * Get session token from cookie
 */
function getSessionToken(req: VercelRequest): string | null {
  const cookies = req.headers.cookie || '';
  const cookieMatch = cookies.match(new RegExp(`(^| )${SESSION_COOKIE_NAME}=([^;]+)`));
  return cookieMatch ? cookieMatch[2] : null;
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
    expires: new Date(0), // Expire immediately
  });
  res.setHeader('Set-Cookie', cookie);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', APP_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // Required for cookies

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await initializeDatabase();

  const sessionToken = getSessionToken(req);

  if (!sessionToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const session = await validateSession(sessionToken);

  if (!session) {
    // Clear invalid session cookie
    clearSessionCookie(res);
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  // Get user details
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
    // User was deleted, clear session
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

