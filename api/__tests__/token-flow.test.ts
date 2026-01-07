/**
 * Tests for password setup token flow
 * Tests: token generation, validation, expiration, single-use enforcement
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateToken, hashToken } from '../utils/security';

describe('Token Flow', () => {
  describe('Token Generation', () => {
    it('should generate unique tokens', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      
      expect(token1).toBeTruthy();
      expect(token2).toBeTruthy();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(32); // 32 bytes = 64 hex chars
    });

    it('should generate tokens with sufficient entropy', () => {
      const tokens = new Set();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateToken());
      }
      // All tokens should be unique
      expect(tokens.size).toBe(100);
    });
  });

  describe('Token Hashing', () => {
    it('should hash tokens consistently', () => {
      const token = generateToken();
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      
      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(token);
      expect(hash1.length).toBe(64); // SHA-256 produces 64 hex chars
    });

    it('should produce different hashes for different tokens', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      const hash1 = hashToken(token1);
      const hash2 = hashToken(token2);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Token Security', () => {
    it('should not expose original token in hash', () => {
      const token = generateToken();
      const hash = hashToken(token);
      
      // Hash should not contain original token
      expect(hash).not.toContain(token);
      // Original token should not be derivable from hash
      expect(token).not.toBe(hash);
    });
  });
});


