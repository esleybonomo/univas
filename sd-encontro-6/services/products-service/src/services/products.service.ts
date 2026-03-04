import { Product } from "../models/product.model";
import { newId } from "../utils/id";

// Tipos para entrada de dados, separando do modelo interno
type CreateProductInput = { name: string; price: number };
type UpdateProductInput = { name?: string; price?: number };

/**
 * Serviço de lógica de negócio para produtos.
 * Armazena dados em memória (array).
 */
export class ProductsService {
  private products: Product[] = []; // Armazenamento em memória

  /**
   * Lista todos os produtos.
   */
  list(): Product[] {
    return this.products;
  }

  /**
   * Busca um produto pelo ID.
   * @param id O ID do produto.
   * @returns O produto encontrado ou undefined se não existir.
   */
  getById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  /**
   * Cria um novo produto.
   * @param input Dados para criação do produto.
   * @returns O produto criado.
   */
  create(input: CreateProductInput): Product {
    const product: Product = {
      id: newId(),
      name: input.name,
      price: input.price,
      createdAt: new Date().toISOString()
    };
    this.products.push(product);
    return product;
  }

  /**
   * Atualiza um produto existente.
   * @param id O ID do produto a ser atualizado.
   * @param input Dados para atualização.
   * @returns O produto atualizado ou undefined se não encontrado.
   */
  update(id: string, input: UpdateProductInput): Product | undefined {
    const product = this.getById(id);
    if (!product) return undefined;

    // Atualiza apenas os campos fornecidos
    if (typeof input.name === "string") product.name = input.name;
    if (typeof input.price === "number") product.price = input.price;

    return product;
  }

  /**
   * Remove um produto.
   * @param id O ID do produto a ser removido.
   * @returns true se o produto foi removido, false se não encontrado.
   */
  delete(id: string): boolean {
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    return this.products.length !== initialLength; // Retorna true se o tamanho diminuiu
  }
}
