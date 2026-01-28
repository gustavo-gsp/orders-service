# Orders Service (NestJS + GraphQL + Postgres + Redis)

Microserviço em Node.js (NestJS + TypeScript) que expõe um endpoint GraphQL `order(id)` e, internamente, consulta dados no PostgreSQL via Prisma e aplica cache no Redis (cache-aside).

## Stack

- Node.js + TypeScript + NestJS
- GraphQL (Apollo / NestJS GraphQL - code-first)
- PostgreSQL (Prisma ORM)
- Redis (cache-aside)
- Logs estruturados com Pino (nestjs-pino)
- Healthcheck REST `/health` (Postgres + Redis)

---

## Como rodar com Docker (recomendado)

### Subir infraestrutura + API

```bash
docker compose up --build
```

Serviços:

- API: `http://localhost:3000`
- GraphQL: `http://localhost:3000/graphql`
- Health: `http://localhost:3000/health`
- Version: `http://localhost:3000/version`

> Observação: o `DATABASE_URL` é passado também no build (via `build.args`) para permitir `prisma generate` durante o `docker build`.

---

## Como rodar local (sem Docker)

### 1) Subir Postgres e Redis

Você pode subir apenas a infraestrutura via compose:

```bash
docker compose up -d postgres redis
```

### 2) Instalar dependências

```bash
pnpm install
```

### 3) Variáveis de ambiente

Crie um `.env` na raiz do projeto:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/orders?schema=public
REDIS_URL=redis://localhost:6379

CACHE_TTL_SECONDS=60
```

### 4) Migrations + Seed

```bash
pnpm prisma migrate dev
pnpm prisma db seed
```

### 5) Rodar

```bash
pnpm start:dev
```

---

## Endpoints

### REST

- `GET /health`  
  Retorna status de Postgres e Redis.

- `GET /version`  
  Informações básicas de versão/ambiente.

### GraphQL

- `Query.order(id: ID!)`  
  Busca um pedido pelo `id`. Usa Redis como cache-aside e retorna `source`.

- `Query.orders(limit: Int)`  
  Endpoint auxiliar (dev) para listar alguns pedidos e facilitar testes (ex.: obter ids).

---

## Exemplos de Queries

### 1) Listar pedidos para obter IDs (auxiliar)

```graphql
query {
  orders(limit: 5) {
    id
    status
    amount
    currency
    merchant
    customerId
    createdAt
    updatedAt
  }
}
```

### 2) Buscar pedido por ID (com cache)

```graphql
query {
  order(id: "COLE_UM_UUID_AQUI") {
    source
    order {
      id
      status
      amount
      currency
      merchant
      customerId
      createdAt
      updatedAt
    }
  }
}
```

**Comportamento esperado:**

- 1ª chamada: `source = "DB"` (cache miss)
- 2ª chamada (mesmo id, dentro do TTL): `source = "CACHE"` (cache hit)

---

## Cache (Redis)

Estratégia: **cache-aside**

- Key: `order:{id}`
- TTL padrão: `CACHE_TTL_SECONDS` (ex.: 60s)
- Negative cache: quando não encontra o order no banco, armazena `{ notFound: true }` por 15s para evitar consultas repetidas.

---

## Logs (Pino)

- Logs estruturados via `nestjs-pino`
- Request ID (`x-request-id`) gerado por request
- Serialização reduzida (sem dump completo de headers)

---

## Scripts úteis

```bash
pnpm build
pnpm start:dev
pnpm prisma studio
pnpm prisma migrate dev
pnpm prisma db seed
```
