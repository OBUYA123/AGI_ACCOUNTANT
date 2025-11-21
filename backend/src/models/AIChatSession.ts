import mongoose, { Document, Schema } from "mongoose";

/**
 * AI Chat Message Interface
 */
export interface IAIChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * AI Chat Session Interface
 */
export interface IAIChatSession extends Document {
  userId: string;
  title: string;
  category:
    | "accounting"
    | "economics"
    | "tax"
    | "audit"
    | "cpa_concept"
    | "general";
  messages: IAIChatMessage[];

  // Document analysis
  attachedDocuments?: Array<{
    filename: string;
    fileUrl: string;
    uploadedAt: Date;
  }>;

  isActive: boolean;
  lastMessageAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message Schema
 */
const MessageSchema = new Schema<IAIChatMessage>({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

/**
 * AI Chat Session Schema
 */
const AIChatSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Chat title is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "accounting",
        "economics",
        "tax",
        "audit",
        "cpa_concept",
        "general",
      ],
      default: "general",
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
    attachedDocuments: [
      {
        filename: { type: String, required: true },
        fileUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
AIChatSessionSchema.index({ userId: 1, lastMessageAt: -1 });
AIChatSessionSchema.index({ category: 1 });

export default mongoose.model<IAIChatSession>(
  "AIChatSession",
  AIChatSessionSchema
);
