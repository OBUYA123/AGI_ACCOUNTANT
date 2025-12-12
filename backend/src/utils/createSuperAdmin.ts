import User from "../models/User";
import logger from "./logger";
import { config } from "../config/index";
import speakeasy from "speakeasy";

/**
 * Create Super Admin Account (Production-Ready)
 * This function ensures a super admin exists with maximum security
 */
export const createSuperAdmin = async (): Promise<void> => {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: "super_admin" });

    if (existingSuperAdmin) {
      logger.info("Super Admin already exists");
      return;
    }

    // Generate 2FA secret for super admin
    const twoFactorSecret = speakeasy.generateSecret({
      name: `AGI Accountant Super Admin (${config.superAdmin.email})`,
      length: 32,
    });

    // Create super admin
    const superAdmin = await User.create({
      email: config.superAdmin.email,
      password: config.superAdmin.password,
      firstName: "Super",
      lastName: "Admin",
      role: "super_admin",
      isActive: true,
      isEmailVerified: true,
      twoFactorEnabled: true,
      twoFactorSecret: twoFactorSecret.base32,
      paymentStatus: "free_access",
    });

    logger.info("✅ Super Admin account created successfully");
    logger.info(`Email: ${superAdmin.email}`);
    logger.info(`Password: ${config.superAdmin.password}`);
    logger.info("⚠️  IMPORTANT: Please change the password after first login");
    logger.info(
      "⚠️  2FA is ENABLED. Scan this secret in your authenticator app:"
    );
    logger.info(`2FA Secret: ${twoFactorSecret.base32}`);
    logger.info(`2FA URL: ${twoFactorSecret.otpauth_url}`);

    // Generate QR code for easier setup
    const qrcode = require("qrcode");
    const qrCodeUrl = await qrcode.toDataURL(twoFactorSecret.otpauth_url);
    logger.info("QR Code for 2FA has been generated");
  } catch (error: any) {
    logger.error("Error creating Super Admin:", error.message);
  }
};

export default createSuperAdmin;
