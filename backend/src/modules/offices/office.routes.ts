import { Router } from "express";
import { officeController } from "./office.controller";

// Todas as rotas deste módulo ficam isoladas aqui.
// Para adicionar um novo módulo (ex: chat, reviews, payments),
// crie uma pasta irmã em src/modules e registre as rotas em src/server.ts.

const officeRoutes = Router();

officeRoutes.post("/offices", officeController.create);
officeRoutes.get("/offices", officeController.list);
officeRoutes.get("/offices/:id", officeController.getById);
officeRoutes.put("/offices/:id", officeController.update);
officeRoutes.patch("/offices/:id/toggle-status", officeController.toggleStatus);
officeRoutes.delete("/offices/:id", officeController.remove);

export { officeRoutes };
