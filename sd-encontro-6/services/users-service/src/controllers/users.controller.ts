import { Request, Response } from "express";
import { UsersService } from "../services/users.service";

/**
 * Controlador para endpoints relacionados a usuários.
 * Lida com a requisição HTTP, valida entrada e chama o serviço.
 */
export class UsersController {
  constructor(private readonly service: UsersService) {}

  /**
   * GET /api/users - Lista todos os usuários.
   */
  list = (req: Request, res: Response) => {
    res.json(this.service.list());
  };

  /**
   * GET /api/users/:id - Busca um usuário por ID.
   */
  getById = (req: Request, res: Response) => {
    const user = this.service.getById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  };

  /**
   * POST /api/users - Cria um novo usuário.
   */
  create = (req: Request, res: Response) => {
    const { name, email } = req.body ?? {}; // Usa nullish coalescing para evitar erro se body for undefined
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    const user = this.service.create({ name, email });
    res.status(201).json(user); // Retorna 201 Created
  };

  /**
   * PUT /api/users/:id - Atualiza um usuário existente.
   */
  update = (req: Request, res: Response) => {
    const { name, email } = req.body ?? {};
    const updated = this.service.update(req.params.id, { name, email });
    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(updated);
  };

  /**
   * DELETE /api/users/:id - Remove um usuário.
   */
  delete = (req: Request, res: Response) => {
    const ok = this.service.delete(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(204).send(); // Retorna 204 No Content
  };
}
