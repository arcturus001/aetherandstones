/**
 * Vercel Serverless Function for managing email subscriptions
 * GET /api/subscriptions - Get all subscriptions or subscriptions for a specific email
 * POST /api/subscriptions - Add a new subscription
 * DELETE /api/subscriptions - Remove a subscription
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, initializeDatabase } from './utils/db';

interface Subscription {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  source?: string; // Where they subscribed from (e.g., 'footer', 'checkout', etc.)
}

// Initialize database on first import
let dbInitialized = false;
async function ensureDatabaseInitialized() {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      dbInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
}

async function getSubscriptions(email?: string): Promise<Subscription[]> {
  await ensureDatabaseInitialized();
  
  try {
    let result;
    if (email) {
      result = await query<{
        id: string;
        email: string;
        name: string | null;
        subscribed_at: Date;
        status: string;
        source: string | null;
      }>('SELECT * FROM subscriptions WHERE email = $1', [email.toLowerCase()]);
    } else {
      result = await query<{
        id: string;
        email: string;
        name: string | null;
        subscribed_at: Date;
        status: string;
        source: string | null;
      }>('SELECT * FROM subscriptions WHERE status = $1 ORDER BY subscribed_at DESC', ['active']);
    }

    return result.rows.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name || undefined,
      subscribedAt: row.subscribed_at.toISOString(),
      status: row.status as 'active' | 'unsubscribed',
      source: row.source || undefined,
    }));
  } catch (error) {
    console.error('Error fetching subscriptions from database:', error);
    return [];
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get subscriptions
      const { email } = req.query;
      const subscriptions = await getSubscriptions(email as string | undefined);
      return res.status(200).json({ subscriptions });
    }

    if (req.method === 'POST') {
      await ensureDatabaseInitialized();
      
      // Add new subscription
      const { email, name, source } = req.body as {
        email: string;
        name?: string;
        source?: string;
      };

      // Validate email
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const subscribedAt = new Date();

      try {
        // Use UPSERT to insert or update
        await query(
          `INSERT INTO subscriptions (id, email, name, subscribed_at, status, source)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (email) 
           DO UPDATE SET 
             status = 'active',
             subscribed_at = $4,
             name = COALESCE($3, subscriptions.name),
             source = COALESCE($6, subscriptions.source),
             updated_at = CURRENT_TIMESTAMP`,
          [subscriptionId, normalizedEmail, name || null, subscribedAt, 'active', source || null]
        );

        console.log('✅ Subscription added/updated:', normalizedEmail);
        return res.status(201).json({ 
          success: true, 
          message: 'Successfully subscribed' 
        });
      } catch (error) {
        console.error('Error creating/updating subscription:', error);
        return res.status(500).json({
          error: 'Failed to subscribe',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    if (req.method === 'DELETE') {
      await ensureDatabaseInitialized();
      
      // Unsubscribe
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email is required' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      try {
        const result = await query(
          `UPDATE subscriptions 
           SET status = 'unsubscribed', updated_at = CURRENT_TIMESTAMP 
           WHERE email = $1 
           RETURNING email`,
          [normalizedEmail]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Subscription not found' });
        }

        console.log('✅ Subscription removed:', normalizedEmail);
        return res.status(200).json({ 
          success: true, 
          message: 'Successfully unsubscribed' 
        });
      } catch (error) {
        console.error('Error unsubscribing:', error);
        return res.status(500).json({
          error: 'Failed to unsubscribe',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling subscriptions request:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

