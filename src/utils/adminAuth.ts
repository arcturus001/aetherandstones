/**
 * Admin authentication utility (separate from user auth)
 * Simple client-side auth for admin panel
 * NOTE: This is basic auth for admin panel only
 */

// Username stored separately (normalized)
const VALID_USERNAME = "Beglar Akunts";

// SHA-256 hash of password
const PASSWORD_HASH = "fef8043d172f55f0aed6311854916ca7c9567586e6e8e9a0b9f51728a3ab88d8";

/**
 * Hash a string using SHA-256 (Web Crypto API)
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
  const normalizedUsername = username.trim();
  
  if (normalizedUsername !== VALID_USERNAME) {
    return false;
  }
  
  const providedPasswordHash = await hashPassword(password);
  return providedPasswordHash === PASSWORD_HASH;
}

/**
 * Check if admin is authenticated
 */
export function isAuthenticated(): boolean {
  return localStorage.getItem("admin-authenticated") === "true";
}

/**
 * Set admin authentication state
 */
export function setAuthenticated(authenticated: boolean): void {
  if (authenticated) {
    localStorage.setItem("admin-authenticated", "true");
  } else {
    localStorage.removeItem("admin-authenticated");
  }
}

