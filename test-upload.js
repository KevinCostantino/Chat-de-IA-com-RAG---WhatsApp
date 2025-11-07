// Teste de upload direto para debug
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do multer
const upload = multer({ dest: 'uploads/' });

// Mock storage
let documents = [
  {
    id: '1', name: 'Guia_IA_Completo.pdf', type: 'application/pdf',
    size: 2048576, uploadedAt: new Date().toISOString(),
    content: 'Inteligência Artificial (IA) é um campo da ciência da computação...'
  },
  {
    id: '2', name: 'Manual_RAG_Sistema.txt', type: 'text/plain',
    size: 1024000, uploadedAt: new Date().toISOString(),
    content: 'RAG (Retrieval Augmented Generation) é uma técnica avançada...'  
  },
  {
    id: '3', name: 'Tecnologias_Modernas.md', type: 'text/markdown',
    size: 1536000, uploadedAt: new Date().toISOString(),
    content: 'As tecnologias modernas estão transformando rapidamente nossa sociedade...'
  }
];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    documents: documents.length,
    port: 3001
  });
});

// Documents
app.get('/api/documents', (req, res) => {
  console.log('[DOCS] Retornando', documents.length, 'documentos');
  res.json({ documents });
});

// Upload endpoint com debug detalhado
app.post('/api/upload', upload.single('file'), (req, res) => {
  console.log('\n=== UPLOAD DEBUG ===');
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);
  
  try {
    if (!req.file) {
      console.log('❌ Nenhum arquivo enviado');
      return res.status(400).json({ 
        error: 'Nenhum arquivo enviado',
        debug: {
          hasFile: !!req.file,
          contentType: req.headers['content-type'],
          body: req.body
        }
      });
    }

    console.log('✅ Arquivo recebido:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      destination: req.file.destination,
      filename: req.file.filename
    });

    // Criar documento
    const newDoc = {
      id: Date.now().toString(),
      name: req.file.originalname,
      file_type: req.file.mimetype,
      size: req.file.size,
      created_at: new Date().toISOString(),
      content: `Conteúdo extraído de ${req.file.originalname}. Este documento foi processado pelo sistema RAG.`
    };

    documents.push(newDoc);
    console.log('✅ Documento adicionado. Total:', documents.length);

    res.json({ 
      success: true, 
      document: newDoc,
      message: `Arquivo ${req.file.originalname} processado com sucesso!`
    });

  } catch (error) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/api/health`);
  console.log(`📄 Docs: http://localhost:${PORT}/api/documents`);
  console.log(`📤 Upload: POST http://localhost:${PORT}/api/upload`);
  console.log('\n✅ Sistema pronto para testes de upload!\n');
});