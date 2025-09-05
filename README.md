# Gestão Financeira — API Node.js + MongoDB + Front Vue 3

### Novidades
- **Recorrentes/Financiamentos idempotentes**: gerar mês não duplica mais.
- **Comportamento “todo mês”**: ao abrir Dashboard/Transações de um mês, o backend garante (gera se faltar) os lançamentos **Previstos** daquele mês.
- **Edição inline** de transações.

## Como rodar
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
- `POST /api/recurring/generate?year=YYYY&month=MM` (idempotente)
- `GET/POST/PUT/DELETE /api/financing`
- `POST /api/financing/generate?year=YYYY&month=MM` (idempotente)
- `GET /api/reports/monthly?year=YYYY&month=MM`
