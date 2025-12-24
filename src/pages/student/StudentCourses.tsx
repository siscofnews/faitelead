import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { BookOpen, Play, Clock, GraduationCap, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/i18n/I18nProvider";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  duration_months: number;
  total_hours: number;
}

interface EnrolledCourse extends Course {
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
}

const StudentCourses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const { t } = useI18n();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const enrollments = await api.listEnrollmentsByStudent(user.id);

      // For each course, calculate progress
      const coursesWithProgress: EnrolledCourse[] = [];
      
      for (const enrollment of (enrollments || [])) {
        const course = await api.getCourse(enrollment.course_id);
        if (!course) continue;
        const modules = await api.getModulesByCourse(course.id);
        const contentsArrays = await Promise.all((Array.isArray(modules) ? modules : []).map((m: any) => api.listContentsByModule(m.id)));
        const allContents = contentsArrays.flat().filter(Boolean) as any[];
        const totalLessons = allContents.length;
        const progressRows = await api.listContentProgress(user.id, course.id);
        const completedSet = new Set((Array.isArray(progressRows) ? progressRows : []).filter((p: any) => p.completed).map((p: any) => p.content_id));
        const lessonsCompleted = allContents.filter(c => completedSet.has(c.id)).length;

        const progressPercent = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

        coursesWithProgress.push({
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnail_url: course.thumbnail_url,
          duration_months: course.duration_months,
          total_hours: course.total_hours,
          progress: progressPercent,
          lessonsCompleted,
          totalLessons
        });
      }

      setCourses(coursesWithProgress);
    } catch (error) {
      console.error("Error loading courses:", error);
      toast.error("Erro ao carregar cursos");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground text-lg font-medium">Carregando cursos...</p>
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
              <h1 className="text-2xl font-display font-bold text-foreground">{t("my_courses")}</h1>
              <p className="text-sm text-muted-foreground">Gerencie seus cursos matriculados</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {courses.length === 0 ? (
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                Nenhum curso matriculado
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Entre em contato com a secretaria para realizar sua matrícula em um de nossos cursos
              </p>
              <Button onClick={() => navigate("/courses")}>
                Ver Catálogo de Cursos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="group overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-primary to-primary/60 overflow-hidden">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <GraduationCap className="w-16 h-16 text-primary-foreground/60" />
                    </div>
                  )}
                  
                  <Badge className="absolute top-3 right-3 bg-success/90 text-success-foreground border-0">
                    Ativo
                  </Badge>
                </div>

                <CardHeader className="pb-2">
                  <h3 className="font-display font-semibold text-lg line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description || "Curso completo de teologia"}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {course.totalLessons} aulas
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {course.duration_months || 12} meses
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {course.lessonsCompleted} de {course.totalLessons} aulas
                      </span>
                      <span className="font-medium text-primary">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {course.progress > 0 ? "Continuar" : "Iniciar"} Curso
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentCourses;
