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

### **2. Configurar Open Router API Key**

**⚠️ ATENÇÃO**: A API Key atual pode se expirar ou não ter acesso aos modelos.

1. **Criar conta no Open Router**:
   - Acesse: https://openrouter.ai/
   - Crie uma conta gratuita
   - Adicione créditos se necessário

2. **Gerar nova API Key**:
   - Vá para: https://openrouter.ai/keys
   - Clique em "Create Key"
   - Copie a chave (formato: `sk-or-v1-...`)

3. **Verificar modelos disponíveis**:
   - Acesse: https://openrouter.ai/models
   - Verifique quais modelos sua conta pode usar

**Modelos recomendados por tipo de conta:**

| Modelo | Tipo de Conta | Custo | Qualidade | ID para Configuração |
|--------|---------------|-------|-----------|---------------------|
| GPT-3.5 Turbo | Gratuita (com limites) | Baixo | Boa | `openai/gpt-3.5-turbo` |
| GPT-4o Mini | Paga | Médio | Excelente | `openai/gpt-4o-mini` |
| Claude 3 Haiku | Paga | Médio | Excelente | `anthropic/claude-3-haiku` |
| Llama 3.1 8B | Gratuita | Grátis | Boa | `meta-llama/llama-3.1-8b-instruct:free` |

4. **Atualizar arquivo `.env`**:
```env
# Open Router (IA) - SUBSTITUA PELA SUA API KEY
OPENROUTER_API_KEY=sk-or-v1-SUA_NOVA_API_KEY_AQUI

# Evolution API (WhatsApp) - ✅ CONFIGURADO  
EVOLUTION_API_URL=https://evodevs.cordex.ai
EVOLUTION_API_KEY=V0e3EBKbaJFnKREYfFCqOnoi904vAPV7

# Supabase (Opcional - usando mock data)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
```

### **3. Validar Configuração da API Key**
```bash
# Testar se API Key está funcionando
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer SUA_API_KEY_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "teste"}],
    "max_tokens": 10
  }'
```

**✅ Resposta de sucesso:**
```json
{"choices":[{"message":{"content":"Olá! Como posso ajudar?"}}]}
```

**❌ Resposta de erro:**
```json
{"error":{"message":"User not found"}}
```

### **4. Iniciar Sistema**
```bash
# Terminal 1: API Backend
node dev-server.js

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

1. **Acesse**: http://localhost:5174/ (ou porta mostrada pelo Vite)
2. **Navegue pelas abas**:
   - **⚙️ Configurações**: Verificar API Key Open Router
   - **📄 Documentos**: Ver 3 documentos pré-carregados
   - **💬 Chat**: Testar chat local com IA

3. **Configurar modelo de IA**:
   - **⚙️ Configurações**: Cole sua API Key do Open Router
   - **Modelo**: Selecione um modelo compatível com sua conta:
     - `openai/gpt-3.5-turbo` (recomendado - gratuito/barato)
     - `openai/gpt-4o-mini` (melhor qualidade)
     - `anthropic/claude-3-haiku` (alternativa)
   - **⚠️ IMPORTANTE**: Sua API Key deve ter acesso ao modelo selecionado

4. **Teste chat na interface**:
   - Digite: "Me explique o que é RAG"
   - **✅ Esperado**: Resposta da IA + "Contexto usado" aparecer
   - **❌ Se erro**: Verifique se modelo está disponível em sua conta

5. **Teste upload de documentos**:
   - Vá para aba "📄 Documentos"
   - Clique na área de upload ou arraste um arquivo .txt
   - **✅ Esperado**: Arquivo aparece na lista de documentos

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

### **📱 Teste Upload de Documentos com Histórico**

1. **Via Interface Web (Recomendado)**:
   - Acesse aba "📄 Documentos"
   - Faça drag & drop do arquivo `teste-historico.txt`
   - **✅ Verifique**: Histórico aparece automaticamente
   - **✅ Verifique**: Item com ✅, nome do arquivo e timestamp completo

2. **Testar funcionalidades do histórico**:
   - **Ocultar/Mostrar**: Clique em "🔽 Ocultar" / "▶️ Mostrar"
   - **Remover individual**: Clique no "✕" de cada item
   - **Limpar tudo**: Clique em "🗑️ Limpar"
   - **Scroll**: Faça vários uploads para ver scroll automático

3. **Teste upload múltiplo**:
   - Selecione vários arquivos: `teste-historico.txt`, `teste-visual-upload.txt`, `teste-upload.txt`
   - Cada arquivo aparece no histórico em ordem cronológica (mais recente primeiro)
   - Animação suave para cada item adicionado

4. **Teste upload com erro** (opcional):
   - Tente fazer upload de arquivo muito grande (>10MB)
   - Deve aparecer no histórico com ❌ e mensagem de erro

5. **Via API (Para debug)**:
```bash
# Upload via curl
curl -X POST http://localhost:3001/api/upload \
  -F "file=@teste-historico.txt"
```

6. **Teste chat após upload**:
   - Digite: "Me fale sobre o teste de histórico"
   - IA deve usar o conteúdo do arquivo como contexto

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
2. **⚠️ IMPORTANTE**: A API Key deve ter acesso ao modelo selecionado nas configurações
3. **Modelos disponíveis**: Verifique em https://openrouter.ai/models quais modelos sua conta pode usar
4. **Testar conexão**: `curl http://localhost:3001/api/health`
5. **Ver logs do servidor**: Procurar erros Open Router

### **❌ Problema: RAG não encontra documentos**
1. **Verificar documentos**: `curl http://localhost:3001/api/documents`
2. **Testar busca simples**: Perguntas com palavras-chave como "IA", "RAG", "cloud"
3. **Ver logs**: `[RAG] Documentos encontrados: X`

### **❌ Problema: "User not found" ou "Model not available"**

**Sintomas:**
```
Erro ao processar mensagem: User not found
Model not available for your account
```

**Causa**: API Key inválida ou sem acesso ao modelo selecionado

**Solução:**
1. **Gerar nova API Key**: https://openrouter.ai/keys
2. **Verificar créditos**: Conta precisa ter saldo positivo
3. **Escolher modelo compatível**:
   - **Gratuitos** (com limites): `openai/gpt-3.5-turbo`
   - **Pagos** (melhores): `openai/gpt-4o-mini`, `anthropic/claude-3-haiku`
4. **Testar API Key**:
```bash
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-3.5-turbo","messages":[{"role":"user","content":"teste"}],"max_tokens":10}'
```

### **❌ Problema: Upload retorna erro 400/500**

**Sintomas:**
```
POST http://localhost:5174/api/upload 400 (Bad Request)
POST http://localhost:5174/api/upload 500 (Internal Server Error)
```

**Solução passo a passo:**

1. **Verificar se backend está rodando:**
```bash
# Deve mostrar servidor ativo na porta 3001
curl http://localhost:3001/api/health
```

2. **Se servidor não estiver rodando:**
```bash
# Verificar processos na porta 3001
netstat -ano | findstr :3001

# Matar processo se necessário
taskkill /F /PID [numero_do_pid]

# Iniciar servidor
node dev-server.js
```

3. **Verificar proxy do Vite:**
```typescript
// vite.config.ts deve ter:
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```

4. **Reiniciar frontend:**
```bash
# Parar frontend (Ctrl+C)
npm run dev
```

5. **Testar upload direto na API:**
```bash
# Criar arquivo teste
echo "Teste de upload" > teste.txt

# Testar upload
curl -X POST http://localhost:3001/api/upload -F "file=@teste.txt"
```

6. **Se ainda não funcionar, verificar logs:**
   - **Console do servidor**: Procurar erros de upload
   - **Console do browser (F12)**: Ver Network tab para detalhes do erro

### **❌ Problema: Frontend não conecta API**
1. **Verificar proxy**: Arquivo `vite.config.ts` deve ter `proxy: { '/api': 'http://localhost:3001' }`
2. **Verificar CORS**: Console browser deve mostrar chamadas API sem erro
3. **Portas corretas**: Frontend (5174) → Backend (3001)

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

### **🚀 VALIDAÇÃO COMPLETA REALIZADA ✅**

**Data do último teste**: 07/11/2025 21:07
**Servidor**: ✅ Funcionando na porta 3001
**Upload**: ✅ Testado e funcionando (4 documentos carregados)
**RAG**: ✅ Sistema de busca contextual operacional
**IA**: ✅ Open Router GPT-3.5 respondendo
**Webhook**: ✅ Integração WhatsApp testada via ngrok

**Comandos de verificação executados:**
```bash
✅ curl http://localhost:3001/api/health        # Status OK
✅ curl http://localhost:3001/api/documents     # 4 documentos listados  
✅ curl -X POST http://localhost:3001/api/upload -F "file=@teste.txt" # Upload OK
✅ curl ngrok-webhook com mensagens WhatsApp    # Respostas IA + RAG
```

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