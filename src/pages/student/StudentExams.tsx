import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  FileText, ArrowLeft, CheckCircle2, Clock, Award,
  AlertCircle, Trophy, Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/I18nProvider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Exam {
  id: string;
  title: string;
  description: string;
  total_questions: number;
  passing_score: number;
  module_id: string;
  module_title: string;
  course_title: string;
  submission?: {
    score: number;
    passed: boolean;
    submitted_at: string;
  };
}

const StudentExams = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const loadExams = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      // Get enrolled courses
      const { data: enrollments } = await supabase
        .from("student_enrollments")
        .select("course_id")
        .eq("student_id", user.id)
        .eq("is_active", true);

      if (!enrollments || enrollments.length === 0) {
        setExams([]);
        setLoading(false);
        return;
      }

      const courseIds = enrollments.map(e => e.course_id);

      // Get modules for enrolled courses
      const { data: modules } = await supabase
        .from("modules")
        .select(`
          id,
          title,
          course_id,
          courses (title)
        `)
        .in("course_id", courseIds);

      if (!modules || modules.length === 0) {
        setExams([]);
        setLoading(false);
        return;
      }

      const moduleIds = modules.map(m => m.id);

      // Get exams
      const { data: examsData } = await supabase
        .from("exams")
        .select("*")
        .in("module_id", moduleIds);

      // Get submissions
      const { data: submissions } = await supabase
        .from("exam_submissions")
        .select("*")
        .eq("student_id", user.id);

      // Map exams with module info and submissions
      type ModuleItem = { id: string; title: string; course_id: string; courses?: { title: string } };
      const moduleItems = (modules || []) as ModuleItem[];

      type ModuleRow = { id: string; title: string; courses?: { title?: string } };
      const mappedExams: Exam[] = (examsData || []).map(exam => {
        const module = (modules as ModuleRow[]).find(m => m.id === exam.module_id);
        const submission = submissions?.find(s => s.exam_id === exam.id);

        return {
          ...exam,
          module_title: module?.title || "",
          course_title: module?.courses?.title || "",
          submission: submission ? {
            score: submission.score,
            passed: submission.passed,
            submitted_at: submission.submitted_at
          } : undefined
        };
      });

      setExams(mappedExams);
    } catch (error) {
      console.error("Error loading exams:", error);
      toast.error(t("dashboards.student.errors.exams_load", { defaultValue: "Erro ao carregar provas" }));
    } finally {
      setLoading(false);
    }
  }, [navigate, t]);

  const pendingExams = exams.filter(e => !e.submission);
  const completedExams = exams.filter(e => e.submission);
  const passedExams = completedExams.filter(e => e.submission?.passed);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground text-lg font-medium">{t("common.loading_exams", { defaultValue: "Carregando provas..." })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/student")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">{t("common.exams", { defaultValue: "Provas" })}</h1>
              <p className="text-sm text-muted-foreground">
                {passedExams.length} {t("common.of", { defaultValue: "de" })} {exams.length} {t("dashboards.student.exams_passed", { defaultValue: "provas aprovadas" })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{exams.length}</p>
              <p className="text-xs text-muted-foreground">{t("dashboards.student.total_exams", { defaultValue: "Total de Provas" })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold text-foreground">{pendingExams.length}</p>
              <p className="text-xs text-muted-foreground">{t("common.pending", { defaultValue: "Pendentes" })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold text-foreground">{passedExams.length}</p>
              <p className="text-xs text-muted-foreground">{t("common.approved", { defaultValue: "Aprovadas" })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">
                {completedExams.length > 0
                  ? Math.round(completedExams.reduce((acc, e) => acc + (e.submission?.score || 0), 0) / completedExams.length)
                  : 0}%
              </p>
              <p className="text-xs text-muted-foreground">{t("dashboards.student.overall_average", { defaultValue: "Média Geral" })}</p>
            </CardContent>
          </Card>
        </div>

        {exams.length === 0 ? (
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                {t("dashboards.student.no_exams", { defaultValue: "Nenhuma prova disponível" })}
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                {t("dashboards.student.no_exams_desc", { defaultValue: "Complete as aulas dos módulos para desbloquear as provas" })}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="pending">
            <TabsList className="mb-6">
              <TabsTrigger value="pending">
                {t("common.pending", { defaultValue: "Pendentes" })} ({pendingExams.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                {t("common.realized", { defaultValue: "Realizadas" })} ({completedExams.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <div className="space-y-4">
                {pendingExams.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success" />
                      <p className="text-foreground font-semibold">{t("dashboards.student.all_exams_done", { defaultValue: "Todas as provas foram realizadas!" })}</p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingExams.map((exam) => (
                    <Card key={exam.id} className="hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {exam.course_title}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {exam.module_title}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-foreground">
                                {exam.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {exam.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>{exam.total_questions} {t("common.questions", { defaultValue: "questões" })}</span>
                                <span>{t("common.minimum", { defaultValue: "Mínimo" })}: {exam.passing_score}%</span>
                              </div>
                            </div>
                          </div>
                          <Button onClick={() => navigate(`/exam/${exam.id}`)}>
                            {t("dashboards.student.start_exam", { defaultValue: "Iniciar Prova" })}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="space-y-4">
                {completedExams.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-foreground font-semibold">{t("dashboards.student.no_completed_exams", { defaultValue: "Nenhuma prova realizada ainda" })}</p>
                    </CardContent>
                  </Card>
                ) : (
                  completedExams.map((exam) => (
                    <Card key={exam.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${exam.submission?.passed
                                ? "bg-success/20 text-success"
                                : "bg-destructive/20 text-destructive"
                              }`}>
                              {exam.submission?.passed ? (
                                <Trophy className="h-6 w-6" />
                              ) : (
                                <AlertCircle className="h-6 w-6" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {exam.course_title}
                                </Badge>
                                <Badge
                                  variant={exam.submission?.passed ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {exam.submission?.passed
                                    ? t("common.approved", { defaultValue: "Aprovado" })
                                    : t("common.failed", { defaultValue: "Reprovado" })}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-foreground">
                                {exam.title}
                              </h3>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="font-bold text-foreground">
                                  {t("common.grade", { defaultValue: "Nota" })}: {exam.submission?.score}%
                                </span>
                                <span className="text-muted-foreground">
                                  {t("common.minimum", { defaultValue: "Mínimo" })}: {exam.passing_score}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => navigate(`/exam-result/${exam.id}`)}
                            >
                              {t("dashboards.student.view_result", { defaultValue: "Ver Resultado" })}
                            </Button>
                            {!exam.submission?.passed && (
                              <Button onClick={() => navigate(`/exam/${exam.id}`)}>
                                {t("common.retake", { defaultValue: "Refazer" })}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default StudentExams;
