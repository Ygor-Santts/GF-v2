# GF-v2 — Projeto completo com Docker (Vue 3 + Router + Pinia / Node + Express + Mongo)

## Como rodar com Docker (recomendado em dev)

### 1) Backend + Mongo
```bash
cd docker
docker compose -f compose.backend.yml up --build -d
```

### 2) Frontend
```bash
cd docker
docker compose -f compose.frontend.yml up --build -d
```

### Endpoints
- Frontend: http://localhost:5173
- Backend:  http://localhost:4000/health
- Mongo (Compass): mongodb://localhost:27017/gestao_financeira

> Ajuste `.env` conforme necessário: `backend/.env` e `frontend/.env` (use os `.env.example` como base).

## Stack
- Front: Vue 3 + Vite + Vue Router + Pinia + Axios
- Back: Node.js + Express + Mongoose + Zod + Cron opcional
- DB: MongoDB 6

## Recursos implementados
- Recorrentes com `startDate`, `endDate`, `installments`, edição inline.
- Geração automática ao salvar/editar (seed) + garantia mensal ao listar (idempotente).
- Dashboard e Transações com seletor `<input type="month">`.
