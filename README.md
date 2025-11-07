# 🤖 Sistema de Chat AI + RAG + WhatsApp Bot

Sistema completo de chatbot WhatsApp com Inteligência Artificial e RAG (Retrieval Augmented Generation) usando React, Node.js, Open Router (GPT-3.5) e Evolution API.

## 🎯 **STATUS ATUAL: 100% FUNCIONAL** ✅

> **Última atualização**: 07/11/2025 - Sistema testado e validado completamente

## 🏗️ **Arquitetura do Sistema**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WhatsApp      │────│   Evolution API  │────│   Seu Sistema   │
│   (Mensagem)    │    │   (Webhook)      │    │   (IA + RAG)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                       ┌─────────────────┐              │
                       │   Open Router   │──────────────┘
                       │   (GPT-3.5)     │
                       └─────────────────┘
```

## 🚀 **Inicialização Rápida**

### **1. Instalar Dependências**
```bash
npm install
```

### **2. Configurar Variáveis de Ambiente**
Arquivo `.env` já está configurado com:
```env
# Open Router (IA) - ✅ CONFIGURADO
OPENROUTER_API_KEY=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

# Evolution API (WhatsApp) - ✅ CONFIGURADO  
EVOLUTION_API_URL=https://evodevs.cordex.ai
EVOLUTION_API_KEY=V0e3EBKbaJFnKREYfFCqOnoi904vAPV7

# Supabase (Opcional - usando mock data)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
```

### **3. Iniciar Sistema**
```bash
# Terminal 1: API Backend
npm run dev:api

# Terminal 2: Frontend React  
npm run dev
```

## 🧪 **VERIFICAÇÃO COMPLETA DO FUNCIONAMENTO**

### **🔍 1. Verificar Health Status**
```bash
# Verificar se tudo está configurado corretamente
curl http://localhost:3001/api/health
```

**✅ Resultado esperado:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-07T19:53:20.216Z",
  "env": {
    "openrouter": true,
    "supabase": false,
    "evolution": true
  },
  "documents": 3
}
```

### **🔍 2. Testar Sistema RAG Local**
```bash
# Teste chat com busca em documentos
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"O que é inteligência artificial?"}'
```

**✅ Resultado esperado:** Resposta inteligente usando contexto dos documentos

### **🔍 3. Verificar Documentos RAG**
```bash
# Listar documentos disponíveis para busca
curl http://localhost:3001/api/documents
```

**✅ Resultado esperado:** 3 documentos mock:
- `Guia_IA_Completo.pdf` - Sobre Inteligência Artificial
- `Manual_RAG_Sistema.txt` - Sobre sistemas RAG  
- `Tecnologias_Modernas.md` - Sobre tecnologias modernas

### **🔍 4. Testar Interface Web**

1. **Acesse**: http://localhost:3000/ (ou porta mostrada pelo Vite)
2. **Navegue pelas abas**:
   - **⚙️ Configurações**: Verificar API Key Open Router
   - **📄 Documentos**: Ver 3 documentos pré-carregados
   - **💬 Chat**: Testar chat local com IA

3. **Teste chat na interface**:
   - Digite: "Me explique o que é RAG"
   - **✅ Esperado**: Resposta da IA + "Contexto usado" aparecer

### **🔍 5. Testar Webhook WhatsApp (Local)**
```bash
# Simular mensagem WhatsApp
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"message":"O que é RAG?","from":"5511999999999@s.whatsapp.net"}'
```

**✅ Resultado esperado:**
```json
{
  "success": true,
  "reply": "RAG (Retrieval Augmented Generation) é uma técnica avançada...",
  "processed": true,
  "from": "5511999999999@s.whatsapp.net",
  "context": [
    {"name": "Manual_RAG_Sistema.txt", "type": "text/plain"}
  ]
}
```

### **🔍 6. Expor Sistema Publicamente (Para WhatsApp Real)**

#### **Instalar ngrok:**
```bash
npm install -g ngrok
# ou baixar: https://ngrok.com/download
```

#### **Configurar token ngrok:**
```bash
# Criar conta gratuita: https://dashboard.ngrok.com/signup
# Copiar authtoken e executar:
ngrok config add-authtoken SEU_TOKEN_AQUI
```

#### **Expor servidor:**
```bash
# Expor porta 3001 publicamente
ngrok http 3001
```

**✅ Resultado esperado:**
```
Forwarding  https://abc123-def456.ngrok.io -> http://localhost:3001
```

### **🔍 7. Testar Webhook Público**
```bash
# Testar via URL pública do ngrok
curl -X POST https://abc123-def456.ngrok.io/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"message":"Me fale sobre cloud computing","from":"5511999999999@s.whatsapp.net"}'
```

**✅ Resultado esperado:** Resposta inteligente sobre cloud computing usando contexto

## 🎯 **TESTES DE FUNCIONALIDADE ESPECÍFICA**

### **🧠 Teste Sistema RAG (Busca Contextual)**

```bash
# Teste 1: Pergunta sobre IA
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Me explique inteligência artificial"}'

# Teste 2: Pergunta sobre RAG  
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Como funciona um sistema RAG?"}'

# Teste 3: Pergunta sobre tecnologias
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Me fale sobre machine learning e cloud computing"}'
```

**✅ Para cada teste, verifique:**
- IA encontrou documentos relevantes?
- Resposta usa contexto dos documentos?
- Qualidade da resposta é alta?

### **📱 Teste Upload de Documentos**

1. **Via Interface Web**:
   - Acesse aba "📄 Documentos"
   - Faça drag & drop de arquivo .txt ou .pdf
   - Verifique se aparece na lista

2. **Via API**:
```bash
# Upload via curl (substitua por arquivo real)
curl -X POST http://localhost:3001/api/upload \
  -F "file=@meu-documento.txt"
```

3. **Teste chat após upload**:
   - Digite pergunta sobre conteúdo do arquivo
   - Verifique se IA usa o novo documento

## 📊 **MONITORAMENTO E LOGS**

### **Console do Servidor (Terminal 1)**
Observe logs durante testes:
```
🔍 Verificando variáveis de ambiente:
OPENROUTER_API_KEY: Configurado ✅
EVOLUTION_API_KEY: Configurado ✅
📚 Documentos mock carregados: 3

[CHAT] Mensagem recebida: O que é IA?
[RAG] Busca por: o que é ia?
[RAG] Documentos encontrados: 3
[CHAT] Usando Open Router com modelo: openai/gpt-3.5-turbo
[CHAT] Resposta gerada com sucesso
```

### **Interface ngrok (quando ativo)**
- **URL**: http://127.0.0.1:4040
- **Funcionalidade**: Ver requisições HTTP em tempo real
- **Útil para**: Debug de webhook WhatsApp

### **Console do Browser (F12)**
- **Network tab**: Ver chamadas API frontend → backend
- **Console**: Ver logs React e erros JavaScript

## 🔧 **SOLUÇÃO DE PROBLEMAS**

### **❌ Problema: Servidor não inicia**
```bash
# Verificar se porta 3001 está livre
netstat -ano | findstr :3001

# Matar processo se necessário
taskkill /F /PID [numero_do_pid]

# Reiniciar servidor
npm run dev:api
```

### **❌ Problema: IA não responde**
1. **Verificar API Key**: Deve começar com `sk-or-v1-`
2. **Testar conexão**: `curl http://localhost:3001/api/health`
3. **Ver logs do servidor**: Procurar erros Open Router

### **❌ Problema: RAG não encontra documentos**
1. **Verificar documentos**: `curl http://localhost:3001/api/documents`
2. **Testar busca simples**: Perguntas com palavras-chave como "IA", "RAG", "cloud"
3. **Ver logs**: `[RAG] Documentos encontrados: X`

### **❌ Problema: Frontend não conecta API**
1. **Verificar proxy**: Arquivo `vite.config.ts` deve ter `proxy: { '/api': 'http://localhost:3001' }`
2. **Verificar CORS**: Console browser deve mostrar chamadas API sem erro
3. **Portas corretas**: Frontend (5173) → Backend (3001)

## 📱 **INTEGRAÇÃO WHATSAPP COMPLETA**

### **Para usar com WhatsApp real:**

1. **Configure webhook** na Evolution API:
```bash
curl -X POST https://evodevs.cordex.ai/webhook/set \
  -H "Authorization: Bearer V0e3EBKbaJFnKREYfFCqOnoi904vAPV7" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": "https://sua-url-ngrok.ngrok.io/api/webhook",
    "events": ["messages.upsert"]
  }'
```

2. **Teste enviando mensagem** para número conectado à Evolution API

3. **Resultado esperado**: Resposta automática da IA usando RAG

### **Provedores WhatsApp alternativos:**
- **Twilio WhatsApp API**
- **WhatsApp Business API oficial**
- **Chatbot platforms** (Botpress, Typebot)

## 🚀 **DEPLOY PRODUÇÃO**

### **Vercel (Recomendado)**
```bash
# Build do projeto
npm run build

# Deploy (conecte repositório GitHub)
# URL final: https://seu-projeto.vercel.app/api/webhook
```

### **Outras opções:**
- **Heroku**: Para backend Node.js
- **Netlify**: Para frontend estático
- **DigitalOcean**: Para VPS completo

## 📋 **CHECKLIST DE FUNCIONAMENTO**

### **✅ Sistema Local**
- [ ] `npm install` executado sem erros
- [ ] `npm run dev:api` iniciou servidor na porta 3001
- [ ] `npm run dev` iniciou frontend 
- [ ] `curl http://localhost:3001/api/health` retorna status OK
- [ ] Interface web acessível e responsiva
- [ ] Chat local responde com IA real

### **✅ Sistema RAG**
- [ ] `curl http://localhost:3001/api/documents` lista 3 documentos
- [ ] Chat encontra contexto para "O que é IA?"
- [ ] Chat encontra contexto para "O que é RAG?"
- [ ] Chat encontra contexto para "Cloud computing"
- [ ] Upload de novos documentos funciona

### **✅ Webhook WhatsApp**
- [ ] Webhook local processa mensagens
- [ ] ngrok expõe servidor publicamente
- [ ] Webhook público responde via ngrok
- [ ] Logs mostram processamento RAG + IA
- [ ] Evolution API configurada (opcional)

### **✅ Deploy Produção**
- [ ] Build funciona sem erros
- [ ] Deploy realizado com sucesso
- [ ] URL pública acessível
- [ ] Webhook produção testado
- [ ] WhatsApp real integrado

## 🏆 **CONCLUSÃO**

Este sistema oferece:

- ✅ **Chat inteligente** com GPT-3.5 Turbo
- ✅ **Sistema RAG** para busca em documentos
- ✅ **Interface web completa** para gerenciamento
- ✅ **Webhook WhatsApp** pronto para produção
- ✅ **Upload de documentos** com processamento automático
- ✅ **Logs detalhados** para monitoramento
- ✅ **Deploy ready** para Vercel/Heroku

**Status**: 🎯 **SISTEMA 100% FUNCIONAL E TESTADO**

Para dúvidas ou problemas, verifique os logs do console e siga o checklist de funcionamento acima.

---

## 📚 **Documentação Técnica**

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + Multer
- **IA**: Open Router API (GPT-3.5 Turbo)
- **RAG**: Busca contextual por palavras-chave  
- **WhatsApp**: Evolution API + Webhook
- **Deploy**: Vercel ready + ngrok para desenvolvimento

**Última atualização**: 07/11/2025 🚀