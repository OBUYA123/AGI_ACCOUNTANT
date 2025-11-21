import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { AppError, errorResponse } from "../utils/helpers";
import { ZodError } from "zod";

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  // Zod Validation Errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return errorResponse(res, "Validation Error", 400, errors);
  }

  // Operational Errors (AppError)
  if (err instanceof AppError) {
    return errorResponse(res, err.message, err.statusCode);
  }

  // MongoDB Duplicate Key Error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    return errorResponse(
      res,
      `${field} already exists. Please use a different value.`,
      400
    );
  }

  // MongoDB Validation Error
  if (err.name === "ValidationError") {
    const errors = Object.values((err as any).errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    return errorResponse(res, "Validation Error", 400, errors);
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    return errorResponse(res, "Invalid token. Please log in again.", 401);
  }

  if (err.name === "TokenExpiredError") {
    return errorResponse(res, "Token expired. Please log in again.", 401);
  }

  // Default Server Error
  return errorResponse(res, "Something went wrong on the server.", 500);
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};
