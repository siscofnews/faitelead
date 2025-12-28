
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBasicoBibliologia() {
  console.log("Iniciando correção do módulo BIBLIOLOGIA I em BÁSICO EM TEOLOGIA...");

  const moduleId = '1cbdd2bd-82da-47e4-a155-3c083218b103';

  // Verify module exists
  const { data: moduleData, error: modError } = await supabase
    .from('modules')
    .select('id, title')
    .eq('id', moduleId)
    .single();

  if (modError || !moduleData) {
    console.error("Módulo não encontrado:", modError);
    return;
  }

  console.log(`Módulo alvo: ${moduleData.title} (${moduleData.id})`);

  // Define lessons to insert
  const lessons = [
    // Módulo 1 Content
    { title: "Aula 1: Revelação Geral e Especial", description: "Natureza, Consciência e Revelação em Cristo", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Aula 2: Inspiração Bíblica", description: "Papel do Espírito Santo e Teoria Plenária", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Aula 3: Inspiração Verbal", description: "Análise de 2 Tm 3:16 e as Palavras Originais", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Aula 4: A Ação do Espírito Santo", description: "Cooperação Divino-Humana e Inerrância", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Aula 5: Revelação vs. Inspiração", description: "Diferenças, Revelação Progressiva e Culminação em Cristo", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    // Módulo 2 Content
    { title: "Aula 6: O Cânon Bíblico", description: "Definição e Formação do Cânon do AT", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Aula 7: Livros Apócrifos e o Novo Testamento", description: "Critérios de Canonicidade e os 27 Livros", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Aula 8: Autoridade Normativa", description: "A Bíblia como Regra de Fé e a Sola Scriptura", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Aula 9: Reconhecimento Canônico", description: "Autoridade Intrínseca e Confiabilidade dos Manuscritos", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Aula 10: Deuterocanônicos e Norma Normans", description: "Distinções e a Escritura como Norma Suprema", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    // Módulo 3 Content
    { title: "Aula 11: Confiabilidade e Arqueologia", description: "Evidências Históricas e Manuscritos Antigos", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Aula 12: Manuscritos e Inerrância", description: "A Preservação Textual e os Autógrafos Originais", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Aula 13: Princípios de Interpretação", description: "Hermenêutica e Importância do Contexto Histórico", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Aula 14: A Unidade da Escritura", description: "A Bíblia interpretando a própria Bíblia", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Aula 15: Objetivo e Suficiência", description: "A Autoridade Final da Palavra de Deus para o Cristão", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
  ];

  for (let i = 0; i < lessons.length; i++) {
    const lessonData = lessons[i];
    
    // Check if lesson exists to avoid duplicates
    const { data: existing } = await supabase
        .from('lessons')
        .select('id')
        .eq('module_id', moduleId)
        .ilike('title', lessonData.title);

    if (existing && existing.length > 0) {
        console.log(`Aula já existe: ${lessonData.title}`);
    } else {
        console.log(`Inserindo: ${lessonData.title}`);
        const { error: insertError } = await supabase
            .from('lessons')
            .insert({
                module_id: moduleId,
                title: lessonData.title,
                description: lessonData.description,
                youtube_url: lessonData.youtube_url,
                order_index: i + 1,
                duration_minutes: 60
            });
        
        if (insertError) {
            console.error(`Erro ao inserir aula ${lessonData.title}:`, insertError);
        }
    }
  }

  console.log("Correção concluída!");
}

fixBasicoBibliologia();
