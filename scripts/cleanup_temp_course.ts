
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteTempCourse() {
  const courseId = 'fffdc09b-d10d-4457-97fb-1ea9db94a934';
  
  console.log(`Deletando curso temporário: ${courseId}`);
  
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);
    
  if (error) console.error("Erro ao deletar:", error);
  else console.log("Curso deletado com sucesso.");
}

deleteTempCourse();
