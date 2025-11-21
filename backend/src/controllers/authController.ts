import { Request, Response } from "express";
import {
  asyncHandler,
  successResponse,
  errorResponse,
  AppError,
} from "../utils/helpers";
import { AuthRequest } from "../middleware/auth";
import User from "../models/User";
import ActivityLog from "../models/ActivityLog";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { z } from "zod";
import config from "../config";

/**
 * Validation Schemas
 */
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  twoFactorToken: z.string().optional(),
});

/**
 * Register New Student
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  // Validate input
  const validatedData = registerSchema.parse(req.body);

  // Check if user exists
  const existingUser = await User.findOne({ email: validatedData.email });
  if (existingUser) {
    return errorResponse(res, "Email already registered", 400);
  }

  // Create user
  const user = await User.create({
    ...validatedData,
    role: "student",
    paymentStatus: "pending",
  });

  // Log activity
  await ActivityLog.create({
    userId: user._id,
    action: "USER_REGISTERED",
    category: "auth",
    description: `New user registered: ${user.email}`,
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
    status: "success",
  });

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Set cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  return successResponse(
    res,
    "Registration successful",
    {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
      refreshToken,
    },
    201
  );
});

/**
 * Login User
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  // Validate input
  const { email, password, twoFactorToken } = loginSchema.parse(req.body);

  // Find user with password
  const user = await User.findOne({ email }).select(
    "+password +twoFactorSecret"
  );

  if (!user || !(await user.comparePassword(password))) {
    await ActivityLog.create({
      action: "LOGIN_FAILED",
      category: "auth",
      description: `Failed login attempt for email: ${email}`,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "failure",
    });

    return errorResponse(res, "Invalid email or password", 401);
  }

  // Check if account is active
  if (!user.isActive) {
    return errorResponse(res, "Account has been deactivated", 403);
  }

  // Check 2FA if enabled
  if (user.twoFactorEnabled && user.twoFactorSecret) {
    if (!twoFactorToken) {
      return errorResponse(res, "2FA token required", 400);
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: twoFactorToken,
      window: 2,
    });

    if (!verified) {
      return errorResponse(res, "Invalid 2FA token", 401);
    }
  }

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  // Update user
  user.lastLogin = new Date();
  user.refreshToken = refreshToken;
  user.loginHistory.push({
    timestamp: new Date(),
    ipAddress: req.ip || "unknown",
    userAgent: req.get("user-agent") || "unknown",
  });

  // Keep only last 10 login records
  if (user.loginHistory.length > 10) {
    user.loginHistory = user.loginHistory.slice(-10);
  }

  await user.save();

  // Log activity
  await ActivityLog.create({
    userId: user._id,
    action: "USER_LOGIN",
    category: "auth",
    description: `User logged in: ${user.email}`,
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
    status: "success",
  });

  // Set cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  return successResponse(res, "Login successful", {
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions,
      paymentStatus: user.paymentStatus,
    },
    token,
    refreshToken,
  });
});

/**
 * Get Current User
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return successResponse(res, "User retrieved successfully", {
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions,
      phone: user.phone,
      profileImage: user.profileImage,
      isEmailVerified: user.isEmailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      paymentStatus: user.paymentStatus,
      courseProgress: user.courseProgress,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
  });
});

/**
 * Logout User
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Clear refresh token
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    await ActivityLog.create({
      userId: req.user._id,
      action: "USER_LOGOUT",
      category: "auth",
      description: "User logged out",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });
  }

  // Clear cookie
  res.clearCookie("token");

  return successResponse(res, "Logout successful");
});

/**
 * Setup 2FA
 * @route   POST /api/v1/auth/2fa/setup
 * @access  Private
 */
export const setup2FA = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?._id).select("+twoFactorSecret");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.twoFactorEnabled) {
      return errorResponse(res, "2FA is already enabled", 400);
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `AGI Accountant (${user.email})`,
      length: 32,
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

    // Save secret (but don't enable yet)
    user.twoFactorSecret = secret.base32;
    await user.save();

    return successResponse(res, "2FA setup initiated", {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    });
  }
);

/**
 * Verify and Enable 2FA
 * @route   POST /api/v1/auth/2fa/verify
 * @access  Private
 */
export const verify2FA = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { token } = req.body;

    if (!token) {
      return errorResponse(res, "2FA token is required", 400);
    }

    const user = await User.findById(req.user?._id).select("+twoFactorSecret");

    if (!user || !user.twoFactorSecret) {
      throw new AppError("2FA not set up", 400);
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 2,
    });

    if (!verified) {
      return errorResponse(res, "Invalid 2FA token", 401);
    }

    user.twoFactorEnabled = true;
    await user.save();

    await ActivityLog.create({
      userId: user._id,
      action: "2FA_ENABLED",
      category: "auth",
      description: "Two-factor authentication enabled",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    return successResponse(res, "2FA enabled successfully");
  }
);

/**
 * Disable 2FA
 * @route   POST /api/v1/auth/2fa/disable
 * @access  Private
 */
export const disable2FA = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { password } = req.body;

    if (!password) {
      return errorResponse(res, "Password is required", 400);
    }

    const user = await User.findById(req.user?._id).select(
      "+password +twoFactorSecret"
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Verify password
    if (!(await user.comparePassword(password))) {
      return errorResponse(res, "Invalid password", 401);
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    await ActivityLog.create({
      userId: user._id,
      action: "2FA_DISABLED",
      category: "auth",
      description: "Two-factor authentication disabled",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "warning",
    });

    return successResponse(res, "2FA disabled successfully");
  }
);

/**
 * Refresh Token
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken: token } = req.body;

    if (!token) {
      return errorResponse(res, "Refresh token is required", 400);
    }

    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as {
        id: string;
      };

      const user = await User.findById(decoded.id).select("+refreshToken");

      if (!user || user.refreshToken !== token) {
        throw new AppError("Invalid refresh token", 401);
      }

      // Generate new tokens
      const newToken = user.generateAuthToken();
      const newRefreshToken = user.generateRefreshToken();

      user.refreshToken = newRefreshToken;
      await user.save();

      return successResponse(res, "Token refreshed successfully", {
        token: newToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      return errorResponse(res, "Invalid or expired refresh token", 401);
    }
  }
);
