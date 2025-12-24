import { useState, useEffect } from "react";
import { Save, Trash2, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";

interface LessonNotesProps {
  lessonId: string;
  notes: string;
  onNotesChange: (notes: string) => void;
}

const LessonNotes = ({ lessonId, notes, onNotesChange }: LessonNotesProps) => {
  const [localNotes, setLocalNotes] = useState(notes);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load notes from localStorage
    const savedNotes = localStorage.getItem(`lesson-notes-${lessonId}`);
    if (savedNotes) {
      setLocalNotes(savedNotes);
      onNotesChange(savedNotes);
    } else {
      setLocalNotes("");
    }
  }, [lessonId]);

  const saveNotes = () => {
    setIsSaving(true);
    try {
      localStorage.setItem(`lesson-notes-${lessonId}`, localNotes);
      onNotesChange(localNotes);
      toast.success("Anotações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar anotações");
    } finally {
      setIsSaving(false);
    }
  };

  const clearNotes = () => {
    setLocalNotes("");
    localStorage.removeItem(`lesson-notes-${lessonId}`);
    onNotesChange("");
    toast.info("Anotações removidas");
  };

  const completeContent = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Faça login para registrar progresso");
      return;
    }
    try {
      await api.upsertContentProgress(null, { student_id: user.id, content_id: lessonId, completed: true });
      toast.success("Conteúdo concluído!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao concluir conteúdo");
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-lg">Minhas Anotações</h3>
        </div>
        <div className="flex items-center gap-2">
          {localNotes && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotes}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            onClick={saveNotes}
            disabled={isSaving}
            className="bg-gradient-primary hover:opacity-90 gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar
          </Button>
          <Button
            size="sm"
            onClick={completeContent}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Concluir conteúdo
          </Button>
        </div>
      </div>

      <Textarea
        placeholder="Escreva suas anotações sobre esta aula aqui... Você pode anotar pontos importantes, dúvidas para pesquisar depois, ou reflexões pessoais."
        value={localNotes}
        onChange={(e) => setLocalNotes(e.target.value)}
        className="min-h-[200px] resize-y bg-muted/30 border-border focus:border-primary"
      />

      <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
        <Sparkles className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Dica:</strong> Suas anotações são salvas localmente no seu navegador. 
          Use-as para registrar insights importantes e facilitar a revisão do conteúdo.
        </p>
      </div>
    </div>
  );
};

export default LessonNotes;
