
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('--- Checking Tables ---');

  const { count: lessonsCount, error: lessonsError } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true });
  
  if (lessonsError) console.log('Error checking lessons table:', JSON.stringify(lessonsError));
  else console.log('Lessons table count:', lessonsCount);

  const { count: contentsCount, error: contentsError } = await supabase
    .from('contents')
    .select('*', { count: 'exact', head: true });
  
  if (contentsError) console.log('Error checking contents table:', JSON.stringify(contentsError));
  else console.log('Contents table count:', contentsCount);

  const { count: moduleContentsCount, error: moduleContentsError } = await supabase
    .from('module_contents')
    .select('*', { count: 'exact', head: true });
  
  if (moduleContentsError) console.log('Error checking module_contents table:', JSON.stringify(moduleContentsError));
  else console.log('Module_contents table count:', moduleContentsCount);
}

checkTables();
