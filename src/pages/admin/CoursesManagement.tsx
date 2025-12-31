import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Search, Plus, BookOpen, Users, Clock, Award,
  MoreVertical, Eye, Edit, Trash2, Home, ChevronLeft, Settings, Upload, Image, History, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseEditDialog } from "@/components/admin/CourseEditDialog";
import { CourseDeleteDialog } from "@/components/admin/CourseDeleteDialog";
import { CourseHistoryDialog } from "@/components/admin/CourseHistoryDialog";
import { EnrollStudentDialog } from "@/components/admin/EnrollStudentDialog";
import { BulkEnrollDialog } from "@/components/admin/BulkEnrollDialog";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useI18n } from "@/i18n/I18nProvider";

const COURSE_MODALITIES = [
  { value: "curso_livre", label: "Curso Livre" },
  { value: "basico", label: "Básico" },
  { value: "medio", label: "Médio / Técnico" },
  { value: "bacharel", label: "Bacharelado" },
  { value: "graduacao", label: "Graduação" },
  { value: "pos_graduacao", label: "Pós-Graduação" },
  { value: "mestrado", label: "Mestrado" },
  { value: "doutorado", label: "Doutorado" },
  { value: "extensao", label: "Extensão" },
  { value: "ead", label: "EAD" },
];

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration_months: number | null;
  total_hours: number | null;
  monthly_price: number;
  modality: string | null;
  mec_rating: number | null;
  is_active: boolean;
  created_at: string;
  modules_count?: number;
  students_count?: number;
}

const CoursesManagement = () => {
  const navigate = useNavigate();
  const { logAction } = useAuditLog();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dialog states for edit, delete, and history
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Enrollment dialog states
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [bulkEnrollDialogOpen, setBulkEnrollDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [deletingAllCourses, setDeletingAllCourses] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_months: 12,
    total_hours: 540,
    monthly_price: 299,
    modality: ""
  });


  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      console.log('🔍 LOADING COURSES FROM SUPABASE...');

      // Tentar carregar do Supabase primeiro
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 SUPABASE RESPONSE:', coursesData);
      console.log('❌ SUPABASE ERROR:', error);

      // Se deu erro 401 ou qualquer erro, USAR CURSOS MOCK!
      if (error) {
        console.warn('⚠️ Supabase falhou, usando CURSOS MOCK do localStorage');
        const mockCourses = getMockCourses();
        setCourses(mockCourses);
        setLoading(false);
        toast.info('Usando cursos de demonstração (localStorage)');
        return;
      }

      const rows = coursesData || [];
      console.log('📋 TOTAL COURSES:', rows.length);

      const enriched = [];
      for (const c of rows) {
        const { data: mods } = await supabase
          .from('modules')
          .select('id')
          .eq('course_id', c.id);

        enriched.push({ ...c, modules_count: mods?.length || 0, students_count: 0 });
      }
      console.log('✅ ENRICHED COURSES:', enriched);
      setCourses(enriched);
      setLoading(false);
    } catch (error) {
      console.error("Error loading courses:", error);
      console.warn('⚠️ Exception, usando CURSOS MOCK');
      const mockCourses = getMockCourses();
      setCourses(mockCourses);
      setLoading(false);
      toast.info('Usando cursos de demonstração');
    }
  };

  // Função helper para pegar cursos mock
  function getMockCourses() {
    // Cursos padrão
    const defaultCourses = [
      {
        id: "mock-1",
        title: "Teologia Básica",
        description: "Curso introdutório de teologia",
        thumbnail_url: "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=400",
        duration_months: 12,
        total_hours: 360,
        monthly_price: 99,
        modality: "ead",
        mec_rating: null,
        is_active: true,
        created_at: new Date().toISOString(),
        modules_count: 0,
        students_count: 0,
      },
      {
        id: "mock-2",
        title: "Teologia Sistemática",
        description: "Estudo aprofundado das doutrinas",
        thumbnail_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
        duration_months: 18,
        total_hours: 540,
        monthly_price: 120,
        modality: "ead",
        mec_rating: null,
        is_active: true,
        created_at: new Date().toISOString(),
        modules_count: 0,
        students_count: 0,
      },
      {
        id: "mock-3",
        title: "Bibliologia Avançada",
        description: "Estudo detalhado das Escrituras",
        thumbnail_url: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400",
        duration_months: 14,
        total_hours: 420,
        monthly_price: 110,
        modality: "ead",
        mec_rating: null,
        is_active: true,
        created_at: new Date().toISOString(),
        modules_count: 0,
        students_count: 0,
      },
    ];
    return defaultCourses;
  }

  const resetDemo = async () => {
    if (resetting) return;
    const confirmed = confirm(t("dashboards.admin.actions.confirm_reset_demo"));
    if (!confirmed) return;

    setResetting(true);
    try {
      const { data: authUser } = await supabase.auth.getUser();
      const user = authUser.user;
      if (!user) {
        toast.error("Usuário não autenticado");
        setResetting(false);
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!roleData || (roleData.role !== "super_admin" && roleData.role !== "admin")) {
        toast.error("Apenas administradores podem executar esta ação");
        setResetting(false);
        return;
      }

      const { data: lessonIds } = await supabase.from("lessons").select("id");
      if (lessonIds && lessonIds.length > 0) {
        await supabase.from("lessons").delete().in("id", lessonIds.map(l => l.id));
      }

      const { data: moduleIds } = await supabase.from("modules").select("id");
      if (moduleIds && moduleIds.length > 0) {
        await supabase.from("modules").delete().in("id", moduleIds.map(m => m.id));
      }

      const { data: enrollmentIds } = await supabase.from("student_enrollments").select("id");
      if (enrollmentIds && enrollmentIds.length > 0) {
        await supabase.from("student_enrollments").delete().in("id", enrollmentIds.map(e => e.id));
      }

      const { data: courseIds } = await supabase.from("courses").select("id");
      if (courseIds && courseIds.length > 0) {
        await supabase.from("courses").delete().in("id", courseIds.map(c => c.id));
      }

      const { data: studentRoleRows } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");
      const studentIds = (studentRoleRows || []).map(r => r.user_id);
      if (studentIds.length > 0) {
        await supabase.from("student_enrollments").delete().in("student_id", studentIds);
        await supabase.from("payments").delete().in("student_id", studentIds);
        await supabase.from("student_credentials").delete().in("student_id", studentIds);
        await supabase.from("user_roles").delete().in("user_id", studentIds);
        await supabase.from("profiles").delete().in("id", studentIds);
      }

      const { data: newCourse, error: courseErr } = await supabase
        .from("courses")
        .insert({
          title: "Curso de Demonstração",
          description: "Curso criado automaticamente para testes",
          duration_months: 6,
          total_hours: 180,
          monthly_price: 99,
          modality: "ead",
          is_active: true
        })
        .select()
        .single();

      if (courseErr) throw courseErr;

      const { error: moduleErr } = await supabase
        .from("modules")
        .insert({
          course_id: newCourse.id,
          title: "Módulo 1 - Introdução",
          description: "Módulo inicial de demonstração",
          order_index: 1
        });
      if (moduleErr) throw moduleErr;

      const demoEmail = `aluno.teste+${Date.now()}@faitel.com`;
      const demoPassword = "Teste123!";
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: { full_name: "Aluno de Teste" }
        }
      });
      let demoUserId = signUpData.user?.id || null;
      if (signUpErr && signUpErr.message && signUpErr.message.includes("already registered")) {
        // Usuário já existe com outro email; tentar recuperar pelo profiles
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", demoEmail)
          .maybeSingle();
        demoUserId = existingProfile?.id || null;
      } else if (signUpErr) {
        throw signUpErr;
      }
      if (!demoUserId) throw new Error("Falha ao obter ID do usuário de teste");

      // Garantir perfil aprovado e ativo
      await supabase.from("profiles").upsert({
        id: demoUserId,
        email: demoEmail,
        full_name: "Aluno de Teste",
        is_active: true,
        approval_status: "approved",
        education_level: "medio",
      });

      await supabase.from("user_roles").insert({ user_id: demoUserId, role: "student" });

      await supabase.from("student_enrollments").insert({
        student_id: demoUserId,
        course_id: newCourse.id,
        is_active: true,
        enrollment_type: "manual"
      });

      toast.success(`Dados de demonstração criados com sucesso!\nLogin de teste: ${demoEmail}\nSenha: ${demoPassword}`);
      await loadCourses();
    } catch (error: any) {
      console.error("Erro ao resetar e criar demo:", error);
      toast.error(`Erro ao criar demo: ${error.message || "Erro desconhecido"}`);
    } finally {
      setResetting(false);
    }
  };

  const wipeSystem = async () => {
    if (wiping) return;
    const confirmed = confirm(t("dashboards.admin.actions.confirm_wipe_system"));
    if (!confirmed) return;

    setWiping(true);
    try {
      const { data: authUser } = await supabase.auth.getUser();
      const user = authUser.user;
      if (!user) {
        toast.error("Usuário não autenticado");
        setWiping(false);
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!roleData || (roleData.role !== "super_admin" && roleData.role !== "admin")) {
        toast.error("Apenas administradores podem executar esta ação");
        setWiping(false);
        return;
      }

      const { error: rpcError } = await supabase.rpc("reset_system", { _confirm: true });
      if (rpcError) {
        if (
          (rpcError.message || "").includes("Could not find the function") ||
          (rpcError.message || "").includes("function")
        ) {
          const { data: materials } = await supabase.from("module_materials").select("id");
          if (materials?.length) await supabase.from("module_materials").delete().in("id", materials.map((m: any) => m.id));

          const { data: lessons } = await supabase.from("lessons").select("id");
          if (lessons?.length) await supabase.from("lessons").delete().in("id", lessons.map((l: any) => l.id));

          const { data: exams } = await supabase.from("exams").select("id");
          if (exams?.length) await supabase.from("exams").delete().in("id", exams.map((e: any) => e.id));

          const { data: subjects } = await supabase.from("subjects").select("id");
          if (subjects?.length) await supabase.from("subjects").delete().in("id", subjects.map((s: any) => s.id));

          const { data: progress } = await supabase.from("student_progress").select("id");
          if (progress?.length) await supabase.from("student_progress").delete().in("id", progress.map((p: any) => p.id));

          const { data: transcripts } = await supabase.from("academic_transcripts").select("id");
          if (transcripts?.length) await supabase.from("academic_transcripts").delete().in("id", transcripts.map((t: any) => t.id));

          const { data: calendar } = await supabase.from("academic_calendar").select("id");
          if (calendar?.length) await supabase.from("academic_calendar").delete().in("id", calendar.map((c: any) => c.id));

          const { data: enrollments } = await supabase.from("student_enrollments").select("id, student_id");
          if (enrollments?.length) await supabase.from("student_enrollments").delete().in("id", enrollments.map((e: any) => e.id));

          const studentIds = (enrollments || []).map((e: any) => e.student_id);
          if (studentIds.length) {
            const { data: payments } = await supabase.from("payments").select("id").in("student_id", studentIds);
            if (payments?.length) await supabase.from("payments").delete().in("id", payments.map((p: any) => p.id));
          }

          const { data: modules } = await supabase.from("modules").select("id");
          if (modules?.length) await supabase.from("modules").delete().in("id", modules.map((m: any) => m.id));

          const { data: courses } = await supabase.from("courses").select("id");
          if (courses?.length) await supabase.from("courses").delete().in("id", courses.map((c: any) => c.id));

          const { data: roleRows } = await supabase.from("user_roles").select("user_id").eq("role", "student");
          const wipeStudentIds = (roleRows || []).map((r: any) => r.user_id);
          if (wipeStudentIds.length) {
            const { data: creds } = await supabase.from("student_credentials").select("id").in("student_id", wipeStudentIds);
            if (creds?.length) await supabase.from("student_credentials").delete().in("id", creds.map((s: any) => s.id));
            await supabase.from("user_roles").delete().in("user_id", wipeStudentIds);
            await supabase.from("profiles").delete().in("id", wipeStudentIds);
          }
        } else {
          throw rpcError;
        }
      }

      toast.success("Sistema zerado com sucesso");
      await loadCourses();
    } catch (error: any) {
      console.error("Erro ao zerar sistema:", error);
      toast.error(`Erro ao zerar sistema: ${error.message || "Erro desconhecido"}`);
    } finally {
      setWiping(false);
    }
  };

  const deleteAllCourses = async () => {
    if (deletingAllCourses) return;
    const confirmed = confirm(t("dashboards.admin.confirm_delete_all_courses"));
    if (!confirmed) return;

    setDeletingAllCourses(true);
    try {
      const { data: authUser } = await supabase.auth.getUser();
      const user = authUser.user;
      if (!user) {
        toast.error("Usuário não autenticado");
        setDeletingAllCourses(false);
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!roleData || (roleData.role !== "super_admin" && roleData.role !== "admin")) {
        toast.error("Apenas administradores podem executar esta ação");
        setDeletingAllCourses(false);
        return;
      }

      const { data: courseRows } = await supabase.from("courses").select("id");
      const courseIds = (courseRows || []).map((c: any) => c.id);
      if (!courseIds.length) {
        toast.success("Nenhum curso para excluir");
        setDeletingAllCourses(false);
        return;
      }

      const { data: moduleRows } = await supabase
        .from("modules")
        .select("id")
        .in("course_id", courseIds);
      const moduleIds = (moduleRows || []).map((m: any) => m.id);

      if (moduleIds.length) {
        const { data: materialRows, error: matSelErr } = await supabase
          .from("module_materials")
          .select("id")
          .in("module_id", moduleIds);
        if (matSelErr) throw matSelErr;
        if (materialRows?.length) {
          const { error: matDelErr } = await supabase.from("module_materials").delete().in("id", materialRows.map((mm: any) => mm.id));
          if (matDelErr) throw matDelErr;
        }

        const { data: lessonRows, error: lesSelErr } = await supabase
          .from("lessons")
          .select("id")
          .in("module_id", moduleIds);
        if (lesSelErr) throw lesSelErr;
        if (lessonRows?.length) {
          const { error: lesDelErr } = await supabase.from("lessons").delete().in("id", lessonRows.map((l: any) => l.id));
          if (lesDelErr) throw lesDelErr;
        }

        const { data: examRows, error: exSelErr } = await supabase
          .from("exams")
          .select("id")
          .in("module_id", moduleIds);
        if (exSelErr) throw exSelErr;
        if (examRows?.length) {
          const { error: exDelErr } = await supabase.from("exams").delete().in("id", examRows.map((e: any) => e.id));
          if (exDelErr) throw exDelErr;
        }

        const { data: subjectRows, error: subSelErr } = await supabase
          .from("subjects")
          .select("id")
          .in("module_id", moduleIds);
        if (subSelErr) throw subSelErr;
        if (subjectRows?.length) {
          const { error: subDelErr } = await supabase.from("subjects").delete().in("id", subjectRows.map((s: any) => s.id));
          if (subDelErr) throw subDelErr;
        }
      }

      const { data: enrollmentRows, error: enrSelErr } = await supabase
        .from("student_enrollments")
        .select("id")
        .in("course_id", courseIds);
      if (enrSelErr) throw enrSelErr;
      if (enrollmentRows?.length) {
        const { error: enrDelErr } = await supabase.from("student_enrollments").delete().in("id", enrollmentRows.map((se: any) => se.id));
        if (enrDelErr) throw enrDelErr;
      }

      const { data: calRows, error: calSelErr } = await supabase
        .from("academic_calendar")
        .select("id")
        .in("course_id", courseIds);
      if (calSelErr) throw calSelErr;
      if (calRows?.length) {
        const { error: calDelErr } = await supabase
          .from("academic_calendar")
          .delete()
          .in("id", calRows.map((c: any) => c.id));
        if (calDelErr) throw calDelErr;
      }

      const { data: transcriptRows, error: trSelErr } = await supabase
        .from("academic_transcripts")
        .select("id")
        .in("course_id", courseIds);
      if (trSelErr) throw trSelErr;
      if (transcriptRows?.length) {
        const { error: trDelErr } = await supabase
          .from("academic_transcripts")
          .delete()
          .in("id", transcriptRows.map((t: any) => t.id));
        if (trDelErr) throw trDelErr;
      }

      const { data: paymentRows, error: paySelErr } = await supabase
        .from("payments")
        .select("id")
        .in("course_id", courseIds);
      if (paySelErr) throw paySelErr;
      if (paymentRows?.length) {
        const { error: payDelErr } = await supabase.from("payments").delete().in("id", paymentRows.map((p: any) => p.id));
        if (payDelErr) throw payDelErr;
      }

      if (moduleIds.length) {
        const { error: modDelErr } = await supabase.from("modules").delete().in("id", moduleIds);
        if (modDelErr) throw modDelErr;
      }

      const { error: courseDelErr } = await supabase.from("courses").delete().in("id", courseIds);
      if (courseDelErr) throw courseDelErr;

      toast.success("Todos os cursos foram excluídos");
      await loadCourses();
    } catch (error: any) {
      console.error("Erro ao excluir todos os cursos:", error);
      toast.error(`Erro ao excluir cursos: ${error.message || "Erro desconhecido"}`);
    } finally {
      setDeletingAllCourses(false);
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 5MB");
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadThumbnail = async (courseId: string): Promise<string | null> => {
    if (!thumbnailFile) return null;

    const fileExt = thumbnailFile.name.split('.').pop();
    const fileName = `courses/${courseId}/thumbnail.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('course-materials')
      .upload(fileName, thumbnailFile, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('course-materials')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleCreateCourse = async () => {
    try {
      if (!formData.title) {
        toast.error("Título é obrigatório");
        return;
      }

      setUploading(true);

      // Verificar SESSÃO primeiro (tentar renovar se expirada)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("❌ Sessão expirada ou inválida:", sessionError);
        toast.error("Sua sessão expirou. Por favor, faça login novamente.");
        setUploading(false);
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
        return;
      }

      console.log("✅ Sessão válida para usuário:", session.user.email);

      // Criar curso diretamente no Supabase (apenas colunas que existem)
      const { data: created, error: createError } = await supabase
        .from("courses")
        .insert({
          title: formData.title,
          description: formData.description || null,
          monthly_price: formData.monthly_price || 0,
          is_active: true
        })
        .select()
        .single();

      if (createError) throw createError;

      const newCourseId = created?.id;

      // Upload da imagem se existir
      if (thumbnailFile && newCourseId) {
        const thumbnailUrl = await uploadThumbnail(newCourseId);
        if (thumbnailUrl) {
          await supabase
            .from("courses")
            .update({ thumbnail_url: thumbnailUrl })
            .eq("id", newCourseId);
        }
      }

      // Log audit trail for course creation
      if (newCourseId) {
        await logAction(
          "INSERT",
          "courses",
          newCourseId,
          undefined,
          {
            title: formData.title,
            description: formData.description,
            duration_months: formData.duration_months,
            total_hours: formData.total_hours,
            monthly_price: formData.monthly_price,
            modality: formData.modality,
          }
        );
      }

      toast.success("Curso criado com sucesso!");
      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        duration_months: 12,
        total_hours: 540,
        monthly_price: 299,
        modality: "ead"
      });
      setThumbnailFile(null);
      setThumbnailPreview(null);
      loadCourses();
    } catch (error: any) {
      console.error("Error creating course:", error);

      // Tratamento específico para erros de autenticação
      if (error.message && (error.message.includes("session") || error.message.includes("auth"))) {
        toast.error("Sessão expirada. Redirecionando para login...");
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
      } else {
        toast.error(`Erro ao criar curso: ${error.message || "Erro desconhecido"}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const toggleCourseStatus = async (courseId: string, currentStatus: boolean) => {
    try {
      await api.updateCourse(courseId, { is_active: !currentStatus });

      toast.success(`Curso ${!currentStatus ? "ativado" : "desativado"} com sucesso`);
      loadCourses();
    } catch (error: any) {
      console.error("Error toggling status:", error);
      toast.error(`Erro ao alterar status: ${error.message || "Erro desconhecido"}`);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStudents = courses.reduce((acc, c) => acc + (c.students_count || 0), 0);

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
              <h1 className="text-xl font-display font-bold">{t("nav.courses")}</h1>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("dashboards.admin.courses.new")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{t("dashboards.admin.courses.new")}</DialogTitle>
                  <DialogDescription>
                    {t("dashboards.admin.courses.new_desc")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  {/* Upload de Imagem */}
                  <div className="space-y-2">
                    <Label>{t("auth.selfie_label")}</Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleThumbnailSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                    >
                      {thumbnailPreview ? (
                        <div className="relative">
                          <img
                            src={thumbnailPreview}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                            <p className="text-white text-sm">{t("auth.take_selfie_button")}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-4">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Clique para adicionar imagem</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG até 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("auth.fullname_label")} *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Bacharelado em Teologia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("common.message")}</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição do curso..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("common.deadline")} ({t("common.months")})</Label>
                      <Input
                        type="number"
                        value={formData.duration_months}
                        onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Carga Horária (h)</Label>
                      <Input
                        type="number"
                        value={formData.total_hours}
                        onChange={(e) => setFormData({ ...formData, total_hours: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Mensalidade (R$)</Label>
                      <Input
                        type="number"
                        value={formData.monthly_price}
                        onChange={(e) => setFormData({ ...formData, monthly_price: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nível / Modalidade *</Label>
                      <Select
                        value={formData.modality}
                        onValueChange={(value) => setFormData({ ...formData, modality: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                          {COURSE_MODALITIES.map((mod) => (
                            <SelectItem key={mod.value} value={mod.value}>
                              {mod.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={uploading}>{t("common.back")}</Button>
                  <Button onClick={handleCreateCourse} disabled={uploading}>
                    {uploading ? t("common.loading") : t("dashboards.admin.new_course")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="ml-2" onClick={resetDemo} disabled={resetting}>
              {resetting ? t("common.loading") : t("dashboards.admin.actions.reset_demo")}
            </Button>
            <Button variant="destructive" className="ml-2" onClick={wipeSystem} disabled={wiping}>
              {wiping ? t("common.loading") : t("dashboards.admin.actions.wipe_system")}
            </Button>
            <Button variant="destructive" className="ml-2" onClick={deleteAllCourses} disabled={deletingAllCourses}>
              {deletingAllCourses ? t("common.loading") : t("dashboards.admin.actions.delete_all_courses")}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("dashboards.admin.stats.total_courses")}</p>
                <p className="text-2xl font-display font-bold">{courses.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("dashboards.admin.stats.students_enrolled")}</p>
                <p className="text-2xl font-display font-bold">{totalStudents}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("dashboards.admin.stats.active_courses")}</p>
                <p className="text-2xl font-display font-bold">{courses.filter(c => c.is_active).length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("common.inactive")}</p>
                <p className="text-2xl font-display font-bold">{courses.filter(c => !c.is_active).length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("dashboards.admin.courses.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className={`overflow-hidden ${!course.is_active ? 'opacity-60' : ''}`}>
              <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-12 w-12 text-primary/50" />
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {course.description || "Sem descrição"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/admin/cursos/${course.id}/conteudo`)}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        {t("dashboards.admin.courses.manage_content")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        setSelectedCourse(course);
                        setEnrollDialogOpen(true);
                      }}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t("dashboards.admin.courses.enroll_student")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedCourse(course);
                        setBulkEnrollDialogOpen(true);
                      }}>
                        <Users className="h-4 w-4 mr-2" />
                        {t("dashboards.admin.courses.bulk_enroll")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        setSelectedCourse(course);
                        setHistoryDialogOpen(true);
                      }}>
                        <History className="h-4 w-4 mr-2" />
                        {t("dashboards.admin.courses.view_history")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        setSelectedCourse(course);
                        setEditDialogOpen(true);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t("dashboards.admin.actions.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleCourseStatus(course.id, course.is_active)}>
                        <Settings className="h-4 w-4 mr-2" />
                        {course.is_active ? t("dashboards.admin.actions.deactivate") : t("dashboards.admin.actions.activate")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedCourse(course);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("dashboards.admin.actions.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {course.modality && (
                    <Badge className="bg-primary">
                      {COURSE_MODALITIES.find(m => m.value === course.modality)?.label || course.modality}
                    </Badge>
                  )}
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {course.duration_months || 12} {t("common.months")}
                  </Badge>
                  <Badge variant="outline">
                    {course.total_hours || 540}h
                  </Badge>
                  {course.mec_rating && (
                    <Badge variant="default" className="bg-success">
                      MEC: {course.mec_rating}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{course.modules_count}</span> módulos •
                    <span className="font-medium text-foreground ml-1">{course.students_count}</span> alunos
                  </div>
                  <span className="font-display font-bold text-primary">
                    R$ {course.monthly_price}/mês
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("dashboards.admin.courses.no_found")}</p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t("dashboards.admin.courses.create_first")}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Edit Dialog */}
      {selectedCourse && (
        <CourseEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          course={selectedCourse}
          onSave={loadCourses}
        />
      )}

      {/* Delete Dialog */}
      {selectedCourse && (
        <CourseDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          course={selectedCourse}
          onDelete={loadCourses}
        />
      )}

      {/* History Dialog */}
      {selectedCourse && (
        <CourseHistoryDialog
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
        />
      )}

      {/* Enroll Student Dialog */}
      {selectedCourse && (
        <EnrollStudentDialog
          open={enrollDialogOpen}
          onOpenChange={setEnrollDialogOpen}
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
          onSuccess={loadCourses}
        />
      )}

      {/* Bulk Enroll Dialog */}
      {selectedCourse && (
        <BulkEnrollDialog
          open={bulkEnrollDialogOpen}
          onOpenChange={setBulkEnrollDialogOpen}
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
          onSuccess={loadCourses}
        />
      )}
    </div>
  );
};

export default CoursesManagement;
