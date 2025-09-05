# Gestão Financeira — Monorepo (API Node.js + MongoDB + Front Vue 3)

Agora com:
- **Edição inline de Transações** (botão Editar na tabela)
- **Cadastro e lista de Recorrentes (Fixos)** em **Fixos & Financiamentos**, com ativar/desativar e excluir
- Geração mensal a partir dos Recorrentes e Financiamentos

## Rodando
### Backend
```bash
cd backend
cp .env.example .env
npm i
npm run dev   # http://localhost:4000
```
### Frontend
```bash
cd ../frontend
npm i
npm run dev   # http://localhost:5173
```

## Endpoints principais
- `GET/POST/PUT/DELETE /api/transactions`
- `GET/POST/PUT/DELETE /api/recurring`
- `POST /api/recurring/generate?year=YYYY&month=MM`
- `GET/POST/PUT/DELETE /api/financing`
- `POST /api/financing/generate?year=YYYY&month=MM`
- `GET /api/reports/monthly?year=YYYY&month=MM`
