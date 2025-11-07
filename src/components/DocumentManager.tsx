import React, { useEffect, useState } from 'react'
import axios from 'axios'
import type { Document } from '../lib/supabase'

type UploadHistory = {
  id: string
  fileName: string
  timestamp: string
  status: 'success' | 'error'
  message?: string
}

export default function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([])
  const [showHistory, setShowHistory] = useState(true)

  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments() {
    try {
      setLoading(true)
      const response = await axios.get('/api/documents')
      setDocuments(response.data.documents || [])
    } catch (error) {
      console.error('Erro ao carregar documentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      console.log('Iniciando upload do arquivo:', file.name, 'Tamanho:', file.size)
      
      const formData = new FormData()
      formData.append('file', file)

      // Usar endpoint relativo (será redirecionado pelo proxy)
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      console.log('Upload realizado com sucesso:', response.data)
      
      // Adicionar ao histórico de uploads
      const now = new Date()
      const timestamp = now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      
      const newHistoryItem: UploadHistory = {
        id: Date.now().toString(),
        fileName: file.name,
        timestamp: timestamp,
        status: 'success',
        message: `Arquivo ${file.name} enviado com sucesso!`
      }
      
      setUploadHistory(prev => [newHistoryItem, ...prev])
      
      // Recarregar documentos
      await loadDocuments()
    } catch (error: any) {
      console.error('Erro no upload:', error)
      console.error('Resposta do servidor:', error.response?.data)
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Erro desconhecido'
      
      // Adicionar erro ao histórico
      const now = new Date()
      const timestamp = now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      
      const errorHistoryItem: UploadHistory = {
        id: Date.now().toString(),
        fileName: file.name,
        timestamp: timestamp,
        status: 'error',
        message: errorMessage
      }
      
      setUploadHistory(prev => [errorHistoryItem, ...prev])
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteDocument(id: string) {
    if (!confirm('Tem certeza que deseja deletar este documento?')) return

    try {
      await axios.delete(`/api/documents/${id}`)
      await loadDocuments()
      alert('Documento deletado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao deletar documento:', error)
      alert('Erro ao deletar documento: ' + (error.response?.data?.error || error.message))
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    
    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`Arquivo ${file.name} é muito grande (máx 10MB)`)
        return
      }
      
      const allowedTypes = ['.pdf', '.txt', '.md']
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      
      if (!allowedTypes.includes(fileExtension)) {
        alert(`Tipo de arquivo não suportado: ${file.name}. Use PDF, TXT ou MD.`)
        return
      }
      
      handleFileUpload(file)
    })
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
  }

  return (
    <div>
      <h2>📄 Gerenciamento de Documentos</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Faça upload de documentos (PDF, TXT, MD) para usar como contexto no RAG.
      </p>

      {/* Upload Area */}
      <div
        className={`upload-area ${dragOver ? 'dragover' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,.txt,.md"
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
        
        {uploading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <div className="loading" />
            <span>📤 Enviando documentos...</span>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              <strong>Clique ou arraste arquivos aqui</strong>
            </p>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Suporte para PDF, TXT e MD (múltiplos arquivos)
            </p>
          </div>
        )}
      </div>

      {/* Upload History */}
      {uploadHistory.length > 0 && (
        <div style={{ margin: '1rem 0' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>
              📋 Histórico de Uploads ({uploadHistory.length})
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  color: 'var(--text)',
                  padding: '0.25rem 0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                {showHistory ? '🔽 Ocultar' : '▶️ Mostrar'}
              </button>
              <button
                onClick={() => setUploadHistory([])}
                style={{
                  background: 'var(--error)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                🗑️ Limpar
              </button>
            </div>
          </div>
          
          {showHistory && (
            <div 
              className="upload-history-container"
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--card)'
              }}>
              {uploadHistory.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: item.status === 'success' 
                      ? 'rgba(16, 185, 129, 0.05)' 
                      : 'rgba(239, 68, 68, 0.05)',
                    animation: 'slideIn 0.3s ease-out'
                  }}
                >
                  <div style={{ fontSize: '1.25rem' }}>
                    {item.status === 'success' ? '✅' : '❌'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 'bold',
                      marginBottom: '0.25rem',
                      color: item.status === 'success' ? 'var(--success)' : 'var(--error)'
                    }}>
                      {item.status === 'success' ? 'Upload realizado' : 'Erro no upload'}
                    </div>
                    <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      📄 <strong>{item.fileName}</strong>
                    </div>
                    {item.message && (
                      <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.25rem' }}>
                        {item.message}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      🕒 {item.timestamp}
                    </div>
                  </div>
                  <button
                    onClick={() => setUploadHistory(prev => prev.filter(h => h.id !== item.id))}
                    style={{
                      background: 'rgba(100, 116, 139, 0.1)',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'var(--text-muted)',
                      padding: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Documents List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loading" style={{ margin: '0 auto 1rem' }} />
          <p>Carregando documentos...</p>
        </div>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</div>
          <p>Nenhum documento encontrado.</p>
          <p style={{ fontSize: '0.875rem' }}>Faça upload de alguns documentos para começar!</p>
        </div>
      ) : (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>
            Documentos ({documents.length})
          </h3>
          
          <div className="documents-grid">
            {documents.map((doc) => (
              <div key={doc.id} className="document-card">
                <div className="document-header">
                  <h4 className="document-name">{doc.name}</h4>
                  <span className="document-type">{doc.file_type}</span>
                </div>
                
                <div className="document-preview">
                  {doc.content ? doc.content.substring(0, 200) : 'Conteúdo não disponível'}
                  {doc.content && doc.content.length > 200 && '...'}
                </div>
                
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span>📅</span>
                    <span>
                      {new Date(doc.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🕒</span>
                    <span>
                      {new Date(doc.created_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="document-actions">
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteDocument(doc.id)}
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {documents.length > 0 && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--success)' }}>✅ Sistema RAG Ativo</h4>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Seus documentos estão indexados e serão usados automaticamente como contexto nas conversas do chat.
          </p>
        </div>
      )}
    </div>
  )
}