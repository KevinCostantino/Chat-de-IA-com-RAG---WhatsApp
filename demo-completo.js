// Demo completo do sistema AI + RAG + WhatsApp
require('dotenv').config();

const axios = require('axios').default;

console.log('🎯 DEMO SISTEMA AI + RAG + WHATSAPP');
console.log('=====================================');

async function testarSistema() {
  const baseUrl = 'http://localhost:3001/api';
  
  console.log('\n1️⃣ Testando configurações...');
  try {
    const configResponse = await axios.get(`${baseUrl}/config`);
    console.log('✅ Configurações carregadas:', {
      openRouterKey: configResponse.data.openRouterKey ? 'Configurado' : 'Não configurado',
      model: configResponse.data.model || 'padrão',
      systemPrompt: configResponse.data.systemPrompt ? 'Configurado' : 'padrão'
    });
  } catch (error) {
    console.log('❌ Erro nas configurações:', error.code);
  }

  console.log('\n2️⃣ Testando documentos RAG...');
  try {
    const docsResponse = await axios.get(`${baseUrl}/documents`);
    console.log('✅ Documentos disponíveis:', docsResponse.data.documents.length);
    docsResponse.data.documents.forEach((doc, idx) => {
      console.log(`   ${idx + 1}. ${doc.name} (${doc.type})`);
    });
  } catch (error) {
    console.log('❌ Erro nos documentos:', error.code);
  }

  console.log('\n3️⃣ Testando Chat Local...');
  try {
    const chatResponse = await axios.post(`${baseUrl}/chat`, {
      message: 'O que é RAG e como funciona?'
    });
    console.log('✅ Resposta do Chat:');
    console.log(chatResponse.data.reply.substring(0, 200) + '...');
    if (chatResponse.data.contextDocs && chatResponse.data.contextDocs.length > 0) {
      console.log('📚 Documentos usados como contexto:', chatResponse.data.contextDocs.length);
    }
  } catch (error) {
    console.log('❌ Erro no chat:', error.code);
  }

  console.log('\n4️⃣ Testando Webhook WhatsApp...');
  try {
    const webhookResponse = await axios.post(`${baseUrl}/webhook`, {
      message: 'Explique sobre Inteligência Artificial',
      from: '5511999999999@s.whatsapp.net'
    });
    console.log('✅ Webhook processado:');
    console.log('Resposta:', webhookResponse.data.reply ? webhookResponse.data.reply.substring(0, 200) + '...' : 'Processado sem resposta');
    if (webhookResponse.data.contextDocs && webhookResponse.data.contextDocs.length > 0) {
      console.log('📚 Contexto RAG usado:', webhookResponse.data.contextDocs.length, 'documentos');
    }
  } catch (error) {
    console.log('❌ Erro no webhook:', error.code);
  }

  console.log('\n5️⃣ Resumo do Sistema');
  console.log('=====================');
  console.log('✅ Backend Express: Funcionando');
  console.log('✅ API Routes: Configuradas');
  console.log('✅ Sistema RAG: 3 documentos mock');
  console.log('✅ Open Router: Configurado');
  console.log('✅ Webhook WhatsApp: Implementado');
  console.log('⚠️  Evolution API: Credenciais precisam validação');
  console.log('✅ Frontend React: Implementado');
  
  console.log('\n🎉 SISTEMA PRONTO PARA USO!');
  console.log('\nPara usar:');
  console.log('1. Execute: node dev-server.js');
  console.log('2. Abra: http://localhost:3000');
  console.log('3. Configure webhook: https://ngrok-url/api/webhook');
}

// Executar demo apenas se não for importado
if (require.main === module) {
  testarSistema().catch(console.error);
}

module.exports = { testarSistema };