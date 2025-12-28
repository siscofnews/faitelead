
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';

// Se as variáveis de ambiente não estiverem carregadas corretamente do .env (comum em scripts fora do contexto do Vite),
// você pode precisar defini-las hardcoded ou garantir que o dotenv pegue o arquivo correto.
// Vou assumir que o usuário vai preencher ou que o ambiente já tem (mas o .env local geralmente não é carregado automaticamente pelo node sem dotenv).

// ATENÇÃO: Para rodar localmente com tsx, é melhor usar as credenciais que já estão no projeto se possível, 
// mas como não tenho acesso fácil ao .env aqui, vou tentar ler do arquivo .env se existir.

const supabase = createClient(supabaseUrl, supabaseKey);

async function listStructure() {
  console.log('--- Buscando Cursos ---');
  const { data: courses, error: coursesError } = await supabase.from('courses').select('*');
  
  if (coursesError) {
    console.error('Erro ao buscar cursos:', coursesError);
    return;
  }

  console.log(`Encontrados ${courses.length} cursos.`);
  
  const bibliologiaCourse = courses.find(c => c.title.toLowerCase().includes('bibliologia') || c.title.toLowerCase().includes('teologia'));

  if (!bibliologiaCourse) {
    console.log('Curso de Bibliologia não encontrado explicitamente. Listando todos:');
    courses.forEach(c => console.log(`- [${c.id}] ${c.title}`));
    return;
  }

  console.log(`Curso alvo encontrado: [${bibliologiaCourse.id}] ${bibliologiaCourse.title}`);

  console.log('\n--- Buscando Módulos do Curso ---');
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('*')
    .eq('course_id', bibliologiaCourse.id);

  if (modulesError) {
    console.error('Erro ao buscar módulos:', modulesError);
    return;
  }

  console.log(`Encontrados ${modules.length} módulos.`);
  modules.forEach(m => console.log(`- [${m.id}] ${m.title}`));

  console.log('\n--- Buscando Aulas (Lessons) ---');
  for (const m of modules) {
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', m.id);
      
    if (lessonsError) console.error(`Erro ao buscar aulas do módulo ${m.title}:`, lessonsError);
    else {
      console.log(`Módulo: ${m.title} - ${lessons.length} aulas`);
      lessons.forEach(l => console.log(`  -> [${l.id}] ${l.title}`));
    }
  }
}

listStructure();
