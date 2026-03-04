import { Router } from "express";
import { UsersService } from "../services/users.service";
import { UsersController } from "../controllers/users.controller";

/**
 * Define as rotas da API para o recurso 'users'.
 */
export function usersRoutes(): Router {
  const router = Router();
  const service = new UsersService(); // Instancia o serviço
  const controller = new UsersController(service); // Instancia o controlador com o serviço

  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.post("/", controller.create);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.delete);

  return router;
}
