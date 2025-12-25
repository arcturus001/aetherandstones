/**
 * User authentication utility for customers
 * NOTE: Client-side authentication is not secure. For production,
 * this should be handled server-side with proper encryption and sessions.
 */

import { linkOrdersToUser } from "./orders";

export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

const USERS_STORAGE_KEY = "customer-users";
const CURRENT_USER_KEY = "current-user";

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
 * Get all users from storage
 */
function getUsers(): Map<string, { user: User; passwordHash: string }> {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return new Map(data);
    }
  } catch (error) {
    console.error("Failed to load users", error);
  }
  return new Map();
}

/**
 * Save users to storage
 */
function saveUsers(users: Map<string, { user: User; passwordHash: string }>): void {
  const data = Array.from(users.entries());
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(data));
}

/**
 * Register a new user
 */
export async function registerUser(
  email: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; error?: string; user?: User }> {
  const emailLower = email.toLowerCase().trim();
  
  // Validate input
  if (!emailLower || !password || !fullName) {
    return { success: false, error: "All fields are required" };
  }
  
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }
  
  // Check if user already exists
  const users = getUsers();
  if (users.has(emailLower)) {
    return { success: false, error: "Email already registered" };
  }
  
  // Create new user
  const passwordHash = await hashPassword(password);
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: emailLower,
    fullName: fullName.trim(),
    createdAt: new Date().toISOString(),
  };
  
  users.set(emailLower, { user, passwordHash });
  saveUsers(users);
  
  // Auto-login after registration
  setCurrentUser(user);
  
  // Link any existing orders to this user
  const linkedCount = linkOrdersToUser(user.id, emailLower);
  if (linkedCount > 0) {
    console.log(`Linked ${linkedCount} existing order(s) to your account`);
  }
  
  return { success: true, user };
}

/**
 * Login user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: User }> {
  const emailLower = email.toLowerCase().trim();
  
  if (!emailLower || !password) {
    return { success: false, error: "Email and password are required" };
  }
  
  const users = getUsers();
  const userData = users.get(emailLower);
  
  if (!userData) {
    return { success: false, error: "Invalid email or password" };
  }
  
  const passwordHash = await hashPassword(password);
  if (passwordHash !== userData.passwordHash) {
    return { success: false, error: "Invalid email or password" };
  }
  
  setCurrentUser(userData.user);
  
  // Link any existing orders to this user
  const linkedCount = linkOrdersToUser(userData.user.id, emailLower);
  if (linkedCount > 0) {
    console.log(`Linked ${linkedCount} existing order(s) to your account`);
  }
  
  return { success: true, user: userData.user };
}

/**
 * Logout current user
 */
export function logoutUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
  window.dispatchEvent(new CustomEvent("user-auth-change"));
}

/**
 * Get current logged-in user
 */
export function getCurrentUser(): User | null {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      return JSON.parse(stored) as User;
    }
  } catch (error) {
    console.error("Failed to load current user", error);
  }
  return null;
}

/**
 * Set current user
 */
function setCurrentUser(user: User): void {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("user-auth-change"));
}

/**
 * Check if user is logged in
 */
export function isUserLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

