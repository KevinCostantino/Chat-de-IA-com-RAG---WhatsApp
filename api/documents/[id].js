import { createClient } from '@supabase/supabase-js'

// Cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

// Deletar documento por ID
export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'ID do documento é obrigatório' })
  }

  if (req.method === 'DELETE') {
    try {
      // Verificar se Supabase está configurado
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
        return res.status(500).json({ 
          error: 'Supabase não configurado' 
        })
      }

      // Deletar chunks relacionados primeiro
      const { error: chunksError } = await supabase
        .from('chunks')
        .delete()
        .eq('document_id', id)

      if (chunksError) {
        console.error('Erro ao deletar chunks:', chunksError)
      }

      // Deletar documento
      const { error: docError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

      if (docError) {
        console.error('Erro ao deletar documento:', docError)
        return res.status(500).json({ error: 'Erro ao deletar documento' })
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Documento deletado com sucesso' 
      })

    } catch (error) {
      console.error('Erro ao deletar documento:', error)
      return res.status(500).json({ 
        error: 'Erro interno do servidor: ' + error.message 
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}