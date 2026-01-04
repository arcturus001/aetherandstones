/**
 * Mock data for admin dashboard
 */

export interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueThisMonth: number;
  ordersThisMonth: number;
  revenueLastMonth: number;
  ordersLastMonth: number;
}

export interface InventoryItem {
  productId: string;
  productName: string;
  stock: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  price: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  stone?: string;
  properties?: string[];
}

export interface RecentOrder {
  id: string;
  userId?: string; // Link to user account
  customerName: string;
  customerEmail: string;
  items: OrderItem[]; // Full order items
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
  trackingNumber?: string;
  trackingUrl?: string;
  // Legacy fields for backward compatibility
  productName?: string;
  productId?: string;
  quantity?: number;
  email?: string;
  address?: string;
}

export interface TopProduct {
  productId: string;
  productName: string;
  sales: number;
  revenue: number;
}

// Mock sales data
export const mockSalesData: SalesData = {
  totalRevenue: 12450.00,
  totalOrders: 142,
  averageOrderValue: 87.68,
  revenueThisMonth: 3420.00,
  ordersThisMonth: 38,
  revenueLastMonth: 2890.00,
  ordersLastMonth: 32,
};

// Mock inventory data
export const mockInventory: InventoryItem[] = [
  { productId: '1', productName: 'Amethyst Power Bracelet', stock: 15, status: 'in-stock', price: 89 },
  { productId: '2', productName: 'Tiger Eye Balance Bracelet', stock: 8, status: 'in-stock', price: 75 },
  { productId: '4', productName: 'Rose Quartz Love Bracelet', stock: 3, status: 'low-stock', price: 65 },
  { productId: '5', productName: 'Clear Quartz Clarity Bracelet', stock: 22, status: 'in-stock', price: 55 },
  { productId: '6', productName: 'Lapis Lazuli Wisdom Bracelet', stock: 0, status: 'out-of-stock', price: 110 },
];

// Helper function to parse address string into shipping address object
function parseAddress(address: string, city: string, state: string, postalCode: string, country: string = "US") {
  return {
    fullName: "",
    address,
    city,
    state,
    postalCode,
    country,
  };
}

// Mock recent orders - updated to match new RecentOrder interface
export const mockRecentOrders: RecentOrder[] = [
  { 
    id: 'ORD-001', 
    customerName: 'Sarah Johnson', 
    customerEmail: 'sarah.johnson@email.com',
    items: [{ productId: '1', productName: 'Amethyst Power Bracelet', quantity: 2, price: 89 }],
    shippingAddress: parseAddress('123 Main St', 'San Francisco', 'CA', '94102'),
    subtotal: 178.00,
    shippingCost: 10.00,
    total: 188.00,
    shippingMethod: 'standard',
    date: '2024-12-20', 
    status: 'shipped',
    // Legacy fields for backward compatibility
    productName: 'Amethyst Power Bracelet', 
    productId: '1', 
    quantity: 2, 
    email: 'sarah.johnson@email.com', 
    address: '123 Main St, San Francisco, CA 94102' 
  },
  { 
    id: 'ORD-002', 
    customerName: 'Michael Chen', 
    customerEmail: 'michael.chen@email.com',
    items: [{ productId: '2', productName: 'Tiger Eye Balance Bracelet', quantity: 1, price: 75 }],
    shippingAddress: parseAddress('456 Oak Ave', 'Los Angeles', 'CA', '90001'),
    subtotal: 75.00,
    shippingCost: 10.00,
    total: 85.00,
    shippingMethod: 'standard',
    date: '2024-12-19', 
    status: 'delivered',
    productName: 'Tiger Eye Balance Bracelet', 
    productId: '2', 
    quantity: 1, 
    email: 'michael.chen@email.com', 
    address: '456 Oak Ave, Los Angeles, CA 90001' 
  },
  { 
    id: 'ORD-003', 
    customerName: 'Emily Rodriguez', 
    customerEmail: 'emily.rodriguez@email.com',
    items: [{ productId: '4', productName: 'Rose Quartz Love Bracelet', quantity: 1, price: 65 }],
    shippingAddress: parseAddress('789 Pine Rd', 'New York', 'NY', '10001'),
    subtotal: 65.00,
    shippingCost: 10.00,
    total: 75.00,
    shippingMethod: 'standard',
    date: '2024-12-19', 
    status: 'gathering',
    productName: 'Rose Quartz Love Bracelet', 
    productId: '4', 
    quantity: 1, 
    email: 'emily.rodriguez@email.com', 
    address: '789 Pine Rd, New York, NY 10001' 
  },
  { 
    id: 'ORD-004', 
    customerName: 'David Kim', 
    customerEmail: 'david.kim@email.com',
    items: [{ productId: '5', productName: 'Clear Quartz Clarity Bracelet', quantity: 3, price: 55 }],
    shippingAddress: parseAddress('321 Elm St', 'Seattle', 'WA', '98101'),
    subtotal: 165.00,
    shippingCost: 0.00,
    total: 165.00,
    shippingMethod: 'express',
    date: '2024-12-18', 
    status: 'shipped',
    productName: 'Clear Quartz Clarity Bracelet', 
    productId: '5', 
    quantity: 3, 
    email: 'david.kim@email.com', 
    address: '321 Elm St, Seattle, WA 98101' 
  },
  { 
    id: 'ORD-005', 
    customerName: 'Jessica Williams', 
    customerEmail: 'jessica.williams@email.com',
    items: [{ productId: '1', productName: 'Amethyst Power Bracelet', quantity: 1, price: 89 }],
    shippingAddress: parseAddress('654 Maple Dr', 'Chicago', 'IL', '60601'),
    subtotal: 89.00,
    shippingCost: 10.00,
    total: 99.00,
    shippingMethod: 'standard',
    date: '2024-12-18', 
    status: 'delivered',
    productName: 'Amethyst Power Bracelet', 
    productId: '1', 
    quantity: 1, 
    email: 'jessica.williams@email.com', 
    address: '654 Maple Dr, Chicago, IL 60601' 
  },
  { 
    id: 'ORD-006', 
    customerName: 'Robert Taylor', 
    customerEmail: 'robert.taylor@email.com',
    items: [{ productId: '2', productName: 'Tiger Eye Balance Bracelet', quantity: 2, price: 75 }],
    shippingAddress: parseAddress('987 Cedar Ln', 'Austin', 'TX', '78701'),
    subtotal: 150.00,
    shippingCost: 10.00,
    total: 160.00,
    shippingMethod: 'standard',
    date: '2024-12-21', 
    status: 'gathering',
    productName: 'Tiger Eye Balance Bracelet', 
    productId: '2', 
    quantity: 2, 
    email: 'robert.taylor@email.com', 
    address: '987 Cedar Ln, Austin, TX 78701' 
  },
  { 
    id: 'ORD-007', 
    customerName: 'Lisa Anderson', 
    customerEmail: 'lisa.anderson@email.com',
    items: [{ productId: '4', productName: 'Rose Quartz Love Bracelet', quantity: 1, price: 65 }],
    shippingAddress: parseAddress('147 Birch Way', 'Miami', 'FL', '33101'),
    subtotal: 65.00,
    shippingCost: 10.00,
    total: 75.00,
    shippingMethod: 'standard',
    date: '2024-12-21', 
    status: 'gathering',
    productName: 'Rose Quartz Love Bracelet', 
    productId: '4', 
    quantity: 1, 
    email: 'lisa.anderson@email.com', 
    address: '147 Birch Way, Miami, FL 33101' 
  },
];

// Mock top products
export const mockTopProducts: TopProduct[] = [
  { productId: '1', productName: 'Amethyst Power Bracelet', sales: 45, revenue: 4005.00 },
  { productId: '2', productName: 'Tiger Eye Balance Bracelet', sales: 32, revenue: 2400.00 },
  { productId: '4', productName: 'Rose Quartz Love Bracelet', sales: 28, revenue: 1820.00 },
  { productId: '5', productName: 'Clear Quartz Clarity Bracelet', sales: 25, revenue: 1375.00 },
];

