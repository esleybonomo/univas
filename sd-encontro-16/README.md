# README: Aula Prática - Kafka em E-commerce: Pedidos com Estoque e Notificações (Semana 8)

Bem-vindos à aula prática de Sistemas Distribuídos! Nesta sessão, vamos mergulhar no Apache Kafka para construir um sistema de processamento de pedidos de e-commerce, simulando cenários reais de estoque e notificação. Preparem-se para colocar a mão na massa com Node.js!

## Objetivos da Aula
Ao final desta prática de **50 minutos**, você será capaz de:
- 🚀 Implementar uma **API REST** que publica eventos "pedido.criado" em um tópico Kafka com **3 partições**.
- 📦 Criar **dois consumer groups** independentes: um para **"estoque"** (decrementa itens) e outro para **"notificacao"** (envia alertas).
- ✅ Verificar **ordenação intra-partição**, **rebalanceamento de consumidores** e **resiliência** (retry/DLQ) em cenários de sucesso e falha.

**Mensuração do Sucesso:** Os logs devem mostrar 100% dos eventos processados sem perda ou duplicação, estoque atualizado corretamente e notificações enviadas. Ao simular falhas, o sistema deve se recuperar e os eventos devem ser processados.

## Pré-requisitos
Certifique-se de ter os seguintes softwares instalados e configurados em sua máquina:
- **Node.js 18+**: Verifique com `node -v`.
- **Docker & Docker Compose**: Essenciais para rodar o Kafka localmente.
- **Git**: Para clonar o repositório da aula.
- **Editor de Código**: VS Code ou similar.
- **Ferramenta de Teste HTTP**: `curl` (linha de comando) ou Postman (GUI).

**Tempo estimado para o setup inicial: 5 minutos.**

## Estrutura de Pastas
O repositório estará organizado da seguinte forma:

```
sd-encontro-16/
├── docker-compose.yml     # Configuração do Kafka e Zookeeper via Docker Compose.
├── package.json           # Dependências do Node.js (kafkajs, express, uuid).
├── producer.js            # Código da API REST que recebe pedidos e publica eventos no Kafka.
├── consumer.js            # Código do consumidor genérico, usado para "estoque" e "notificacao".
├── README.md              # Este arquivo.
└── tests/                 # Scripts de teste (ex: curl-pedido.sh para simular clientes).
```

## 1. Setup Inicial (5-10 min)

1.  **Clone o repositório da aula:**
    ```bash
    git clone 
    cd sd-encontro-16
    ```

2.  **Instale as dependências do Node.js:**
    ```bash
    npm install
    ```

3.  **Inicie o Kafka e o Zookeeper usando Docker Compose:**
    ```bash
    docker-compose up -d
    ```
    - Aguarde cerca de 30 segundos para os serviços subirem. Você pode verificar o status com `docker logs kafka-1`.

4.  **Crie o tópico `pedidos-criados` no Kafka com 3 partições:**
    ```bash
    docker exec -it kafka-1 kafka-topics --create --topic pedidos-criados --partitions 3 --replication-factor 1 --bootstrap-server localhost:9092
    ```
    - **Atenção para acesso remoto:** Se você estiver usando uma máquina virtual ou quiser que colegas acessem seu Kafka de outras máquinas, edite o `docker-compose.yml` e altere a variável de ambiente `KAFKA_ADVERTISED_LISTENERS` para `PLAINTEXT://SEU-IP-DA-MAQUINA:9092`. Lembre-se de usar este `SEU-IP-DA-MAQUINA` nos `brokers` dos seus códigos `producer.js` e `consumer.js` também.

## 2. Producer: API REST de Pedidos (15 min)

Este arquivo (`producer.js`) implementa uma API REST simples que recebe requisições HTTP POST para `/pedidos`. Ao receber um pedido, ela o publica como um evento no tópico `pedidos-criados` do Kafka. Usamos `transactionalId` e `acks: 'all'` para garantir alta durabilidade e idempotência.

```javascript
const express = require('express');
const { Kafka } = require('kafkajs');
const { v4: uuid } = require('uuid');
const app = express(); app.use(express.json());

// Configuração do Kafka Producer
const kafka = new Kafka({ clientId: 'api-pedidos', brokers: ['localhost:9092'] }); // Altere para SEU-IP:9092 se remoto
const producer = kafka.producer({
  transactionalId: 'txn-pedidos',  // Garante idempotência e exactly-once semantics
  maxInFlightRequestsPerConnection: 1,  // Garante ordenação de mensagens por partição
  retry: { retries: 10, initialRetryTime: 300 }, // Retenta em caso de falha temporária
  acks: 'all',  // Confirmação de que todas as réplicas receberam a mensagem
  idempotent: true // Habilita idempotência no producer
});

// Conecta o producer ao Kafka ao iniciar a aplicação
(async () => {
  await producer.connect();
  console.log('API de Pedidos pronta e conectada ao Kafka!');
})();

// Endpoint para criar um novo pedido
app.post('/pedidos', async (req, res) => {
  const { lojaId, itens } = req.body;  // Ex: {lojaId: "loja1", itens: [{produto: "pizza", qtd: 2}]}
  const pedidoId = uuid(); // Gera um ID único para o pedido

  try {
    await producer.transaction(); // Inicia uma transação Kafka
    await producer.send({
      topic: 'pedidos-criados',
      messages: [{ 
        key: lojaId, // A chave (lojaId) garante que pedidos da mesma loja vão para a mesma partição, mantendo a ordem
        value: JSON.stringify({ pedidoId, lojaId, itens, timestamp: Date.now() }) 
      }]
    });
    await producer.commitTransaction(); // Confirma a transação
    res.json({ status: 'Pedido criado e evento publicado com sucesso!', pedidoId });
  } catch (error) {
    console.error('Erro ao processar pedido:', error);
    await producer.abortTransaction(); // Aborta a transação em caso de erro
    res.status(500).json({ status: 'Erro ao criar pedido', error: error.message });
  }
});

// Inicia o servidor Express
app.listen(3000, () => console.log('API de Pedidos escutando em http://localhost:3000'));
```

-   **Rode o Producer:**
    ```bash
    node producer.js
    ```
    Você verá a mensagem `API de Pedidos pronta e conectada ao Kafka!`.

-   **Teste o Producer (crie um pedido):**
    Abra um novo terminal e execute o comando `curl`:
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"lojaId":"loja1","itens":[{"produto":"pizza","qtd":2},{"produto":"refrigerante","qtd":1}]}' http://localhost:3000/pedidos
    ```
    A API responderá com o `pedidoId` gerado.

## 3. Consumers: Estoque e Notificação (20 min)

Este arquivo (`consumer.js`) é genérico e pode ser instanciado para diferentes propósitos (grupos de consumidores) passando um parâmetro na linha de comando. Ele simula o processamento de eventos de pedido, seja para atualizar o estoque ou enviar notificações.

```javascript
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
```

-   **Rode os Consumers:**
    Abra **quatro terminais** separados. Em cada um, execute:
    -   Terminal 1: `node consumer.js estoque` (Este será o worker de estoque 1)
    -   Terminal 2: `node consumer.js estoque` (Este será o worker de estoque 2 - para testar rebalance)
    -   Terminal 3: `node consumer.js notificacao` (Este será o worker de notificação 1)
    -   Terminal 4: `node consumer.js notificacao` (Este será o worker de notificação 2 - para testar rebalance)

## 4. Cenários de Teste em Sala (E-commerce Real - 15 min)

Vamos simular o fluxo de pedidos de um e-commerce em um dia de alta demanda, como a Black Friday!

**Contexto:**
- **API de Pedidos (Producer):** Recebe requisições de clientes e publica eventos `pedidos-criados`.
- **Consumer Group "estoque":** Responsável por verificar e decrementar o saldo de produtos.
- **Consumer Group "notificacao":** Responsável por enviar e-mails/SMS de confirmação ao cliente.

---

### 1. Fluxo Principal (Sucesso Normal) - 5 min
**Objetivo:** Observar o processamento de pedidos sem falhas.
1.  **Certifique-se de que todos os 4 consumers estão rodando** (2x `estoque`, 2x `notificacao`).
2.  **Envie um pedido:**
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"lojaId":"loja1","itens":[{"produto":"pizza","qtd":2},{"produto":"refrigerante","qtd":1}]}' http://localhost:3000/pedidos
    ```
3.  **Envie outro pedido para outra loja:**
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"lojaId":"loja2","itens":[{"produto":"pizza","qtd":1}]}' http://localhost:3000/pedidos
    ```
**Esperado:**
-   Nos terminais dos consumers de `estoque`: Você verá o saldo de `pizza` e `refrigerante` sendo atualizado.
-   Nos terminais dos consumers de `notificacao`: Você verá as mensagens de "Notificação enviada".
-   **Check:** Todos os eventos foram processados? Há alguma mensagem de erro?

---

### 2. Fluxo Alternativo (Rebalanceamento e Escala) - 5 min
**Objetivo:** Simular o aumento da capacidade de processamento (escalar) e observar como o Kafka distribui as partições.
1.  **Com todos os consumers rodando**, envie mais alguns pedidos:
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"lojaId":"lo1","itens":[{"produto":"pizza","qtd":1}]}' http://localhost:3000/pedidos
    curl -X POST -H "Content-Type: application/json" -d '{"lojaId":"lo2","itens":[{"produto":"refrigerante","qtd":1}]}' http://localhost:3000/pedidos
    ```
2.  **Simule a entrada de um novo worker:** Abra um **quinto terminal** e inicie mais um consumer de estoque:
    ```bash
    node consumer.js estoque
    ```
**Esperado:**
-   Nos logs dos consumers de `estoque` (incluindo o novo), você verá mensagens como "Rebalancing partition assignment..." ou "Consumer group rebalanced".
-   As partições serão redistribuídas entre os workers ativos do `group-estoque`.
-   **Check:** O novo consumer começou a processar eventos? Os eventos anteriores foram reprocessados? (Não deveriam, devido ao commit de offset).

---

### 3. Fluxo de Exceção (Falha e Recuperação com DLQ) - 5 min
**Objetivo:** Simular uma falha em um worker e testar a resiliência do sistema, incluindo retries e Dead Letter Queue (DLQ).
1.  **Certifique-se de ter pelo menos 2 consumers de `estoque` rodando.**
2.  **Simule uma falha de estoque:** Envie um pedido que exceda o saldo inicial de `pizza` (10 unidades).
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"lojaId":"loja1","itens":[{"produto":"pizza","qtd":15}]}' http://localhost:3000/pedidos
    ```
3.  **Simule a queda de um worker:** Vá para um dos terminais do `consumer.js estoque` e pressione `Ctrl+C` para derrubá-lo.
4.  **Envie mais um pedido:**
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"lojaId":"loja3","itens":[{"produto":"refrigerante","qtd":1}]}' http://localhost:3000/pedidos
    ```
**Esperado:**
-   **Falha de Estoque:** O consumer de `estoque` que recebeu o pedido de 15 pizzas tentará processar 3 vezes. Após as retries, ele registrará uma mensagem de `💥 DLQ` para o evento, indicando uma falha irrecuperável.
-   **Queda de Worker:** O Kafka detectará a queda e fará um **rebalanceamento**, atribuindo as partições do worker caído para os workers restantes do `group-estoque`.
-   **Recuperação:** O pedido da `loja3` será processado normalmente pelo worker de `estoque` que sobrou.
-   **Check:** O evento com estoque insuficiente foi para DLQ? O sistema se recuperou da queda do worker sem perder o pedido da `loja3`?

---

### Rúbrica de Avaliação Rápida (Projetar na tela)
| **Rebalanceamento OK** | Logs mostram redistribuição de partições sem interrupção. | Consumers travam ou não assumem partições. |
| **Ordenação por Chave** | Pedidos da mesma `lojaId` são processados na ordem em que foram enviados. | Pedidos da mesma `lojaId` são processados fora de ordem. |

## Troubleshooting
| Problema | Solução 
| **Mensagens duplicadas** | Confirme se `idempotent: true` e `transactionalId` estão configurados corretamente no producer. |
| **Porta já em uso** | Se o `producer.js` não iniciar, a porta 3000 pode estar ocupada. Use `lsof -i :3000` para identificar o processo e finalizá-lo, ou altere a porta no `producer.js`. |

## Próximos Passos
-   **Homework:** Integre esta API de Pedidos com a API REST que você desenvolveu na Semana 6. Faça com que sua API de backend publique os eventos de pedido no Kafka.
-   **Push para o GitHub:** Não se esqueça de fazer o commit e push do seu código para o repositório da aula!
    ```bash
    git add .
    git commit -m "Lab Kafka E-commerce concluído"
    git push origin main
    ```

---

**Autor:** Prof. Esley Bonomo | **Data:** 08 de abril de 2026 | **Alinhado à Ementa de Sistemas Distribuídos (Mensageria Assíncrona e Kafka para Eventos).**