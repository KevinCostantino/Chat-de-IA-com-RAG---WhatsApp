-- SQL para configurar o banco Supabase
-- Execute este script no SQL Editor do seu projeto Supabase

-- Habilitar extensão para vetores (se disponível)
create extension if not exists vector;

-- Tabela de documentos
create table documents (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  content text not null,
  file_type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de chunks para RAG
create table chunks (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references documents(id) on delete cascade,
  content text not null,
  embedding vector(1536), -- para OpenAI embeddings (opcional)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de conversas
create table conversations (
  id uuid default gen_random_uuid() primary key,
  user_id text,
  message text not null,
  response text not null,
  context_used text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices para melhor performance
create index idx_documents_created_at on documents(created_at desc);
create index idx_chunks_document_id on chunks(document_id);
create index idx_conversations_created_at on conversations(created_at desc);

-- Índice de texto para busca (PostgreSQL Full Text Search)
create index idx_documents_content_fts on documents using gin(to_tsvector('portuguese', content));
create index idx_chunks_content_fts on chunks using gin(to_tsvector('portuguese', content));

-- RLS (Row Level Security) policies - opcional, para segurança
alter table documents enable row level security;
alter table chunks enable row level security;
alter table conversations enable row level security;

-- Política para permitir todas as operações (desenvolvimento)
-- Em produção, adicione políticas mais restritivas baseadas em autenticação
create policy "Allow all operations on documents" on documents for all using (true);
create policy "Allow all operations on chunks" on chunks for all using (true);
create policy "Allow all operations on conversations" on conversations for all using (true);

-- Comentários
comment on table documents is 'Armazena documentos enviados pelo usuário';
comment on table chunks is 'Armazena chunks de texto dos documentos para RAG';
comment on table conversations is 'Armazena histórico de conversas';

-- Views úteis (opcional)
create view document_stats as
select 
  d.id,
  d.name,
  d.file_type,
  d.created_at,
  length(d.content) as content_length,
  count(c.id) as chunks_count
from documents d
left join chunks c on d.id = c.document_id
group by d.id, d.name, d.file_type, d.created_at, d.content;

comment on view document_stats is 'Estatísticas dos documentos e seus chunks';