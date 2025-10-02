#!/bin/bash

# Script melhorado para rodar Frontend LOCAL + Backend/MongoDB no DOCKER
# Com verificações de porta e melhor tratamento de erros

echo "🚀 Iniciando modo híbrido melhorado (Frontend local + Backend Docker)..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Função para verificar se porta está em uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Porta em uso
    else
        return 1  # Porta livre
    fi
}

# Função para parar processos ao sair
cleanup() {
    echo ""
    echo "🛑 Parando serviços..."
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "   Parando frontend local (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    # Parar qualquer processo Vite restante
    pkill -f "vite --host" 2>/dev/null
    
    echo "   Parando backend Docker..."
    docker compose -f docker-compose.backend.yml down
    
    echo "✅ Todos os serviços foram parados."
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Verificar se porta 4000 está livre (para backend)
if check_port 4000; then
    echo "⚠️  Porta 4000 já está em uso. Verificando se é nosso backend..."
    if curl -s http://localhost:4000/health | grep -q "ok"; then
        echo "✅ Backend já está rodando e funcionando!"
    else
        echo "❌ Porta 4000 ocupada por outro serviço. Parando..."
        exit 1
    fi
else
    echo "🐳 Iniciando Backend + MongoDB no Docker..."
    docker compose -f docker-compose.backend.yml up -d
    
    echo "⏳ Aguardando backend inicializar..."
    
    # Verificar se backend está funcionando (com timeout)
    echo "🔍 Verificando se backend está funcionando..."
    for i in {1..15}; do
        if curl -s http://localhost:4000/health | grep -q "ok"; then
            echo "✅ Backend está funcionando!"
            break
        else
            echo "   Tentativa $i/15 - Aguardando backend..."
            sleep 2
        fi
        
        if [ $i -eq 15 ]; then
            echo "❌ Backend não iniciou corretamente. Verificando logs..."
            docker compose -f docker-compose.backend.yml logs backend --tail=20
            cleanup
            exit 1
        fi
    done
fi

# Verificar se porta 5173 está livre (para frontend)
if check_port 5173; then
    echo "⚠️  Porta 5173 já está em uso. Parando processo anterior..."
    pkill -f "vite --host" 2>/dev/null
    sleep 3
    
    # Verificar novamente
    if check_port 5173; then
        echo "❌ Não foi possível liberar a porta 5173. Processo:"
        lsof -Pi :5173 -sTCP:LISTEN
        cleanup
        exit 1
    fi
fi

echo "🎨 Iniciando Frontend localmente..."
cd frontend

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install
fi

# Iniciar frontend
npm run dev &
FRONTEND_PID=$!

# Aguardar frontend inicializar
echo "⏳ Aguardando frontend inicializar..."
sleep 5

# Verificar se frontend está funcionando
for i in {1..10}; do
    if curl -s -I http://localhost:5173 | grep -q "200 OK"; then
        echo "✅ Frontend está funcionando!"
        break
    else
        echo "   Tentativa $i/10 - Aguardando frontend..."
        sleep 2
    fi
    
    if [ $i -eq 10 ]; then
        echo "❌ Frontend não iniciou corretamente."
        cleanup
        exit 1
    fi
done

echo ""
echo "🎉 Modo híbrido ativo e funcionando!"
echo ""
echo "📍 URLs de acesso:"
echo "   🎨 Frontend (local):  http://localhost:5173"
echo "   🐳 Backend (Docker):  http://localhost:4000"
echo "   🗄️  MongoDB (Docker): localhost:27017"
echo "   ❤️  Health Check:     http://localhost:4000/health"
echo ""
echo "💡 Vantagens deste modo:"
echo "   ✓ Frontend com hot-reload instantâneo"
echo "   ✓ Backend e banco isolados e seguros"
echo "   ✓ Dados persistem mesmo reiniciando"
echo "   ✓ Fácil debug do frontend"
echo "   ✓ Melhor performance de desenvolvimento"
echo ""
echo "📊 Status dos serviços Docker:"
docker compose -f docker-compose.backend.yml ps
echo ""
echo "🔧 Comandos úteis:"
echo "   Ver logs backend: docker compose -f docker-compose.backend.yml logs backend -f"
echo "   Ver logs MongoDB: docker compose -f docker-compose.backend.yml logs mongo -f"
echo "   Reiniciar backend: docker compose -f docker-compose.backend.yml restart backend"
echo ""
echo "Pressione Ctrl+C para parar todos os serviços"

# Aguardar indefinidamente
wait
