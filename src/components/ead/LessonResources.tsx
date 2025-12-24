import { useEffect, useState } from "react";
import { Download, FileText, ExternalLink, BookOpen, File, Video, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface LessonResourcesProps {
  pdfUrl: string | null | undefined;
  lessonTitle: string;
  lessonId: string;
}

const LessonResources = ({ pdfUrl, lessonTitle, lessonId }: LessonResourcesProps) => {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      try {
        const rows = await api.listContentProgressAny(user.id);
        const done = Array.isArray(rows) && rows.some((r: any) => r.content_id === lessonId && r.completed);
        setCompleted(!!done);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [lessonId]);
  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    }
  };

  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Faça login para registrar progresso");
      return;
    }
    try {
      await api.upsertContentProgress(null, { student_id: user.id, content_id: lessonId, completed: true });
      toast.success("Conteúdo concluído!");
      setCompleted(true);
    } catch (err: any) {
      toast.error("Erro ao concluir conteúdo");
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Materiais da Aula
        </h3>

        {pdfUrl ? (
          <div className="space-y-4">
            {/* PDF Card */}
            <Card className="border-border hover:border-primary/30 transition-colors group cursor-pointer" onClick={handleDownload}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileText className="h-7 w-7 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {lessonTitle || "Material da Aula"}.pdf
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Documento PDF • Clique para baixar
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                    Baixar
                  </Button>
                  {completed ? (
                    <span className="inline-flex items-center gap-1 text-sm text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      Concluído
                    </span>
                  ) : (
                    <Button size="sm" className="gap-2 shrink-0" onClick={handleComplete}>
                      <CheckCircle2 className="h-4 w-4" />
                      Concluir conteúdo
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview iframe for PDF */}
            <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
              <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pré-visualização do PDF</span>
                <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1 h-7">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir
                </Button>
              </div>
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                className="w-full h-[500px] bg-background"
                title="PDF Preview"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <File className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              Nenhum material disponível
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Esta aula não possui materiais complementares
            </p>
          </div>
        )}
      </div>

      {/* Additional Resources Section */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Recursos Adicionais
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="border-border hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Biblioteca Virtual</p>
                <p className="text-xs text-muted-foreground">Acesse livros digitais</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Artigos Acadêmicos</p>
                <p className="text-xs text-muted-foreground">Materiais de pesquisa</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LessonResources;
