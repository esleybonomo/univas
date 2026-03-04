import { Request, Response, NextFunction } from 'express';

const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Erro:', err.message);

  if (err.message.includes('não encontrado')) {
    res.status(404).json({ error: err.message });
  } else if (err.message.includes('validação')) {
    res.status(400).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export default errorMiddleware;
