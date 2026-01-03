/**
 * Vercel Serverless Function for managing orders
 * GET /api/orders - Get all orders or orders for a specific user
 * POST /api/orders - Create a new order
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

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
}

const DATA_DIR = '/tmp'; // Vercel serverless functions use /tmp for writable storage
const ORDERS_FILE = join(DATA_DIR, 'orders.json');

async function getOrders(): Promise<RecentOrder[]> {
  try {
    const data = await readFile(ORDERS_FILE, 'utf-8');
    return JSON.parse(data) as RecentOrder[];
  } catch (error) {
    // File doesn't exist or is empty, return empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Error reading orders file:', error);
    return [];
  }
}

async function saveOrders(orders: RecentOrder[]): Promise<void> {
  try {
    await writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing orders file:', error);
    throw error;
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
      const orders = await getOrders();

      if (userId && typeof userId === 'string') {
        // Filter orders for specific user
        const userOrders = orders.filter(order => order.userId === userId);
        return res.status(200).json({ orders: userOrders });
      }

      // Return all orders
      return res.status(200).json({ orders });
    }

    if (req.method === 'POST') {
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
      
      const newOrder: RecentOrder = {
        ...orderData,
        id: orderId,
        date: new Date().toISOString(),
        status: orderData.status || 'gathering',
      };

      const orders = await getOrders();
      orders.push(newOrder);
      await saveOrders(orders);

      console.log('✅ New order created:', orderId);
      return res.status(201).json({ 
        success: true, 
        order: newOrder 
      });
    }

    if (req.method === 'PUT') {
      // Update existing order
      const { orderId, ...updateData } = req.body as { orderId: string } & Partial<RecentOrder>;

      if (!orderId) {
        return res.status(400).json({ error: 'orderId is required' });
      }

      const orders = await getOrders();
      const orderIndex = orders.findIndex(order => order.id === orderId);

      if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Update the order
      const updatedOrder: RecentOrder = {
        ...orders[orderIndex],
        ...updateData,
        id: orderId, // Ensure orderId doesn't change
      };

      orders[orderIndex] = updatedOrder;
      await saveOrders(orders);

      console.log('✅ Order updated:', orderId);
      return res.status(200).json({ 
        success: true, 
        order: updatedOrder 
      });
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

