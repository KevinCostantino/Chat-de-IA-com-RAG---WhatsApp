const axios = require('axios')

// Webhook para receber mensagens do WhatsApp via Evolution API
// Este endpoint deve ser configurado no painel da Evolution API

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const payload = req.body
    console.log('Webhook WhatsApp recebido:', JSON.stringify(payload, null, 2))

    // Extrair dados da mensagem (adapte conforme format da Evolution API)
    const messageData = extractMessageData(payload)

    if (!messageData.text || !messageData.from) {
      console.log('Mensagem ignorada - sem texto ou remetente')
      return res.status(200).json({ status: 'ignored' })
    }

    // Processar mensagem através do sistema de chat
    let chatResponse
    try {
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:5173'

      chatResponse = await axios.post(`${baseUrl}/api/chat`, {
        message: messageData.text,
        config: {
          systemPrompt: process.env.WHATSAPP_SYSTEM_PROMPT || 
            'Você é um assistente útil do WhatsApp. Responda de forma concisa e amigável.'
        }
      })
    } catch (error) {
      console.error('Erro ao processar mensagem:', error)
      chatResponse = {
        data: {
          reply: 'Desculpe, estou com problemas técnicos no momento. Tente novamente mais tarde.'
        }
      }
    }

    const reply = chatResponse.data.reply

    // Enviar resposta via Evolution API
    await sendWhatsAppMessage(messageData.from, reply)

    return res.status(200).json({ 
      status: 'processed',
      from: messageData.from,
      message: messageData.text,
      reply: reply
    })

  } catch (error) {
    console.error('Erro no webhook:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
}

// Função para extrair dados da mensagem do payload da Evolution API
function extractMessageData(payload) {
  // Adapte esta função conforme a estrutura real da Evolution API
  // Consulte: doc.evolution-api.com
  
  // Exemplo de estruturas possíveis:
  if (payload.data && payload.data.message) {
    return {
      text: payload.data.message.text || payload.data.message.body,
      from: payload.data.key.remoteJid || payload.data.key.participant,
      messageId: payload.data.key.id,
      instance: payload.instance
    }
  }

  if (payload.message) {
    return {
      text: payload.message.text || payload.message.body,
      from: payload.from || payload.sender,
      messageId: payload.messageId || payload.id,
      instance: payload.instance
    }
  }

  // Fallback - estrutura genérica
  return {
    text: payload.text || payload.body || payload.message,
    from: payload.from || payload.sender || payload.remoteJid,
    messageId: payload.messageId || payload.id,
    instance: payload.instance
  }
}

// Função para enviar mensagem via Evolution API
async function sendWhatsAppMessage(to, text) {
  try {
    const evolutionUrl = process.env.EVOLUTION_API_URL || 'https://evodevs.cordex.ai'
    const evolutionKey = process.env.EVOLUTION_API_KEY

    if (!evolutionKey) {
      throw new Error('EVOLUTION_API_KEY não configurada')
    }

    // Adapte o endpoint e payload conforme a documentação da Evolution API
    // Consulte: doc.evolution-api.com
    
    const response = await axios.post(
      `${evolutionUrl}/message/sendText`,
      {
        number: to,
        text: text
      },
      {
        headers: {
          'Authorization': `Bearer ${evolutionKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('Mensagem enviada com sucesso:', response.data)
    return response.data

  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error.response?.data || error.message)
    throw error
  }
}

// Exportação compatível
module.exports = handler
module.exports.default = handler