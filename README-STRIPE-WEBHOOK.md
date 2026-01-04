# Stripe Webhook Implementation

## Overview

This document describes the Stripe webhook handler implementation for processing payment success events and automatically creating user accounts, addresses, and orders.

## Webhook Endpoint

**URL**: `/api/webhooks/stripe`  
**Method**: `POST`  
**Events Handled**:
- `payment_intent.succeeded`
- `checkout.session.completed`

## Features

### 1. Payment Success Processing

On payment success, the webhook automatically:

1. **Reads customer information** from Stripe event:
   - Email
   - Name
   - Phone (if available)
   - Shipping address (if available)

2. **Upserts User** by email:
   - Creates user if doesn't exist
   - Updates name/phone if user exists
   - Returns user ID and password hash status

3. **Upserts Shipping Address**:
   - Avoids duplicates (checks: line1 + postalCode + country)
   - Updates existing address if found
   - Creates new address if not found

4. **Creates Order**:
   - Links to user ID
   - Stores payment intent ID
   - Stores email snapshot
   - Sets status to 'paid'

5. **Generates Password Setup Token**:
   - Only if `user.passwordHash` is null (user doesn't have password)
   - Returns plain token (NOT hash) for email sending
   - Token expires in 7 days

### 2. Idempotency

The webhook implements idempotency by checking if `paymentIntentId` was already processed:

```typescript
// If paymentIntentId exists in orders table, skip processing
const alreadyProcessed = await isPaymentProcessed(paymentIntentId);
if (alreadyProcessed) {
  return { success: true, message: 'Payment already processed' };
}
```

### 3. Robust Logging

All operations are logged with emoji prefixes for easy identification:

- ✅ Success operations
- ❌ Errors
- ⚠️ Warnings
- ℹ️ Informational messages
- 🔄 Processing status

## Environment Variables

Required environment variables:

```bash
# Stripe API Key (from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_...

# Stripe Webhook Secret (from Stripe Dashboard > Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...

# Database connection (already configured)
DATABASE_URL=postgresql://...
```

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm add stripe
```

### 2. Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL:
   - **Development**: `https://your-domain.vercel.app/api/webhooks/stripe`
   - **Production**: `https://your-production-domain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `checkout.session.completed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

### 3. Set Environment Variables

**For Vercel:**
```bash
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
```

**For Render:**
Add environment variables in Render dashboard:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### 4. Test the Webhook

You can test the webhook using Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test event
stripe trigger payment_intent.succeeded
```

## Webhook Response

### Success Response

```json
{
  "success": true,
  "orderId": "order_1234567890_abc123",
  "userId": "user_1234567890_xyz789",
  "email": "customer@example.com",
  "passwordToken": "abc123def456...", // Only if user needs password setup
  "message": "Payment processed successfully"
}
```

### Idempotency Response

```json
{
  "success": true,
  "message": "Payment already processed",
  "paymentIntentId": "pi_1234567890"
}
```

### Error Response

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Database Schema

The webhook uses the following database tables:

### Users Table
- `id` - User ID
- `email` - User email (unique)
- `name` - User name
- `phone` - User phone (nullable)
- `password_hash` - Password hash (nullable)

### Addresses Table
- `id` - Address ID
- `user_id` - Foreign key to users
- `type` - 'shipping' or 'billing'
- `line1`, `line2`, `city`, `region`, `postal_code`, `country`

### Orders Table
- `id` - Order ID
- `user_id` - Foreign key to users (nullable)
- `email_snapshot` - Email at time of order
- `total` - Order total
- `currency` - Currency code (e.g., 'USD')
- `status` - Order status ('paid', etc.)
- `payment_provider` - 'stripe'
- `payment_intent_id` - Stripe payment intent ID (indexed)

### Password Setup Tokens Table
- `id` - Token ID
- `user_id` - Foreign key to users
- `token_hash` - SHA-256 hash of token
- `expires_at` - Token expiration
- `used_at` - When token was used (nullable)

## Security

1. **Webhook Signature Verification**: All webhooks are verified using Stripe's signature verification
2. **Token Hashing**: Password setup tokens are hashed (SHA-256) before storage
3. **Idempotency**: Prevents duplicate processing of the same payment
4. **Error Handling**: Comprehensive error handling with detailed logging

## Troubleshooting

### Webhook Signature Verification Fails

If signature verification fails, check:

1. **Webhook Secret**: Ensure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe Dashboard
2. **Raw Body**: Vercel serverless functions may parse the body. The handler includes fallback logic for testing.

### Payment Not Processing

1. Check logs for error messages
2. Verify database connection (`DATABASE_URL`)
3. Ensure tables are initialized (`initializeDatabase()`)
4. Check Stripe Dashboard for webhook delivery status

### User Not Created

1. Verify email is present in Stripe event
2. Check database constraints (email uniqueness)
3. Review logs for specific error messages

## Example Usage

### Frontend Integration

After payment succeeds, Stripe will call the webhook automatically. The frontend should:

1. Redirect user to order success page
2. Show "Set Password" option if `passwordToken` is returned
3. Link to `/set-password?token=...&email=...`

### Email Integration

When `passwordToken` is returned, send an email to the user:

```
Subject: Set Your Password

Hi [Name],

Your order has been confirmed! To track your order and access your account, please set a password:

[Set Password Link]: https://your-domain.com/set-password?token=[token]&email=[email]

This link expires in 7 days.
```

## Notes

- The webhook handler is designed to be **idempotent** - calling it multiple times with the same `paymentIntentId` is safe
- Password tokens are **only generated** if the user doesn't have a password yet
- Addresses are **deduplicated** based on line1 + postalCode + country
- All operations are **transactionally safe** with proper error handling

