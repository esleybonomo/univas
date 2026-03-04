import express from "express";
import { usersRoutes } from "./routes/users.routes";
import { errorMiddleware } from "./middleware/error.middleware";

/**
 * Cria e configura a aplicação Express para o Users Service.
 */
export function createApp() {
  const app = express();

  // Middleware para parsear JSON no corpo das requisições
  app.use(express.json());

  // Endpoint de health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "users-service" });
  });

  // Rotas da API para usuários
  app.use("/api/users", usersRoutes());

  // Middleware de tratamento de erros (deve ser o último)
  app.use(errorMiddleware);

  return app;
}
