import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server Configuration
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  apiVersion: process.env.API_VERSION || "v1",

  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/agi-accountant",
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || "default-secret-change-in-production",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "default-refresh-secret",
    expire: process.env.JWT_EXPIRE || "15m",
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || "7d",
  },

  // Super Admin Configuration
  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL || "superadmin@agiaccountant.com",
    password: process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin#2025!Secure",
    twoFactorSecret: process.env.SUPER_ADMIN_2FA_SECRET || "",
  },

  // Frontend Configuration
  frontend: {
    url: process.env.FRONTEND_URL || "http://localhost:3000",
  },

  // CORS Configuration
  cors: {
    origins: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASSWORD || "",
  },

  // M-Pesa Configuration
  mpesa: {
    consumerKey: process.env.MPESA_CONSUMER_KEY || "",
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || "",
    shortcode: process.env.MPESA_SHORTCODE || "174379",
    passkey: process.env.MPESA_PASSKEY || "",
    callbackUrl: process.env.MPESA_CALLBACK_URL || "",
    environment: process.env.MPESA_ENVIRONMENT || "sandbox",
  },

  // PayPal Configuration
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || "",
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
    mode: process.env.PAYPAL_MODE || "sandbox",
  },

  // AI Configuration
  ai: {
    provider: process.env.AI_PROVIDER || "gemini",
    openaiApiKey: process.env.OPENAI_API_KEY || "",
    geminiApiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.AI_MODEL || "gemini-pro",
  },

  // Sentry Configuration
  sentry: {
    dsn: process.env.SENTRY_DSN || "",
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10), // 10MB
    uploadPath: process.env.UPLOAD_PATH || "./uploads",
  },

  // Cookie Configuration
  cookie: {
    secret: process.env.COOKIE_SECRET || "cookie-secret-change-in-production",
  },

  // Backup Configuration
  backup: {
    enabled: process.env.BACKUP_ENABLED === "true",
    schedule: process.env.BACKUP_SCHEDULE || "0 2 * * *",
  },
};

export default config;
