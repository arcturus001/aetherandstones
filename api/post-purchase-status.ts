/**
 * Post-purchase status endpoint
 * GET /api/post-purchase-status - Get account status after purchase
 * Returns: { hasAccount: boolean, needsPassword: boolean, emailMasked: string, setPasswordUrl?: string }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, initializeDatabase } from './utils/db';
import { validateSession, getSessionToken } from './utils/sessions';

const APP_URL = process.env.APP_URL || process.env.VITE_APP_URL || 'http://localhost:3000';

/**
 * Mask email address (e.g., b***@gmail.com)
 */
function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 1) {
    return `${localPart[0]}***@${domain}`;
  }
  return `${localPart[0]}***@${domain}`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', APP_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await initializeDatabase();

  const orderId = req.query.orderId as string;
  const paymentIntentId = req.query.paymentIntentId as string;

  if (!orderId && !paymentIntentId) {
    return res.status(400).json({ error: 'orderId or paymentIntentId required' });
  }

  try {
    // Find order by orderId or paymentIntentId
    let orderResult;
    if (orderId) {
      orderResult = await query<{
        id: string;
        user_id: string | null;
        email_snapshot: string;
        payment_intent_id: string | null;
      }>(
        `SELECT id, user_id, email_snapshot, payment_intent_id FROM orders WHERE id = $1`,
        [orderId]
      );
    } else {
      orderResult = await query<{
        id: string;
        user_id: string | null;
        email_snapshot: string;
        payment_intent_id: string | null;
      }>(
        `SELECT id, user_id, email_snapshot, payment_intent_id FROM orders WHERE payment_intent_id = $1`,
        [paymentIntentId]
      );
    }

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];
    const email = order.email_snapshot;
    const emailMasked = maskEmail(email);

    // Check if user exists
    if (!order.user_id) {
      // No account created yet
      return res.status(200).json({
        hasAccount: false,
        needsPassword: false,
        emailMasked,
      });
    }

    // Check if user has password
    const userResult = await query<{
      id: string;
      email: string;
      password_hash: string | null;
    }>(
      `SELECT id, email, password_hash FROM users WHERE id = $1`,
      [order.user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(200).json({
        hasAccount: false,
        needsPassword: false,
        emailMasked,
      });
    }

    const user = userResult.rows[0];
    const hasPassword = user.password_hash !== null && user.password_hash !== undefined;

    // If no password, check for valid password setup token
    let setPasswordUrl: string | undefined;
    if (!hasPassword) {
      const tokenResult = await query<{
        id: string;
        token_hash: string;
        expires_at: Date;
        used_at: Date | null;
      }>(
        `SELECT id, token_hash, expires_at, used_at 
         FROM password_setup_tokens 
         WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP AND used_at IS NULL
         ORDER BY created_at DESC
         LIMIT 1`,
        [order.user_id]
      );

      if (tokenResult.rows.length > 0) {
        // We can't return the actual token (it's hashed), but we can check session
        // If user is authenticated, we can generate a new token URL
        const sessionToken = getSessionToken(req);
        if (sessionToken) {
          const session = await validateSession(sessionToken);
          if (session && session.userId === order.user_id) {
            // User is authenticated, generate new token for them
            const { generateToken, hashToken } = await import('./utils/security');
            const token = generateToken();
            const tokenHash = hashToken(token);
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await query(
              `INSERT INTO password_setup_tokens (id, user_id, token_hash, expires_at)
               VALUES ($1, $2, $3, $4)`,
              [tokenId, order.user_id, tokenHash, expiresAt]
            );

            setPasswordUrl = `${APP_URL}/set-password?token=${token}`;
          }
        }
      }
    }

    return res.status(200).json({
      hasAccount: true,
      needsPassword: !hasPassword,
      emailMasked,
      setPasswordUrl,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching post-purchase status:', errorMessage);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred. Please try again later.',
    });
  }
}


