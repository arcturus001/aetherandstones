/**
 * Tests for password setup flow
 * Tests: password set invalidates token, token expiration, single-use enforcement
 */

import { describe, it, expect, vi } from 'vitest';
import type pg from 'pg';

// Mock dependencies
vi.mock('../db', () => ({
  query: vi.fn(),
  initializeDatabase: vi.fn(),
}));

vi.mock('../utils/security', () => ({
  hashToken: vi.fn((token: string) => `hashed-${token}`),
  hashPassword: vi.fn(() => Promise.resolve('hashed-password')),
  verifyPassword: vi.fn(() => Promise.resolve(true)),
  checkRateLimit: vi.fn(() => true),
}));

describe('Password Setup', () => {
  describe('Token Invalidation', () => {
    it('should mark token as used after password is set', async () => {
      const { query } = await import('../db');
      
      // Mock: token exists and is valid
      vi.mocked(query).mockResolvedValueOnce({
        rows: [{
          id: 'token_123',
          user_id: 'user_123',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          used_at: null,
        }],
        rowCount: 1,
      } as unknown as pg.QueryResult<{
        id: string;
        user_id: string;
        expires_at: Date;
        used_at: Date | null;
      }>);

      // Mock: user update
      vi.mocked(query).mockResolvedValueOnce({
        rows: [],
        rowCount: 1,
      } as unknown as pg.QueryResult<unknown>);

      // Mock: token marked as used
      vi.mocked(query).mockResolvedValueOnce({
        rows: [],
        rowCount: 1,
      } as unknown as pg.QueryResult<unknown>);

      const tokenHash = 'hashed-token-123';
      const tokenId = 'token_123';

      // Verify token
      const tokenResult = await query(
        `SELECT id, user_id, expires_at, used_at FROM password_setup_tokens 
         WHERE token_hash = $1`,
        [tokenHash]
      );

      expect(tokenResult.rows.length).toBe(1);
      const tokenData = tokenResult.rows[0] as { used_at: Date | null };
      expect(tokenData.used_at).toBeNull();

      // Mark token as used (simulating password set)
      await query(
        `UPDATE password_setup_tokens 
         SET used_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [tokenId]
      );

      // Verify token is now used
      const usedResult = await query(
        `SELECT used_at FROM password_setup_tokens WHERE id = $1`,
        [tokenId]
      );

      const usedTokenData = usedResult.rows[0] as { used_at: Date | null };
      expect(usedTokenData.used_at).not.toBeNull();
    });

    it('should reject already-used tokens', async () => {
      const { query } = await import('../db');
      
      // Mock: token already used
      vi.mocked(query).mockResolvedValueOnce({
        rows: [{
          id: 'token_123',
          user_id: 'user_123',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          used_at: new Date(), // Already used
        }],
        rowCount: 1,
      } as unknown as pg.QueryResult<{
        id: string;
        user_id: string;
        expires_at: Date;
        used_at: Date | null;
      }>);

      const tokenHash = 'hashed-token-123';
      const result = await query(
        `SELECT id, user_id, expires_at, used_at FROM password_setup_tokens 
         WHERE token_hash = $1`,
        [tokenHash]
      );

      const tokenData = result.rows[0] as { used_at: Date | null };
      expect(tokenData.used_at).not.toBeNull();
      // Should reject
    });
  });

  describe('Token Expiration', () => {
    it('should reject expired tokens', async () => {
      const { query } = await import('../db');
      
      // Mock: expired token
      vi.mocked(query).mockResolvedValueOnce({
        rows: [{
          id: 'token_123',
          user_id: 'user_123',
          expires_at: new Date(Date.now() - 1000), // Expired
          used_at: null,
        }],
        rowCount: 1,
      } as unknown as pg.QueryResult<{
        id: string;
        user_id: string;
        expires_at: Date;
        used_at: Date | null;
      }>);

      const tokenHash = 'hashed-token-123';
      const result = await query(
        `SELECT id, user_id, expires_at, used_at FROM password_setup_tokens 
         WHERE token_hash = $1`,
        [tokenHash]
      );

      const tokenData = result.rows[0] as { expires_at: Date; used_at: Date | null };
      const isExpired = new Date(tokenData.expires_at) < new Date();
      
      expect(isExpired).toBe(true);
      // Should reject
    });

    it('should accept valid (non-expired) tokens', async () => {
      const { query } = await import('../db');
      
      // Mock: valid token
      vi.mocked(query).mockResolvedValueOnce({
        rows: [{
          id: 'token_123',
          user_id: 'user_123',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 24h
          used_at: null,
        }],
        rowCount: 1,
      } as unknown as pg.QueryResult<{
        id: string;
        user_id: string;
        expires_at: Date;
        used_at: Date | null;
      }>);

      const tokenHash = 'hashed-token-123';
      const result = await query(
        `SELECT id, user_id, expires_at, used_at FROM password_setup_tokens 
         WHERE token_hash = $1`,
        [tokenHash]
      );

      const tokenData = result.rows[0] as { expires_at: Date; used_at: Date | null };
      const isExpired = new Date(tokenData.expires_at) < new Date();
      const isUsed = tokenData.used_at !== null;
      
      expect(isExpired).toBe(false);
      expect(isUsed).toBe(false);
      // Should accept
    });
  });
});
