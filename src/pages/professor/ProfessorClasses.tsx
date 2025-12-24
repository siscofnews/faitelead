import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BookOpen, Users, PlayCircle, FileText, Calendar } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  total_hours: number | null;
  is_active: boolean;
}

interface Module {
  id: string;
  title: string;
  course_id: string;
  lessons_count?: number;
}

const ProfessorClasses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [userName, setUserName] = useState("");

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

    await loadCourses();
  };

  const loadCourses = async () => {
    setLoading(true);

    // For now, load all active courses (in production, filter by professor assignments)
    try {
      const data = await api.listCourses({ is_active: true });
      setCourses((Array.isArray(data) ? data : []).sort((a: any, b: any) => (a.title || "").localeCompare(b.title || "")));
    } catch {
      toast({ title: "Erro ao carregar cursos", variant: "destructive" });
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
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
      <DashboardHeader userName={userName} userRole="teacher" onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/professor")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("back")}
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            {t("classes_title")}
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie suas aulas e conteúdos</p>
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma turma atribuída</h3>
              <p className="text-muted-foreground">
                Você ainda não possui turmas atribuídas. Entre em contato com a administração.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  {course.thumbnail_url && (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description || "Sem descrição"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {course.total_hours || 0}h
                    </span>
                    <Badge variant={course.is_active ? "default" : "secondary"}>
                      {course.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/professor/turma/${course.id}`)}
                    >
                      <Users className="h-4 w-4 mr-1" /> Alunos
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/professor/aulas/${course.id}`)}
                    >
                      <PlayCircle className="h-4 w-4 mr-1" /> Aulas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfessorClasses;
