import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ChevronLeft, Home, Plus, Trash2, Edit, GripVertical, CheckCircle, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Exam {
  id: string;
  title: string;
  passing_score: number;
  total_questions: number;
  module_id: string;
}

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

const ExamQuestionsManagement = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [form, setForm] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A"
  });

  useEffect(() => {
    if (examId) loadData();
  }, [examId]);

  const loadData = async () => {
    try {
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .maybeSingle();

      if (examError) throw examError;
      if (!examData) {
        toast.error("Prova não encontrada");
        navigate("/admin");
        return;
      }
      setExam(examData);

      const { data: questionsData, error: questionsError } = await supabase
        .from("exam_questions")
        .select("*")
        .eq("exam_id", examId)
        .order("order_index");

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
      setLoading(false);
    }
  };

  const handleSaveQuestion = async () => {
    try {
      if (!form.question_text.trim()) {
        toast.error("Pergunta é obrigatória");
        return;
      }
      if (!form.option_a.trim() || !form.option_b.trim()) {
        toast.error("Pelo menos 2 alternativas são obrigatórias");
        return;
      }

      if (editingQuestion) {
        const { error } = await supabase
          .from("exam_questions")
          .update({
            question_text: form.question_text,
            option_a: form.option_a,
            option_b: form.option_b,
            option_c: form.option_c || null,
            option_d: form.option_d || null,
            correct_answer: form.correct_answer
          })
          .eq("id", editingQuestion.id);

        if (error) throw error;
        toast.success("Questão atualizada!");
      } else {
        const nextOrder = questions.length > 0
          ? Math.max(...questions.map(q => q.order_index)) + 1
          : 1;

        const { error } = await supabase
          .from("exam_questions")
          .insert({
            exam_id: examId,
            question_text: form.question_text,
            option_a: form.option_a,
            option_b: form.option_b,
            option_c: form.option_c || null,
            option_d: form.option_d || null,
            correct_answer: form.correct_answer,
            order_index: nextOrder
          });

        if (error) throw error;
        toast.success("Questão adicionada!");
      }

      setDialogOpen(false);
      setEditingQuestion(null);
      setForm({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A"
      });
      loadData();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("Erro ao salvar questão");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Excluir esta questão?")) return;

    try {
      const { error } = await supabase
        .from("exam_questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;
      toast.success("Questão excluída!");
      loadData();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Erro ao excluir questão");
    }
  };

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);
    setForm({
      question_text: question.question_text,
      option_a: question.option_a || "",
      option_b: question.option_b || "",
      option_c: question.option_c || "",
      option_d: question.option_d || "",
      correct_answer: question.correct_answer || "A"
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <Home className="h-5 w-5" />
              </Link>
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-display font-bold">Questões da Prova</h1>
                <p className="text-sm text-muted-foreground">{exam?.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {questions.length} / {exam?.total_questions} questões
              </Badge>
              <Button onClick={() => {
                setEditingQuestion(null);
                setForm({
                  question_text: "",
                  option_a: "",
                  option_b: "",
                  option_c: "",
                  option_d: "",
                  correct_answer: "A"
                });
                setDialogOpen(true);
              }} className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Questão
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {questions.length === 0 ? (
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">Nenhuma questão cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Adicione questões de múltipla escolha para a prova
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Questão
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">{index + 1}</Badge>
                      <CardTitle className="text-base font-medium">
                        {question.question_text}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(question)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {['A', 'B', 'C', 'D'].map((letter) => {
                      const optionKey = `option_${letter.toLowerCase()}` as keyof Question;
                      const optionValue = question[optionKey];
                      if (!optionValue) return null;
                      const isCorrect = question.correct_answer === letter;
                      return (
                        <div
                          key={letter}
                          className={`p-3 rounded-lg flex items-center gap-2 ${
                            isCorrect
                              ? 'bg-success/10 border border-success/30'
                              : 'bg-muted/50'
                          }`}
                        >
                          <Badge variant={isCorrect ? "default" : "outline"} className="shrink-0">
                            {letter}
                          </Badge>
                          <span className="text-sm">{optionValue}</span>
                          {isCorrect && (
                            <CheckCircle className="h-4 w-4 text-success ml-auto" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {questions.length < (exam?.total_questions || 10) && questions.length > 0 && (
          <div className="mt-4 p-4 bg-warning/10 rounded-lg border border-warning/30 text-center">
            <p className="text-sm text-warning-foreground">
              Faltam <strong>{(exam?.total_questions || 10) - questions.length}</strong> questões para completar a prova
            </p>
          </div>
        )}
      </main>

      {/* Question Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? 'Editar Questão' : 'Nova Questão'}</DialogTitle>
            <DialogDescription>
              Crie uma questão de múltipla escolha com até 4 alternativas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Pergunta *</Label>
              <Textarea
                value={form.question_text}
                onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                placeholder="Digite a pergunta..."
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label>Alternativas (mínimo 2)</Label>
              
              <div className="flex items-center gap-2">
                <Badge variant={form.correct_answer === 'A' ? 'default' : 'outline'}>A</Badge>
                <Input
                  value={form.option_a}
                  onChange={(e) => setForm({ ...form, option_a: e.target.value })}
                  placeholder="Alternativa A *"
                  className="flex-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={form.correct_answer === 'B' ? 'default' : 'outline'}>B</Badge>
                <Input
                  value={form.option_b}
                  onChange={(e) => setForm({ ...form, option_b: e.target.value })}
                  placeholder="Alternativa B *"
                  className="flex-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={form.correct_answer === 'C' ? 'default' : 'outline'}>C</Badge>
                <Input
                  value={form.option_c}
                  onChange={(e) => setForm({ ...form, option_c: e.target.value })}
                  placeholder="Alternativa C (opcional)"
                  className="flex-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={form.correct_answer === 'D' ? 'default' : 'outline'}>D</Badge>
                <Input
                  value={form.option_d}
                  onChange={(e) => setForm({ ...form, option_d: e.target.value })}
                  placeholder="Alternativa D (opcional)"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Resposta Correta</Label>
              <RadioGroup
                value={form.correct_answer}
                onValueChange={(value) => setForm({ ...form, correct_answer: value })}
                className="flex gap-4"
              >
                {['A', 'B', 'C', 'D'].map((letter) => (
                  <div key={letter} className="flex items-center space-x-2">
                    <RadioGroupItem value={letter} id={`option-${letter}`} />
                    <Label htmlFor={`option-${letter}`} className="cursor-pointer">
                      {letter}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveQuestion}>
              <Save className="h-4 w-4 mr-2" />
              {editingQuestion ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamQuestionsManagement;
