/**
 * Vercel Serverless Function for managing inventory
 * GET /api/inventory - Get all inventory items
 * POST /api/inventory - Create a new inventory item
 * PUT /api/inventory - Update an inventory item
 * DELETE /api/inventory - Delete an inventory item
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export interface InventoryItem {
  productId: string;
  productName: string;
  stock: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  price: number;
}

const DATA_DIR = '/tmp'; // Vercel serverless functions use /tmp for writable storage
const INVENTORY_FILE = join(DATA_DIR, 'inventory.json');

// Helper function to determine status based on stock
function calculateStatus(stock: number): 'in-stock' | 'low-stock' | 'out-of-stock' {
  if (stock === 0) return 'out-of-stock';
  if (stock < 10) return 'low-stock';
  return 'in-stock';
}

async function getInventory(): Promise<InventoryItem[]> {
  try {
    const data = await readFile(INVENTORY_FILE, 'utf-8');
    const items = JSON.parse(data) as InventoryItem[];
    // Ensure status is calculated correctly
    return items.map(item => ({
      ...item,
      status: calculateStatus(item.stock),
    }));
  } catch (error) {
    // File doesn't exist or is empty, return empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Error reading inventory file:', error);
    return [];
  }
}

async function saveInventory(inventory: InventoryItem[]): Promise<void> {
  try {
    // Ensure status is calculated correctly before saving
    const itemsWithStatus = inventory.map(item => ({
      ...item,
      status: calculateStatus(item.stock),
    }));
    await writeFile(INVENTORY_FILE, JSON.stringify(itemsWithStatus, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing inventory file:', error);
    throw error;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get all inventory items
      const inventory = await getInventory();
      return res.status(200).json({ inventory });
    }

    if (req.method === 'POST') {
      // Create new inventory item
      const itemData = req.body as Omit<InventoryItem, 'status'> & { status?: InventoryItem['status'] };

      // Validate required fields
      if (!itemData.productId || !itemData.productName || typeof itemData.stock !== 'number' || typeof itemData.price !== 'number') {
        return res.status(400).json({ 
          error: 'Missing required fields: productId, productName, stock, price' 
        });
      }

      const inventory = await getInventory();
      
      // Check if product already exists
      const existingIndex = inventory.findIndex(item => item.productId === itemData.productId);
      if (existingIndex >= 0) {
        return res.status(409).json({ 
          error: 'Inventory item with this productId already exists' 
        });
      }

      const newItem: InventoryItem = {
        ...itemData,
        status: calculateStatus(itemData.stock),
      };

      inventory.push(newItem);
      await saveInventory(inventory);

      console.log('✅ New inventory item created:', itemData.productId);
      return res.status(201).json({ 
        success: true, 
        item: newItem 
      });
    }

    if (req.method === 'PUT') {
      // Update existing inventory item
      const itemData = req.body as Partial<InventoryItem> & { productId: string };

      if (!itemData.productId) {
        return res.status(400).json({ error: 'productId is required' });
      }

      const inventory = await getInventory();
      const itemIndex = inventory.findIndex(item => item.productId === itemData.productId);

      if (itemIndex === -1) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      // Update the item
      const updatedItem: InventoryItem = {
        ...inventory[itemIndex],
        ...itemData,
        productId: itemData.productId, // Ensure productId doesn't change
        status: calculateStatus(itemData.stock ?? inventory[itemIndex].stock),
      };

      inventory[itemIndex] = updatedItem;
      await saveInventory(inventory);

      console.log('✅ Inventory item updated:', itemData.productId);
      return res.status(200).json({ 
        success: true, 
        item: updatedItem 
      });
    }

    if (req.method === 'DELETE') {
      // Delete inventory item
      const { productId } = req.query;

      if (!productId || typeof productId !== 'string') {
        return res.status(400).json({ error: 'productId is required' });
      }

      const inventory = await getInventory();
      const itemIndex = inventory.findIndex(item => item.productId === productId);

      if (itemIndex === -1) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      inventory.splice(itemIndex, 1);
      await saveInventory(inventory);

      console.log('✅ Inventory item deleted:', productId);
      return res.status(200).json({ 
        success: true, 
        message: 'Inventory item deleted successfully' 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling inventory request:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

