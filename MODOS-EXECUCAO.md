# 🚀 Modos de Execução do Projeto

Este projeto oferece **3 modos diferentes** de execução para atender diferentes necessidades de desenvolvimento:

## 📋 Resumo dos Modos

| Modo                   | Frontend  | Backend   | MongoDB   | Melhor Para                        |
| ---------------------- | --------- | --------- | --------- | ---------------------------------- |
| **🐳 Docker Completo** | Container | Container | Container | Produção, CI/CD, Consistência      |
| **🔀 Híbrido**         | Local     | Container | Container | Desenvolvimento Frontend           |
| **💻 Local Completo**  | Local     | Local     | Local     | Debug Profundo, Recursos Limitados |

---

## 🐳 **Modo 1: Docker Completo**

**Tudo roda em containers Docker**

### Como usar:

```bash
# Iniciar
docker compose up -d

# Parar
docker compose down

# Ver logs
docker compose logs -f
```

### Vantagens:

- ✅ Ambiente idêntico para todos
- ✅ Fácil deploy
- ✅ Isolamento completo
- ✅ Não precisa instalar dependências

### Desvantagens:

- ❌ Hot-reload mais lento
- ❌ Usa mais recursos
- ❌ Debug mais complexo

---

## 🔀 **Modo 2: Híbrido (RECOMENDADO para desenvolvimento)**

**Frontend local + Backend/MongoDB em Docker**

### Como usar:

```bash
# Versão melhorada (recomendada)
./run-hybrid-improved.sh

# Versão simples
./run-hybrid.sh

# Parar
./stop-hybrid.sh
# ou Ctrl+C no terminal
```

### Vantagens:

- ✅ **Hot-reload instantâneo** no frontend
- ✅ **Dados seguros** no Docker
- ✅ **Debug fácil** do frontend
- ✅ **Performance máxima** para desenvolvimento
- ✅ **Backend estável** e isolado

### Desvantagens:

- ❌ Precisa Node.js instalado
- ❌ Configuração um pouco mais complexa

### URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- MongoDB: localhost:27017

---

## 💻 **Modo 3: Local Completo**

**Tudo roda localmente**

### Como usar:

```bash
# Script automático
./run-local.sh

# Manual (2 terminais)
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

### Vantagens:

- ✅ **Máxima velocidade** de desenvolvimento
- ✅ **Debug completo** de tudo
- ✅ **Menos recursos** utilizados
- ✅ **Controle total**

### Desvantagens:

- ❌ Precisa MongoDB instalado
- ❌ Pode ter inconsistências de ambiente
- ❌ Setup inicial mais complexo

---

## 🎯 **Qual Modo Escolher?**

### Para **Desenvolvimento Diário**:

```bash
./run-hybrid-improved.sh
```

**Por quê?** Melhor experiência de desenvolvimento com dados seguros.

### Para **Testes de Integração**:

```bash
docker compose up -d
```

**Por quê?** Ambiente idêntico à produção.

### Para **Debug Profundo**:

```bash
./run-local.sh
```

**Por quê?** Controle total sobre todos os componentes.

---

## 🔧 **Scripts Disponíveis**

| Script                       | Descrição                                |
| ---------------------------- | ---------------------------------------- |
| `run-hybrid-improved.sh`     | **Modo híbrido melhorado** (recomendado) |
| `run-hybrid.sh`              | Modo híbrido simples                     |
| `stop-hybrid.sh`             | Para o modo híbrido                      |
| `run-local.sh`               | Modo local completo                      |
| `docker-compose.yml`         | Docker completo                          |
| `docker-compose.backend.yml` | Apenas backend + MongoDB                 |

---

## 🚨 **Troubleshooting**

### Porta já em uso:

```bash
# Ver o que está usando a porta
lsof -i :5173  # Frontend
lsof -i :4000  # Backend

# Parar processo
kill -9 <PID>
```

### Docker não responde:

```bash
# Reiniciar Docker
sudo systemctl restart docker

# Limpar containers
docker system prune -f
```

### Frontend não carrega:

```bash
# Reinstalar dependências
cd frontend
rm -rf node_modules
npm install
```

### Backend não conecta no MongoDB:

```bash
# Ver logs
docker compose -f docker-compose.backend.yml logs mongo
docker compose -f docker-compose.backend.yml logs backend
```

---

## 📊 **Monitoramento**

### Ver status:

```bash
# Docker
docker compose ps

# Processos locais
ps aux | grep -E "(node|npm)"

# Portas em uso
netstat -tlnp | grep -E "(4000|5173|27017)"
```

### Ver logs:

```bash
# Backend Docker
docker compose -f docker-compose.backend.yml logs backend -f

# Frontend local
# Logs aparecem no terminal onde rodou npm run dev
```

---

## 🎉 **Dica Final**

Para desenvolvimento diário, use:

```bash
./run-hybrid-improved.sh
```

Este modo oferece a **melhor experiência** combinando:

- 🚀 Velocidade do frontend local
- 🛡️ Segurança dos dados no Docker
- 🔧 Facilidade de debug
- ⚡ Performance máxima
