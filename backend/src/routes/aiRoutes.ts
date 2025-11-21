import { Router } from "express";
import {
  createChatSession,
  sendMessage,
  getChatSessions,
  getChatSession,
  deleteChatSession,
  analyzeDocument,
} from "../controllers/aiController";
import { protect } from "../middleware/auth";

const router = Router();

/**
 * All routes require authentication
 */
router.use(protect);

/**
 * Chat Management
 */
router.post("/chat/create", createChatSession);
router.get("/chat", getChatSessions);
router.get("/chat/:sessionId", getChatSession);
router.post("/chat/:sessionId/message", sendMessage);
router.delete("/chat/:sessionId", deleteChatSession);

/**
 * Document Analysis
 */
router.post("/analyze-document", analyzeDocument);

export default router;
