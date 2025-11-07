const axios = require('axios');

async function testWebhook() {
  try {
    console.log('🧪 Testando webhook do WhatsApp...');
    
    // Teste 1: Formato simples
    console.log('\n1. Testando formato simples:');
    const response1 = await axios.post('http://localhost:3001/api/webhook', {
      message: 'O que é RAG?',
      from: '5511999999999@s.whatsapp.net'
    });
    console.log('✅ Resposta:', response1.data);
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Teste 2: Formato Evolution API
    console.log('\n2. Testando formato Evolution API:');
    const response2 = await axios.post('http://localhost:3001/api/webhook', {
      event: 'messages.upsert',
      instance: 'default',
      data: {
        messages: [{
          key: {
            remoteJid: '5511999999999@s.whatsapp.net'
          },
          message: {
            conversation: 'Me explique sobre inteligência artificial'
          }
        }]
      }
    });
    console.log('✅ Resposta:', response2.data);
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Teste 3: Pergunta sobre tecnologias
    console.log('\n3. Testando RAG com tecnologias modernas:');
    const response3 = await axios.post('http://localhost:3001/api/webhook', {
      message: 'Me fale sobre machine learning e cloud computing',
      from: '5511888888888@s.whatsapp.net'
    });
    console.log('✅ Resposta:', response3.data);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Executar teste
testWebhook();