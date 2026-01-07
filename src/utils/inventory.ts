/**
 * Inventory management utilities
 * Uses backend API for storing inventory, with localStorage fallback
 */

import type { InventoryItem } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const INVENTORY_STORAGE_KEY = 'admin-inventory';

// Re-export InventoryItem type
export type { InventoryItem } from './mockData';

/**
 * Get all inventory items from API, with localStorage fallback
 */
export const getInventory = async (): Promise<InventoryItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.inventory || [];
    }
  } catch (error) {
    console.error('Failed to load inventory from API, falling back to localStorage', error);
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as InventoryItem[];
    }
  } catch (error) {
    console.error('Failed to load inventory from localStorage', error);
  }
  
  // Return empty array if no stored inventory
  return [];
};

/**
 * Get inventory item by product ID
 */
export const getInventoryItem = async (productId: string): Promise<InventoryItem | undefined> => {
  const inventory = await getInventory();
  return inventory.find(item => item.productId === productId);
};

/**
 * Save inventory to localStorage (fallback only)
 */
export const saveInventory = (inventory: InventoryItem[]): void => {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
  } catch (error) {
    console.error('Failed to save inventory to localStorage', error);
  }
};

/**
 * Add a new inventory item to API, with localStorage fallback
 */
export const addInventoryItem = async (item: Omit<InventoryItem, 'status'> & { status?: InventoryItem['status'] }): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });

    if (response.ok) {
      const data = await response.json();
      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('inventory-updated', { detail: data.item || item }));
      return true;
    } else {
      const errorData = await response.json();
      console.error('Failed to save inventory item to API:', errorData);
    }
  } catch (error) {
    console.error('Failed to save inventory item to API, falling back to localStorage', error);
  }

  // Fallback to localStorage
  try {
    const inventory = await getInventory();
    const status = item.status || (item.stock === 0 ? 'out-of-stock' : item.stock < 10 ? 'low-stock' : 'in-stock');
    const newItem: InventoryItem = { ...item, status };
    inventory.push(newItem);
    saveInventory(inventory);
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('inventory-updated', { detail: newItem }));
    return true;
  } catch (error) {
    console.error('Failed to save inventory item to localStorage', error);
    return false;
  }
};

/**
 * Update an inventory item in API, with localStorage fallback
 */
export const updateInventoryItem = async (
  productId: string,
  updates: Partial<Omit<InventoryItem, 'productId' | 'status'>> & { stock?: number }
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        ...updates,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('inventory-updated', { detail: data.item }));
      return true;
    } else {
      const errorData = await response.json();
      console.error('Failed to update inventory item in API:', errorData);
    }
  } catch (error) {
    console.error('Failed to update inventory item in API, falling back to localStorage', error);
  }

  // Fallback to localStorage
  try {
    const inventory = await getInventory();
    const itemIndex = inventory.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      console.error('Inventory item not found:', productId);
      return false;
    }

    const updatedStock = updates.stock ?? inventory[itemIndex].stock;
    const status = updatedStock === 0 ? 'out-of-stock' : updatedStock < 10 ? 'low-stock' : 'in-stock';
    
    inventory[itemIndex] = {
      ...inventory[itemIndex],
      ...updates,
      status,
    };
    
    saveInventory(inventory);
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('inventory-updated', { detail: inventory[itemIndex] }));
    return true;
  } catch (error) {
    console.error('Failed to update inventory item in localStorage', error);
    return false;
  }
};

/**
 * Delete an inventory item from API, with localStorage fallback
 */
export const deleteInventoryItem = async (productId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory?productId=${encodeURIComponent(productId)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('inventory-deleted', { detail: { productId } }));
      return true;
    } else {
      const errorData = await response.json();
      console.error('Failed to delete inventory item from API:', errorData);
    }
  } catch (error) {
    console.error('Failed to delete inventory item from API, falling back to localStorage', error);
  }

  // Fallback to localStorage
  try {
    const inventory = await getInventory();
    const itemIndex = inventory.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      console.error('Inventory item not found:', productId);
      return false;
    }

    inventory.splice(itemIndex, 1);
    saveInventory(inventory);
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('inventory-deleted', { detail: { productId } }));
    return true;
  } catch (error) {
    console.error('Failed to delete inventory item from localStorage', error);
    return false;
  }
};

/**
 * Initialize inventory with mock data if none exists
 */
export const initializeInventory = async (mockInventory: InventoryItem[]): Promise<InventoryItem[]> => {
  const existing = await getInventory();
  if (existing.length === 0) {
    // Save mock data to localStorage as fallback
    saveInventory(mockInventory);
    // Also try to save to API
    for (const item of mockInventory) {
      await addInventoryItem(item);
    }
    return mockInventory;
  }
  return existing;
};


