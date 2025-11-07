import React, { useState } from 'react'
import ConfigPanel from './components/ConfigPanel'
import Chat from './components/Chat'
import DocumentManager from './components/DocumentManager'

type Tab = 'config' | 'chat' | 'documents'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('config')

  return (
    <div className="app">
      <div className="header">
        <h1>AI Chat + RAG + WhatsApp</h1>
        <p>Sistema completo com IA, RAG e integração Evolution API</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          ⚙️ Configurações
        </button>
        <button 
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          📄 Documentos
        </button>
        <button 
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat de Teste
        </button>
      </div>

      <div className="panel">
        {activeTab === 'config' && <ConfigPanel />}
        {activeTab === 'documents' && <DocumentManager />}
        {activeTab === 'chat' && <Chat />}
      </div>
    </div>
  )
}