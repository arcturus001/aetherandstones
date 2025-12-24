/**
 * Simple authentication utility
 * NOTE: Client-side authentication is not secure. For production,
 * this should be handled server-side with proper encryption and sessions.
 * 
 * This implementation uses SHA-256 hashing to avoid storing plain text passwords.
 * However, since this runs client-side, determined attackers can still reverse-engineer it.
 */

// Username stored separately (normalized)
const VALID_USERNAME = "Beglar Akunts";

// SHA-256 hash of password
// Generated using: crypto.createHash('sha256').update('password').digest('hex')
const PASSWORD_HASH = "fef8043d172f55f0aed6311854916ca7c9567586e6e8e9a0b9f51728a3ab88d8";

/**
 * Hash a string using SHA-256 (Web Crypto API)
 * Falls back to a simple hash if Web Crypto is not available
 */
async function hashPassword(password: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Error hashing password:', error);
    }
  }
  
  // Fallback: simple hash function
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16) + password.length.toString(16);
}

/**
 * Verify login credentials
 */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  // Normalize username (trim whitespace)
  const normalizedUsername = username.trim();
  
  // Check username
  if (normalizedUsername !== VALID_USERNAME) {
    return false;
  }
  
  // Hash the provided password and compare
  const providedPasswordHash = await hashPassword(password);
  
  // Compare with stored hash
  return providedPasswordHash === PASSWORD_HASH;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return localStorage.getItem("admin-authenticated") === "true";
}

/**
 * Set authentication state
 */
export function setAuthenticated(value: boolean): void {
  if (value) {
    localStorage.setItem("admin-authenticated", "true");
  } else {
    localStorage.removeItem("admin-authenticated");
  }
}

