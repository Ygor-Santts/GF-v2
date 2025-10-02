#!/bin/bash

# Script para rodar o projeto localmente (sem Docker)

echo "🚀 Iniciando projeto localmente..."

# Verificar se o MongoDB está rodando
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB não está rodando!"
    echo "   Para instalar e iniciar o MongoDB:"
    echo "   sudo apt update"
    echo "   sudo apt install -y mongodb"
    echo "   sudo systemctl start mongodb"
    echo "   sudo systemctl enable mongodb"
    echo ""
    echo "   Ou use MongoDB Atlas (nuvem) alterando MONGO_URI no .env.local"
    echo ""
fi

# Função para parar processos ao sair
cleanup() {
    echo ""
    echo "🛑 Parando serviços..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

echo "📦 Iniciando Backend..."
cd backend
cp .env.local .env
npm run dev &
BACKEND_PID=$!

echo "🎨 Iniciando Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Projeto rodando localmente!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:4000"
echo ""
echo "Pressione Ctrl+C para parar os serviços"

# Aguardar indefinidamente
wait
