/**
 * Order management utilities
 */

import { RecentOrder } from "./mockData";

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
};




