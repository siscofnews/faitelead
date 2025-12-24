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
  const { t } = useI18n();
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
      // Try to load from backend API first
      try {
        const response = await fetch('http://localhost:8090/stats/admin-dashboard');
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalStudents: data.total_students || 0,
            totalCourses: data.total_courses || 0,
            activeEnrollments: data.active_enrollments || 0,
            pendingPayments: data.pending_payments || 0,
          });
          return;
        }
      } catch (backendError) {
        console.log('Backend API not available, falling back to Supabase');
      }

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

      toast.success(`Conexão OK. Sessão: ${sessionOk ? "ativa" : "inativa"}. Cursos: ${courses?.length ?? 0}`);
    } catch (error: any) {
      console.error("Teste de conexão falhou:", error);
      toast.error(`Falha na conexão: ${error.message || "Erro desconhecido"}`);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-primary-foreground text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total de Alunos",
      value: stats.totalStudents,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Cursos Ativos",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "text-accent",
      bgColor: "bg-accent/10",
      trend: "+2",
      trendUp: true,
    },
    {
      title: "Matrículas Ativas",
      value: stats.activeEnrollments,
      icon: GraduationCap,
      color: "text-success",
      bgColor: "bg-success/10",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Pagamentos Pendentes",
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
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da plataforma</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Dezembro 2024</span>
          </Button>
          <Button variant="outline" className="gap-2" onClick={testConnection} disabled={testing}>
            {testing ? "Testando..." : "Testar Conexão"}
          </Button>
          <Button className="bg-gradient-primary gap-2" onClick={() => navigate("/admin/alunos")}>
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Aluno</span>
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
              <CardTitle className="text-xl">Gestão Acadêmica</CardTitle>
              <CardDescription>Acesso rápido às principais áreas administrativas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="alunos" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="alunos" className="gap-2" onClick={() => navigate("/admin/alunos")}>
                <Users className="h-4 w-4" />
                Alunos
              </TabsTrigger>
              <TabsTrigger value="cursos" className="gap-2" onClick={() => navigate("/admin/cursos")}>
                <BookOpen className="h-4 w-4" />
                Cursos
              </TabsTrigger>
              <TabsTrigger value="matriculas" className="gap-2" onClick={() => navigate("/admin/matriculas")}>
                <GraduationCap className="h-4 w-4" />
                Matrículas
              </TabsTrigger>
              <TabsTrigger value="relatorios" className="gap-2" onClick={() => navigate("/admin/relatorios")}>
                <FileText className="h-4 w-4" />
                Relatórios
              </TabsTrigger>
              <TabsTrigger value="financeiro" className="gap-2" onClick={() => navigate("/admin/financeiro")}>
                <DollarSign className="h-4 w-4" />
                Financeiro
              </TabsTrigger>
            </TabsList>

            <TabsContent value="alunos" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Gestão de Alunos
                </h3>
                <Button className="bg-gradient-primary gap-2" onClick={() => navigate("/admin/alunos")}>
                  <UserPlus className="h-4 w-4" />
                  Novo Aluno
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="cursos" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-accent" />
                  Gestão de Cursos
                </h3>
                <Button className="bg-gradient-primary gap-2" onClick={() => navigate("/admin/cursos")}>
                  <BookOpen className="h-4 w-4" />
                  Novo Curso
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="matriculas" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-success" />
                  Gestão de Matrículas
                </h3>
                <Button className="bg-gradient-primary gap-2" onClick={() => navigate("/admin/matriculas")}>
                  <GraduationCap className="h-4 w-4" />
                  Nova Matrícula
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="relatorios" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-info" />
                  {t("reports_title")}
                </h3>
                <Button className="bg-gradient-primary gap-2" onClick={() => navigate("/admin/relatorios")}>
                  <FileText className="h-4 w-4" />
                  {t("generate_report")}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="financeiro" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-warning" />
                  Gestão Financeira
                </h3>
                <Button className="bg-gradient-primary gap-2" onClick={() => navigate("/admin/financeiro")}>
                  <DollarSign className="h-4 w-4" />
                  Novo Lançamento
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
