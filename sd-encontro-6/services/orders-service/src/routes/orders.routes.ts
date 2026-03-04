import { Router } from 'express';
import ordersController from '../controllers/orders.controller';

const router = Router();

// GET /api/orders - Listar todos
router.get('/', (req, res) => ordersController.getAll(req, res));

// POST /api/orders - Criar
router.post('/', (req, res) => ordersController.create(req, res));

// GET /api/orders/:id - Buscar por ID
router.get('/:id', (req, res) => ordersController.getById(req, res));

// GET /api/orders/:id/details - Buscar com detalhes (usuário + produto)
router.get('/:id/details', (req, res) => ordersController.getDetails(req, res));

// PUT /api/orders/:id - Atualizar
router.put('/:id', (req, res) => ordersController.update(req, res));

// DELETE /api/orders/:id - Deletar
router.delete('/:id', (req, res) => ordersController.delete(req, res));

export default router;
