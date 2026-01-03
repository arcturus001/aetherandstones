/**
 * Vercel Serverless Function for managing email subscriptions
 * GET /api/subscriptions - Get all subscriptions or subscriptions for a specific email
 * POST /api/subscriptions - Add a new subscription
 * DELETE /api/subscriptions - Remove a subscription
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface Subscription {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  source?: string; // Where they subscribed from (e.g., 'footer', 'checkout', etc.)
}

const DATA_DIR = '/tmp'; // Vercel serverless functions use /tmp for writable storage
const SUBSCRIPTIONS_FILE = join(DATA_DIR, 'subscriptions.json');

async function getSubscriptions(): Promise<Subscription[]> {
  try {
    const data = await readFile(SUBSCRIPTIONS_FILE, 'utf-8');
    return JSON.parse(data) as Subscription[];
  } catch (error) {
    // File doesn't exist or is empty, return empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Error reading subscriptions file:', error);
    return [];
  }
}

async function saveSubscriptions(subscriptions: Subscription[]): Promise<void> {
  try {
    await writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing subscriptions file:', error);
    throw error;
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
      const subscriptions = await getSubscriptions();

      if (email && typeof email === 'string') {
        // Filter subscriptions for specific email
        const emailSubscriptions = subscriptions.filter(
          sub => sub.email.toLowerCase() === email.toLowerCase()
        );
        return res.status(200).json({ subscriptions: emailSubscriptions });
      }

      // Return all active subscriptions by default
      const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
      return res.status(200).json({ subscriptions: activeSubscriptions });
    }

    if (req.method === 'POST') {
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

      const subscriptions = await getSubscriptions();
      const normalizedEmail = email.toLowerCase().trim();

      // Check if email already exists
      const existingIndex = subscriptions.findIndex(
        sub => sub.email.toLowerCase() === normalizedEmail
      );

      if (existingIndex >= 0) {
        // Update existing subscription to active
        subscriptions[existingIndex].status = 'active';
        subscriptions[existingIndex].subscribedAt = new Date().toISOString();
        if (name) subscriptions[existingIndex].name = name;
        if (source) subscriptions[existingIndex].source = source;
      } else {
        // Create new subscription
        const newSubscription: Subscription = {
          id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          email: normalizedEmail,
          name,
          subscribedAt: new Date().toISOString(),
          status: 'active',
          source,
        };
        subscriptions.push(newSubscription);
      }

      await saveSubscriptions(subscriptions);

      console.log('✅ Subscription added/updated:', normalizedEmail);
      return res.status(201).json({ 
        success: true, 
        message: 'Successfully subscribed' 
      });
    }

    if (req.method === 'DELETE') {
      // Unsubscribe
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email is required' });
      }

      const subscriptions = await getSubscriptions();
      const normalizedEmail = email.toLowerCase().trim();
      const subscriptionIndex = subscriptions.findIndex(
        sub => sub.email.toLowerCase() === normalizedEmail
      );

      if (subscriptionIndex >= 0) {
        subscriptions[subscriptionIndex].status = 'unsubscribed';
        await saveSubscriptions(subscriptions);
        console.log('✅ Subscription removed:', normalizedEmail);
        return res.status(200).json({ 
          success: true, 
          message: 'Successfully unsubscribed' 
        });
      }

      return res.status(404).json({ error: 'Subscription not found' });
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

