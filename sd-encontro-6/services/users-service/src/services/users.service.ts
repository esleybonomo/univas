import { User } from "../models/user.model";
import { newId } from "../utils/id";

// Tipos para entrada de dados, separando do modelo interno
type CreateUserInput = { name: string; email: string };
type UpdateUserInput = { name?: string; email?: string };

/**
 * Serviço de lógica de negócio para usuários.
 * Armazena dados em memória (array).
 */
export class UsersService {
  private users: User[] = []; // Armazenamento em memória

  /**
   * Lista todos os usuários.
   */
  list(): User[] {
    return this.users;
  }

  /**
   * Busca um usuário pelo ID.
   * @param id O ID do usuário.
   * @returns O usuário encontrado ou undefined se não existir.
   */
  getById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  /**
   * Cria um novo usuário.
   * @param input Dados para criação do usuário.
   * @returns O usuário criado.
   */
  create(input: CreateUserInput): User {
    const user: User = {
      id: newId(),
      name: input.name,
      email: input.email,
      createdAt: new Date().toISOString()
    };
    this.users.push(user);
    return user;
  }

  /**
   * Atualiza um usuário existente.
   * @param id O ID do usuário a ser atualizado.
   * @param input Dados para atualização.
   * @returns O usuário atualizado ou undefined se não encontrado.
   */
  update(id: string, input: UpdateUserInput): User | undefined {
    const user = this.getById(id);
    if (!user) return undefined;

    // Atualiza apenas os campos fornecidos
    if (typeof input.name === "string") user.name = input.name;
    if (typeof input.email === "string") user.email = input.email;

    return user;
  }

  /**
   * Remove um usuário.
   * @param id O ID do usuário a ser removido.
   * @returns true se o usuário foi removido, false se não encontrado.
   */
  delete(id: string): boolean {
    const initialLength = this.users.length;
    this.users = this.users.filter(u => u.id !== id);
    return this.users.length !== initialLength; // Retorna true se o tamanho diminuiu
  }
}
