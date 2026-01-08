/**
 * Vercel Serverless Function for managing orders
 * GET /api/orders - Get all orders or orders for a specific user
 * POST /api/orders - Create a new order
 * PUT /api/orders - Update an order
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, initializeDatabase } from './db';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  stone?: string;
  properties?: string[];
}

interface RecentOrder {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingMethod: 'express' | 'standard';
  date: string;
  status: 'gathering' | 'shipped' | 'delivered';
  productName?: string;
  productId?: string;
  quantity?: number;
  email?: string;
  address?: string;
  trackingNumber?: string;
  trackingUrl?: string;
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

async function getOrders(userId?: string): Promise<RecentOrder[]> {
  await ensureDatabaseInitialized();
  
  try {
    let result;
    if (userId) {
      result = await query<{
        id: string;
        user_id: string | null;
        customer_name: string;
        customer_email: string;
        items: OrderItem[] | string;
        shipping_address: Record<string, unknown> | string;
        subtotal: number;
        shipping_cost: number;
        total: number;
        shipping_method: string;
        date: Date;
        status: string;
        tracking_number: string | null;
        tracking_url: string | null;
      }>('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    } else {
      result = await query<{
        id: string;
        user_id: string | null;
        customer_name: string;
        customer_email: string;
        items: OrderItem[] | string;
        shipping_address: Record<string, unknown> | string;
        subtotal: number;
        shipping_cost: number;
        total: number;
        shipping_method: string;
        date: Date;
        status: string;
        tracking_number: string | null;
        tracking_url: string | null;
      }>('SELECT * FROM orders ORDER BY created_at DESC');
    }

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id || undefined,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      items: (typeof row.items === 'string' ? JSON.parse(row.items) : row.items) as OrderItem[],
      shippingAddress: (typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address) as RecentOrder['shippingAddress'],
      subtotal: parseFloat(row.subtotal.toString()),
      shippingCost: parseFloat(row.shipping_cost.toString()),
      total: parseFloat(row.total.toString()),
      shippingMethod: row.shipping_method as 'express' | 'standard',
      date: row.date.toISOString(),
      status: row.status as 'gathering' | 'shipped' | 'delivered',
      trackingNumber: row.tracking_number || undefined,
      trackingUrl: row.tracking_url || undefined,
    }));
  } catch (error) {
    console.error('Error fetching orders from database:', error);
    return [];
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get orders
      const { userId } = req.query;
      const orders = await getOrders(userId as string | undefined);
      return res.status(200).json({ orders });
    }

    if (req.method === 'POST') {
      await ensureDatabaseInitialized();
      
      // Create new order
      const orderData = req.body as Omit<RecentOrder, 'id' | 'date'>;

      // Validate required fields
      if (!orderData.customerName || !orderData.customerEmail || !orderData.items || orderData.items.length === 0) {
        return res.status(400).json({ 
          error: 'Missing required fields: customerName, customerEmail, items' 
        });
      }

      // Generate order ID
      const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const orderDate = new Date();
      
      try {
        await query(
          `INSERT INTO orders (id, user_id, customer_name, customer_email, items, shipping_address, 
           subtotal, shipping_cost, total, shipping_method, date, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            orderId,
            orderData.userId || null,
            orderData.customerName,
            orderData.customerEmail,
            JSON.stringify(orderData.items),
            JSON.stringify(orderData.shippingAddress),
            orderData.subtotal,
            orderData.shippingCost,
            orderData.total,
            orderData.shippingMethod,
            orderDate,
            orderData.status || 'gathering',
          ]
        );

        const newOrder: RecentOrder = {
          ...orderData,
          id: orderId,
          date: orderDate.toISOString(),
          status: orderData.status || 'gathering',
        };

        console.log('✅ New order created:', orderId);
        return res.status(201).json({ 
          success: true, 
          order: newOrder 
        });
      } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({
          error: 'Failed to create order',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    if (req.method === 'PUT') {
      await ensureDatabaseInitialized();
      
      // Update existing order
      const { orderId, ...updateData } = req.body as { orderId: string } & Partial<RecentOrder>;

      if (!orderId) {
        return res.status(400).json({ error: 'orderId is required' });
      }

      try {
        // Build update query dynamically based on provided fields
        const updates: string[] = [];
        const values: (string | number | boolean | null)[] = [];
        let paramIndex = 1;

        if (updateData.status !== undefined) {
          updates.push(`status = $${paramIndex++}`);
          values.push(updateData.status);
        }
        if (updateData.userId !== undefined) {
          updates.push(`user_id = $${paramIndex++}`);
          values.push(updateData.userId || null);
        }
        if (updateData.items !== undefined) {
          updates.push(`items = $${paramIndex++}`);
          values.push(JSON.stringify(updateData.items));
        }
        if (updateData.shippingAddress !== undefined) {
          updates.push(`shipping_address = $${paramIndex++}`);
          values.push(JSON.stringify(updateData.shippingAddress));
        }
        if (updateData.subtotal !== undefined) {
          updates.push(`subtotal = $${paramIndex++}`);
          values.push(updateData.subtotal);
        }
        if (updateData.shippingCost !== undefined) {
          updates.push(`shipping_cost = $${paramIndex++}`);
          values.push(updateData.shippingCost);
        }
        if (updateData.total !== undefined) {
          updates.push(`total = $${paramIndex++}`);
          values.push(updateData.total);
        }
        if (updateData.shippingMethod !== undefined) {
          updates.push(`shipping_method = $${paramIndex++}`);
          values.push(updateData.shippingMethod);
        }
        if (updateData.trackingNumber !== undefined) {
          updates.push(`tracking_number = $${paramIndex++}`);
          values.push(updateData.trackingNumber || null);
        }
        if (updateData.trackingUrl !== undefined) {
          updates.push(`tracking_url = $${paramIndex++}`);
          values.push(updateData.trackingUrl || null);
        }

        if (updates.length === 0) {
          return res.status(400).json({ error: 'No fields to update' });
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(orderId);

        const result = await query<{
          id: string;
          user_id: string | null;
          customer_name: string;
          customer_email: string;
          items: OrderItem[] | string;
          shipping_address: {
            fullName: string;
            address: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
          } | string;
          subtotal: number;
          shipping_cost: number;
          total: number;
          shipping_method: string;
          date: Date;
          status: string;
          tracking_number: string | null;
          tracking_url: string | null;
        }>(
          `UPDATE orders SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
          values
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Order not found' });
        }

        const row = result.rows[0];
        const updatedOrder: RecentOrder = {
          id: row.id,
          userId: row.user_id || undefined,
          customerName: row.customer_name,
          customerEmail: row.customer_email,
          items: (typeof row.items === 'string' ? JSON.parse(row.items) : row.items) as OrderItem[],
          shippingAddress: (typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address) as RecentOrder['shippingAddress'],
          subtotal: parseFloat(row.subtotal.toString()),
          shippingCost: parseFloat(row.shipping_cost.toString()),
          total: parseFloat(row.total.toString()),
          shippingMethod: row.shipping_method as 'express' | 'standard',
          date: row.date.toISOString(),
          status: row.status as 'gathering' | 'shipped' | 'delivered',
        };

        console.log('✅ Order updated:', orderId);
        return res.status(200).json({ 
          success: true, 
          order: updatedOrder 
        });
      } catch (error) {
        console.error('Error updating order:', error);
        return res.status(500).json({
          error: 'Failed to update order',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling orders request:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

