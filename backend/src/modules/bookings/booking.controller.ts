import { Request, Response } from "express";
import { BookingValidationError, bookingService } from "./booking.service";

function handleError(res: Response, error: unknown) {
  if (error instanceof BookingValidationError) {
    return res.status(400).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: "Erro interno no servidor." });
}

export const bookingController = {
  async create(req: Request, res: Response) {
    try {
      // dentistId nunca vem do corpo da requisição — sempre do usuário autenticado.
      const dentistId = req.authUser!.id;
      const booking = await bookingService.create(dentistId, req.body);
      return res.status(201).json(booking);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async listReceived(req: Request, res: Response) {
    try {
      const ownerId = req.authUser!.id;
      const status = req.query.status as string | undefined;
      const bookings = await bookingService.listReceived(ownerId, status);
      return res.status(200).json(bookings);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async listSent(req: Request, res: Response) {
    try {
      const dentistId = req.authUser!.id;
      const status = req.query.status as string | undefined;
      const bookings = await bookingService.listSent(dentistId, status);
      return res.status(200).json(bookings);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const booking = await bookingService.getById(req.params.id);
      const userId = req.authUser!.id;
      if (booking.ownerId !== userId && booking.dentistId !== userId) {
        return res.status(403).json({ message: "Você não tem acesso a esta proposta." });
      }
      return res.status(200).json(booking);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async accept(req: Request, res: Response) {
    try {
      const booking = await bookingService.accept(req.params.id, req.authUser!.id);
      return res.status(200).json(booking);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async reject(req: Request, res: Response) {
    try {
      const booking = await bookingService.reject(req.params.id, req.authUser!.id);
      return res.status(200).json(booking);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async addMessage(req: Request, res: Response) {
    try {
      const senderId = req.authUser!.id;
      const booking = await bookingService.addMessage(req.params.id, senderId, req.body.text);
      return res.status(200).json(booking);
    } catch (error) {
      return handleError(res, error);
    }
  },
};
