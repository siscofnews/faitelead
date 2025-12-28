
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listCourses() {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title, is_active');
  
  if (error) console.error(error);
  else {
    console.log('Cursos existentes:', courses);
  }
}

listCourses();
