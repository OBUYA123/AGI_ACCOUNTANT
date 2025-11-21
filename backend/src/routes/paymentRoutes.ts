import { Router } from "express";
import {
  initiateMpesaPayment,
  mpesaCallback,
  initiatePayPalPayment,
  verifyPayPalPayment,
  getPaymentHistory,
} from "../controllers/paymentController";
import { protect, authorize } from "../middleware/auth";
import { paymentLimiter } from "../middleware/rateLimiter";

const router = Router();

/**
 * M-Pesa Routes
 */
router.post("/mpesa/initiate", protect, paymentLimiter, initiateMpesaPayment);
router.post("/mpesa/callback", mpesaCallback);

/**
 * PayPal Routes
 */
router.post("/paypal/initiate", protect, paymentLimiter, initiatePayPalPayment);
router.post("/paypal/verify", protect, verifyPayPalPayment);

/**
 * Payment History
 */
router.get("/history", protect, getPaymentHistory);

export default router;
