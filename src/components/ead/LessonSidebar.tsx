import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Play, 
  Lock,
  BookOpen,
  X,
  GraduationCap,
  AlertCircle,
  Trophy
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Lesson {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  pdf_url: string | null;
  duration_minutes: number;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

interface ModuleExamStatus {
  moduleId: string;
  passed: boolean;
  score: number | null;
  attempts: number;
}

interface LessonSidebarProps {
  modules: Module[];
  currentLesson: Lesson | null;
  completedLessons: Set<string>;
  isOpen: boolean;
  onClose: () => void;
  onSelectLesson: (moduleIndex: number, lessonIndex: number) => void;
  courseProgress: number;
  moduleExamStatus?: Map<string, ModuleExamStatus>;
  watchedTime?: Map<string, number>;
}

const LessonSidebar = ({
  modules,
  currentLesson,
  completedLessons,
  isOpen,
  onClose,
  onSelectLesson,
  courseProgress,
  moduleExamStatus = new Map(),
  watchedTime = new Map(),
}: LessonSidebarProps) => {
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));

  const toggleModule = (index: number) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const getModuleProgress = (module: Module) => {
    const completedInModule = module.lessons.filter(l => completedLessons.has(l.id)).length;
    return module.lessons.length > 0 
      ? Math.round((completedInModule / module.lessons.length) * 100)
      : 0;
  };

  // Check if a module is locked (previous module not passed with 70%)
  const isModuleLocked = (moduleIndex: number): boolean => {
    if (moduleIndex === 0) return false; // First module is always unlocked
    
    const previousModule = modules[moduleIndex - 1];
    if (!previousModule) return false;
    
    const examStatus = moduleExamStatus.get(previousModule.id);
    
    // Module is locked if:
    // 1. Previous module exam not attempted, OR
    // 2. Previous module exam not passed (score < 70)
    return !examStatus || !examStatus.passed || (examStatus.score !== null && examStatus.score < 70);
  };

  const handleLessonClick = (moduleIndex: number, lessonIndex: number) => {
    if (isModuleLocked(moduleIndex)) {
      const prevModule = modules[moduleIndex - 1];
      toast.error("Módulo Bloqueado!", {
        description: `Complete todas as aulas e passe na prova do módulo "${prevModule.title}" com pelo menos 70% para desbloquear.`,
        duration: 5000
      });
      return;
    }
    onSelectLesson(moduleIndex, lessonIndex);
  };

  const formatWatchedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const getTotalWatchedTime = () => {
    let total = 0;
    watchedTime.forEach(seconds => total += seconds);
    return total;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-card border-r border-border z-50 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          !isOpen && "lg:-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-display font-semibold text-foreground">
                Conteúdo do Curso
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso geral</span>
              <span className="font-semibold text-primary">{courseProgress}%</span>
            </div>
            <Progress value={courseProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completedLessons.size} de {modules.reduce((acc, m) => acc + m.lessons.length, 0)} aulas</span>
              <span className="text-primary font-medium">{formatWatchedTime(getTotalWatchedTime())} assistido</span>
            </div>
          </div>
        </div>

        {/* Modules List */}
        <ScrollArea className="h-[calc(100%-140px)]">
          <div className="p-2">
            {modules.map((module, moduleIndex) => {
              const isExpanded = expandedModules.has(moduleIndex);
              const moduleProgress = getModuleProgress(module);
              const isModuleComplete = moduleProgress === 100;
              const locked = isModuleLocked(moduleIndex);
              const examStatus = moduleExamStatus.get(module.id);
              const examPassed = examStatus?.passed && (examStatus.score || 0) >= 70;

              return (
                <div key={module.id} className="mb-2">
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(moduleIndex)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all",
                      locked ? "opacity-60" : "hover:bg-muted/50",
                      isExpanded && !locked && "bg-muted/30"
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors",
                      locked 
                        ? "bg-muted text-muted-foreground"
                        : examPassed 
                          ? "bg-success text-success-foreground" 
                          : isModuleComplete 
                            ? "bg-warning text-warning-foreground" 
                            : "bg-primary/10 text-primary"
                    )}>
                      {locked ? (
                        <Lock className="h-4 w-4" />
                      ) : examPassed ? (
                        <Trophy className="h-4 w-4" />
                      ) : isModuleComplete ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        moduleIndex + 1
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          "font-medium text-sm line-clamp-2",
                          locked ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {module.title}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                      
                      {/* Module Status Badges */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {locked && (
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Bloqueado
                          </Badge>
                        )}
                        {examPassed && (
                          <Badge className="bg-success text-success-foreground text-xs">
                            <Trophy className="h-3 w-3 mr-1" />
                            Aprovado {examStatus?.score}%
                          </Badge>
                        )}
                        {isModuleComplete && !examPassed && !locked && (
                          <Badge variant="outline" className="text-xs border-warning text-warning">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Fazer Prova
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={locked ? 0 : moduleProgress} className="h-1 flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {locked ? "0" : moduleProgress}%
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {module.lessons.length} aulas
                      </span>
                    </div>
                  </button>

                  {/* Lessons List */}
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-4">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const isActive = currentLesson?.id === lesson.id;
                        const isCompleted = completedLessons.has(lesson.id);
                        const lessonWatchedTime = watchedTime.get(lesson.id) || 0;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleLessonClick(moduleIndex, lessonIndex)}
                            disabled={locked}
                            className={cn(
                              "w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all group",
                              locked 
                                ? "opacity-50 cursor-not-allowed"
                                : isActive 
                                  ? "bg-primary text-primary-foreground" 
                                  : "hover:bg-muted/50",
                            )}
                          >
                            <div className={cn(
                              "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                              locked
                                ? "bg-muted text-muted-foreground"
                                : isActive 
                                  ? "bg-primary-foreground/20" 
                                  : isCompleted 
                                    ? "bg-success text-success-foreground" 
                                    : "bg-muted"
                            )}>
                              {locked ? (
                                <Lock className="h-3 w-3" />
                              ) : isCompleted && !isActive ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : isActive ? (
                                <Play className="h-3 w-3 ml-0.5" fill="currentColor" />
                              ) : (
                                <Circle className="h-3 w-3" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm line-clamp-2",
                                locked
                                  ? "text-muted-foreground"
                                  : isActive 
                                    ? "font-medium" 
                                    : "text-foreground group-hover:text-foreground"
                              )}>
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {lesson.duration_minutes && (
                                  <span className={cn(
                                    "text-xs",
                                    isActive 
                                      ? "text-primary-foreground/70" 
                                      : "text-muted-foreground"
                                  )}>
                                    {lesson.duration_minutes} min
                                  </span>
                                )}
                                {!locked && lessonWatchedTime > 0 && (
                                  <span className={cn(
                                    "text-xs",
                                    isActive ? "text-primary-foreground/70" : "text-success"
                                  )}>
                                    • {formatWatchedTime(lessonWatchedTime)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};

export default LessonSidebar;
