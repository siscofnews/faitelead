
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';

try {
  dotenv.config();
} catch (e) {
}

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://seu-projeto.supabase.co';
const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sua-chave-anon';

console.log('Testando conexão com Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'Não definida');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Teste de conexão mais simples possível: verificar health endpoint (se possível via fetch) ou query básica
    console.log('Tentando conectar...');
    
    // Tentar ler algo que sempre deve funcionar se a chave anon for válida
    const { data, error } = await supabase.from('courses').select('id').limit(1);

    if (error) {
      console.error('❌ Erro ao conectar com Supabase (Tabela courses):', error.message);
      console.error('Detalhes:', error);
      
      // Tentar auth check como fallback
      console.log('Tentando verificar auth...');
      const { error: authError } = await supabase.auth.getSession();
      if (authError) {
          console.error('❌ Erro também no Auth:', authError.message);
      } else {
          console.log('✅ Auth service parece estar respondendo, mas banco de dados falhou. Verifique RLS ou se a tabela existe.');
      }
      return;
    }

    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    console.log(`📊 Query de teste retornou ${data?.length} registros.`);
    
  } catch (err: any) {
    console.error('❌ Exceção inesperada:', err.message || err);
  }
}

testConnection();
