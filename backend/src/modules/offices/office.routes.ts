import { Router } from "express";
import { officeController } from "./office.controller";
import { requireAuth } from "../../shared/middlewares/auth.middleware";

// Todas as rotas deste módulo ficam isoladas aqui.
// Para adicionar um novo módulo (ex: chat, reviews, payments),
// crie uma pasta irmã em src/modules e registre as rotas em src/server.ts.

const officeRoutes = Router();

// Leitura é pública (qualquer visitante pode buscar consultórios).
officeRoutes.get("/offices", officeController.list);
officeRoutes.get("/offices/:id", officeController.getById);

// Escrita exige autenticação — o ownerId é sempre derivado do usuário
// autenticado (req.authUser.id), nunca do corpo da requisição.
officeRoutes.post("/offices", requireAuth, officeController.create);
officeRoutes.put("/offices/:id", requireAuth, officeController.update);
officeRoutes.patch("/offices/:id/toggle-status", requireAuth, officeController.toggleStatus);
officeRoutes.delete("/offices/:id", requireAuth, officeController.remove);

export { officeRoutes };
