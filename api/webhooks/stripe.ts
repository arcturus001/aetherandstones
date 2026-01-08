/**
 * Stripe webhook handler for payment events
 * Handles payment_intent.succeeded and checkout.session.completed events
 * 
 * On payment success:
 * 1. Read customer email + shipping address + name + phone from event
 * 2. Upsert User by email (create if missing)
 * 3. Insert/Upsert shipping Address (avoid duplicates: same line1+postalCode+country)
 * 4. Create Order linked to userId and store paymentIntentId
 * 5. Generate PasswordSetupToken ONLY if user.passwordHash is null
 * 
 * Implements idempotency: if same paymentIntentId was processed, do nothing
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { query, initializeDatabase } from '../utils/db';
import { generateToken, hashToken } from '../utils/security';
import { sendPasswordSetupEmail } from '../utils/email';
import { logger } from '../utils/logger';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) {
  logger.warn('STRIPE_SECRET_KEY not set. Stripe webhook will fail.');
}

if (!STRIPE_WEBHOOK_SECRET) {
  logger.warn('STRIPE_WEBHOOK_SECRET not set. Webhook signature verification will fail.');
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
}) : null;

interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Stripe.PaymentIntent | Stripe.Checkout.Session;
  };
}

/**
 * Extract customer information from Stripe event
 */
function extractCustomerInfo(event: StripeWebhookEvent): {
  email: string;
  name: string;
  phone: string | null;
  shippingAddress: {
    line1: string;
    line2: string | null;
    city: string;
    region: string | null;
    postalCode: string;
    country: string;
  } | null;
  paymentIntentId: string;
  amount: number;
  currency: string;
} | null {
  const { type, data } = event;
  const obj = data.object;

  // Handle payment_intent.succeeded
  if (type === 'payment_intent.succeeded' && 'id' in obj) {
    const paymentIntent = obj as Stripe.PaymentIntent;

    // Get customer details if available
    const customer = paymentIntent.customer;
    const customerEmail = customer && typeof customer !== 'string' && 'email' in customer
      ? (customer as Stripe.Customer).email
      : null;
    const email = paymentIntent.receipt_email || 
                  customerEmail ||
                  paymentIntent.metadata?.email ||
                  '';

    const name = paymentIntent.shipping?.name ||
                 paymentIntent.metadata?.name ||
                 '';

    const phone = paymentIntent.shipping?.phone ||
                  paymentIntent.metadata?.phone ||
                  null;

    const shipping = paymentIntent.shipping?.address;

    return {
      email: email || '',
      name: name || '',
      phone: phone || null,
      shippingAddress: shipping ? {
        line1: shipping.line1 || '',
        line2: shipping.line2 || null,
        city: shipping.city || '',
        region: shipping.state || null,
        postalCode: shipping.postal_code || '',
        country: shipping.country || '',
      } : null,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency.toUpperCase(),
    };
  }

  // Handle checkout.session.completed
  if (type === 'checkout.session.completed' && 'id' in obj) {
    const session = obj as Stripe.Checkout.Session;
    
    return {
      email: session.customer_details?.email || session.customer_email || '',
      name: session.customer_details?.name || '',
      phone: session.customer_details?.phone || null,
      shippingAddress: (session as unknown as { shipping_details?: { address?: Stripe.Address } }).shipping_details ? {
        line1: (session as unknown as { shipping_details?: { address?: Stripe.Address } }).shipping_details?.address?.line1 || '',
        line2: (session as unknown as { shipping_details?: { address?: Stripe.Address } }).shipping_details?.address?.line2 || null,
        city: (session as unknown as { shipping_details?: { address?: Stripe.Address } }).shipping_details?.address?.city || '',
        region: (session as unknown as { shipping_details?: { address?: Stripe.Address } }).shipping_details?.address?.state || null,
        postalCode: (session as unknown as { shipping_details?: { address?: Stripe.Address } }).shipping_details?.address?.postal_code || '',
        country: (session as unknown as { shipping_details?: { address?: Stripe.Address } }).shipping_details?.address?.country || '',
      } : null,
      paymentIntentId: typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : session.payment_intent?.id || '',
      amount: (session.amount_total || 0) / 100, // Convert from cents
      currency: (session.currency || 'usd').toUpperCase(),
    };
  }

  return null;
}

/**
 * Upsert user by email
 */
async function upsertUser(
  email: string,
  name: string,
  phone: string | null
): Promise<{ userId: string; passwordHash: string | null }> {
  const emailLower = email.toLowerCase().trim();
  
  // Check if user exists
  const existing = await query<{
    id: string;
    password_hash: string | null;
  }>(
    'SELECT id, password_hash FROM users WHERE email = $1',
    [emailLower]
  );

  if (existing.rows.length > 0) {
    const user = existing.rows[0];
    // Update name and phone if provided
    if (name || phone !== null) {
      await query(
        `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone) WHERE id = $3`,
        [name || null, phone, user.id]
      );
    }
    return { userId: user.id, passwordHash: user.password_hash };
  }

  // Create new user
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await query(
    `INSERT INTO users (id, email, name, phone)
     VALUES ($1, $2, $3, $4)`,
    [userId, emailLower, name.trim(), phone]
  );

  console.log(`✅ User upserted: ${emailLower} (${userId})`);
  return { userId, passwordHash: null };
}

/**
 * Upsert shipping address (avoid duplicates: same line1+postalCode+country)
 */
async function upsertShippingAddress(
  userId: string,
  address: {
    line1: string;
    line2: string | null;
    city: string;
    region: string | null;
    postalCode: string;
    country: string;
  }
): Promise<string> {
  // Check if address already exists
  const existing = await query<{ id: string }>(
    `SELECT id FROM addresses 
     WHERE user_id = $1 
       AND type = 'shipping'
       AND line1 = $2 
       AND postal_code = $3 
       AND country = $4`,
    [userId, address.line1, address.postalCode, address.country]
  );

  if (existing.rows.length > 0) {
    const addressId = existing.rows[0].id;
    // Update address details
    await query(
      `UPDATE addresses 
       SET line2 = $1, city = $2, region = $3
       WHERE id = $4`,
      [address.line2, address.city, address.region, addressId]
    );
    console.log(`✅ Shipping address updated: ${addressId}`);
    return addressId;
  }

  // Create new address
  const addressId = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await query(
    `INSERT INTO addresses (id, user_id, type, line1, line2, city, region, postal_code, country)
     VALUES ($1, $2, 'shipping', $3, $4, $5, $6, $7, $8)`,
    [
      addressId,
      userId,
      address.line1,
      address.line2,
      address.city,
      address.region,
      address.postalCode,
      address.country,
    ]
  );

  console.log(`✅ Shipping address created: ${addressId}`);
  return addressId;
}

/**
 * Generate password setup token if user doesn't have password
 * Also sends email with password setup link (retry-safe)
 */
async function generatePasswordTokenIfNeeded(
  userId: string,
  hasPassword: boolean,
  email: string,
  name: string
): Promise<string | null> {
  if (hasPassword) {
    return null; // User already has password, no token needed
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await query(
    `INSERT INTO password_setup_tokens (id, user_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [tokenId, userId, tokenHash, expiresAt]
  );

  // Send password setup email (retry-safe: checks if token exists before sending)
  await sendPasswordSetupEmail(email, name, token, tokenHash);

  // Log without sensitive data
  console.log(`✅ Password setup token generated for user: ${userId.substring(0, 10)}...`);
  return token; // Return plain token (not hash) for email sending
}

/**
 * Check if paymentIntentId was already processed (idempotency)
 */
async function isPaymentProcessed(paymentIntentId: string): Promise<boolean> {
  const result = await query<{ id: string }>(
    'SELECT id FROM orders WHERE payment_intent_id = $1',
    [paymentIntentId]
  );
  return result.rows.length > 0;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe) {
    logger.error('Stripe not configured. STRIPE_SECRET_KEY missing.');
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  await initializeDatabase();

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    logger.error('Missing Stripe signature or webhook secret', undefined, {
      hasSignature: !!sig,
      hasSecret: !!webhookSecret,
    });
    return res.status(400).json({ error: 'Missing Stripe signature or webhook secret' });
  }

  // Get raw body for signature verification
  // In Vercel serverless functions, req.body may be parsed JSON or raw string/buffer
  // We need to handle both cases for signature verification
  let rawBody: string | Buffer;
  
  if (typeof req.body === 'string') {
    rawBody = req.body;
  } else if (Buffer.isBuffer(req.body)) {
    rawBody = req.body;
  } else if (typeof req.body === 'object' && req.body !== null) {
    // Body was parsed as JSON - reconstruct it for signature verification
    // Note: This is not ideal but necessary for Vercel serverless functions
    // In production, configure Vercel to pass raw body or use a different approach
    rawBody = JSON.stringify(req.body);
    logger.warn('Body was parsed as JSON. Signature verification may fail. Consider configuring Vercel to pass raw body.', {
      bodyType: typeof req.body,
    });
  } else {
    logger.error('Invalid request body type', undefined, { bodyType: typeof req.body });
    return res.status(400).json({ error: 'Invalid request body' });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature (REQUIRED in production)
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      webhookSecret
    );
    logger.webhook(event.type, event.id, 'received', {
      verified: true,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Webhook signature verification failed', err, {
      eventType: typeof req.body === 'object' && req.body !== null && 'type' in req.body ? (req.body as { type: string }).type : 'unknown',
    });
    
    // In production, reject invalid signatures
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      return res.status(400).json({ error: `Webhook Error: ${errorMessage}` });
    }
    
    // In development, allow testing with parsed body (not recommended for production)
    if (typeof req.body === 'object' && req.body !== null && 'type' in req.body) {
      logger.warn('Signature verification failed, but using parsed event data for testing (development only)', {
        eventType: (req.body as { type: string }).type,
      });
      event = req.body as Stripe.Event;
    } else {
      return res.status(400).json({ error: `Webhook Error: ${errorMessage}` });
    }
  }

  // Handle payment success events
  const handledEvents = ['payment_intent.succeeded', 'checkout.session.completed'];
  
  if (!handledEvents.includes(event.type)) {
    logger.webhook(event.type, event.id, 'received', { handled: false });
    return res.status(200).json({ received: true, message: 'Event type not handled' });
  }

  logger.webhook(event.type, event.id, 'processing');

  try {
    // Extract customer information from event
    const customerInfo = extractCustomerInfo({
      id: event.id,
      type: event.type,
      data: event.data as { object: Stripe.PaymentIntent | Stripe.Checkout.Session },
    });

    if (!customerInfo) {
      logger.error('Could not extract customer info from event', undefined, {
        eventType: event.type,
        eventId: event.id,
      });
      return res.status(400).json({ error: 'Could not extract customer information' });
    }

    const { email, name, phone, shippingAddress, paymentIntentId, amount, currency } = customerInfo;

    // Validate required fields
    if (!email || !paymentIntentId) {
      logger.error('Missing required fields: email or paymentIntentId', undefined, {
        eventType: event.type,
        eventId: event.id,
        hasEmail: !!email,
        hasPaymentIntentId: !!paymentIntentId,
      });
      return res.status(400).json({ error: 'Missing required fields: email or paymentIntentId' });
    }

    // Idempotency check: if paymentIntentId was already processed, do nothing
    const alreadyProcessed = await isPaymentProcessed(paymentIntentId);
    if (alreadyProcessed) {
      logger.webhook(event.type, event.id, 'success', {
      idempotent: true,
      paymentIntentId: paymentIntentId.substring(0, 20) + '...',
    });
      return res.status(200).json({
        success: true,
        message: 'Payment already processed',
        paymentIntentId,
      });
    }

    console.log(`🔄 Processing payment: ${paymentIntentId} for ${email}`);

    // 1. Upsert User by email
    const { userId, passwordHash } = await upsertUser(email, name, phone);

    // 2. Insert/Upsert shipping Address if available
    if (shippingAddress) {
      await upsertShippingAddress(userId, shippingAddress);
    }

    // 3. Create Order linked to userId and store paymentIntentId
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await query(
      `INSERT INTO orders (id, user_id, email_snapshot, total, currency, status, payment_provider, payment_intent_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        orderId,
        userId,
        email.toLowerCase(),
        amount,
        currency,
        'paid', // Status: paid (can be updated later)
        'stripe',
        paymentIntentId,
      ]
    );

    console.log(`✅ Order created: ${orderId} for payment ${paymentIntentId}`);

    // 4. Generate PasswordSetupToken ONLY if user.passwordHash is null
    // Also sends email with password setup link (retry-safe)
    const passwordToken = await generatePasswordTokenIfNeeded(userId, passwordHash !== null, email, name);

    // Return success response with token (for email sending)
    return res.status(200).json({
      success: true,
      orderId,
      userId,
      email,
      passwordToken, // Return plain token (NOT hash) for email sending
      message: 'Payment processed successfully',
    });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

