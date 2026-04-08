// topic-manager.js - Gerenciador Simples de Tópicos Kafka (Node.js + kafkajs)
// Uso: node topic-manager.js [create|delete|describe|alter] <topic> [partitions]
// Ex: node topic-manager.js create pedidos 3
//     node topic-manager.js describe pedidos
//     node topic-manager.js alter pedidos 5 (aumenta partições)
// Pré-req: npm i kafkajs

const { Kafka } = require('kafkajs');

const action = process.argv[2];
const topic = process.argv[3];
const partitions = parseInt(process.argv[4]) || 1;

if (!action || !topic) {
  console.error('❌ Uso: node topic-manager.js [create|delete|describe|alter] <topic> [partitions]');
  process.exit(1);
}

const kafka = new Kafka({ clientId: 'admin-tools', brokers: ['localhost:9092'] });  // Ajuste brokers se remoto
const admin = kafka.admin();

(async () => {
  try {
    await admin.connect();
    console.log(`🔄 Conectado ao Kafka em localhost:9092`);

    switch (action) {
      case 'create':
        await admin.createTopics({
          topics: [{ topic, numPartitions: partitions, replicationFactor: 1 }]
        });
        console.log(`✅ Tópico '${topic}' criado com ${partitions} partições.`);
        break;

      case 'delete':
        await admin.deleteTopics({ topics: [topic] });
        console.log(`✅ Tópico '${topic}' deletado.`);
        break;

      case 'describe':
        const desc = await admin.describeTopics({ topics: [topic] });
        console.log(`📋 Descrição de '${topic}':`, JSON.stringify(desc, null, 2));
        break;

      case 'alter':
        await admin.createPartitions({
          topics: [{ topic, numPartitions: partitions }]
        });
        console.log(`✅ Tópico '${topic}' alterado para ${partitions} partições.`);
        break;

      default:
        console.error('❌ Ação inválida. Use: create|delete|describe|alter');
    }
  } catch (error) {
    console.error(`💥 Erro: ${error.message}`);
    if (error.code === 3) console.log('Dica: Tópico não existe? Crie primeiro!');
  } finally {
    await admin.disconnect();
    console.log('🔌 Desconectado.');
  }
})();