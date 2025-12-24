import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Search, Edit, Trash2, FileQuestion, ListChecks } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useI18n } from "@/i18n/I18nProvider";

interface Exam {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  total_questions: number;
  passing_score: number;
  exam_type: string;
  created_at: string;
  questions_count?: number;
}

interface Module {
  id: string;
  title: string;
  course_id: string;
}

interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  correct_answer: string | null;
  order_index: number;
}

const ExamsManagement = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const { toast } = useToast();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [userName, setUserName] = useState("");
  const [currentModule, setCurrentModule] = useState<Module | null>(null);

  const [examFormData, setExamFormData] = useState({
    title: "",
    description: "",
    total_questions: 10,
    passing_score: 70,
    exam_type: "multiple_choice",
    module_id: moduleId || ""
  });

  const [questionFormData, setQuestionFormData] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
    order_index: 1
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, [moduleId]);

  const checkAuthAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (profile) {
      setUserName(profile.full_name);
    }

    if (moduleId) {
      const { data: module } = await supabase
        .from("modules")
        .select("*")
        .eq("id", moduleId)
        .single();
      
      if (module) {
        setCurrentModule(module);
        setExamFormData(prev => ({ ...prev, module_id: moduleId }));
      }
    }

    await loadModules();
    await loadExams();
  };

  const loadModules = async () => {
    const { data } = await supabase
      .from("modules")
      .select("id, title, course_id")
      .order("title");
    
    setModules(data || []);
  };

  const loadExams = async () => {
    setLoading(true);
    
    let query = supabase.from("exams").select("*").order("created_at", { ascending: false });
    
    if (moduleId) {
      query = query.eq("module_id", moduleId);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: t("exams_title"), description: "Erro ao carregar", variant: "destructive" });
    } else {
      // Load question counts for each exam
      const examsWithCounts = await Promise.all(
        (data || []).map(async (exam) => {
          const { count } = await supabase
            .from("exam_questions")
            .select("*", { count: "exact", head: true })
            .eq("exam_id", exam.id);
          
          return { ...exam, questions_count: count || 0 };
        })
      );
      setExams(examsWithCounts);
    }
    
    setLoading(false);
  };

  const loadQuestions = async (examId: string) => {
    const { data } = await supabase
      .from("exam_questions")
      .select("*")
      .eq("exam_id", examId)
      .order("order_index");
    
    setQuestions(data || []);
  };

  const handleCreateExam = async () => {
    if (!examFormData.title || !examFormData.module_id) {
      toast({ title: t("exams_title"), description: "Preencha o título e selecione um módulo", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("exams").insert({
      title: examFormData.title,
      description: examFormData.description || null,
      total_questions: examFormData.total_questions,
      passing_score: examFormData.passing_score,
      exam_type: examFormData.exam_type as any,
      module_id: examFormData.module_id
    });

    if (error) {
      toast({ title: t("exams_title"), description: "Erro ao criar", variant: "destructive" });
    } else {
      toast({ title: t("exams_title"), description: "Criada com sucesso!" });
      setIsExamDialogOpen(false);
      resetExamForm();
      loadExams();
    }
  };

  const handleUpdateExam = async () => {
    if (!editingExam) return;

    const { error } = await supabase
      .from("exams")
      .update({
        title: examFormData.title,
        description: examFormData.description || null,
        total_questions: examFormData.total_questions,
        passing_score: examFormData.passing_score,
        exam_type: examFormData.exam_type as any
      })
      .eq("id", editingExam.id);

    if (error) {
      toast({ title: t("exams_title"), description: "Erro ao atualizar", variant: "destructive" });
    } else {
      toast({ title: t("exams_title"), description: "Atualizada com sucesso!" });
      setIsExamDialogOpen(false);
      resetExamForm();
      loadExams();
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta prova?")) return;

    const { error } = await supabase.from("exams").delete().eq("id", examId);

    if (error) {
      toast({ title: t("exams_title"), description: "Erro ao excluir", variant: "destructive" });
    } else {
      toast({ title: t("exams_title"), description: "Excluída com sucesso!" });
      loadExams();
    }
  };

  const handleCreateQuestion = async () => {
    if (!selectedExam || !questionFormData.question_text) {
      toast({ title: "Questão", description: "Preencha a questão", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("exam_questions").insert({
      exam_id: selectedExam.id,
      question_text: questionFormData.question_text,
      option_a: questionFormData.option_a,
      option_b: questionFormData.option_b,
      option_c: questionFormData.option_c,
      option_d: questionFormData.option_d,
      correct_answer: questionFormData.correct_answer,
      order_index: questions.length + 1
    });

    if (error) {
      toast({ title: "Questão", description: "Erro ao criar", variant: "destructive" });
    } else {
      toast({ title: "Questão", description: "Adicionada com sucesso!" });
      setIsQuestionDialogOpen(false);
      resetQuestionForm();
      loadQuestions(selectedExam.id);
      loadExams();
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    const { error } = await supabase
      .from("exam_questions")
      .update({
        question_text: questionFormData.question_text,
        option_a: questionFormData.option_a,
        option_b: questionFormData.option_b,
        option_c: questionFormData.option_c,
        option_d: questionFormData.option_d,
        correct_answer: questionFormData.correct_answer
      })
      .eq("id", editingQuestion.id);

    if (error) {
      toast({ title: "Questão", description: "Erro ao atualizar", variant: "destructive" });
    } else {
      toast({ title: "Questão", description: "Atualizada com sucesso!" });
      setIsQuestionDialogOpen(false);
      resetQuestionForm();
      if (selectedExam) loadQuestions(selectedExam.id);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Excluir esta questão?")) return;

    const { error } = await supabase.from("exam_questions").delete().eq("id", questionId);

    if (error) {
      toast({ title: "Questão", description: "Erro ao excluir", variant: "destructive" });
    } else {
      toast({ title: "Questão", description: "Excluída com sucesso!" });
      if (selectedExam) loadQuestions(selectedExam.id);
      loadExams();
    }
  };

  const resetExamForm = () => {
    setExamFormData({
      title: "",
      description: "",
      total_questions: 10,
      passing_score: 70,
      exam_type: "multiple_choice",
      module_id: moduleId || ""
    });
    setEditingExam(null);
  };

  const resetQuestionForm = () => {
    setQuestionFormData({
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "A",
      order_index: 1
    });
    setEditingQuestion(null);
  };

  const openEditExamDialog = (exam: Exam) => {
    setEditingExam(exam);
    setExamFormData({
      title: exam.title,
      description: exam.description || "",
      total_questions: exam.total_questions,
      passing_score: exam.passing_score,
      exam_type: exam.exam_type,
      module_id: exam.module_id
    });
    setIsExamDialogOpen(true);
  };

  const openQuestionsView = (exam: Exam) => {
    setSelectedExam(exam);
    loadQuestions(exam.id);
  };

  const openEditQuestionDialog = (question: Question) => {
    setEditingQuestion(question);
    setQuestionFormData({
      question_text: question.question_text,
      option_a: question.option_a || "",
      option_b: question.option_b || "",
      option_c: question.option_c || "",
      option_d: question.option_d || "",
      correct_answer: question.correct_answer || "A",
      order_index: question.order_index
    });
    setIsQuestionDialogOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const filteredExams = exams.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName={userName} userRole="admin" onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("back")}
        </Button>

        {selectedExam ? (
          // Questions View
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <Button variant="ghost" onClick={() => setSelectedExam(null)} className="mb-2">
                  <ArrowLeft className="mr-2 h-4 w-4" /> {t("exams_title")}
                </Button>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-6 w-6" />
                  {`Questões: ${selectedExam.title}`}
                </CardTitle>
              </div>
              <Dialog open={isQuestionDialogOpen} onOpenChange={(open) => { setIsQuestionDialogOpen(open); if (!open) resetQuestionForm(); }}>
                <DialogTrigger asChild>
                  <Button className="bg-primary">
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Questão
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingQuestion ? "Editar Questão" : "Adicionar Questão"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                        <Label>Pergunta *</Label>
                        <Textarea
                          value={questionFormData.question_text}
                          onChange={(e) => setQuestionFormData({ ...questionFormData, question_text: e.target.value })}
                          placeholder="Digite a pergunta..."
                          rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Opção A</Label>
                        <Input
                          value={questionFormData.option_a}
                          onChange={(e) => setQuestionFormData({ ...questionFormData, option_a: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Opção B</Label>
                        <Input
                          value={questionFormData.option_b}
                          onChange={(e) => setQuestionFormData({ ...questionFormData, option_b: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Opção C</Label>
                        <Input
                          value={questionFormData.option_c}
                          onChange={(e) => setQuestionFormData({ ...questionFormData, option_c: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Opção D</Label>
                        <Input
                          value={questionFormData.option_d}
                          onChange={(e) => setQuestionFormData({ ...questionFormData, option_d: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Resposta Correta</Label>
                      <Select
                        value={questionFormData.correct_answer}
                        onValueChange={(value) => setQuestionFormData({ ...questionFormData, correct_answer: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Opção A</SelectItem>
                          <SelectItem value="B">Opção B</SelectItem>
                          <SelectItem value="C">Opção C</SelectItem>
                          <SelectItem value="D">Opção D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
                      className="w-full"
                    >
                      {editingQuestion ? t("save") : "Adicionar Questão"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma questão cadastrada. Adicione questões para esta prova.
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={question.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium mb-2">
                              <span className="text-primary">{index + 1}.</span> {question.question_text}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <p className={question.correct_answer === "A" ? "text-green-600 font-medium" : ""}>
                                A) {question.option_a}
                              </p>
                              <p className={question.correct_answer === "B" ? "text-green-600 font-medium" : ""}>
                                B) {question.option_b}
                              </p>
                              <p className={question.correct_answer === "C" ? "text-green-600 font-medium" : ""}>
                                C) {question.option_c}
                              </p>
                              <p className={question.correct_answer === "D" ? "text-green-600 font-medium" : ""}>
                                D) {question.option_d}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditQuestionDialog(question)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteQuestion(question.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          // Exams List
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileQuestion className="h-6 w-6" />
                {currentModule ? `${t("exams_title")}: ${currentModule.title}` : t("exams_title")}
              </CardTitle>
              <Dialog open={isExamDialogOpen} onOpenChange={(open) => { setIsExamDialogOpen(open); if (!open) resetExamForm(); }}>
                <DialogTrigger asChild>
                  <Button className="bg-primary">
                    <Plus className="mr-2 h-4 w-4" /> {t("exams_title")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingExam ? "Editar Prova" : t("exams_title")}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Título *</Label>
                      <Input
                        value={examFormData.title}
                        onChange={(e) => setExamFormData({ ...examFormData, title: e.target.value })}
                        placeholder="Título da prova"
                      />
                    </div>
                    {!moduleId && (
                      <div>
                        <Label>Módulo *</Label>
                        <Select
                          value={examFormData.module_id}
                          onValueChange={(value) => setExamFormData({ ...examFormData, module_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o módulo" />
                          </SelectTrigger>
                          <SelectContent>
                            {modules.map((m) => (
                              <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={examFormData.description}
                        onChange={(e) => setExamFormData({ ...examFormData, description: e.target.value })}
                        placeholder="Descrição da prova..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Total de Questões</Label>
                        <Input
                          type="number"
                          value={examFormData.total_questions}
                          onChange={(e) => setExamFormData({ ...examFormData, total_questions: parseInt(e.target.value) || 10 })}
                        />
                      </div>
                      <div>
                        <Label>Nota Mínima (%)</Label>
                        <Input
                          type="number"
                          value={examFormData.passing_score}
                          onChange={(e) => setExamFormData({ ...examFormData, passing_score: parseInt(e.target.value) || 70 })}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={editingExam ? handleUpdateExam : handleCreateExam}
                      className="w-full"
                    >
                      {editingExam ? "Salvar Alterações" : "Criar Prova"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar provas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : filteredExams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma prova encontrada
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Questões</TableHead>
                      <TableHead>Nota Mínima</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.title}</TableCell>
                        <TableCell>
                          <Badge variant={exam.questions_count === exam.total_questions ? "default" : "secondary"}>
                            {exam.questions_count}/{exam.total_questions}
                          </Badge>
                        </TableCell>
                        <TableCell>{exam.passing_score}%</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openQuestionsView(exam)}>
                              <ListChecks className="h-4 w-4 mr-1" /> Questões
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openEditExamDialog(exam)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteExam(exam.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ExamsManagement;
