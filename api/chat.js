const axios = require('axios')

// Cliente Supabase (opcional)
let supabase = null
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    const { createClient } = require('@supabase/supabase-js')
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )
  }
} catch (error) {
  console.log('Supabase não configurado - funcionalidade RAG limitada')
}

// Função para buscar contexto relevante nos documentos (RAG)
async function findRelevantContext(query, limit = 3) {
  try {
    if (!supabase) {
      console.log('Supabase não configurado, pulando busca RAG')
      return null
    }

    // 1. Buscar por chunks que contenham palavras-chave da query
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 3)
    
    let { data: chunks, error } = await supabase
      .from('chunks')
      .select(`
        id,
        content,
        documents (
          id,
          name,
          file_type
        )
      `)
      .textSearch('content', keywords.join(' | '))
      .limit(limit)

    if (error) {
      console.error('Erro ao buscar chunks:', error)
      return null
    }

    if (!chunks || chunks.length === 0) {
      // Fallback: buscar documentos diretamente
      let { data: docs } = await supabase
        .from('documents')
        .select('id, name, content, file_type')
        .textSearch('content', keywords.join(' | '))
        .limit(2)

      if (docs && docs.length > 0) {
        // Usar os primeiros 1000 caracteres de cada documento
        chunks = docs.map(doc => ({
          content: doc.content.substring(0, 1000),
          documents: { name: doc.name, file_type: doc.file_type }
        }))
      }
    }

    if (!chunks || chunks.length === 0) {
      return null
    }

    // Montar contexto
    const context = chunks
      .map(chunk => `[${chunk.documents?.name || 'Documento'}]: ${chunk.content}`)
      .join('\n\n---\n\n')

    return context

  } catch (error) {
    console.error('Erro na busca RAG:', error)
    return null
  }
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, config, includeHistory, history } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' })
    }

    // Configurações (do frontend ou variáveis de ambiente)
    const openRouterKey = config?.openRouterKey || process.env.OPENROUTER_API_KEY
    const model = config?.model || 'openai/gpt-4'
    const systemPrompt = config?.systemPrompt || 'Você é um assistente útil.'

    // Buscar contexto relevante nos documentos (RAG)
    const context = await findRelevantContext(message)

    // Montar prompt final
    let finalSystemPrompt = systemPrompt
    if (context) {
      finalSystemPrompt += `\n\nCONTEXTO DOS DOCUMENTOS:\n${context}\n\nUse este contexto para responder à pergunta quando relevante.`
    }

    // Montar mensagens para a API
    const messages = [
      { role: 'system', content: finalSystemPrompt }
    ]

    // Incluir histórico se solicitado
    if (includeHistory && history && Array.isArray(history)) {
      const recentHistory = history.slice(-5) // Últimas 5 mensagens
      recentHistory.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ 
            role: msg.role, 
            content: msg.content || msg.text 
          })
        }
      })
    }

    // Adicionar mensagem atual
    messages.push({ role: 'user', content: message })

    // Chamar Open Router API se disponível
    if (openRouterKey) {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model,
            messages,
            temperature: 0.7,
            max_tokens: 1000
          },
          {
            headers: {
              'Authorization': `Bearer ${openRouterKey}`,
              'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:5173',
              'X-Title': 'AI Chat RAG WhatsApp'
            }
          }
        )

        const reply = response.data?.choices?.[0]?.message?.content || 
                     'Desculpe, não consegui gerar uma resposta.'

        // Salvar conversação no banco (opcional)
        if (supabase) {
          try {
            await supabase
              .from('conversations')
              .insert({
                message,
                response: reply,
                context_used: context
              })
          } catch (error) {
            console.error('Erro ao salvar conversação:', error)
          }
        }

        return res.status(200).json({ 
          reply,
          context_used: context ? context.substring(0, 300) + '...' : null
        })

      } catch (error) {
        console.error('Erro na Open Router API:', error.response?.data || error.message)
        
        // Fallback para resposta simples
        const fallbackReply = context 
          ? `Com base nos documentos disponíveis, posso ver informações relacionadas à sua pergunta: "${message}". ${context.substring(0, 500)}...`
          : `Recebi sua mensagem: "${message}". Para uma resposta mais precisa, configure uma API Key válida do Open Router.`

        return res.status(200).json({ 
          reply: fallbackReply,
          context_used: context ? context.substring(0, 300) + '...' : null
        })
      }
    }

    // Sem API Key - resposta de exemplo com contexto se disponível
    const exampleReply = context 
      ? `Encontrei informações relacionadas nos documentos: ${context.substring(0, 400)}...`
      : `Recebi sua mensagem: "${message}". Configure uma API Key do Open Router para respostas da IA.`

    return res.status(200).json({ 
      reply: exampleReply,
      context_used: context ? context.substring(0, 300) + '...' : null
    })

  } catch (error) {
    console.error('Erro no endpoint /api/chat:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      reply: 'Desculpe, ocorreu um erro ao processar sua mensagem.'
    })
  }
}

// Exportação compatível
module.exports = handler
module.exports.default = handler