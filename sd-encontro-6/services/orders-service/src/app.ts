import express from 'express';
import ordersRoutes from './routes/orders.routes';
import errorMiddleware from './middleware/error.middleware';

const app = express();

app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'orders-service' });
});

// Rotas
app.use('/api/orders', ordersRoutes);

// Middleware de erro
app.use(errorMiddleware);

export default app;
