import { Request, Response } from "express";
import { ConversationValidationError, conversationService } from "./conversation.service";

function handleError(res: Response, error: unknown) {
  if (error instanceof ConversationValidationError) {
    return res.status(400).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: "Erro interno no servidor." });
}

export const conversationController = {
  async start(req: Request, res: Response) {
    try {
      const dentistId = req.authUser!.id;
      const conversation = await conversationService.startOrContinue(dentistId, req.body);
      return res.status(201).json(conversation);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async list(req: Request, res: Response) {
    try {
      const conversations = await conversationService.listForUser(req.authUser!.id);
      return res.status(200).json(conversations);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const conversation = await conversationService.getById(req.params.id);
      const userId = req.authUser!.id;
      if (conversation.dentistId !== userId && conversation.ownerId !== userId) {
        return res.status(403).json({ message: "Você não tem acesso a esta conversa." });
      }
      return res.status(200).json(conversation);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async addMessage(req: Request, res: Response) {
    try {
      const senderId = req.authUser!.id;
      const conversation = await conversationService.addMessage(req.params.id, senderId, req.body.text);
      return res.status(200).json(conversation);
    } catch (error) {
      return handleError(res, error);
    }
  },
};
