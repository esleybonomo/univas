const express = require('express');
const { Kafka } = require('kafkajs');
const { v4: uuid } = require('uuid');
const app = express();
app.use(express.json());

const kafka = new Kafka({ clientId: 'api-pedidos', brokers: ['localhost:9092'] });
const producer = kafka.producer({
  idempotent: true,  // Sem duplicatas
  acks: 'all',       // Durabilidade (réplicas confirmam)
  retries: 10,       // Retry automático
  maxInFlightRequestsPerConnection: 1,  // Ordenação
  transactionTimeout: 30000
});

(async () => {
  await producer.connect();
  console.log('✅ API Pedidos pronta!');
})();

app.post('/pedidos', async (req, res) => {
  try {
    const { lojaId, itens } = req.body;
    const pedidoId = uuid();
    const evento = { pedidoId, lojaId, itens, timestamp: Date.now() };

    await producer.send({
      topic: 'pedidos-criados',  // Certifique-se que existe!
      messages: [{ key: lojaId, value: JSON.stringify(evento) }]
    });

    res.json({ status: 'Pedido criado e evento publicado!', pedidoId });
  } catch (error) {
    console.error('💥 Erro:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('API em http://localhost:3000'));