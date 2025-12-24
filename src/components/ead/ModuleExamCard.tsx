import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileQuestion, 
  Clock, 
  Target, 
  CheckCircle2, 
  Lock,
  Play,
  Award,
  ArrowRight,
  AlertTriangle,
  Unlock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Exam {
  id: string;
  title: string;
  description: string | null;
  total_questions: number;
  passing_score: number;
}

interface ModuleExamCardProps {
  moduleId: string;
  moduleLessonsCompleted: boolean;
  completedLessonsCount: number;
  totalLessonsCount: number;
  onExamPassed?: () => void;
}

const ModuleExamCard = ({ 
  moduleId, 
  moduleLessonsCompleted,
  completedLessonsCount,
  totalLessonsCount,
  onExamPassed
}: ModuleExamCardProps) => {
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [submission, setSubmission] = useState<{ score: number; passed: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExamData();
  }, [moduleId]);

  const loadExamData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get exam for this module
      const { data: examData } = await supabase
        .from("exams")
        .select("*")
        .eq("module_id", moduleId)
        .maybeSingle();

      setExam(examData);

      // Get best submission if exists
      if (examData && user) {
        const { data: submissionData } = await supabase
          .from("exam_submissions")
          .select("score, passed")
          .eq("exam_id", examData.id)
          .eq("student_id", user.id)
          .order("score", { ascending: false })
          .limit(1)
          .maybeSingle();

        setSubmission(submissionData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading exam:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-muted bg-muted/30 animate-pulse">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted mx-auto mb-4" />
          <div className="h-4 bg-muted rounded w-48 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!exam) {
    return (
      <Card className="border-2 border-muted bg-muted/30">
        <CardContent className="p-8 text-center">
          <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma prova cadastrada para este módulo ainda.</p>
        </CardContent>
      </Card>
    );
  }

  const canTakeExam = moduleLessonsCompleted || completedLessonsCount >= totalLessonsCount;
  const isPassed = submission?.passed && (submission?.score || 0) >= 70;
  const lessonsProgress = totalLessonsCount > 0 
    ? Math.round((completedLessonsCount / totalLessonsCount) * 100) 
    : 0;

  const REQUIRED_SCORE = 70;

  return (
    <Card className={`border-2 transition-all ${
      isPassed 
        ? 'border-success/50 bg-success/5' 
        : canTakeExam 
          ? 'border-primary/50 bg-primary/5' 
          : 'border-muted bg-muted/30'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isPassed 
                ? 'bg-success text-success-foreground' 
                : canTakeExam 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
            }`}>
              {isPassed ? (
                <Award className="w-6 h-6" />
              ) : canTakeExam ? (
                <FileQuestion className="w-6 h-6" />
              ) : (
                <Lock className="w-6 h-6" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg font-display">{exam.title}</CardTitle>
              <p className="text-sm text-muted-foreground">Avaliação do módulo</p>
            </div>
          </div>

          {isPassed && (
            <Badge className="bg-success text-success-foreground gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Aprovado
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Important Warning */}
        {!isPassed && canTakeExam && (
          <Alert className="border-warning bg-warning/10">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertTitle className="text-warning font-semibold">Atenção!</AlertTitle>
            <AlertDescription className="text-warning/80">
              Você precisa atingir <strong>{REQUIRED_SCORE}% ou mais</strong> para ser aprovado e desbloquear o próximo módulo.
            </AlertDescription>
          </Alert>
        )}

        {exam.description && (
          <p className="text-sm text-muted-foreground">{exam.description}</p>
        )}

        {/* Exam Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-background rounded-lg border border-border">
            <FileQuestion className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold text-foreground">{exam.total_questions}</p>
            <p className="text-xs text-muted-foreground">Questões</p>
          </div>
          <div className="text-center p-3 bg-background rounded-lg border border-border">
            <Target className="h-4 w-4 mx-auto mb-1 text-warning" />
            <p className="text-lg font-bold text-foreground">{REQUIRED_SCORE}%</p>
            <p className="text-xs text-muted-foreground">Nota mínima</p>
          </div>
          <div className="text-center p-3 bg-background rounded-lg border border-border">
            <Clock className="h-4 w-4 mx-auto mb-1 text-accent" />
            <p className="text-lg font-bold text-foreground">{exam.total_questions * 2}</p>
            <p className="text-xs text-muted-foreground">Minutos</p>
          </div>
        </div>

        {/* Progress or Result */}
        {isPassed ? (
          <div className="bg-success/10 rounded-lg p-4 border border-success/30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Unlock className="h-8 w-8 text-success" />
                <div>
                  <p className="text-sm text-success font-medium">Parabéns! Aprovado com</p>
                  <p className="text-3xl font-display font-bold text-success">
                    {submission?.score}%
                  </p>
                </div>
              </div>
              <Badge className="bg-success/20 text-success border-success/30">
                Próximo módulo desbloqueado!
              </Badge>
            </div>
          </div>
        ) : submission ? (
          <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-destructive font-medium">
                  Você não atingiu a nota mínima de {REQUIRED_SCORE}%
                </p>
                <p className="text-3xl font-display font-bold text-destructive">
                  {submission.score}%
                </p>
                <p className="text-xs text-destructive/70 mt-1">
                  Estude mais e tente novamente!
                </p>
              </div>
              <Button
                onClick={() => navigate(`/exam/${exam.id}`)}
                disabled={!canTakeExam}
                className="bg-gradient-primary hover:opacity-90 gap-2"
              >
                Tentar novamente
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : canTakeExam ? (
          <div className="space-y-3">
            <Button
              onClick={() => navigate(`/exam/${exam.id}`)}
              className="w-full bg-gradient-primary hover:opacity-90 gap-2 h-12"
            >
              <Play className="h-5 w-5" />
              Iniciar Prova
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Complete a prova com <strong>{REQUIRED_SCORE}%</strong> para desbloquear o próximo módulo
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Complete todas as aulas para desbloquear</span>
              <span className="font-medium text-foreground">{lessonsProgress}%</span>
            </div>
            <Progress value={lessonsProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Complete <strong>100%</strong> das aulas para acessar a prova
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModuleExamCard;
