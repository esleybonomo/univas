# API-Pedidos-Lab: Laboratório de APIs RESTful (Sistemas Distribuídos - UNIVÁS)

## 📋 Descrição
Esta é uma **API RESTful mínima em Node.js + Express** para simular comunicação síncrona entre serviços. Projetada para o **Encontro 2** da disciplina, ela implementa **CRUD completo** (em memória), **status codes corretos**, **validação básica**, **idempotência simples** (via header `idempotency-key`) e **simulação de falhas** (latência e erros intermitentes).

**Objetivos de aprendizagem:**
- Executar e interpretar requisições HTTP (GET/POST/PUT/PATCH/DELETE).
- Observar impactos de latência/timeouts em cenários reais de SD.
- Entender idempotência para evitar duplicatas em retries.

**Tempo estimado:** 100 min (2 labs de 50 min).

## 🚀 Setup Rápido
1. Clone ou baixe este repositório.
2. Abra o terminal na pasta do projeto:
   ```
   npm install
   npm run dev  # Usa nodemon para auto-reload
   ```
3. Servidor roda em `http://localhost:3000`.
4. Teste health: `GET /health` (deve retornar `200 OK`).

**Pré-requisitos:** Node.js 18+, VS Code, Postman instalado.

## 📖 Endpoints Disponíveis
| Método | Endpoint              | Descrição                          | Status Esperado     |
|--------|-----------------------|------------------------------------|---------------------|
| GET    | `/pedidos`            | Lista todos os pedidos             | 200                 |
| GET    | `/pedidos/:id`        | Detalhe de um pedido               | 200 / 404           |
| POST   | `/pedidos`            | Cria novo (com idempotência)       | 201 / 400 / 200     |
| PUT    | `/pedidos/:id`        | Atualiza completo                  | 200 / 404           |
| PATCH  | `/pedidos/:id`        | Atualiza parcial (ex: status)      | 200 / 404           |
| DELETE | `/pedidos/:id`        | Remove pedido                      | 204 / 404           |
| GET    | `/pedidos/status-lento` | Simula latência (3s) + falha 30% | 200 / 503           |

**Exemplo POST (body JSON):**
```json
{
  "cliente": "João Silva",
  "item": "Notebook",
  "valor": 5000,
  "status": "pendente"
}
```
Header para idempotência: `idempotency-key: abc123`.

## 🧪 Atividades em Sala de Aula (100 min)

### **Atividade 1: Exploração (20 min - Todos)**
1. Abra o Postman e teste `GET /pedidos` e `GET /pedidos/1`.
   - **Pergunta:** Qual o formato da resposta? Por que é JSON?
2. Crie um novo pedido via `POST /pedidos`.
   - **Pergunta:** Note o status **201**. O que mudou no array?
3. Teste `GET /pedidos/999` (ID inválido).
   - **Pergunta:** Interprete o erro **404**. Como o cliente reage?

**Check de compreensão (5 min):** Compartilhe tela e discuta em duplas: "O que acontece se repetir o POST com o mesmo `idempotency-key`?"

### **Atividade 2: Manipulação CRUD (30 min - Iniciantes)**
1. Atualize um pedido via `PATCH /pedidos/1` (mude só `status` para "enviado").
2. Teste `PUT /pedidos/1` (atualize tudo).
3. Delete via `DELETE /pedidos/2`.
   - **Pergunta:** Por que **204** (sem body)? E se ID inválido?

**Registro:** Tire prints das respostas e cole no Google Docs (entrega final).

### **Atividade 3: Resiliência em SD (30 min - Todos)**
1. Teste `GET /pedidos/status-lento` (3s de delay).
   - Configure timeout no Postman (5s) e observe falha.
2. Force retry (repita 3x).
   - **Pergunta:** Sem idempotência, isso duplicaria um pagamento? Como mitigar?

**Check avançado (10 min):** Adicione validação no POST (ex: valor > 0) e teste **400**.

### **Desafio Avançado (10 min - Rápidos)**
- Implemente filtro: `GET /pedidos?status=pendente`.
- Persista em arquivo JSON (use `fs` module).
- Ajude um colega e registre no chat da turma.

**Rubrica de Avaliação (0-10 pts):**
- Execução CRUD: 4 pts (prints comprovados).
- Interpretação erros/status: 3 pts (respostas às perguntas).
- Discussão resiliência: 3 pts (participação no check).

**Dados resetam ao reiniciar** (memória volátil – simula falha de serviço).

## ⚠️ Problemas Comuns
- **Porta ocupada:** Mate processo com `killall node` ou mude PORT.
- **JSON inválido:** Verifique aspas duplas no body.
- **Nodemon não roda:** `npm i -D nodemon`.

## 📚 Conexão com Teoria (Encontro 1)
- **Contrato HTTP:** Métodos e status como "idioma universal".
- **REST:** Recursos (`pedidos`) com substantivos.
- **SD:** Latência mostra custo síncrono; idempotência evita caos em falhas.

**Autor:** Prof. Esley Bonomo (UNIVÁS - Sistemas Distribuídos).  
**Licença:** MIT (use livremente em sala).