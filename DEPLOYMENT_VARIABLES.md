# 🚀 DEPLOYMENT GUIDE - Environment Variables & Steps

## ✅ CODE PUSHED TO GITHUB

Repository: https://github.com/OBUYA123/AGI_ACCOUNTANT.git
Branch: main
Status: ✅ Successfully pushed (70 files, no .env files committed)

---

## 📋 PART 1: BACKEND DEPLOYMENT ON RENDER

### Step-by-Step Instructions:

1. **Go to Render Dashboard**

   - Visit: https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect Repository**

   - Select "Connect a repository"
   - Choose: `OBUYA123/AGI_ACCOUNTANT`
   - Click "Connect"

3. **Configure Service**

   ```
   Name: agi-accountant-backend
   Region: Ohio (or closest to you)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Instance Type: Free (or Starter for production)
   ```

4. **Add Environment Variables** (Click "Advanced" → "Add Environment Variable")

---

### 🔐 BACKEND ENVIRONMENT VARIABLES FOR RENDER

Copy and paste these into Render (one by one or use "Add from .env"):

#### ⚙️ Server Configuration

```
NODE_ENV=production
PORT=5000
API_VERSION=v1
```

#### 💾 Database Configuration

```
MONGODB_URI=mongodb+srv://obuya_123:Admin%401234@cluster0.hcq2ecm.mongodb.net/agi-accountant?retryWrites=true&w=majority
```

#### 🔑 JWT Secrets (GENERATE NEW ONES!)

**IMPORTANT: Generate new secrets for production!**

Run this command to generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Then set:

```
JWT_SECRET=<paste-generated-secret-here>
JWT_REFRESH_SECRET=<paste-another-generated-secret-here>
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

#### 👤 Super Admin Configuration

```
SUPER_ADMIN_EMAIL=superadmin@agiaccountant.com
SUPER_ADMIN_PASSWORD=<create-strong-password>
SUPER_ADMIN_2FA_SECRET=
```

_Note: Leave 2FA secret empty, it will be generated on first run_

#### 🌐 Frontend URL (Update after Vercel deployment!)

```
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGINS=https://your-app.vercel.app
```

_You'll update this after deploying frontend_

#### 📧 Email Configuration (Gmail)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<your-gmail-app-password>
```

**To get Gmail App Password:**

1. Enable 2FA on Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Create app password for "Mail"
4. Copy the 16-character password

#### 💳 M-Pesa Configuration

**For Testing (Sandbox):**

```
MPESA_CONSUMER_KEY=your-sandbox-consumer-key
MPESA_CONSUMER_SECRET=your-sandbox-consumer-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your-sandbox-passkey
MPESA_CALLBACK_URL=https://your-app.onrender.com/api/v1/payments/mpesa/callback
MPESA_ENVIRONMENT=sandbox
```

**For Production:**

- Get credentials from: https://developer.safaricom.co.ke/
- Change `MPESA_ENVIRONMENT=production`
- Use your production shortcode and passkey

#### 💰 PayPal Configuration

**For Testing (Sandbox):**

```
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-secret
PAYPAL_MODE=sandbox
```

**For Production:**

- Get credentials from: https://developer.paypal.com/dashboard/
- Change `PAYPAL_MODE=live`

#### 🤖 AI Configuration (Gemini)

```
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSyCK6kpCtKrhfUpiWONQYvbgsHZ5qsMFBkQ
AI_MODEL=gemini-pro
OPENAI_API_KEY=
```

#### 🔒 Security & Rate Limiting

Generate cookie secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```
COOKIE_SECRET=<paste-generated-secret>
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### 📁 File Upload

```
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

#### 💾 Backup Configuration

```
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
```

#### 📊 Optional: Sentry Error Tracking

```
SENTRY_DSN=<your-sentry-dsn-if-you-want>
```

---

### ✅ Deploy Backend

1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Once deployed, you'll get URL like: `https://agi-accountant-backend.onrender.com`
4. **SAVE THIS URL** - you'll need it for frontend!
5. Test: Visit `https://your-backend.onrender.com/api/v1/health`

---

## 📋 PART 2: FRONTEND DEPLOYMENT ON VERCEL

### Step-by-Step Instructions:

1. **Go to Vercel Dashboard**

   - Visit: https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Repository**

   - Select "Import Git Repository"
   - Choose: `OBUYA123/AGI_ACCOUNTANT`
   - Click "Import"

3. **Configure Project**

   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build (auto-detected)
   Output Directory: .next (auto-detected)
   Install Command: npm install (auto-detected)
   ```

4. **Add Environment Variables**

---

### 🔐 FRONTEND ENVIRONMENT VARIABLES FOR VERCEL

#### 🌐 API Configuration

**CRITICAL: Replace with your actual Render backend URL!**

```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
```

#### 🔐 NextAuth Configuration

**Your Vercel URL (update after first deployment if using custom domain):**

```
NEXTAUTH_URL=https://your-app.vercel.app
```

**Generate NextAuth secret:**

```bash
openssl rand -base64 32
```

Or on Windows PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

```
NEXTAUTH_SECRET=<paste-generated-secret>
```

#### 🔓 Optional: OAuth Providers

```
GOOGLE_CLIENT_ID=<if-you-want-google-login>
GOOGLE_CLIENT_SECRET=<if-you-want-google-login>
```

---

### ✅ Deploy Frontend

1. Click "Deploy"
2. Wait 3-5 minutes
3. You'll get URL like: `https://your-app.vercel.app`
4. Test by visiting the URL

---

## 🔄 PART 3: UPDATE BACKEND WITH FRONTEND URL

After frontend is deployed:

1. Go back to Render Dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Update these variables:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   CORS_ORIGINS=https://your-app.vercel.app
   ```
5. Click "Save Changes"
6. Render will automatically redeploy

---

## ✅ PART 4: VERIFICATION CHECKLIST

### Backend Tests

- [ ] Visit: `https://your-backend.onrender.com/api/v1/health`
  - Should return: `{"status":"ok","timestamp":"..."}`
- [ ] Visit: `https://your-backend.onrender.com/api-docs`
  - Should show Swagger API documentation
- [ ] Test login endpoint (use Postman/Thunder Client):
  ```
  POST https://your-backend.onrender.com/api/v1/auth/login
  Body: {
    "email": "superadmin@agiaccountant.com",
    "password": "your-super-admin-password"
  }
  ```

### Frontend Tests

- [ ] Visit: `https://your-app.vercel.app`
  - Landing page should load
- [ ] Visit: `https://your-app.vercel.app/login`
  - Login page should load
- [ ] Try logging in with super admin credentials
- [ ] Check dashboard loads after login

### Database Connection

- [ ] Check Render logs for "MongoDB Connected"
- [ ] Check MongoDB Atlas → Network Access
  - Add `0.0.0.0/0` to allow connections from anywhere (or add Render IPs)

---

## 🔧 PART 5: TROUBLESHOOTING

### Backend Issues

**"Can't connect to MongoDB"**

- Solution: MongoDB Atlas → Network Access → Add `0.0.0.0/0`

**"Build failed"**

- Check Render logs for errors
- Verify Node.js version is 18+
- Check all environment variables are set

**"Health check failing"**

- Wait 2-3 minutes after first deployment
- Check logs in Render dashboard
- Verify PORT=5000 is set

### Frontend Issues

**"API calls failing"**

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Check browser console for errors

**"NextAuth error"**

- Verify `NEXTAUTH_URL` matches your Vercel URL
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again

**"Build failed"**

- Check Vercel logs
- Verify all dependencies installed
- Check TypeScript errors

---

## 💰 COST BREAKDOWN

### Free Tier (Testing/Development)

- **Render Free**: 750 hours/month, sleeps after 15 min inactivity
- **Vercel Free**: 100 GB bandwidth, unlimited deployments
- **MongoDB Atlas Free**: 512 MB storage
- **Total**: $0/month

### Production Tier (Recommended)

- **Render Starter**: $7/month (no sleep, always on)
- **Vercel Pro**: $20/month (better performance, analytics)
- **MongoDB Atlas M2**: $9/month (2 GB storage, better performance)
- **Total**: $36/month

---

## 🎯 QUICK REFERENCE

### Your Deployed URLs

```
Backend:  https://your-backend.onrender.com
Frontend: https://your-app.vercel.app
API Docs: https://your-backend.onrender.com/api-docs
```

### Super Admin Login

```
Email: superadmin@agiaccountant.com
Password: <your-production-password>
```

### Test Student Login

```
Email: teststudent@agiaccountant.com
Password: TestStudent#2025
```

---

## 📱 NEXT STEPS AFTER DEPLOYMENT

1. **Test all features**:

   - [ ] Authentication (login/register)
   - [ ] Course browsing
   - [ ] Payment integration (M-Pesa/PayPal)
   - [ ] Accounting tools
   - [ ] AI Assistant

2. **Set up monitoring**:

   - [ ] Enable Render notifications
   - [ ] Enable Vercel notifications
   - [ ] Set up MongoDB Atlas alerts

3. **Optional: Custom Domain**:

   - [ ] Buy domain (Namecheap, GoDaddy, etc.)
   - [ ] Add to Vercel (Frontend)
   - [ ] Add to Render (Backend)
   - [ ] Update environment variables

4. **Production readiness**:
   - [ ] Switch M-Pesa to production mode
   - [ ] Switch PayPal to live mode
   - [ ] Set up email for real domain
   - [ ] Enable HTTPS everywhere
   - [ ] Set up regular backups

---

## 📞 SUPPORT

- **Documentation**: See `PRODUCTION_DEPLOYMENT.md` for detailed guide
- **API Docs**: https://your-backend.onrender.com/api-docs
- **GitHub**: https://github.com/OBUYA123/AGI_ACCOUNTANT

---

## 🎉 CONGRATULATIONS!

Your AGI Accountant Platform is now deployed to production! 🚀

**Remember:**

- Never commit `.env` files (already protected by .gitignore)
- Regularly update dependencies
- Monitor logs for errors
- Back up your MongoDB database
- Keep API keys secure

---

**Deployment Date**: November 21, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
