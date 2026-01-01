import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  GraduationCap, Users, BookOpen, DollarSign, Settings,
  TrendingUp, UserPlus, FileText, Calendar
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/i18n/I18nProvider";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    activeEnrollments: 0,
    pendingPayments: 0,
  });
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadStats();
    setLoading(false);
  }, []);

  const loadStats = async () => {
    try {
      // Fallback to Supabase
      const { count: studentsCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: coursesCount } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true });

      const { count: enrollmentsCount } = await supabase
        .from("student_enrollments")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      const { count: paymentsCount } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      setStats({
        totalStudents: studentsCount || 0,
        totalCourses: coursesCount || 0,
        activeEnrollments: enrollmentsCount || 0,
        pendingPayments: paymentsCount || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const testConnection = async () => {
    if (testing) return;
    setTesting(true);
    try {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      const sessionOk = !!sessionData.session && !sessionErr;

      const { data: courses, error: coursesErr } = await supabase
        .from("courses")
        .select("id")
        .limit(1);

      if (sessionErr) throw sessionErr;
      if (coursesErr) throw coursesErr;

      toast.success(t("dashboards.admin.connection_ok", {
        defaultValue: "Conexão OK. Sessão: {{status}}. Cursos: {{count}}",
        status: sessionOk ? t("common.active") : t("common.inactive"),
        count: courses?.length ?? 0
      }));
    } catch (error: any) {
      console.error("Teste de conexão falhou:", error);
      toast.error(t("dashboards.admin.connection_failed", {
        defaultValue: "Falha na conexão: {{error}}",
        error: error.message || t("common.unknown_error")
      }));
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-primary-foreground text-lg font-medium">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: t("dashboards.admin.stats.total_students", { defaultValue: "Total de Alunos" }),
      value: stats.totalStudents,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: t("dashboards.admin.stats.active_courses", { defaultValue: "Cursos Ativos" }),
      value: stats.totalCourses,
      icon: BookOpen,
      color: "text-accent",
      bgColor: "bg-accent/10",
      trend: "+2",
      trendUp: true,
    },
    {
      title: t("dashboards.admin.stats.active_enrollments", { defaultValue: "Matrículas Ativas" }),
      value: stats.activeEnrollments,
      icon: GraduationCap,
      color: "text-success",
      bgColor: "bg-success/10",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: t("dashboards.admin.stats.pending_payments", { defaultValue: "Pagamentos Pendentes" }),
      value: stats.pendingPayments,
      icon: DollarSign,
      color: "text-warning",
      bgColor: "bg-warning/10",
      trend: "-5%",
      trendUp: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t("dashboards.admin.title", { defaultValue: "Dashboard" })}</h1>
          <p className="text-muted-foreground">{t("dashboards.admin.overview", { defaultValue: "Visão geral da plataforma" })}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline capitalize">
              {new Date().toLocaleDateString(language, { month: 'long', year: 'numeric' })}
            </span>
          </Button>
          <Button variant="outline" className="gap-2" onClick={testConnection} disabled={testing}>
            {testing ? t("dashboards.admin.testing", { defaultValue: "Testando..." }) : t("dashboards.admin.test_connection", { defaultValue: "Testar Conexão" })}
          </Button>
          <Button className="bg-gradient-primary gap-2" onClick={() => navigate("/admin/alunos")}>
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("dashboards.admin.students.new", { defaultValue: "Novo Aluno" })}</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-border/50 card-hover">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={`${stat.bgColor} rounded-xl p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs ${stat.trendUp ? 'text-success' : 'text-destructive'}`}>
                  <TrendingUp className={`h-3 w-3 ${!stat.trendUp && 'rotate-180'}`} />
                  {stat.trend}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Management Tabs */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary rounded-xl p-2.5">
              <Settings className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">{t("dashboards.admin.management_title", { defaultValue: "Gestão Acadêmica" })}</CardTitle>
              <CardDescription>{t("dashboards.admin.management_desc", { defaultValue: "Acesso rápido às principais áreas administrativas" })}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="alunos" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="alunos" className="gap-2" onClick={() => navigate("/admin/alunos")}>
                <Users className="h-4 w-4" />
                {t("common.students")}
              </TabsTrigger>
              <TabsTrigger value="cursos" className="gap-2" onClick={() => navigate("/admin/cursos")}>
                <BookOpen className="h-4 w-4" />
                {t("nav.courses")}
              </TabsTrigger>
              <TabsTrigger value="matriculas" className="gap-2" onClick={() => navigate("/admin/matriculas")}>
                <GraduationCap className="h-4 w-4" />
                {t("dashboards.admin.enrollments")}
              </TabsTrigger>
              <TabsTrigger value="relatorios" className="gap-2" onClick={() => navigate("/admin/relatorios")}>
                <FileText className="h-4 w-4" />
                {t("nav.reports")}
              </TabsTrigger>
              <TabsTrigger value="financeiro" className="gap-2" onClick={() => navigate("/admin/financeiro")}>
                <DollarSign className="h-4 w-4" />
                {t("nav.financial")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="alunos" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {t("dashboards.admin.students_management", { defaultValue: "Gestão de Alunos" })}
                </h3>
                <Button className="bg-gradient-primary gap-2" onClick={() => navigate("/admin/alunos")}>
                  <UserPlus className="h-4 w-4" />
                  {t("dashboards.admin.new_student", { defaultValue: "Novo Aluno" })}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="cursos" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-accent" />
                  {t("dashboards.admin.courses_management", { defaultValue: "Gestão de Cursos" })}
                </h3>
                <Button className="bg-gradient-primary gap-2" onClick={() => navigate("/admin/cursos")}>
                  <BookOpen className="h-4 w-4" />
                  {t("dashboards.admin.new_course", { defaultValue: "Novo Curso" })}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="matriculas" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-success" />
                  {t("dashboards.admin.enrollment_management", { defaultValue: "Gestão de Matrículas" })}
                </h3>
                <Button className="bg-gradient-primary gap-2" onClick={() => navigate("/admin/matriculas")}>
                  <GraduationCap className="h-4 w-4" />
                  {t("dashboards.admin.new_enrollment", { defaultValue: "Nova Matrícula" })}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="relatorios" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-info" />
                  {t("dashboards.admin.reports_management", { defaultValue: "Gestão de Relatórios" })}
                </h3>
                <Button className="bg-gradient-primary gap-2" onClick={() => navigate("/admin/relatorios")}>
                  <FileText className="h-4 w-4" />
                  {t("dashboards.admin.generate_report", { defaultValue: "Gerar Relatório" })}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="financeiro" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-warning" />
                  {t("dashboards.admin.financial_management", { defaultValue: "Gestão Financeira" })}
                </h3>
                <Button className="bg-gradient-primary gap-2" onClick={() => navigate("/admin/financeiro")}>
                  <DollarSign className="h-4 w-4" />
                  {t("dashboards.admin.new_transaction", { defaultValue: "Novo Lançamento" })}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
