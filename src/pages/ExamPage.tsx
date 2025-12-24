import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useGamification } from "@/hooks/useGamification";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Circle,
  Send,
  Home,
  BookOpen,
  Timer,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Question {
  id: string;
  question_text: string;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  correct_answer: string | null;
  order_index: number;
}

interface Exam {
  id: string;
  title: string;
  description: string | null;
  total_questions: number;
  passing_score: number;
  module_id: string;
}

interface Module {
  id: string;
  title: string;
  course_id: string;
}

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exam, setExam] = useState<Exam | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes default
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const { recordExamPassed } = useGamification();

  useEffect(() => {
    if (examId) {
      loadExamData();
    }
  }, [examId]);

  useEffect(() => {
    if (examStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examStarted, timeRemaining]);

  const loadExamData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load exam
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .single();

      if (examError) throw examError;
      setExam(examData);

      // Load module
      const { data: moduleData } = await supabase
        .from("modules")
        .select("*")
        .eq("id", examData.module_id)
        .single();

      setModule(moduleData);

      // Load questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("exam_questions")
        .select("*")
        .eq("exam_id", examId)
        .order("order_index", { ascending: true });

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

      // Set time based on number of questions (2 minutes per question)
      setTimeRemaining((questionsData?.length || 10) * 120);

      setLoading(false);
    } catch (error) {
      console.error("Error loading exam:", error);
      toast.error("Erro ao carregar a prova");
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleSubmitExam = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !exam) return;

      const score = calculateScore();
      const passed = score >= (exam.passing_score || 70);

      const { error } = await supabase
        .from("exam_submissions")
        .insert({
          exam_id: exam.id,
          student_id: user.id,
          answers: answers,
          score: score,
          passed: passed
        });

      if (error) throw error;

      // Update student progress if passed
      if (passed && module) {
        await supabase
          .from("student_progress")
          .upsert({
            student_id: user.id,
            module_id: module.id,
            exam_id: exam.id,
            passed: true,
            score: score,
            completed_at: new Date().toISOString()
          }, {
            onConflict: "student_id,module_id"
          });

        // Record gamification progress
        await recordExamPassed(user.id, score);
      }

      navigate(`/exam-result/${exam.id}?score=${score}&passed=${passed}`);
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Erro ao enviar prova");
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;
  const currentQuestion = questions[currentQuestionIndex];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-primary-foreground text-xl font-display">Carregando prova...</p>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display">{exam?.title}</CardTitle>
            <p className="text-muted-foreground">{exam?.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <p className="text-3xl font-display font-bold text-primary">{questions.length}</p>
                <p className="text-sm text-muted-foreground">Questões</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <p className="text-3xl font-display font-bold text-primary">{exam?.passing_score}%</p>
                <p className="text-sm text-muted-foreground">Nota mínima</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <p className="text-3xl font-display font-bold text-accent">{formatTime(timeRemaining)}</p>
                <p className="text-sm text-muted-foreground">Tempo limite</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <p className="text-3xl font-display font-bold text-success">1</p>
                <p className="text-sm text-muted-foreground">Tentativa</p>
              </div>
            </div>

            <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Instruções importantes:</p>
                  <ul className="text-muted-foreground mt-2 space-y-1">
                    <li>• Não feche a página durante a prova</li>
                    <li>• Responda todas as questões antes de enviar</li>
                    <li>• O tempo é limitado, gerencie bem seu tempo</li>
                    <li>• Você poderá navegar entre as questões</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button
                onClick={() => setExamStarted(true)}
                className="flex-1 bg-gradient-primary hover:opacity-90 btn-shine"
              >
                Iniciar Prova
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mr-3">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Home</span>
              </Link>
              <div className="w-px h-6 bg-border" />
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <h1 className="font-display font-semibold text-foreground">{exam?.title}</h1>
                <p className="text-xs text-muted-foreground">{module?.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                timeRemaining < 300 ? 'bg-destructive/10 text-destructive' : 'bg-muted'
              }`}>
                <Timer className="h-4 w-4" />
                <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
              </div>
              
              {/* Progress */}
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {answeredCount}/{questions.length}
              </Badge>
            </div>
          </div>
          
          <Progress value={progress} className="h-1.5 mt-3" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Question Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                idx === currentQuestionIndex
                  ? 'bg-primary text-primary-foreground'
                  : answers[q.id]
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Current Question */}
        {currentQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-primary">
                    {currentQuestionIndex + 1}
                  </span>
                  <Badge variant="outline">
                    {answers[currentQuestion.id] ? 'Respondida' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-foreground font-medium leading-relaxed">
                {currentQuestion.question_text}
              </p>

              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="space-y-3"
              >
                {['a', 'b', 'c', 'd'].map((option) => {
                  const optionText = currentQuestion[`option_${option}` as keyof Question];
                  if (!optionText) return null;
                  
                  const isSelected = answers[currentQuestion.id] === option;
                  
                  return (
                    <Label
                      key={option}
                      htmlFor={`option-${option}`}
                      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30 hover:bg-muted/30'
                      }`}
                    >
                      <RadioGroupItem 
                        value={option} 
                        id={`option-${option}`}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-primary mr-2">
                          {option.toUpperCase()})
                        </span>
                        <span className="text-foreground">{optionText}</span>
                      </div>
                    </Label>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={() => setShowConfirmDialog(true)}
              className="bg-gradient-primary hover:opacity-90"
              disabled={answeredCount < questions.length}
            >
              <Send className="mr-2 h-4 w-4" />
              Enviar Prova
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
            >
              Próxima
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {answeredCount < questions.length && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Você ainda tem {questions.length - answeredCount} questão(ões) não respondida(s)
          </p>
        )}
      </main>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar envio da prova</AlertDialogTitle>
            <AlertDialogDescription>
              Você respondeu {answeredCount} de {questions.length} questões.
              Após enviar, não será possível alterar suas respostas.
              Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Revisar respostas</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitExam}
              disabled={submitting}
              className="bg-gradient-primary"
            >
              {submitting ? "Enviando..." : "Confirmar envio"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamPage;
