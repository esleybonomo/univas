# 📋 Tarefa: Integração entre Microserviços - Orders Service

## 🎯 Objetivo

Implementar a comunicação entre o **Orders Service** e os serviços existentes (**Users Service** e **Products Service**), praticando:
- ✅ Comunicação síncrona entre microserviços (HTTP)
- ✅ Validação distribuída (verificar dados em outros serviços)
- ✅ Agregação de dados (juntar informações de múltiplos serviços)
- ✅ Tratamento de erros em chamadas remotas

---

## 🚀 Instruções de Execução

### 1️⃣ Instalar dependências
```bash
cd sd-encontro-6
npm install
```

### 2️⃣ Compilar TypeScript
```bash
npm run build
```

### 3️⃣ Iniciar todos os serviços em modo desenvolvimento
```bash
npm run dev
```

Isso vai iniciar os 3 serviços:
- **Users** em http://localhost:3001
- **Products** em http://localhost:3002  
- **Orders** em http://localhost:3003

---

## 📝 Tarefas Principais

### Tarefa 1: Criar usuário e produto (base de dados)

Abra **Postman** ou **REST Client** e execute:

**1. Criar um usuário:**
```
POST http://localhost:3001/api/users
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com"
}
```
Copie o `id` retornado (ex: `"user123"`)

**2. Criar um produto:**
```
POST http://localhost:3002/api/products
Content-Type: application/json

{
  "name": "Laptop",
  "price": 2500
}
```
Copie o `id` retornado (ex: `"prod123"`)

---

### Tarefa 2: Criar um pedido COM VALIDAÇÃO

```
POST http://localhost:3003/api/orders
Content-Type: application/json

{
  "userId": "user123",
  "productId": "prod123",
  "quantity": 2
}
```

✅ **Esperado:** A resposta deve retornar um pedido com:
```json
{
  "id": "1234567890abc",
  "userId": "user123",
  "productId": "prod123",
  "quantity": 2,
  "totalPrice": 5000,
  "createdAt": "2024-03-04T10:30:00.000Z"
}
```

❌ **Se o usuário NÃO existir:** Deve retornar erro 404
❌ **Se o produto NÃO existir:** Deve retornar erro 404

---

### Tarefa 3: Testar validação (IMPORTANTE!)

**Tente criar um pedido com userId inválido:**
```
POST http://localhost:3003/api/orders
Content-Type: application/json

{
  "userId": "usuario_inexistente",
  "productId": "prod123",
  "quantity": 2
}
```

✅ Deve retornar: `"Usuário não encontrado"` (erro 404)

---

### Tarefa 4 (BONUS): Endpoint de Detalhes Agregados

```
GET http://localhost:3003/api/orders/seu-pedido-id/details
```

✅ **Esperado:** Retorna pedido + dados do usuário + dados do produto
```json
{
  "order": {
    "id": "1234567890abc",
    "userId": "user123",
    "productId": "prod123",
    "quantity": 2,
    "totalPrice": 5000,
    "createdAt": "2024-03-04T10:30:00.000Z"
  },
  "user": {
    "id": "user123",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "product": {
    "id": "prod123",
    "name": "Laptop",
    "price": 2500
  }
}
```

---

## 🔍 Analisando o Código

Abra os arquivos e procure pelos comentários **`// TAREFA:`** para entender o fluxo:

1. **[src/services/order.service.ts](src/services/order.service.ts)**
   - 🔗 `validateUser()` - Chama Users Service
   - 🔗 `getProductPrice()` - Chama Products Service
   - 💾 `createOrder()` - Cria pedido após validações

2. **[src/controllers/orders.controller.ts](src/controllers/orders.controller.ts)**
   - Trata requisições HTTP

3. **[src/routes/orders.routes.ts](src/routes/orders.routes.ts)**
   - Define endpoints

---

## 📊 Todos os Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check |
| POST | `/api/orders` | Criar pedido (com validação) |
| GET | `/api/orders` | Listar todos os pedidos |
| GET | `/api/orders/:id` | Buscar pedido |
| GET | `/api/orders/:id/details` | Pedido + User + Product |
| PUT | `/api/orders/:id` | Atualizar pedido |
| DELETE | `/api/orders/:id` | Deletar pedido |

---

## 💡 Desafios Adicionais (Próximas Aulas)

- [ ] Adicionar **timeout** nas chamadas entre serviços
- [ ] Implementar **Circuit Breaker** (não chamar serviço se estiver fora)
- [ ] Adicionar **retry logic** em caso de falha
- [ ] Usar **Message Queue** (RabbitMQ/Kafka) em vez de HTTP direto
- [ ] Implementar **logging centralizado** (ElasticSearch)
- [ ] Adicionar **tracing distribuído** (Jaeger)
- [ ] Dockerizar tudo com **Docker Compose**

---

## 🐛 Troubleshooting

### Erro: "ECONNREFUSED" ao criar pedido
- Certifique-se de que todos os 3 serviços estão rodando
- Verifique as portas: Users (3001), Products (3002), Orders (3003)

### Erro: "userId/productId não encontrado"
- Crie um usuário e produto primeiro
- Copie o `id` retornado e use na requisição do pedido

### Porta já está em uso
- Mude a porta em `src/server.ts` ou encerre o processo usando a porta

---

## ✅ Checklist para Conclusão

- [ ] npm install executado com sucesso
- [ ] npm run build compilou TypeScript
- [ ] npm run dev iniciou todos os 3 serviços
- [ ] Criou usuário via Users Service
- [ ] Criou produto via Products Service
- [ ] Criou pedido e validou os dados no Orders Service
- [ ] Testou erro ao criar pedido com userId inválido
- [ ] Testou endpoint `/details` (bonus)
- [ ] Explorou o código e entendeu o fluxo

---

**Sucesso na tarefa! 🎉**
