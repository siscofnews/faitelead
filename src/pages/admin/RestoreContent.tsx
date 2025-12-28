
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const RestoreContent = () => {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  const handleRestore = async () => {
    setLoading(true);
    setLog([]);
    addLog("Iniciando restauração...");

    try {
      // 1. Buscar ou Criar Curso Bibliologia
      let courseId = "";
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title")
        .ilike("title", "%Bibliologia%");

      if (courses && courses.length > 0) {
        courseId = courses[0].id;
        addLog(`Curso encontrado: ${courses[0].title} (${courseId})`);
      } else {
        addLog("Curso 'Bibliologia' não encontrado. Criando...");
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
        addLog(`Curso criado com sucesso: ${courseId}`);
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
        addLog(`Verificando módulo: ${modData.title}`);
        
        let moduleId = "";
        
        // Buscar módulo existente (pelo título parcial para evitar duplicatas exatas)
        const { data: existingModules } = await supabase
          .from("modules")
          .select("id")
          .eq("course_id", courseId)
          .ilike("title", `%${modData.title.split(':')[0]}%`); // Busca por "Módulo 1", "Módulo 2"...

        if (existingModules && existingModules.length > 0) {
          moduleId = existingModules[0].id;
          addLog(`Módulo encontrado: ${moduleId}`);
        } else {
          addLog(`Criando módulo: ${modData.title}`);
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
            addLog(`Aula já existe: ${lessonData.title}`);
          } else {
            addLog(`Criando aula: ${lessonData.title}`);
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

      addLog("Restauração concluída com sucesso!");
      toast.success("Conteúdo restaurado!");

    } catch (error: any) {
      console.error(error);
      addLog(`ERRO CRÍTICO: ${error.message}`);
      toast.error("Erro na restauração");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Restauração de Conteúdo - Bibliologia</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Esta ferramenta irá recriar a estrutura do curso de Bibliologia (Módulos 1, 2 e 3) e suas respectivas aulas, caso não existam.
            <br />
            <strong>Nota:</strong> As aulas serão criadas com vídeos genéricos. Você precisará editar os links do YouTube depois.
          </p>
          
          <Button onClick={handleRestore} disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Restaurando...
              </>
            ) : (
              "Restaurar Aulas de Bibliologia"
            )}
          </Button>

          <div className="mt-6 bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-xs h-64 overflow-y-auto">
            {log.length === 0 ? (
              <span className="text-slate-500">Logs de execução aparecerão aqui...</span>
            ) : (
              log.map((line, i) => (
                <div key={i} className="border-b border-slate-800/50 py-1 last:border-0">
                  {line}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestoreContent;
