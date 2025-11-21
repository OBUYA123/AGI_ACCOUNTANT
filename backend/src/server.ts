import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import * as Sentry from "@sentry/node";
import config from "./config";
import { connectDatabase } from "./config/database";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";
import logger from "./utils/logger";
import { createSuperAdmin } from "./utils/createSuperAdmin";
import { createTestStudent } from "./utils/createTestStudent";

// Import Routes
import authRoutes from "./routes/authRoutes";
import courseRoutes from "./routes/courseRoutes";
import lessonRoutes from "./routes/lessonRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import accountingRoutes from "./routes/accountingRoutes";
import aiRoutes from "./routes/aiRoutes";

const app: Application = express();

/**
 * Initialize Sentry (Error Tracking)
 */
if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.env,
    tracesSampleRate: config.env === "production" ? 0.1 : 1.0,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

/**
 * Security Middleware
 */
app.use(
  helmet({
    contentSecurityPolicy: config.env === "production",
    crossOriginEmbedderPolicy: false,
  })
);

/**
 * CORS Configuration
 */
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (config.cors.origins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    optionsSuccessStatus: 200,
    maxAge: 86400, // 24 hours
  })
);

// Handle preflight requests explicitly
app.options("*", cors());

/**
 * Body Parser Middleware
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * Cookie Parser
 */
app.use(cookieParser(config.cookie.secret));

/**
 * MongoDB Sanitization
 */
app.use(mongoSanitize());

/**
 * HTTP Parameter Pollution Protection
 */
app.use(hpp());

/**
 * Compression
 */
app.use(compression());

/**
 * Logging
 */
if (config.env === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message: string) => logger.http(message.trim()),
      },
    })
  );
}

/**
 * Rate Limiting
 */
app.use("/api", apiLimiter);

/**
 * Health Check Route
 */
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "AGI Accountant API is running",
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

/**
 * API Routes
 */
app.use(`/api/${config.apiVersion}/auth`, authRoutes);
app.use(`/api/${config.apiVersion}/courses`, courseRoutes);
app.use(`/api/${config.apiVersion}/lessons`, lessonRoutes);
app.use(`/api/${config.apiVersion}/payments`, paymentRoutes);
app.use(`/api/${config.apiVersion}/accounting`, accountingRoutes);
app.use(`/api/${config.apiVersion}/ai`, aiRoutes);

/**
 * Swagger API Documentation (Production-ready)
 */
if (config.env === "development") {
  const swaggerUi = require("swagger-ui-express");
  const swaggerJsdoc = require("swagger-jsdoc");

  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "AGI Accountant Platform API",
        version: "1.0.0",
        description:
          "Complete API documentation for Smart AGI Accountant Platform",
        contact: {
          name: "API Support",
          email: "support@agiaccountant.com",
        },
      },
      servers: [
        {
          url: `http://localhost:${config.port}/api/${config.apiVersion}`,
          description: "Development Server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

/**
 * Sentry Error Handler
 */
if (config.sentry.dsn) {
  app.use(Sentry.Handlers.errorHandler());
}

/**
 * 404 Handler
 */
app.use(notFoundHandler);

/**
 * Global Error Handler
 */
app.use(errorHandler);

/**
 * Initialize Server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info("Database connected successfully");

    // Create Super Admin (if not exists)
    await createSuperAdmin();

    // Create Test Student (if not exists)
    await createTestStudent();

    // Start Server
    app.listen(config.port, () => {
      logger.info(
        `Server running in ${config.env} mode on port ${config.port}`
      );
      logger.info(
        `API Documentation: http://localhost:${config.port}/api-docs`
      );
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

/**
 * Graceful Shutdown
 */
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received: closing HTTP server");
  process.exit(0);
});

/**
 * Unhandled Promise Rejections
 */
process.on("unhandledRejection", (reason: any) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;
