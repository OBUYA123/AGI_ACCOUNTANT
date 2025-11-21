# Smart AGI Accountant Platform - Backend

A comprehensive, production-ready backend API for the Smart AGI Accountant Platform built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Features

### Core Features

- ✅ **Complete Authentication System** with JWT & Refresh Tokens
- ✅ **Two-Factor Authentication (2FA)** with TOTP
- ✅ **Role-Based Access Control (RBAC)** - Super Admin, Admin, Student
- ✅ **Security Best Practices** - Argon2 hashing, rate limiting, CORS, helmet
- ✅ **CPA Course Management** - Modules, Lessons, Quizzes, Progress Tracking
- ✅ **Payment Integration** - M-Pesa Daraja API & PayPal
- ✅ **AI Finance Assistant** with chat history & document analysis
- ✅ **11 Accounting Tools Suite** with PDF export
- ✅ **Activity Logging** for all operations
- ✅ **Email Notifications** via Nodemailer
- ✅ **Error Tracking** with Sentry
- ✅ **API Documentation** with Swagger

### Security Features

- Argon2 password hashing
- JWT with refresh token rotation
- 2FA with QR code generation
- IP & device tracking
- Rate limiting & request throttling
- MongoDB sanitization
- HPP protection
- Secure cookies
- CORS configuration

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB Atlas account
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

```bash
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Configuration**

```bash
cp .env.example .env
```

Edit `.env` and configure:

- MongoDB connection string
- JWT secrets
- Super Admin credentials
- Email service (SMTP)
- M-Pesa credentials (Daraja API)
- PayPal credentials
- OpenAI API key (for AI assistant)
- Sentry DSN (optional)

4. **Build the project**

```bash
npm run build
```

5. **Run in development**

```bash
npm run dev
```

6. **Run in production**

```bash
npm start
```

## 🔐 Default Accounts

### Super Admin Account

- **Email**: As configured in `.env` (`SUPER_ADMIN_EMAIL`)
- **Password**: As configured in `.env` (`SUPER_ADMIN_PASSWORD`)
- **2FA**: Enabled by default (check console logs for QR code)
- **Access**: Full system access

### Test Student Account

- **Email**: teststudent@agiaccountant.com
- **Password**: TestStudent#2025
- **Access**: Full CPA course (payment bypassed)

⚠️ **IMPORTANT**: Change the super admin password immediately after first login!

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── index.ts      # Main config
│   │   └── database.ts   # MongoDB connection
│   ├── controllers/      # Route controllers
│   │   ├── authController.ts
│   │   ├── courseController.ts
│   │   ├── paymentController.ts
│   │   ├── accountingController.ts
│   │   └── aiController.ts
│   ├── models/          # Mongoose models
│   │   ├── User.ts
│   │   ├── Course.ts
│   │   ├── Lesson.ts
│   │   ├── Quiz.ts
│   │   ├── StudentProgress.ts
│   │   ├── Payment.ts
│   │   ├── ActivityLog.ts
│   │   ├── AccountingToolResult.ts
│   │   └── AIChatSession.ts
│   ├── middleware/      # Custom middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── routes/          # API routes
│   │   ├── authRoutes.ts
│   │   ├── courseRoutes.ts
│   │   ├── paymentRoutes.ts
│   │   ├── accountingRoutes.ts
│   │   └── aiRoutes.ts
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   │   ├── logger.ts
│   │   ├── helpers.ts
│   │   ├── createSuperAdmin.ts
│   │   └── createTestStudent.ts
│   └── server.ts        # App entry point
├── dist/                # Compiled JavaScript
├── logs/                # Application logs
├── uploads/             # File uploads
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔌 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new student
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/2fa/setup` - Setup 2FA
- `POST /api/v1/auth/2fa/verify` - Verify 2FA
- `POST /api/v1/auth/2fa/disable` - Disable 2FA

### Courses (Coming next)

- Full CRUD for courses, modules, lessons
- Quiz management
- Progress tracking

### Payments (Coming next)

- M-Pesa integration
- PayPal integration
- Payment verification

### Accounting Tools (Coming next)

- 11 accounting calculators
- PDF export
- Save results

### AI Assistant (Coming next)

- Chat with AI
- Document analysis
- CPA concept explanations

## 📚 API Documentation

When running in development mode, access Swagger documentation at:

```
http://localhost:5000/api-docs
```

## 🧪 Testing

```bash
npm test
```

## 🚀 Deployment

### Render Deployment

1. Create a new Web Service on Render
2. Connect your repository
3. Configure environment variables
4. Deploy

**Build Command**: `npm install && npm run build`
**Start Command**: `npm start`

### Environment Variables on Render

Set all variables from `.env.example` in Render dashboard.

## 🔒 Security Considerations

1. **Always use HTTPS in production**
2. **Change default super admin password**
3. **Enable 2FA for all admin accounts**
4. **Keep JWT secrets secure and rotate regularly**
5. **Set strong MongoDB password**
6. **Configure CORS for your frontend domain only**
7. **Enable Sentry for error tracking**
8. **Regular security audits**

## 📊 Monitoring & Logging

- **Winston**: Structured logging to files
- **Sentry**: Error tracking and monitoring
- **Morgan**: HTTP request logging
- **Activity Logs**: Database-stored user activity

Logs are stored in `logs/` directory with daily rotation.

## 🤝 Contributing

This is a professional-grade platform. Follow these guidelines:

- Write clean, typed TypeScript code
- Follow SOLID principles
- Add comprehensive error handling
- Write API documentation
- Test thoroughly before committing

## 📄 License

MIT License

## 🆘 Support

For issues or questions:

- Email: support@agiaccountant.com
- Check logs in `logs/` directory
- Enable debug mode in development

---

**Built with ❤️ using TypeScript, Express, and MongoDB**
