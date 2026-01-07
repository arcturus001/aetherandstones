# Admin Backoffice - Backend Integration

The admin backoffice is now fully integrated with the backend API. All data operations (orders, inventory) are synchronized between the frontend and backend.

## Integration Status

### ✅ Orders Management
- **View Orders**: Loads orders from `/api/orders` endpoint
- **Update Order Status**: Updates order status via `PUT /api/orders`
- **Real-time Updates**: Automatically refreshes when orders are updated
- **Fallback**: Uses localStorage if API is unavailable

### ✅ Inventory Management
- **View Inventory**: Loads inventory from `/api/inventory` endpoint
- **Create Inventory Items**: Adds new items via `POST /api/inventory`
- **Update Inventory**: Updates stock, price, etc. via `PUT /api/inventory`
- **Delete Inventory**: Removes items via `DELETE /api/inventory`
- **Auto Status Calculation**: Automatically calculates `in-stock`, `low-stock`, `out-of-stock` based on stock levels
- **Real-time Updates**: Automatically refreshes when inventory is updated

### ✅ Email Notifications
- **Order Notifications**: Sends email notifications via `/api/send-email` when orders are placed
- **Resend Integration**: Uses Resend API server-side (no CORS issues)

## How It Works

### Data Flow

```
Admin Page (Frontend)
    ↓
API Utilities (src/utils/)
    ↓
Backend API (api/)
    ↓
Data Storage (/tmp/ JSON files)
```

### Event System

The admin page listens for custom events to automatically refresh data:

- `order-status-updated` - Refreshes orders when status changes
- `new-order-created` - Refreshes orders when new order is created
- `inventory-updated` - Refreshes inventory when items are updated
- `inventory-deleted` - Refreshes inventory when items are deleted

### API Endpoints Used

#### Orders
- `GET /api/orders` - Fetch all orders
- `GET /api/orders?userId=...` - Fetch user-specific orders
- `POST /api/orders` - Create new order
- `PUT /api/orders` - Update order (status, etc.)

#### Inventory
- `GET /api/inventory` - Fetch all inventory items
- `POST /api/inventory` - Create new inventory item
- `PUT /api/inventory` - Update inventory item
- `DELETE /api/inventory?productId=...` - Delete inventory item

#### Email
- `POST /api/send-email` - Send email notifications

## Admin Page Features

### Dashboard Tab
- Displays sales statistics
- Shows inventory status overview
- Real-time data from backend

### Orders Tab
- View all orders
- Filter by status (all, gathering, shipped, delivered)
- Update order status with backend sync
- See order details

### Inventory Tab
- View all inventory items
- See stock levels and status
- Add/edit/delete inventory items
- Automatic status calculation

## Error Handling

All API calls include:
- **Try/Catch blocks** for error handling
- **localStorage fallback** if API fails
- **User-friendly error messages**
- **Console logging** for debugging

## Testing the Integration

1. **Start the dev server**: `pnpm dev`
2. **Login to admin**: Navigate to `/admin`
3. **View orders**: Check Orders tab - should load from API
4. **Update order status**: Click status buttons - should update via API
5. **View inventory**: Check Inventory tab - should load from API
6. **Update inventory**: Modify stock levels - should update via API

## Production Deployment

When deploying to Vercel:

1. **Set Environment Variables**:
   - `RESEND_API_KEY` - Your Resend API key

2. **API Endpoints**:
   - All endpoints available at `/api/*`
   - CORS enabled for frontend access

3. **Data Persistence**:
   - Currently uses `/tmp` directory (ephemeral)
   - Consider migrating to database for production:
     - Vercel Postgres
     - MongoDB Atlas
     - Supabase
     - PlanetScale

## Troubleshooting

### Orders not loading
- Check browser console for API errors
- Verify API endpoint is accessible
- Check network tab for failed requests

### Inventory not updating
- Verify `updateInventoryItem` is being called
- Check API response in network tab
- Ensure event listeners are registered

### Status not updating
- Check if `PUT /api/orders` endpoint is working
- Verify order ID is correct
- Check backend logs for errors


