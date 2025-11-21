import { Router } from "express";
import {
  calculateBalanceSheet,
  calculateProfitLoss,
  calculateDepreciation,
  calculateBreakEven,
  getSavedResults,
  getResultById,
  deleteResult,
  exportResultToPDF,
} from "../controllers/accountingController";
import { protect } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(protect);

/**
 * Accounting Tool Calculators
 */
router.post("/balance-sheet", calculateBalanceSheet);
router.post("/profit-loss", calculateProfitLoss);
router.post("/depreciation", calculateDepreciation);
router.post("/break-even", calculateBreakEven);

/**
 * Saved Results Management
 */
router.get("/results", getSavedResults);
router.get("/results/:id", getResultById);
router.delete("/results/:id", deleteResult);
router.get("/results/:id/export", exportResultToPDF);

export default router;
