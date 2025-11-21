import mongoose, { Document, Schema } from "mongoose";

/**
 * Student Progress Interface
 */
export interface IStudentProgress extends Document {
  studentId: string;
  courseId: string;

  // Overall progress
  overallProgress: number; // percentage
  completedLessons: string[]; // Lesson IDs
  completedModules: string[]; // Module IDs

  // Quiz attempts
  quizAttempts: Array<{
    quizId: string;
    attemptNumber: number;
    score: number;
    percentage: number;
    passed: boolean;
    answers: Array<{
      questionIndex: number;
      selectedAnswer: number;
      isCorrect: boolean;
    }>;
    startedAt: Date;
    completedAt: Date;
  }>;

  // Time tracking
  totalTimeSpent: number; // in minutes
  lastAccessedAt: Date;

  // Bookmarks
  bookmarks: Array<{
    lessonId: string;
    note?: string;
    timestamp: Date;
  }>;

  // Notes
  notes: Array<{
    lessonId: string;
    content: string;
    timestamp: Date;
  }>;

  // Certificate
  certificateIssued: boolean;
  certificateIssuedAt?: Date;
  certificateId?: string;

  enrolledAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Student Progress Schema
 */
const StudentProgressSchema = new Schema(
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
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedLessons: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    completedModules: [
      {
        type: String,
      },
    ],
    quizAttempts: [
      {
        quizId: {
          type: Schema.Types.ObjectId,
          ref: "Quiz",
          required: true,
        },
        attemptNumber: {
          type: Number,
          required: true,
        },
        score: {
          type: Number,
          required: true,
        },
        percentage: {
          type: Number,
          required: true,
        },
        passed: {
          type: Boolean,
          required: true,
        },
        answers: [
          {
            questionIndex: Number,
            selectedAnswer: Number,
            isCorrect: Boolean,
          },
        ],
        startedAt: {
          type: Date,
          required: true,
        },
        completedAt: {
          type: Date,
          required: true,
        },
      },
    ],
    totalTimeSpent: {
      type: Number,
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    bookmarks: [
      {
        lessonId: {
          type: Schema.Types.ObjectId,
          ref: "Lesson",
          required: true,
        },
        note: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notes: [
      {
        lessonId: {
          type: Schema.Types.ObjectId,
          ref: "Lesson",
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
      },
    ],
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateIssuedAt: {
      type: Date,
    },
    certificateId: {
      type: String,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound Index for student-course pair
 */
StudentProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
StudentProgressSchema.index({ studentId: 1 });
StudentProgressSchema.index({ courseId: 1 });

export default mongoose.model<IStudentProgress>(
  "StudentProgress",
  StudentProgressSchema
);
