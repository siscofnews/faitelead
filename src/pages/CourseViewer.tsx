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
  Award,
  Lock // Added Lock icon
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar open by default
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [moduleExamStatus, setModuleExamStatus] = useState<Map<string, ModuleExamStatus>>(new Map());
  const [watchedTime, setWatchedTime] = useState<Map<string, number>>(new Map());
  const [showModuleMenu, setShowModuleMenu] = useState(true); // Control module selection menu visibility

  const { recordLessonCompletion, recordCertificateEarned } = useGamification();

  // Load course data
  useEffect(() => {
    // ... existing load logic
  }, [courseId, supabase]); // (Keep existing implementation)

  // Effect to show module menu initially
  useEffect(() => {
    // Check if we are coming from a specific lesson URL or just the course root
    // If just course root, show menu. If lesson URL, maybe show lesson directly?
    // For now, let's always default to menu unless specific state says otherwise
    setShowModuleMenu(true);
  }, []);

  const selectLesson = (moduleIndex: number, lessonIndex: number) => {
    // Check if module is locked
    if (isModuleLocked(moduleIndex)) {
      // ... existing error handling
      return;
    }

    const lesson = modules[moduleIndex]?.lessons[lessonIndex];
    if (lesson) {
      setCurrentLesson(lesson);
      setCurrentModuleIndex(moduleIndex);
      setCurrentLessonIndex(lessonIndex);
      setShowModuleMenu(false); // Hide menu when lesson is selected
    }
  };

  // Function to go back to module selection
  const handleBackToModules = () => {
    setShowModuleMenu(true);
  };

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

  // Render Module Selection Menu
  if (showModuleMenu) {
    return (
      <div className="min-h-screen bg-background">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-50">
          <Button variant="ghost" size="sm" onClick={() => navigate("/student")} className="gap-2">
            <ChevronLeft className="h-4 w-4" /> Voltar
          </Button>
          <span className="font-display font-bold text-lg">{course?.title}</span>
          <div className="w-10" /> {/* Spacer */}
        </header>
        
        <div className="container mx-auto p-6 grid gap-6">
          <div className="text-center py-8">
            <h1 className="text-3xl font-display font-bold mb-2">Conteúdo do Curso</h1>
            <p className="text-muted-foreground">Selecione um módulo para começar a assistir</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, mIndex) => {
              const isLocked = isModuleLocked(mIndex);
              const completedCount = module.lessons.filter(l => completedLessons.has(l.id)).length;
              const progress = Math.round((completedCount / module.lessons.length) * 100) || 0;

              return (
                <div 
                  key={module.id}
                  onClick={() => !isLocked && selectLesson(mIndex, 0)}
                  className={`
                    relative group overflow-hidden rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer
                    ${isLocked ? 'opacity-75 grayscale' : 'hover:shadow-lg hover:shadow-primary/5'}
                  `}
                >
                  <div className="aspect-video bg-gradient-hero p-6 flex flex-col justify-end relative">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                        <div className="text-center text-white">
                          <Lock className="w-8 h-8 mx-auto mb-2 opacity-75" />
                          <p className="text-xs font-medium uppercase tracking-wider">Bloqueado</p>
                        </div>
                      </div>
                    )}
                    <div className="relative z-0">
                      <p className="text-xs font-bold text-primary-foreground/80 uppercase tracking-wider mb-1">
                        Módulo {mIndex + 1}
                      </p>
                      <h3 className="text-xl font-display font-bold text-white mb-2 leading-tight">
                        {module.title}
                      </h3>
                      <Progress value={progress} className="h-1.5 bg-white/20" indicatorClassName="bg-primary" />
                      <p className="text-xs text-white/80 mt-2 flex justify-between">
                        <span>{completedCount}/{module.lessons.length} aulas</span>
                        <span>{progress}%</span>
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {module.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
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
            size="sm"
            onClick={handleBackToModules}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Módulos</span>
          </Button>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-muted-foreground">/</span>
            <span className="font-display font-semibold text-foreground truncate max-w-[300px]">
              {currentLesson?.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
           {/* Navigation Controls in Header */}
           <div className="flex items-center gap-2 mr-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousLesson}
                disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextLesson}
                disabled={
                  currentModuleIndex === modules.length - 1 &&
                  currentLessonIndex === modules[currentModuleIndex]?.lessons.length - 1
                }
                className="h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
           </div>

           {currentLesson && !completedLessons.has(currentLesson.id) ? (
              <Button
                size="sm"
                onClick={markLessonComplete}
                className="bg-gradient-primary gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">Concluir Aula</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={goToNextLesson}
                className="bg-gradient-primary gap-2"
              >
                <span className="hidden sm:inline">Próxima Aula</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content (Full Width Video) */}
        <main className="flex-1 overflow-y-auto bg-black relative flex flex-col">
           <div className="flex-1 relative flex items-center justify-center bg-black min-h-[400px]">
              {currentLesson?.youtube_url ? (
                <VideoPlayer
                  youtubeUrl={currentLesson.youtube_url}
                  title={currentLesson.title}
                  onComplete={markLessonComplete}
                />
              ) : (
                 <div className="aspect-video bg-gradient-hero flex items-center justify-center w-full">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                      <Play className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <p className="text-primary-foreground/80 text-lg font-display">
                      Selecione uma aula para assistir
                    </p>
                  </div>
                </div>
              )}
           </div>
           
           {/* Bottom Controls / Info Overlay */}
           <div className="bg-card border-t border-border p-6">
              <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                 <div className="md:col-span-2 space-y-4">
                    <h1 className="text-2xl font-display font-bold">{currentLesson?.title}</h1>
                    <p className="text-muted-foreground">{currentLesson?.description}</p>
                 </div>
                 
                 <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" /> Materiais de Apoio
                    </h3>
                    <div className="grid gap-2">
                       {currentLesson?.pdf_url && (
                         <a 
                           href={currentLesson.pdf_url} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors group"
                         >
                           <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                             <Download className="w-4 h-4 text-primary" />
                           </div>
                           <span className="text-sm font-medium">Baixar PDF da Aula</span>
                         </a>
                       )}
                       {/* Module Materials */}
                       {modules[currentModuleIndex]?.module_materials?.map((mat: any) => (
                          <a 
                           key={mat.id}
                           href={mat.file_url} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors group"
                         >
                           <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                             <FileText className="w-4 h-4 text-primary" />
                           </div>
                           <span className="text-sm font-medium">{mat.title}</span>
                         </a>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </main>

        {/* Sidebar (List of Lessons) - Now on the RIGHT */}
        <aside className={`w-96 bg-card border-l border-border flex flex-col transition-all duration-300 ${isSidebarOpen ? '' : 'w-0 opacity-0 overflow-hidden'}`}>
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-1">Módulo Atual</h2>
            <p className="font-display font-bold text-lg text-primary">{modules[currentModuleIndex]?.title}</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {modules[currentModuleIndex]?.lessons.map((lesson, idx) => (
                <button
                  key={lesson.id}
                  onClick={() => selectLesson(currentModuleIndex, idx)}
                  className={`w-full flex items-start gap-3 p-4 text-left rounded-xl transition-all border ${
                    currentLesson?.id === lesson.id 
                      ? "bg-primary/10 border-primary/20 shadow-sm" 
                      : "hover:bg-muted border-transparent hover:border-border"
                  }`}
                >
                  <div className={`mt-0.5 rounded-full p-1 ${currentLesson?.id === lesson.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {completedLessons.has(lesson.id) ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : currentLesson?.id === lesson.id ? (
                      <Play className="w-4 h-4 fill-current" />
                    ) : (
                      <span className="w-4 h-4 flex items-center justify-center font-bold text-[10px]">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold line-clamp-2 ${currentLesson?.id === lesson.id ? "text-primary" : "text-foreground"}`}>
                      {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {lesson.duration_minutes} min
                      </span>
                      {currentLesson?.id === lesson.id && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary animate-pulse">
                          Reproduzindo
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>
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
