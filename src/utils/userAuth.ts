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

const CURRENT_USER_KEY = "current-user";

// Legacy localStorage functions removed - now using backend API

/**
 * Register a new user (uses backend API)
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
  
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
    
    // First create user (without password)
    const createResponse = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailLower,
        name: fullName.trim(),
      }),
    });

    const createData = await createResponse.json();
    
    if (!createResponse.ok && createResponse.status !== 409) {
      return { success: false, error: createData.error || "Failed to create account" };
    }
    
    // Set password
    const passwordResponse = await fetch(`${API_BASE_URL}/users?action=set-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: createData.token,
        email: emailLower,
        password: password,
      }),
    });

    const passwordData = await passwordResponse.json();
    
    if (!passwordResponse.ok) {
      return { success: false, error: passwordData.error || "Failed to set password" };
    }

    const user: User = {
      id: passwordData.user.id,
      email: passwordData.user.email,
      fullName: passwordData.user.name,
      createdAt: new Date().toISOString(),
    };
    
    // Auto-login after registration
    setCurrentUser(user);
    
    // Link any existing orders to this user
    const linkedCount = await linkOrdersToUser(user.id, emailLower);
    if (linkedCount > 0) {
      console.log(`Linked ${linkedCount} existing order(s) to your account`);
    }
    
    return { success: true, user };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "An error occurred. Please try again." };
  }
}

/**
 * Login user (uses backend API)
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: User }> {
  const emailLower = email.toLowerCase().trim();
  
  if (!emailLower || !password) {
    return { success: false, error: "Email and password are required" };
  }
  
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
    const response = await fetch(`${API_BASE_URL}/users?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailLower,
        password: password,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || "Login failed" };
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.name,
      createdAt: new Date().toISOString(),
    };
    
    setCurrentUser(user);
    
    // Link any existing orders to this user
    const linkedCount = await linkOrdersToUser(user.id, emailLower);
    if (linkedCount > 0) {
      console.log(`Linked ${linkedCount} existing order(s) to your account`);
    }
    
    return { success: true, user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An error occurred. Please try again." };
  }
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
export function setCurrentUser(user: User): void {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("user-auth-change"));
}

/**
 * Check if user is logged in
 */
export function isUserLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

