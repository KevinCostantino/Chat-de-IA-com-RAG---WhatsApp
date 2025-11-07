#!/bin/bash

echo "🤖 INICIANDO SISTEMA AI + RAG + WHATSAPP"
echo "========================================"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script na pasta raiz do projeto!"
    exit 1
fi

# Verificar se há arquivo .env
if [ ! -f ".env" ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "📝 Crie o arquivo .env com as credenciais necessárias"
    exit 1
fi

echo "✅ Ambiente configurado"

# Verificar dependências
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Criar pasta uploads se não existir
mkdir -p uploads

echo "🚀 Iniciando sistema completo..."
echo ""
echo "📡 Backend API: http://localhost:3001"
echo "🌐 Frontend: http://localhost:3000"
echo "📱 Webhook: Configure https://seu-ngrok/api/webhook"
echo ""

# Executar servidor em background
node dev-server.js &
API_PID=$!

# Aguardar um momento para o servidor iniciar
sleep 2

echo "✅ Servidor API iniciado (PID: $API_PID)"
echo "🎯 Teste rápido do sistema:"

# Testar API
echo "   • Testando configurações..."
curl -s http://localhost:3001/api/config > /dev/null && echo "     ✅ /api/config OK" || echo "     ❌ /api/config FALHOU"

echo "   • Testando documentos..."
curl -s http://localhost:3001/api/documents > /dev/null && echo "     ✅ /api/documents OK" || echo "     ❌ /api/documents FALHOU"

echo "   • Testando webhook..."
curl -s -X POST http://localhost:3001/api/webhook -H "Content-Type: application/json" -d '{"message":"teste","from":"test@test.com"}' > /dev/null && echo "     ✅ /api/webhook OK" || echo "     ❌ /api/webhook FALHOU"

echo ""
echo "🎉 SISTEMA FUNCIONANDO!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Execute 'npm run dev' em outro terminal para o frontend"
echo "2. Configure ngrok: 'ngrok http 3001'"
echo "3. Configure webhook na Evolution API"
echo "4. Teste enviando mensagem via WhatsApp"
echo ""
echo "💡 Para parar: Ctrl+C ou 'kill $API_PID'"

# Manter o script rodando
wait $API_PID