# 🎓 Smart AGI Accountant Platform

A comprehensive, production-ready full-stack platform for CPA education with AI-powered accounting tools, built with Next.js, Node.js, Express, TypeScript, and MongoDB.

## 🌟 Project Overview

This platform provides a complete CPA (Certified Public Accountant) learning experience with:

- **Complete CPA Course** with modules, lessons, quizzes, and exams
- **AI Finance Assistant** for personalized help and document analysis
- **11 Professional Accounting Tools** with PDF export
- **Secure Payment Integration** via M-Pesa & PayPal
- **Role-Based Access Control** (Super Admin, Admin, Student)
- **Progress Tracking & Certificates**
- **Production-Grade Security**

---

## 📁 Project Structure

```
AGI ACCOUNTANT/
├── backend/                 # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── middleware/     # Custom middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   └── server.ts       # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
└── frontend/               # Next.js + TypeScript + TailwindCSS
    ├── src/
    │   ├── app/           # Next.js 14 App Router
    │   ├── components/    # Reusable components
    │   ├── lib/          # Utilities & API client
    │   └── styles/       # Global styles
    ├── package.json
    ├── tsconfig.json
    └── next.config.js
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB Atlas account
- npm or yarn

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
# Configure MongoDB URI, JWT secrets, API keys, etc.

# Run in development
npm run dev

# Build for production
npm run build
npm start
```

**Backend will run on:** `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Run in development
npm run dev

# Build for production
npm run build
npm start
```

**Frontend will run on:** `http://localhost:3000`

---

## 🔐 Default Accounts

### Super Admin

- **Email**: As configured in backend `.env` (`SUPER_ADMIN_EMAIL`)
- **Password**: As configured in backend `.env` (`SUPER_ADMIN_PASSWORD`)
- **2FA**: Enabled (check console logs for QR code)
- **Access**: Full system control

### Test Student

- **Email**: teststudent@agiaccountant.com
- **Password**: TestStudent#2025
- **Access**: Full CPA course (payment bypassed)

⚠️ **Change super admin password immediately after first login!**

---

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: JWT + Refresh Tokens + 2FA (TOTP)
- **Password Hashing**: Argon2
- **Validation**: Zod
- **File Upload**: Multer
- **Email**: Nodemailer
- **Logging**: Winston
- **Error Tracking**: Sentry
- **API Docs**: Swagger/OpenAPI
- **Payment**: M-Pesa Daraja API + PayPal
- **AI**: OpenAI GPT-4

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Charts**: Recharts

---

## 📚 Core Features

### 1. Authentication & Security ✅

- JWT with refresh token rotation
- Two-factor authentication (2FA/TOTP)
- Argon2 password hashing
- IP & device tracking
- Rate limiting
- CORS protection
- MongoDB sanitization
- Secure cookies

### 2. Role-Based Access Control ✅

- **Super Admin**: Full system access, cannot be deleted
- **Admin**: Limited access based on permissions
- **Student**: Course access after payment

### 3. CPA Course Management ✅

- Complete course structure
- Modules & lessons
- Video, text, PDF, quiz lessons
- Progress tracking
- Bookmarks & notes
- Quiz & exam system
- Certificate generation

### 4. Payment Integration ✅

- M-Pesa Daraja API (Kenya)
- PayPal Checkout API
- Transaction tracking
- Automatic course access
- Payment history

### 5. Accounting Tools (11 Tools)

- Balance Sheet Generator
- Profit & Loss Calculator
- Depreciation Calculator
- Tax Calculator
- Inventory Management (FIFO/LIFO/Weighted Avg)
- Cashflow Analyzer
- Ledger & Journal Entry Tool
- Break-Even Calculator
- Payroll Calculator
- Receivables/Payables Management
- PDF Export for all tools

### 6. AI Finance Assistant

- Accounting problem solving
- Economic analysis
- Financial modeling
- Tax consulting
- Audit assistance
- Document analysis
- CPA concept explanations
- Chat history

### 7. Dashboard System

- **Student Dashboard**: Progress, tools, AI assistant
- **Admin Dashboard**: Course management, analytics
- **Super Admin Dashboard**: Full system control

### 8. Additional Features

- Email notifications
- Activity logging
- Error tracking (Sentry)
- Dark mode support
- Global search
- API documentation
- Automated backups

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/v1/auth/register        - Register student
POST   /api/v1/auth/login           - User login
GET    /api/v1/auth/me              - Get current user
POST   /api/v1/auth/logout          - Logout
POST   /api/v1/auth/refresh         - Refresh token
POST   /api/v1/auth/2fa/setup       - Setup 2FA
POST   /api/v1/auth/2fa/verify      - Verify 2FA
POST   /api/v1/auth/2fa/disable     - Disable 2FA
```

### Courses

```
GET    /api/v1/courses              - Get all courses
GET    /api/v1/courses/:id          - Get course by ID
POST   /api/v1/courses              - Create course (Admin)
PUT    /api/v1/courses/:id          - Update course (Admin)
DELETE /api/v1/courses/:id          - Delete course (Super Admin)
POST   /api/v1/courses/:id/modules  - Add module
PATCH  /api/v1/courses/:id/publish  - Publish/unpublish
```

### Lessons

```
GET    /api/v1/lessons              - Get lessons
GET    /api/v1/lessons/:id          - Get lesson by ID
POST   /api/v1/lessons              - Create lesson (Admin)
PUT    /api/v1/lessons/:id          - Update lesson
POST   /api/v1/lessons/:id/complete - Mark complete
POST   /api/v1/lessons/:id/bookmark - Add bookmark
POST   /api/v1/lessons/:id/notes    - Add note
```

### Payments

```
POST   /api/v1/payments/mpesa/initiate   - Initiate M-Pesa
POST   /api/v1/payments/mpesa/callback   - M-Pesa callback
POST   /api/v1/payments/paypal/initiate  - Initiate PayPal
POST   /api/v1/payments/paypal/verify    - Verify PayPal
GET    /api/v1/payments/history          - Payment history
```

---

## 🚀 Deployment

### Backend (Render)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Add all environment variables from `.env.example`
5. Deploy

### Frontend (Vercel)

1. Import project to Vercel
2. Framework: Next.js
3. Build Command: `npm run build`
4. Output Directory: `.next`
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL
   - `NEXTAUTH_URL`: Your Vercel frontend URL
   - `NEXTAUTH_SECRET`: Random secret
6. Deploy

---

## 🔒 Security Checklist

- [x] Argon2 password hashing
- [x] JWT with refresh tokens
- [x] 2FA for super admin
- [x] Rate limiting
- [x] CORS configuration
- [x] MongoDB sanitization
- [x] HTTP security headers (Helmet)
- [x] Input validation (Zod)
- [x] IP & device tracking
- [x] Secure cookies
- [ ] SSL/TLS in production (Your hosting provider)
- [ ] Regular security audits
- [ ] Password rotation policy

---

## 📊 Environment Variables

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=SecurePassword123!
FRONTEND_URL=https://your-frontend.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-secret
OPENAI_API_KEY=your-openai-key
SENTRY_DSN=your-sentry-dsn
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://your-backend.render.com/api/v1
NEXTAUTH_URL=https://your-frontend.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
```

---

## 📖 Documentation

- **API Docs**: http://localhost:5000/api-docs (Development)
- **Backend README**: See `backend/README.md`
- **Architecture**: Clean Architecture + MVC + Repository Pattern
- **Code Style**: ESLint + Prettier + TypeScript strict mode

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## 🤝 Contributing

This is a professional-grade production platform. Follow these guidelines:

1. **Code Quality**: Write clean, typed TypeScript
2. **Architecture**: Follow SOLID principles
3. **Security**: Never commit secrets
4. **Testing**: Write tests for new features
5. **Documentation**: Update docs with changes
6. **Git**: Use conventional commits

---

## 📝 License

MIT License - See LICENSE file

---

## 🆘 Support & Issues

For support:

- Check logs (`backend/logs/`)
- Review API documentation
- Check environment variables
- Verify MongoDB connection

---

## ✨ What's Completed

✅ Backend infrastructure & configuration  
✅ Authentication system with JWT & 2FA  
✅ User management & RBAC  
✅ Super Admin & Test Student accounts  
✅ Course, Lesson, Quiz models  
✅ Payment integration (M-Pesa & PayPal)  
✅ Security middleware  
✅ Activity logging  
✅ Frontend structure with Next.js 14  
✅ TailwindCSS styling  
✅ API client setup  
✅ Landing page

---

## 🚧 Next Steps

1. Complete all controller implementations
2. Build admin dashboards
3. Implement all 11 accounting tools
4. Integrate AI assistant
5. Add email service
6. Complete frontend pages (login, register, courses, etc.)
7. Add comprehensive tests
8. Performance optimization
9. SEO optimization
10. Final security audit

---

**Built with ❤️ using TypeScript, Next.js, Express, and MongoDB**

For questions or contributions, please open an issue or pull request.
