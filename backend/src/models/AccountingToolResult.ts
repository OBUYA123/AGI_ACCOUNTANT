import mongoose, { Document, Schema } from "mongoose";

/**
 * Accounting Tool Result Interface
 */
export interface IAccountingToolResult extends Document {
  userId: string;
  toolType:
    | "balance_sheet"
    | "profit_loss"
    | "depreciation"
    | "tax_calculator"
    | "inventory"
    | "cashflow"
    | "ledger"
    | "break_even"
    | "payroll"
    | "receivables_payables";

  title: string;
  inputs: any; // Tool-specific inputs
  results: any; // Tool-specific results
  exportUrl?: string; // PDF export URL

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Accounting Tool Result Schema
 */
const AccountingToolResultSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toolType: {
      type: String,
      enum: [
        "balance_sheet",
        "profit_loss",
        "depreciation",
        "tax_calculator",
        "inventory",
        "cashflow",
        "ledger",
        "break_even",
        "payroll",
        "receivables_payables",
      ],
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    inputs: {
      type: Schema.Types.Mixed,
      required: true,
    },
    results: {
      type: Schema.Types.Mixed,
      required: true,
    },
    exportUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
AccountingToolResultSchema.index({ userId: 1, createdAt: -1 });
AccountingToolResultSchema.index({ toolType: 1 });

export default mongoose.model<IAccountingToolResult>(
  "AccountingToolResult",
  AccountingToolResultSchema
);
