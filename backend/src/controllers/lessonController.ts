import { Response } from "express";
import {
  asyncHandler,
  successResponse,
  errorResponse,
  AppError,
} from "../utils/helpers";
import { AuthRequest } from "../middleware/auth";
import Lesson from "../models/Lesson";
import Course from "../models/Course";
import StudentProgress from "../models/StudentProgress";
import { z } from "zod";

/**
 * Validation Schema
 */
const lessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().min(1, "Content is required"),
  courseId: z.string().min(1, "Course ID is required"),
  moduleId: z.string().min(1, "Module ID is required"),
  type: z.enum(["video", "text", "pdf", "quiz"]),
  videoUrl: z.string().optional(),
  pdfUrl: z.string().optional(),
  duration: z.number().optional(),
  order: z.number().optional(),
  isFree: z.boolean().optional(),
});

/**
 * Get All Lessons
 * @route   GET /api/v1/lessons
 * @access  Private
 */
export const getLessons = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { courseId, moduleId, type } = req.query;

    const query: any = {};

    if (courseId) query.courseId = courseId;
    if (moduleId) query.moduleId = moduleId;
    if (type) query.type = type;

    // Students only see published lessons
    if (req.user?.role === "student") {
      query.isPublished = true;
    }

    const lessons = await Lesson.find(query)
      .populate("courseId", "title")
      .sort({ order: 1 });

    return successResponse(res, "Lessons retrieved successfully", { lessons });
  }
);

/**
 * Get Lesson by ID
 * @route   GET /api/v1/lessons/:id
 * @access  Private
 */
export const getLessonById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const lesson = await Lesson.findById(req.params.id).populate(
      "courseId",
      "title price paymentStatus"
    );

    if (!lesson) {
      throw new AppError("Lesson not found", 404);
    }

    // Check if student has access
    if (req.user?.role === "student") {
      if (!lesson.isPublished && !lesson.isFree) {
        throw new AppError("Access denied", 403);
      }

      // Check payment status
      if (
        !lesson.isFree &&
        req.user.paymentStatus !== "paid" &&
        req.user.paymentStatus !== "free_access"
      ) {
        throw new AppError(
          "Please complete payment to access this lesson",
          402
        );
      }
    }

    return successResponse(res, "Lesson retrieved successfully", { lesson });
  }
);

/**
 * Create Lesson (Admin/Super Admin)
 * @route   POST /api/v1/lessons
 * @access  Private (Admin, Super Admin)
 */
export const createLesson = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const validatedData = lessonSchema.parse(req.body);

    // Verify course exists
    const course = await Course.findById(validatedData.courseId);
    if (!course) {
      throw new AppError("Course not found", 404);
    }

    // Verify module exists
    // @ts-expect-error - Mongoose array id method
    const module = course.modules.id(validatedData.moduleId);
    if (!module) {
      throw new AppError("Module not found in course", 404);
    }

    const lesson = await Lesson.create(validatedData);

    // Update course total lessons
    course.totalLessons += 1;
    await course.save();

    return successResponse(res, "Lesson created successfully", { lesson }, 201);
  }
);

/**
 * Update Lesson (Admin/Super Admin)
 * @route   PUT /api/v1/lessons/:id
 * @access  Private (Admin, Super Admin)
 */
export const updateLesson = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      throw new AppError("Lesson not found", 404);
    }

    const validatedData = lessonSchema.partial().parse(req.body);

    Object.assign(lesson, validatedData);
    await lesson.save();

    return successResponse(res, "Lesson updated successfully", { lesson });
  }
);

/**
 * Delete Lesson (Admin/Super Admin)
 * @route   DELETE /api/v1/lessons/:id
 * @access  Private (Admin, Super Admin)
 */
export const deleteLesson = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      throw new AppError("Lesson not found", 404);
    }

    // Update course total lessons
    const course = await Course.findById(lesson.courseId);
    if (course) {
      course.totalLessons -= 1;
      await course.save();
    }

    await lesson.deleteOne();

    return successResponse(res, "Lesson deleted successfully");
  }
);

/**
 * Mark Lesson as Complete
 * @route   POST /api/v1/lessons/:id/complete
 * @access  Private (Student)
 */
export const markLessonComplete = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      throw new AppError("Lesson not found", 404);
    }

    // Check payment access
    if (
      req.user?.paymentStatus !== "paid" &&
      req.user?.paymentStatus !== "free_access"
    ) {
      throw new AppError("Please complete payment to access this lesson", 402);
    }

    // Get or create progress
    let progress = await StudentProgress.findOne({
      studentId: req.user?._id,
      courseId: lesson.courseId,
    });

    if (!progress) {
      progress = await StudentProgress.create({
        studentId: req.user?._id,
        courseId: lesson.courseId,
      });
    }

    // Add to completed lessons if not already completed
    if (!progress.completedLessons.includes(lesson._id.toString() as any)) {
      progress.completedLessons.push(lesson._id.toString() as any);
      progress.lastAccessedAt = new Date();

      // Calculate overall progress
      const course = await Course.findById(lesson.courseId);
      if (course) {
        progress.overallProgress =
          (progress.completedLessons.length / course.totalLessons) * 100;
      }

      await progress.save();
    }

    return successResponse(res, "Lesson marked as complete", { progress });
  }
);

/**
 * Add Bookmark
 * @route   POST /api/v1/lessons/:id/bookmark
 * @access  Private (Student)
 */
export const addBookmark = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { note } = req.body;

    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      throw new AppError("Lesson not found", 404);
    }

    let progress = await StudentProgress.findOne({
      studentId: req.user?._id,
      courseId: lesson.courseId,
    });

    if (!progress) {
      progress = await StudentProgress.create({
        studentId: req.user?._id,
        courseId: lesson.courseId,
      });
    }

    progress.bookmarks.push({
      lessonId: lesson._id.toString() as any,
      note,
      timestamp: new Date(),
    });

    await progress.save();

    return successResponse(res, "Bookmark added successfully", { progress });
  }
);

/**
 * Add Note
 * @route   POST /api/v1/lessons/:id/notes
 * @access  Private (Student)
 */
export const addNote = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { content } = req.body;

  if (!content) {
    return errorResponse(res, "Note content is required", 400);
  }

  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  let progress = await StudentProgress.findOne({
    studentId: req.user?._id,
    courseId: lesson.courseId,
  });

  if (!progress) {
    progress = await StudentProgress.create({
      studentId: req.user?._id,
      courseId: lesson.courseId,
    });
  }

  progress.notes.push({
    lessonId: lesson._id.toString() as any,
    content,
    timestamp: new Date(),
  });

  await progress.save();

  return successResponse(res, "Note added successfully", { progress });
});
