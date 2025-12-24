import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Home, ChevronLeft, FileText, Download, Printer, 
  CheckCircle2, Clock, XCircle, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TranscriptItem {
  id: string;
  subject_name: string;
  grade: number | null;
  workload_hours: number;
  status: string;
  completed_at: string | null;
  module_id: string;
  course_id: string;
}

interface CourseTranscript {
  course_id: string;
  course_title: string;
  total_hours: number;
  completed_hours: number;
  items: TranscriptItem[];
}

const StudentTranscript = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [transcripts, setTranscripts] = useState<CourseTranscript[]>([]);

  useEffect(() => {
    loadTranscript();
  }, [loadTranscript]);

  const loadTranscript = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Buscar perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      setStudentName(profile?.full_name || "Aluno");

      // Buscar matrículas
      const { data: enrollments } = await supabase
        .from("student_enrollments")
        .select(`
          course_id,
          courses (id, title, total_hours)
        `)
        .eq("student_id", user.id)
        .eq("is_active", true);

      // Buscar histórico acadêmico
      const { data: transcriptData } = await supabase
        .from("academic_transcripts")
        .select("*")
        .eq("student_id", user.id);

      // Agrupar por curso
      const courseMap = new Map<string, CourseTranscript>();

      enrollments?.forEach(e => {
        if (e.courses) {
          courseMap.set(e.course_id, {
            course_id: e.course_id,
            course_title: e.courses.title,
            total_hours: e.courses.total_hours || 540,
            completed_hours: 0,
            items: []
          });
        }
      });

      transcriptData?.forEach(item => {
        const course = courseMap.get(item.course_id);
        if (course) {
          course.items.push(item);
          if (item.status === "approved") {
            course.completed_hours += item.workload_hours;
          }
        }
      });

      setTranscripts(Array.from(courseMap.values()));
      setLoading(false);
    } catch (error) {
      console.error("Error loading transcript:", error);
      toast.error("Erro ao carregar histórico");
      setLoading(false);
    }
  }, [navigate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success"><CheckCircle2 className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case "in_progress":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Cursando</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Reprovado</Badge>;
      case "pending":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const calculateProgress = (course: CourseTranscript) => {
    return Math.round((course.completed_hours / course.total_hours) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
              <Button variant="ghost" size="sm" onClick={() => navigate("/student")}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <h1 className="text-xl font-display font-bold">Histórico Acadêmico</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
              <Button size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Baixar PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Student Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold">{studentName}</h2>
                <p className="text-muted-foreground">FAITEL - Faculdade Internacional Teológica de Líderes</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Documento gerado em</p>
                <p className="font-medium">{new Date().toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transcripts by Course */}
        {transcripts.length > 0 ? (
          <Accordion type="multiple" defaultValue={transcripts.map(t => t.course_id)}>
            {transcripts.map((course) => (
              <AccordionItem key={course.course_id} value={course.course_id}>
                <Card className="mb-4">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-display font-semibold">{course.course_title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {course.completed_hours}h de {course.total_hours}h completadas
                          </p>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-4">
                        <div className="w-32">
                          <Progress value={calculateProgress(course)} className="h-2" />
                        </div>
                        <Badge variant="outline">{calculateProgress(course)}%</Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      {course.items.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Disciplina</TableHead>
                              <TableHead className="text-center">Carga Horária</TableHead>
                              <TableHead className="text-center">Nota</TableHead>
                              <TableHead className="text-center">Status</TableHead>
                              <TableHead className="text-center">Conclusão</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {course.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.subject_name}</TableCell>
                                <TableCell className="text-center">{item.workload_hours}h</TableCell>
                                <TableCell className="text-center">
                                  {item.grade !== null ? `${item.grade}%` : "-"}
                                </TableCell>
                                <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                                <TableCell className="text-center">{formatDate(item.completed_at)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          <Clock className="h-8 w-8 mx-auto mb-2" />
                          <p>Nenhuma disciplina cursada ainda</p>
                        </div>
                      )}
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-display font-bold mb-2">Histórico vazio</h3>
              <p className="text-muted-foreground mb-6">
                Você ainda não possui disciplinas em seu histórico acadêmico.
              </p>
              <Button onClick={() => navigate("/student")}>
                Ver Meus Cursos
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-3">Legenda:</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-2">
                <Badge className="bg-success">Aprovado</Badge>
                Nota ≥ 70%
              </span>
              <span className="flex items-center gap-2">
                <Badge variant="secondary">Cursando</Badge>
                Em andamento
              </span>
              <span className="flex items-center gap-2">
                <Badge variant="destructive">Reprovado</Badge>
                Nota &lt; 70%
              </span>
              <span className="flex items-center gap-2">
                <Badge variant="outline">Pendente</Badge>
                Não iniciado
              </span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StudentTranscript;
