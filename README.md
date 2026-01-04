# Aether & Stones - E-commerce Platform

A premium e-commerce platform for selling crystal bracelets, built with React, TypeScript, Vite, and PostgreSQL. Features automatic account creation, secure authentication, Stripe payment processing, and a comprehensive admin backoffice.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [User Flows](#user-flows)
- [Authentication System](#authentication-system)
- [Order & Payment Flow](#order--payment-flow)
- [Account Management](#account-management)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [Development Setup](#development-setup)
- [Deployment](#deployment)
- [File Structure](#file-structure)

## Overview

Aether & Stones is a full-stack e-commerce application that provides:

- **Product Catalog**: Browse and view crystal bracelets with detailed information
- **Shopping Cart**: Add products to cart, manage quantities
- **Checkout**: Secure payment processing via Stripe
- **Automatic Account Creation**: Accounts are auto-created on purchase
- **Password Setup Flow**: Secure password setup via email token
- **User Accounts**: Order history, saved addresses, profile management
- **Admin Backoffice**: Order management, inventory control
- **Email Notifications**: Order confirmations and password setup emails

## Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **UI Components**: React Spectrum S2 (Adobe Design System)
- **Styling**: Spectrum 2 style macro with CSS-in-JS
- **State Management**: React hooks (useState, useEffect, Context API)
- **Client Storage**: localStorage for cart, sessionStorage for admin auth

### Backend
- **Runtime**: Node.js (Vercel Serverless Functions)
- **Database**: PostgreSQL (Render)
- **ORM**: Raw SQL queries with `pg` library
- **Authentication**: DB-backed sessions with httpOnly cookies
- **Payment Processing**: Stripe API
- **Email Service**: Resend API

### Database
- **Provider**: Render PostgreSQL
- **Connection**: SSL-enabled connection pool
- **Schema**: See [Database Schema](#database-schema) section

## Technology Stack

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^7.11.0",
  "@react-spectrum/s2": "Spectrum 2 components",
  "vite": "^5.2.0"
}
```

### Backend Dependencies
```json
{
  "pg": "^8.11.3",
  "stripe": "^20.1.0",
  "argon2": "^0.44.0",
  "cookie": "^1.1.1",
  "@vercel/node": "^3.2.29"
}
```

## User Flows

### 1. Shopping Flow

**Path**: `/` → `/shop` → `/product/:id` → `/cart` → `/checkout` → `/order-success`

1. **Browse Products** (`/shop`)
   - View product grid
   - Filter by properties
   - Click product card to view details

2. **Product Detail** (`/product/:id`)
   - View product images, description, properties
   - Select stone type, quantity
   - Add to cart
   - See cart count badge

3. **Shopping Cart** (`/cart`)
   - Review items
   - Update quantities
   - Remove items
   - See shipping threshold progress
   - Proceed to checkout

4. **Checkout** (`/checkout`)
   - Fill shipping information
   - Enter payment details (Stripe)
   - Submit order
   - Order processed, account auto-created if needed
   - Redirect to order success page

5. **Order Success** (`/order-success`)
   - Order confirmation
   - Account creation notification
   - Password setup prompt (if needed)
   - Link to account vault

### 2. Authentication Flow

#### Account Auto-Creation (Post-Purchase)

**Trigger**: User completes checkout

**Process**:
1. Checkout form collects: email, name, shipping address
2. Order is created in database
3. User account is auto-created (if doesn't exist)
4. Password setup token is generated (if user has no password)
5. Password setup email is sent via Resend
6. User redirected to order success page

**Files**:
- `src/pages/Checkout.tsx` - Creates user via `POST /api/users`
- `api/users.ts` - User creation endpoint
- `api/utils/email.ts` - Sends password setup email

#### Password Setup Flow

**Entry Point**: Email link `/set-password?token=...&email=...`

**Process**:
1. User clicks email link
2. Token is validated (`GET /api/users?action=validate-token`)
3. Masked email is displayed
4. User enters password (min 6 characters)
5. Password is set (`POST /api/users?action=set-password`)
6. Session is created automatically
7. Success state shown: "Vault secured"
8. Auto-redirect to `/account/orders` after ~1 second

**Files**:
- `src/pages/SetPassword.tsx` - Password setup UI
- `api/users.ts` - Password setting endpoint (creates session)

#### Login Flow

**Entry Point**: `/login`

**Process**:
1. User enters email and password
2. Credentials verified (`POST /api/auth/login`)
3. Session created in database
4. httpOnly session cookie set
5. Redirect to `/account` or `redirectTo` param

**Files**:
- `src/pages/Login.tsx` - Login UI
- `api/auth/login.ts` - Login endpoint
- `src/utils/auth.ts` - Frontend auth utilities

#### Logout Flow

**Process**:
1. User clicks logout button
2. `POST /api/auth/logout` called
3. Session deleted from database
4. Session cookie cleared
5. Redirect to home page

**Files**:
- `api/auth/logout.ts` - Logout endpoint
- `src/utils/auth.ts` - Frontend logout utility

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
- Redirects to `/login` if not authenticated

**Files**:
- `src/pages/account/AccountLayout.tsx` - Account layout with navigation
- `src/pages/account/AccountOrders.tsx` - Order history
- `src/pages/account/AccountAddresses.tsx` - Address management
- `src/pages/account/AccountProfile.tsx` - Profile management
- `src/components/ProtectedRoute.tsx` - Route protection

### 4. Admin Flow

**Entry Point**: `/admin`

**Features**:
- View all orders
- Update order status
- Manage inventory (CRUD operations)
- View order details

**Authentication**:
- Client-side authentication (sessionStorage)
- Separate from user authentication
- Credentials: `admin@aetherandstones.com` / `admin123`

**Files**:
- `src/pages/Admin.tsx` - Admin dashboard
- `src/utils/adminAuth.ts` - Admin authentication utilities

## Authentication System

### Session Management

**Backend**: Database-backed sessions stored in `sessions` table

**Session Lifecycle**:
1. **Creation**: On login or password setup
   - Random session token generated
   - Stored in database with expiration (30 days)
   - httpOnly, secure, SameSite=Lax cookie set

2. **Validation**: On protected route access
   - Cookie read from request
   - Session validated in database
   - `last_used_at` updated
   - User data returned

3. **Expiration**: Automatic cleanup
   - Expired sessions removed periodically
   - Cookie cleared on expiration

**Files**:
- `api/utils/sessions.ts` - Session utilities
- `api/auth/login.ts` - Creates session on login
- `api/auth/me.ts` - Validates session
- `api/auth/logout.ts` - Deletes session

### Password Security

**Hashing**: Argon2id (winner of Password Hashing Competition)

**Configuration**:
- Memory: 64MB
- Time cost: 3 iterations
- Parallelism: 4 threads

**Token Security**:
- Password setup tokens: 32-byte random tokens
- Stored as SHA-256 hash in database
- Single-use (marked `used_at` after use)
- 24-hour expiration

**Files**:
- `api/utils/security.ts` - Password hashing and token generation

### Rate Limiting

**Endpoints Protected**:
- `POST /api/users?action=set-password` - 5 attempts per 15 minutes
- `POST /api/resend-set-password` - 1 attempt per 60 seconds

**Implementation**: In-memory rate limiting with cleanup

**Files**:
- `api/utils/security.ts` - Rate limiting utilities

## Order & Payment Flow

### Checkout Process

**Step 1: Cart Review** (`/cart`)
- User reviews items
- Calculates subtotal, shipping
- Shows free shipping threshold progress

**Step 2: Checkout Form** (`/checkout`)
- Collects shipping information:
  - Full name
  - Email
  - Address, city, state, postal code, country
- Collects payment information (Stripe)
- Validates all fields

**Step 3: Order Processing**
1. Order created in database (`POST /api/orders`)
2. User account auto-created if needed (`POST /api/users`)
3. Order linked to user account
4. Password setup token generated (if no password)
5. Order confirmation email sent (`POST /api/send-email`)
6. Cart cleared
7. Redirect to `/order-success`

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
1. **Signature Verification**: Validates Stripe webhook signature
2. **Idempotency Check**: Checks if `paymentIntentId` already processed
3. **User Upsert**: Creates or updates user by email
4. **Address Upsert**: Creates or updates shipping address (deduplicates)
5. **Order Creation**: Creates order linked to user
6. **Password Token**: Generates token if user has no password
7. **Email Sending**: Sends password setup email (retry-safe)

**Idempotency**: Prevents duplicate processing of same payment

**Files**:
- `api/webhooks/stripe.ts` - Webhook handler

### Order Success Page

**URL**: `/order-success`

**Features**:
- Order confirmation message
- Account creation notification
- Premium "Complete your account" card:
  - **If needs password**: "Secure your vault" card with "Set password" CTA
  - **If has password**: "Continue to your vault" card with "Go to account" CTA
- Order summary display
- Resend password setup email functionality

**Refresh-Safe**: Uses `GET /api/post-purchase-status` to check account status

**Files**:
- `src/pages/OrderSuccess.tsx` - Order success page
- `api/post-purchase-status.ts` - Status check endpoint

## Account Management

### Order History (`/account/orders`)

**Features**:
- List all orders for authenticated user
- Order details: date, status, total, items, shipping address
- Status badges: "Being Prepared", "Shipped", "Delivered"
- Empty state with "Start Shopping" CTA
- Loading skeletons

**API**: `GET /api/orders` (scoped to user via session)

**Files**:
- `src/pages/account/AccountOrders.tsx` - Order history UI
- `api/orders.ts` - Orders endpoint

### Address Management (`/account/addresses`)

**Features**:
- List all saved addresses (shipping/billing)
- Add new address
- Edit existing address
- Delete address
- Form validation
- Empty state

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
- View email (read-only)
- Edit name
- Edit phone number
- Form validation
- Success feedback

**API**:
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile

**Files**:
- `src/pages/account/AccountProfile.tsx` - Profile UI
- `api/profile.ts` - Profile endpoint

## API Documentation

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

**Response**:
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

**Sets**: httpOnly session cookie

#### `POST /api/auth/logout`
Logout current user.

**Response**: `{ "success": true }`

**Clears**: Session cookie

#### `GET /api/auth/me`
Get current authenticated user.

**Response**:
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

**Requires**: Valid session cookie

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

**Response**:
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

**Response**:
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

**Creates**: Session automatically (user is logged in)

#### `GET /api/users?action=validate-token`
Validate password setup token and get masked email.

**Query Params**: `token=...`

**Response**:
```json
{
  "valid": true,
  "maskedEmail": "u***@example.com",
  "email": "user@example.com" // For API use only
}
```

#### `POST /api/users/resend-password-setup`
Resend password setup email (authenticated users only).

**Response**:
```json
{
  "success": true,
  "message": "Password setup email sent",
  "token": "new_token" // Optional
}
```

### Order Endpoints

#### `GET /api/orders`
Get orders (all orders if admin, user orders if authenticated).

**Query Params**: `userId=...` (optional)

**Response**:
```json
[
  {
    "id": "order_123",
    "userId": "user_123",
    "customerName": "John Doe",
    "customerEmail": "user@example.com",
    "items": [...],
    "total": 99.99,
    "status": "paid",
    "date": "2024-01-01T00:00:00.000Z"
  }
]
```

#### `POST /api/orders`
Create new order.

**Request**:
```json
{
  "customerName": "John Doe",
  "customerEmail": "user@example.com",
  "items": [...],
  "shippingAddress": {...},
  "total": 99.99,
  "shippingMethod": "standard"
}
```

#### `PUT /api/orders`
Update order (status, etc.).

**Request**:
```json
{
  "orderId": "order_123",
  "status": "shipped",
  "userId": "user_123" // Optional, for linking order to user
}
```

### Post-Purchase Endpoints

#### `GET /api/post-purchase-status`
Get account status after purchase.

**Query Params**: `orderId=...` or `paymentIntentId=...`

**Response**:
```json
{
  "hasAccount": true,
  "needsPassword": true,
  "emailMasked": "u***@example.com",
  "setPasswordUrl": "/set-password?token=..." // Only if authenticated and needs password
}
```

#### `POST /api/resend-set-password`
Resend password setup email for an order.

**Request**:
```json
{
  "orderId": "order_123" // or "paymentIntentId": "..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password setup email sent"
}
```

**Rate Limited**: 1 request per 60 seconds per order/user

### Profile Endpoints

#### `GET /api/profile`
Get authenticated user's profile.

**Response**:
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

#### `PUT /api/profile`
Update authenticated user's profile.

**Request**:
```json
{
  "name": "John Doe Updated",
  "phone": "+1234567890"
}
```

### Address Endpoints

#### `GET /api/addresses`
Get all addresses for authenticated user.

**Response**:
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

#### `PUT /api/addresses/:id`
Update address.

**Request**: Same as POST

#### `DELETE /api/addresses/:id`
Delete address.

### Inventory Endpoints

#### `GET /api/inventory`
Get all inventory items.

#### `POST /api/inventory`
Create inventory item.

#### `PUT /api/inventory`
Update inventory item.

#### `DELETE /api/inventory`
Delete inventory item.

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

## Database Schema

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
```

**Indexes**: `idx_users_email`

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
```

**Indexes**: `idx_addresses_user_id`, `idx_addresses_type`

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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**Indexes**: `idx_orders_user_id`, `idx_orders_payment_intent_id`, `idx_orders_status`, `idx_orders_created_at`

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
```

**Indexes**: `idx_password_setup_tokens_user_id`, `idx_password_setup_tokens_token_hash`, `idx_password_setup_tokens_expires_at`

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
```

**Indexes**: `idx_sessions_user_id`, `idx_sessions_session_token`, `idx_sessions_expires_at`

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
```

**Indexes**: `idx_subscriptions_email`, `idx_subscriptions_status`

## Security Features

### Password Security
- **Hashing**: Argon2id (64MB memory, 3 iterations, 4 threads)
- **Minimum Length**: 6 characters
- **Storage**: Only hashed passwords stored, never plain text

### Token Security
- **Generation**: 32-byte cryptographically secure random tokens
- **Storage**: SHA-256 hash stored in database (not plain token)
- **Expiration**: 24 hours
- **Single-Use**: Tokens marked `used_at` after successful password set

### Session Security
- **Storage**: Database-backed sessions (not JWT)
- **Cookies**: httpOnly, secure, SameSite=Lax
- **Expiration**: 30 days (configurable)
- **Rotation**: Session tokens rotated on creation
- **Cleanup**: Expired sessions automatically removed

### Webhook Security
- **Signature Verification**: All Stripe webhooks verified
- **Production Mode**: Invalid signatures rejected (no fallback)
- **Idempotency**: Prevents duplicate processing

### Rate Limiting
- **Password Setup**: 5 attempts per 15 minutes per IP/email
- **Resend Email**: 1 attempt per 60 seconds per order/user
- **Implementation**: In-memory with automatic cleanup

### Data Protection
- **Email Masking**: Only masked emails returned to frontend (e.g., `u***@example.com`)
- **Logging**: Sensitive data sanitized in logs (truncated IDs, masked emails)
- **SQL Injection**: Parameterized queries used throughout
- **CORS**: Configured for specific origins

## Development Setup

### Prerequisites
- Node.js 18+
- pnpm 10.17.0+
- PostgreSQL database (local or Render)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables (see .env.example)
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

**Required**:
```bash
DATABASE_URL=postgresql://user:pass@host:port/db
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

## Deployment

### Vercel (Recommended for API)

**Frontend + API**: Deploy to Vercel

1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

**Configuration**: `vercel.json` defines API routes

### Render (Alternative)

**Frontend**: Static site deployment
**Backend**: Web service (Express.js) or use Vercel for API
**Database**: Render PostgreSQL

See `RENDER-DEPLOY-CHECKLIST.md` for detailed steps.

### Environment Variables (Production)

Set all required variables in deployment platform:
- `DATABASE_URL`
- `APP_URL` (production URL)
- `EMAIL_PROVIDER_KEY`
- `STRIPE_SECRET_KEY` (live key)
- `STRIPE_WEBHOOK_SECRET`
- `SESSION_SECRET` (generate secure random string)

## File Structure

```
aetherandstones/
├── api/                          # Backend API (Vercel serverless functions)
│   ├── __tests__/               # API tests
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
│   │   └── env.ts              # Environment validation
│   ├── db.ts                    # Database connection
│   ├── db-schema.sql            # Database schema
│   ├── orders.ts                # Order endpoints
│   ├── users.ts                 # User endpoints
│   ├── profile.ts               # Profile endpoints
│   ├── addresses.ts             # Address endpoints
│   ├── inventory.ts             # Inventory endpoints
│   ├── subscriptions.ts         # Subscription endpoints
│   ├── post-purchase-status.ts  # Post-purchase status
│   └── resend-set-password.ts   # Resend password email
├── src/
│   ├── components/              # React components
│   │   ├── ui/                  # UI component library
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── Toast.tsx
│   │   └── LoadingSkeleton.tsx
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
│   │   └── Admin.tsx
│   ├── utils/                    # Frontend utilities
│   │   ├── auth.ts              # Authentication utilities
│   │   ├── cart.ts              # Cart management
│   │   ├── orders.ts            # Order utilities
│   │   └── products.ts          # Product utilities
│   ├── data/                     # Static data
│   │   ├── products.ts
│   │   └── copy.ts
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # Entry point
├── public/                        # Static assets
├── package.json
├── vite.config.ts
├── tsconfig.json
└── vercel.json                   # Vercel configuration
```

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

## Testing

### Test Suite
- **Framework**: Vitest
- **Coverage**: Token flow, webhook idempotency, password setup

**Run Tests**:
```bash
pnpm test              # Run tests
pnpm test:ui           # Run with UI
pnpm test:coverage     # Run with coverage
```

**Test Files**:
- `api/__tests__/token-flow.test.ts` - Token generation and security
- `api/__tests__/webhook.test.ts` - Webhook processing
- `api/__tests__/password-set.test.ts` - Password setup flow

## Monitoring & Logging

### Structured Logging
- **Format**: `[timestamp] [LEVEL] message {context}`
- **Levels**: info, warn, error, debug
- **Specialized Loggers**: `logger.webhook()`, `logger.db()`, `logger.auth()`
- **Sanitization**: Sensitive data automatically masked

### Log Patterns
- **Success**: `✅ Operation completed`
- **Error**: `❌ Operation failed`
- **Warning**: `⚠️ Warning message`
- **Info**: `ℹ️ Informational message`

## Troubleshooting

### Common Issues

**Database Connection Fails**
- Check `DATABASE_URL` format
- Verify SSL is enabled (`?sslmode=require`)
- Check database is accessible

**Webhook Signature Verification Fails**
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check webhook URL is correct
- Ensure raw body is passed (Vercel config)

**Email Not Sending**
- Verify `EMAIL_PROVIDER_KEY` is set
- Check Resend API key is valid
- Verify `FROM_EMAIL` is verified domain (if custom)

**Sessions Not Persisting**
- Verify `SESSION_SECRET` is set
- Check cookies are set with correct domain
- Verify `APP_URL` matches frontend domain

## Additional Documentation

- `README-PRODUCTION.md` - Production readiness guide
- `README-SECURITY.md` - Security implementation details
- `README-STRIPE-WEBHOOK.md` - Stripe webhook setup
- `README-EMAIL-SETUP.md` - Email configuration
- `RENDER-DEPLOY-CHECKLIST.md` - Render deployment guide
- `RENDER-POSTGRESQL-SETUP.md` - Database setup guide

## Support

For issues or questions:
1. Check logs in deployment platform dashboard
2. Review error messages in structured logs
3. Verify environment variables
4. Test endpoints individually
5. Check Stripe webhook delivery status

---

**Last Updated**: 2024
**Version**: 1.0.0
