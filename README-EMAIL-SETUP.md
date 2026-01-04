# Password Setup Email Implementation

## Overview

Transactional email service for sending password setup links to users. Uses Resend API and includes retry-safe behavior to prevent duplicate emails.

## Email Template

### Subject
```
Set your password for Aether & Stones
```

### Content
- **HTML Email**: Professional template with CTA button
- **Text Fallback**: Plain text version for email clients that don't support HTML
- **CTA Button**: Links to `${APP_URL}/set-password?token=...&email=...`
- **Expiration Notice**: Mentions 24-hour expiration

## Environment Variables

Required environment variables:

```bash
# Resend API Key (already configured)
RESEND_API_KEY=re_...

# App URL for password setup links
APP_URL=https://your-domain.com
# OR
VITE_APP_URL=https://your-domain.com

# From email address (optional, defaults to onboarding@resend.dev)
FROM_EMAIL=noreply@your-domain.com
```

### Setting APP_URL

**For Vercel:**
```bash
vercel env add APP_URL
# Enter: https://your-domain.vercel.app
```

**For Render:**
Add in Render dashboard:
- Key: `APP_URL`
- Value: `https://your-production-domain.com`

**For Local Development:**
```bash
# In .env file
APP_URL=http://localhost:3000
```

## Retry-Safe Behavior

The email sending function includes retry-safe logic:

1. **Checks if token exists** in database before sending
2. **Checks if token was already used** (`used_at` is set)
3. **Skips sending** if token doesn't exist or was used
4. **Prevents duplicate emails** on webhook retries

### Implementation

```typescript
// Check if token exists and is valid
const tokenCheck = await query(
  `SELECT id, used_at FROM password_setup_tokens WHERE token_hash = $1`,
  [tokenHash]
);

// Skip if token doesn't exist or was used
if (tokenCheck.rows.length === 0 || tokenCheck.rows[0].used_at) {
  return { success: true, skipped: true };
}

// Send email only if token is valid
await sendEmailViaResend(...);
```

## Integration Points

### 1. User Creation (`api/users.ts`)

When a user is created (auto-created from checkout):

```typescript
// Create token
const token = generateToken();
const tokenHash = hashToken(token);
await query(`INSERT INTO password_setup_tokens ...`);

// Send email (retry-safe)
await sendPasswordSetupEmail(email, name, token, tokenHash);
```

### 2. Stripe Webhook (`api/webhooks/stripe.ts`)

When payment succeeds and user needs password setup:

```typescript
// Generate token if user doesn't have password
const passwordToken = await generatePasswordTokenIfNeeded(
  userId,
  passwordHash !== null,
  email,
  name
);
// Email is sent automatically inside generatePasswordTokenIfNeeded
```

## Email Template Structure

### HTML Email
- **Header**: Black background with "Aether & Stones" branding
- **Body**: Light gray background with content
- **CTA Button**: Black button with white text
- **Link Fallback**: Plain text link for accessibility
- **Footer**: Expiration notice

### Text Email
- Plain text version
- Includes setup link
- Includes expiration notice

## Testing

### Test Email Sending

1. **Create a test user**:
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'
```

2. **Check email inbox** for password setup email

3. **Verify link** works: Click button or copy link

### Test Retry-Safe Behavior

1. **Send email** (first time)
2. **Use token** to set password
3. **Retry webhook** or user creation
4. **Verify** no duplicate email sent

### Test APP_URL

1. **Set APP_URL** in environment
2. **Create user** or process payment
3. **Check email** - link should use APP_URL
4. **Click link** - should redirect to your app

## Email Service Details

### Resend API

- **Provider**: Resend (https://resend.com)
- **API Endpoint**: `https://api.resend.com/emails`
- **Authentication**: Bearer token (`RESEND_API_KEY`)
- **Format**: HTML + text fallback

### Email Function

```typescript
sendPasswordSetupEmail(
  email: string,      // Recipient email
  name: string,        // Recipient name
  token: string,       // Plain token (for URL)
  tokenHash: string    // Token hash (for DB check)
): Promise<{
  success: boolean;
  id?: string;         // Resend email ID
  error?: string;
  skipped?: boolean;   // True if skipped (retry-safe)
}>
```

## Error Handling

- **Missing API Key**: Returns error, doesn't crash
- **Resend API Error**: Logs error, returns failure
- **Token Already Used**: Skips sending (retry-safe)
- **Token Not Found**: Skips sending (retry-safe)

## Security

- ✅ **No tokens in logs**: Only partial email addresses logged
- ✅ **HTTPS links**: APP_URL should use HTTPS in production
- ✅ **Token expiration**: 24-hour expiration enforced
- ✅ **Single-use tokens**: Tokens marked as used after password setup
- ✅ **Retry-safe**: Prevents duplicate emails on webhook retries

## Production Checklist

- [ ] Set `APP_URL` environment variable
- [ ] Set `RESEND_API_KEY` environment variable
- [ ] Configure `FROM_EMAIL` (optional, but recommended)
- [ ] Test email delivery
- [ ] Verify links work correctly
- [ ] Test retry-safe behavior
- [ ] Monitor email delivery rates
- [ ] Set up email delivery monitoring/alerts

## Troubleshooting

### Emails Not Sending

1. **Check RESEND_API_KEY**: Ensure it's set and valid
2. **Check APP_URL**: Ensure it's set correctly
3. **Check Resend dashboard**: Look for delivery status
4. **Check logs**: Look for error messages

### Links Not Working

1. **Check APP_URL**: Ensure it matches your domain
2. **Check token**: Ensure token is valid and not expired
3. **Check email encoding**: Ensure URL encoding is correct

### Duplicate Emails

1. **Check retry-safe logic**: Should skip if token used
2. **Check token status**: Verify `used_at` is set
3. **Check webhook retries**: Should be idempotent

## Example Email

```
Subject: Set your password for Aether & Stones

Hi John,

Welcome to Aether & Stones! Your account has been created. 
To access your account and track your orders, please set 
a password by clicking the button below.

[Set Your Password Button]

Or copy and paste this link:
https://your-domain.com/set-password?token=abc123...&email=john@example.com

This link expires in 24 hours.
```

