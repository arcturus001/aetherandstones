# Security Implementation Guide

## Overview

This document describes the security measures implemented for token handling, password hashing, and abuse protection.

## Token Security

### Token Generation
- **Random Token**: Generated using `crypto.randomBytes(32)` (32 bytes = 64 hex characters)
- **Storage**: Only SHA-256 hash is stored in database (never plain token)
- **Expiration**: Tokens expire in **24 hours** (changed from 7 days)
- **Single-Use**: Tokens are marked as `used_at` on successful password setup (enforced)

### Token Flow
1. Token generated: `crypto.randomBytes(32).toString('hex')`
2. Token hashed: `SHA-256(token)` → stored in `password_setup_tokens.token_hash`
3. Plain token returned: Only for email sending (never logged)
4. Token verified: Hash provided token and compare with stored hash
5. Token marked used: `used_at` set to current timestamp on success

## Password Hashing

### Argon2 Implementation
- **Algorithm**: Argon2id (hybrid approach, recommended)
- **Memory Cost**: 64 MB
- **Time Cost**: 3 iterations
- **Parallelism**: 4 threads
- **Why Argon2**: Winner of Password Hashing Competition (PHC), more resistant to GPU attacks than bcrypt

### Password Verification
- Uses `argon2.verify()` for secure password comparison
- Timing-safe comparison prevents timing attacks
- Never stores plain passwords

## Rate Limiting

### Set-Password Endpoint Protection
- **Limit**: 5 attempts per 15 minutes
- **Key**: Combination of email + IP address
- **Response**: HTTP 429 (Too Many Requests) with `retryAfter` header
- **Storage**: In-memory Map (for production, consider Redis)

### Rate Limit Implementation
```typescript
const rateLimitKey = `set-password:${email}:${ip}`;
if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
  return res.status(429).json({ error: 'Too many attempts' });
}
```

## Security Best Practices

### No Sensitive Data in Logs
- **Passwords**: Never logged
- **Tokens**: Never logged (only partial user IDs)
- **Hashes**: Never logged
- **Emails**: Partially masked (e.g., `abc***`)

### Error Messages
- Generic error messages to prevent information leakage
- "Invalid or expired token" (doesn't reveal which)
- "Invalid email or password" (doesn't reveal if email exists)

### Token Validation
- Checks expiration before use
- Checks `used_at` to prevent reuse
- Validates email matches token's user
- All checks happen before password update

## Database Schema

### Password Setup Tokens Table
```sql
CREATE TABLE password_setup_tokens (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,  -- SHA-256 hash
  expires_at TIMESTAMP NOT NULL,            -- 24 hours from creation
  used_at TIMESTAMP,                        -- Set on successful use
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  password_hash VARCHAR(255),                -- Argon2 hash
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Checklist

- ✅ Random token generation (32+ bytes)
- ✅ Token stored as SHA-256 hash only
- ✅ Token expires in 24 hours
- ✅ Token is single-use (used_at enforced)
- ✅ Rate limiting on set-password endpoint
- ✅ Password hashing with Argon2
- ✅ No sensitive secrets in logs
- ✅ Generic error messages
- ✅ Timing-safe password verification

## Environment Variables

Required for security:
```bash
# Database (already configured)
DATABASE_URL=postgresql://...

# Stripe (for webhooks)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Production Recommendations

1. **Rate Limiting**: Consider using Redis for distributed rate limiting
2. **Token Storage**: Consider using a dedicated token service (e.g., Redis with TTL)
3. **Monitoring**: Set up alerts for rate limit violations
4. **Logging**: Use structured logging (e.g., JSON) with log aggregation
5. **Secrets**: Use secret management service (e.g., AWS Secrets Manager, Vault)
6. **HTTPS**: Always use HTTPS in production
7. **CSP**: Implement Content Security Policy headers
8. **CORS**: Restrict CORS to known origins

## Testing Security

### Test Token Expiration
```bash
# Create token, wait 24+ hours, try to use
# Should fail with "Invalid or expired token"
```

### Test Single-Use
```bash
# Use token once successfully
# Try to use same token again
# Should fail with "Invalid or expired token"
```

### Test Rate Limiting
```bash
# Make 6 requests to set-password endpoint within 15 minutes
# 6th request should return 429 Too Many Requests
```

### Test Password Hashing
```bash
# Set password, verify it's stored as Argon2 hash
# Login with correct password (should succeed)
# Login with wrong password (should fail)
```

## Security Audit

Regular security audits should check:
- [ ] Token expiration is enforced
- [ ] Single-use tokens are enforced
- [ ] Rate limiting is working
- [ ] No sensitive data in logs
- [ ] Password hashing uses Argon2
- [ ] Error messages don't leak information
- [ ] HTTPS is enforced
- [ ] Database connections use SSL


