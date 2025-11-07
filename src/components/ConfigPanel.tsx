import { useEffect, useState } from 'react'
import axios from 'axios'

const MODELS = [
  'openai/gpt-4',
  'openai/gpt-3.5-turbo',
  'anthropic/claude-3-haiku',
  'anthropic/claude-3-sonnet',
  'meta-llama/llama-2-70b-chat',
  'mistralai/mistral-7b-instruct'
]

export default function ConfigPanel() {
  const [openRouterKey, setOpenRouterKey] = useState('')
  const [model, setModel] = useState(MODELS[0])
  const [systemPrompt, setSystemPrompt] = useState('Você é um assistente útil que responde perguntas usando o contexto de documentos fornecidos quando disponível.')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'success' | 'error' | null>(null)

  useEffect(() => {
    // Carregar configurações do localStorage
    const savedKey = localStorage.getItem('cfg_openrouter') || ''
    const savedModel = localStorage.getItem('cfg_model') || MODELS[0]
    const savedPrompt = localStorage.getItem('cfg_prompt') || 'Você é um assistente útil que responde perguntas usando o contexto de documentos fornecidos quando disponível.'
    
    setOpenRouterKey(savedKey)
    setModel(savedModel)
    setSystemPrompt(savedPrompt)
  }, [])

  async function handleSave() {
    setSaving(true)
    setStatus(null)

    try {
      // Salvar no localStorage
      localStorage.setItem('cfg_openrouter', openRouterKey)
      localStorage.setItem('cfg_model', model)
      localStorage.setItem('cfg_prompt', systemPrompt)

      // Salvar no backend
      await axios.post('/api/config', {
        openRouterKey,
        model,
        systemPrompt
      })

      setStatus('success')
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error)
      setStatus('error')
    } finally {
      setSaving(false)
      
      // Limpar status após 3 segundos
      setTimeout(() => setStatus(null), 3000)
    }
  }

  return (
    <div>
      <h2>⚙️ Configurações</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Configure sua API Key do Open Router e personalize o comportamento da IA.
      </p>

      <div className="form-group">
        <label htmlFor="openrouter-key">
          Open Router API Key
        </label>
        <input
          id="openrouter-key"
          type="password"
          value={openRouterKey}
          onChange={(e) => setOpenRouterKey(e.target.value)}
          placeholder="Insira sua API Key do Open Router"
        />
        <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Obtenha sua chave em: <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>openrouter.ai</a>
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="model-select">
          Modelo de IA
        </label>
        <select
          id="model-select"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          {MODELS.map((m) => (
            <option key={m} value={m}>
              {m.replace('/', ' - ').replace('-', ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="system-prompt">
          System Prompt
        </label>
        <textarea
          id="system-prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={4}
          placeholder="Instruções para a IA sobre como se comportar..."
        />
        <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Define como a IA deve se comportar e usar o contexto dos documentos.
        </small>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          className="btn" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <div className="loading" /> : '💾'}
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>

        {status === 'success' && (
          <div className="status-indicator status-success">
            ✅ Configurações salvas com sucesso!
          </div>
        )}

        {status === 'error' && (
          <div className="status-indicator status-error">
            ❌ Erro ao salvar configurações
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent)' }}>ℹ️ Informações da Evolution API</h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <strong>URL:</strong> https://evodevs.cordex.ai<br />
          <strong>Status:</strong> Configurada e pronta para uso<br />
          <strong>Documentação:</strong> <a href="https://doc.evolution-api.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>doc.evolution-api.com</a>
        </p>
      </div>
    </div>
  )
}