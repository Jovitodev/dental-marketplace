import { Request, Response } from "express";
import { AuthError, userService } from "./user.service";

function handleError(res: Response, error: unknown) {
  if (error instanceof AuthError) {
    return res.status(400).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: "Erro interno no servidor." });
}

export const userController = {
  async register(req: Request, res: Response) {
    try {
      const result = await userService.register(req.body);
      return res.status(201).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async login(req: Request, res: Response) {
    try {
      const result = await userService.login(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async getPublicProfile(req: Request, res: Response) {
    try {
      const profile = await userService.getPublicProfile(req.params.id);
      return res.status(200).json(profile);
    } catch (error) {
      return handleError(res, error);
    }
  },
};
