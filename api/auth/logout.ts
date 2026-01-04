/**
 * Logout endpoint
 * POST /api/auth/logout - Logout and clear session cookie
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeDatabase } from '../db';
import { deleteSession, SESSION_COOKIE_NAME } from '../utils/sessions';
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

  const sessionToken = getSessionToken(req);

  if (sessionToken) {
    await deleteSession(sessionToken);
  }

  // Clear session cookie
  clearSessionCookie(res);

  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

