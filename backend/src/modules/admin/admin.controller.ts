import { Request, Response } from "express";
import { adminService } from "./admin.service";
import { userService, AuthError } from "../users/user.service";
import { officeService, OfficeValidationError } from "../offices/office.service";

function handleError(res: Response, error: unknown) {
  if (error instanceof AuthError || error instanceof OfficeValidationError) {
    return res.status(400).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: "Erro interno no servidor." });
}

export const adminController = {
  async getMetrics(_req: Request, res: Response) {
    try {
      const metrics = await adminService.getMetrics();
      return res.status(200).json(metrics);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async getFinanceSummary(_req: Request, res: Response) {
    try {
      const finance = await adminService.getFinanceSummary();
      return res.status(200).json(finance);
    } catch (error) {
      return handleError(res, error);
    }
  },

  // ---------- Usuários ----------

  async listUsers(_req: Request, res: Response) {
    try {
      const users = await userService.listAll();
      return res.status(200).json(users);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async toggleBanUser(req: Request, res: Response) {
    try {
      // Admin não pode banir a si mesmo.
      if (req.params.id === req.authUser?.id) {
        return res.status(400).json({ message: "Você não pode banir a própria conta." });
      }
      const user = await userService.toggleBan(req.params.id);
      return res.status(200).json(user);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async togglePromoteUser(req: Request, res: Response) {
    try {
      const user = await userService.togglePromote(req.params.id);
      return res.status(200).json(user);
    } catch (error) {
      return handleError(res, error);
    }
  },

  // ---------- Moderação de Clínicas ----------

  async listPendingOffices(_req: Request, res: Response) {
    try {
      const offices = await officeService.listPending();
      return res.status(200).json(offices);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async approveOffice(req: Request, res: Response) {
    try {
      const office = await officeService.approve(req.params.id);
      return res.status(200).json(office);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async rejectOffice(req: Request, res: Response) {
    try {
      const office = await officeService.reject(req.params.id);
      return res.status(200).json(office);
    } catch (error) {
      return handleError(res, error);
    }
  },
};
