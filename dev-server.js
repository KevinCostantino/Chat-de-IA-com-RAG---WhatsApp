// Carregar .env ANTES de qualquer coisa
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')

console.log('🔍 Verificando variáveis de ambiente:')
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'Configurado ✅' : 'Não encontrado ❌')
console.log('EVOLUTION_API_KEY:', process.env.EVOLUTION_API_KEY ? 'Configurado ✅' : 'Não encontrado ❌')

const app = express()
app.use(cors())
app.use(express.json())

// Configuração do multer para upload
const upload = multer({ dest: 'uploads/' })

// Mock storage para desenvolvimento - DOCUMENTOS CORRIGIDOS
let configs = {}
let documents = [
  {
    id: '1',
    name: 'Guia_IA_Completo.pdf',
    type: 'application/pdf',
    size: 2048576,
    uploadedAt: new Date().toISOString(),
    content: 'Inteligência Artificial (IA) é um campo da ciência da computação que se concentra na criação de sistemas capazes de realizar tarefas que normalmente requerem inteligência humana. Isso inclui aprendizado de máquina, processamento de linguagem natural, visão computacional, robótica e sistemas de tomada de decisão. A IA moderna utiliza redes neurais profundas, algoritmos de aprendizado supervisionado e não supervisionado, e técnicas de processamento de big data para resolver problemas complexos em diversas áreas como medicina, finanças, transporte autônomo e assistentes virtuais.'
  },
  {
    id: '2', 
    name: 'Manual_RAG_Sistema.txt',
    type: 'text/plain',
    size: 1024000,
    uploadedAt: new Date().toISOString(),
    content: 'RAG (Retrieval Augmented Generation) é uma técnica avançada que combina recuperação de informações com geração de texto usando inteligência artificial. O sistema RAG funciona em duas etapas principais: primeiro, busca documentos relevantes em uma base de conhecimento usando similaridade semântica ou busca por palavras-chave; segundo, utiliza esses documentos como contexto adicional para um modelo de linguagem gerar respostas mais precisas e fundamentadas. Esta abordagem permite que sistemas de IA tenham acesso a informações específicas e atualizadas, superando as limitações de conhecimento dos modelos pré-treinados. RAG é amplamente usado em chatbots empresariais, sistemas de suporte ao cliente e assistentes de pesquisa.'
  },
  {
    id: '3',
    name: 'Tecnologias_Modernas.md',
    type: 'text/markdown', 
    size: 1536000,
    uploadedAt: new Date().toISOString(),
    content: 'As tecnologias modernas estão transformando rapidamente nossa sociedade. Machine Learning e Deep Learning são subcampos da IA que permitem que computadores aprendam padrões complexos a partir de dados. Natural Language Processing (NLP) permite que máquinas compreendam e gerem texto humano. Computer Vision possibilita o reconhecimento e análise de imagens e vídeos. Robótica combina IA com engenharia mecânica para criar máquinas autônomas. Cloud Computing fornece infraestrutura escalável para executar algoritmos complexos. Edge Computing traz processamento para dispositivos locais. Internet das Coisas (IoT) conecta objetos físicos à internet. Blockchain oferece segurança e transparência em transações digitais.'
  }
]

console.log('📚 Documentos mock carregados:', documents.length)

// Health check
app.get('/api/health', (req, res) => {
  const hasOpenRouter = !!(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.startsWith('sk-or-'))
  const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  const hasEvolution = !!(process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY)
  
  console.log('Health check:', { hasOpenRouter, hasSupabase, hasEvolution, documents: documents.length })
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: {
      openrouter: hasOpenRouter,
      supabase: hasSupabase,
      evolution: hasEvolution
    },
    documents: documents.length
  })
})

// Chat endpoint com RAG melhorado
app.post('/api/chat', async (req, res) => {
  try {
    const { message, cfg } = req.body
    console.log('[CHAT] Mensagem recebida:', message)

    // Usar API Key do .env ou da configuração
    const apiKey = process.env.OPENROUTER_API_KEY || cfg?.openRouterKey || configs.openRouterKey
    const model = cfg?.model || configs.model || 'openai/gpt-3.5-turbo'
    const systemPrompt = cfg?.systemPrompt || configs.systemPrompt || 'Você é um assistente útil e especializado.'

    // MELHORAR BUSCA RAG - buscar por palavras-chave
    const searchTerms = message.toLowerCase()
    const keywords = ['rag', 'retrieval', 'augmented', 'generation', 'ia', 'inteligencia', 'artificial', 'machine', 'learning', 'tecnologia', 'moderno']
    
    const relevantDocs = documents.filter(doc => {
      const docContent = doc.content.toLowerCase()
      const docName = doc.name.toLowerCase()
      
      // Busca por termos específicos na mensagem
      return keywords.some(keyword => 
        (searchTerms.includes(keyword) && (docContent.includes(keyword) || docName.includes(keyword))) ||
        searchTerms.split(' ').some(term => term.length > 3 && (docContent.includes(term) || docName.includes(term)))
      )
    })

    console.log('[RAG] Busca por:', searchTerms)
    console.log('[RAG] Documentos encontrados:', relevantDocs.length)
    
    let context = ''
    if (relevantDocs.length > 0) {
      context = relevantDocs.map((doc, idx) => 
        `=== DOCUMENTO ${idx + 1}: ${doc.name} ===\n${doc.content}\n`
      ).join('\n')
      console.log('[RAG] Contexto gerado com', context.length, 'caracteres')
    }

    if (!apiKey || !apiKey.startsWith('sk-or-')) {
      console.log('[CHAT] Sem API Key válida - usando modo echo com RAG')
      const baseReply = `Recebi sua mensagem: "${message}".`
      const ragInfo = relevantDocs.length > 0 
        ? `\n\nEncontrei ${relevantDocs.length} documento(s) relevante(s): ${relevantDocs.map(d => d.name).join(', ')}. Configure uma API Key válida do Open Router para respostas inteligentes usando este contexto.`
        : '\n\nConfigure uma API Key válida do Open Router (sk-or-v1-...) para respostas da IA.'
      
      return res.json({ 
        reply: baseReply + ragInfo,
        context: relevantDocs.length > 0 ? relevantDocs : null
      })
    }

    console.log('[CHAT] Usando Open Router com modelo:', model)

    // Chamada para Open Router
    const axios = require('axios')
    const systemMessage = systemPrompt + (context ? 
      `\n\n=== CONTEXTO DOS DOCUMENTOS ===\n${context}\n=== FIM DO CONTEXTO ===\n\nUse as informações do contexto acima para responder à pergunta do usuário de forma precisa e detalhada.` 
      : ''
    )

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5176',
        'X-Title': 'AI Chat System'
      }
    })

    const reply = response.data.choices[0].message.content
    console.log('[CHAT] Resposta gerada com sucesso')
    console.log('[RAG] Contexto usado:', relevantDocs.length > 0 ? 'SIM' : 'NÃO')

    res.json({ 
      reply,
      context: relevantDocs.length > 0 ? relevantDocs : null
    })

  } catch (error) {
    console.error('[CHAT] Erro:', error.response?.data || error.message)
    res.json({ 
      reply: `Erro ao processar mensagem: ${error.response?.data?.error?.message || error.message}. Verifique sua API Key do Open Router.`,
      context: null
    })
  }
})

// Config endpoint
app.post('/api/config', (req, res) => {
  try {
    const { openRouterKey, model, systemPrompt } = req.body
    configs = { openRouterKey, model, systemPrompt }
    console.log('[CONFIG] Configurações salvas:', { model, hasKey: !!openRouterKey })
    res.json({ success: true, message: 'Configurações salvas com sucesso!' })
  } catch (error) {
    console.error('[CONFIG] Erro:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/config', (req, res) => {
  res.json(configs)
})

// Documents endpoints
app.get('/api/documents', (req, res) => {
  console.log('[DOCS] Listando', documents.length, 'documentos')
  res.json(documents)
})

app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    }

    console.log('[UPLOAD] Arquivo recebido:', req.file.originalname)

    // Simular processamento e extração de texto
    let extractedContent = `Conteúdo extraído de ${req.file.originalname}. `
    
    if (req.file.originalname.toLowerCase().includes('ia') || req.file.originalname.toLowerCase().includes('ai')) {
      extractedContent += 'Este documento contém informações sobre Inteligência Artificial, machine learning e tecnologias modernas.'
    } else if (req.file.originalname.toLowerCase().includes('rag')) {
      extractedContent += 'Este documento explica o funcionamento de sistemas RAG (Retrieval Augmented Generation) e como eles melhoram respostas de IA.'
    } else {
      extractedContent += 'Este documento foi processado pelo sistema RAG e está disponível para busca contextual.'
    }

    const newDoc = {
      id: Date.now().toString(),
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      content: extractedContent
    }

    documents.push(newDoc)
    console.log('[UPLOAD] Total de documentos:', documents.length)

    res.json({ 
      success: true, 
      document: newDoc,
      message: `Arquivo ${req.file.originalname} processado com sucesso!`
    })

  } catch (error) {
    console.error('[UPLOAD] Erro:', error)
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params
  const index = documents.findIndex(doc => doc.id === id)
  
  if (index === -1) {
    return res.status(404).json({ error: 'Documento não encontrado' })
  }

  const deletedDoc = documents.splice(index, 1)[0]
  console.log('[DELETE] Documento removido:', deletedDoc.name)
  
  res.json({ success: true, message: 'Documento removido com sucesso!' })
})

// WhatsApp Webhook - Evolution API
app.post('/api/webhook', async (req, res) => {
  try {
    console.log('[WEBHOOK] Dados recebidos:', JSON.stringify(req.body, null, 2))

    // Evolution API envia dados em formatos diferentes, vamos tratar todos
    let message = null
    let from = null
    let instance = null

    // Formato 1: Mensagem direta
    if (req.body.message) {
      message = req.body.message
      from = req.body.from || req.body.remoteJid
    }

    // Formato 2: Estrutura Evolution API
    if (req.body.data) {
      const data = req.body.data
      if (data.message && data.message.conversation) {
        message = data.message.conversation
        from = data.key.remoteJid
        instance = req.body.instance
      }
      if (data.message && data.message.extendedTextMessage) {
        message = data.message.extendedTextMessage.text
        from = data.key.remoteJid
        instance = req.body.instance
      }
    }

    // Formato 3: Event structure
    if (req.body.event === 'messages.upsert' && req.body.data?.messages) {
      const msgData = req.body.data.messages[0]
      if (msgData.message) {
        message = msgData.message.conversation || msgData.message.extendedTextMessage?.text
        from = msgData.key.remoteJid
        instance = req.body.instance
      }
    }

    console.log('[WEBHOOK] Extraído - Mensagem:', message, 'De:', from, 'Instance:', instance)

    if (!message || !from) {
      console.log('[WEBHOOK] Mensagem ou remetente não encontrado')
      return res.json({ success: true, message: 'Webhook recebido, mas dados incompletos' })
    }

    // Filtrar mensagens de grupos (opcional)
    if (from.includes('@g.us')) {
      console.log('[WEBHOOK] Mensagem de grupo ignorada')
      return res.json({ success: true, message: 'Mensagem de grupo ignorada' })
    }

    console.log('[WEBHOOK] Processando mensagem:', message)

    // Processar com IA + RAG diretamente (sem HTTP request)
    let reply = null
    let contextDocs = null
    
    try {
      // Usar API Key do .env ou da configuração
      const apiKey = process.env.OPENROUTER_API_KEY || configs.openRouterKey
      const model = configs.model || 'openai/gpt-3.5-turbo'
      const systemPrompt = configs.systemPrompt || 'Você é um assistente útil e especializado.'

      // BUSCA RAG - buscar por palavras-chave
      const searchTerms = message.toLowerCase()
      const keywords = ['rag', 'retrieval', 'augmented', 'generation', 'ia', 'inteligencia', 'artificial', 'machine', 'learning', 'tecnologia', 'moderno', 'cloud', 'computing', 'iot']
      
      const relevantDocs = documents.filter(doc => {
        const docContent = doc.content.toLowerCase()
        const docName = doc.name.toLowerCase()
        
        // Busca por termos específicos na mensagem
        return keywords.some(keyword => 
          (searchTerms.includes(keyword) && (docContent.includes(keyword) || docName.includes(keyword))) ||
          searchTerms.split(' ').some(term => term.length > 3 && (docContent.includes(term) || docName.includes(term)))
        )
      })

      console.log('[WEBHOOK-RAG] Busca por:', searchTerms)
      console.log('[WEBHOOK-RAG] Documentos encontrados:', relevantDocs.length)
      
      let context = ''
      if (relevantDocs.length > 0) {
        context = relevantDocs.map((doc, idx) => 
          `=== DOCUMENTO ${idx + 1}: ${doc.name} ===\n${doc.content}\n`
        ).join('\n')
        console.log('[WEBHOOK-RAG] Contexto gerado com', context.length, 'caracteres')
        contextDocs = relevantDocs
      }

      if (!apiKey || !apiKey.startsWith('sk-or-')) {
        console.log('[WEBHOOK] Sem API Key válida - usando resposta básica')
        reply = `Olá! Recebi sua mensagem: "${message}". ${relevantDocs.length > 0 ? 
          `Encontrei ${relevantDocs.length} documento(s) relevante(s) mas preciso de uma API Key válida do Open Router para gerar respostas inteligentes.` : 
          'Configure uma API Key do Open Router para respostas mais inteligentes.'}`
      } else {
        console.log('[WEBHOOK] Usando Open Router com modelo:', model)

        // Chamada para Open Router
        const axios = require('axios')
        const systemMessage = systemPrompt + (context ? 
          `\n\n=== CONTEXTO DOS DOCUMENTOS ===\n${context}\n=== FIM DO CONTEXTO ===\n\nUse as informações do contexto acima para responder à pergunta do usuário de forma precisa e detalhada.` 
          : ''
        )

        const openRouterResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: message }
          ],
          max_tokens: 1000,
          temperature: 0.7
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'AI WhatsApp Bot'
          },
          timeout: 30000
        })

        reply = openRouterResponse.data.choices[0].message.content
        console.log('[WEBHOOK] Resposta da IA gerada com', reply.length, 'caracteres')
        console.log('[WEBHOOK-RAG] Contexto usado:', relevantDocs.length > 0 ? 'SIM' : 'NÃO')
      }
      
      console.log('[WEBHOOK] Resposta:', reply.substring(0, 100) + '...')

      // Enviar resposta via Evolution API
      if (process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY) {
        try {
          const axios = require('axios')
          const sendUrl = `${process.env.EVOLUTION_API_URL}/message/sendText/${instance || 'default'}`
          
          const evolutionResponse = await axios.post(sendUrl, {
            number: from.replace('@s.whatsapp.net', ''),
            text: reply
          }, {
            headers: {
              'Authorization': `Bearer ${process.env.EVOLUTION_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          })

          console.log('[WEBHOOK] Resposta enviada via WhatsApp - Status:', evolutionResponse.status)
        } catch (evolutionError) {
          console.error('[WEBHOOK] Erro ao enviar via Evolution API:', evolutionError.message)
        }
      } else {
        console.log('[WEBHOOK] Evolution API não configurada - resposta não enviada')
      }

      res.json({ 
        success: true, 
        reply: reply,
        processed: true,
        from: from,
        instance: instance,
        context: contextDocs
      })

    } catch (chatError) {
      console.error('[WEBHOOK] Erro ao processar chat:', chatError.message)
      
      // Resposta de fallback
      const fallbackReply = 'Desculpe, estou com problemas técnicos no momento. Tente novamente em alguns minutos.'
      
      if (process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY) {
        try {
          const axios = require('axios')
          const sendUrl = `${process.env.EVOLUTION_API_URL}/message/sendText/${instance || 'default'}`
          await axios.post(sendUrl, {
            number: from.replace('@s.whatsapp.net', ''),
            text: fallbackReply
          }, {
            headers: {
              'Authorization': `Bearer ${process.env.EVOLUTION_API_KEY}`,
              'Content-Type': 'application/json'
            }
          })
        } catch (err) {
          console.error('[WEBHOOK] Erro ao enviar mensagem de fallback:', err.message)
        }
      }

      res.json({ success: true, error: chatError.message, fallback: true, reply: fallbackReply })
    }

  } catch (error) {
    console.error('[WEBHOOK] Erro geral:', error.message)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 API Server rodando em http://localhost:${PORT}`)
  console.log('📚 Documentos disponíveis para RAG:')
  documents.forEach((doc, idx) => {
    console.log(`  ${idx + 1}. ${doc.name} (${doc.content.substring(0, 80)}...)`)
  })
  console.log('')
  console.log('📍 Endpoints disponíveis:')
  console.log('  GET  /api/health')
  console.log('  POST /api/config')
  console.log('  POST /api/chat')
  console.log('  GET  /api/documents')
  console.log('  POST /api/upload')
  console.log('  POST /api/webhook')
  console.log('')
  console.log('🔑 Variáveis de ambiente:')
  console.log(`  Open Router: ${process.env.OPENROUTER_API_KEY ? '✅ Configurado' : '❌ Não configurado'}`)
  console.log(`  Supabase: ${process.env.SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado'}`)
  console.log(`  Evolution API: ${process.env.EVOLUTION_API_URL ? '✅ Configurado' : '❌ Não configurado'}`)
})