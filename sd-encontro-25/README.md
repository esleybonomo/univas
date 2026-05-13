# CAP Theorem Lab — MongoDB Replica Set + Node.js

## Objetivo

Laboratório prático para demonstrar:

- Strong Consistency
- Eventual Consistency
- Stale Reads
- Failover
- CAP Theorem na prática

---

# Subir ambiente

```bash
docker compose up -d
```

---

# Inicializar Replica Set

```bash
docker exec -it mongo1 mongosh
```

Executar:

```javascript
load("/init-replica.js")
```

---

# Acessar aplicação

```txt
http://localhost:3000
```

---

# Cenário 1 — Strong Consistency

## Escrita

```bash
curl -X POST localhost:3000/strong/write \
-H "Content-Type: application/json" \
-d '{"name":"Alice","balance":100}'
```

## Leitura

```bash
curl localhost:3000/strong/read/Alice
```

## O que esperar

- leitura consistente
- confirmação pela maioria
- maior latência

---

# Exceção — Perda de Majority

Derrube dois nós:

```bash
docker stop mongo2 mongo3
```

Repita a escrita.

## Resultado esperado

```txt
MongoServerError: waiting for replication timed out
```

Discussão:

- Consistência preservada
- Disponibilidade reduzida
- MongoDB prioriza CP

---

# Cenário 2 — Eventual Consistency

## Escrita

```bash
curl -X POST localhost:3000/eventual/write \
-H "Content-Type: application/json" \
-d '{"name":"Notebook","stock":10}'
```

## Leitura imediata

```bash
curl localhost:3000/eventual/read/Notebook
```

## Resultado esperado

Possíveis cenários:

### Caso 1

Documento disponível imediatamente.

### Caso 2

Documento ainda não replicado:

```txt
null
```

---

# Cenário 3 — Simular Stale Read

Entrar no secundário:

```bash
docker exec -it mongo2 mongosh
```

Executar:

```javascript
db.adminCommand({
  configureFailPoint: "rsSyncApplyStop",
  mode: "alwaysOn"
})
```

Inserir novo documento no primary e ler novamente.

## Resultado esperado

Leitura stale:

```txt
null
```

---

# Restaurar replicação

```javascript
db.adminCommand({
  configureFailPoint: "rsSyncApplyStop",
  mode: "off"
})
```

---

# Cenário 4 — Failover

Descobrir primary:

```javascript
rs.status()
```

Derrubar primary:

```bash
docker stop mongo1
```

## Resultado esperado

- nova eleição
- pequena indisponibilidade
- novo primary assume

---

# Perguntas para discussão

1. Por que MongoDB é CP?
2. Qual o custo de strong consistency?
3. Quando eventual consistency faz sentido?
4. Como stale reads afetam sistemas reais?
5. O que é split-brain?
