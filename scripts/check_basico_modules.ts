
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkModules() {
  const courseId = '99cd976c-3b36-46d2-a9a5-55fd41548c42'; // BÁSICO EM TEOLOGIA
  
  const { data: modules, error } = await supabase
    .from('modules')
    .select('id, title, order_index')
    .eq('course_id', courseId)
    .order('order_index');

  if (error) console.error(error);
  else {
    console.log('Módulos de BÁSICO EM TEOLOGIA:', modules);
    
    // Check lessons for these modules
    for (const m of modules || []) {
        const { count } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('module_id', m.id);
        console.log(`Módulo '${m.title}' tem ${count} aulas.`);
    }
  }
}

checkModules();
