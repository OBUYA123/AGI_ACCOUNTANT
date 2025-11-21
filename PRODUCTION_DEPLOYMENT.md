# Production Deployment Guide

## Overview

This guide covers deploying the AGI Accountant Platform to production:

- **Backend**: Render (https://render.com)
- **Frontend**: Vercel (https://vercel.com)
- **Database**: MongoDB Atlas (already configured)

---

## Prerequisites

1. **GitHub Repository**: Code pushed to https://github.com/OBUYA123/AGI_ACCOUNTANT.git
2. **Accounts Created**:
   - Render account (https://render.com)
   - Vercel account (https://vercel.com)
   - MongoDB Atlas (already set up)

---

## Part 1: Backend Deployment on Render

### Step 1: Create New Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `OBUYA123/AGI_ACCOUNTANT`
4. Configure the service:
   - **Name**: `agi-accountant-backend`
   - **Region**: Choose closest to your users (e.g., Ohio)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or select paid plan for production)

### Step 2: Add Environment Variables in Render

Go to **Environment** tab and add these variables:

#### Server Configuration

```
NODE_ENV=production
PORT=5000
API_VERSION=v1
```

#### MongoDB Configuration

```
MONGODB_URI=mongodb+srv://obuya_123:Admin%401234@cluster0.hcq2ecm.mongodb.net/agi-accountant?retryWrites=true&w=majority
```

#### JWT Configuration (IMPORTANT: Generate new secrets for production!)

```
JWT_SECRET=<generate-strong-random-string-64-chars>
JWT_REFRESH_SECRET=<generate-different-strong-random-string-64-chars>
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

**Generate secrets using:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Super Admin Configuration

```
SUPER_ADMIN_EMAIL=superadmin@agiaccountant.com
SUPER_ADMIN_PASSWORD=<create-new-strong-password>
SUPER_ADMIN_2FA_SECRET=
```

#### Frontend URL (Update after Vercel deployment)

```
FRONTEND_URL=https://your-app-name.vercel.app
CORS_ORIGINS=https://your-app-name.vercel.app
```

#### Email Configuration (Gmail or your SMTP)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<your-gmail-app-password>
```

**To get Gmail App Password:**

1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate app password for "Mail"

#### M-Pesa Configuration (Production)

```
MPESA_CONSUMER_KEY=<your-production-consumer-key>
MPESA_CONSUMER_SECRET=<your-production-consumer-secret>
MPESA_SHORTCODE=<your-production-shortcode>
MPESA_PASSKEY=<your-production-passkey>
MPESA_CALLBACK_URL=https://your-render-app.onrender.com/api/v1/payments/mpesa/callback
MPESA_ENVIRONMENT=production
```

**Get production credentials from Safaricom Daraja Portal:**

- https://developer.safaricom.co.ke/

#### PayPal Configuration (Production)

```
PAYPAL_CLIENT_ID=<your-production-client-id>
PAYPAL_CLIENT_SECRET=<your-production-client-secret>
PAYPAL_MODE=live
```

**Get production credentials from PayPal Developer:**

- https://developer.paypal.com/dashboard/

#### AI Configuration

```
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSyCK6kpCtKrhfUpiWONQYvbgsHZ5qsMFBkQ
AI_MODEL=gemini-pro
OPENAI_API_KEY=<optional-if-you-want-openai-instead>
```

#### Security & Other Settings

```
COOKIE_SECRET=<generate-strong-random-string>
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
```

#### Optional: Sentry (Error Tracking)

```
SENTRY_DSN=<your-sentry-dsn-if-you-want-error-tracking>
```

### Step 3: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Once deployed, note your backend URL: `https://your-app-name.onrender.com`
4. Test health endpoint: `https://your-app-name.onrender.com/api/v1/health`

---

## Part 2: Frontend Deployment on Vercel

### Step 1: Import Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import from GitHub: `OBUYA123/AGI_ACCOUNTANT`
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 2: Add Environment Variables in Vercel

Go to **Settings** → **Environment Variables** and add:

#### API Configuration

```
NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com/api/v1
```

**IMPORTANT**: Replace `your-render-app.onrender.com` with your actual Render backend URL!

#### NextAuth Configuration

```
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=<generate-strong-random-string>
```

**Generate NextAuth secret:**

```bash
openssl rand -base64 32
```

#### Optional: OAuth Providers

```
GOOGLE_CLIENT_ID=<if-you-want-google-login>
GOOGLE_CLIENT_SECRET=<if-you-want-google-login>
```

### Step 3: Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment (3-5 minutes)
3. Once deployed, note your frontend URL: `https://your-app-name.vercel.app`

### Step 4: Update Backend CORS Settings

1. Go back to Render dashboard
2. Update these environment variables with your Vercel URL:
   ```
   FRONTEND_URL=https://your-app-name.vercel.app
   CORS_ORIGINS=https://your-app-name.vercel.app
   ```
3. Render will automatically redeploy

---

## Part 3: Post-Deployment Verification

### Backend Checks

1. ✅ Health endpoint: `https://your-backend.onrender.com/api/v1/health`
2. ✅ API docs: `https://your-backend.onrender.com/api-docs`
3. ✅ Login endpoint: POST `https://your-backend.onrender.com/api/v1/auth/login`

### Frontend Checks

1. ✅ Homepage loads: `https://your-frontend.vercel.app`
2. ✅ Login page works: `https://your-frontend.vercel.app/login`
3. ✅ Can authenticate and access dashboard

### Test Super Admin Login

```
Email: superadmin@agiaccountant.com
Password: <your-production-password>
```

---

## Part 4: Update M-Pesa Callback URL

1. Log into Safaricom Daraja Portal
2. Update your app's callback URL to:
   ```
   https://your-backend.onrender.com/api/v1/payments/mpesa/callback
   ```

---

## Part 5: Custom Domain (Optional)

### For Frontend (Vercel)

1. Go to Vercel project → **Settings** → **Domains**
2. Add your custom domain (e.g., `www.agiaccountant.com`)
3. Update DNS records as instructed by Vercel
4. Update `NEXTAUTH_URL` environment variable to your custom domain

### For Backend (Render)

1. Go to Render service → **Settings** → **Custom Domain**
2. Add your custom domain (e.g., `api.agiaccountant.com`)
3. Update DNS records as instructed by Render
4. Update frontend `NEXT_PUBLIC_API_URL` to use custom domain

---

## Part 6: Monitoring & Maintenance

### Enable Monitoring

1. **Render**: Check logs in dashboard → Logs tab
2. **Vercel**: Check logs in dashboard → Deployments → View Function Logs
3. **MongoDB Atlas**: Monitor database performance and set up alerts

### Set Up Alerts

1. **Render**: Settings → Notifications (for deployment failures)
2. **Vercel**: Settings → Notifications (for build failures)

### Regular Maintenance

- Monitor MongoDB Atlas storage and upgrade plan if needed
- Check Render free tier limits (750 hours/month)
- Review logs for errors weekly
- Keep dependencies updated monthly
- Backup database regularly through MongoDB Atlas

---

## Troubleshooting

### Backend Issues

- **Build fails**: Check Node.js version matches (18+)
- **Database connection fails**: Verify MongoDB URI and whitelist Render IPs in MongoDB Atlas
- **Environment variables**: Double-check all required vars are set

### Frontend Issues

- **API calls fail**: Verify CORS settings and NEXT_PUBLIC_API_URL
- **NextAuth errors**: Check NEXTAUTH_URL and NEXTAUTH_SECRET
- **Build fails**: Clear cache and redeploy

### MongoDB Atlas IP Whitelist

If backend can't connect to MongoDB:

1. Go to MongoDB Atlas → Network Access
2. Add Render's IP ranges or use `0.0.0.0/0` (allow from anywhere) for simplicity

---

## Security Checklist

- [ ] All secrets regenerated for production (JWT, cookie secret, NextAuth)
- [ ] Strong super admin password set
- [ ] Gmail app password configured (not regular password)
- [ ] M-Pesa and PayPal using production credentials (not sandbox)
- [ ] MongoDB Atlas has strong password
- [ ] CORS restricted to frontend domain only
- [ ] Rate limiting enabled
- [ ] HTTPS enforced on both frontend and backend

---

## Cost Estimate

### Free Tier (Development/Testing)

- **Render**: Free (750 hours/month, sleeps after 15 min inactivity)
- **Vercel**: Free (100 GB bandwidth, unlimited deployments)
- **MongoDB Atlas**: Free (512 MB storage)
- **Total**: $0/month

### Production Tier (Recommended)

- **Render**: $7/month (Starter plan, no sleep)
- **Vercel**: $20/month (Pro plan, better performance)
- **MongoDB Atlas**: $9/month (M2 shared cluster)
- **Total**: $36/month

---

## Support

For issues or questions:

- Backend API docs: https://your-backend.onrender.com/api-docs
- GitHub Issues: https://github.com/OBUYA123/AGI_ACCOUNTANT/issues

---

**Deployment Date**: November 21, 2025
**Version**: 1.0.0
