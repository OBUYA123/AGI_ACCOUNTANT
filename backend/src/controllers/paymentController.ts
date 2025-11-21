import { Response } from "express";
import {
  asyncHandler,
  successResponse,
  errorResponse,
  AppError,
} from "../utils/helpers";
import { AuthRequest } from "../middleware/auth";
import axios from "axios";
import config from "../config";
import Payment from "../models/Payment";
import User from "../models/User";
import StudentProgress from "../models/StudentProgress";
import ActivityLog from "../models/ActivityLog";
import { v4 as uuidv4 } from "uuid";

/**
 * M-Pesa: Get Access Token
 */
const getMpesaAccessToken = async (): Promise<string> => {
  const auth = Buffer.from(
    `${config.mpesa.consumerKey}:${config.mpesa.consumerSecret}`
  ).toString("base64");

  const url =
    config.mpesa.environment === "sandbox"
      ? "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
      : "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  const response = await axios.get(url, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  return response.data.access_token;
};

/**
 * Initiate M-Pesa Payment
 * @route   POST /api/v1/payments/mpesa/initiate
 * @access  Private (Student)
 */
export const initiateMpesaPayment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { phoneNumber, courseId, amount } = req.body;

    if (!phoneNumber || !courseId || !amount) {
      return errorResponse(
        res,
        "Phone number, course ID, and amount are required",
        400
      );
    }

    // Create payment record
    const transactionId = `TXN-${uuidv4()}`;

    const payment = await Payment.create({
      studentId: req.user?._id,
      courseId,
      amount,
      currency: "KES",
      paymentMethod: "mpesa",
      status: "pending",
      transactionId,
      phoneNumber,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    try {
      const accessToken = await getMpesaAccessToken();

      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, 14);

      const password = Buffer.from(
        `${config.mpesa.shortcode}${config.mpesa.passkey}${timestamp}`
      ).toString("base64");

      const url =
        config.mpesa.environment === "sandbox"
          ? "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
          : "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

      const response = await axios.post(
        url,
        {
          BusinessShortCode: config.mpesa.shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: phoneNumber,
          PartyB: config.mpesa.shortcode,
          PhoneNumber: phoneNumber,
          CallBackURL: config.mpesa.callbackUrl,
          AccountReference: transactionId,
          TransactionDesc: "CPA Course Payment",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      payment.externalTransactionId = response.data.CheckoutRequestID;
      await payment.save();

      await ActivityLog.create({
        userId: req.user?._id,
        action: "PAYMENT_INITIATED",
        category: "payment",
        description: "M-Pesa payment initiated",
        metadata: { transactionId, amount, phoneNumber },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        status: "success",
      });

      return successResponse(res, "Payment initiated successfully", {
        transactionId,
        checkoutRequestId: response.data.CheckoutRequestID,
        message: "Please enter your M-Pesa PIN on your phone",
      });
    } catch (error: any) {
      payment.status = "failed";
      payment.failedAt = new Date();
      await payment.save();

      throw new AppError("Failed to initiate M-Pesa payment", 500);
    }
  }
);

/**
 * M-Pesa Callback Handler
 * @route   POST /api/v1/payments/mpesa/callback
 * @access  Public (M-Pesa callback)
 */
export const mpesaCallback = asyncHandler(async (req, res: Response) => {
  const { Body } = req.body;

  if (!Body?.stkCallback) {
    return res.status(200).json({ message: "Callback received" });
  }

  const { ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;
  const transactionId = Body.stkCallback.CheckoutRequestID;

  const payment = await Payment.findOne({
    externalTransactionId: transactionId,
  });

  if (!payment) {
    return res.status(200).json({ message: "Payment not found" });
  }

  if (ResultCode === 0) {
    // Payment successful
    const metadata = CallbackMetadata?.Item || [];
    const mpesaReceiptNumber = metadata.find(
      (item: any) => item.Name === "MpesaReceiptNumber"
    )?.Value;

    payment.status = "completed";
    payment.completedAt = new Date();
    payment.mpesaReceiptNumber = mpesaReceiptNumber;
    await payment.save();

    // Update user payment status
    await User.findByIdAndUpdate(payment.studentId, {
      paymentStatus: "paid",
    });

    // Create progress record
    await StudentProgress.create({
      studentId: payment.studentId,
      courseId: payment.courseId,
    });

    await ActivityLog.create({
      userId: payment.studentId,
      action: "PAYMENT_COMPLETED",
      category: "payment",
      description: "M-Pesa payment completed successfully",
      metadata: {
        transactionId: payment.transactionId,
        amount: payment.amount,
      },
      status: "success",
    });
  } else {
    // Payment failed
    payment.status = "failed";
    payment.failedAt = new Date();
    await payment.save();

    await ActivityLog.create({
      userId: payment.studentId,
      action: "PAYMENT_FAILED",
      category: "payment",
      description: `M-Pesa payment failed: ${ResultDesc}`,
      metadata: { transactionId: payment.transactionId },
      status: "failure",
    });
  }

  return res.status(200).json({ message: "Callback processed" });
});

/**
 * Initiate PayPal Payment
 * @route   POST /api/v1/payments/paypal/initiate
 * @access  Private (Student)
 */
export const initiatePayPalPayment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { courseId, amount } = req.body;

    if (!courseId || !amount) {
      return errorResponse(res, "Course ID and amount are required", 400);
    }

    const transactionId = `TXN-${uuidv4()}`;

    const payment = await Payment.create({
      studentId: req.user?._id,
      courseId,
      amount,
      currency: "USD",
      paymentMethod: "paypal",
      status: "pending",
      transactionId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    try {
      // Get PayPal access token
      const auth = Buffer.from(
        `${config.paypal.clientId}:${config.paypal.clientSecret}`
      ).toString("base64");

      const tokenUrl =
        config.paypal.mode === "sandbox"
          ? "https://api-m.sandbox.paypal.com/v1/oauth2/token"
          : "https://api-m.paypal.com/v1/oauth2/token";

      const tokenResponse = await axios.post(
        tokenUrl,
        "grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // Create PayPal order
      const orderUrl =
        config.paypal.mode === "sandbox"
          ? "https://api-m.sandbox.paypal.com/v2/checkout/orders"
          : "https://api-m.paypal.com/v2/checkout/orders";

      const orderResponse = await axios.post(
        orderUrl,
        {
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: transactionId,
              amount: {
                currency_code: "USD",
                value: amount.toString(),
              },
              description: "CPA Course Payment",
            },
          ],
          application_context: {
            return_url: `${config.frontend.url}/payment/success`,
            cancel_url: `${config.frontend.url}/payment/cancel`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      payment.paypalOrderId = orderResponse.data.id;
      await payment.save();

      const approveLink = orderResponse.data.links.find(
        (link: any) => link.rel === "approve"
      );

      return successResponse(res, "PayPal payment initiated", {
        transactionId,
        orderId: orderResponse.data.id,
        approveUrl: approveLink?.href,
      });
    } catch (error: any) {
      payment.status = "failed";
      payment.failedAt = new Date();
      await payment.save();

      throw new AppError("Failed to initiate PayPal payment", 500);
    }
  }
);

/**
 * Verify PayPal Payment
 * @route   POST /api/v1/payments/paypal/verify
 * @access  Private (Student)
 */
export const verifyPayPalPayment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { orderId } = req.body;

    if (!orderId) {
      return errorResponse(res, "Order ID is required", 400);
    }

    const payment = await Payment.findOne({ paypalOrderId: orderId });

    if (!payment) {
      throw new AppError("Payment not found", 404);
    }

    try {
      // Get PayPal access token
      const auth = Buffer.from(
        `${config.paypal.clientId}:${config.paypal.clientSecret}`
      ).toString("base64");

      const tokenUrl =
        config.paypal.mode === "sandbox"
          ? "https://api-m.sandbox.paypal.com/v1/oauth2/token"
          : "https://api-m.paypal.com/v1/oauth2/token";

      const tokenResponse = await axios.post(
        tokenUrl,
        "grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // Capture payment
      const captureUrl =
        config.paypal.mode === "sandbox"
          ? `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`
          : `https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`;

      const captureResponse = await axios.post(
        captureUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (captureResponse.data.status === "COMPLETED") {
        payment.status = "completed";
        payment.completedAt = new Date();
        payment.paypalPayerId = captureResponse.data.payer.payer_id;
        await payment.save();

        // Update user payment status
        await User.findByIdAndUpdate(payment.studentId, {
          paymentStatus: "paid",
        });

        // Create progress record
        await StudentProgress.create({
          studentId: payment.studentId,
          courseId: payment.courseId,
        });

        await ActivityLog.create({
          userId: payment.studentId,
          action: "PAYMENT_COMPLETED",
          category: "payment",
          description: "PayPal payment completed successfully",
          metadata: {
            transactionId: payment.transactionId,
            amount: payment.amount,
          },
          status: "success",
        });

        return successResponse(res, "Payment completed successfully", {
          payment,
        });
      } else {
        throw new AppError("Payment not completed", 400);
      }
    } catch (error: any) {
      payment.status = "failed";
      payment.failedAt = new Date();
      await payment.save();

      throw new AppError("Failed to verify PayPal payment", 500);
    }
  }
);

/**
 * Get Payment History
 * @route   GET /api/v1/payments/history
 * @access  Private
 */
export const getPaymentHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const query: any = {};

    // Students see only their payments
    if (req.user?.role === "student") {
      query.studentId = req.user._id;
    }

    const payments = await Payment.find(query)
      .populate("studentId", "firstName lastName email")
      .populate("courseId", "title")
      .sort({ createdAt: -1 });

    return successResponse(res, "Payment history retrieved successfully", {
      payments,
    });
  }
);
