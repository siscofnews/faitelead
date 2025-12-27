import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useGamification } from "@/hooks/useGamification";
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  Download, 
  BookOpen,
  CheckCircle2,
  Circle,
  Play,
  FileText,
  Clock,
  GraduationCap,
  MessageSquare,
  Settings,
  Home,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import VideoPlayer from "@/components/ead/VideoPlayer";
import LessonSidebar from "@/components/ead/LessonSidebar";
import LessonNotes from "@/components/ead/LessonNotes";
import LessonResources from "@/components/ead/LessonResources";
import ModuleExamCard from "@/components/ead/ModuleExamCard";

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
  module_materials?: any[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  pdf_url: string | null;
  duration_minutes: number;
  order_index: number;
  completed?: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  duration_months: number;
  total_hours: number;
}

interface ModuleExamStatus {
  moduleId: string;
  passed: boolean;
  score: number | null;
  attempts: number;
}

const CourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [moduleExamStatus, setModuleExamStatus] = useState<Map<string, ModuleExamStatus>>(new Map());
  const [watchedTime, setWatchedTime] = useState<Map<string, number>>(new Map());
  const { recordLessonCompletion, recordCertificateEarned } = useGamification();

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Load modules with lessons and materials
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select(`
          *,
          lessons (*),
          module_materials (*)
        `)
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (modulesError) throw modulesError;

      // Sort lessons within each module
      const sortedModules = modulesData?.map(module => ({
        ...module,
        lessons: module.lessons?.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index) || []
      })) || [];

      setModules(sortedModules);

      // Load lesson progress (completion + watched time)
      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed, watched_seconds")
        .eq("student_id", user.id);

      if (progressData) {
        const completed = new Set(
          progressData.filter(p => p.completed).map(p => p.lesson_id)
        );
        setCompletedLessons(completed);

        // Build watched time map
        const timeMap = new Map<string, number>();
        progressData.forEach(p => {
          if (p.watched_seconds) {
            timeMap.set(p.lesson_id, p.watched_seconds);
          }
        });
        setWatchedTime(timeMap);
      }

      // Load exam submissions for each module to check pass status
      const moduleIds = sortedModules.map(m => m.id);
      const { data: examsData } = await supabase
        .from("exams")
        .select("id, module_id")
        .in("module_id", moduleIds);

      if (examsData && examsData.length > 0) {
        const examIds = examsData.map(e => e.id);
        const { data: submissions } = await supabase
          .from("exam_submissions")
          .select("exam_id, score, passed")
          .eq("student_id", user.id)
          .in("exam_id", examIds);

        // Build module exam status map
        const examStatusMap = new Map<string, ModuleExamStatus>();
        
        sortedModules.forEach(module => {
          const moduleExams = examsData.filter(e => e.module_id === module.id);
          const moduleSubmissions = submissions?.filter(s => 
            moduleExams.some(e => e.id === s.exam_id)
          ) || [];

          // Get best submission
          const bestSubmission = moduleSubmissions.reduce((best, curr) => {
            if (!best || (curr.score || 0) > (best.score || 0)) return curr;
            return best;
          }, null as typeof moduleSubmissions[0] | null);

          examStatusMap.set(module.id, {
            moduleId: module.id,
            passed: bestSubmission?.passed || false,
            score: bestSubmission?.score || null,
            attempts: moduleSubmissions.length
          });
        });

        setModuleExamStatus(examStatusMap);
      }

      // Set first lesson as current (from first unlocked module)
      if (sortedModules.length > 0 && sortedModules[0].lessons.length > 0) {
        setCurrentLesson(sortedModules[0].lessons[0]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading course:", error);
      toast.error("Erro ao carregar o curso");
      setLoading(false);
    }
  };

  // Check if a module is locked
  const isModuleLocked = (moduleIndex: number): boolean => {
    if (moduleIndex === 0) return false;
    
    const previousModule = modules[moduleIndex - 1];
    if (!previousModule) return false;
    
    const examStatus = moduleExamStatus.get(previousModule.id);
    return !examStatus || !examStatus.passed || (examStatus.score !== null && examStatus.score < 70);
  };

  const selectLesson = (moduleIndex: number, lessonIndex: number) => {
    // Check if module is locked
    if (isModuleLocked(moduleIndex)) {
      const prevModule = modules[moduleIndex - 1];
      toast.error("Módulo Bloqueado!", {
        description: `Complete todas as aulas e passe na prova do módulo "${prevModule.title}" com pelo menos 70% para desbloquear.`,
        duration: 5000
      });
      return;
    }

    const lesson = modules[moduleIndex]?.lessons[lessonIndex];
    if (lesson) {
      setCurrentLesson(lesson);
      setCurrentModuleIndex(moduleIndex);
      setCurrentLessonIndex(lessonIndex);
    }
  };

  const checkAndIssueCertificate = async (userId: string, completedSet: Set<string>) => {
    const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
    if (totalLessons === 0) return;
    
    const progress = Math.round((completedSet.size / totalLessons) * 100);
    
    if (progress === 100 && courseId) {
      try {
        console.log("Course completed! Checking certificate eligibility...");
        const { data, error } = await supabase.functions.invoke('auto-certificate', {
          body: { student_id: userId, course_id: courseId }
        });
        
        if (error) {
          console.error("Error calling auto-certificate:", error);
          return;
        }
        
        if (data?.certificate) {
          toast.success("🎉 Parabéns! Certificado emitido automaticamente!", {
            description: "Acesse sua área de certificados para visualizar.",
            duration: 8000,
            action: {
              label: "Ver Certificado",
              onClick: () => navigate(`/certificate/${data.certificate.id}`)
            }
          });
        } else if (data?.message === 'Certificate already issued') {
          console.log("Certificate already exists");
        }
      } catch (err) {
        console.error("Error checking certificate:", err);
      }
    }
  };

  // Update watched time for a lesson
  const updateWatchedTime = async (lessonId: string, seconds: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase
        .from("lesson_progress")
        .upsert({
          student_id: user.id,
          lesson_id: lessonId,
          watched_seconds: seconds,
          last_position: seconds
        }, {
          onConflict: "student_id,lesson_id"
        });

      // Update local state
      setWatchedTime(prev => {
        const next = new Map(prev);
        next.set(lessonId, seconds);
        return next;
      });
    } catch (error) {
      console.error("Error updating watched time:", error);
    }
  };

  const markLessonComplete = async () => {
    if (!currentLesson) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const watchedSeconds = (currentLesson.duration_minutes || 0) * 60;
      
      const { error } = await supabase
        .from("lesson_progress")
        .upsert({
          student_id: user.id,
          lesson_id: currentLesson.id,
          completed: true,
          watched_seconds: watchedSeconds
        }, {
          onConflict: "student_id,lesson_id"
        });

      if (error) throw error;
      try {
        await api.upsertContentProgress(null, { student_id: user.id, content_id: currentLesson.id, completed: true });
      } catch (err) {
        console.error(err);
      }

      const newCompletedSet = new Set([...completedLessons, currentLesson.id]);
      setCompletedLessons(newCompletedSet);
      
      // Update watched time state
      setWatchedTime(prev => {
        const next = new Map(prev);
        next.set(currentLesson.id, watchedSeconds);
        return next;
      });
      
      toast.success("Aula marcada como concluída!");

      // Record gamification progress
      await recordLessonCompletion(user.id);

      // Check if course is now 100% complete and issue certificate
      const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
      const progress = Math.round((newCompletedSet.size / totalLessons) * 100);
      
      if (progress === 100) {
        await recordCertificateEarned(user.id);
      }
      
      await checkAndIssueCertificate(user.id, newCompletedSet);

      // Auto advance to next lesson
      goToNextLesson();
    } catch (error) {
      console.error("Error marking lesson complete:", error);
      toast.error("Erro ao salvar progresso");
    }
  };

  const goToNextLesson = () => {
    const currentModule = modules[currentModuleIndex];
    
    // Check if we're at the last lesson of current module
    if (currentLessonIndex >= currentModule.lessons.length - 1) {
      // Check if all lessons in current module are completed
      const allLessonsCompleted = currentModule.lessons.every(l => completedLessons.has(l.id));
      const examStatus = moduleExamStatus.get(currentModule.id);
      
      if (allLessonsCompleted && (!examStatus || !examStatus.passed)) {
        // Show prompt to take exam
        toast.info("Parabéns! Você concluiu todas as aulas deste módulo.", {
          description: "Agora faça a prova para desbloquear o próximo módulo. Você precisa de 70% para ser aprovado.",
          duration: 8000
        });
        return;
      }
      
      // Try to go to next module
      if (currentModuleIndex < modules.length - 1) {
        if (isModuleLocked(currentModuleIndex + 1)) {
          toast.warning("Próximo módulo bloqueado!", {
            description: "Complete a prova deste módulo com pelo menos 70% para continuar.",
            duration: 5000
          });
          return;
        }
        selectLesson(currentModuleIndex + 1, 0);
      }
    } else {
      selectLesson(currentModuleIndex, currentLessonIndex + 1);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      selectLesson(currentModuleIndex, currentLessonIndex - 1);
    } else if (currentModuleIndex > 0) {
      const prevModule = modules[currentModuleIndex - 1];
      selectLesson(currentModuleIndex - 1, prevModule.lessons.length - 1);
    }
  };

  const calculateProgress = () => {
    const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons.size / totalLessons) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-primary-foreground text-xl font-display">Carregando curso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header Bar */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>

          <div className="hidden md:flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold text-foreground truncate max-w-[300px]">
              {course?.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Progresso do curso</p>
              <p className="text-sm font-semibold text-primary">{calculateProgress()}% concluído</p>
            </div>
            <div className="w-24">
              <Progress value={calculateProgress()} className="h-2" />
            </div>
          </div>

          <Badge variant="outline" className="hidden md:flex gap-1 border-success text-success">
            <Award className="h-3 w-3" />
            {completedLessons.size} aulas
          </Badge>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <LessonSidebar
          modules={modules}
          currentLesson={currentLesson}
          completedLessons={completedLessons}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelectLesson={selectLesson}
          courseProgress={calculateProgress()}
          moduleExamStatus={moduleExamStatus}
          watchedTime={watchedTime}
        />

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : ''}`}>
          {/* Video Section */}
          <div className="bg-foreground/95 relative">
            <div className="max-w-6xl mx-auto">
              <VideoPlayer
                youtubeUrl={currentLesson?.youtube_url || ""}
                title={currentLesson?.title || ""}
                onComplete={markLessonComplete}
              />
            </div>
          </div>

          {/* Lesson Info & Controls */}
          <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Lesson Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-normal">
                    Módulo {currentModuleIndex + 1}
                  </Badge>
                  <Badge variant="outline" className="font-normal">
                    Aula {currentLessonIndex + 1}
                  </Badge>
                  {currentLesson && completedLessons.has(currentLesson.id) && (
                    <Badge className="bg-success text-success-foreground gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Concluída
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  {currentLesson?.title}
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  {currentLesson?.description || modules[currentModuleIndex]?.description}
                </p>
                {currentLesson?.duration_minutes && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {currentLesson.duration_minutes} minutos
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={goToPreviousLesson}
                  disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>

                {currentLesson && !completedLessons.has(currentLesson.id) ? (
                  <Button
                    onClick={markLessonComplete}
                    className="bg-gradient-primary hover:opacity-90 gap-2 btn-shine"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Marcar Concluída
                  </Button>
                ) : (
                  <Button
                    onClick={goToNextLesson}
                    className="bg-gradient-primary hover:opacity-90 gap-2"
                    disabled={
                      currentModuleIndex === modules.length - 1 &&
                      currentLessonIndex === modules[currentModuleIndex]?.lessons.length - 1
                    }
                  >
                    <span className="hidden sm:inline">Próxima</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Tabs for Additional Content */}
            <Tabs defaultValue="resources" className="w-full">
              <TabsList className="bg-muted/50 p-1 w-full sm:w-auto">
                <TabsTrigger value="resources" className="gap-2 data-[state=active]:bg-background">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Materiais</span>
                </TabsTrigger>
                <TabsTrigger value="exam" className="gap-2 data-[state=active]:bg-background">
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">Prova</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-2 data-[state=active]:bg-background">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Anotações</span>
                </TabsTrigger>
                <TabsTrigger value="about" className="gap-2 data-[state=active]:bg-background">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Sobre</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="resources" className="mt-6">
                <LessonResources
                  pdfUrl={currentLesson?.pdf_url}
                  lessonTitle={currentLesson?.title || ""}
                  lessonId={currentLesson?.id || ""}
                  materials={modules[currentModuleIndex]?.module_materials || []}
                />
              </TabsContent>

              <TabsContent value="exam" className="mt-6">
                {modules[currentModuleIndex] && (
                  <ModuleExamCard
                    moduleId={modules[currentModuleIndex].id}
                    moduleLessonsCompleted={
                      modules[currentModuleIndex].lessons.every(l => completedLessons.has(l.id))
                    }
                    completedLessonsCount={
                      modules[currentModuleIndex].lessons.filter(l => completedLessons.has(l.id)).length
                    }
                    totalLessonsCount={modules[currentModuleIndex].lessons.length}
                  />
                )}
              </TabsContent>

              <TabsContent value="notes" className="mt-6">
                <LessonNotes
                  lessonId={currentLesson?.id || ""}
                  notes={notes}
                  onNotesChange={setNotes}
                />
              </TabsContent>

              <TabsContent value="about" className="mt-6">
                <div className="bg-card rounded-xl p-6 border border-border space-y-4">
                  <h3 className="font-display font-semibold text-lg">Sobre este módulo</h3>
                  <p className="text-muted-foreground">
                    {modules[currentModuleIndex]?.description || 
                      "Este módulo faz parte do curso " + course?.title + ". Complete todas as aulas para avançar para o próximo módulo."}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-display font-bold text-primary">
                        {modules[currentModuleIndex]?.lessons.length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Aulas</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-display font-bold text-primary">
                        {modules.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Módulos</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-display font-bold text-primary">
                        {course?.total_hours || 540}h
                      </p>
                      <p className="text-xs text-muted-foreground">Carga Horária</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-display font-bold text-primary">
                        {course?.duration_months || 12}
                      </p>
                      <p className="text-xs text-muted-foreground">Meses</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 flex items-center justify-between gap-2 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousLesson}
          disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(true)}
          className="flex-1"
        >
          <Menu className="h-4 w-4 mr-2" />
          Aulas
        </Button>

        {currentLesson && !completedLessons.has(currentLesson.id) ? (
          <Button
            size="sm"
            onClick={markLessonComplete}
            className="bg-gradient-primary"
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={goToNextLesson}
            className="bg-gradient-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CourseViewer;
