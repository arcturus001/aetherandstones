/**
 * Authentication utilities for frontend
 * Handles login, logout, and session management via httpOnly cookies
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  createdAt: string;
}

/**
 * Login user with email and password
 * Sets httpOnly session cookie automatically
 */
export async function login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  const emailLower = email.toLowerCase().trim();

  if (!emailLower || !password) {
    return { success: false, error: 'Email and password required' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Required for cookies
      body: JSON.stringify({
        email: emailLower,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please check your connection and try again.' };
  }
}

/**
 * Logout user
 * Clears session cookie
 */
export async function logout(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Required for cookies
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Logout failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Get current authenticated user
 * Reads from session cookie
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include', // Required for cookies
    });

    if (response.status === 401) {
      return null; // Not authenticated
    }

    if (!response.ok) {
      console.error('Failed to get current user:', response.status);
      return null;
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}
