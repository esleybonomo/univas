# Microsserviços em Node.js + TypeScript (Express)

Repositório didático com **2 microserviços** em **Node.js + TypeScript**, usando **Express** e **armazenamento em memória** (sem banco de dados persistente) para facilitar os testes e o aprendizado em aula.

- `users-service`: CRUD básico de usuários
- `products-service`: CRUD básico de produtos

## Pré-requisitos

- Node.js LTS (v16+)
- npm (vem com Node.js)

## Instalação e Execução

### Instalar dependências
```bash
npm install
```

### Modo desenvolvimento (com hot-reload)
```bash
npm run dev
```

### Compilar TypeScript
```bash
npm run build
```

### Modo produção
```bash
npm run build
npm run start:users    # Terminal 1
npm run start:products # Terminal 2
```

## Endpoints

### Health Check
- Users: `GET http://localhost:3001/health`
- Products: `GET http://localhost:3002/health`

### Users Service (porta 3001)
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `GET /api/users/:id` - Buscar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Products Service (porta 3002)
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `GET /api/products/:id` - Buscar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto

## Estrutura do Projeto

```
sd-encontro-6/
├── package.json
├── tsconfig.base.json
├── .gitignore
└── services/
    ├── users-service/
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── nodemon.json
    │   └── src/
    │       ├── app.ts
    │       ├── server.ts
    │       ├── routes/
    │       ├── controllers/
    │       ├── services/
    │       ├── models/
    │       ├── utils/
    │       └── middleware/
    └── products-service/
        ├── package.json
        ├── tsconfig.json
        ├── nodemon.json
        └── src/
            ├── app.ts
            ├── server.ts
            ├── routes/
            ├── controllers/
            ├── services/
            ├── models/
            ├── utils/
            └── middleware/
```

## 📚 Tarefa em Sala de Aula: Integração entre Microserviços

### Objetivo
Implementar a **comunicação entre microserviços**, praticando conceitos fundamentais de arquitetura distribuída.

### Requisitos

#### 1. **Criar endpoint de pedidos (Orders Service - NOVO)**
   - Criar um terceiro microserviço na porta `3003`
   - Modelo de Pedido: `{ id, userId, productId, quantity, totalPrice, createdAt }`
   - Endpoints básicos: GET, POST, UPDATE, DELETE

#### 2. **Integração entre Serviços**
   - Quando criar um pedido, o **Orders Service** deve:
     - ✅ Validar se o `userId` existe chamando `users-service` (GET /api/users/:id)
     - ✅ Validar se o `productId` existe chamando `products-service` (GET /api/products/:id)
     - ✅ Retornar erro 404 se usuário ou produto não existirem
     - ✅ Calcular `totalPrice` = productPrice × quantity

#### 3. **Endpoint Agregado** (Bonus)
   - `GET /api/orders/:id/details` 
   - Retorna: Pedido + Dados do Usuário + Dados do Produto
   ```json
   {
     "order": { "id": "1", "userId": "u1", "productId": "p1", "quantity": 2, "totalPrice": 100 },
     "user": { "id": "u1", "name": "João", "email": "joao@example.com" },
     "product": { "id": "p1", "name": "Notebook", "price": 50 }
   }
   ```

#### 4. **Tratamento de Erros**
   - Implementar try/catch nas chamadas HTTP entre serviços
   - Retornar mensagens de erro adequadas (validation errors, service unavailable)
   - Documentar os status codes (400, 404, 500, 503)

### Passo a Passo Sugerido

1. Copiar estrutura de `products-service` → criar `orders-service`
2. Alterar porta para 3003 em `src/server.ts`
3. Ajustar rotas e controllers para Orders
4. Implementar lógica de chamadas HTTP:
   ```typescript
   // Exemplo em axios ou fetch
   const user = await fetch(`http://localhost:3001/api/users/${userId}`);
   const product = await fetch(`http://localhost:3002/api/products/${productId}`);
   ```
5. Testando: 
   ```bash
   npm run dev  # Inicia todos os 3 serviços
   # Em outro terminal, testar com curl ou Postman
   ```

### Conceitos Praticados
- 🔗 **Comunicação Síncrona** (HTTP)
- 🏗️ **Padrão de Orquestração** (um serviço orquestra outros)
- ❌ **Tratamento de Falhas** (timeout, serviço indisponível)
- 📊 **Agregação de Dados** (buscar dados de múltiplos serviços)
- 🔍 **Validação Distribuída**

### Desafios Adicionais (Próximas Aulas)
- Implementar **Circuit Breaker** para falhas em cascata
- Usar **Message Queue** (RabbitMQ/Kafka) em vez de HTTP
- Adicionar **Observabilidade** (logs centralizados)
- Dockerizar e orquestrar com **Docker Compose**

---

## Observações

- Os dados são armazenados em memória, perdidos ao reiniciar o serviço
- Ideal para fins didáticos e aprendizado de microsserviços
- Use Postman ou REST Client do VS Code para testar os endpoints