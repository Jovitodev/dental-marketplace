import { Router } from "express";
import { adminController } from "./admin.controller";
import { requireAdmin } from "../../shared/middlewares/auth.middleware";

const adminRoutes = Router();

// Todas as rotas abaixo exigem um usuário autenticado com role "admin".
adminRoutes.use("/admin", requireAdmin);

adminRoutes.get("/admin/metrics", adminController.getMetrics);
adminRoutes.get("/admin/finance", adminController.getFinanceSummary);

adminRoutes.get("/admin/users", adminController.listUsers);
adminRoutes.patch("/admin/users/:id/ban", adminController.toggleBanUser);
adminRoutes.patch("/admin/users/:id/promote", adminController.togglePromoteUser);

adminRoutes.get("/admin/offices/pending", adminController.listPendingOffices);
adminRoutes.patch("/admin/offices/:id/approve", adminController.approveOffice);
adminRoutes.patch("/admin/offices/:id/reject", adminController.rejectOffice);

export { adminRoutes };
