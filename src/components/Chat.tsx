import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'

type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  context_used?: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Carregar histórico do sessionStorage
    const savedHistory = sessionStorage.getItem('chat_history')
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory))
      } catch (error) {
        console.error('Erro ao carregar histórico:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Salvar histórico no sessionStorage
    sessionStorage.setItem('chat_history', JSON.stringify(messages))
    
    // Scroll para o final
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || sending) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setSending(true)

    try {
      // Obter configurações
      const config = {
        openRouterKey: localStorage.getItem('cfg_openrouter'),
        model: localStorage.getItem('cfg_model'),
        systemPrompt: localStorage.getItem('cfg_prompt')
      }

      const response = await axios.post('/api/chat', {
        message: input.trim(),
        config,
        includeHistory: true,
        history: messages.slice(-10) // Últimas 10 mensagens para contexto
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.reply || 'Desculpe, não consegui processar sua mensagem.',
        timestamp: new Date().toISOString(),
        context_used: response.data.context_used
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error)
      
      const errorMessage: Message = {
        role: 'system',
        content: `❌ Erro: ${error.response?.data?.error || error.message || 'Erro desconhecido'}`,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setSending(false)
    }
  }

  function clearHistory() {
    if (confirm('Tem certeza que deseja limpar o histórico?')) {
      setMessages([])
      sessionStorage.removeItem('chat_history')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>💬 Chat de Teste</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={clearHistory}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            🗑️ Limpar Histórico
          </button>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Teste o sistema de IA com RAG. As mensagens são processadas com o contexto dos documentos enviados.
      </p>

      {/* Chat Container */}
      <div 
        ref={chatContainerRef}
        className="chat-container"
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💭</div>
            <p>Inicie uma conversa!</p>
            <p style={{ fontSize: '0.875rem' }}>
              Experimente perguntar sobre os documentos que você enviou.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                  {message.role === 'user' ? '👤 Você' : 
                   message.role === 'assistant' ? '🤖 Assistente' : 
                   '⚠️ Sistema'}
                </strong>
                <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                  {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
              </div>

              {message.context_used && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '0.5rem', 
                  background: 'rgba(6, 182, 212, 0.1)', 
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  border: '1px solid rgba(6, 182, 212, 0.2)'
                }}>
                  <strong>📄 Contexto usado:</strong><br />
                  {message.context_used.substring(0, 200)}
                  {message.context_used.length > 200 && '...'}
                </div>
              )}
            </div>
          ))
        )}

        {sending && (
          <div className="message assistant">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="loading" />
              <span>🤖 Assistente está pensando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="message-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem... (Enter para enviar)"
          disabled={sending}
        />
        <button 
          className="btn"
          onClick={sendMessage}
          disabled={!input.trim() || sending}
        >
          {sending ? <div className="loading" /> : '📤'}
          Enviar
        </button>
      </div>

      {/* Info Panel */}
      <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent)' }}>ℹ️ Como funciona</h4>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <li>Suas mensagens são processadas pela IA configurada (Open Router)</li>
          <li>O sistema busca automaticamente contexto relevante nos documentos enviados</li>
          <li>A resposta é gerada usando tanto sua pergunta quanto o contexto dos documentos</li>
          <li>Este chat é apenas para testes - o WhatsApp usa o mesmo sistema</li>
        </ul>
      </div>
    </div>
  )
}