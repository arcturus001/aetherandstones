# Production Readiness Guide

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db?sslmode=require` |
| `APP_URL` | Frontend application URL | `https://your-app.onrender.com` |
| `EMAIL_PROVIDER_KEY` | Resend API key | `re_xxxxxxxxxxxxx` |
| `STRIPE_SECRET_KEY` | Stripe secret key (live) | `sk_live_xxxxxxxxxxxxx` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_xxxxxxxxxxxxx` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SESSION_SECRET` | Session encryption secret | Auto-generated (not persistent) |
| `FROM_EMAIL` | Email sender address | `onboarding@resend.dev` |
| `NODE_ENV` | Environment mode | `development` |

### Legacy Variable Names

For backward compatibility:
- `RESEND_API_KEY` → `EMAIL_PROVIDER_KEY`

## SSL Database Connection

The database connection automatically uses SSL when:
- `DATABASE_URL` does not contain `localhost` or `127.0.0.1`
- Connection string includes `sslmode=require` (recommended)

SSL configuration is handled in `api/db.ts`:
```typescript
ssl: requiresSSL ? {
  rejectUnauthorized: false // Required for Render PostgreSQL
} : false
```

## Webhook Signature Verification

Stripe webhook signature verification is **required in production**:

1. **Signature Verification**: All webhooks are verified using Stripe's signature
2. **Production Mode**: Invalid signatures are rejected (no fallback)
3. **Development Mode**: Allows testing with parsed body (not recommended)

### Configuration

```typescript
// api/webhooks/stripe.ts
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Signature verification
event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
```

### Testing

Use Stripe CLI for local testing:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Idempotency

Webhook idempotency is implemented using `payment_intent_id`:

```typescript
// Check if payment already processed
const alreadyProcessed = await isPaymentProcessed(paymentIntentId);
if (alreadyProcessed) {
  return { success: true, message: 'Payment already processed' };
}
```

**Benefits**:
- Prevents duplicate orders
- Safe webhook retries
- Database integrity

## Monitoring & Logging

### Structured Logging

All logs use structured format with timestamps and context:

```typescript
import { logger } from './utils/logger';

logger.info('Operation completed', { userId: 'user_123' });
logger.error('Operation failed', error, { context: 'value' });
logger.webhook('payment_intent.succeeded', 'evt_123', 'success');
logger.db('INSERT', 'orders', 'success', { orderId: 'order_123' });
logger.auth('login', 'user_123', { email: 'user@example.com' });
```

### Log Levels

- **info**: General information
- **warn**: Warnings that don't stop execution
- **error**: Errors that need attention
- **debug**: Detailed debugging (development only)

### Sensitive Data Protection

All logs automatically sanitize sensitive data:
- Passwords, tokens, secrets are masked
- Email addresses are truncated (e.g., `abc***`)
- User IDs are truncated (e.g., `user_123...`)

## Testing

### Run Tests

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Run with coverage
pnpm test:coverage
```

### Test Coverage

Tests cover:
- ✅ Token generation and hashing
- ✅ Webhook idempotency
- ✅ User creation flow
- ✅ Password token generation logic
- ✅ Token expiration and single-use enforcement

### Test Files

- `api/__tests__/token-flow.test.ts` - Token generation and security
- `api/__tests__/webhook.test.ts` - Webhook processing and idempotency
- `api/__tests__/password-set.test.ts` - Password setup flow

## Security Checklist

- [x] SSL database connection enabled
- [x] Webhook signature verification
- [x] Idempotency for webhook retries
- [x] Password tokens hashed (SHA-256)
- [x] Passwords hashed (Argon2id)
- [x] Session tokens hashed
- [x] Rate limiting on sensitive endpoints
- [x] Sensitive data sanitized in logs
- [x] Environment variable validation
- [x] httpOnly, secure, sameSite cookies

## Deployment

See `RENDER-DEPLOY-CHECKLIST.md` for complete deployment guide.

### Quick Deploy

1. Set environment variables in Render dashboard
2. Deploy backend API service
3. Deploy frontend static site
4. Configure Stripe webhook endpoint
5. Run verification tests

## Monitoring

### Key Metrics to Monitor

1. **Database Connection**: Check logs for connection errors
2. **Webhook Processing**: Monitor success/failure rates
3. **Email Delivery**: Track email send success rates
4. **Authentication**: Monitor login success/failure rates
5. **Error Rates**: Watch for spikes in error logs

### Log Patterns

**Success Patterns**:
- `✅ Webhook verified: payment_intent.succeeded`
- `✅ Password setup email sent`
- `✅ User logged in`

**Error Patterns**:
- `❌ Webhook signature verification failed`
- `❌ Database connection error`
- `❌ Failed to send email`

## Troubleshooting

### Database Connection Issues

**Problem**: `Database connection error`

**Solutions**:
1. Verify `DATABASE_URL` format
2. Check SSL is enabled (`?sslmode=require`)
3. Verify database is accessible from Render IP
4. Check database credentials

### Webhook Signature Verification Fails

**Problem**: `Webhook signature verification failed`

**Solutions**:
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
2. Check webhook URL is correct
3. Ensure raw body is passed (Vercel config)
4. Test with Stripe CLI locally

### Email Not Sending

**Problem**: `Failed to send email`

**Solutions**:
1. Verify `EMAIL_PROVIDER_KEY` is set
2. Check Resend API key is valid
3. Verify `FROM_EMAIL` is verified domain (if custom)
4. Check Resend dashboard for delivery status

## Support

For production issues:
1. Check logs in Render dashboard
2. Review error messages in structured logs
3. Verify environment variables
4. Test endpoints individually
5. Check Stripe webhook delivery status


