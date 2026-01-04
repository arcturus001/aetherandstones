# Aether & Stones - Complete Technical & UX Documentation

**Version**: 1.0.0  
**Last Updated**: 2024  
**Platform**: Full-Stack E-commerce with React, TypeScript, PostgreSQL, Stripe

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Complete User Flows](#complete-user-flows)
5. [Authentication System](#authentication-system)
6. [Order & Payment Flow](#order--payment-flow)
7. [Account Management](#account-management)
8. [Admin Backoffice](#admin-backoffice)
9. [Complete API Documentation](#complete-api-documentation)
10. [Database Schema](#database-schema)
11. [Security Implementation](#security-implementation)
12. [Email System](#email-system)
13. [Stripe Webhook Integration](#stripe-webhook-integration)
14. [Development Setup](#development-setup)
15. [Deployment Guide](#deployment-guide)
16. [Testing](#testing)
17. [Monitoring & Logging](#monitoring--logging)
18. [Troubleshooting](#troubleshooting)
19. [File Structure](#file-structure)
20. [Key Technical Decisions](#key-technical-decisions)

---

## Overview

Aether & Stones is a premium e-commerce platform for selling crystal bracelets. It features automatic account creation, secure authentication, Stripe payment processing, and a comprehensive admin backoffice.

### Core Features

- **Product Catalog**: Browse and view crystal bracelets with detailed information
- **Shopping Cart**: Add products, manage quantities, calculate shipping
- **Checkout**: Secure payment processing via Stripe
- **Automatic Account Creation**: Accounts auto-created on purchase
- **Password Setup Flow**: Secure password setup via email token (24-hour expiration)
- **User Accounts**: Order history, saved addresses, profile management
- **Admin Backoffice**: Order management, inventory control, sales analytics
- **Email Notifications**: Order confirmations and password setup emails
- **Shipment Tracking**: Tracking numbers and URLs for shipped orders

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │  Utils   │  │  State   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       │ (Vercel Serverless Functions)
┌──────────────────────▼──────────────────────────────────────┐
│                    Backend API Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Auth    │  │  Orders  │  │  Users   │  │ Webhooks │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Addresses│  │ Profile  │  │Inventory │  │  Email   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
│  PostgreSQL  │ │  Stripe  │ │   Resend   │
│   Database   │ │   API    │ │    API     │
└──────────────┘ └──────────┘ └────────────┘
```

### Frontend Architecture

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.2.0
- **Routing**: React Router DOM v7.11.0
- **UI Components**: React Spectrum S2 (Adobe Design System)
- **Styling**: Spectrum 2 style macro with CSS-in-JS
- **State Management**: React hooks (useState, useEffect, Context API)
- **Client Storage**: 
  - `localStorage` for cart persistence
  - `sessionStorage` for admin authentication
  - Session cookies for user authentication

### Backend Architecture

- **Runtime**: Node.js (Vercel Serverless Functions)
- **Database**: PostgreSQL (Render) with SSL connection
- **ORM**: Raw SQL queries with `pg` library (no ORM)
- **Authentication**: DB-backed sessions with httpOnly cookies
- **Payment Processing**: Stripe API v20.1.0
- **Email Service**: Resend API
- **Session Management**: Database-backed (not JWT)

### Database Architecture

- **Provider**: Render PostgreSQL
- **Connection**: SSL-enabled connection pool
- **Connection Pooling**: Automatic via `pg.Pool`
- **Auto-Initialization**: Tables created on first API call
- **Migrations**: Manual SQL scripts (`api/db-schema.sql`)

---

## Technology Stack

### Frontend Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^7.11.0",
  "@react-spectrum/s2": "Spectrum 2 components",
  "vite": "^5.2.0",
  "typescript": "^5.2.2"
}
```

### Backend Dependencies

```json
{
  "pg": "^8.11.3",
  "stripe": "^20.1.0",
  "argon2": "^0.44.0",
  "cookie": "^1.1.1",
  "@vercel/node": "^3.2.29",
  "uuid": "^13.0.0"
}
```

### Development Dependencies

```json
{
  "vitest": "^4.0.16",
  "@vitest/ui": "^4.0.16",
  "typescript": "^5.2.2",
  "eslint": "^8.57.0"
}
```

---

## Complete User Flows

### 1. Shopping Flow (Guest User)

**Path**: `/` → `/shop` → `/product/:id` → `/cart` → `/checkout` → `/order-success`

#### Step-by-Step Flow

1. **Homepage** (`/`)
   - Hero section with brand messaging
   - Featured products
   - Call-to-action to shop

2. **Shop Page** (`/shop`)
   - Product grid display
   - Filter by properties (stone type, properties)
   - Search functionality
   - Click product card → Product Detail

3. **Product Detail** (`/product/:id`)
   - Product images gallery
   - Product name, description
   - Stone properties and meanings
   - Price display
   - Quantity selector
   - "Add to Cart" button
   - Cart count badge in header
   - Related products

4. **Shopping Cart** (`/cart`)
   - Review all cart items
   - Update quantities (increase/decrease)
   - Remove items
   - Calculate subtotal
   - Shipping cost calculation:
     - Free shipping threshold: $150+
     - Standard: $10
     - Express: $30
   - Shipping progress meter (shows progress to free shipping)
   - "Proceed to Checkout" button
   - "Continue Shopping" link

5. **Checkout** (`/checkout`)
   - **Shipping Information Form**:
     - Full Name (required)
     - Email (required)
     - Address Line 1 (required)
     - Address Line 2 (optional)
     - City (required)
     - State/Region (required)
     - Postal Code (required)
     - Country (required, default: US)
   - **Payment Information**:
     - Card Number (Stripe)
     - Expiry Date
     - CVV
     - Cardholder Name
   - **Order Summary**:
     - Items list
     - Subtotal
     - Shipping cost
     - Total
   - **Submit Order**:
     - Validates all fields
     - Creates order in database
     - Auto-creates user account (if not logged in)
     - Generates password setup token (if user has no password)
     - Sends order confirmation email
     - Clears cart
     - Redirects to `/order-success?orderId=...`

6. **Order Success** (`/order-success`)
   - Order confirmation message: "Your order is confirmed."
   - Account creation notification
   - Premium "Complete your account" card:
     - **If user needs password**:
       - Title: "Secure your vault"
       - Text: "Set a password to track orders and save delivery details."
       - Primary CTA: "Set password" (links to `/set-password?token=...`)
       - Secondary link: "Resend email"
     - **If user has password**:
       - Title: "Continue to your vault"
       - Primary CTA: "Go to account"
   - Order summary display
   - Refresh-safe (fetches status from API)

**Files Involved**:
- `src/pages/Index.tsx` - Homepage
- `src/pages/Shop.tsx` - Shop page
- `src/pages/ProductDetail.tsx` - Product detail
- `src/pages/Cart.tsx` - Shopping cart
- `src/pages/Checkout.tsx` - Checkout form
- `src/pages/OrderSuccess.tsx` - Order confirmation
- `src/utils/cart.ts` - Cart management utilities
- `api/orders.ts` - Order creation endpoint
- `api/users.ts` - User creation endpoint

### 2. Authentication Flow

#### 2.1 Account Auto-Creation (Post-Purchase)

**Trigger**: User completes checkout

**Process**:
1. Checkout form collects: email, name, shipping address
2. Order created in database (`POST /api/orders`)
3. User account auto-created if doesn't exist (`POST /api/users`)
4. Password setup token generated if user has no password
5. Password setup email sent via Resend (`api/utils/email.ts`)
6. User redirected to order success page
7. Order success page shows password setup prompt

**Code Flow**:
```typescript
// src/pages/Checkout.tsx
const handleSubmit = async () => {
  // 1. Create order
  await addOrder(newOrder);
  
  // 2. Auto-create user if not logged in
  if (!currentUser) {
    const userResponse = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify({ email, name, phone: null })
    });
    const { user, token } = await userResponse.json();
    // Token returned for email sending
  }
  
  // 3. Clear cart and redirect
  clearCart();
  window.location.href = `/order-success?orderId=${orderId}`;
};
```

**Files**:
- `src/pages/Checkout.tsx` - Creates user via `POST /api/users`
- `api/users.ts` - User creation endpoint (sends email)
- `api/utils/email.ts` - Sends password setup email

#### 2.2 Password Setup Flow

**Entry Point**: Email link `/set-password?token=...&email=...`

**Process**:
1. User clicks email link
2. Token validated (`GET /api/users?action=validate-token`)
3. Masked email displayed (e.g., `u***@example.com`)
4. User enters password (min 6 characters)
5. User confirms password
6. Password set (`POST /api/users?action=set-password`)
7. Token marked as used (`used_at` set)
8. Session created automatically
9. Success state shown: "Vault secured"
10. Auto-redirect to `/account/orders` after ~1 second

**UX Details**:
- Password strength hint: "Use 10+ characters for a stronger password."
- Clear error states:
  - Expired link: "This link has expired. Resend a new one."
  - Used link: "This link has already been used. Request a new one."
  - Weak password: "Password must be at least 6 characters"
  - Mismatch: "Passwords do not match"
- Loading states during validation and submission

**Code Flow**:
```typescript
// src/pages/SetPassword.tsx
const handleSubmit = async () => {
  // 1. Validate token
  const validateResponse = await fetch(`/api/users?action=validate-token&token=${token}`);
  const { maskedEmail, email } = await validateResponse.json();
  
  // 2. Set password
  const setPasswordResponse = await fetch('/api/users?action=set-password', {
    method: 'POST',
    body: JSON.stringify({ token, email, password })
  });
  
  // 3. Session created automatically, redirect
  navigate('/account/orders');
};
```

**Files**:
- `src/pages/SetPassword.tsx` - Password setup UI
- `api/users.ts` - Password setting endpoint (creates session)

#### 2.3 Login Flow

**Entry Point**: `/login`

**Process**:
1. User enters email and password
2. Credentials verified (`POST /api/auth/login`)
3. Password verified using Argon2
4. Session created in database
5. httpOnly session cookie set
6. User data returned
7. Redirect to `/account` or `redirectTo` param

**UX Details**:
- Form validation (email format, required fields)
- Error messages: "Invalid email or password" (generic, doesn't reveal if email exists)
- Loading state during authentication
- "Remember me" option (future enhancement)

**Code Flow**:
```typescript
// src/pages/Login.tsx
const handleSubmit = async () => {
  const result = await login(email, password);
  if (result.success) {
    navigate(redirectTo || '/account');
  }
};

// src/utils/auth.ts
export const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  // Session cookie set automatically
  return await response.json();
};
```

**Files**:
- `src/pages/Login.tsx` - Login UI
- `api/auth/login.ts` - Login endpoint
- `src/utils/auth.ts` - Frontend auth utilities

#### 2.4 Logout Flow

**Process**:
1. User clicks logout button (in account layout or header)
2. `POST /api/auth/logout` called
3. Session deleted from database
4. Session cookie cleared
5. Redirect to home page

**Files**:
- `api/auth/logout.ts` - Logout endpoint
- `src/utils/auth.ts` - Frontend logout utility
- `src/pages/account/AccountLayout.tsx` - Logout button

### 3. Account Management Flow

**Entry Point**: `/account` (protected route)

**Structure**:
- `/account` → `/account/orders` (default)
- `/account/orders` - Order history
- `/account/addresses` - Saved addresses
- `/account/profile` - User profile

**Access Control**:
- Protected by `ProtectedRoute` component
- Checks session via `GET /api/auth/me`
- Redirects to `/login?redirectTo=/account` if not authenticated
- Shows loading skeleton while checking authentication

#### 3.1 Order History (`/account/orders`)

**Features**:
- List all orders for authenticated user (sorted by date, newest first)
- Order details:
  - Order ID
  - Date placed
  - Status badge (color-coded):
    - "Being Prepared" (accent/blue)
    - "Shipped" (informative/cyan)
    - "Delivered" (positive/green)
  - Total amount
  - Items list (product name, quantity, price)
  - Shipping address
  - **Tracking information** (if available):
    - Tracking number
    - Tracking URL (clickable link)
- Empty state with "Start Shopping" CTA
- Loading skeletons while fetching

**API**: `GET /api/orders` (scoped to user via session)

**Files**:
- `src/pages/account/AccountOrders.tsx` - Order history UI
- `api/orders.ts` - Orders endpoint

#### 3.2 Address Management (`/account/addresses`)

**Features**:
- List all saved addresses (shipping/billing)
- Add new address (form with validation)
- Edit existing address
- Delete address (with confirmation)
- Form fields:
  - Type (shipping/billing)
  - Line 1 (required)
  - Line 2 (optional)
  - City (required)
  - Region/State (required)
  - Postal Code (required)
  - Country (required)
- Empty state if no addresses
- Loading skeletons

**API**:
- `GET /api/addresses` - List addresses
- `POST /api/addresses` - Create address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

**Files**:
- `src/pages/account/AccountAddresses.tsx` - Address management UI
- `api/addresses.ts` - Addresses endpoint

#### 3.3 Profile Management (`/account/profile`)

**Features**:
- View email (read-only, cannot be changed)
- Edit name (required)
- Edit phone number (optional)
- Form validation
- Success feedback on save
- Loading skeleton

**API**:
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile

**Files**:
- `src/pages/account/AccountProfile.tsx` - Profile UI
- `api/profile.ts` - Profile endpoint

**Files**:
- `src/pages/account/AccountLayout.tsx` - Account layout with navigation
- `src/components/ProtectedRoute.tsx` - Route protection

### 4. Admin Flow

**Entry Point**: `/admin`

**Authentication**:
- Client-side authentication (sessionStorage)
- Separate from user authentication
- Credentials: `admin@aetherandstones.com` / `admin123`
- **Note**: Should be moved to backend for production

**Features**:

#### Dashboard Tab
- Sales statistics:
  - Total revenue
  - Total orders
  - Average order value
  - Revenue this month
  - Orders this month
  - Comparison with last month
- Inventory overview:
  - Total products
  - Low stock alerts
  - Out of stock items

#### Orders Tab
- View all orders (not scoped to user)
- Filter by status:
  - All orders
  - Being Prepared (gathering)
  - Shipped
  - Delivered
- Update order status:
  - Click status badge → dropdown menu
  - Updates via `PUT /api/orders`
  - Real-time refresh via events
- Order details:
  - Customer information
  - Items list
  - Shipping address
  - Payment information
  - **Tracking information** (editable):
    - Add/update tracking number
    - Add/update tracking URL
- Search/filter functionality

#### Inventory Tab
- View all inventory items
- See stock levels and status:
  - In Stock (green)
  - Low Stock (yellow, < 10 units)
  - Out of Stock (red, 0 units)
- Add new inventory item:
  - Product ID
  - Product name
  - Stock quantity
  - Price
- Edit inventory item:
  - Update stock
  - Update price
  - Update product name
- Delete inventory item
- Automatic status calculation based on stock levels

**API Endpoints Used**:
- `GET /api/orders` - Fetch all orders
- `PUT /api/orders` - Update order (status, tracking)
- `GET /api/inventory` - Fetch all inventory
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory` - Update inventory item
- `DELETE /api/inventory` - Delete inventory item

**Event System**:
The admin page listens for custom events to automatically refresh:
- `order-status-updated` - Refreshes orders when status changes
- `new-order-created` - Refreshes orders when new order is created
- `inventory-updated` - Refreshes inventory when items are updated
- `inventory-deleted` - Refreshes inventory when items are deleted

**Files**:
- `src/pages/Admin.tsx` - Admin dashboard
- `src/utils/adminAuth.ts` - Admin authentication utilities
- `api/orders.ts` - Order endpoints
- `api/inventory.ts` - Inventory endpoints

---

## Authentication System

### Session Management

**Backend**: Database-backed sessions stored in `sessions` table

**Session Lifecycle**:

1. **Creation**: On login or password setup
   - Random session token generated (32 bytes)
   - Stored in database with expiration (30 days)
   - httpOnly, secure, SameSite=Lax cookie set
   - Cookie name: `session_token`
   - Cookie path: `/`

2. **Validation**: On protected route access
   - Cookie read from request
   - Session validated in database
   - Checks expiration (`expires_at`)
   - Updates `last_used_at` timestamp
   - User data returned

3. **Expiration**: Automatic cleanup
   - Expired sessions removed periodically
   - Cookie cleared on expiration
   - Cleanup runs on session validation

**Session Schema**:
```sql
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Files**:
- `api/utils/sessions.ts` - Session utilities
- `api/auth/login.ts` - Creates session on login
- `api/auth/me.ts` - Validates session
- `api/auth/logout.ts` - Deletes session

### Password Security

**Hashing Algorithm**: Argon2id (winner of Password Hashing Competition)

**Configuration**:
- Memory: 64MB
- Time cost: 3 iterations
- Parallelism: 4 threads
- Salt: Auto-generated (included in hash)

**Why Argon2**:
- More resistant to GPU attacks than bcrypt
- Industry standard for new applications
- Winner of Password Hashing Competition (PHC)
- Future-proof

**Password Requirements**:
- Minimum length: 6 characters
- Maximum length: 128 characters
- No complexity requirements (UX-friendly)

**Storage**: Only hashed passwords stored, never plain text

**Files**:
- `api/utils/security.ts` - Password hashing functions

### Token Security

**Password Setup Tokens**:
- **Generation**: 32-byte cryptographically secure random tokens
- **Storage**: SHA-256 hash stored in database (not plain token)
- **Expiration**: 24 hours from creation
- **Single-Use**: Tokens marked `used_at` after successful password set
- **Validation**: Checks expiration and `used_at` before use

**Token Flow**:
1. Token generated: `crypto.randomBytes(32).toString('hex')`
2. Token hashed: `SHA-256(token)` → stored in `password_setup_tokens.token_hash`
3. Plain token returned: Only for email sending (never logged)
4. Token verified: Hash provided token and compare with stored hash
5. Token marked used: `used_at` set to current timestamp on success

**Files**:
- `api/utils/security.ts` - Token generation and hashing

### Rate Limiting

**Endpoints Protected**:
- `POST /api/users?action=set-password` - 5 attempts per 15 minutes per IP/email
- `POST /api/resend-set-password` - 1 attempt per 60 seconds per order/user

**Implementation**: In-memory rate limiting with automatic cleanup

**Rate Limit Key Format**:
- Set password: `set-password:${email}:${ip}`
- Resend email: `resend-set-password:${orderId}:${userId}`

**Response**: HTTP 429 (Too Many Requests) with `retryAfter` header

**Files**:
- `api/utils/security.ts` - Rate limiting utilities

---

## Order & Payment Flow

### Checkout Process

#### Step 1: Cart Review (`/cart`)

**Features**:
- Review all cart items
- Update quantities (increase/decrease buttons)
- Remove items (trash icon)
- Calculate subtotal
- Shipping cost calculation:
  - Free shipping: $150+ order total
  - Standard shipping: $10
  - Express shipping: $30
- Shipping progress meter:
  - Shows progress bar to free shipping threshold
  - Displays remaining amount needed
  - Updates dynamically as cart changes
- "Proceed to Checkout" button
- "Continue Shopping" link

**Cart Storage**: `localStorage` (persists across sessions)

**Files**:
- `src/pages/Cart.tsx` - Cart UI
- `src/utils/cart.ts` - Cart management utilities

#### Step 2: Checkout Form (`/checkout`)

**Shipping Information**:
- Full Name (required, text input)
- Email (required, email input)
- Address Line 1 (required, text input)
- Address Line 2 (optional, text input)
- City (required, text input)
- State/Region (required, text input)
- Postal Code (required, text input)
- Country (required, select dropdown, default: US)

**Payment Information**:
- Card Number (Stripe Elements)
- Expiry Date (MM/YY)
- CVV (3-4 digits)
- Cardholder Name (required)

**Order Summary**:
- Items list (product name, quantity, price)
- Subtotal
- Shipping cost
- Total

**Validation**:
- All required fields validated before submission
- Email format validation
- Card number validation (Stripe)
- Error messages displayed inline

**Files**:
- `src/pages/Checkout.tsx` - Checkout UI and processing

#### Step 3: Order Processing

**Process**:
1. **Order Created** (`POST /api/orders`)
   - Order ID generated: `ORD-${timestamp}-${random}`
   - Order stored in database
   - Status: "gathering" (default)

2. **User Account Auto-Created** (if not logged in)
   - `POST /api/users` called
   - User created if doesn't exist
   - Password setup token generated if user has no password
   - Password setup email sent automatically

3. **Order Linked to User** (if user created)
   - `PUT /api/orders` called to link `userId` to order

4. **Order Confirmation Email Sent** (`POST /api/send-email`)
   - Email sent to customer
   - Includes order details

5. **Cart Cleared**
   - `clearCart()` called
   - localStorage cleared

6. **Redirect to Success Page**
   - `window.location.href = /order-success?orderId=...`
   - Uses full page navigation (refresh-safe)

**Code Flow**:
```typescript
// src/pages/Checkout.tsx
const handleSubmit = async () => {
  // 1. Create order
  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  await addOrder(newOrder);
  
  // 2. Auto-create user if not logged in
  if (!currentUser) {
    const userResponse = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify({ email, name, phone: null })
    });
    const { user, token } = await userResponse.json();
    // Token generated and email sent automatically
  }
  
  // 3. Link order to user
  if (createdUserId) {
    await fetch('/api/orders', {
      method: 'PUT',
      body: JSON.stringify({ orderId, userId: createdUserId })
    });
  }
  
  // 4. Send order confirmation email
  await sendOrderNotificationEmail(orderDetails);
  
  // 5. Clear cart and redirect
  clearCart();
  window.location.href = `/order-success?orderId=${orderId}`;
};
```

**Files**:
- `src/pages/Checkout.tsx` - Checkout UI and processing
- `api/orders.ts` - Order creation endpoint
- `api/users.ts` - User creation endpoint
- `api/utils/email.ts` - Email sending utilities

### Stripe Webhook Processing

**Endpoint**: `POST /api/webhooks/stripe`

**Events Handled**:
- `payment_intent.succeeded`
- `checkout.session.completed`

**Process** (on payment success):

1. **Signature Verification**
   - Validates Stripe webhook signature
   - Uses `STRIPE_WEBHOOK_SECRET`
   - Production: Invalid signatures rejected (no fallback)
   - Development: Fallback for testing

2. **Idempotency Check**
   - Checks if `paymentIntentId` already processed
   - Queries `orders` table for `payment_intent_id`
   - If exists, returns success (no duplicate processing)

3. **Extract Customer Information**
   - Email (required)
   - Name (required)
   - Phone (optional)
   - Shipping address (optional)
   - Payment intent ID (required)
   - Amount and currency

4. **User Upsert**
   - Creates user if doesn't exist
   - Updates name/phone if user exists
   - Returns user ID and password hash status

5. **Address Upsert**
   - Checks for existing address (line1 + postalCode + country)
   - Updates if exists
   - Creates new if doesn't exist
   - Avoids duplicates

6. **Order Creation**
   - Creates order linked to user ID
   - Stores payment intent ID
   - Stores email snapshot
   - Sets status to 'paid'

7. **Password Token Generation**
   - Only if `user.passwordHash` is null
   - Generates 32-byte token
   - Stores SHA-256 hash
   - Sets 24-hour expiration
   - Sends password setup email (retry-safe)

**Idempotency**: Prevents duplicate processing of same payment

**Code Flow**:
```typescript
// api/webhooks/stripe.ts
export default async function handler(req, res) {
  // 1. Verify signature
  const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  
  // 2. Check idempotency
  const alreadyProcessed = await isPaymentProcessed(paymentIntentId);
  if (alreadyProcessed) {
    return res.status(200).json({ success: true, message: 'Payment already processed' });
  }
  
  // 3. Extract customer info
  const { email, name, phone, shippingAddress, paymentIntentId } = extractCustomerInfo(event);
  
  // 4. Upsert user
  const { userId, passwordHash } = await upsertUser(email, name, phone);
  
  // 5. Upsert address
  if (shippingAddress) {
    await upsertShippingAddress(userId, shippingAddress);
  }
  
  // 6. Create order
  const orderId = await createOrder(userId, paymentIntentId, email, amount, currency);
  
  // 7. Generate password token if needed
  const passwordToken = await generatePasswordTokenIfNeeded(userId, passwordHash !== null, email, name);
  
  return res.status(200).json({ success: true, orderId, userId, passwordToken });
}
```

**Files**:
- `api/webhooks/stripe.ts` - Webhook handler

### Order Success Page

**URL**: `/order-success?orderId=...`

**Features**:
- **Order Confirmation**:
  - Title: "Your order is confirmed."
  - Subtitle: "Welcome to your Aether & Stones private vault — a secure space for your shipping details and order tracking."
  - Support line: "We've created your account automatically using your checkout email."

- **Account Status Card** (premium design):
  - **If user needs password**:
    - Title: "Secure your vault"
    - Text: "Set a password to track orders and save delivery details."
    - Primary CTA: "Set password" (links to `/set-password?token=...`)
    - Secondary link: "Resend email"
    - Loading skeleton while fetching status
  - **If user has password**:
    - Title: "Continue to your vault"
    - Text: "Your order has been saved to your vault."
    - Primary CTA: "Go to account"

- **Order Summary**:
  - Order ID
  - Items list
  - Total amount
  - Shipping address

- **Toast Notifications**:
  - "Password setup email sent." (success)
  - "You're already secured." (info)
  - "Something went wrong. Try again." (error)
  - "Please wait before requesting another email." (rate limit)

**Refresh-Safe**: Uses `GET /api/post-purchase-status?orderId=...` to check account status

**Code Flow**:
```typescript
// src/pages/OrderSuccess.tsx
useEffect(() => {
  const fetchStatus = async () => {
    const response = await fetch(`/api/post-purchase-status?orderId=${orderId}`, {
      credentials: 'include'
    });
    const status = await response.json();
    setStatus(status);
  };
  fetchStatus();
}, [orderId]);
```

**Files**:
- `src/pages/OrderSuccess.tsx` - Order success page
- `api/post-purchase-status.ts` - Status check endpoint

---

## Account Management

### Order History (`/account/orders`)

**Features**:
- List all orders for authenticated user
- Sorted by date (newest first)
- Order details:
  - Order ID (e.g., `ORD-1234567890-ABC123`)
  - Date placed (formatted: "Placed on Jan 1, 2024")
  - Status badge (color-coded):
    - "Being Prepared" (accent/blue) - `status: 'gathering'`
    - "Shipped" (informative/cyan) - `status: 'shipped'`
    - "Delivered" (positive/green) - `status: 'delivered'`
  - Total amount (formatted: `$99.99`)
  - Items list:
    - Product name
    - Quantity × Price
    - Subtotal per item
  - Shipping address (full address display)
  - **Tracking information** (if available):
    - Tracking number (displayed as text)
    - Tracking URL (clickable link: "Track your package")
- Empty state:
  - Message: "You haven't placed any orders yet."
  - CTA: "Start Shopping" button
- Loading skeletons while fetching

**API**: `GET /api/orders` (scoped to user via session)

**Files**:
- `src/pages/account/AccountOrders.tsx` - Order history UI
- `api/orders.ts` - Orders endpoint

### Address Management (`/account/addresses`)

**Features**:
- List all saved addresses (shipping/billing)
- Address card display:
  - Type badge (shipping/billing)
  - Full address formatted
  - Edit button
  - Delete button
- Add new address:
  - Form with all address fields
  - Type selector (shipping/billing)
  - Validation on submit
- Edit existing address:
  - Pre-filled form
  - Update on submit
- Delete address:
  - Confirmation dialog (future enhancement)
  - Immediate deletion
- Empty state if no addresses
- Loading skeletons

**Form Fields**:
- Type (required, select: shipping/billing)
- Line 1 (required)
- Line 2 (optional)
- City (required)
- Region/State (required)
- Postal Code (required)
- Country (required, default: US)

**API**:
- `GET /api/addresses` - List addresses
- `POST /api/addresses` - Create address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

**Files**:
- `src/pages/account/AccountAddresses.tsx` - Address management UI
- `api/addresses.ts` - Addresses endpoint

### Profile Management (`/account/profile`)

**Features**:
- View email (read-only, cannot be changed)
- Edit name (required, text input)
- Edit phone number (optional, text input)
- Form validation:
  - Name required
  - Email format (read-only)
  - Phone format (optional)
- Success feedback on save
- Loading skeleton

**API**:
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile

**Files**:
- `src/pages/account/AccountProfile.tsx` - Profile UI
- `api/profile.ts` - Profile endpoint

---

## Admin Backoffice

**Entry Point**: `/admin`

**Authentication**:
- Client-side authentication (sessionStorage)
- Separate from user authentication
- Credentials: `admin@aetherandstones.com` / `admin123`
- **Note**: Should be moved to backend for production security

### Dashboard Tab

**Sales Statistics**:
- Total Revenue (all-time)
- Total Orders (all-time)
- Average Order Value
- Revenue This Month
- Orders This Month
- Comparison with Last Month (percentage change)

**Inventory Overview**:
- Total Products
- Low Stock Alerts (< 10 units)
- Out of Stock Items (0 units)

**Data Source**: Aggregated from orders and inventory APIs

### Orders Tab

**Features**:
- View all orders (not scoped to user)
- Filter by status:
  - All orders
  - Being Prepared (gathering)
  - Shipped
  - Delivered
- Order list display:
  - Order ID
  - Customer name
  - Customer email
  - Date placed
  - Status badge
  - Total amount
- Update order status:
  - Click status badge → dropdown menu
  - Updates via `PUT /api/orders`
  - Real-time refresh via `order-status-updated` event
- Order details modal/section:
  - Customer information
  - Items list (product name, quantity, price)
  - Shipping address
  - Payment information
  - **Tracking information** (editable):
    - Tracking number (text input)
    - Tracking URL (text input)
    - Save button
- Search/filter functionality (future enhancement)

**API Endpoints**:
- `GET /api/orders` - Fetch all orders
- `PUT /api/orders` - Update order (status, trackingNumber, trackingUrl)

**Event System**:
- Listens for `order-status-updated` event
- Automatically refreshes order list

**Files**:
- `src/pages/Admin.tsx` - Admin dashboard
- `api/orders.ts` - Order endpoints

### Inventory Tab

**Features**:
- View all inventory items
- Stock status display:
  - In Stock (green badge, ≥ 10 units)
  - Low Stock (yellow badge, 1-9 units)
  - Out of Stock (red badge, 0 units)
- Inventory list:
  - Product ID
  - Product name
  - Stock quantity
  - Status badge
  - Price
  - Actions (edit/delete)
- Add new inventory item:
  - Product ID (required)
  - Product name (required)
  - Stock quantity (required, number)
  - Price (required, decimal)
- Edit inventory item:
  - Update stock
  - Update price
  - Update product name
- Delete inventory item:
  - Confirmation (future enhancement)
  - Immediate deletion
- Automatic status calculation:
  - Status updated based on stock levels
  - Recalculated on save

**API Endpoints**:
- `GET /api/inventory` - Fetch all inventory
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory` - Update inventory item
- `DELETE /api/inventory?productId=...` - Delete inventory item

**Event System**:
- Listens for `inventory-updated` event
- Listens for `inventory-deleted` event
- Automatically refreshes inventory list

**Files**:
- `src/pages/Admin.tsx` - Admin dashboard
- `api/inventory.ts` - Inventory endpoints

---

## Complete API Documentation

### Base URL

**Development**: `http://localhost:3000/api`  
**Production**: `https://your-domain.com/api`  
**Render Backend**: `https://your-backend.onrender.com/api`

### Authentication

Most endpoints require authentication via session cookie. Exceptions:
- `POST /api/users` (public, for account creation)
- `POST /api/auth/login` (public)
- `GET /api/users?action=validate-token` (public, token-based)

### Authentication Endpoints

#### `POST /api/auth/login`

Login with email and password.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890"
  }
}
```

**Response** (401 Unauthorized):
```json
{
  "error": "Invalid email or password"
}
```

**Sets**: httpOnly session cookie (`session_token`)

**Files**: `api/auth/login.ts`

#### `POST /api/auth/logout`

Logout current user.

**Request**: None (uses session cookie)

**Response** (200 OK):
```json
{
  "success": true
}
```

**Clears**: Session cookie

**Files**: `api/auth/logout.ts`

#### `GET /api/auth/me`

Get current authenticated user.

**Request**: None (uses session cookie)

**Response** (200 OK):
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response** (401 Unauthorized):
```json
{
  "error": "Not authenticated"
}
```

**Requires**: Valid session cookie

**Files**: `api/auth/me.ts`

### User Management Endpoints

#### `POST /api/users`

Create user account (auto-created from checkout).

**Request**:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "password_setup_token_here" // Only if user has no password
}
```

**Response** (200 OK) - User exists:
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "new_token" // Only if user has no password
}
```

**Automatically**:
- Creates password setup token if user has no password
- Sends password setup email

**Files**: `api/users.ts`

#### `POST /api/users?action=set-password`

Set password using token.

**Request**:
```json
{
  "token": "password_setup_token",
  "email": "user@example.com",
  "password": "newpassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Password must be at least 6 characters"
}
```

**Response** (429 Too Many Requests):
```json
{
  "error": "Too many attempts. Please try again later.",
  "retryAfter": 900
}
```

**Creates**: Session automatically (user is logged in)

**Rate Limited**: 5 attempts per 15 minutes per IP/email

**Files**: `api/users.ts`

#### `GET /api/users?action=validate-token`

Validate password setup token and get masked email.

**Query Params**: `token=...`

**Response** (200 OK):
```json
{
  "valid": true,
  "maskedEmail": "u***@example.com",
  "email": "user@example.com" // For API use only
}
```

**Response** (400 Bad Request):
```json
{
  "valid": false,
  "error": "Invalid or expired token"
}
```

**Files**: `api/users.ts`

#### `POST /api/users/resend-password-setup`

Resend password setup email (authenticated users only).

**Request**: None (uses session)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password setup email sent",
  "token": "new_token" // Optional
}
```

**Response** (200 OK) - Already has password:
```json
{
  "success": true,
  "alreadySecured": true,
  "message": "You already have a password set"
}
```

**Requires**: Valid session cookie

**Files**: `api/users/resend-password-setup.ts`

### Order Endpoints

#### `GET /api/orders`

Get orders (all orders if admin, user orders if authenticated).

**Query Params**: `userId=...` (optional, for admin)

**Response** (200 OK):
```json
[
  {
    "id": "order_123",
    "userId": "user_123",
    "customerName": "John Doe",
    "customerEmail": "user@example.com",
    "items": [
      {
        "productId": "1",
        "productName": "Amethyst Power Bracelet",
        "quantity": 2,
        "price": 89.00,
        "stone": "Amethyst",
        "properties": ["Protection", "Intuition"]
      }
    ],
    "shippingAddress": {
      "fullName": "John Doe",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "US"
    },
    "subtotal": 178.00,
    "shippingCost": 10.00,
    "total": 188.00,
    "shippingMethod": "standard",
    "date": "2024-01-01T00:00:00.000Z",
    "status": "paid",
    "trackingNumber": "1Z999AA10123456784",
    "trackingUrl": "https://tracking.example.com/1Z999AA10123456784"
  }
]
```

**Scoped**: User orders if authenticated, all orders if admin

**Files**: `api/orders.ts`

#### `POST /api/orders`

Create new order.

**Request**:
```json
{
  "customerName": "John Doe",
  "customerEmail": "user@example.com",
  "items": [
    {
      "productId": "1",
      "productName": "Amethyst Power Bracelet",
      "quantity": 2,
      "price": 89.00
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  },
  "subtotal": 178.00,
  "shippingCost": 10.00,
  "total": 188.00,
  "shippingMethod": "standard",
  "status": "gathering"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "order": {
    "id": "order_123",
    "date": "2024-01-01T00:00:00.000Z",
    "status": "gathering",
    ...
  }
}
```

**Files**: `api/orders.ts`

#### `PUT /api/orders`

Update order (status, tracking, etc.).

**Request**:
```json
{
  "orderId": "order_123",
  "status": "shipped",
  "userId": "user_123", // Optional, for linking order to user
  "trackingNumber": "1Z999AA10123456784", // Optional
  "trackingUrl": "https://tracking.example.com/1Z999AA10123456784" // Optional
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "order": {
    "id": "order_123",
    "status": "shipped",
    "trackingNumber": "1Z999AA10123456784",
    "trackingUrl": "https://tracking.example.com/1Z999AA10123456784",
    ...
  }
}
```

**Files**: `api/orders.ts`

### Post-Purchase Endpoints

#### `GET /api/post-purchase-status`

Get account status after purchase.

**Query Params**: `orderId=...` OR `paymentIntentId=...`

**Response** (200 OK):
```json
{
  "hasAccount": true,
  "needsPassword": true,
  "emailMasked": "u***@example.com",
  "setPasswordUrl": "/set-password?token=..." // Only if authenticated and needs password
}
```

**Response** (404 Not Found):
```json
{
  "error": "Order not found"
}
```

**Files**: `api/post-purchase-status.ts`

#### `POST /api/resend-set-password`

Resend password setup email for an order.

**Request**:
```json
{
  "orderId": "order_123" // OR "paymentIntentId": "..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password setup email sent"
}
```

**Response** (429 Too Many Requests):
```json
{
  "error": "Please wait before requesting another email",
  "retryAfter": 60
}
```

**Rate Limited**: 1 request per 60 seconds per order/user

**Files**: `api/resend-set-password.ts`

### Profile Endpoints

#### `GET /api/profile`

Get authenticated user's profile.

**Request**: None (uses session)

**Response** (200 OK):
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "passwordHash": "hashed_password_or_null",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Requires**: Valid session cookie

**Files**: `api/profile.ts`

#### `PUT /api/profile`

Update authenticated user's profile.

**Request**:
```json
{
  "name": "John Doe Updated",
  "phone": "+1234567890"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe Updated",
    "phone": "+1234567890"
  }
}
```

**Requires**: Valid session cookie

**Files**: `api/profile.ts`

### Address Endpoints

#### `GET /api/addresses`

Get all addresses for authenticated user.

**Request**: None (uses session)

**Response** (200 OK):
```json
[
  {
    "id": "addr_123",
    "userId": "user_123",
    "type": "shipping",
    "line1": "123 Main St",
    "line2": "Apt 4B",
    "city": "New York",
    "region": "NY",
    "postalCode": "10001",
    "country": "US",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Requires**: Valid session cookie

**Files**: `api/addresses.ts`

#### `POST /api/addresses`

Create new address.

**Request**:
```json
{
  "type": "shipping",
  "line1": "123 Main St",
  "line2": "Apt 4B",
  "city": "New York",
  "region": "NY",
  "postalCode": "10001",
  "country": "US"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "address": {
    "id": "addr_123",
    ...
  }
}
```

**Requires**: Valid session cookie

**Files**: `api/addresses.ts`

#### `PUT /api/addresses/:id`

Update address.

**Request**: Same as POST

**Response** (200 OK):
```json
{
  "success": true,
  "address": {
    "id": "addr_123",
    ...
  }
}
```

**Requires**: Valid session cookie, address must belong to user

**Files**: `api/addresses.ts`

#### `DELETE /api/addresses/:id`

Delete address.

**Request**: None

**Response** (200 OK):
```json
{
  "success": true
}
```

**Requires**: Valid session cookie, address must belong to user

**Files**: `api/addresses.ts`

### Inventory Endpoints

#### `GET /api/inventory`

Get all inventory items.

**Response** (200 OK):
```json
[
  {
    "productId": "1",
    "productName": "Amethyst Power Bracelet",
    "stock": 15,
    "status": "in-stock",
    "price": 89.00
  }
]
```

**Files**: `api/inventory.ts`

#### `POST /api/inventory`

Create inventory item.

**Request**:
```json
{
  "productId": "1",
  "productName": "Amethyst Power Bracelet",
  "stock": 15,
  "price": 89.00
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "item": { ... }
}
```

**Files**: `api/inventory.ts`

#### `PUT /api/inventory`

Update inventory item.

**Request**:
```json
{
  "productId": "1",
  "productName": "Amethyst Power Bracelet",
  "stock": 10,
  "price": 89.00
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "item": { ... }
}
```

**Files**: `api/inventory.ts`

#### `DELETE /api/inventory`

Delete inventory item.

**Query Params**: `productId=...`

**Response** (200 OK):
```json
{
  "success": true
}
```

**Files**: `api/inventory.ts`

### Subscription Endpoints

#### `POST /api/subscriptions`

Subscribe email to newsletter.

**Request**:
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Subscribed successfully"
}
```

**Response** (409 Conflict):
```json
{
  "error": "Email already subscribed"
}
```

**Files**: `api/subscriptions.ts`

### Email Endpoints

#### `POST /api/send-email`

Send order notification email.

**Request**:
```json
{
  "to": "user@example.com",
  "subject": "Order Confirmation",
  "html": "<html>...</html>",
  "text": "Plain text version"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "id": "email_id_from_resend"
}
```

**Files**: `api/send-email.ts`

### Webhook Endpoints

#### `POST /api/webhooks/stripe`

Stripe webhook handler for payment events.

**Request**: Raw Stripe webhook event (with signature header)

**Headers**:
- `stripe-signature`: Webhook signature

**Response** (200 OK):
```json
{
  "success": true,
  "orderId": "order_123",
  "userId": "user_123",
  "email": "user@example.com",
  "passwordToken": "token_here", // Only if user needs password
  "message": "Payment processed successfully"
}
```

**Response** (200 OK) - Idempotent:
```json
{
  "success": true,
  "message": "Payment already processed",
  "paymentIntentId": "pi_123"
}
```

**Events Handled**:
- `payment_intent.succeeded`
- `checkout.session.completed`

**Files**: `api/webhooks/stripe.ts`

---

## Database Schema

### Complete Schema

All tables are created automatically on first API call via `initializeDatabase()`.

### Tables

#### `users`

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

**Fields**:
- `id`: Primary key (format: `user_${timestamp}_${random}`)
- `email`: Unique email address (lowercase, trimmed)
- `name`: User's full name
- `phone`: Phone number (optional)
- `password_hash`: Argon2 hash (nullable, set when password is created)
- `created_at`: Account creation timestamp

#### `addresses`

```sql
CREATE TABLE addresses (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('shipping', 'billing')),
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_type ON addresses(type);
```

**Fields**:
- `id`: Primary key (format: `addr_${timestamp}_${random}`)
- `user_id`: Foreign key to users (CASCADE delete)
- `type`: Address type ('shipping' or 'billing')
- `line1`: Street address line 1
- `line2`: Street address line 2 (optional)
- `city`: City name
- `region`: State/region
- `postal_code`: Postal/ZIP code
- `country`: Country code
- `created_at`: Address creation timestamp

#### `orders`

```sql
CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  email_snapshot VARCHAR(255) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(50) NOT NULL,
  payment_provider VARCHAR(50),
  payment_intent_id VARCHAR(255),
  tracking_number VARCHAR(255),
  tracking_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_payment_intent_id ON orders(payment_intent_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

**Fields**:
- `id`: Primary key (format: `ORD-${timestamp}-${random}` or `order_${timestamp}_${random}`)
- `user_id`: Foreign key to users (nullable, SET NULL on delete)
- `email_snapshot`: Email at time of order (for guest orders)
- `total`: Order total (DECIMAL 10,2)
- `currency`: Currency code (default: 'USD')
- `status`: Order status ('gathering', 'paid', 'shipped', 'delivered')
- `payment_provider`: Payment provider ('stripe')
- `payment_intent_id`: Stripe payment intent ID (for idempotency)
- `tracking_number`: Shipping tracking number (optional)
- `tracking_url`: Shipping tracking URL (optional)
- `created_at`: Order creation timestamp

**Note**: Orders table stores JSON in `items` and `shipping_address` columns (legacy format). New format uses separate columns.

#### `password_setup_tokens`

```sql
CREATE TABLE password_setup_tokens (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_password_setup_tokens_user_id ON password_setup_tokens(user_id);
CREATE INDEX idx_password_setup_tokens_token_hash ON password_setup_tokens(token_hash);
CREATE INDEX idx_password_setup_tokens_expires_at ON password_setup_tokens(expires_at);
```

**Fields**:
- `id`: Primary key (format: `token_${timestamp}_${random}`)
- `user_id`: Foreign key to users (CASCADE delete)
- `token_hash`: SHA-256 hash of token (UNIQUE)
- `expires_at`: Token expiration (24 hours from creation)
- `used_at`: Timestamp when token was used (nullable, single-use)
- `created_at`: Token creation timestamp

#### `sessions`

```sql
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_session_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

**Fields**:
- `id`: Primary key (format: `session_${timestamp}_${random}`)
- `user_id`: Foreign key to users (CASCADE delete)
- `session_token`: Random session token (32 bytes, UNIQUE)
- `expires_at`: Session expiration (30 days from creation)
- `created_at`: Session creation timestamp
- `last_used_at`: Last access timestamp (updated on validation)

#### `inventory`

```sql
CREATE TABLE inventory (
  product_id VARCHAR(255) PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  stock INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields**:
- `product_id`: Primary key (product identifier)
- `product_name`: Product name
- `stock`: Stock quantity (integer)
- `status`: Stock status ('in-stock', 'low-stock', 'out-of-stock')
- `price`: Product price (DECIMAL 10,2)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

#### `subscriptions`

```sql
CREATE TABLE subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  subscribed_at TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL,
  source VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_email ON subscriptions(email);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

**Fields**:
- `id`: Primary key (format: `sub_${timestamp}_${random}`)
- `email`: Subscriber email (UNIQUE)
- `name`: Subscriber name (optional)
- `subscribed_at`: Subscription timestamp
- `status`: Subscription status ('active', 'unsubscribed')
- `source`: Subscription source (e.g., 'footer', 'checkout')
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Database Initialization

Tables are created automatically on first API call:

```typescript
// api/db.ts
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create all tables
    await client.query('CREATE TABLE IF NOT EXISTS users (...)');
    await client.query('CREATE TABLE IF NOT EXISTS addresses (...)');
    // ... etc
  } finally {
    client.release();
  }
}
```

**Manual Setup**: Run `api/db-schema.sql` if needed

---

## Security Implementation

### Password Security

**Hashing Algorithm**: Argon2id

**Configuration**:
- Memory: 64MB
- Time cost: 3 iterations
- Parallelism: 4 threads
- Salt: Auto-generated (included in hash)

**Implementation**:
```typescript
// api/utils/security.ts
import argon2 from 'argon2';

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 64 * 1024, // 64MB
    timeCost: 3,
    parallelism: 4,
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return await argon2.verify(hash, password);
}
```

**Password Requirements**:
- Minimum length: 6 characters
- Maximum length: 128 characters
- No complexity requirements (UX-friendly)

### Token Security

**Password Setup Tokens**:
- **Generation**: `crypto.randomBytes(32).toString('hex')` (64 hex characters)
- **Storage**: SHA-256 hash stored in database
- **Expiration**: 24 hours from creation
- **Single-Use**: Tokens marked `used_at` after successful password set

**Implementation**:
```typescript
// api/utils/security.ts
import crypto from 'crypto';

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
```

**Token Validation**:
1. Check token exists in database
2. Check token not expired (`expires_at > NOW()`)
3. Check token not used (`used_at IS NULL`)
4. Hash provided token and compare with stored hash
5. Mark token as used on success

### Session Security

**Storage**: Database-backed (not JWT)

**Cookie Configuration**:
- **Name**: `session_token`
- **httpOnly**: `true` (prevents XSS)
- **secure**: `true` (HTTPS only in production)
- **sameSite**: `Lax` (CSRF protection)
- **path**: `/`
- **maxAge**: 30 days

**Implementation**:
```typescript
// api/auth/login.ts
res.setHeader('Set-Cookie', serialize('session_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
}));
```

**Session Validation**:
- Validates token exists in database
- Checks expiration
- Updates `last_used_at` timestamp
- Returns user data if valid

### Webhook Security

**Signature Verification**:
- All Stripe webhooks verified using `stripe.webhooks.constructEvent()`
- Uses `STRIPE_WEBHOOK_SECRET` from environment
- Production: Invalid signatures rejected (no fallback)
- Development: Fallback for testing (not recommended)

**Implementation**:
```typescript
// api/webhooks/stripe.ts
const event = stripe.webhooks.constructEvent(
  rawBody,
  req.headers['stripe-signature'],
  STRIPE_WEBHOOK_SECRET
);
```

**Idempotency**:
- Prevents duplicate processing using `payment_intent_id`
- Checks if payment already processed before creating order

### Rate Limiting

**Set-Password Endpoint**:
- **Limit**: 5 attempts per 15 minutes
- **Key**: `set-password:${email}:${ip}`
- **Response**: HTTP 429 with `retryAfter` header

**Resend Email Endpoint**:
- **Limit**: 1 attempt per 60 seconds
- **Key**: `resend-set-password:${orderId}:${userId}`
- **Response**: HTTP 429 with `retryAfter` header

**Implementation**: In-memory Map with automatic cleanup

### Data Protection

**Email Masking**:
- Only masked emails returned to frontend (e.g., `u***@example.com`)
- Full email only used server-side

**Logging**:
- Sensitive data sanitized in logs
- Passwords never logged
- Tokens never logged
- Email addresses truncated (e.g., `abc***`)
- User IDs truncated (e.g., `user_123...`)

**SQL Injection Prevention**:
- Parameterized queries used throughout
- No string concatenation in SQL

**CORS**:
- Configured for specific origins
- Credentials allowed (`credentials: 'include'`)

---

## Email System

### Email Provider: Resend

**API**: `https://api.resend.com/emails`  
**Authentication**: Bearer token (`EMAIL_PROVIDER_KEY` or `RESEND_API_KEY`)

### Email Types

#### 1. Password Setup Email

**Trigger**: User account created (no password)

**Subject**: "Set your password for Aether & Stones"

**Content**:
- HTML template with CTA button
- Plain text fallback
- Setup link: `${APP_URL}/set-password?token=...&email=...`
- Expiration notice: "This link expires in 24 hours."

**Template**:
- Header: Black background with "Aether & Stones" branding
- Body: Light gray background with content
- CTA Button: Black button with white text
- Link Fallback: Plain text link for accessibility
- Footer: Expiration notice

**Retry-Safe**: Checks if token exists and not used before sending

**Files**: `api/utils/email.ts`

#### 2. Order Confirmation Email

**Trigger**: Order created

**Subject**: "Order Confirmation - Aether & Stones"

**Content**:
- Order details
- Items list
- Shipping address
- Total amount
- Order ID

**Files**: `api/send-email.ts`, `src/utils/email.ts`

### Email Configuration

**Environment Variables**:
```bash
EMAIL_PROVIDER_KEY=re_xxxxxxxxxxxxx  # Resend API key
# OR legacy name:
RESEND_API_KEY=re_xxxxxxxxxxxxx

FROM_EMAIL=noreply@yourdomain.com  # Optional, defaults to onboarding@resend.dev
APP_URL=https://your-domain.com    # For password setup links
```

### Email Sending Flow

```typescript
// api/utils/email.ts
export async function sendPasswordSetupEmail(
  email: string,
  name: string,
  token: string,
  tokenHash: string
): Promise<{ success: boolean; id?: string; error?: string; skipped?: boolean }> {
  // 1. Check if token exists and not used (retry-safe)
  const tokenCheck = await query(
    `SELECT id, used_at FROM password_setup_tokens WHERE token_hash = $1`,
    [tokenHash]
  );
  
  if (tokenCheck.rows.length === 0 || tokenCheck.rows[0].used_at) {
    return { success: true, skipped: true }; // Skip if already used
  }
  
  // 2. Generate email content
  const setupUrl = `${APP_URL}/set-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  const html = generatePasswordSetupEmailHTML(name, setupUrl);
  const text = generatePasswordSetupEmailText(name, setupUrl);
  
  // 3. Send via Resend
  return await sendEmailViaResend(
    [email],
    'Set your password for Aether & Stones',
    html,
    text
  );
}
```

---

## Stripe Webhook Integration

### Webhook Endpoint

**URL**: `/api/webhooks/stripe`  
**Method**: `POST`  
**Events**: `payment_intent.succeeded`, `checkout.session.completed`

### Setup Instructions

1. **Create Webhook in Stripe Dashboard**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `checkout.session.completed`
   - Copy webhook signing secret (`whsec_...`)

2. **Set Environment Variable**:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

3. **Test with Stripe CLI**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   stripe trigger payment_intent.succeeded
   ```

### Webhook Processing Flow

1. **Signature Verification**
2. **Idempotency Check**
3. **Extract Customer Info**
4. **Upsert User**
5. **Upsert Address**
6. **Create Order**
7. **Generate Password Token** (if needed)

### Idempotency

Prevents duplicate processing using `payment_intent_id`:

```typescript
const alreadyProcessed = await query(
  'SELECT id FROM orders WHERE payment_intent_id = $1',
  [paymentIntentId]
);
if (alreadyProcessed.rows.length > 0) {
  return { success: true, message: 'Payment already processed' };
}
```

---

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 10.17.0+
- PostgreSQL database (local or Render)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd aetherandstones

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

**Required**:
```bash
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
APP_URL=http://localhost:3000
EMAIL_PROVIDER_KEY=re_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Optional**:
```bash
SESSION_SECRET=random_32_byte_hex_string
FROM_EMAIL=noreply@yourdomain.com
NODE_ENV=development
VITE_API_URL=http://localhost:3000/api
```

### Running Locally

```bash
# Start development server
pnpm dev

# Run linter
pnpm lint

# Run tests
pnpm test

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Database Setup

1. **Create Database**: Create PostgreSQL database (local or Render)
2. **Set DATABASE_URL**: Add connection string to `.env`
3. **Auto-Initialization**: Tables created automatically on first API call
4. **Manual Setup**: Or run `api/db-schema.sql` manually

---

## Deployment Guide

### Vercel Deployment (Recommended)

**Frontend + API**: Deploy to Vercel

1. **Connect Repository**:
   - Connect GitHub repository to Vercel
   - Vercel auto-detects Vite project

2. **Set Environment Variables**:
   - Go to Project → Settings → Environment Variables
   - Add all required variables (see [Environment Variables](#environment-variables))

3. **Deploy**:
   - Automatic deployment on push to main branch
   - Or manual deploy from dashboard

**Configuration**: `vercel.json` defines API routes

### Render Deployment

**Frontend**: Static site deployment  
**Backend**: Web service (Express.js) or use Vercel for API  
**Database**: Render PostgreSQL

See `RENDER-DEPLOY-CHECKLIST.md` for detailed steps.

### Environment Variables (Production)

Set all required variables in deployment platform:
- `DATABASE_URL` (with SSL: `?sslmode=require`)
- `APP_URL` (production URL: `https://your-domain.com`)
- `EMAIL_PROVIDER_KEY` (Resend API key)
- `STRIPE_SECRET_KEY` (live key: `sk_live_...`)
- `STRIPE_WEBHOOK_SECRET` (from Stripe dashboard)
- `SESSION_SECRET` (generate secure random string: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

---

## Testing

### Test Suite

**Framework**: Vitest  
**Coverage**: Token flow, webhook idempotency, password setup

**Run Tests**:
```bash
pnpm test              # Run tests
pnpm test:ui           # Run with UI
pnpm test:coverage     # Run with coverage
```

**Test Files**:
- `api/__tests__/token-flow.test.ts` - Token generation and security
- `api/__tests__/webhook.test.ts` - Webhook processing and idempotency
- `api/__tests__/password-set.test.ts` - Password setup flow

### Test Coverage

- ✅ Token generation and hashing
- ✅ Webhook idempotency
- ✅ User creation flow
- ✅ Password token generation logic
- ✅ Token expiration and single-use enforcement

---

## Monitoring & Logging

### Structured Logging

**Format**: `[timestamp] [LEVEL] message {context}`

**Levels**: info, warn, error, debug

**Specialized Loggers**:
- `logger.webhook()` - Webhook events
- `logger.db()` - Database operations
- `logger.auth()` - Authentication events

**Sanitization**: Sensitive data automatically masked

### Log Patterns

**Success**: `✅ Operation completed`  
**Error**: `❌ Operation failed`  
**Warning**: `⚠️ Warning message`  
**Info**: `ℹ️ Informational message`

### Key Metrics to Monitor

1. **Database Connection**: Check logs for connection errors
2. **Webhook Processing**: Monitor success/failure rates
3. **Email Delivery**: Track email send success rates
4. **Authentication**: Monitor login success/failure rates
5. **Error Rates**: Watch for spikes in error logs

---

## Troubleshooting

### Common Issues

#### Database Connection Fails
- Check `DATABASE_URL` format
- Verify SSL is enabled (`?sslmode=require`)
- Check database is accessible

#### Webhook Signature Verification Fails
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check webhook URL is correct
- Ensure raw body is passed (Vercel config)

#### Email Not Sending
- Verify `EMAIL_PROVIDER_KEY` is set
- Check Resend API key is valid
- Verify `FROM_EMAIL` is verified domain (if custom)

#### Sessions Not Persisting
- Verify `SESSION_SECRET` is set
- Check cookies are set with correct domain
- Verify `APP_URL` matches frontend domain

#### Checkout Redirect Issues
- Uses `window.location.href` for reliable navigation
- Order ID passed as query param for refresh-safe behavior

#### Password Setup Email Not Received
- Check Resend dashboard for delivery status
- Verify `APP_URL` is set correctly
- Check token was generated (check database)
- Verify email address is correct

---

## File Structure

```
aetherandstones/
├── api/                          # Backend API (Vercel serverless functions)
│   ├── __tests__/               # API tests
│   │   ├── token-flow.test.ts
│   │   ├── webhook.test.ts
│   │   └── password-set.test.ts
│   ├── auth/                    # Authentication endpoints
│   │   ├── login.ts
│   │   ├── logout.ts
│   │   └── me.ts
│   ├── users/                   # User management
│   │   └── resend-password-setup.ts
│   ├── webhooks/                # Webhook handlers
│   │   └── stripe.ts
│   ├── utils/                   # Backend utilities
│   │   ├── email.ts            # Email sending
│   │   ├── security.ts         # Password hashing, tokens
│   │   ├── sessions.ts         # Session management
│   │   ├── logger.ts           # Structured logging
│   │   ├── env.ts              # Environment validation
│   │   └── startup.ts          # Startup validation
│   ├── types/                   # TypeScript types
│   │   └── database.ts
│   ├── db.ts                    # Database connection
│   ├── db-schema.sql            # Database schema
│   ├── orders.ts                # Order endpoints
│   ├── users.ts                 # User endpoints
│   ├── profile.ts               # Profile endpoints
│   ├── addresses.ts             # Address endpoints
│   ├── inventory.ts             # Inventory endpoints
│   ├── subscriptions.ts         # Subscription endpoints
│   ├── post-purchase-status.ts  # Post-purchase status
│   ├── resend-set-password.ts   # Resend password email
│   └── send-email.ts            # Email sending endpoint
├── src/
│   ├── components/              # React components
│   │   ├── ui/                  # UI component library
│   │   │   ├── Button.tsx
│   │   │   ├── TextField.tsx
│   │   │   ├── Heading.tsx
│   │   │   ├── Text.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── ...
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── Toast.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── AccountCardSkeleton.tsx
│   │   └── ...
│   ├── pages/                   # Page components
│   │   ├── account/             # Account area
│   │   │   ├── AccountLayout.tsx
│   │   │   ├── AccountOrders.tsx
│   │   │   ├── AccountAddresses.tsx
│   │   │   └── AccountProfile.tsx
│   │   ├── Index.tsx            # Homepage
│   │   ├── Shop.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── OrderSuccess.tsx
│   │   ├── SetPassword.tsx
│   │   ├── Login.tsx
│   │   ├── Admin.tsx
│   │   └── ...
│   ├── utils/                    # Frontend utilities
│   │   ├── auth.ts              # Authentication utilities
│   │   ├── cart.ts              # Cart management
│   │   ├── orders.ts            # Order utilities
│   │   ├── products.ts          # Product utilities
│   │   └── ...
│   ├── data/                     # Static data
│   │   ├── products.ts
│   │   └── copy.ts
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # Entry point
├── public/                        # Static assets
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json                   # Vercel configuration
├── render.yaml                   # Render configuration
└── README.md                     # This file
```

---

## Key Technical Decisions

### Why Database-Backed Sessions?
- **Security**: Sessions stored server-side, not in JWT
- **Revocation**: Can invalidate sessions immediately
- **Scalability**: Works across multiple server instances
- **Audit Trail**: Session activity tracked in database

### Why Argon2 for Passwords?
- **Security**: Winner of Password Hashing Competition
- **GPU Resistance**: More resistant to GPU attacks than bcrypt
- **Future-Proof**: Industry standard for new applications

### Why SHA-256 for Tokens?
- **Speed**: Fast hashing suitable for tokens
- **Security**: One-way hash prevents token recovery
- **Storage**: Only hash stored, plain token never persisted

### Why Auto-Create Accounts?
- **UX**: Seamless checkout experience
- **Conversion**: Reduces friction in purchase flow
- **Flexibility**: Users can set password later
- **Security**: Password setup via secure token

### Why Separate Admin Auth?
- **Security**: Admin credentials separate from user data
- **Simplicity**: Client-side auth sufficient for admin (can be upgraded)
- **Isolation**: Admin actions don't affect user sessions

### Why `window.location.href` for Checkout Redirect?
- **Reliability**: Ensures full page navigation
- **Refresh-Safe**: Query params persist on refresh
- **Compatibility**: Works across all browsers

---

## Additional Documentation

- `README-PRODUCTION.md` - Production readiness guide
- `README-SECURITY.md` - Security implementation details
- `README-STRIPE-WEBHOOK.md` - Stripe webhook setup
- `README-EMAIL-SETUP.md` - Email configuration
- `RENDER-DEPLOY-CHECKLIST.md` - Render deployment guide
- `RENDER-POSTGRESQL-SETUP.md` - Database setup guide
- `ADMIN-BACKEND-INTEGRATION.md` - Admin backoffice integration
- `FRONTEND-BACKEND-CONFIG.md` - Frontend-backend configuration

---

## Support

For issues or questions:
1. Check logs in deployment platform dashboard
2. Review error messages in structured logs
3. Verify environment variables
4. Test endpoints individually
5. Check Stripe webhook delivery status
6. Review this documentation

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Maintained by**: Aether & Stones Development Team
