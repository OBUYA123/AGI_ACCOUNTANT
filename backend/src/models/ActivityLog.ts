import mongoose, { Document, Schema } from "mongoose";

/**
 * Activity Log Interface
 */
export interface IActivityLog extends Document {
  userId?: string;
  action: string;
  category: "auth" | "course" | "payment" | "admin" | "user" | "system";
  description: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failure" | "warning";
  timestamp: Date;
}

/**
 * Activity Log Schema
 */
const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["auth", "course", "payment", "admin", "user", "system"],
      required: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ["success", "failure", "warning"],
      default: "success",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

/**
 * Indexes
 */
ActivityLogSchema.index({ userId: 1, timestamp: -1 });
ActivityLogSchema.index({ category: 1, timestamp: -1 });
ActivityLogSchema.index({ timestamp: -1 });

export default mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
