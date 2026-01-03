/**
 * Subscription management utilities
 * Uses backend API for storing subscriptions
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface Subscription {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  source?: string;
}

/**
 * Subscribe an email to the newsletter
 */
export async function subscribeEmail(
  email: string,
  name?: string,
  source?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, source }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to subscribe',
      };
    }

    return {
      success: true,
      message: data.message || 'Successfully subscribed',
    };
  } catch (error) {
    console.error('Error subscribing email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Unsubscribe an email from the newsletter
 */
export async function unsubscribeEmail(
  email: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/subscriptions?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to unsubscribe',
      };
    }

    return {
      success: true,
      message: data.message || 'Successfully unsubscribed',
    };
  } catch (error) {
    console.error('Error unsubscribing email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get subscriptions for a specific email
 */
export async function getSubscriptions(
  email?: string
): Promise<{ subscriptions: Subscription[]; error?: string }> {
  try {
    const url = email
      ? `${API_BASE_URL}/subscriptions?email=${encodeURIComponent(email)}`
      : `${API_BASE_URL}/subscriptions`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        subscriptions: [],
        error: data.error || 'Failed to fetch subscriptions',
      };
    }

    return {
      subscriptions: data.subscriptions || [],
    };
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return {
      subscriptions: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if an email is subscribed
 */
export async function isSubscribed(email: string): Promise<boolean> {
  try {
    const { subscriptions } = await getSubscriptions(email);
    return subscriptions.some(
      sub => sub.email.toLowerCase() === email.toLowerCase() && sub.status === 'active'
    );
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

