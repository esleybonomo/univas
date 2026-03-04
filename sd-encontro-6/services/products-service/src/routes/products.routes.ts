import { Router } from "express";
import { ProductsService } from "../services/products.service";
import { ProductsController } from "../controllers/products.controller";

/**
 * Define as rotas da API para o recurso 'products'.
 */
export function productsRoutes(): Router {
  const router = Router();
  const service = new ProductsService(); // Instancia o serviço
  const controller = new ProductsController(service); // Instancia o controlador com o serviço

  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.post("/", controller.create);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.delete);

  return router;
}
