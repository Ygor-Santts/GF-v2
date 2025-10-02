#!/bin/bash

# Script para parar o modo híbrido

echo "🛑 Parando modo híbrido..."

echo "   Parando frontend local..."
pkill -f "vite --host" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null

echo "   Parando backend Docker..."
docker compose -f docker-compose.backend.yml down

echo "✅ Modo híbrido parado!"

# Verificar se ainda há processos rodando
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Ainda há processo na porta 5173:"
    lsof -Pi :5173 -sTCP:LISTEN
fi

if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Ainda há processo na porta 4000:"
    lsof -Pi :4000 -sTCP:LISTEN
fi
