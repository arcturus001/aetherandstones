/**
 * Vercel Serverless Function for managing inventory
 * GET /api/inventory - Get all inventory items
 * POST /api/inventory - Create a new inventory item
 * PUT /api/inventory - Update an inventory item
 * DELETE /api/inventory - Delete an inventory item
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, initializeDatabase } from './db';

export interface InventoryItem {
  productId: string;
  productName: string;
  stock: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  price: number;
}

// Helper function to determine status based on stock
function calculateStatus(stock: number): 'in-stock' | 'low-stock' | 'out-of-stock' {
  if (stock === 0) return 'out-of-stock';
  if (stock < 10) return 'low-stock';
  return 'in-stock';
}

// Initialize database on first import
let dbInitialized = false;
async function ensureDatabaseInitialized() {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      dbInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
}

async function getInventory(): Promise<InventoryItem[]> {
  await ensureDatabaseInitialized();
  
  try {
    const result = await query<{
      product_id: string;
      product_name: string;
      stock: number;
      status: string;
      price: number;
    }>('SELECT * FROM inventory ORDER BY product_name');

    return result.rows.map(row => ({
      productId: row.product_id,
      productName: row.product_name,
      stock: row.stock,
      status: calculateStatus(row.stock) as 'in-stock' | 'low-stock' | 'out-of-stock',
      price: parseFloat(row.price.toString()),
    }));
  } catch (error) {
    console.error('Error fetching inventory from database:', error);
    return [];
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
      await ensureDatabaseInitialized();
      
      // Create new inventory item
      const itemData = req.body as Omit<InventoryItem, 'status'> & { status?: InventoryItem['status'] };

      // Validate required fields
      if (!itemData.productId || !itemData.productName || typeof itemData.stock !== 'number' || typeof itemData.price !== 'number') {
        return res.status(400).json({ 
          error: 'Missing required fields: productId, productName, stock, price' 
        });
      }

      const status = calculateStatus(itemData.stock);

      try {
        await query(
          `INSERT INTO inventory (product_id, product_name, stock, status, price)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (product_id) DO NOTHING`,
          [itemData.productId, itemData.productName, itemData.stock, status, itemData.price]
        );

        // Check if insert was successful
        const checkResult = await query(
          'SELECT * FROM inventory WHERE product_id = $1',
          [itemData.productId]
        );

        if (checkResult.rows.length === 0) {
          return res.status(409).json({ 
            error: 'Inventory item with this productId already exists' 
          });
        }

        const newItem: InventoryItem = {
          productId: itemData.productId,
          productName: itemData.productName,
          stock: itemData.stock,
          status,
          price: itemData.price,
        };

        console.log('✅ New inventory item created:', itemData.productId);
        return res.status(201).json({ 
          success: true, 
          item: newItem 
        });
      } catch (error) {
        console.error('Error creating inventory item:', error);
        return res.status(500).json({
          error: 'Failed to create inventory item',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    if (req.method === 'PUT') {
      await ensureDatabaseInitialized();
      
      // Update existing inventory item
      const itemData = req.body as Partial<InventoryItem> & { productId: string };

      if (!itemData.productId) {
        return res.status(400).json({ error: 'productId is required' });
      }

      try {
        // Build update query dynamically
        const updates: string[] = [];
        const values: (string | number | boolean | null)[] = [];
        let paramIndex = 1;

        if (itemData.productName !== undefined) {
          updates.push(`product_name = $${paramIndex++}`);
          values.push(itemData.productName);
        }
        if (itemData.stock !== undefined) {
          updates.push(`stock = $${paramIndex++}`);
          values.push(itemData.stock);
        }
        if (itemData.price !== undefined) {
          updates.push(`price = $${paramIndex++}`);
          values.push(itemData.price);
        }

        if (updates.length === 0) {
          return res.status(400).json({ error: 'No fields to update' });
        }

        // Always update status based on stock
        const currentItem = await query<{ stock: number }>(
          'SELECT stock FROM inventory WHERE product_id = $1',
          [itemData.productId]
        );

        if (currentItem.rows.length === 0) {
          return res.status(404).json({ error: 'Inventory item not found' });
        }

        const newStock = itemData.stock ?? currentItem.rows[0].stock;
        const newStatus = calculateStatus(newStock);
        updates.push(`status = $${paramIndex++}`);
        values.push(newStatus);
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(itemData.productId);

        await query(
          `UPDATE inventory SET ${updates.join(', ')} WHERE product_id = $${paramIndex}`,
          values
        );

        // Fetch updated item
        const result = await query<{
          product_id: string;
          product_name: string;
          stock: number;
          price: string | number;
        }>(
          'SELECT * FROM inventory WHERE product_id = $1',
          [itemData.productId]
        );

        const row = result.rows[0];
        const updatedItem: InventoryItem = {
          productId: row.product_id,
          productName: row.product_name,
          stock: row.stock,
          status: calculateStatus(row.stock) as 'in-stock' | 'low-stock' | 'out-of-stock',
          price: parseFloat(row.price.toString()),
        };

        console.log('✅ Inventory item updated:', itemData.productId);
        return res.status(200).json({ 
          success: true, 
          item: updatedItem 
        });
      } catch (error) {
        console.error('Error updating inventory item:', error);
        return res.status(500).json({
          error: 'Failed to update inventory item',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    if (req.method === 'DELETE') {
      await ensureDatabaseInitialized();
      
      // Delete inventory item
      const { productId } = req.query;

      if (!productId || typeof productId !== 'string') {
        return res.status(400).json({ error: 'productId is required' });
      }

      try {
        const result = await query(
          'DELETE FROM inventory WHERE product_id = $1 RETURNING product_id',
          [productId]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Inventory item not found' });
        }

        console.log('✅ Inventory item deleted:', productId);
        return res.status(200).json({ 
          success: true, 
          message: 'Inventory item deleted successfully' 
        });
      } catch (error) {
        console.error('Error deleting inventory item:', error);
        return res.status(500).json({
          error: 'Failed to delete inventory item',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
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

