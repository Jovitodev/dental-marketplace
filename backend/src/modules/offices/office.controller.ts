import { Request, Response } from "express";
import { officeService, OfficeValidationError } from "./office.service";

// Camada de Controller: só entende HTTP (req/res).
// Toda regra de negócio fica na Service; toda persistência, no Repository.

function handleError(res: Response, error: unknown) {
  if (error instanceof OfficeValidationError) {
    return res.status(400).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: "Erro interno no servidor." });
}

// Garante que só o dono do consultório (ou um admin) possa alterá-lo.
async function assertOwnership(req: Request, res: Response, officeId: string): Promise<boolean> {
  const office = await officeService.getById(officeId);
  const authUser = req.authUser!;
  if (office.ownerId !== authUser.id && authUser.role !== "admin") {
    res.status(403).json({ message: "Você não tem permissão para alterar este consultório." });
    return false;
  }
  return true;
}

export const officeController = {
  async create(req: Request, res: Response) {
    try {
      // ownerId nunca vem do corpo da requisição — sempre do usuário autenticado.
      const office = await officeService.create({ ...req.body, ownerId: req.authUser!.id });
      return res.status(201).json(office);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async list(req: Request, res: Response) {
    try {
      const { ownerId, status, moderationStatus } = req.query;
      const offices = await officeService.list({
        ownerId: ownerId as string | undefined,
        status: status as string | undefined,
        moderationStatus: moderationStatus as string | undefined,
      });
      return res.status(200).json(offices);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const office = await officeService.getById(req.params.id);
      return res.status(200).json(office);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async update(req: Request, res: Response) {
    try {
      if (!(await assertOwnership(req, res, req.params.id))) return;
      const office = await officeService.update(req.params.id, req.body);
      return res.status(200).json(office);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async toggleStatus(req: Request, res: Response) {
    try {
      if (!(await assertOwnership(req, res, req.params.id))) return;
      const office = await officeService.toggleStatus(req.params.id);
      return res.status(200).json(office);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async remove(req: Request, res: Response) {
    try {
      if (!(await assertOwnership(req, res, req.params.id))) return;
      await officeService.remove(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error);
    }
  },
};
