import { useEffect, useState } from "react";
import { Download, FileText, ExternalLink, BookOpen, File, Video, CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import VideoPlayer from "@/components/ead/VideoPlayer";

interface LessonResourcesProps {
  pdfUrl: string | null | undefined;
  lessonTitle: string;
  lessonId: string;
  materials?: any[]; // Array de materiais do módulo
}

const LessonResources = ({ pdfUrl, lessonTitle, lessonId, materials = [] }: LessonResourcesProps) => {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string; id: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      try {
        const rows = await api.listContentProgressAny(user.id);
        const map: Record<string, boolean> = {};
        if (Array.isArray(rows)) {
          rows.forEach((r: any) => {
            if (r.completed) map[r.content_id] = true;
          });
        }
        setCompletedMap(map);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [lessonId, materials]);

  const handleDownload = (url: string) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  const handleComplete = async (contentId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Faça login para registrar progresso");
      return;
    }
    try {
      await api.upsertContentProgress(null, { student_id: user.id, content_id: contentId, completed: true });
      toast.success("Conteúdo concluído!");
      setCompletedMap(prev => ({ ...prev, [contentId]: true }));
      
      // Se for vídeo em modal, fecha modal opcionalmente ou mantém
      // setSelectedVideo(null); 
    } catch (err: any) {
      toast.error("Erro ao concluir conteúdo");
      console.error(err);
    }
  };

  // Combinar pdfUrl legado com materiais novos se necessário, 
  // mas vamos focar em exibir a lista de materials se existir.
  const allMaterials = [...materials];
  
  // Se houver pdfUrl legado e não estiver na lista (improvável se o backend mandar tudo), adiciona
  if (pdfUrl && !allMaterials.find(m => m.file_url === pdfUrl)) {
    allMaterials.push({
      id: lessonId, // ID da aula como fallback
      title: lessonTitle + " (PDF da Aula)",
      material_type: 'pdf',
      file_url: pdfUrl,
      is_required: false
    });
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Materiais de Estudo
        </h3>

        {allMaterials.length > 0 ? (
          <div className="space-y-4">
            {allMaterials.map((material) => (
              <Card 
                key={material.id} 
                className="border-border hover:border-primary/30 transition-colors group cursor-pointer"
                onClick={() => {
                  if (material.material_type === 'video' || material.youtube_url) {
                    setSelectedVideo({
                      url: material.youtube_url || material.file_url,
                      title: material.title,
                      id: material.id
                    });
                  } else {
                    handleDownload(material.file_url);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${
                      material.material_type === 'video' || material.youtube_url 
                        ? 'bg-primary/10' 
                        : 'bg-destructive/10'
                    }`}>
                      {material.material_type === 'video' || material.youtube_url ? (
                        <Play className="h-7 w-7 text-primary" />
                      ) : (
                        <FileText className="h-7 w-7 text-destructive" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {material.title}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {material.material_type === 'video' || material.youtube_url ? 'Vídeo Aula' : 'Documento PDF'} 
                        {material.is_required && ' • Obrigatório'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {completedMap[material.id] ? (
                        <span className="inline-flex items-center gap-1 text-sm text-success font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          Concluído
                        </span>
                      ) : (
                        (material.material_type !== 'video' && !material.youtube_url) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="gap-2 shrink-0" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleComplete(material.id);
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Marcar
                          </Button>
                        )
                      )}

                      {material.material_type === 'video' || material.youtube_url ? (
                        <Button variant="default" size="sm" className="gap-2 shrink-0">
                          <Play className="h-4 w-4" />
                          Assistir
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="gap-2 shrink-0">
                          <Download className="h-4 w-4" />
                          Baixar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
              Este módulo não possui materiais complementares
            </p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
          <DialogHeader className="p-4 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <DialogTitle className="text-white text-shadow">{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedVideo && (
            <div className="aspect-video w-full">
              <VideoPlayer
                youtubeUrl={selectedVideo.url}
                title={selectedVideo.title}
                onComplete={() => handleComplete(selectedVideo.id)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonResources;
