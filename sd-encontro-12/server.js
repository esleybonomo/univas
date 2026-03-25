const express = require('express');
const app = express();
const PORT = 3000;

// Middleware essencial
app.use(express.json()); // Para parsear JSON no body

// "Banco" em memória (simula persistência)
let pedidos = [
  { id: 1, cliente: "João Silva", item: "Notebook Dell", valor: 5000, status: "pendente" },
  { id: 2, cliente: "Maria Oliveira", item: "Mouse Logitech", valor: 150, status: "enviado" }
];
let nextId = 3; // Contador de IDs

// GET /pedidos - Lista todos
app.get('/pedidos', (req, res) => {
  res.status(200).json({ data: pedidos });
});

// GET /pedidos/:id - Detalhe por ID
app.get('/pedidos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const pedido = pedidos.find(p => p.id === id);
  if (!pedido) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Pedido não encontrado' } });
  }
  res.status(200).json({ data: pedido });
});

// POST /pedidos - Cria novo (com idempotência básica via header)
app.post('/pedidos', (req, res) => {
  const { cliente, item, valor, status = 'pendente' } = req.body;
  const idempotencyKey = req.headers['idempotency-key'];

  // Validação simples
  if (!cliente || !item || !valor) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Cliente, item e valor são obrigatórios' } });
  }

  // Idempotência: verifica se já existe pelo key (simulação para retries)
  if (idempotencyKey && pedidos.find(p => p.idempotencyKey === idempotencyKey)) {
    const pedidoExistente = pedidos.find(p => p.idempotencyKey === idempotencyKey);
    return res.status(200).json({ data: pedidoExistente, message: 'Pedido já criado (idempotente)' });
  }

  const novoPedido = {
    id: nextId++,
    cliente,
    item,
    valor: parseFloat(valor),
    status,
    idempotencyKey // Armazena o key para verificação
  };
  pedidos.push(novoPedido);
  res.status(201).json({ data: novoPedido });
});

// PUT /pedidos/:id - Atualiza completo
app.put('/pedidos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = pedidos.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Pedido não encontrado' } });
  }
  pedidos[index] = { ...pedidos[index], ...req.body };
  res.status(200).json({ data: pedidos[index] });
});

// PATCH /pedidos/:id - Atualiza parcial (ex: só status)
app.patch('/pedidos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = pedidos.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Pedido não encontrado' } });
  }
  pedidos[index] = { ...pedidos[index], ...req.body };
  res.status(200).json({ data: pedidos[index] });
});

// DELETE /pedidos/:id
app.delete('/pedidos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = pedidos.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Pedido não encontrado' } });
  }
  pedidos.splice(index, 1);
  res.status(204).send(); // No content
});

// Simulação de latência (para SD: timeouts/retries)
app.get('/pedidos/status-lento', (req, res) => {
  setTimeout(() => {
    if (Math.random() > 0.7) { // 30% chance de falha intermitente
      return res.status(503).json({ error: { code: 'SERVICE_UNAVAILABLE', message: 'Serviço temporariamente indisponível' } });
    }
    res.status(200).json({ mensagem: 'Resposta após 3s de latência simulada' });
  }, 3000);
});

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

app.listen(PORT, () => {
  console.log(`🟢 Servidor rodando em http://localhost:${PORT}`);
});