# Render Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables

Set the following environment variables in Render Dashboard:

#### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Application
APP_URL=https://your-app-name.onrender.com
NODE_ENV=production

# Email Provider (Resend)
EMAIL_PROVIDER_KEY=re_xxxxxxxxxxxxx
# OR use legacy name:
RESEND_API_KEY=re_xxxxxxxxxxxxx

FROM_EMAIL=noreply@yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Session Security
SESSION_SECRET=<generate-random-32-byte-hex-string>
```

#### Generating SESSION_SECRET

```bash
# Generate a secure random secret (32 bytes = 64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. PostgreSQL Database Setup

1. **Create PostgreSQL Database**:
   - Go to Render Dashboard → New → PostgreSQL
   - Choose plan (Free tier available)
   - Note the connection string

2. **Verify SSL Connection**:
   - Connection string should include `?sslmode=require`
   - Database connection automatically uses SSL (configured in `api/db.ts`)

3. **Initialize Database Schema**:
   - Database tables are auto-created on first API call
   - Or manually run `api/db-schema.sql` if needed

### 3. Stripe Webhook Configuration

1. **Get Webhook Secret**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Create endpoint: `https://your-app-name.onrender.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `checkout.session.completed`
   - Copy webhook signing secret

2. **Set Environment Variable**:
   - Add `STRIPE_WEBHOOK_SECRET` to Render environment variables

### 4. Email Provider Setup (Resend)

1. **Get API Key**:
   - Sign up at https://resend.com
   - Create API key
   - Verify domain (optional, for custom FROM_EMAIL)

2. **Set Environment Variables**:
   - `EMAIL_PROVIDER_KEY` or `RESEND_API_KEY`
   - `FROM_EMAIL` (defaults to `onboarding@resend.dev` if not set)

## Render Service Configuration

### Backend API Service

Create a **Web Service** in Render:

```yaml
# render.yaml (for reference)
services:
  - type: web
    name: aetherandstones-api
    env: node
    buildCommand: pnpm install
    startCommand: node server.js  # If using Express, or Vercel serverless
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: APP_URL
        sync: false
      - key: EMAIL_PROVIDER_KEY
        sync: false
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false
      - key: SESSION_SECRET
        sync: false
      - key: FROM_EMAIL
        sync: false
      - key: NODE_ENV
        value: production
```

**Note**: If using Vercel serverless functions, you may need to:
- Use Vercel for API deployment
- Or convert to Express.js server for Render

### Frontend Static Site

Create a **Static Site** in Render:

```yaml
services:
  - type: static
    name: aetherandstones
    buildCommand: pnpm build
    staticPublishPath: ./dist
    envVars:
      - key: VITE_API_URL
        value: https://your-api-name.onrender.com/api
```

## Deployment Steps

### Step 1: Database Setup
- [ ] Create PostgreSQL database on Render
- [ ] Copy `DATABASE_URL` connection string
- [ ] Verify SSL is enabled (should be automatic)

### Step 2: Environment Variables
- [ ] Set `DATABASE_URL` in Render dashboard
- [ ] Set `APP_URL` (your frontend URL)
- [ ] Set `EMAIL_PROVIDER_KEY` (Resend API key)
- [ ] Set `FROM_EMAIL` (your verified email)
- [ ] Set `STRIPE_SECRET_KEY` (Stripe live key)
- [ ] Set `STRIPE_WEBHOOK_SECRET` (from Stripe dashboard)
- [ ] Generate and set `SESSION_SECRET` (32-byte random hex)

### Step 3: Backend Deployment
- [ ] Deploy backend API service
- [ ] Verify database connection on startup
- [ ] Check logs for initialization messages
- [ ] Test health endpoint (if available)

### Step 4: Frontend Deployment
- [ ] Set `VITE_API_URL` to backend API URL
- [ ] Deploy static site
- [ ] Verify build succeeds
- [ ] Test frontend loads correctly

### Step 5: Stripe Webhook Setup
- [ ] Create webhook endpoint in Stripe dashboard
- [ ] Set URL: `https://your-api-url.onrender.com/api/webhooks/stripe`
- [ ] Select events: `payment_intent.succeeded`, `checkout.session.completed`
- [ ] Copy webhook secret to `STRIPE_WEBHOOK_SECRET`
- [ ] Test webhook with Stripe CLI or test payment

### Step 6: Verification Tests

#### Database Connection
```bash
# Check logs for:
✅ Database tables initialized successfully
📊 Database SSL: ✅ Enabled (production)
```

#### Environment Variables
```bash
# Check logs for:
📋 Environment Variables Status:
   Required: ✅ All set
```

#### Webhook Signature Verification
- [ ] Send test webhook from Stripe dashboard
- [ ] Verify signature verification succeeds in logs
- [ ] Check for: `✅ Webhook verified: payment_intent.succeeded`

#### Idempotency
- [ ] Send same webhook twice
- [ ] Verify second call returns: `Payment already processed`
- [ ] Check logs for idempotency message

#### Password Token Flow
- [ ] Complete test purchase
- [ ] Verify user created in database
- [ ] Verify password setup email sent
- [ ] Test password setup link works
- [ ] Verify token invalidated after password set

## Post-Deployment Monitoring

### Logs to Monitor

1. **Database Operations**:
   - Look for: `DB INSERT on orders: success`
   - Watch for connection errors

2. **Webhook Processing**:
   - Look for: `Webhook success: payment_intent.succeeded`
   - Watch for signature verification failures

3. **Authentication**:
   - Look for: `Auth login: user_...`
   - Watch for session creation/expiration

4. **Email Sending**:
   - Look for: `✅ Password setup email sent`
   - Watch for email failures

### Health Checks

Monitor these endpoints:
- `/api/auth/me` - Should return 401 if not authenticated
- `/api/profile` - Should return 401 if not authenticated
- `/api/webhooks/stripe` - Should return 405 for GET requests

### Common Issues

1. **Database Connection Fails**:
   - Check `DATABASE_URL` format
   - Verify SSL is enabled
   - Check database is accessible from Render IP

2. **Webhook Signature Verification Fails**:
   - Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
   - Check webhook URL is correct
   - Ensure raw body is passed (Vercel config)

3. **Email Not Sending**:
   - Verify `EMAIL_PROVIDER_KEY` is set
   - Check Resend API key is valid
   - Verify `FROM_EMAIL` is verified domain (if custom)

4. **Sessions Not Persisting**:
   - Verify `SESSION_SECRET` is set
   - Check cookies are set with correct domain
   - Verify `APP_URL` matches frontend domain

## Security Checklist

- [ ] All environment variables set (no defaults in production)
- [ ] `SESSION_SECRET` is unique and secure
- [ ] `STRIPE_SECRET_KEY` is live key (not test)
- [ ] `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- [ ] Database uses SSL connection
- [ ] Webhook signature verification enabled
- [ ] No sensitive data in logs
- [ ] HTTPS enabled (automatic on Render)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled on sensitive endpoints

## Rollback Plan

If deployment fails:

1. **Revert Environment Variables**:
   - Restore previous values in Render dashboard
   - Or use Render's environment variable history

2. **Revert Code**:
   - Use Render's manual deploy → select previous commit
   - Or redeploy previous Git commit

3. **Database Rollback**:
   - Database changes are additive (tables created if not exist)
   - No destructive migrations, safe to rollback code

## Support Resources

- Render Docs: https://render.com/docs
- Stripe Webhooks: https://stripe.com/docs/webhooks
- Resend Docs: https://resend.com/docs
- PostgreSQL on Render: https://render.com/docs/databases

