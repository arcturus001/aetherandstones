/**
 * Security utilities for password hashing and token generation
 * Uses argon2 for password hashing (preferred over bcrypt)
 * Uses SHA-256 for token hashing (fast, one-way)
 */

import argon2 from 'argon2';
import crypto from 'crypto';

/**
 * Generate secure random token (32+ bytes)
 * Returns hex-encoded string (64 characters)
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash token for storage in database
 * Uses SHA-256 (fast, one-way hash suitable for tokens)
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Hash password using argon2 (preferred over bcrypt)
 * Argon2 is the winner of the Password Hashing Competition (PHC)
 * More resistant to GPU cracking attacks than bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // Argon2id variant (hybrid approach, recommended)
    // Memory: 64MB, Time: 3 iterations, Parallelism: 4 threads
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3, // 3 iterations
      parallelism: 4, // 4 threads
    });
    return hash;
  } catch (error) {
    console.error('Error hashing password with argon2:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify password against stored hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Rate limiting store (in-memory, simple implementation)
 * For production, consider using Redis or a proper rate limiting service
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check rate limit for an identifier (IP, email, etc.)
 * @param identifier - Unique identifier (IP address, email, etc.)
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes default
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    // No entry or expired, create new entry
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (entry.count >= maxAttempts) {
    // Rate limited
    return false;
  }

  // Increment count
  entry.count++;
  return true;
}

/**
 * Get remaining attempts for an identifier
 */
export function getRemainingAttempts(
  identifier: string,
  maxAttempts: number = 5
): number {
  const entry = rateLimitStore.get(identifier);
  if (!entry || entry.resetAt < Date.now()) {
    return maxAttempts;
  }
  return Math.max(0, maxAttempts - entry.count);
}

/**
 * Clear rate limit for an identifier (useful for testing or manual reset)
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

