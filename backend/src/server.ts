import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { officeRoutes } from "./modules/offices/office.routes";
import { userRoutes } from "./modules/users/user.routes";
import { adminRoutes } from "./modules/admin/admin.routes";
import { bookingRoutes } from "./modules/bookings/booking.routes";

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

// Healthcheck simples
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "dental-marketplace-api" });
});

// Registro dos módulos (feature-based).
// Ex futuro: app.use("/api", chatRoutes); app.use("/api", reviewRoutes);
app.use("/api", officeRoutes);
app.use("/api", userRoutes);
app.use("/api", adminRoutes);
app.use("/api", bookingRoutes);

// 404 padrão
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Rota não encontrada." });
});

// Handler de erro global (fallback de segurança)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Erro interno no servidor." });
});

app.listen(PORT, () => {
  console.log(`🦷 API do Dental Marketplace rodando em http://localhost:${PORT}`);
  console.log(`   Healthcheck: http://localhost:${PORT}/health`);
  console.log(`   Consultórios: http://localhost:${PORT}/api/offices`);
});
