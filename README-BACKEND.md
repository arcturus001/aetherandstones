# Backend API Setup

This project uses Vercel serverless functions for backend functionality.

## API Endpoints

### Email Service
- **POST** `/api/send-email` - Send emails via Resend
  - Body: `{ to: string[], subject: string, text: string, from?: string }`
  - Returns: `{ success: boolean, id?: string, message?: string }`

### Orders
- **GET** `/api/orders` - Get all orders (or filter by `?userId=...`)
  - Returns: `{ orders: RecentOrder[] }`
- **POST** `/api/orders` - Create a new order
  - Body: Order data (without `id` and `date`, these are auto-generated)
  - Returns: `{ success: boolean, order: RecentOrder }`
- **PUT** `/api/orders` - Update an order (e.g., change status)
  - Body: `{ orderId: string, status?: string, ...other fields }`
  - Returns: `{ success: boolean, order: RecentOrder }`

### Subscriptions
- **GET** `/api/subscriptions` - Get all subscriptions (or filter by `?email=...`)
  - Returns: `{ subscriptions: Subscription[] }`
- **POST** `/api/subscriptions` - Add a new subscription
  - Body: `{ email: string, name?: string, source?: string }`
  - Returns: `{ success: boolean, message: string }`
- **DELETE** `/api/subscriptions?email=...` - Unsubscribe
  - Returns: `{ success: boolean, message: string }`

### Inventory
- **GET** `/api/inventory` - Get all inventory items
  - Returns: `{ inventory: InventoryItem[] }`
- **POST** `/api/inventory` - Create a new inventory item
  - Body: `{ productId: string, productName: string, stock: number, price: number }`
  - Returns: `{ success: boolean, item: InventoryItem }`
- **PUT** `/api/inventory` - Update an inventory item
  - Body: `{ productId: string, productName?: string, stock?: number, price?: number }`
  - Returns: `{ success: boolean, item: InventoryItem }`
- **DELETE** `/api/inventory?productId=...` - Delete an inventory item
  - Returns: `{ success: boolean, message: string }`

## Environment Variables

Create a `.env` file in the root directory (or set in Vercel dashboard):

```env
RESEND_API_KEY=re_your_api_key_here
```

### Getting Your Resend API Key

1. Sign up at https://resend.com
2. Go to API Keys section
3. Create a new API key
4. Add it to your `.env` file or Vercel environment variables

## Local Development

For local development with Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev
```

The API endpoints will be available at `http://localhost:3000/api/*`

## Deployment

When deploying to Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the `RESEND_API_KEY` environment variable in Vercel dashboard
4. Deploy

The serverless functions will automatically be deployed and available at `/api/*` endpoints.

## Data Storage

Currently, orders, subscriptions, and inventory are stored in JSON files in `/tmp` directory (Vercel serverless function storage).

**Note:** For production, consider migrating to a proper database:
- Vercel Postgres
- MongoDB Atlas
- Supabase
- PlanetScale

## Frontend Usage

The frontend utilities automatically use the API endpoints:

```typescript
import { sendOrderNotificationEmail } from './utils/email';
import { addOrder, getOrders } from './utils/orders';
import { subscribeEmail, unsubscribeEmail } from './utils/subscriptions';
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from './utils/inventory';

// Send email
await sendOrderNotificationEmail(orderDetails);

// Create order
await addOrder(order);

// Get orders
const orders = await getOrders();

// Subscribe
await subscribeEmail('user@example.com', 'User Name', 'footer');

// Unsubscribe
await unsubscribeEmail('user@example.com');

// Get inventory
const inventory = await getInventory();

// Add inventory item
await addInventoryItem({
  productId: '1',
  productName: 'Product Name',
  stock: 10,
  price: 99.99
});

// Update inventory item
await updateInventoryItem('1', { stock: 5 });

// Delete inventory item
await deleteInventoryItem('1');
```

