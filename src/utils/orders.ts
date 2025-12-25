/**
 * Order management utilities
 */

import { RecentOrder } from "./mockData";

// Re-export RecentOrder for use in other modules
export type { RecentOrder } from "./mockData";

const ORDERS_STORAGE_KEY = "admin-orders";

/**
 * Get all orders from localStorage or return mock data
 */
export const getOrders = (): RecentOrder[] => {
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
export const getUserOrders = (userId: string): RecentOrder[] => {
  const allOrders = getOrders();
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
export const initializeOrders = (mockOrders: RecentOrder[]) => {
  const existing = getOrders();
  if (existing.length === 0) {
    saveOrders(mockOrders);
    return mockOrders;
  }
  return existing;
};

/**
 * Update order status
 */
export const updateOrderStatus = (orderId: string, newStatus: RecentOrder['status']): boolean => {
  const orders = getOrders();
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex > -1) {
    orders[orderIndex].status = newStatus;
    saveOrders(orders);
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent("order-status-updated", { detail: { orderId, newStatus } }));
    return true;
  }
  
  return false;
};

/**
 * Add a new order
 */
export const addOrder = (order: RecentOrder): void => {
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
  // Dispatch event for UI updates
  window.dispatchEvent(new CustomEvent("new-order-created", { detail: order }));
};

/**
 * Get order by ID
 */
export const getOrderById = (orderId: string): RecentOrder | undefined => {
  const orders = getOrders();
  return orders.find(order => order.id === orderId);
};

/**
 * Link orders to a user by email (for when user registers/logs in after placing order)
 */
export const linkOrdersToUser = (userId: string, email: string): number => {
  const orders = getOrders();
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





