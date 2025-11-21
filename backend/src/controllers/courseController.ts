import { Response } from "express";
import {
  asyncHandler,
  successResponse,
  errorResponse,
  AppError,
} from "../utils/helpers";
import { AuthRequest } from "../middleware/auth";
import Course from "../models/Course";
import Lesson from "../models/Lesson";
import Quiz from "../models/Quiz";
import StudentProgress from "../models/StudentProgress";
import ActivityLog from "../models/ActivityLog";
import { z } from "zod";

/**
 * Validation Schemas
 */
const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price cannot be negative"),
  currency: z.string().default("USD"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
});

/**
 * Get All Courses
 * @route   GET /api/v1/courses
 * @access  Public
 */
export const getCourses = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 10, category, difficulty, search } = req.query;

    const query: any = {};

    // Only show published courses for students
    if (!req.user || req.user.role === "student") {
      query.isPublished = true;
    }

    if (category) {
      query.category = category;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const courses = await Course.find(query)
      .populate("instructor", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Course.countDocuments(query);

    return successResponse(res, "Courses retrieved successfully", {
      courses,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  }
);

/**
 * Get Course by ID
 * @route   GET /api/v1/courses/:id
 * @access  Public (published) / Private (unpublished)
 */
export const getCourseById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const course = await Course.findById(req.params.id).populate(
      "instructor",
      "firstName lastName email profileImage"
    );

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    // Check access for unpublished courses
    if (!course.isPublished) {
      if (
        !req.user ||
        (req.user.role === "student" &&
          req.user._id.toString() !== course.instructor.toString())
      ) {
        throw new AppError("Access denied", 403);
      }
    }

    // Get lessons for each module
    const modulesWithLessons = await Promise.all(
      course.modules.map(async (module) => {
        const lessons = await Lesson.find({
          courseId: course._id,
          moduleId: module._id.toString(),
        }).select("title description type duration order isFree isPublished");

        return {
          ...(module as any).toObject(),
          lessons,
        };
      })
    );

    return successResponse(res, "Course retrieved successfully", {
      ...course.toObject(),
      modules: modulesWithLessons,
    });
  }
);

/**
 * Create Course (Admin/Super Admin)
 * @route   POST /api/v1/courses
 * @access  Private (Admin, Super Admin)
 */
export const createCourse = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const validatedData = courseSchema.parse(req.body);

    const course = await Course.create({
      ...validatedData,
      instructor: req.user?._id,
    });

    await ActivityLog.create({
      userId: req.user?._id,
      action: "COURSE_CREATED",
      category: "course",
      description: `Created course: ${course.title}`,
      metadata: { courseId: course._id },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    return successResponse(res, "Course created successfully", { course }, 201);
  }
);

/**
 * Update Course (Admin/Super Admin)
 * @route   PUT /api/v1/courses/:id
 * @access  Private (Admin, Super Admin)
 */
export const updateCourse = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    const validatedData = courseSchema.partial().parse(req.body);

    Object.assign(course, validatedData);
    await course.save();

    await ActivityLog.create({
      userId: req.user?._id,
      action: "COURSE_UPDATED",
      category: "course",
      description: `Updated course: ${course.title}`,
      metadata: { courseId: course._id },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    return successResponse(res, "Course updated successfully", { course });
  }
);

/**
 * Delete Course (Super Admin Only)
 * @route   DELETE /api/v1/courses/:id
 * @access  Private (Super Admin)
 */
export const deleteCourse = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    // Delete all associated lessons
    await Lesson.deleteMany({ courseId: course._id });

    // Delete all quizzes
    await Quiz.deleteMany({ courseId: course._id });

    // Delete student progress
    await StudentProgress.deleteMany({ courseId: course._id });

    await course.deleteOne();

    await ActivityLog.create({
      userId: req.user?._id,
      action: "COURSE_DELETED",
      category: "course",
      description: `Deleted course: ${course.title}`,
      metadata: { courseId: course._id },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "warning",
    });

    return successResponse(res, "Course deleted successfully");
  }
);

/**
 * Add Module to Course
 * @route   POST /api/v1/courses/:id/modules
 * @access  Private (Admin, Super Admin)
 */
export const addModule = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    const { title, description, order } = req.body;

    course.modules.push({
      _id: new Date().getTime().toString(), // Temporary ID
      title,
      description,
      order: order || course.modules.length + 1,
      isPublished: false,
      lessons: [],
    });

    await course.save();

    return successResponse(res, "Module added successfully", { course });
  }
);

/**
 * Update Module
 * @route   PUT /api/v1/courses/:id/modules/:moduleId
 * @access  Private (Admin, Super Admin)
 */
export const updateModule = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    const module = (course.modules as any).id(req.params.moduleId);

    if (!module) {
      throw new AppError("Module not found", 404);
    }

    const { title, description, order, isPublished } = req.body;

    if (title) module.title = title;
    if (description) module.description = description;
    if (order !== undefined) module.order = order;
    if (isPublished !== undefined) module.isPublished = isPublished;

    await course.save();

    return successResponse(res, "Module updated successfully", { module });
  }
);

/**
 * Delete Module
 * @route   DELETE /api/v1/courses/:id/modules/:moduleId
 * @access  Private (Admin, Super Admin)
 */
export const deleteModule = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    const module = (course.modules as any).id(req.params.moduleId);

    if (!module) {
      throw new AppError("Module not found", 404);
    }

    // Delete all lessons in this module
    await Lesson.deleteMany({ moduleId: req.params.moduleId });

    (course.modules as any).pull(req.params.moduleId);
    await course.save();

    return successResponse(res, "Module deleted successfully");
  }
);

/**
 * Publish/Unpublish Course
 * @route   PATCH /api/v1/courses/:id/publish
 * @access  Private (Admin, Super Admin)
 */
export const togglePublishCourse = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    course.isPublished = !course.isPublished;
    await course.save();

    await ActivityLog.create({
      userId: req.user?._id,
      action: course.isPublished ? "COURSE_PUBLISHED" : "COURSE_UNPUBLISHED",
      category: "course",
      description: `${
        course.isPublished ? "Published" : "Unpublished"
      } course: ${course.title}`,
      metadata: { courseId: course._id },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    return successResponse(
      res,
      `Course ${course.isPublished ? "published" : "unpublished"} successfully`,
      { course }
    );
  }
);
