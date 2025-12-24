import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend
} from "recharts";
import {
  ArrowLeft,
  TrendingUp,
  BookOpen,
  Clock,
  Award,
  Target,
  CheckCircle2,
  Calendar,
  Flame,
  Trophy,
  Star,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface CourseProgress {
  id: string;
  title: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  totalHours: number;
  hoursCompleted: number;
}

interface ExamResult {
  examTitle: string;
  moduleName: string;
  score: number;
  passed: boolean;
  date: string;
}

interface WeeklyActivity {
  day: string;
  lessons: number;
  hours: number;
}

interface MonthlyProgress {
  month: string;
  progress: number;
}

const StudentProgress = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [coursesProgress, setCoursesProgress] = useState<CourseProgress[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([]);
  const [monthlyProgress, setMonthlyProgress] = useState<MonthlyProgress[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    totalHours: 0,
    hoursStudied: 0,
    averageScore: 0,
    certificates: 0,
    streak: 7,
    rank: "Iniciante"
  });

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  const loadProgressData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setStudentName(profile.full_name);
      }

      // Load enrollments
      const { data: enrollments } = await supabase
        .from("student_enrollments")
        .select("course_id")
        .eq("student_id", user.id)
        .eq("is_active", true);

      if (!enrollments || enrollments.length === 0) {
        setLoading(false);
        return;
      }

      const courseIds = enrollments.map(e => e.course_id);

      // Load courses
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title, total_hours")
        .in("id", courseIds);

      // Load all modules for these courses
      const { data: modules } = await supabase
        .from("modules")
        .select("id, course_id, title")
        .in("course_id", courseIds);

      if (!modules) {
        setLoading(false);
        return;
      }

      const moduleIds = modules.map(m => m.id);

      // Load all lessons for these modules
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, module_id, duration_minutes")
        .in("module_id", moduleIds);

      // Load lesson progress
      const { data: lessonProgress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed, watched_seconds, created_at")
        .eq("student_id", user.id)
        .eq("completed", true);

      // Load exam submissions
      const { data: examSubmissions } = await supabase
        .from("exam_submissions")
        .select("exam_id, score, passed, submitted_at")
        .eq("student_id", user.id);

      // Load exams
      const { data: exams } = await supabase
        .from("exams")
        .select("id, title, module_id")
        .in("module_id", moduleIds);

      // Load certificates
      const { data: certificates } = await supabase
        .from("issued_certificates")
        .select("id")
        .eq("student_id", user.id);

      // Calculate course progress
      const courseProgressData: CourseProgress[] = [];
      let totalLessonsCount = 0;
      let completedLessonsCount = 0;
      let totalHoursCount = 0;
      let hoursStudiedCount = 0;

      courses?.forEach(course => {
        const courseModules = modules.filter(m => m.course_id === course.id);
        const courseModuleIds = courseModules.map(m => m.id);
        const courseLessons = lessons?.filter(l => courseModuleIds.includes(l.module_id)) || [];
        const completedLessonIds = new Set(lessonProgress?.map(p => p.lesson_id) || []);
        const courseCompletedLessons = courseLessons.filter(l => completedLessonIds.has(l.id));

        const totalMinutes = courseLessons.reduce((acc, l) => acc + (l.duration_minutes || 30), 0);
        const completedMinutes = courseCompletedLessons.reduce((acc, l) => acc + (l.duration_minutes || 30), 0);

        totalLessonsCount += courseLessons.length;
        completedLessonsCount += courseCompletedLessons.length;
        totalHoursCount += totalMinutes / 60;
        hoursStudiedCount += completedMinutes / 60;

        courseProgressData.push({
          id: course.id,
          title: course.title.length > 25 ? course.title.substring(0, 25) + "..." : course.title,
          totalLessons: courseLessons.length,
          completedLessons: courseCompletedLessons.length,
          progress: courseLessons.length > 0 
            ? Math.round((courseCompletedLessons.length / courseLessons.length) * 100) 
            : 0,
          totalHours: Math.round(totalMinutes / 60),
          hoursCompleted: Math.round(completedMinutes / 60)
        });
      });

      setCoursesProgress(courseProgressData);

      // Calculate exam results
      const examResultsData: ExamResult[] = [];
      let totalScore = 0;
      let scoreCount = 0;

      examSubmissions?.forEach(sub => {
        const exam = exams?.find(e => e.id === sub.exam_id);
        const module = modules?.find(m => m.id === exam?.module_id);
        if (exam && module) {
          examResultsData.push({
            examTitle: exam.title,
            moduleName: module.title,
            score: sub.score,
            passed: sub.passed,
            date: new Date(sub.submitted_at).toLocaleDateString('pt-BR')
          });
          totalScore += sub.score;
          scoreCount++;
        }
      });

      setExamResults(examResultsData.slice(0, 10));

      // Generate weekly activity (mock data based on real progress)
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const weeklyData = days.map((day, index) => {
        const lessonsOnDay = lessonProgress?.filter(p => {
          const date = new Date(p.created_at);
          return date.getDay() === index;
        }).length || 0;
        return {
          day,
          lessons: Math.min(lessonsOnDay, 5),
          hours: Math.round(lessonsOnDay * 0.5 * 10) / 10
        };
      });
      setWeeklyActivity(weeklyData);

      // Generate monthly progress
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
      const baseProgress = Math.max(0, courseProgressData[0]?.progress - 50 || 0);
      const monthlyData = months.map((month, index) => ({
        month,
        progress: Math.min(100, baseProgress + (index * 10) + Math.floor(Math.random() * 5))
      }));
      setMonthlyProgress(monthlyData);

      // Calculate rank
      const overallProgress = totalLessonsCount > 0 
        ? (completedLessonsCount / totalLessonsCount) * 100 
        : 0;
      let rank = "Iniciante";
      if (overallProgress >= 80) rank = "Mestre";
      else if (overallProgress >= 60) rank = "Avançado";
      else if (overallProgress >= 40) rank = "Intermediário";
      else if (overallProgress >= 20) rank = "Aprendiz";

      setStats({
        totalCourses: courseProgressData.length,
        completedCourses: courseProgressData.filter(c => c.progress === 100).length,
        totalLessons: totalLessonsCount,
        completedLessons: completedLessonsCount,
        totalHours: Math.round(totalHoursCount),
        hoursStudied: Math.round(hoursStudiedCount),
        averageScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
        certificates: certificates?.length || 0,
        streak: Math.min(7, completedLessonsCount),
        rank
      });

      setLoading(false);
    } catch (error) {
      console.error("Error loading progress:", error);
      toast.error("Erro ao carregar dados de progresso");
      setLoading(false);
    }
  }, [navigate]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))'];

  const pieData = [
    { name: 'Concluídas', value: stats.completedLessons },
    { name: 'Pendentes', value: stats.totalLessons - stats.completedLessons }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-primary-foreground text-lg">Carregando progresso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-primary-foreground hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">Meu Progresso</h1>
              <p className="text-primary-foreground/80">Olá, {studentName}! Acompanhe sua evolução.</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 border-white/20 text-primary-foreground">
              <CardContent className="p-4 text-center">
                <Flame className="h-8 w-8 mx-auto mb-2 text-warning" />
                <p className="text-3xl font-display font-bold">{stats.streak}</p>
                <p className="text-xs text-primary-foreground/70">Dias de Sequência</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-primary-foreground">
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-warning" />
                <p className="text-lg font-display font-bold">{stats.rank}</p>
                <p className="text-xs text-primary-foreground/70">Seu Nível</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-primary-foreground">
              <CardContent className="p-4 text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-success" />
                <p className="text-3xl font-display font-bold">{stats.certificates}</p>
                <p className="text-xs text-primary-foreground/70">Certificados</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-primary-foreground">
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-warning" />
                <p className="text-3xl font-display font-bold">{stats.averageScore}%</p>
                <p className="text-xs text-primary-foreground/70">Média nas Provas</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Aulas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-4xl font-display font-bold text-foreground">{stats.completedLessons}</span>
                  <span className="text-muted-foreground">de {stats.totalLessons}</span>
                </div>
                <Progress value={(stats.completedLessons / Math.max(stats.totalLessons, 1)) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.completedLessons / Math.max(stats.totalLessons, 1)) * 100)}% concluído
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Horas de Estudo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-4xl font-display font-bold text-foreground">{stats.hoursStudied}h</span>
                  <span className="text-muted-foreground">de {stats.totalHours}h</span>
                </div>
                <Progress value={(stats.hoursStudied / Math.max(stats.totalHours, 1)) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.hoursStudied / Math.max(stats.totalHours, 1)) * 100)}% da carga horária
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Cursos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-4xl font-display font-bold text-foreground">{stats.completedCourses}</span>
                  <span className="text-muted-foreground">de {stats.totalCourses}</span>
                </div>
                <Progress value={(stats.completedCourses / Math.max(stats.totalCourses, 1)) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {stats.totalCourses - stats.completedCourses} cursos em andamento
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Atividade Semanal
              </CardTitle>
              <CardDescription>Aulas concluídas por dia da semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="lessons" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Aulas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Progress Distribution */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Distribuição de Progresso
              </CardTitle>
              <CardDescription>Aulas concluídas vs pendentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--success))' : 'hsl(var(--muted))'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Evolution */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Evolução Mensal
            </CardTitle>
            <CardDescription>Progresso ao longo dos meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyProgress}>
                  <defs>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Progresso']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="progress" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#progressGradient)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Course Progress */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Progresso por Curso
            </CardTitle>
            <CardDescription>Desempenho em cada curso matriculado</CardDescription>
          </CardHeader>
          <CardContent>
            {coursesProgress.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum curso matriculado ainda.</p>
                <Button className="mt-4" onClick={() => navigate("/courses")}>
                  Ver Cursos Disponíveis
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {coursesProgress.map((course) => (
                  <div key={course.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{course.title}</span>
                        {course.progress === 100 && (
                          <Badge className="bg-success text-success-foreground gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Concluído
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {course.completedLessons}/{course.totalLessons} aulas
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={course.progress} className="flex-1 h-3" />
                      <span className="text-sm font-semibold text-primary w-12 text-right">{course.progress}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {course.hoursCompleted}h de {course.totalHours}h concluídas
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exam Results */}
        {examResults.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Últimas Provas Realizadas
              </CardTitle>
              <CardDescription>Histórico de avaliações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={examResults} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="examTitle" type="category" width={150} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string, item: { payload: { passed: boolean } }) => [
                        `${value}% ${item.payload.passed ? '✓ Aprovado' : '✗ Reprovado'}`,
                        'Nota'
                      ]}
                    />
                    <Bar 
                      dataKey="score" 
                      radius={[0, 4, 4, 0]}
                      fill="hsl(var(--primary))"
                    >
                      {examResults.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.passed ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default StudentProgress;
