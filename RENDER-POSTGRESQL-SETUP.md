# Render PostgreSQL Setup Guide

This guide will help you set up PostgreSQL database on Render for persistent storage of orders, inventory, and subscriptions.

## Step 1: Create PostgreSQL Database on Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → Select **"PostgreSQL"**
3. **Configure Database**:
   - **Name**: `aetherandstones-db` (or your preferred name)
   - **Database**: `aetherandstones` (or your preferred name)
   - **User**: `aetherandstones_user` (or your preferred name)
   - **Region**: Choose closest to your backend service
   - **PostgreSQL Version**: 15 or 16 (recommended)
   - **Plan**: Free tier is fine for development

4. **Click "Create Database"**

## Step 2: Get Database Connection String

After creating the database:

1. **Click on your database** in the Render dashboard
2. **Find "Connections" section**
3. **Copy the "Internal Database URL"** (for backend service) or **"External Database URL"** (for local development)

The connection string looks like:
```
postgresql://user:password@hostname:5432/database_name
```

## Step 3: Set Environment Variable in Backend Service

1. **Go to your Backend Web Service** in Render dashboard
2. **Navigate to "Environment"** tab
3. **Add Environment Variable**:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the connection string from Step 2
4. **Save Changes**

## Step 4: Database Tables Will Auto-Create

The database tables will be automatically created when your backend service starts:

- `orders` - Stores all orders
- `inventory` - Stores inventory items
- `subscriptions` - Stores email subscriptions

The tables are created automatically by the `initializeDatabase()` function in `api/db.ts` when the first API request is made.

## Step 5: Verify Database Connection

After deploying, you can verify the connection by:

1. **Check Render logs** - Look for "✅ Database tables initialized successfully"
2. **Test API endpoints** - Make a request to `/api/inventory` or `/api/orders`
3. **Check Render PostgreSQL dashboard** - You should see tables created

## Manual Database Setup (Optional)

If you prefer to set up tables manually, you can run the SQL schema:

1. **Go to Render PostgreSQL dashboard**
2. **Click "Connect"** → **"psql"** (or use any PostgreSQL client)
3. **Run the SQL from `api/db-schema.sql`**:

```sql
-- Copy and paste the contents of api/db-schema.sql
```

## Environment Variables Summary

Make sure these are set in your Render backend service:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `RESEND_API_KEY` | Resend API key for emails | `re_...` |

## Troubleshooting

### Database Connection Errors

**Error**: "Connection refused" or "Database does not exist"
- **Solution**: Verify `DATABASE_URL` is set correctly
- Check that database is running in Render dashboard
- Ensure you're using the correct connection string (Internal vs External)

### SSL Connection Errors

**Error**: "SSL connection required"
- **Solution**: The code already handles SSL for Render. If issues persist, check that `DATABASE_URL` includes SSL parameters

### Tables Not Creating

**Error**: Tables don't exist
- **Solution**: Check Render logs for initialization errors
- Manually run `api/db-schema.sql` if needed
- Verify database user has CREATE TABLE permissions

### Connection Pool Errors

**Error**: "Too many clients"
- **Solution**: The pool is configured with max 20 connections. If you need more, adjust in `api/db.ts`

## Local Development

For local development, you can:

1. **Use Render External Database URL** (if allowed)
2. **Or set up local PostgreSQL**:
   ```bash
   # Install PostgreSQL locally
   # Create database
   createdb aetherandstones
   
   # Set environment variable
   export DATABASE_URL="postgresql://localhost:5432/aetherandstones"
   ```

## Data Migration

If you have existing data in JSON files:

1. **Export data** from old system (if any)
2. **Use API endpoints** to import:
   - POST `/api/orders` for each order
   - POST `/api/inventory` for each inventory item
   - POST `/api/subscriptions` for each subscription

## Backup & Recovery

Render PostgreSQL includes automatic backups:
- **Free tier**: Daily backups (7-day retention)
- **Paid tiers**: More frequent backups

To restore:
1. Go to PostgreSQL dashboard
2. Click "Backups" tab
3. Select backup to restore

## Next Steps

After setup:
1. ✅ Database is connected
2. ✅ Tables are created automatically
3. ✅ API endpoints use PostgreSQL
4. ✅ Data persists across deployments
5. ✅ Ready for production use!

## Support

If you encounter issues:
- Check Render service logs
- Verify environment variables
- Test database connection manually
- Review PostgreSQL logs in Render dashboard


