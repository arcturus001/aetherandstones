# Frontend-Backend Configuration Guide

## API URL Configuration

If your backend is deployed on Render as a separate service, you need to configure the frontend to point to your Render backend URL.

### Option 1: Same Domain (Recommended)

If your frontend and backend are on the same domain (e.g., both on Render or both on Vercel), the default `/api` will work automatically.

### Option 2: Different Domains (Render Backend + Separate Frontend)

If your backend is on Render and frontend is elsewhere, set the `VITE_API_URL` environment variable:

**For Local Development:**
Create a `.env` file in the root directory:
```env
VITE_API_URL=https://your-backend-service.onrender.com/api
```

**For Production (Vercel/Render):**
Set the environment variable in your deployment platform:
- **Vercel**: Dashboard → Project → Settings → Environment Variables
- **Render**: Dashboard → Service → Environment → Add Environment Variable

Key: `VITE_API_URL`
Value: `https://your-backend-service.onrender.com/api`

### Finding Your Render Backend URL

1. Go to Render Dashboard
2. Click on your backend service
3. Copy the service URL (e.g., `https://aetherandstones-api.onrender.com`)
4. Add `/api` to the end: `https://aetherandstones-api.onrender.com/api`

## Testing the Connection

After setting up, test the subscription:

1. Go to your website footer
2. Enter an email address
3. Click "Subscribe"
4. You should see a success message
5. Check your Render PostgreSQL database to verify the email was stored

## Troubleshooting

### Subscribe button doesn't work
- Check browser console for errors
- Verify `VITE_API_URL` is set correctly
- Ensure backend service is running on Render
- Check CORS settings (should be enabled in API endpoints)

### CORS errors
- The API endpoints already have CORS headers configured
- If issues persist, check that your backend URL is correct

### Network errors
- Verify backend service is deployed and running
- Check Render service logs for errors
- Ensure `DATABASE_URL` is set in backend environment variables

