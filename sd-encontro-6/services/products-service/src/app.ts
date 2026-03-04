import express from "express";
import { productsRoutes } from "./routes/products.routes";
import { errorMiddleware } from "./middleware/error.middleware";

/**
 * Cria e configura a aplicação Express para o Products Service.
 */
export function createApp() {
  const app = express();

  // Middleware para parsear JSON no corpo das requisições
  app.use(express.json());

  // Endpoint de health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "products-service" });
  });

  // Rotas da API para produtos
  app.use("/api/products", productsRoutes());

  // Middleware de tratamento de erros (deve ser o último)
  app.use(errorMiddleware);

  return app;
}
