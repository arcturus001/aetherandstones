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

export interface RecentOrder {
  id: string;
  customerName: string;
  productName: string;
  productId: string;
  quantity: number;
  total: number;
  date: string;
  status: 'gathering' | 'shipped' | 'delivered';
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

// Mock recent orders
export const mockRecentOrders: RecentOrder[] = [
  { id: 'ORD-001', customerName: 'Sarah Johnson', productName: 'Amethyst Power Bracelet', productId: '1', quantity: 2, total: 178.00, date: '2024-12-20', status: 'shipped', email: 'sarah.johnson@email.com', address: '123 Main St, San Francisco, CA 94102' },
  { id: 'ORD-002', customerName: 'Michael Chen', productName: 'Tiger Eye Balance Bracelet', productId: '2', quantity: 1, total: 75.00, date: '2024-12-19', status: 'delivered', email: 'michael.chen@email.com', address: '456 Oak Ave, Los Angeles, CA 90001' },
  { id: 'ORD-003', customerName: 'Emily Rodriguez', productName: 'Rose Quartz Love Bracelet', productId: '4', quantity: 1, total: 65.00, date: '2024-12-19', status: 'gathering', email: 'emily.rodriguez@email.com', address: '789 Pine Rd, New York, NY 10001' },
  { id: 'ORD-004', customerName: 'David Kim', productName: 'Clear Quartz Clarity Bracelet', productId: '5', quantity: 3, total: 165.00, date: '2024-12-18', status: 'shipped', email: 'david.kim@email.com', address: '321 Elm St, Seattle, WA 98101' },
  { id: 'ORD-005', customerName: 'Jessica Williams', productName: 'Amethyst Power Bracelet', productId: '1', quantity: 1, total: 89.00, date: '2024-12-18', status: 'delivered', email: 'jessica.williams@email.com', address: '654 Maple Dr, Chicago, IL 60601' },
  { id: 'ORD-006', customerName: 'Robert Taylor', productName: 'Tiger Eye Balance Bracelet', productId: '2', quantity: 2, total: 150.00, date: '2024-12-21', status: 'gathering', email: 'robert.taylor@email.com', address: '987 Cedar Ln, Austin, TX 78701' },
  { id: 'ORD-007', customerName: 'Lisa Anderson', productName: 'Rose Quartz Love Bracelet', productId: '4', quantity: 1, total: 65.00, date: '2024-12-21', status: 'gathering', email: 'lisa.anderson@email.com', address: '147 Birch Way, Miami, FL 33101' },
];

// Mock top products
export const mockTopProducts: TopProduct[] = [
  { productId: '1', productName: 'Amethyst Power Bracelet', sales: 45, revenue: 4005.00 },
  { productId: '2', productName: 'Tiger Eye Balance Bracelet', sales: 32, revenue: 2400.00 },
  { productId: '4', productName: 'Rose Quartz Love Bracelet', sales: 28, revenue: 1820.00 },
  { productId: '5', productName: 'Clear Quartz Clarity Bracelet', sales: 25, revenue: 1375.00 },
];

