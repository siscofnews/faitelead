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
  process.exit(1);
}

const supabase = createClient(url, key);

async function testPublicAccess() {
  console.log('📡 Testando acesso público (integração front-end)...');
  
  // Tentar ler cursos ativos (público segundo as políticas RLS padrão)
  const { data, error } = await supabase
    .from('courses')
    .select('id, title')
    .eq('is_active', true)
    .limit(1);

  if (error) {
    console.error(`❌ Falha na integração: ${error.message}`);
    if (error.code === 'PGRST116') {
      console.log('   (Erro de formato de resposta JSON, verifique a URL do projeto)');
    }
  } else {
    console.log('✅ Integração OK! Conexão estabelecida e leitura permitida.');
    console.log(`   Cursos encontrados: ${data.length}`);
  }
}

testPublicAccess();
