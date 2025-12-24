import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Trophy, 
  XCircle, 
  Home, 
  RotateCcw, 
  Award,
  CheckCircle2,
  Target,
  BookOpen,
  Download,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import confetti from 'canvas-confetti';

interface ExamData {
  id: string;
  title: string;
  passing_score: number;
  modules: {
    title: string;
    courses: {
      title: string;
    };
  };
}

const ExamResult = () => {
  const { examId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamData | null>(null);
  const [studentName, setStudentName] = useState("");

  const score = parseInt(searchParams.get("score") || "0");
  const passed = searchParams.get("passed") === "true";

  useEffect(() => {
    loadData();
    if (passed) {
      triggerCelebration();
    }
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setStudentName(profile.full_name);
      }
    }

    if (examId) {
      const { data } = await supabase
        .from("exams")
        .select(`
          id,
          title,
          passing_score,
          modules (
            title,
            courses (
              title
            )
          )
        `)
        .eq("id", examId)
        .single();

      if (data) {
        setExam(data as unknown as ExamData);
      }
    }
  };

  const triggerCelebration = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#FFD700', '#1e40af', '#22c55e'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const generateCertificate = () => {
    navigate(`/certificate/${examId}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Result Card */}
        <Card className={`overflow-hidden ${passed ? 'border-success/50' : 'border-destructive/50'}`}>
          <div className={`h-2 ${passed ? 'bg-success' : 'bg-destructive'}`} />
          
          <CardHeader className="text-center pt-8 pb-4">
            <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
              passed 
                ? 'bg-success/10 text-success animate-pulse-slow' 
                : 'bg-destructive/10 text-destructive'
            }`}>
              {passed ? (
                <Trophy className="w-12 h-12" />
              ) : (
                <XCircle className="w-12 h-12" />
              )}
            </div>
            
            <CardTitle className="text-3xl font-display">
              {passed ? "Parabéns!" : "Não foi dessa vez"}
            </CardTitle>
            <p className="text-muted-foreground">
              {passed 
                ? "Você foi aprovado na prova!" 
                : "Você não atingiu a nota mínima"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className={`text-6xl font-display font-bold ${
                passed ? 'text-success' : 'text-destructive'
              }`}>
                {score}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Sua pontuação
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nota mínima: {exam?.passing_score || 70}%</span>
                <span className={passed ? 'text-success' : 'text-destructive'}>
                  {passed ? '+' : ''}{score - (exam?.passing_score || 70)}%
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={score} 
                  className={`h-4 ${passed ? '[&>div]:bg-success' : '[&>div]:bg-destructive'}`}
                />
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-foreground/50"
                  style={{ left: `${exam?.passing_score || 70}%` }}
                />
              </div>
            </div>

            {/* Exam Info */}
            <div className="bg-muted/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Prova:</span>
                <span className="font-medium text-foreground">{exam?.title}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Módulo:</span>
                <span className="font-medium text-foreground">{exam?.modules?.title}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-xl">
                <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-success" />
                <p className="text-lg font-bold text-foreground">{Math.round(score / 10)}</p>
                <p className="text-xs text-muted-foreground">Acertos</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-xl">
                <XCircle className="h-5 w-5 mx-auto mb-1 text-destructive" />
                <p className="text-lg font-bold text-foreground">{10 - Math.round(score / 10)}</p>
                <p className="text-xs text-muted-foreground">Erros</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-xl">
                <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-bold text-foreground">10</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {passed ? (
                <>
                  <Button
                    onClick={generateCertificate}
                    className="flex-1 bg-gradient-accent text-accent-foreground hover:opacity-90 gap-2"
                  >
                    <Award className="h-4 w-4" />
                    Ver Certificado
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/student")}
                    className="flex-1 gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Ir para Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => navigate(-2)}
                    className="flex-1 bg-gradient-primary hover:opacity-90 gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Revisar Conteúdo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/student")}
                    className="flex-1 gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Voltar ao Início
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Motivational Message */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              {passed 
                ? "\"O conhecimento é a chave que abre todas as portas.\" Continue sua jornada de aprendizado!"
                : "\"O fracasso é apenas a oportunidade de começar de novo com mais inteligência.\" - Henry Ford"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamResult;
