// Endpoint de configuração - salva/recupera configurações do usuário
// Em produção, persistir no Supabase com autenticação

let configStore = {
  openRouterKey: '',
  model: 'openai/gpt-4',
  systemPrompt: 'Você é um assistente útil que responde perguntas usando o contexto de documentos fornecidos quando disponível.'
}

async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { openRouterKey, model, systemPrompt } = req.body

      // Atualizar configurações
      configStore = {
        openRouterKey: openRouterKey || configStore.openRouterKey,
        model: model || configStore.model,
        systemPrompt: systemPrompt || configStore.systemPrompt
      }

      return res.status(200).json({ 
        success: true,
        message: 'Configurações salvas com sucesso' 
      })
    }

    if (req.method === 'GET') {
      // Retornar configurações (sem expor a API key completa)
      return res.status(200).json({
        config: {
          ...configStore,
          openRouterKey: configStore.openRouterKey ? '***' + configStore.openRouterKey.slice(-4) : ''
        }
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Erro no endpoint /api/config:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// Exportação compatível com Vercel e Node.js
module.exports = handler
module.exports.default = handler