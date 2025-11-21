# 🚀 Installation & Setup Guide

Complete step-by-step guide to get the Smart AGI Accountant Platform running locally.

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- ✅ **npm** or **yarn**
- ✅ **MongoDB Atlas** account ([Sign up free](https://www.mongodb.com/cloud/atlas))
- ✅ **Git** ([Download](https://git-scm.com/))
- ✅ Code editor (VS Code recommended)

---

## Step 1: Clone or Setup Project

If you're reading this, you already have the project files in:

```
c:\Users\PC\Downloads\AGI ACCOUNTANT\
```

---

## Step 2: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**

   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create a Cluster**

   - Click "Build a Database"
   - Choose "Free" (M0) tier
   - Select a cloud provider and region
   - Name your cluster (e.g., "agi-accountant")

3. **Create Database User**

   - Go to "Database Access"
   - Add new database user
   - Choose password authentication
   - Save username and password

4. **Configure Network Access**

   - Go to "Network Access"
   - Add IP Address
   - For development: Choose "Allow access from anywhere" (0.0.0.0/0)
   - For production: Add specific IPs

5. **Get Connection String**
   - Go to "Databases"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `agi-accountant`

---

## Step 3: Backend Setup

### 3.1 Navigate to Backend Directory

```powershell
cd "c:\Users\PC\Downloads\AGI ACCOUNTANT\backend"
```

### 3.2 Install Dependencies

```powershell
npm install
```

This will install all required packages (Express, MongoDB, JWT, etc.)

### 3.3 Configure Environment Variables

```powershell
# Copy example env file
Copy-Item .env.example .env

# Open .env in your editor
notepad .env
```

**Edit the `.env` file with your actual values:**

```env
NODE_ENV=development
PORT=5000
API_VERSION=v1

# MongoDB - Paste your connection string here
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/agi-accountant?retryWrites=true&w=majority

# JWT Secrets - Generate random strings
JWT_SECRET=generate-a-very-long-random-secret-here
JWT_REFRESH_SECRET=generate-another-long-random-secret-here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Super Admin Credentials - CHANGE THESE!
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=YourSecurePassword123!
SUPER_ADMIN_2FA_SECRET=

# Frontend URL
FRONTEND_URL=http://localhost:3000

# CORS Origins
CORS_ORIGINS=http://localhost:3000

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# M-Pesa (Use sandbox for development)
MPESA_CONSUMER_KEY=your-mpesa-key
MPESA_CONSUMER_SECRET=your-mpesa-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=http://localhost:5000/api/v1/payments/mpesa/callback
MPESA_ENVIRONMENT=sandbox

# PayPal (Use sandbox for development)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
PAYPAL_MODE=sandbox

# OpenAI (for AI Assistant)
OPENAI_API_KEY=sk-your-openai-api-key
AI_MODEL=gpt-4-turbo-preview

# Sentry (Optional - for error tracking)
SENTRY_DSN=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Cookie Secret
COOKIE_SECRET=another-random-secret-for-cookies

# Backup
BACKUP_ENABLED=false
BACKUP_SCHEDULE=0 2 * * *
```

### 3.4 Generate Strong Secrets

**For JWT secrets, you can use PowerShell:**

```powershell
# Generate random secret
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).Guid + (New-Guid).Guid))
```

Run this twice to get two different secrets for JWT_SECRET and JWT_REFRESH_SECRET.

### 3.5 Setup Email (Gmail Example)

1. Go to your Gmail account
2. Enable 2-factor authentication
3. Generate an "App Password":
   - Google Account → Security → 2-Step Verification → App passwords
4. Use the generated password in `SMTP_PASSWORD`

### 3.6 Run Backend

**Development mode (with auto-reload):**

```powershell
npm run dev
```

**Production mode:**

```powershell
npm run build
npm start
```

You should see:

```
✅ Super Admin account created successfully
✅ Test Student account created successfully
Server running in development mode on port 5000
```

**Backend is now running at:** http://localhost:5000

**API Documentation:** http://localhost:5000/api-docs

---

## Step 4: Frontend Setup

### 4.1 Open New Terminal

Keep the backend terminal running. Open a new PowerShell window.

### 4.2 Navigate to Frontend Directory

```powershell
cd "c:\Users\PC\Downloads\AGI ACCOUNTANT\frontend"
```

### 4.3 Install Dependencies

```powershell
npm install
```

### 4.4 Configure Environment Variables

```powershell
# Copy example env file
Copy-Item .env.example .env.local

# Open .env.local
notepad .env.local
```

**Edit `.env.local`:**

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-another-random-secret-for-nextauth

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 4.5 Run Frontend

**Development mode:**

```powershell
npm run dev
```

**Production mode:**

```powershell
npm run build
npm start
```

**Frontend is now running at:** http://localhost:3000

---

## Step 5: Verify Installation

### 5.1 Check Backend Health

Open browser and visit:

```
http://localhost:5000/health
```

You should see:

```json
{
  "success": true,
  "message": "AGI Accountant API is running",
  "timestamp": "2025-11-19T...",
  "environment": "development"
}
```

### 5.2 Check Frontend

Visit: http://localhost:3000

You should see the landing page.

### 5.3 Check API Documentation

Visit: http://localhost:5000/api-docs

You should see Swagger API documentation.

---

## Step 6: Test Login

### 6.1 Test Student Account

1. Go to http://localhost:3000
2. Click "Login"
3. Use credentials:
   - **Email**: teststudent@agiaccountant.com
   - **Password**: TestStudent#2025

### 6.2 Super Admin Account

1. Check backend console logs for super admin credentials
2. Login with:
   - **Email**: From your `.env` (SUPER_ADMIN_EMAIL)
   - **Password**: From your `.env` (SUPER_ADMIN_PASSWORD)
3. **2FA**: Check console logs for 2FA secret/QR code
   - Install Google Authenticator or Authy app
   - Scan QR code or enter secret manually
   - Use generated 6-digit code to login

---

## Step 7: Optional API Keys

### 7.1 M-Pesa Daraja API (For Kenyan Payments)

1. Go to https://developer.safaricom.co.ke
2. Create an account
3. Create a new app (Sandbox)
4. Get Consumer Key and Consumer Secret
5. Add to backend `.env`

### 7.2 PayPal Sandbox

1. Go to https://developer.paypal.com
2. Create a sandbox account
3. Create a REST API app
4. Get Client ID and Secret
5. Add to backend `.env`

### 7.3 OpenAI API (For AI Assistant)

1. Go to https://platform.openai.com
2. Create account
3. Generate API key
4. Add to backend `.env` as `OPENAI_API_KEY`

### 7.4 Sentry (Error Tracking)

1. Go to https://sentry.io
2. Create account (free tier available)
3. Create new project
4. Get DSN
5. Add to backend `.env` as `SENTRY_DSN`

---

## Troubleshooting

### Backend won't start

**Problem**: "Cannot connect to MongoDB"

- ✅ Check MongoDB connection string
- ✅ Verify network access settings in MongoDB Atlas
- ✅ Ensure password doesn't contain special characters (URL encode if needed)

**Problem**: "Port 5000 already in use"

- Change PORT in `.env` to 5001 or another available port

### Frontend won't start

**Problem**: "Cannot fetch from API"

- ✅ Ensure backend is running
- ✅ Check `NEXT_PUBLIC_API_URL` in `.env.local`
- ✅ Check CORS settings in backend

**Problem**: Module not found errors

- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall

### MongoDB Issues

**Problem**: "Authentication failed"

- ✅ Double-check username and password
- ✅ Ensure database user has read/write permissions

**Problem**: "Network timeout"

- ✅ Check internet connection
- ✅ Verify IP whitelist in MongoDB Atlas

---

## Development Workflow

### Both running simultaneously

**Terminal 1 (Backend):**

```powershell
cd backend
npm run dev
```

**Terminal 2 (Frontend):**

```powershell
cd frontend
npm run dev
```

### Making Changes

- **Backend changes**: Server auto-reloads with nodemon
- **Frontend changes**: Next.js hot-reloads automatically

---

## Production Deployment

See main README.md for Render (backend) and Vercel (frontend) deployment instructions.

---

## Need Help?

- 📖 Check `README.md` for detailed documentation
- 🔍 Review backend logs in `backend/logs/`
- 📚 Visit API docs at http://localhost:5000/api-docs
- 🐛 Check GitHub Issues

---

## What's Next?

Once everything is running:

1. ✅ Explore the API documentation
2. ✅ Login with test accounts
3. ✅ Test course creation (as admin)
4. ✅ Test payment flow (sandbox mode)
5. ✅ Customize super admin credentials
6. ✅ Add your own content

---

**You're all set! Happy coding! 🎉**
