import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Document = {
  id: string
  name: string
  content: string
  file_type: string
  created_at: string
}

export type Chunk = {
  id: string
  document_id: string
  content: string
  embedding?: number[]
  created_at: string
}

export type Conversation = {
  id: string
  user_id?: string
  message: string
  response: string
  context_used?: string
  created_at: string
}