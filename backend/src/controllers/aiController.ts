import { Response } from "express";
import {
  asyncHandler,
  successResponse,
  errorResponse,
  AppError,
} from "../utils/helpers";
import { AuthRequest } from "../middleware/auth";
import AIChatSession from "../models/AIChatSession";
import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config";
import { z } from "zod";

/**
 * Create Chat Session
 * @route   POST /api/v1/ai/chat/create
 * @access  Private
 */
export const createChatSession = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const schema = z.object({
      title: z.string().min(1, "Title is required"),
      category: z.enum([
        "accounting",
        "economics",
        "tax",
        "audit",
        "cpa_concept",
        "general",
      ]),
    });

    const { title, category } = schema.parse(req.body);

    const session = await AIChatSession.create({
      userId: req.user?._id,
      title,
      category,
      messages: [],
    });

    return successResponse(
      res,
      "Chat session created successfully",
      { session },
      201
    );
  }
);

/**
 * Send Message to AI
 * @route   POST /api/v1/ai/chat/:sessionId/message
 * @access  Private
 */
export const sendMessage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return errorResponse(res, "Message is required", 400);
    }

    const session = await AIChatSession.findOne({
      _id: req.params.sessionId,
      userId: req.user?._id,
    });

    if (!session) {
      throw new AppError("Chat session not found", 404);
    }

    // Add user message
    session.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // Prepare context for AI
    const systemPrompt = getSystemPrompt(session.category);
    const conversationHistory = session.messages.slice(-10).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      let aiResponse: string;

      if (config.ai.provider === "gemini") {
        // Call Gemini API
        const genAI = new GoogleGenerativeAI(config.ai.geminiApiKey);
        const model = genAI.getGenerativeModel({ model: config.ai.model });

        // Format conversation for Gemini
        const prompt = `${systemPrompt}\n\nConversation History:\n${conversationHistory
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join("\n")}\n\nUser: ${message}\n\nAssistant:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        aiResponse = response.text();
      } else {
        throw new AppError("AI provider not configured", 500);
      }

      // Add AI response
      session.messages.push({
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      });

      session.lastMessageAt = new Date();
      await session.save();

      return successResponse(res, "Message sent successfully", {
        message: aiResponse,
        sessionId: session._id,
      });
    } catch (error: any) {
      throw new AppError("Failed to get AI response: " + error.message, 500);
    }
  }
);

/**
 * Get Chat Sessions
 * @route   GET /api/v1/ai/chat
 * @access  Private
 */
export const getChatSessions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { category, page = 1, limit = 10 } = req.query;

    const query: any = {
      userId: req.user?._id,
      isActive: true,
    };

    if (category) query.category = category;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const sessions = await AIChatSession.find(query)
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select("-messages"); // Don't include full message history in list

    const total = await AIChatSession.countDocuments(query);

    return successResponse(res, "Chat sessions retrieved successfully", {
      sessions,
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
 * Get Chat Session by ID
 * @route   GET /api/v1/ai/chat/:sessionId
 * @access  Private
 */
export const getChatSession = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const session = await AIChatSession.findOne({
      _id: req.params.sessionId,
      userId: req.user?._id,
    });

    if (!session) {
      throw new AppError("Chat session not found", 404);
    }

    return successResponse(res, "Chat session retrieved successfully", {
      session,
    });
  }
);

/**
 * Delete Chat Session
 * @route   DELETE /api/v1/ai/chat/:sessionId
 * @access  Private
 */
export const deleteChatSession = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const session = await AIChatSession.findOne({
      _id: req.params.sessionId,
      userId: req.user?._id,
    });

    if (!session) {
      throw new AppError("Chat session not found", 404);
    }

    session.isActive = false;
    await session.save();

    return successResponse(res, "Chat session deleted successfully");
  }
);

/**
 * Analyze Document
 * @route   POST /api/v1/ai/analyze-document
 * @access  Private
 */
export const analyzeDocument = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { documentText, analysisType } = req.body;

    if (!documentText) {
      return errorResponse(res, "Document text is required", 400);
    }

    const prompt = `Analyze the following ${
      analysisType || "financial"
    } document and provide insights:\n\n${documentText}`;

    try {
      let analysis: string;

      if (config.ai.provider === "gemini") {
        const genAI = new GoogleGenerativeAI(config.ai.geminiApiKey);
        const model = genAI.getGenerativeModel({ model: config.ai.model });

        const systemContext =
          "You are an expert accountant and financial analyst. Provide detailed, professional analysis of documents.";
        const fullPrompt = `${systemContext}\n\n${prompt}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        analysis = response.text();
      } else {
        throw new AppError("AI provider not configured", 500);
      }

      return successResponse(res, "Document analyzed successfully", {
        analysis,
      });
    } catch (error: any) {
      throw new AppError("Failed to analyze document: " + error.message, 500);
    }
  }
);

/**
 * Get system prompt based on category
 */
function getSystemPrompt(category: string): string {
  const prompts: Record<string, string> = {
    accounting: `You are an expert CPA and accounting assistant. Help users with accounting principles, journal entries, financial statements, and accounting standards (GAAP, IFRS). Provide step-by-step explanations and examples.`,
    economics: `You are an expert economist and financial analyst. Help users understand economic principles, market analysis, macroeconomics, microeconomics, and financial forecasting.`,
    tax: `You are an expert tax consultant. Help users with tax planning, tax regulations, deductions, credits, and tax compliance. Always remind users to consult with a licensed tax professional for specific situations.`,
    audit: `You are an expert auditor. Help users understand audit procedures, internal controls, risk assessment, and audit standards. Provide guidance on audit planning and execution.`,
    cpa_concept: `You are a CPA exam tutor. Explain CPA exam concepts clearly, provide practice problems, and help students prepare for the CPA examination. Break down complex topics into simple, understandable parts.`,
    general: `You are a helpful AI assistant specializing in accounting, finance, and business. Provide accurate, professional assistance to users' questions.`,
  };

  return prompts[category] || prompts.general;
}
