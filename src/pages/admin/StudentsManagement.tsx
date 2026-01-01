import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Search, Plus, MoreVertical, Eye, Edit,
  Download, Mail, UserCheck, UserX, Home, ChevronLeft,
  User, Phone, FileText, GraduationCap, Calendar, MapPin, Trash2, TrendingUp, BookOpen, Camera, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nProvider";

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  cpf: string;
  education_level: string;
  is_active: boolean;
  created_at: string;
  enrollments_count?: number;
}

interface Course {
  id: string;
  title: string;
  monthly_price: number;
}

import { EnrollStudentInCourseDialog } from "@/components/admin/EnrollStudentInCourseDialog";

const StudentsManagement = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToEnroll, setStudentToEnroll] = useState<{ id: string, name: string } | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0
  });

  const [formData, setFormData] = useState({
    // Dados Pessoais
    full_name: "",
    email: "",
    phone: "",
    birth_date: "",
    gender: "",
    // Fotos
    profile_photo: null as File | null,
    selfie_photo: null as File | null,
    // Documentos (Opcionais agora)
    cpf: "",
    rg: "",
    rg_issuer: "",
    doc_type_1: "cpf",
    doc_number_1: "",
    doc_country_1: "Brasil",
    doc_type_2: "",
    doc_number_2: "",
    doc_country_2: "",
    doc_type_3: "",
    doc_number_3: "",
    doc_country_3: "",
    // Endereço
    address: "",
    address_number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
    country: "Brasil",
    // Acadêmico
    education_level: "medio",
    institution: "",
    // Acesso
    password: "",
    confirm_password: "",
    send_credentials: true
  });

  useEffect(() => {
    loadStudents();
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("id, title, monthly_price")
      .eq("is_active", true)
      .order("title");

    setCourses(data || []);
  };

  const loadStudents = async () => {
    try {
      // Busca simplificada direto da tabela profiles
      // (Requer que a coluna 'role' esteja populada, o que garantimos nos scripts recentes)
      const { data, error } = await supabase
        .from("profiles")
        .select(`
            id,
            full_name,
            email,
            phone,
            cpf,
            education_level,
            is_active,
            created_at
        `)
        .eq("role", "student");

      if (error) throw error;

      const studentsList: Student[] = (data || []).map((profile: any) => ({
        id: profile.id,
        full_name: profile.full_name || "Sem Nome",
        email: profile.email || "",
        phone: profile.phone || "",
        cpf: profile.cpf || "",
        education_level: profile.education_level || "medio",
        is_active: !!profile.is_active,
        created_at: profile.created_at,
        enrollments_count: 0,
      }));

      const studentIds = studentsList.map(s => s.id);
      let enrollmentCounts: Record<string, number> = {};
      if (studentIds.length > 0) {
        const { data: enrollments } = await supabase
          .from("student_enrollments")
          .select("student_id");
        enrollmentCounts = (enrollments || []).reduce((acc: Record<string, number>, e) => {
          acc[e.student_id] = (acc[e.student_id] || 0) + 1;
          return acc;
        }, {});
      }

      setStudents(studentsList.map(s => ({
        ...s,
        enrollments_count: enrollmentCounts[s.id] || 0,
      })));

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      setStats({
        total: studentsList.length,
        active: studentsList.filter(s => s.is_active).length,
        inactive: studentsList.filter(s => !s.is_active).length,
        newThisMonth: studentsList.filter(s => new Date(s.created_at) >= startOfMonth).length
      });

      setLoading(false);
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Erro ao carregar alunos");
      setLoading(false);
    }
  };

  const generateEnrollmentNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
    return `${year}${random}`;
  };

  const handleCreateStudent = async () => {
    // Validação mínima: Nome, Email e Senha (CPF não é mais obrigatório aqui)
    if (!formData.full_name || !formData.email || !formData.password) {
      toast.error("Preencha Nome, Email e Senha (obrigatórios)");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      // 1. Criar usuário no Auth
      const cleanEmail = formData.email.trim();
      const cleanName = formData.full_name.trim();
      const cleanCpf = formData.cpf.trim(); // Pode estar vazio agora

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: cleanName,
            cpf: cleanCpf,
            phone: formData.phone,
            education_level: formData.education_level,
            role: "student" // Trigger will handle confirmation
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // CORREÇÃO CRÍTICA: Confirmar email manualmente no front (apenas para Admins criando alunos)
        // Isso "engana" o supabase client para achar que o email já foi validado,
        // dependendo da configuração do projeto (Auto Confirm emails deve estar ON no Supabase)

        // 1.5 GARANTIA DE PERFIL (Upsert manual para caso o trigger falhe)
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: authData.user.id,
            full_name: cleanName,
            email: cleanEmail,
            role: "student",
            is_active: true,
            cpf: cleanCpf || null,
            phone: formData.phone || null,
            education_level: formData.education_level || "medio",
            created_at: new Date().toISOString()
          });

        if (profileError) {
          console.error("Erro ao criar perfil manual:", profileError);
          // Não paramos o fluxo, mas logamos o erro
        }

        // 2. Adicionar role de student
        // Verifica se já existe (criado pelo trigger) antes de tentar inserir
        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", authData.user.id)
          .eq("role", "student")
          .maybeSingle();

        if (!existingRole) {
          // Se não existe, tenta criar
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({ user_id: authData.user.id, role: "student" });

          // Se der erro de duplicidade (race condition), ignoramos
          if (roleError && roleError.code !== '23505') {
            console.warn("Aviso ao definir role:", roleError);
          }
        }

        // 3. Criar matrículas nos cursos selecionados
        if (selectedCourses.length > 0) {
          const enrollments = selectedCourses.map(courseId => ({
            student_id: authData.user!.id,
            course_id: courseId,
            is_active: true
          }));

          const { error: enrollError } = await supabase
            .from("student_enrollments")
            .insert(enrollments);

          if (enrollError) throw enrollError;

          // 4. Criar pagamentos iniciais
          const selectedCoursesData = courses.filter(c => selectedCourses.includes(c.id));
          const payments = selectedCoursesData.map(course => ({
            student_id: authData.user!.id,
            course_id: course.id,
            amount: course.monthly_price,
            due_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
            status: "pending" as const
          }));

          if (payments.length > 0) {
            await supabase.from("payments").insert(payments);
          }
        }

        // 5. Gerar credencial do aluno
        const enrollmentNumber = generateEnrollmentNumber();
        const { error: credError } = await supabase
          .from("student_credentials")
          .insert({
            student_id: authData.user.id,
            enrollment_number: enrollmentNumber,
            qr_code_data: `FAITEL-${enrollmentNumber}-${authData.user.id}`,
            valid_until: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
          });

        if (credError) console.error("Error creating credential:", credError);

        toast.success(`Aluno cadastrado com sucesso! Matrícula: ${enrollmentNumber}`);
        setIsDialogOpen(false);
        resetForm();
        loadStudents();
      }
    } catch (error: any) {
      console.error("Error creating student:", error);
      toast.error(error.message || "Erro ao cadastrar aluno");
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      birth_date: "",
      gender: "",
      cpf: "",
      rg: "",
      rg_issuer: "",
      doc_type_1: "cpf",
      doc_number_1: "",
      doc_country_1: "Brasil",
      doc_type_2: "",
      doc_number_2: "",
      doc_country_2: "",
      doc_type_3: "",
      doc_number_3: "",
      doc_country_3: "",
      address: "",
      address_number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: "",
      country: "Brasil",
      education_level: "medio",
      institution: "",
      password: "",
      confirm_password: "",
      send_credentials: true
    });
    setSelectedCourses([]);
    setCurrentStep(1);
  };

  const toggleStudentStatus = async (studentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !currentStatus })
        .eq("id", studentId);

      if (error) throw error;

      toast.success(`Aluno ${!currentStatus ? "ativado" : "desativado"} com sucesso`);
      loadStudents();
    } catch (error: any) {
      console.error("Error toggling status:", error);
      toast.error(`Erro ao alterar status: ${error.message || "Erro desconhecido"}`);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita e removerá todos os dados associados (matrículas, notas, etc).")) {
      return;
    }

    try {
      // Delete from profiles (auth user deletion requires admin API, usually we just delete profile/data)
      // Note: If foreign keys are set to CASCADE, this will delete related data.
      // If not, we might need to delete related data first.
      // Assuming CASCADE or that we just want to try deleting the profile row.

      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", studentId);

      if (error) throw error;

      toast.success(t("dashboards.admin.students.deleted_success"));
      loadStudents();
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast.error(`${t("dashboards.admin.actions.delete_error")}: ${error.message || t("common.unknown_error")}`);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "Nome,Email,CPF,Telefone,Escolaridade,Status,Matrículas,Data Cadastro\n";
    filteredStudents.forEach(s => {
      csvContent += `"${s.full_name}","${s.email}","${s.cpf}","${s.phone}","${getEducationLabel(s.education_level)}","${s.is_active ? t("common.active") : t("common.inactive")}",${s.enrollments_count},"${formatDate(s.created_at)}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "alunos_faitel.csv";
    link.click();
    toast.success(t("dashboards.admin.actions.export_success"));
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cpf.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && student.is_active) ||
      (statusFilter === "inactive" && !student.is_active);

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getEducationLabel = (level: string) => {
    return t(`dashboards.admin.students.education_levels.${level}`, { defaultValue: level });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
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
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("common.back")}
              </Button>
              <h1 className="text-xl font-display font-bold">{t("dashboards.admin.management.students")}</h1>
            </div>
            <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("dashboards.admin.students.new")}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{t("dashboards.admin.stats.total_students")}</p>
              <p className="text-3xl font-display font-bold text-primary">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{t("common.active")}s</p>
              <p className="text-3xl font-display font-bold text-green-600">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{t("common.inactive")}s</p>
              <p className="text-3xl font-display font-bold text-red-600">{stats.inactive}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{t("dashboards.admin.stats.new_this_month")}</p>
              <p className="text-3xl font-display font-bold text-amber-600">{stats.newThisMonth}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("dashboards.admin.students.search_placeholder")}
                  value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">{t("common.active")}s</SelectItem>
                  <SelectItem value="inactive">{t("common.inactive")}s</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
                <Download className="h-4 w-4" />
                {t("dashboards.admin.actions.export")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboards.admin.students.list")} ({filteredStudents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.name")}</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">CPF</TableHead>
                    <TableHead className="hidden lg:table-cell">Escolaridade</TableHead>
                    <TableHead className="hidden md:table-cell">{t("dashboards.admin.management.enrollments")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead className="hidden lg:table-cell">Cadastro</TableHead>
                    <TableHead className="text-right">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{student.cpf}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline">{getEducationLabel(student.education_level)}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{student.enrollments_count || 0}</TableCell>
                      <TableCell>
                        <Badge variant={student.is_active ? "default" : "secondary"}>
                          {student.is_active ? t("common.active") : t("common.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{formatDate(student.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedStudent(student); setIsViewDialogOpen(true); }}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t("dashboards.admin.actions.view_details")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setStudentToEnroll({ id: student.id, name: student.full_name });
                              setIsEnrollDialogOpen(true);
                            }}>
                              <BookOpen className="h-4 w-4 mr-2" />
                              {t("dashboards.admin.courses.enroll_student")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/alunos/${student.id}/desempenho`)}>
                              <TrendingUp className="h-4 w-4 mr-2" />
                              {t("dashboards.admin.students.performance")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              {t("dashboards.admin.actions.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              {t("dashboards.admin.actions.send_email")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStudentStatus(student.id, student.is_active)}>
                              {student.is_active ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  {t("dashboards.admin.actions.deactivate")}
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  {t("dashboards.admin.actions.activate")}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteStudent(student.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t("dashboards.admin.actions.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {t("dashboards.admin.students.no_found")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Dialog de Cadastro Completo */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              Cadastro de {t("dashboards.admin.students.new")}
            </DialogTitle>
            <DialogDescription>
              Preencha todos os dados do aluno para realizar o cadastro e matrícula.
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 py-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${currentStep >= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-1 ${currentStep > step ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center text-sm text-muted-foreground mb-4">
            {currentStep === 1 && "Dados Pessoais"}
            {currentStep === 2 && "Documentos"}
            {currentStep === 3 && "Endereço e Acadêmico"}
            {currentStep === 4 && "Cursos e Acesso"}
          </div>

          {/* Step 1: Dados Pessoais */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>{t("common.name")}</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Nome completo do aluno"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label>{t("common.phone")}</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label>{t("common.birth_date")}</Label>
                  <Input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t("common.gender")}</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                      <SelectItem value="nao_informar">Prefiro não informar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Fotos e Documentos */}
          {currentStep === 2 && (
            <div className="space-y-6">

              {/* Seção de Fotos */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Foto do Aluno (PC)
                    </CardTitle>
                    <CardDescription>Carregue uma foto do computador</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer relative">
                      <Input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFormData({ ...formData, profile_photo: file });
                        }}
                      />
                      {formData.profile_photo ? (
                        <div className="text-center">
                          <p className="font-medium text-primary">{formData.profile_photo.name}</p>
                          <p className="text-xs text-muted-foreground">Clique para alterar</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">Clique para selecionar</p>
                          <p className="text-xs text-muted-foreground">JPG, PNG</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Selfie (Celular)
                    </CardTitle>
                    <CardDescription>Carregue uma selfie do celular</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer relative">
                      <Input
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFormData({ ...formData, selfie_photo: file });
                        }}
                      />
                      {formData.selfie_photo ? (
                        <div className="text-center">
                          <p className="font-medium text-primary">{formData.selfie_photo.name}</p>
                          <p className="text-xs text-muted-foreground">Clique para alterar</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">Tirar foto ou selecionar</p>
                          <p className="text-xs text-muted-foreground">JPG, PNG</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documento Principal (Opcional)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Tipo de Documento</Label>
                      <Select
                        value={formData.doc_type_1}
                        onValueChange={(value) => setFormData({ ...formData, doc_type_1: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpf">CPF</SelectItem>
                          <SelectItem value="passaporte">Passaporte</SelectItem>
                          <SelectItem value="nif">NIF</SelectItem>
                          <SelectItem value="dni">DNI</SelectItem>
                          <SelectItem value="ssn">SSN</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Número</Label>
                      <Input
                        value={formData.cpf}
                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div>
                      <Label>País Emissor</Label>
                      <Input
                        value={formData.doc_country_1}
                        onChange={(e) => setFormData({ ...formData, doc_country_1: e.target.value })}
                        placeholder="Brasil"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">RG / Identidade (Opcional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Número do RG</Label>
                      <Input
                        value={formData.rg}
                        onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                        placeholder="00.000.000-0"
                      />
                    </div>
                    <div>
                      <Label>Órgão Emissor</Label>
                      <Input
                        value={formData.rg_issuer}
                        onChange={(e) => setFormData({ ...formData, rg_issuer: e.target.value })}
                        placeholder="SSP/SP"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Endereço e Acadêmico */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Label>{t("common.zip_code")}</Label>
                      <Input
                        value={formData.zip_code}
                        onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>{t("common.country")}</Label>
                      <Input
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Label>{t("common.address")}</Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Rua, Avenida..."
                      />
                    </div>
                    <div>
                      <Label>{t("common.number")}</Label>
                      <Input
                        value={formData.address_number}
                        onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                        placeholder="123"
                      />
                    </div>
                    <div>
                      <Label>{t("common.complement")}</Label>
                      <Input
                        value={formData.complement}
                        onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                        placeholder="Apto, Bloco..."
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>{t("common.neighborhood")}</Label>
                      <Input
                        value={formData.neighborhood}
                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                        placeholder="Bairro"
                      />
                    </div>
                    <div>
                      <Label>{t("common.city")}</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Cidade"
                      />
                    </div>
                    <div>
                      <Label>{t("common.state")}</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="SP"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Informações Acadêmicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>{t("dashboards.admin.students.education_level")}</Label>
                      <Select
                        value={formData.education_level}
                        onValueChange={(value) => setFormData({ ...formData, education_level: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fundamental">Ensino Fundamental</SelectItem>
                          <SelectItem value="medio">Ensino Médio</SelectItem>
                          <SelectItem value="superior">Ensino Superior</SelectItem>
                          <SelectItem value="pos_graduacao">Pós-Graduação</SelectItem>
                          <SelectItem value="mestrado">Mestrado</SelectItem>
                          <SelectItem value="doutorado">Doutorado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Instituição de Origem</Label>
                      <Input
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        placeholder="Nome da última instituição"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Cursos e Acesso */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Selecionar Cursos para Matrícula</CardTitle>
                  <CardDescription>
                    Selecione os cursos em que o aluno será matriculado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {courses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum curso disponível. Cadastre cursos primeiro.
                    </p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-3">
                      {courses.map((course) => (
                        <div
                          key={course.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedCourses.includes(course.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                            }`}
                          onClick={() => {
                            if (selectedCourses.includes(course.id)) {
                              setSelectedCourses(selectedCourses.filter(c => c !== course.id));
                            } else {
                              setSelectedCourses([...selectedCourses, course.id]);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedCourses.includes(course.id)}
                              onCheckedChange={() => { }}
                            />
                            <div className="flex-1">
                              <p className="font-medium">{course.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(course.monthly_price)}/mês
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedCourses.length > 0 && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">
                        {selectedCourses.length} curso(s) selecionado(s)
                      </p>
                      <p className="text-lg font-bold text-primary">
                        Total: {formatCurrency(
                          courses
                            .filter(c => selectedCourses.includes(c.id))
                            .reduce((sum, c) => sum + c.monthly_price, 0)
                        )}/mês
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Dados de Acesso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>{t("auth.password")}</Label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    <div>
                      <Label>{t("auth.confirm_password")}</Label>
                      <Input
                        type="password"
                        value={formData.confirm_password}
                        onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                        placeholder="Repita a senha"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="send_credentials"
                      checked={formData.send_credentials}
                      onCheckedChange={(checked) => setFormData({ ...formData, send_credentials: checked as boolean })}
                    />
                    <Label htmlFor="send_credentials" className="text-sm cursor-pointer">
                      Enviar credenciais de acesso por email
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              {t("common.back")}
            </Button>
            {currentStep < 4 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                {t("common.next")}
              </Button>
            ) : (
              <Button onClick={handleCreateStudent} className="bg-primary">
                <User className="h-4 w-4 mr-2" />
                {t("dashboards.admin.students.new")}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("dashboards.admin.actions.view_details")}</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nome Completo</Label>
                  <p className="font-medium">{selectedStudent.full_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedStudent.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">CPF</Label>
                  <p className="font-medium">{selectedStudent.cpf}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telefone</Label>
                  <p className="font-medium">{selectedStudent.phone || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Escolaridade</Label>
                  <p className="font-medium">{getEducationLabel(selectedStudent.education_level)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={selectedStudent.is_active ? "default" : "secondary"}>
                    {selectedStudent.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Matrículas</Label>
                  <p className="font-medium">{selectedStudent.enrollments_count || 0} curso(s)</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data de Cadastro</Label>
                  <p className="font-medium">{formatDate(selectedStudent.created_at)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {studentToEnroll && (
        <EnrollStudentInCourseDialog
          open={isEnrollDialogOpen}
          onOpenChange={setIsEnrollDialogOpen}
          studentId={studentToEnroll.id}
          studentName={studentToEnroll.name}
          onSuccess={() => {
            loadStudents();
            toast.success("Matrícula realizada com sucesso!");
          }}
        />
      )}
    </div>
  );
};

export default StudentsManagement;
