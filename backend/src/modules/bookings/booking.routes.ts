import { Router } from "express";
import { bookingController } from "./booking.controller";
import { requireAuth } from "../../shared/middlewares/auth.middleware";

const bookingRoutes = Router();

bookingRoutes.use("/bookings", requireAuth);

bookingRoutes.post("/bookings", bookingController.create);
bookingRoutes.get("/bookings/received", bookingController.listReceived); // propostas recebidas (proprietário)
bookingRoutes.get("/bookings/sent", bookingController.listSent); // propostas enviadas (dentista)
bookingRoutes.get("/bookings/:id", bookingController.getById);
bookingRoutes.patch("/bookings/:id/accept", bookingController.accept);
bookingRoutes.patch("/bookings/:id/reject", bookingController.reject);
bookingRoutes.post("/bookings/:id/messages", bookingController.addMessage);

export { bookingRoutes };
