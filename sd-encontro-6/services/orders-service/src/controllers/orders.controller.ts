import { Request, Response } from 'express';
import orderService from '../services/order.service';

export class OrdersController {
  async create(req: Request, res: Response) {
    try {
      const order = await orderService.createOrder(req.body);
      res.status(201).json(order);
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  getAll(req: Request, res: Response) {
    const orders = orderService.getAllOrders();
    res.json(orders);
  }

  getById(req: Request, res: Response) {
    const order = orderService.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Pedido não encontrado' });
      return;
    }
    res.json(order);
  }

  async getDetails(req: Request, res: Response) {
    try {
      const details = await orderService.getOrderDetails(req.params.id);
      if (!details) {
        res.status(404).json({ error: 'Pedido não encontrado' });
        return;
      }
      res.json(details);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao buscar detalhes' });
    }
  }

  update(req: Request, res: Response) {
    const order = orderService.updateOrder(req.params.id, req.body);
    if (!order) {
      res.status(404).json({ error: 'Pedido não encontrado' });
      return;
    }
    res.json(order);
  }

  delete(req: Request, res: Response) {
    const deleted = orderService.deleteOrder(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Pedido não encontrado' });
      return;
    }
    res.status(204).send();
  }
}

export default new OrdersController();
