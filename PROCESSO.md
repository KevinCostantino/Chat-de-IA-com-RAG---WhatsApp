# PROCESSO de desenvolvimento e commits

## Padrão de commits (obrigatório)

- `[AI]` = código gerado por IA
- `[MANUAL]` = ajuste manual
- `[REFACTOR]` = refatoração

## Regras

- **Um commit por prompt**
- Commits `[AI]` devem incluir no message body o prompt enviado para a IA

## Exemplos

```bash
git commit -m "[AI] Add configuration form" -m "Prompt: Create a config form with API key and model selector"
git commit -m "[MANUAL] Fix TypeScript errors"
git commit -m "[AI] Implement document upload" -m "Prompt: Add PDF upload with file validation"
git commit -m "[REFACTOR] Extract RAG logic"
```

## Workflow recomendado

1. Criar branch para feature
2. Desenvolver localmente
3. Testar endpoints
4. Commit com padrão acima (um commit por prompt/alteração)
5. Abrir PR no GitHub público

## Estrutura de commits sugerida

### Fase 1: Setup inicial
- `[AI] Initial project scaffold`
- `[AI] Add frontend components`
- `[AI] Add API routes`

### Fase 2: Database e RAG
- `[AI] Add Supabase configuration`
- `[AI] Implement document upload`
- `[AI] Add RAG functionality`

### Fase 3: WhatsApp Integration
- `[AI] Add webhook endpoint`
- `[AI] Implement Evolution API integration`

### Fase 4: Testing e Deploy
- `[MANUAL] Fix production issues`
- `[AI] Add deployment configuration`