import mongoose, { Document, Schema } from "mongoose";

/**
 * Question Interface
 */
export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  explanation?: string;
  points: number;
}

/**
 * Quiz Interface
 */
export interface IQuiz extends Document {
  title: string;
  description: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  type: "practice" | "module_quiz" | "final_exam";
  questions: IQuestion[];
  duration: number; // in minutes
  passingScore: number; // percentage
  totalPoints: number;
  isPublished: boolean;
  attemptsAllowed: number;
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Question Schema
 */
const QuestionSchema = new Schema<IQuestion>({
  question: {
    type: String,
    required: [true, "Question text is required"],
  },
  options: {
    type: [String],
    required: [true, "Options are required"],
    validate: {
      validator: (v: string[]) => v.length >= 2 && v.length <= 6,
      message: "A question must have between 2 and 6 options",
    },
  },
  correctAnswer: {
    type: Number,
    required: [true, "Correct answer index is required"],
  },
  explanation: {
    type: String,
  },
  points: {
    type: Number,
    default: 1,
    min: [1, "Points must be at least 1"],
  },
});

/**
 * Quiz Schema
 */
const QuizSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Quiz description is required"],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    moduleId: {
      type: String,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
    },
    type: {
      type: String,
      enum: ["practice", "module_quiz", "final_exam"],
      required: true,
    },
    questions: {
      type: [QuestionSchema],
      required: [true, "At least one question is required"],
      validate: {
        validator: (v: IQuestion[]) => v.length > 0,
        message: "Quiz must have at least one question",
      },
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    passingScore: {
      type: Number,
      required: [true, "Passing score is required"],
      min: [0, "Passing score cannot be negative"],
      max: [100, "Passing score cannot exceed 100"],
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    attemptsAllowed: {
      type: Number,
      default: 3,
      min: [1, "At least one attempt must be allowed"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Calculate total points before saving
 */
QuizSchema.pre("save", function (next) {
  this.totalPoints = this.questions.reduce(
    (sum: number, q: any) => sum + q.points,
    0
  );
  next();
});

/**
 * Indexes
 */
QuizSchema.index({ courseId: 1, type: 1 });
QuizSchema.index({ moduleId: 1 });

export default mongoose.model<IQuiz>("Quiz", QuizSchema);
