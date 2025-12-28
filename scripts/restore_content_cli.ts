
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreContent() {
  console.log("Iniciando restauração via CLI...");

  try {
    // 1. Buscar ou Criar Curso Bibliologia
    let courseId = "";
    const { data: courses } = await supabase
      .from("courses")
      .select("id, title")
      .ilike("title", "%Bibliologia%");

    if (courses && courses.length > 0) {
      courseId = courses[0].id;
      console.log(`Curso encontrado: ${courses[0].title} (${courseId})`);
    } else {
      console.log("Curso 'Bibliologia' não encontrado. Criando...");
      const { data: newCourse, error: createError } = await supabase
        .from("courses")
        .insert({
          title: "Bibliologia",
          description: "Estudo sobre a origem, inspiração e autoridade da Bíblia."
        })
        .select()
        .single();
      
      if (createError) throw createError;
      courseId = newCourse.id;
      console.log(`Curso criado com sucesso: ${courseId}`);
    }

    // 2. Definir Módulos e Aulas
    const modulesStructure = [
      {
        title: "Módulo 1: Revelação e Inspiração",
        description: "A origem divina das Escrituras e o processo de inspiração.",
        lessons: [
          { title: "Aula 1: Revelação Geral e Especial", description: "Natureza, Consciência e Revelação em Cristo", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          { title: "Aula 2: Inspiração Bíblica", description: "Papel do Espírito Santo e Teoria Plenária", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          { title: "Aula 3: Inspiração Verbal", description: "Análise de 2 Tm 3:16 e as Palavras Originais", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          { title: "Aula 4: A Ação do Espírito Santo", description: "Cooperação Divino-Humana e Inerrância", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          { title: "Aula 5: Revelação vs. Inspiração", description: "Diferenças, Revelação Progressiva e Culminação em Cristo", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
        ]
      },
      {
        title: "Módulo 2: Cânon e Autoridade Bíblica",
        description: "A formação da Bíblia e sua autoridade como regra de fé.",
        lessons: [
          { title: "Aula 6: O Cânon Bíblico", description: "Definição e Formação do Cânon do AT", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          { title: "Aula 7: Livros Apócrifos e o Novo Testamento", description: "Critérios de Canonicidade e os 27 Livros", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          { title: "Aula 8: Autoridade Normativa", description: "A Bíblia como Regra de Fé e a Sola Scriptura", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          { title: "Aula 9: Reconhecimento Canônico", description: "Autoridade Intrínseca e Confiabilidade dos Manuscritos", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          { title: "Aula 10: Deuterocanônicos e Norma Normans", description: "Distinções e a Escritura como Norma Suprema", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
        ]
      },
      {
        title: "Módulo 3: Confiabilidade e Interpretação",
        description: "A defesa da veracidade bíblica e princípios de interpretação.",
        lessons: [
          { title: "Aula 11: Confiabilidade e Arqueologia", description: "Evidências Históricas e Manuscritos Antigos", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          { title: "Aula 12: Manuscritos e Inerrância", description: "A Preservação Textual e os Autógrafos Originais", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          { title: "Aula 13: Princípios de Interpretação", description: "Hermenêutica e Importância do Contexto Histórico", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          { title: "Aula 14: A Unidade da Escritura", description: "A Bíblia interpretando a própria Bíblia", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          { title: "Aula 15: Objetivo e Suficiência", description: "A Autoridade Final da Palavra de Deus para o Cristão", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
        ]
      }
    ];

    // 3. Processar Módulos e Aulas
    for (const modData of modulesStructure) {
      console.log(`Verificando módulo: ${modData.title}`);
      
      let moduleId = "";
      
      // Buscar módulo existente (pelo título parcial para evitar duplicatas exatas)
      const { data: existingModules } = await supabase
        .from("modules")
        .select("id")
        .eq("course_id", courseId)
        .ilike("title", `%${modData.title.split(':')[0]}%`); // Busca por "Módulo 1", "Módulo 2"...

      if (existingModules && existingModules.length > 0) {
        moduleId = existingModules[0].id;
        console.log(`Módulo encontrado: ${moduleId}`);
      } else {
        console.log(`Criando módulo: ${modData.title}`);
        const { data: newModule, error: modError } = await supabase
          .from("modules")
          .insert({
            course_id: courseId,
            title: modData.title,
            description: modData.description,
            order_index: parseInt(modData.title.split(' ')[1]) // Pega o número do módulo
          })
          .select()
          .single();
        
        if (modError) throw modError;
        moduleId = newModule.id;
      }

      // Inserir Aulas
      for (let i = 0; i < modData.lessons.length; i++) {
        const lessonData = modData.lessons[i];
        
        // Verificar se aula já existe
        const { data: existingLesson } = await supabase
          .from("lessons")
          .select("id")
          .eq("module_id", moduleId)
          .ilike("title", lessonData.title);

        if (existingLesson && existingLesson.length > 0) {
          console.log(`Aula já existe: ${lessonData.title}`);
        } else {
          console.log(`Criando aula: ${lessonData.title}`);
          const { error: lessonError } = await supabase
            .from("lessons")
            .insert({
              module_id: moduleId,
              title: lessonData.title,
              description: lessonData.description,
              youtube_url: lessonData.youtube_url, // URL placeholder, usuário deve atualizar depois
              order_index: i + 1,
              duration_minutes: 60
            });
          
          if (lessonError) throw lessonError;
        }
      }
    }

    console.log("Restauração concluída com sucesso!");

  } catch (error: any) {
    console.error(`ERRO CRÍTICO: ${error.message}`);
  }
}

restoreContent();
