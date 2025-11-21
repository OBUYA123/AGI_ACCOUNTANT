import mongoose, { Document, Schema } from "mongoose";

/**
 * Course Module Interface
 */
export interface IModule {
  _id: string;
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
  lessons: string[]; // Lesson IDs
}

/**
 * Course Interface
 */
export interface ICourse extends Document {
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  thumbnail?: string;
  isPublished: boolean;
  modules: IModule[];
  totalLessons: number;
  duration: number; // in hours
  difficulty: "beginner" | "intermediate" | "advanced";
  instructor: string; // User ID
  enrolledStudents: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Module Schema
 */
const ModuleSchema = new Schema<IModule>({
  title: {
    type: String,
    required: [true, "Module title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Module description is required"],
  },
  order: {
    type: Number,
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  lessons: [
    {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
    },
  ],
});

/**
 * Course Schema
 */
const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      unique: true,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Course category is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: [0, "Price cannot be negative"],
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },
    thumbnail: {
      type: String,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    modules: [ModuleSchema],
    totalLessons: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enrolledStudents: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
CourseSchema.index({ title: 1 });
CourseSchema.index({ category: 1 });
CourseSchema.index({ isPublished: 1 });

export default mongoose.model<ICourse>("Course", CourseSchema);
