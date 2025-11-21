import { Router } from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addModule,
  updateModule,
  deleteModule,
  togglePublishCourse,
} from "../controllers/courseController";
import { protect, authorize, superAdminOnly } from "../middleware/auth";

const router = Router();

/**
 * Public/Student Routes
 */
router.get("/", getCourses);
router.get("/:id", getCourseById);

/**
 * Admin Routes
 */
router.post("/", protect, authorize("super_admin", "admin"), createCourse);
router.put("/:id", protect, authorize("super_admin", "admin"), updateCourse);
router.patch(
  "/:id/publish",
  protect,
  authorize("super_admin", "admin"),
  togglePublishCourse
);

/**
 * Module Management
 */
router.post(
  "/:id/modules",
  protect,
  authorize("super_admin", "admin"),
  addModule
);
router.put(
  "/:id/modules/:moduleId",
  protect,
  authorize("super_admin", "admin"),
  updateModule
);
router.delete(
  "/:id/modules/:moduleId",
  protect,
  authorize("super_admin", "admin"),
  deleteModule
);

/**
 * Super Admin Only
 */
router.delete("/:id", protect, superAdminOnly, deleteCourse);

export default router;
