// producer.js — Publicador de mensagens no Kafka
const { Kafka } = require('kafkajs');

// 1. Cria instância do cliente Kafka
const kafka = new Kafka({
  clientId: 'meu-produtor',       // identificador desta aplicação
  brokers: ['localhost:9092']     // endereço do broker Docker
});

// 2. Cria o objeto producer
const producer = kafka.producer();

const executar = async () => {
  // 3. Conecta ao broker
  await producer.connect();
  console.log('✅ Producer conectado!');

  let contador = 0;
  // 4. Envia uma mensagem a cada 2 segundos
  setInterval(async () => {
    const mensagem = `Pedido #${contador++} criado às ${new Date().toISOString()}`;
    await producer.send({
      topic: 'exemplo-particoes',    // tópico de destino
      messages: [{ value: mensagem }]
    });
    console.log(`📤 Enviado: ${mensagem}`);
  }, 200);
};

executar().catch(console.error);