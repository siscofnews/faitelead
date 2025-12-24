import { createClient } from '@supabase/supabase-js'

// USAR SEMPRE AS CREDENCIAIS REAIS
const supabaseUrl = 'https://bpqdwsvrggixgdmboftr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcWR3c3ZyZ2dpeGdkbWJvZnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NDk5NTgsImV4cCI6MjA0OTQyNTk1OH0.z0mYdH5ktBqNPmm_Qh3KQxN0jV-yEQp61ZReGO8gkVs'

console.log('✅ Using REAL Supabase client for auth and data')
console.log('📍 Supabase URL:', supabaseUrl)

// Criar cliente Supabase REAL
const realSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
})

// Exportar cliente COMPLETO
export const supabase = realSupabase
