# 🏗️ Arquitetura do FinanceFlow

## 📋 Visão Geral

O FinanceFlow foi completamente reestruturado com uma arquitetura moderna, escalável e de fácil manutenção, seguindo as melhores práticas de desenvolvimento.

## 🎯 Frontend Architecture

### 📁 Estrutura de Diretórios

```
frontend/src/
├── components/          # Componentes reutilizáveis
│   ├── TransactionModal.vue
│   ├── RecurringModal.vue
│   ├── FinancingModal.vue
│   └── FinancingDetailsModal.vue
├── pages/              # Páginas da aplicação
│   ├── Dashboard.vue
│   ├── Transactions.vue
│   ├── Recurring.vue
│   ├── Financing.vue
│   └── Reports.vue
├── services/           # Camada de serviços para APIs
│   ├── api.ts          # Cliente HTTP base
│   ├── transactionService.ts
│   ├── recurringService.ts
│   ├── financingService.ts
│   └── reportsService.ts
├── stores/             # Gerenciamento de estado (Pinia)
│   ├── dashboardStore.ts
│   ├── transactionStore.ts
│   ├── recurringStore.ts
│   └── financingStore.ts
├── router/             # Configuração de rotas
│   └── index.ts
└── style.css           # Estilos globais customizados
```

### 🔧 Tecnologias Utilizadas

- **Vue 3** - Framework reativo
- **TypeScript** - Tipagem estática
- **Pinia** - Gerenciamento de estado
- **Vue Router** - Roteamento
- **Axios** - Cliente HTTP
- **Chart.js** - Gráficos interativos
- **Lucide Vue** - Ícones modernos
- **Vite** - Build tool e dev server

### 🏪 Stores (Pinia)

#### DashboardStore

- Gerencia dados do dashboard
- Cache de dados com refresh automático
- Formatação de moeda e datas
- Cálculos de tendências e insights

#### TransactionStore

- CRUD completo de transações
- Filtros e paginação
- Cálculos de receitas, despesas e saldo
- Estados de loading e error

#### RecurringStore

- Gerenciamento de transações recorrentes
- Ativação/desativação
- Processamento manual
- Cálculos mensais

#### FinancingStore

- Controle de financiamentos
- Simulação de pagamento antecipado
- Parcelas e cronograma
- Estatísticas financeiras

### 🔌 Services Layer

#### ApiService (Base)

- Cliente HTTP configurado
- Interceptors para autenticação
- Tratamento global de erros
- Timeout e retry automático

#### Specific Services

- **TransactionService**: CRUD + filtros + estatísticas
- **RecurringService**: Gerenciamento de recorrências
- **FinancingService**: Controle de financiamentos
- **ReportsService**: Relatórios e dashboard

### 🎨 Design System

#### Cores Principais

- **Primary**: Azul (#3b82f6) - Ações principais
- **Success**: Verde (#10b981) - Receitas e sucesso
- **Danger**: Vermelho (#ef4444) - Despesas e alertas
- **Slate**: Cinza (#64748b) - Textos e backgrounds

#### Componentes

- Cards com glassmorphism
- Botões com gradientes
- Inputs com focus states
- Animações suaves (fade-in, slide-up)
- Responsividade mobile-first

## 🚀 Backend Architecture

### 📁 Estrutura de Diretórios

```
backend/src/
├── models/             # Modelos do MongoDB
│   ├── Transaction.ts
│   ├── Recurring.ts
│   └── Financing.ts
├── routes/             # Rotas da API
│   ├── transactions.ts
│   ├── recurring.ts
│   ├── financing.ts
│   └── reports.ts
├── services/           # Lógica de negócio
│   ├── ensureMonth.ts
│   └── report.ts
└── server.ts           # Servidor principal
```

### 🔧 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **Zod** - Validação de schemas
- **CORS** - Cross-origin requests
- **Morgan** - Logging de requests

### 📡 API Endpoints

#### Transactions (`/api/transactions`)

- `GET /` - Listar com filtros e paginação
- `GET /recent` - Transações recentes
- `GET /stats` - Estatísticas
- `GET /:id` - Buscar por ID
- `POST /` - Criar nova
- `PUT /:id` - Atualizar
- `PATCH /:id/pay` - Marcar como pago
- `PATCH /:id/cancel` - Cancelar
- `DELETE /:id` - Deletar

#### Recurring (`/api/recurring`)

- `GET /` - Listar recorrentes
- `GET /:id` - Buscar por ID
- `POST /` - Criar nova
- `PUT /:id` - Atualizar
- `PATCH /:id/toggle` - Ativar/desativar
- `POST /process` - Processar manualmente
- `DELETE /:id` - Deletar

#### Financing (`/api/financing`)

- `GET /` - Listar financiamentos
- `GET /stats` - Estatísticas
- `GET /:id` - Buscar por ID
- `GET /:id/payments` - Listar parcelas
- `POST /` - Criar novo
- `POST /:id/pay` - Pagar parcela
- `POST /:id/simulate-early-payment` - Simular pagamento antecipado
- `POST /:id/early-payment` - Pagamento antecipado
- `PUT /:id` - Atualizar
- `DELETE /:id` - Deletar

#### Reports (`/api/reports`)

- `GET /dashboard` - Dados completos do dashboard
- `GET /monthly` - Relatório mensal
- `GET /categories` - Relatório por categorias
- `GET /insights` - Insights financeiros

### 🔒 Validação e Segurança

- **Zod Schemas** - Validação de entrada
- **CORS** configurado
- **Error Handling** global
- **Input Sanitization**
- **Type Safety** com TypeScript

## 🔄 Fluxo de Dados

### 1. Frontend → Backend

```
Component → Store → Service → API → Backend Route → Database
```

### 2. Backend → Frontend

```
Database → Backend Route → API Response → Service → Store → Component
```

### 3. Estado Global

```
Pinia Store ↔ Components (Reactive)
```

## 📊 Padrões de Desenvolvimento

### Frontend

- **Composition API** - Vue 3 moderno
- **TypeScript** - Tipagem forte
- **Reactive State** - Pinia stores
- **Service Layer** - Separação de responsabilidades
- **Error Boundaries** - Tratamento de erros
- **Loading States** - UX aprimorada

### Backend

- **RESTful API** - Padrão de rotas
- **Schema Validation** - Zod
- **Error Handling** - Try/catch + middleware
- **Aggregation Pipelines** - MongoDB otimizado
- **Pagination** - Performance
- **Status Codes** - HTTP semântico

## 🚀 Comandos de Execução

### Desenvolvimento Híbrido (Recomendado)

```bash
./run-hybrid-improved.sh
```

- Frontend local (hot-reload)
- Backend + MongoDB no Docker

### Docker Completo

```bash
docker compose up -d
```

### Local Completo

```bash
./run-local.sh
```

## 📈 Benefícios da Arquitetura

### ✅ Manutenibilidade

- Código organizado e modular
- Separação clara de responsabilidades
- TypeScript para detecção precoce de erros

### ✅ Escalabilidade

- Services reutilizáveis
- Stores modulares
- API RESTful padronizada

### ✅ Performance

- Lazy loading de componentes
- Cache inteligente nas stores
- Paginação no backend
- Agregações otimizadas no MongoDB

### ✅ Developer Experience

- Hot-reload instantâneo
- TypeScript IntelliSense
- Error handling robusto
- Documentação clara

### ✅ User Experience

- Interface moderna e responsiva
- Loading states informativos
- Feedback visual imediato
- Animações suaves

## 🔮 Próximos Passos

1. **Autenticação** - JWT + guards
2. **Testes** - Unit + Integration
3. **PWA** - Service workers
4. **Notificações** - Push notifications
5. **Exportação** - PDF/Excel reports
6. **Backup** - Automated backups
7. **Analytics** - Usage tracking

---

Esta arquitetura garante um código limpo, performático e de fácil manutenção, seguindo as melhores práticas da indústria.
