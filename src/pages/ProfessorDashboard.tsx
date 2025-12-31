import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Home, BookOpen, Users, FileText, MessageSquare,
  Calendar, Award, Upload, BarChart3, Settings,
  ChevronRight, Plus, Bell, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/i18n/I18nProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProfessorDashboard = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    totalStudents: 0,
    coursesTeaching: 0,
    pendingGrades: 0,
    forumPosts: 0
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      // Verificar role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!roleData || (roleData.role !== "teacher" && roleData.role !== "admin" && roleData.role !== "super_admin")) {
        toast.error(t("auth.access_denied_teacher", { defaultValue: "Acesso negado. Você não é um professor." }));
        navigate("/auth");
        return;
      }

      // Buscar perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      setUserName(profile?.full_name || t("common.professor", { defaultValue: "Professor" }));

      // Carregar estatísticas (mock por enquanto)
      setStats({
        totalStudents: 45,
        coursesTeaching: 3,
        pendingGrades: 12,
        forumPosts: 8
      });

      setLoading(false);
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/auth");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { icon: BookOpen, label: t("dashboards.professor.my_classes", { defaultValue: "Minhas Turmas" }), href: "/professor/turmas", badge: stats.coursesTeaching },
    { icon: Users, label: t("dashboards.professor.my_students", { defaultValue: "Meus Alunos" }), href: "/professor/alunos", badge: stats.totalStudents },
    { icon: Upload, label: t("dashboards.professor.upload_lessons", { defaultValue: "Upload de Aulas" }), href: "/professor/upload" },
    { icon: FileText, label: t("dashboards.professor.post_grades", { defaultValue: "Lançar Notas" }), href: "/professor/notas", badge: stats.pendingGrades },
    { icon: MessageSquare, label: t("dashboards.professor.forum", { defaultValue: "Fórum" }), href: "/professor/forum", badge: stats.forumPosts },
    { icon: Calendar, label: t("dashboards.professor.schedule", { defaultValue: "Agenda" }), href: "/professor/agenda" },
    { icon: BarChart3, label: t("dashboards.professor.reports", { defaultValue: "Relatórios" }), href: "/professor/relatorios" },
  ];

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
              <h1 className="text-xl font-display font-bold">{t("dashboards.professor.title", { defaultValue: "Portal do Professor" })}</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{userName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t("common.my_account", { defaultValue: "Minha Conta" })}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    {t("common.settings", { defaultValue: "Configurações" })}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("common.logout", { defaultValue: "Sair" })}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold">
                  {t("common.welcome")}, {userName.split(" ")[0]}! 👋
                </h2>
                <p className="text-muted-foreground mt-1">
                  {t("dashboards.professor.pending_grades_msg", { defaultValue: "Você tem {{count}} notas pendentes para lançar", count: stats.pendingGrades })}
                </p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("dashboards.professor.new_lesson", { defaultValue: "Nova Aula" })}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-3xl font-display font-bold">{stats.totalStudents}</p>
              <p className="text-sm text-muted-foreground">{t("common.students", { defaultValue: "Alunos" })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-accent mb-2" />
              <p className="text-3xl font-display font-bold">{stats.coursesTeaching}</p>
              <p className="text-sm text-muted-foreground">{t("common.classes", { defaultValue: "Turmas" })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto text-warning mb-2" />
              <p className="text-3xl font-display font-bold">{stats.pendingGrades}</p>
              <p className="text-sm text-muted-foreground">{t("dashboards.professor.pending_grades", { defaultValue: "Notas Pendentes" })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto text-success mb-2" />
              <p className="text-3xl font-display font-bold">{stats.forumPosts}</p>
              <p className="text-sm text-muted-foreground">{t("dashboards.professor.forum_posts", { defaultValue: "Posts no Fórum" })}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Card
              key={item.label}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => toast.info("Funcionalidade em desenvolvimento")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.label}</p>
                    {item.badge !== undefined && (
                      <p className="text-sm text-muted-foreground">{item.badge} {t("common.items", { defaultValue: "itens" })}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboards.professor.upcoming_live_lessons", { defaultValue: "Próximas Aulas ao Vivo" })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "Teologia Sistemática I", time: "Hoje, 19:00", students: 25 },
                { title: "Hermenêutica Bíblica", time: "Amanhã, 14:00", students: 18 },
                { title: "História da Igreja", time: "Quinta, 19:00", students: 32 },
              ].map((aula, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{aula.title}</p>
                    <p className="text-sm text-muted-foreground">{aula.time}</p>
                  </div>
                  <Badge variant="outline">{aula.students} {t("common.students", { defaultValue: "alunos" })}</Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full">{t("common.view_all", { defaultValue: "Ver Todas" })}</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("dashboards.professor.latest_forum_activities", { defaultValue: "Últimas Atividades do Fórum" })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { topic: "Dúvida sobre Cristologia", author: "João Silva", time: "há 2h" },
                { topic: "Material complementar", author: "Maria Santos", time: "há 5h" },
                { topic: "Questão sobre prova", author: "Pedro Oliveira", time: "há 1 dia" },
              ].map((post, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{post.topic}</p>
                    <p className="text-sm text-muted-foreground">{post.author} • {post.time}</p>
                  </div>
                  <Button variant="ghost" size="sm">{t("common.reply", { defaultValue: "Responder" })}</Button>
                </div>
              ))}
              <Button variant="outline" className="w-full">{t("common.view_forum", { defaultValue: "Ver Fórum" })}</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfessorDashboard;
