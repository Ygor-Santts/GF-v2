# 💰 FinanceFlow - Sistema de Gestão Financeira

Sistema moderno e completo para controle de finanças pessoais com interface intuitiva e funcionalidades avançadas.

## 🚀 Início Rápido

### Modo Recomendado (Frontend Local + Backend Docker):
```bash
./run-hybrid-improved.sh
```

### Modo Docker Completo:
```bash
docker compose up -d
```

### Modo Local Completo:
```bash
./run-local.sh
```

## 📱 Funcionalidades

- 📊 **Dashboard** com gráficos e métricas em tempo real
- 💳 **Gestão de Transações** com filtros avançados
- 🔄 **Transações Recorrentes** automatizadas
- 🏦 **Controle de Financiamentos** com simulações
- 📈 **Relatórios Detalhados** com insights inteligentes
- 🎨 **Interface Moderna** responsiva e intuitiva

## 🛠️ Tecnologias

**Frontend:**
- Vue.js 3 + TypeScript
- Vite (desenvolvimento rápido)
- Chart.js (gráficos)
- CSS customizado responsivo

**Backend:**
- Node.js + Express + TypeScript
- MongoDB (banco de dados)
- Zod (validação)
- Cron jobs (automação)

**DevOps:**
- Docker & Docker Compose
- Scripts automatizados
- Hot-reload em desenvolvimento

## 📋 URLs de Acesso

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## 📚 Documentação

Para informações detalhadas sobre os diferentes modos de execução, consulte:
- [MODOS-EXECUCAO.md](./MODOS-EXECUCAO.md) - Guia completo dos modos de execução

## 🔧 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `./run-hybrid-improved.sh` | **Modo híbrido** (recomendado para desenvolvimento) |
| `./stop-hybrid.sh` | Para o modo híbrido |
| `./run-local.sh` | Modo local completo |

## 🎯 Estrutura do Projeto

```
├── backend/           # API Node.js + TypeScript
│   ├── src/
│   │   ├── models/    # Modelos MongoDB
│   │   ├── routes/    # Rotas da API
│   │   └── services/  # Lógica de negócio
│   └── package.json
├── frontend/          # Interface Vue.js
│   ├── src/
│   │   ├── pages/     # Páginas da aplicação
│   │   ├── components/# Componentes reutilizáveis
│   │   └── api/       # Cliente HTTP
│   └── package.json
├── docker-compose.yml # Docker completo
├── docker-compose.backend.yml # Apenas backend + MongoDB
└── MODOS-EXECUCAO.md  # Documentação detalhada
```

## 🤝 Desenvolvimento

1. **Clone o repositório**
2. **Execute o modo híbrido**: `./run-hybrid-improved.sh`
3. **Acesse**: http://localhost:5173
4. **Desenvolva** com hot-reload automático!

---

**Desenvolvido com ❤️ para facilitar sua gestão financeira**