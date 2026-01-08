/**
 * Resend password setup email endpoint
 * POST /api/resend-set-password - Resend password setup email for an order
 * Rate-limited: one per 60 seconds per order/user
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, initializeDatabase } from './db';
import { generateToken, hashToken } from './utils/security';
import { sendPasswordSetupEmail } from './utils/email';
import { logger } from './utils/logger';

const APP_URL = process.env.APP_URL || process.env.VITE_APP_URL || 'http://localhost:3000';

// Simple in-memory rate limiting (for serverless, consider Redis in production)
const rateLimitMap = new Map<string, number>();

/**
 * Check rate limit: one per 60 seconds per order/user
 */
function checkRateLimit(orderId: string, userId: string | null): boolean {
  const key = `resend:${orderId}:${userId || 'anonymous'}`;
  const lastSent = rateLimitMap.get(key);
  const now = Date.now();
  const cooldown = 60 * 1000; // 60 seconds

  if (lastSent && (now - lastSent) < cooldown) {
    return false; // Rate limited
  }

  rateLimitMap.set(key, now);
  
  // Cleanup old entries (keep map size manageable)
  if (rateLimitMap.size > 1000) {
    const cutoff = now - cooldown * 10; // Keep entries from last 10 minutes
    for (const [k, v] of rateLimitMap.entries()) {
      if (v < cutoff) {
        rateLimitMap.delete(k);
      }
    }
  }

  return true; // Allowed
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

  const { orderId, paymentIntentId } = req.body;

  if (!orderId && !paymentIntentId) {
    return res.status(400).json({ error: 'orderId or paymentIntentId required' });
  }

  try {
    // Find order
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

    // Check rate limit
    if (!checkRateLimit(order.id, order.user_id)) {
      logger.warn('Rate limit exceeded for resend password setup email', {
        orderId: order.id.substring(0, 10) + '...',
        userId: order.user_id ? order.user_id.substring(0, 10) + '...' : 'anonymous',
      });
      return res.status(429).json({ error: 'Please wait before requesting another email' });
    }

    // Check if user exists and has password
    if (!order.user_id) {
      return res.status(400).json({ error: 'No account found for this order' });
    }

    const userResult = await query<{
      id: string;
      email: string;
      name: string;
      password_hash: string | null;
    }>(
      `SELECT id, email, name, password_hash FROM users WHERE id = $1`,
      [order.user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // If user already has password, return success but don't send email
    if (user.password_hash) {
      return res.status(200).json({
        success: true,
        message: 'User already has password',
        alreadySecured: true,
      });
    }

    // Generate new password setup token
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await query(
      `INSERT INTO password_setup_tokens (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [tokenId, user.id, tokenHash, expiresAt]
    );

    // Send password setup email
    const emailResult = await sendPasswordSetupEmail(user.email, user.name, token, tokenHash);

    if (emailResult.success && !emailResult.skipped) {
      logger.info('Password setup email resent', {
        email: user.email.substring(0, 3) + '***',
        orderId: order.id.substring(0, 10) + '...',
      });
      return res.status(200).json({
        success: true,
        message: 'Password setup email sent',
      });
    } else if (emailResult.skipped) {
      return res.status(200).json({
        success: true,
        message: 'Email was already sent recently',
      });
    } else {
      return res.status(500).json({
        error: 'Failed to send email',
        message: emailResult.error || 'An error occurred',
      });
    }
  } catch (error: unknown) {
    logger.error('Error resending password setup email', error, {
      orderId: orderId?.substring(0, 10) + '...',
    });
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred. Please try again later.',
    });
  }
}


