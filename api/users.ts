/**
 * User management API endpoints
 * POST /api/users - Create user (auto-created from checkout)
 * GET /api/users/:email - Get user by email
 * POST /api/users/set-password - Set password with token
 * POST /api/users/login - Login with email/password
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, initializeDatabase } from './db';
import {
  generateToken,
  hashToken,
  hashPassword,
  verifyPassword,
  checkRateLimit,
  getRemainingAttempts,
} from './utils/security';
import { sendPasswordSetupEmail } from './utils/email';
import { logger } from './utils/logger';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  passwordHash?: string | null;
  createdAt: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await initializeDatabase();

  try {
    // POST /api/users - Create user (auto-created, no password)
    if (req.method === 'POST' && !req.query.action) {
      const { email, name, phone } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ error: 'Email and name required' });
      }

      const emailLower = email.toLowerCase().trim();
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      try {
        // Check if user exists
        const existing = await query<{ id: string; password_hash: string | null }>(
          'SELECT id, password_hash FROM users WHERE email = $1',
          [emailLower]
        );

        if (existing.rows.length > 0) {
          const user = existing.rows[0];
          // If user exists and has password, no token needed
          if (user.password_hash) {
            return res.status(200).json({ 
              success: true,
              user: { id: user.id, email: emailLower, name },
              token: null
            });
          }
          // If user exists but no password, create new token
          const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const tokenHash = hashToken(token);
          await query(
            `INSERT INTO password_setup_tokens (id, user_id, token_hash, expires_at)
             VALUES ($1, $2, $3, $4)`,
            [tokenId, user.id, tokenHash, expiresAt]
          );

          // Send password setup email (retry-safe)
          await sendPasswordSetupEmail(emailLower, name, token, tokenHash);

          return res.status(200).json({
            success: true,
            user: { id: user.id, email: emailLower, name },
            token // Return plain token for email, not hash
          });
        }

        // Create new user
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await query(
          `INSERT INTO users (id, email, name, phone)
           VALUES ($1, $2, $3, $4)`,
          [userId, emailLower, name.trim(), phone || null]
        );

        // Create password setup token (store hash, return plain token)
        const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const tokenHash = hashToken(token);
        await query(
          `INSERT INTO password_setup_tokens (id, user_id, token_hash, expires_at)
           VALUES ($1, $2, $3, $4)`,
          [tokenId, userId, tokenHash, expiresAt]
        );

        // Send password setup email (retry-safe)
        await sendPasswordSetupEmail(emailLower, name.trim(), token, tokenHash);

        // Log without sensitive data
        console.log(`✅ User created: ${emailLower.substring(0, 3)}*** (${userId.substring(0, 10)}...)`);
        return res.status(201).json({
          success: true,
          user: { id: userId, email: emailLower, name: name.trim() },
          token // Return plain token (NOT hash) for email sending
        });
      } catch (error: unknown) {
        // Log error without sensitive data
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : null;
        
        logger.error('Error creating user', error, {
          errorCode: errorCode as string | undefined,
          email: emailLower.substring(0, 3) + '***',
        });
        if (errorCode === '23505') { // Unique violation
          return res.status(409).json({ error: 'User already exists' });
        }
        return res.status(500).json({
          error: 'Failed to create user',
          message: 'An error occurred. Please try again later.',
        });
      }
    }

    // POST /api/users/set-password - Set password with token
    if (req.method === 'POST' && req.query.action === 'set-password') {
      const { token, email, password } = req.body;
      
      if (!token || !email || !password) {
        return res.status(400).json({ error: 'Token, email, and password required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      // Rate limiting: 5 attempts per 15 minutes per IP/email
      const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0] || 
                       req.headers['x-real-ip']?.toString() || 
                       'unknown';
      const rateLimitKey = `set-password:${email.toLowerCase()}:${clientIp}`;
      
        if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
          const remaining = getRemainingAttempts(rateLimitKey, 5);
          logger.warn('Rate limit exceeded for set-password', {
            email: email.substring(0, 3) + '***',
            clientIp: clientIp.substring(0, 10) + '...',
            remaining,
          });
          return res.status(429).json({
          error: 'Too many attempts. Please try again later.',
          retryAfter: 15 * 60, // seconds
        });
      }

      try {
        // Verify token (hash the provided token and compare)
        const tokenHash = hashToken(token);
        const tokenResult = await query<{
          id: string;
          user_id: string;
          expires_at: Date;
          used_at: Date | null;
        }>(
          `SELECT id, user_id, expires_at, used_at FROM password_setup_tokens 
           WHERE token_hash = $1`,
          [tokenHash]
        );

        if (tokenResult.rows.length === 0) {
          // Don't reveal if token is invalid vs expired (security best practice)
          return res.status(400).json({ error: 'Invalid or expired token' });
        }

        const tokenData = tokenResult.rows[0];
        
        // Check if token was already used (single-use enforcement)
        if (tokenData.used_at) {
          logger.warn('Attempted reuse of password setup token', {
            userId: tokenData.user_id.substring(0, 10) + '...',
            tokenId: tokenData.id.substring(0, 10) + '...',
          });
          return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Check if token expired (24 hours)
        if (new Date(tokenData.expires_at) < new Date()) {
          logger.warn('Expired password setup token attempted', {
            userId: tokenData.user_id.substring(0, 10) + '...',
            tokenId: tokenData.id.substring(0, 10) + '...',
          });
          return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Get user
        const userResult = await query<{
          id: string;
          email: string;
          name: string;
        }>(
          `SELECT id, email, name FROM users WHERE id = $1 AND email = $2`,
          [tokenData.user_id, email.toLowerCase()]
        );

        if (userResult.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];

        // Hash password using argon2
        const passwordHash = await hashPassword(password);

        // Update user with password, mark token as used (single-use enforcement)
        await query(
          `UPDATE users 
           SET password_hash = $1
           WHERE id = $2`,
          [passwordHash, user.id]
        );

        await query(
          `UPDATE password_setup_tokens 
           SET used_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [tokenData.id]
        );

        // Clear rate limit on success
        const rateLimitKey = `set-password:${email.toLowerCase()}:${clientIp}`;
        // Note: We don't export clearRateLimit, but rate limit will naturally expire
        
        // Log success without sensitive data
        logger.auth('password_set', user.id, {
          email: user.email.substring(0, 3) + '***',
        });
        return res.status(200).json({
          success: true,
          user: { id: user.id, email: user.email, name: user.name }
        });
      } catch (error: unknown) {
        // Log error without sensitive data
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Error setting password', error, {
          email: email.substring(0, 3) + '***',
        });
        return res.status(500).json({
          error: 'Failed to set password',
          message: 'An error occurred. Please try again later.',
        });
      }
    }

    // POST /api/users/login - Login
    if (req.method === 'POST' && req.query.action === 'login') {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      try {
        const result = await query<{
          id: string;
          email: string;
          name: string;
          password_hash: string | null;
        }>(
          `SELECT id, email, name, password_hash FROM users WHERE email = $1`,
          [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];
        if (!user.password_hash) {
          return res.status(401).json({ error: 'Password not set. Please set your password first.' });
        }

        // Verify password using argon2
        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
          // Log failed login attempt without sensitive data
          console.warn(`⚠️ Failed login attempt for email: ${email.toLowerCase().substring(0, 3)}***`);
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        return res.status(200).json({
          success: true,
          user: { id: user.id, email: user.email, name: user.name }
        });
      } catch (error: unknown) {
        // Log error without sensitive data
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Error logging in', error, {
          email: email.toLowerCase().substring(0, 3) + '***',
        });
        return res.status(500).json({
          error: 'Login failed',
          message: 'An error occurred. Please try again later.',
        });
      }
    }

    // GET /api/users/validate-token - Validate token and return masked email
    if (req.method === 'GET' && req.query.action === 'validate-token') {
      const token = req.query.token as string;
      
      if (!token) {
        return res.status(400).json({ error: 'Token required' });
      }

      try {
        const tokenHash = hashToken(token);
        const tokenResult = await query<{
          id: string;
          user_id: string;
          expires_at: Date;
          used_at: Date | null;
        }>(
          `SELECT id, user_id, expires_at, used_at FROM password_setup_tokens 
           WHERE token_hash = $1`,
          [tokenHash]
        );

        if (tokenResult.rows.length === 0) {
          return res.status(400).json({ error: 'Invalid or expired token' });
        }

        const tokenData = tokenResult.rows[0];
        
        // Check if token was already used
        if (tokenData.used_at) {
          return res.status(400).json({ error: 'Token already used' });
        }

        // Check if token expired
        if (new Date(tokenData.expires_at) < new Date()) {
          return res.status(400).json({ error: 'Token expired' });
        }

        // Get user email
        const userResult = await query<{
          email: string;
        }>(
          `SELECT email FROM users WHERE id = $1`,
          [tokenData.user_id]
        );

        if (userResult.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        const email = userResult.rows[0].email;
        
        // Mask email (e.g., b***@gmail.com)
        const maskEmail = (email: string): string => {
          const [localPart, domain] = email.split('@');
          if (localPart.length <= 1) {
            return `${localPart[0]}***@${domain}`;
          }
          return `${localPart[0]}***@${domain}`;
        };

        return res.status(200).json({
          valid: true,
          maskedEmail: maskEmail(email),
          email: email, // Return actual email for API call (used server-side)
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error validating token:', errorMessage);
        return res.status(500).json({
          error: 'Failed to validate token',
          message: 'An error occurred. Please try again later.',
        });
      }
    }

    // GET /api/users/:email - Get user by email
    if (req.method === 'GET' && req.query.email) {
      try {
        const result = await query<{
          id: string;
          email: string;
          name: string;
          created_at: Date;
        }>(
          `SELECT id, email, name, created_at FROM users WHERE email = $1`,
          [req.query.email.toLowerCase()]
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
            createdAt: user.created_at.toISOString()
          }
        });
      } catch (error: unknown) {
        // Log error without sensitive data
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Error fetching user', error, {
          email: req.query.email?.toString().substring(0, 3) + '***',
        });
        return res.status(500).json({
          error: 'Failed to fetch user',
          message: 'An error occurred. Please try again later.',
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: unknown) {
    // Log error without sensitive data
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error handling users request', error, {
      method: req.method,
      action: req.query.action?.toString(),
    });
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred. Please try again later.',
    });
  }
}

