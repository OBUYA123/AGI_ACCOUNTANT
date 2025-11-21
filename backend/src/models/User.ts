import mongoose, { Document, Schema } from "mongoose";
import argon2 from "argon2";

/**
 * User Interface
 */
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "admin" | "student";
  permissions?: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  phone?: string;
  profileImage?: string;

  // Student-specific fields
  enrollmentDate?: Date;
  paymentStatus?: "pending" | "paid" | "free_access";
  courseProgress?: number;

  // Security tracking
  loginHistory: Array<{
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    location?: string;
  }>;

  // Timestamps
  lastLogin?: Date;
  passwordChangedAt?: Date;
  refreshToken?: string;

  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
}

/**
 * User Schema
 */
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ["super_admin", "admin", "student"],
        message: "Role must be super_admin, admin, or student",
      },
      default: "student",
    },
    permissions: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    enrollmentDate: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "free_access"],
      default: "pending",
    },
    courseProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    loginHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        ipAddress: String,
        userAgent: String,
        location: String,
      },
    ],
    lastLogin: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Hash password before saving
 */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Hash password using Argon2
    this.password = await argon2.hash(this.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    this.passwordChangedAt = new Date();
    next();
  } catch (error: any) {
    next(error);
  }
});

/**
 * Compare password method
 */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch (error) {
    return false;
  }
};

/**
 * Generate JWT Auth Token
 */
UserSchema.methods.generateAuthToken = function (): string {
  const jwt = require("jsonwebtoken");
  const config = require("../config").default;

  return jwt.sign({ id: this._id }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
};

/**
 * Generate Refresh Token
 */
UserSchema.methods.generateRefreshToken = function (): string {
  const jwt = require("jsonwebtoken");
  const config = require("../config").default;

  return jwt.sign({ id: this._id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpire,
  });
};

/**
 * Indexes for performance
 */
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

export default mongoose.model<IUser>("User", UserSchema);
