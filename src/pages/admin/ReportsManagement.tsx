import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BarChart3, Users, BookOpen, GraduationCap, TrendingUp, Download, FileText, DollarSign } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useI18n } from "@/i18n/I18nProvider";

interface ReportStats {
  totalStudents: number;
  activeStudents: number;
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  completionRate: number;
  totalRevenue: number;
  pendingPayments: number;
}

interface CourseReport {
  id: string;
  title: string;
  enrollments: number;
  completions: number;
  revenue: number;
}

const ReportsManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState<ReportStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalEnrollments: 0,
    completionRate: 0,
    totalRevenue: 0,
    pendingPayments: 0
  });
  const [courseReports, setCourseReports] = useState<CourseReport[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

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

    await loadAllStats();
    setLoading(false);
  };

  const loadAllStats = async () => {
    // Load students count
    const { data: studentRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "student");

    const studentIds = studentRoles?.map(r => r.user_id) || [];

    const { data: activeProfiles } = await supabase
      .from("profiles")
      .select("id")
      .in("id", studentIds)
      .eq("is_active", true);

    // Load courses
    const { data: courses } = await supabase
      .from("courses")
      .select("*");

    const { data: activeCourses } = await supabase
      .from("courses")
      .select("id")
      .eq("is_active", true);

    // Load enrollments
    const { data: enrollments } = await supabase
      .from("student_enrollments")
      .select("*");

    // Load payments
    const { data: payments } = await supabase
      .from("payments")
      .select("amount, status");

    const totalRevenue = payments?.filter(p => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const pendingPayments = payments?.filter(p => p.status === "pending" || p.status === "overdue").reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // Load certificates issued for completion rate
    const { data: certificates } = await supabase
      .from("issued_certificates")
      .select("id");

    const completionRate = enrollments && enrollments.length > 0
      ? Math.round(((certificates?.length || 0) / enrollments.length) * 100)
      : 0;

    setStats({
      totalStudents: studentIds.length,
      activeStudents: activeProfiles?.length || 0,
      totalCourses: courses?.length || 0,
      activeCourses: activeCourses?.length || 0,
      totalEnrollments: enrollments?.length || 0,
      completionRate,
      totalRevenue,
      pendingPayments
    });

    // Load course reports
    if (courses) {
      const courseData: CourseReport[] = await Promise.all(
        courses.map(async (course) => {
          const { data: courseEnrollments } = await supabase
            .from("student_enrollments")
            .select("id")
            .eq("course_id", course.id);

          const { data: courseCerts } = await supabase
            .from("issued_certificates")
            .select("id")
            .eq("course_id", course.id);

          const { data: coursePayments } = await supabase
            .from("payments")
            .select("amount")
            .eq("course_id", course.id)
            .eq("status", "paid");

          const revenue = coursePayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

          return {
            id: course.id,
            title: course.title,
            enrollments: courseEnrollments?.length || 0,
            completions: courseCerts?.length || 0,
            revenue
          };
        })
      );

      setCourseReports(courseData.sort((a, b) => b.enrollments - a.enrollments));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const handleExportCSV = (type: string) => {
    let csvContent = "";
    let filename = "";

    if (type === "courses") {
      csvContent = "Curso,Matrículas,Conclusões,Receita\n";
      courseReports.forEach(course => {
        csvContent += `"${course.title}",${course.enrollments},${course.completions},${course.revenue}\n`;
      });
      filename = "relatorio_cursos.csv";
    } else if (type === "summary") {
      csvContent = "Métrica,Valor\n";
      csvContent += `Total de Alunos,${stats.totalStudents}\n`;
      csvContent += `Alunos Ativos,${stats.activeStudents}\n`;
      csvContent += `Total de Cursos,${stats.totalCourses}\n`;
      csvContent += `Cursos Ativos,${stats.activeCourses}\n`;
      csvContent += `Total de Matrículas,${stats.totalEnrollments}\n`;
      csvContent += `Taxa de Conclusão,${stats.completionRate}%\n`;
      csvContent += `Receita Total,${stats.totalRevenue}\n`;
      csvContent += `Pagamentos Pendentes,${stats.pendingPayments}\n`;
      filename = "relatorio_geral.csv";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    toast({ title: "Relatório exportado com sucesso!" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName={userName} userRole="admin" onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              {t("reports_title")}
            </h1>
            <p className="text-muted-foreground mt-1">Visão geral do desempenho da plataforma</p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("period")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("period_all")}</SelectItem>
              <SelectItem value="month">{t("period_month")}</SelectItem>
              <SelectItem value="quarter">{t("period_quarter")}</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Alunos</p>
                  <p className="text-3xl font-bold">{stats.totalStudents}</p>
                  <p className="text-xs text-muted-foreground">{stats.activeStudents} ativos</p>
                </div>
                <Users className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cursos Disponíveis</p>
                  <p className="text-3xl font-bold">{stats.totalCourses}</p>
                  <p className="text-xs text-muted-foreground">{stats.activeCourses} ativos</p>
                </div>
                <BookOpen className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                  <p className="text-3xl font-bold">{stats.completionRate}%</p>
                  <p className="text-xs text-muted-foreground">{stats.totalEnrollments} matrículas</p>
                </div>
                <GraduationCap className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(stats.pendingPayments)} pendentes</p>
                </div>
                <DollarSign className="h-10 w-10 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">Por Curso</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="academic">Acadêmico</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Desempenho por Curso</CardTitle>
                  <CardDescription>Matrículas, conclusões e receita por curso</CardDescription>
                </div>
                <Button variant="outline" onClick={() => handleExportCSV("courses")}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courseReports.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhum curso cadastrado</p>
                  ) : (
                    courseReports.map((course, index) => (
                      <div key={course.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>{course.enrollments} matrículas</span>
                              <span>{course.completions} conclusões</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(course.revenue)}</p>
                          <p className="text-sm text-muted-foreground">
                            {course.enrollments > 0 ? Math.round((course.completions / course.enrollments) * 100) : 0}% conclusão
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Relatório Financeiro</CardTitle>
                  <CardDescription>Resumo de receitas e pagamentos</CardDescription>
                </div>
                <Button variant="outline" onClick={() => handleExportCSV("summary")}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Receitas
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <span>Total Recebido</span>
                        <span className="font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-amber-500" />
                      Pendências
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                        <span>Pagamentos Pendentes</span>
                        <span className="font-bold text-amber-600">{formatCurrency(stats.pendingPayments)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic">
            <Card>
              <CardHeader>
                <CardTitle>Relatório Acadêmico</CardTitle>
                <CardDescription>Indicadores de desempenho acadêmico</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-muted/30 rounded-lg">
                    <Users className="h-12 w-12 mx-auto text-blue-500 mb-2" />
                    <p className="text-3xl font-bold">{stats.totalStudents}</p>
                    <p className="text-sm text-muted-foreground">Alunos Cadastrados</p>
                  </div>
                  <div className="text-center p-6 bg-muted/30 rounded-lg">
                    <BookOpen className="h-12 w-12 mx-auto text-purple-500 mb-2" />
                    <p className="text-3xl font-bold">{stats.totalEnrollments}</p>
                    <p className="text-sm text-muted-foreground">Matrículas Ativas</p>
                  </div>
                  <div className="text-center p-6 bg-muted/30 rounded-lg">
                    <GraduationCap className="h-12 w-12 mx-auto text-green-500 mb-2" />
                    <p className="text-3xl font-bold">{stats.completionRate}%</p>
                    <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ReportsManagement;
