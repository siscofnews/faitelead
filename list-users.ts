
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';

try { dotenv.config(); } catch (e) {}

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
  console.log('Tentando listar perfis (tabela public.profiles)...');
  
  // Tentar listar profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(50);

  if (error) {
    console.error('❌ Erro ao listar profiles:', error.message);
    console.log('Provavelmente RLS está ativado e bloqueando acesso anônimo.');
  } else {
    console.log(`✅ Encontrados ${profiles?.length || 0} perfis:`);
    profiles?.forEach(p => console.log(` - ${p.nome || p.full_name} (${p.email || 'Email não disponível na tabela profiles'}) - Role: ${p.role}`));
  }
}

listUsers();
