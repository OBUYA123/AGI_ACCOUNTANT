import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { asyncHandler, AppError } from "../utils/helpers";
import config from "../config";
import User, { IUser } from "../models/User";

// Extend Express Request type
export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Verify JWT Token and Attach User to Request
 */
export const protect = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new AppError("Not authorized to access this route", 401);
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string };

      // Get user from database
      const user = await User.findById(decoded.id).select("+twoFactorSecret");

      if (!user) {
        throw new AppError("User not found", 404);
      }

      if (!user.isActive) {
        throw new AppError("Your account has been deactivated", 403);
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      throw new AppError("Not authorized to access this route", 401);
    }
  }
);

/**
 * Role-Based Access Control
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("User not authenticated", 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        `Role '${req.user.role}' is not authorized to access this route`,
        403
      );
    }

    next();
  };
};

/**
 * Super Admin Only Access
 */
export const superAdminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new AppError("User not authenticated", 401);
  }

  if (req.user.role !== "super_admin") {
    throw new AppError("Only Super Admin can access this resource", 403);
  }

  next();
};

/**
 * Check if user has specific permission
 */
export const checkPermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("User not authenticated", 401);
    }

    // Super admin has all permissions
    if (req.user.role === "super_admin") {
      return next();
    }

    // Check if user has the required permission
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      throw new AppError(
        `You do not have permission to perform this action`,
        403
      );
    }

    next();
  };
};
