import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ClipboardList, CheckCircle, XCircle } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExamSubmission {
  id: string;
  student_id: string;
  exam_id: string;
  score: number;
  passed: boolean;
  submitted_at: string;
  student?: { full_name: string; email: string };
  exam?: { title: string; passing_score: number };
}

interface Course {
  id: string;
  title: string;
}

const ProfessorGrades = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
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
    await loadSubmissions();
  };

  const loadCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("id, title")
      .eq("is_active", true)
      .order("title");

    setCourses(data || []);
  };

  const loadSubmissions = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("exam_submissions")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error loading submissions:", error);
    } else {
      // Load related data
      const submissionsWithData = await Promise.all(
        (data || []).map(async (sub) => {
          const { data: studentData } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", sub.student_id)
            .single();

          const { data: examData } = await supabase
            .from("exams")
            .select("title, passing_score")
            .eq("id", sub.exam_id)
            .single();

          return {
            ...sub,
            student: studentData || undefined,
            exam: examData || undefined
          };
        })
      );

      setSubmissions(submissionsWithData);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const filteredSubmissions = submissions; // Can add course filtering later

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
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
        </Button>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-6 w-6" />
              Lançamento de Notas
            </CardTitle>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filtrar por curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Nenhuma prova submetida ainda</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Prova</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{submission.student?.full_name || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">{submission.student?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{submission.exam?.title || "N/A"}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${submission.passed ? "text-green-600" : "text-red-600"}`}>
                          {submission.score}%
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">
                          (mín: {submission.exam?.passing_score || 70}%)
                        </span>
                      </TableCell>
                      <TableCell>
                        {submission.passed ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Aprovado
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Reprovado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(submission.submitted_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProfessorGrades;
