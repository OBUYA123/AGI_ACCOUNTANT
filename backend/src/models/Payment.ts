import mongoose, { Document, Schema } from "mongoose";

/**
 * Payment Interface
 */
export interface IPayment extends Document {
  studentId: string;
  courseId: string;
  amount: number;
  currency: string;
  paymentMethod: "mpesa" | "paypal" | "free_access";
  status: "pending" | "completed" | "failed" | "refunded";

  // Transaction details
  transactionId: string;
  externalTransactionId?: string; // M-Pesa/PayPal transaction ID

  // M-Pesa specific
  mpesaReceiptNumber?: string;
  phoneNumber?: string;

  // PayPal specific
  paypalOrderId?: string;
  paypalPayerId?: string;

  // Metadata
  ipAddress?: string;
  userAgent?: string;

  // Timestamps
  initiatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payment Schema
 */
const PaymentSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: "USD",
    },
    paymentMethod: {
      type: String,
      enum: ["mpesa", "paypal", "free_access"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    externalTransactionId: {
      type: String,
    },
    mpesaReceiptNumber: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    paypalOrderId: {
      type: String,
    },
    paypalPayerId: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
PaymentSchema.index({ studentId: 1 });
PaymentSchema.index({ courseId: 1 });
PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ paymentMethod: 1 });

export default mongoose.model<IPayment>("Payment", PaymentSchema);
