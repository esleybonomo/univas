import { Order, CreateOrderDTO } from '../models/order.model';
import { generateId } from '../utils/id';

// Armazenamento em memória
const orders: Map<string, Order> = new Map();

export class OrderService {
  /**
   * TAREFA: Implementar chamada ao Users Service
   * Validar se o usuário existe em http://localhost:3001/api/users/:id
   */
  async validateUser(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}`);
      return response.ok;
    } catch (error) {
      console.error('Erro ao validar usuário:', error);
      return false;
    }
  }

  /**
   * TAREFA: Implementar chamada ao Products Service
   * Buscar produto e seu preço em http://localhost:3002/api/products/:id
   */
  async getProductPrice(productId: string): Promise<number | null> {
    try {
      const response = await fetch(`http://localhost:3002/api/products/${productId}`);
      if (!response.ok) return null;
      
      const product = await response.json();
      return product.price || null;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
  }

  /**
   * Criar pedido com validação de usuário e produto
   */
  async createOrder(data: CreateOrderDTO): Promise<Order> {
    // Validar usuário
    const userExists = await this.validateUser(data.userId);
    if (!userExists) {
      throw new Error('Usuário não encontrado');
    }

    // Buscar preço do produto
    const productPrice = await this.getProductPrice(data.productId);
    if (productPrice === null) {
      throw new Error('Produto não encontrado');
    }

    // Criar pedido
    const order: Order = {
      id: generateId(),
      userId: data.userId,
      productId: data.productId,
      quantity: data.quantity,
      totalPrice: productPrice * data.quantity,
      createdAt: new Date(),
    };

    orders.set(order.id, order);
    return order;
  }

  /**
   * Listar todos os pedidos
   */
  getAllOrders(): Order[] {
    return Array.from(orders.values());
  }

  /**
   * Buscar pedido por ID
   */
  getOrderById(id: string): Order | null {
    return orders.get(id) || null;
  }

  /**
   * Atualizar pedido
   */
  updateOrder(id: string, data: Partial<CreateOrderDTO>): Order | null {
    const order = orders.get(id);
    if (!order) return null;

    if (data.quantity) {
      order.quantity = data.quantity;
      // Recalcular totalPrice se necessário
    }

    orders.set(id, order);
    return order;
  }

  /**
   * Deletar pedido
   */
  deleteOrder(id: string): boolean {
    return orders.delete(id);
  }

  /**
   * TAREFA BONUS: Buscar detalhes completos do pedido
   * (incluindo dados do usuário e produto)
   */
  async getOrderDetails(id: string): Promise<any> {
    const order = orders.get(id);
    if (!order) return null;

    try {
      const userResponse = await fetch(`http://localhost:3001/api/users/${order.userId}`);
      const productResponse = await fetch(`http://localhost:3002/api/products/${order.productId}`);

      const user = userResponse.ok ? await userResponse.json() : null;
      const product = productResponse.ok ? await productResponse.json() : null;

      return {
        order,
        user,
        product,
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      return { order };
    }
  }
}

export default new OrderService();
