/**
 * Session management utilities
 * DB-backed sessions with secure cookie handling
 */

import { query } from '../db';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'aether_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

if (!process.env.SESSION_SECRET) {
  console.warn('⚠️ SESSION_SECRET not set. Using random secret (sessions will not persist across restarts).');
}

/**
 * Generate secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash session token for storage
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token + SESSION_SECRET).digest('hex');
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: string): Promise<{ sessionId: string; token: string; expiresAt: Date }> {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await query(
    `INSERT INTO sessions (id, user_id, session_token, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [sessionId, userId, tokenHash, expiresAt]
  );

  // Clean up expired sessions for this user (keep only 5 most recent)
  await query(
    `DELETE FROM sessions 
     WHERE user_id = $1 
       AND expires_at < CURRENT_TIMESTAMP 
       AND id NOT IN (
         SELECT id FROM sessions 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 5
       )`,
    [userId]
  );

  return { sessionId, token, expiresAt };
}

/**
 * Validate session token and return user ID
 */
export async function validateSession(sessionToken: string): Promise<{ userId: string; sessionId: string } | null> {
  const tokenHash = hashSessionToken(sessionToken);

  const result = await query<{
    id: string;
    user_id: string;
    expires_at: Date;
  }>(
    `SELECT id, user_id, expires_at FROM sessions 
     WHERE session_token = $1`,
    [tokenHash]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const session = result.rows[0];

  // Check if session expired
  if (new Date(session.expires_at) < new Date()) {
    // Delete expired session
    await query(`DELETE FROM sessions WHERE id = $1`, [session.id]);
    return null;
  }

  // Update last_used_at
  await query(
    `UPDATE sessions SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [session.id]
  );

  return {
    userId: session.user_id,
    sessionId: session.id,
  };
}

/**
 * Delete a session by token
 */
export async function deleteSession(sessionToken: string): Promise<boolean> {
  const tokenHash = hashSessionToken(sessionToken);
  
  const result = await query(
    `DELETE FROM sessions WHERE session_token = $1`,
    [tokenHash]
  );

  return (result.rowCount || 0) > 0;
}

/**
 * Delete all sessions for a user
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
}

/**
 * Clean up expired sessions (call periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await query(
    `DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP`
  );
  return result.rowCount || 0;
}

export { SESSION_COOKIE_NAME, SESSION_DURATION_MS };

