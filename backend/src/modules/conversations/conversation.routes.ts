import { Router } from "express";
import { conversationController } from "./conversation.controller";
import { requireAuth } from "../../shared/middlewares/auth.middleware";

const conversationRoutes = Router();

conversationRoutes.use("/conversations", requireAuth);

conversationRoutes.post("/conversations", conversationController.start);
conversationRoutes.get("/conversations", conversationController.list);
conversationRoutes.get("/conversations/:id", conversationController.getById);
conversationRoutes.post("/conversations/:id/messages", conversationController.addMessage);

export { conversationRoutes };
