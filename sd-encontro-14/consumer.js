// consumer.js — Leitor de mensagens do Kafka
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'meu-consumidor',
  brokers: ['localhost:9092']
});

// groupId agrupa consumidores — Kafka distribui partições entre eles
const consumer = kafka.consumer({ groupId: 'grupo-aula' });

const executar = async () => {
  await consumer.connect();
  console.log('✅ Consumer conectado!');

  // Assina o tópico — fromBeginning: true lê desde o início
  await consumer.subscribe({
    topic: 'mensagens-aula',
    fromBeginning: true
  });

  // Processa cada mensagem recebida
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`📥 Recebido | Partição: ${partition}`);
      console.log(`   Mensagem: ${message.value.toString()}`);
    }
  });
};

executar().catch(console.error);