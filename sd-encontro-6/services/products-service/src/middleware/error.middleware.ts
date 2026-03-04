import { NextFunction, Request, Response } from "express";

/**
 * Middleware de tratamento de erros global.
 * Captura erros não tratados e retorna uma resposta 500.
 */
export function errorMiddleware(
  err: unknown, // Tipo genérico para erro
  req: Request,
  res: Response,
  next: NextFunction // Necessário mesmo que não usado para ser reconhecido como middleware de erro
) {
  console.error("[ERROR] Unhandled error:", err); // Loga o erro para depuração
  res.status(500).json({ error: "Internal server error" });
}
