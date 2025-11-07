const formidable = require('formidable')
const fs = require('fs')
const path = require('path')
const pdfParse = require('pdf-parse')

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

// Desabilitar body parser padrão do Next.js
export const config = {
  api: {
    bodyParser: false
  }
}

// Função para extrair texto de diferentes tipos de arquivo
async function extractText(filePath, fileType) {
  try {
    switch (fileType.toLowerCase()) {
      case 'application/pdf':
      case '.pdf':
        const pdfBuffer = fs.readFileSync(filePath)
        const pdfData = await pdfParse(pdfBuffer)
        return pdfData.text

      case 'text/plain':
      case '.txt':
        return fs.readFileSync(filePath, 'utf-8')

      case 'text/markdown':
      case '.md':
        return fs.readFileSync(filePath, 'utf-8')

      default:
        throw new Error(`Tipo de arquivo não suportado: ${fileType}`)
    }
  } catch (error) {
    console.error('Erro ao extrair texto:', error)
    throw error
  }
}

// Função para dividir texto em chunks
function createChunks(text, chunkSize = 1000, overlap = 100) {
  const chunks = []
  const words = text.split(' ')
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    if (chunk.trim().length > 0) {
      chunks.push(chunk.trim())
    }
  }
  
  return chunks
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verificar se Supabase está configurado
    if (!supabase) {
      return res.status(500).json({ 
        error: 'Supabase não configurado. Configure as variáveis SUPABASE_URL e SUPABASE_SERVICE_KEY.' 
      })
    }

    const form = formidable({
      maxFiles: 10,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true
    })

    const [fields, files] = await form.parse(req)
    
    if (!files.files) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    }

    const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files]
    const results = []

    for (const file of uploadedFiles) {
      try {
        // Extrair texto do arquivo
        const text = await extractText(file.filepath, file.mimetype || path.extname(file.originalFilename))
        
        if (!text || text.trim().length === 0) {
          results.push({
            filename: file.originalFilename,
            success: false,
            error: 'Não foi possível extrair texto do arquivo'
          })
          continue
        }

        // Salvar documento no Supabase
        const { data: document, error: docError } = await supabase
          .from('documents')
          .insert({
            name: file.originalFilename,
            content: text,
            file_type: file.mimetype || path.extname(file.originalFilename)
          })
          .select()
          .single()

        if (docError) {
          console.error('Erro ao salvar documento:', docError)
          results.push({
            filename: file.originalFilename,
            success: false,
            error: 'Erro ao salvar no banco de dados'
          })
          continue
        }

        // Criar chunks do texto
        const chunks = createChunks(text, 1000, 100)
        const chunkInserts = chunks.map(chunk => ({
          document_id: document.id,
          content: chunk
        }))

        // Salvar chunks no Supabase
        const { error: chunksError } = await supabase
          .from('chunks')
          .insert(chunkInserts)

        if (chunksError) {
          console.error('Erro ao salvar chunks:', chunksError)
          // Não falha completamente, apenas não terá chunks otimizados
        }

        results.push({
          filename: file.originalFilename,
          success: true,
          documentId: document.id,
          textLength: text.length,
          chunksCount: chunks.length
        })

      } catch (error) {
        console.error(`Erro ao processar arquivo ${file.originalFilename}:`, error)
        results.push({
          filename: file.originalFilename,
          success: false,
          error: error.message
        })
      } finally {
        // Limpar arquivo temporário
        try {
          fs.unlinkSync(file.filepath)
        } catch (error) {
          console.error('Erro ao limpar arquivo temporário:', error)
        }
      }
    }

    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length

    return res.status(200).json({
      success: true,
      message: `Upload concluído: ${successCount} sucesso(s), ${errorCount} erro(s)`,
      results
    })

  } catch (error) {
    console.error('Erro no endpoint /api/upload:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor: ' + error.message 
    })
  }
}

// Exportação compatível
module.exports = handler
module.exports.default = handler