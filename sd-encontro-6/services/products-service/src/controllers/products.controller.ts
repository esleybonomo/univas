import { Request, Response } from "express";
import { ProductsService } from "../services/products.service";

/**
 * Controlador para endpoints relacionados a produtos.
 * Lida com a requisição HTTP, valida entrada e chama o serviço.
 */
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  /**
   * GET /api/products - Lista todos os produtos.
   */
  list = (req: Request, res: Response) => {
    res.json(this.service.list());
  };

  /**
   * GET /api/products/:id - Busca um produto por ID.
   */
  getById = async (req: Request, res: Response) => {
    console.log(`Buscando produto com ID: ${req.params.id}`);
    const product = this.service.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  };

  /**
   * POST /api/products - Cria um novo produto.
   */
  create = (req: Request, res: Response) => {
    const { name, price } = req.body ?? {};
    if (!name || typeof price !== "number") {
      return res.status(400).json({ error: "Name and price (number) are required" });
    }
    const product = this.service.create({ name, price });
    res.status(201).json(product); // Retorna 201 Created
  };

  /**
   * PUT /api/products/:id - Atualiza um produto existente.
   */
  update = (req: Request, res: Response) => {
    const { name, price } = req.body ?? {};
    const updated = this.service.update(req.params.id, { name, price });
    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(updated);
  };

  /**
   * DELETE /api/products/:id - Remove um produto.
   */
  delete = (req: Request, res: Response) => {
    const ok = this.service.delete(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(204).send(); // Retorna 204 No Content
  };
}
