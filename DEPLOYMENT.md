# Smart AGI Accountant Platform - Deployment Guide

## Backend Deployment (Render)

### Prerequisites

1. Create account on [Render](https://render.com)
2. MongoDB Atlas cluster set up
3. All API keys ready (OpenAI, M-Pesa, PayPal, Email)

### Steps

1. **Push Code to GitHub**

   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Create New Web Service on Render**

   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure settings:
     - **Name**: `agi-accountant-api`
     - **Region**: Choose closest to your users
     - **Branch**: `main`
     - **Root Directory**: `backend`
     - **Runtime**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Choose appropriate plan

3. **Environment Variables**
   Add all these in Render dashboard:

   ```
   NODE_ENV=production
   PORT=5000

   MONGODB_URI=your_mongodb_atlas_connection_string

   JWT_SECRET=your_super_secret_jwt_key_min_32_chars
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
   JWT_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d

   SUPER_ADMIN_EMAIL=admin@yourdomain.com
   SUPER_ADMIN_PASSWORD=YourSecurePassword#2025!

   FRONTEND_URL=https://your-frontend-domain.vercel.app
   CORS_ORIGINS=https://your-frontend-domain.vercel.app

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password

   MPESA_CONSUMER_KEY=your_mpesa_consumer_key
   MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
   MPESA_SHORTCODE=174379
   MPESA_PASSKEY=your_mpesa_passkey
   MPESA_CALLBACK_URL=https://your-api-domain.onrender.com/api/v1/payments/mpesa/callback
   MPESA_ENVIRONMENT=sandbox

   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   PAYPAL_MODE=sandbox

   OPENAI_API_KEY=your_openai_api_key
   AI_MODEL=gpt-4-turbo-preview

   SENTRY_DSN=your_sentry_dsn (optional)

   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   COOKIE_SECRET=your_cookie_secret_min_32_chars
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy
   - Note your backend URL: `https://your-api-domain.onrender.com`

---

## Frontend Deployment (Vercel)

### Prerequisites

1. Create account on [Vercel](https://vercel.com)
2. Backend API deployed and URL available

### Steps

1. **Update API URL**
   Create `frontend/.env.local`:

   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.onrender.com/api/v1
   NEXTAUTH_URL=https://your-frontend-domain.vercel.app
   NEXTAUTH_SECRET=your_nextauth_secret_min_32_chars
   ```

2. **Push Code to GitHub**

   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial frontend commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

3. **Import to Vercel**

   - Go to Vercel Dashboard
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Next.js
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`

4. **Environment Variables**
   Add in Vercel dashboard:

   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.onrender.com/api/v1
   NEXTAUTH_URL=https://your-frontend-domain.vercel.app
   NEXTAUTH_SECRET=your_nextauth_secret_min_32_chars
   ```

5. **Deploy**

   - Click "Deploy"
   - Vercel will build and deploy
   - Note your frontend URL

6. **Update Backend CORS**
   - Go back to Render dashboard
   - Update `CORS_ORIGINS` and `FRONTEND_URL` with your actual Vercel URL
   - Redeploy backend

---

## Post-Deployment

### 1. Test Super Admin Login

- Go to `https://your-frontend-domain.vercel.app/auth/login`
- Login with super admin credentials from `.env`
- Enable 2FA
- Test all admin features

### 2. Test Student Flow

- Register new student account
- Test payment flow (sandbox mode)
- Access courses and tools
- Test AI assistant

### 3. Configure Domain (Optional)

**For Backend (Render)**:

- Go to Settings → Custom Domain
- Add your domain (e.g., `api.yourdomain.com`)
- Update DNS records as instructed
- Update all environment variables with new domain

**For Frontend (Vercel)**:

- Go to Settings → Domains
- Add your domain (e.g., `www.yourdomain.com`)
- Update DNS records as instructed
- Update backend CORS settings

### 4. Enable Production Mode

**M-Pesa**:

- Switch to production environment
- Update credentials in Render
- Update `MPESA_ENVIRONMENT=production`

**PayPal**:

- Switch to live mode
- Update credentials in Render
- Update `PAYPAL_MODE=live`

### 5. Monitoring

- Set up Sentry error tracking
- Monitor Render logs
- Monitor Vercel analytics
- Set up uptime monitoring (e.g., UptimeRobot)

### 6. Security Checklist

- [ ] Strong JWT secrets (min 32 characters)
- [ ] Strong super admin password
- [ ] HTTPS only (automatic on Render/Vercel)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] 2FA enabled for super admin
- [ ] Environment variables secured
- [ ] MongoDB IP whitelist configured
- [ ] Regular backups scheduled

---

## Troubleshooting

### Backend won't start

- Check Render logs
- Verify MongoDB connection string
- Ensure all required env vars are set

### Frontend can't connect to backend

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on backend
- Ensure backend is running

### Payments not working

- Verify callback URLs are accessible
- Check API credentials
- Review payment service logs

### Emails not sending

- Verify SMTP credentials
- Check email service logs
- Ensure "Less secure apps" enabled for Gmail or use App Password

---

## Useful Commands

```bash
# View Render logs
render logs --tail

# Redeploy backend
git push origin main

# Redeploy frontend
vercel --prod

# Check backend health
curl https://your-api-domain.onrender.com/api/v1/health

# Test API endpoint
curl -X POST https://your-api-domain.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## Support

For issues:

1. Check logs in Render/Vercel dashboards
2. Review environment variables
3. Test API endpoints individually
4. Check database connection
5. Verify all external services (OpenAI, M-Pesa, PayPal, SMTP)
