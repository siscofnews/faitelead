import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const getEnv = (key) => {
  const match = env.match(new RegExp(`${key}="(.*?)"`)) || env.match(new RegExp(`${key}=(.*)`));
  return match ? match[1] : null;
};

const url = getEnv('VITE_SUPABASE_URL');
const key = getEnv('VITE_SUPABASE_PUBLISHABLE_KEY');

if (!url || !key) {
  console.error('URL ou KEY não encontrados no .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  console.log('Tentando criar usuário pr.vcsantos@gmail.com...');
  
  const { data, error } = await supabase.auth.signUp({
    email: 'pr.vcsantos@gmail.com',
    password: 'Faitel@2025#Admin',
    options: {
      data: {
        full_name: 'Super Admin'
      }
    }
  });

  if (error) {
    console.error('Erro:', error.message);
  } else {
    console.log('Sucesso! Usuário criado.');
    if (data.user) {
      console.log('ID do Usuário:', data.user.id);
      console.log('Senha definida: Faitel@2025#Admin');
    }
  }
}

run();
