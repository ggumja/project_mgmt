import { createClient } from '@supabase/supabase-js'

// .env 파일에서 환경 변수를 가져옵니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Check your .env file.')
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
)
