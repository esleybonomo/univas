const { Kafka } = require('kafkajs');

// O tipo de consumidor (estoque ou notificacao) é passado como argumento na linha de comando
const tipo = process.argv[2] || 'default';
const groupId = tipo === 'estoque' ? 'group-estoque' : 'group-notificacao'; // Define o groupId com base no tipo
console.log(`🔄 Consumer ${tipo} (Group: ${groupId}) iniciado.`);

// Configuração do Kafka Consumer
const kafka = new Kafka({ clientId: `consumer-${tipo}`, brokers: ['localhost:9092'] }); // Altere para SEU-IP:9092 se remoto
const consumer = kafka.consumer({
  groupId, // O groupId é crucial para o balanceamento de carga e rebalanceamento
  sessionTimeout: 6000, // Tempo limite para o consumidor enviar heartbeats
  rebalanceTimeout: 20000, // Tempo limite para o rebalanceamento de partições
  heartbeatInterval: 3000, // Frequência de envio de heartbeats
  allowAutoTopicCreation: false // Não permite a criação automática de tópicos
});

// Saldo de estoque simulado (apenas para o consumidor de estoque)
let saldoEstoque = { pizza: 10, refrigerante: 5 };

// Conecta o consumer ao Kafka e inicia o processamento
(async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'pedidos-criados', fromBeginning: true }); // Começa a ler do início do tópico

  let totalProcessado = 0;

  await consumer.run({
    eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
      for (let message of batch.messages) {
        if (!isRunning() || isStale()) break; // Verifica se o consumidor ainda está ativo
        const evento = JSON.parse(message.value.toString());
        let retries = 3; // Número de tentativas para processar a mensagem
        
        while (retries--) {
          try {
            if (tipo === 'estoque') {
              // Lógica de processamento de estoque
              let estoqueOk = true;
              evento.itens.forEach(item => {
                if (!saldoEstoque[item.produto] || saldoEstoque[item.produto] < item.qtd) {
                  estoqueOk = false;
                  throw new Error(`Estoque insuficiente para ${item.produto}! Saldo: ${saldoEstoque[item.produto] || 0}, Pedido: ${item.qtd}`);
                }
              });
              if (estoqueOk) {
                evento.itens.forEach(item => {
                  saldoEstoque[item.produto] -= item.qtd;
                });
                console.log(`📦 Estoque atualizado para loja ${evento.lojaId}: ${JSON.stringify(saldoEstoque)} | Pedido: ${evento.pedidoId}`);
              }
            } else if (tipo === 'notificacao') {
              // Lógica de envio de notificação
              console.log(`📧 Notificação enviada para loja ${evento.lojaId}: Pedido ${evento.pedidoId} criado! Itens: ${JSON.stringify(evento.itens)}`);
            }
            totalProcessado++;
            resolveOffset(message.offset); // Marca a mensagem como processada
            break; // Sai do loop de retries se o processamento for bem-sucedido
          } catch (e) {
            console.error(`⚠️ Consumer ${tipo} (Pedido ${evento.pedidoId}) - Retry ${3 - retries} falhou: ${e.message}`);
            if (retries === 0) {
              console.error(`💥 DLQ (Dead Letter Queue): ${message.value.toString()} - Falha irrecuperável após retries.`);
              resolveOffset(message.offset); // Marca como processado para não reprocessar infinitamente
            }
            // Em um cenário real, aqui haveria um delay antes de tentar novamente
          }
        }
        await heartbeat(); // Envia heartbeat para o coordenador do grupo
      }
      // O commit de offsets é feito automaticamente pelo eachBatch após resolver os offsets
      // ou pode ser feito manualmente com consumer.commitOffsets() se necessário um controle mais fino.
      console.log(`✅ Consumer ${tipo} (Group: ${groupId}) - Batch commitido. Total processado nesta sessão: ${totalProcessado}`);
    }
  });
})();