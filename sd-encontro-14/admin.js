const { Kafka } = require('kafkajs');

const kafka = new Kafka({ brokers: ['localhost:9092'] });
const admin = kafka.admin();

async function run() {
  await admin.connect();

  // Cria um tópico com 3 partições
  await admin.createTopics({
    topics: [
      {
        topic: 'exemplo-particoes',
        numPartitions: 3,
        replicationFactor: 1,
      },
    ],
  });

  console.log('Tópico criado com 3 partições!');
  await admin.disconnect();
}

run().catch(console.error);
