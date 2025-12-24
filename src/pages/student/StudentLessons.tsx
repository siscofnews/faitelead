import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  BookOpen, Play, Clock, ArrowLeft, CheckCircle2, Circle,
  Video, FileText
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  youtube_url: string;
  pdf_url: string | null;
  order_index: number;
  module_id: string;
  module_title: string;
  course_id: string;
  course_title: string;
  completed: boolean;
}

const StudentLessons = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  const loadLessons = useCallback(async () => {
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
        setLessons([]);
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
        .in("course_id", courseIds)
        .order("order_index");

      if (!modules || modules.length === 0) {
        setLessons([]);
        setLoading(false);
        return;
      }

      const moduleIds = modules.map(m => m.id);

      // Get lessons
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("*")
        .in("module_id", moduleIds)
        .order("order_index");

      // Get completed lessons
      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("student_id", user.id)
        .eq("completed", true);

      const completedIds = new Set(progressData?.map(p => p.lesson_id) || []);

      // Map lessons with module and course info
      type ModuleItem = { id: string; title: string; course_id: string; courses: { title: string } };
      const moduleItems = (modules || []) as ModuleItem[];

      const mappedLessons: Lesson[] = (lessonsData || []).map((lesson) => {
        const module = moduleItems.find((m) => m.id === lesson.module_id);
        return {
          ...lesson,
          module_title: module?.title || "",
          course_id: module?.course_id || "",
          course_title: module?.courses?.title || "",
          completed: completedIds.has(lesson.id)
        };
      });

      setLessons(mappedLessons);
    } catch (error) {
      console.error("Error loading lessons:", error);
      toast.error("Erro ao carregar aulas");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const filteredLessons = lessons.filter(lesson => {
    if (filter === "pending") return !lesson.completed;
    if (filter === "completed") return lesson.completed;
    return true;
  });

  const completedCount = lessons.filter(l => l.completed).length;
  const progressPercent = lessons.length > 0 
    ? Math.round((completedCount / lessons.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground text-lg font-medium">Carregando aulas...</p>
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
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-foreground">Minhas Aulas</h1>
              <p className="text-sm text-muted-foreground">
                {completedCount} de {lessons.length} aulas concluídas
              </p>
            </div>
            <div className="hidden md:block w-32">
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-muted-foreground text-right mt-1">{progressPercent}%</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {lessons.length === 0 ? (
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Video className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                Nenhuma aula disponível
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Você ainda não está matriculado em nenhum curso com aulas
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Tabs */}
            <Tabs defaultValue="all" className="mb-6" onValueChange={(v: "all" | "pending" | "completed") => setFilter(v)}>
              <TabsList>
                <TabsTrigger value="all">
                  Todas ({lessons.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pendentes ({lessons.length - completedCount})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Concluídas ({completedCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Lessons Grid */}
            <div className="space-y-4">
              {filteredLessons.map((lesson) => (
                <Card 
                  key={lesson.id} 
                  className="hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/course/${lesson.course_id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        lesson.completed 
                          ? "bg-success/20 text-success" 
                          : "bg-primary/20 text-primary"
                      }`}>
                        {lesson.completed ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {lesson.course_title}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {lesson.module_title}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground truncate">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {lesson.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lesson.duration_minutes || 30} min
                          </span>
                          {lesson.pdf_url && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Material PDF
                            </span>
                          )}
                        </div>
                      </div>

                      <Button size="sm" variant={lesson.completed ? "outline" : "default"}>
                        {lesson.completed ? "Revisar" : "Assistir"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default StudentLessons;
