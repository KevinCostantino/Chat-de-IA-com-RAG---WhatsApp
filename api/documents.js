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
  console.log('Supabase não configurado')
}

async function handler(req, res) {
  try {
    // Se Supabase não estiver configurado, usar dados mock
    if (!supabase) {
      const mockDocuments = [
        {
          id: '1',
          name: 'documento-exemplo.pdf',
          size: 245760,
          type: 'application/pdf',
          content: 'Este é um documento de exemplo que foi carregado no sistema. Ele contém informações importantes sobre o funcionamento do RAG.',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'manual-usuario.txt',
          size: 51200,
          type: 'text/plain',
          content: 'Manual do usuário contendo instruções detalhadas sobre como utilizar o sistema de chat com IA e integração WhatsApp.',
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]

      if (req.method === 'GET') {
        return res.status(200).json({ documents: mockDocuments })
      }

      if (req.method === 'DELETE') {
        return res.status(200).json({ 
          success: true, 
          message: 'Documento deletado com sucesso (modo demo)' 
        })
      }

      return res.status(405).json({ error: 'Method not allowed' })
    }

    if (req.method === 'GET') {
      // Listar documentos
      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar documentos:', error)
        return res.status(500).json({ error: 'Erro ao buscar documentos' })
      }

      return res.status(200).json({ documents })
    }

    if (req.method === 'DELETE') {
      // Deletar documento específico
      const documentId = req.query.id || req.body.id

      if (!documentId) {
        return res.status(400).json({ error: 'ID do documento é obrigatório' })
      }

      // Deletar chunks relacionados primeiro (cascade deve fazer isso automaticamente)
      const { error: chunksError } = await supabase
        .from('chunks')
        .delete()
        .eq('document_id', documentId)

      if (chunksError) {
        console.error('Erro ao deletar chunks:', chunksError)
      }

      // Deletar documento
      const { error: docError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (docError) {
        console.error('Erro ao deletar documento:', docError)
        return res.status(500).json({ error: 'Erro ao deletar documento' })
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Documento deletado com sucesso' 
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Erro no endpoint /api/documents:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor: ' + error.message 
    })
  }
}

// Exportação compatível
module.exports = handler
module.exports.default = handler