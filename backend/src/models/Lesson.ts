import mongoose, { Document, Schema } from "mongoose";

/**
 * Lesson Interface
 */
export interface ILesson extends Document {
  title: string;
  description: string;
  content: string;
  courseId: string;
  moduleId: string;
  order: number;
  type: "video" | "text" | "pdf" | "quiz";
  videoUrl?: string;
  pdfUrl?: string;
  duration?: number; // in minutes
  isPublished: boolean;
  isFree: boolean; // Preview lesson
  resources: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Lesson Schema
 */
const LessonSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Lesson description is required"],
    },
    content: {
      type: String,
      required: [true, "Lesson content is required"],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    moduleId: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["video", "text", "pdf", "quiz"],
      required: true,
    },
    videoUrl: {
      type: String,
    },
    pdfUrl: {
      type: String,
    },
    duration: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    resources: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
LessonSchema.index({ courseId: 1, order: 1 });
LessonSchema.index({ moduleId: 1 });

export default mongoose.model<ILesson>("Lesson", LessonSchema);
