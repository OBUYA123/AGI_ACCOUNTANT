import { Router } from "express";
import {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  markLessonComplete,
  addBookmark,
  addNote,
} from "../controllers/lessonController";
import { protect, authorize } from "../middleware/auth";

const router = Router();

/**
 * All routes require authentication
 */
router.use(protect);

/**
 * Student Routes
 */
router.get("/", getLessons);
router.get("/:id", getLessonById);
router.post("/:id/complete", markLessonComplete);
router.post("/:id/bookmark", addBookmark);
router.post("/:id/notes", addNote);

/**
 * Admin Routes
 */
router.post("/", authorize("super_admin", "admin"), createLesson);
router.put("/:id", authorize("super_admin", "admin"), updateLesson);
router.delete("/:id", authorize("super_admin", "admin"), deleteLesson);

export default router;
