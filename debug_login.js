import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Ler .env manualmente para garantir que estamos usando as mesmas credenciais do front
const env = fs.readFileSync('.env', 'utf8');
const getEnv = (key) => {
  const match = env.match(new RegExp(`${key}="(.*?)"`)) || env.match(new RegExp(`${key}=(.*)`));
  return match ? match[1] : null;
};

const url = getEnv('VITE_SUPABASE_URL');
const key = getEnv('VITE_SUPABASE_PUBLISHABLE_KEY');

if (!url || !key) {
  console.error('❌ Erro: VITE_SUPABASE_URL ou KEY não encontrados no arquivo .env');
  process.exit(1);
}

console.log(`📡 Conectando em: ${url}`);
const supabase = createClient(url, key);

async function diagnosticar() {
  console.log('\n1️⃣  Testando LOGIN com pr.vcsantos@gmail.com...');
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'pr.vcsantos@gmail.com',
    password: 'Faitel@2025#Admin',
  });

  if (authError) {
    console.error(`❌ Falha no Login: ${authError.message}`);
    if (authError.message.includes('Email not confirmed')) {
      console.log('   -> CAUSA PROVÁVEL: O email precisa ser confirmado. Verifique a caixa de entrada ou desative "Confirm Email" no painel do Supabase (Authentication -> Providers -> Email).');
    }
    return;
  }

  console.log('✅ Login realizado com sucesso!');
  const userId = authData.user.id;
  console.log(`   ID do Usuário: ${userId}`);

  console.log('\n2️⃣  Verificando Tabela de Perfis (profiles)...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error(`❌ Erro ao buscar profile: ${profileError.message}`);
    console.log('   -> DICA: Pode ser falta de permissão RLS ou a tabela profiles está vazia para este ID.');
  } else {
    console.log('✅ Profile encontrado:', profile);
  }

  console.log('\n3️⃣  Verificando Papéis (user_roles)...');
  const { data: roles, error: roleError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId);

  if (roleError) {
    console.error(`❌ Erro ao buscar roles: ${roleError.message}`);
  } else {
    if (roles.length === 0) {
      console.warn('⚠️  AVISO: Usuário logado mas SEM NENHUM PAPEL (role) definido.');
    } else {
      console.log('✅ Roles encontrados:', roles.map(r => r.role));
    }
  }
}

diagnosticar();
