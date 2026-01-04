/**
 * User profile API endpoint
 * GET /api/profile - Get user profile (scoped to session)
 * PUT /api/profile - Update user profile (name, phone)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, initializeDatabase } from './db';
import { validateSession, SESSION_COOKIE_NAME } from './utils/sessions';

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
 * Get authenticated user ID from session
 */
async function getAuthenticatedUserId(req: VercelRequest): Promise<string | null> {
  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    return null;
  }

  const session = await validateSession(sessionToken);
  return session?.userId || null;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', APP_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await initializeDatabase();

  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // GET /api/profile - Get user profile
    if (req.method === 'GET') {
      const result = await query<{
        id: string;
        email: string;
        name: string;
        phone: string | null;
        password_hash: string | null;
        created_at: Date;
      }>(
        `SELECT id, email, name, phone, password_hash, created_at FROM users WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result.rows[0];
      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          passwordHash: user.password_hash, // Include password hash status
          createdAt: user.created_at.toISOString(),
        },
      });
    }

    // PUT /api/profile - Update user profile
    if (req.method === 'PUT') {
      const { name, phone } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required' });
      }

      await query(
        `UPDATE users SET name = $1, phone = $2 WHERE id = $3`,
        [name.trim(), phone || null, userId]
      );

      // Return updated user
      const result = await query<{
        id: string;
        email: string;
        name: string;
        phone: string | null;
        created_at: Date;
      }>(
        `SELECT id, email, name, phone, created_at FROM users WHERE id = $1`,
        [userId]
      );

      const user = result.rows[0];
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          createdAt: user.created_at.toISOString(),
        },
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error handling profile request:', errorMessage);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred. Please try again later.',
    });
  }
}

