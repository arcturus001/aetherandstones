/**
 * Addresses API endpoint
 * GET /api/addresses - Get user addresses (scoped to session)
 * POST /api/addresses - Create new address
 * PUT /api/addresses/:id - Update address
 * DELETE /api/addresses/:id - Delete address
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, initializeDatabase } from './db';
import { validateSession, SESSION_COOKIE_NAME } from './utils/sessions';
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
    // GET /api/addresses - Get user addresses
    if (req.method === 'GET') {
      const result = await query<{
        id: string;
        user_id: string;
        type: string;
        line1: string;
        line2: string | null;
        city: string;
        region: string | null;
        postal_code: string;
        country: string;
        created_at: Date;
      }>(
        `SELECT id, user_id, type, line1, line2, city, region, postal_code, country, created_at
         FROM addresses
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );

      const addresses = result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        type: row.type as 'shipping' | 'billing',
        line1: row.line1,
        line2: row.line2,
        city: row.city,
        region: row.region,
        postalCode: row.postal_code,
        country: row.country,
        createdAt: row.created_at.toISOString(),
      }));

      return res.status(200).json({ addresses });
    }

    // POST /api/addresses - Create new address
    if (req.method === 'POST') {
      const { type, line1, line2, city, region, postalCode, country } = req.body;

      if (!type || !line1 || !city || !postalCode || !country) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (type !== 'shipping' && type !== 'billing') {
        return res.status(400).json({ error: 'Type must be shipping or billing' });
      }

      const addressId = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await query(
        `INSERT INTO addresses (id, user_id, type, line1, line2, city, region, postal_code, country)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [addressId, userId, type, line1, line2 || null, city, region || null, postalCode, country]
      );

      return res.status(201).json({
        success: true,
        address: {
          id: addressId,
          userId,
          type,
          line1,
          line2: line2 || null,
          city,
          region: region || null,
          postalCode,
          country,
        },
      });
    }

    // PUT /api/addresses/:id - Update address
    if (req.method === 'PUT') {
      const addressId = req.query.id as string;
      const { line1, line2, city, region, postalCode, country } = req.body;

      if (!addressId) {
        return res.status(400).json({ error: 'Address ID required' });
      }

      // Verify address belongs to user
      const verifyResult = await query<{ id: string }>(
        `SELECT id FROM addresses WHERE id = $1 AND user_id = $2`,
        [addressId, userId]
      );

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Address not found' });
      }

      if (!line1 || !city || !postalCode || !country) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await query(
        `UPDATE addresses
         SET line1 = $1, line2 = $2, city = $3, region = $4, postal_code = $5, country = $6
         WHERE id = $7 AND user_id = $8`,
        [line1, line2 || null, city, region || null, postalCode, country, addressId, userId]
      );

      return res.status(200).json({ success: true });
    }

    // DELETE /api/addresses/:id - Delete address
    if (req.method === 'DELETE') {
      const addressId = req.query.id as string;

      if (!addressId) {
        return res.status(400).json({ error: 'Address ID required' });
      }

      // Verify address belongs to user
      const verifyResult = await query<{ id: string }>(
        `SELECT id FROM addresses WHERE id = $1 AND user_id = $2`,
        [addressId, userId]
      );

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Address not found' });
      }

      await query(`DELETE FROM addresses WHERE id = $1 AND user_id = $2`, [addressId, userId]);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error handling addresses request:', errorMessage);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred. Please try again later.',
    });
  }
}

