/**
 * Order management utilities
 * Uses backend API for storing orders, with localStorage fallback
 */

import { RecentOrder } from "./mockData";

// Re-export RecentOrder for use in other modules
export type { RecentOrder } from "./mockData";

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const ORDERS_STORAGE_KEY = "admin-orders";

/**
 * Get all orders from API, with localStorage fallback
 */
export const getOrders = async (): Promise<RecentOrder[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.orders || [];
    }
  } catch (error) {
    console.error("Failed to load orders from API, falling back to localStorage", error);
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as RecentOrder[];
    }
  } catch (error) {
    console.error("Failed to load orders from localStorage", error);
  }
  
  // Return empty array if no stored orders
  return [];
};

/**
 * Get orders for a specific user
 */
export const getUserOrders = async (userId: string): Promise<RecentOrder[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.orders || [];
    }
  } catch (error) {
    console.error("Failed to load user orders from API, falling back to localStorage", error);
  }

  // Fallback to localStorage
  const allOrders = await getOrders();
  return allOrders.filter(order => order.userId === userId);
};

/**
 * Save orders to localStorage
 */
export const saveOrders = (orders: RecentOrder[]) => {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
};

/**
 * Initialize orders with mock data if none exist
 */
export const initializeOrders = async (mockOrders: RecentOrder[]): Promise<RecentOrder[]> => {
  const existing = await getOrders();
  if (existing.length === 0) {
    saveOrders(mockOrders);
    return mockOrders;
  }
  return existing;
};

/**
 * Update order status in API, with localStorage fallback
 */
export const updateOrderStatus = async (orderId: string, newStatus: RecentOrder['status']): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        status: newStatus,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent("order-status-updated", { detail: { orderId, newStatus, order: data.order } }));
      return true;
    } else {
      const errorData = await response.json();
      console.error('Failed to update order status in API:', errorData);
    }
  } catch (error) {
    console.error('Failed to update order status in API, falling back to localStorage', error);
  }

  // Fallback to localStorage
  try {
    const orders = await getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex > -1) {
      orders[orderIndex].status = newStatus;
      saveOrders(orders);
      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent("order-status-updated", { detail: { orderId, newStatus } }));
      return true;
    }
  } catch (error) {
    console.error('Failed to update order status in localStorage', error);
  }
  
  return false;
};

/**
 * Add a new order to API, with localStorage fallback
 */
export const addOrder = async (order: RecentOrder): Promise<boolean> => {
  try {
    // Prepare order data for API (exclude id and date, API will generate them)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, date: _date, ...orderData } = order;

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      const data = await response.json();
      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent("new-order-created", { detail: data.order || order }));
      return true;
    } else {
      console.error("Failed to save order to API:", await response.text());
    }
  } catch (error) {
    console.error("Failed to save order to API, falling back to localStorage", error);
  }

  // Fallback to localStorage
  try {
    const orders = await getOrders();
    orders.push(order);
    saveOrders(orders);
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent("new-order-created", { detail: order }));
    return true;
  } catch (error) {
    console.error("Failed to save order to localStorage", error);
    return false;
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId: string): Promise<RecentOrder | undefined> => {
  const orders = await getOrders();
  return orders.find(order => order.id === orderId);
};

/**
 * Link orders to a user by email (for when user registers/logs in after placing order)
 */
export const linkOrdersToUser = async (userId: string, email: string): Promise<number> => {
  const orders = await getOrders();
  let linkedCount = 0;
  
  orders.forEach(order => {
    // Link orders that match email and don't have a userId yet
    if ((order.customerEmail?.toLowerCase() === email.toLowerCase() || 
         order.email?.toLowerCase() === email.toLowerCase()) && 
        !order.userId) {
      order.userId = userId;
      linkedCount++;
    }
  });
  
  if (linkedCount > 0) {
    saveOrders(orders);
  }
  
  return linkedCount;
};





