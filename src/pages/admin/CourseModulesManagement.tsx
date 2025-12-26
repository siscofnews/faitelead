import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ChevronLeft, Home, Plus, GripVertical, FileText, Video, Trash2,
  Edit, Upload, Youtube, File as FileIcon, FileSpreadsheet, MoreVertical, Eye,
  ClipboardList, CheckCircle, XCircle, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Course {
  id: string;
  title: string;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  materials?: Material[];
  exam?: Exam;
}

interface Material {
  id: string;
  title: string;
  description: string | null;
  material_type: string;
  file_url: string | null;
  youtube_url: string | null;
  order_index: number;
  is_required: boolean;
}

interface Exam {
  id: string;
  title: string;
  passing_score: number;
  total_questions: number;
  max_attempts: number;
  retry_wait_days: number;
  retry_fee: number;
}

const CourseModulesManagement = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);

  // Module dialog
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });

  // Material dialog
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [materialForm, setMaterialForm] = useState({
    title: "",
    description: "",
    material_type: "pdf",
    youtube_url: ""
  });
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const materialFileRef = useRef<HTMLInputElement>(null);
  const [materialFile, setMaterialFile] = useState<File | null>(null);

  // Exam dialog
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [examForm, setExamForm] = useState({
    title: "",
    passing_score: 70,
    total_questions: 10,
    max_attempts: 3,
    retry_wait_days: 7,
    retry_fee: 0
  });

  useEffect(() => {
    if (courseId) loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      // Carregar curso
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title")
        .eq("id", courseId)
        .maybeSingle();

      if (courseError) throw courseError;
      if (!courseData) {
        toast.error("Curso não encontrado");
        navigate("/admin/cursos");
        return;
      }
      setCourse(courseData);

      // Primeiro, buscar subjects do curso
      const { data: subjectsData } = await supabase
        .from("course_subjects")
        .select("id")
        .eq("course_id", courseId);

      const subjectIds = (subjectsData || []).map(s => s.id);

      // Buscar módulos por course_id OU por subject_id  
      let modulesData: any[] = [];

      if (subjectIds.length > 0) {
        // Buscar módulos que pertencem aos subjects deste curso
        const { data: subjectModules } = await supabase
          .from("modules")
          .select("*")
          .in("subject_id", subjectIds)
          .order("order_index");

        modulesData = subjectModules || [];
      }

      // Também buscar módulos que têm course_id direto
      const { data: courseModules } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      // Combinar ambos (evitando duplicatas por ID)
      const allModules = [...modulesData];
      (courseModules || []).forEach(cm => {
        if (!allModules.find(m => m.id === cm.id)) {
          allModules.push(cm);
        }
      });

      // Carregar materiais de cada módulo
      const moduleIds = allModules.map(m => m.id);

      let materials: any[] = [];
      let exams: any[] = [];

      if (moduleIds.length > 0) {
        const { data: materialsData } = await supabase
          .from("module_materials")
          .select("*")
          .in("module_id", moduleIds)
          .order("order_index");
        materials = materialsData || [];

        const { data: examsData } = await supabase
          .from("exams")
          .select("*")
          .in("module_id", moduleIds);
        exams = examsData || [];
      }

      // Agrupar materiais e exams por módulo
      const enrichedModules = allModules.map(m => ({
        ...m,
        materials: materials.filter(mat => mat.module_id === m.id),
        exam: exams.find(e => e.module_id === m.id)
      }));

      setModules(enrichedModules);
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      // Não mostrar erro toast - apenas permitir criar primeiro módulo
      setModules([]);
      setLoading(false);
    }
  };

  const handleSaveModule = async () => {
    try {
      if (!courseId) {
        console.error("No courseId found in URL parameters");
        toast.error("Erro: ID do curso não encontrado na URL.");
        return;
      }

      // Verificar SESSÃO primeiro (tentar renovar se expirada)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("❌ Sessão expirada ou inválida:", sessionError);
        toast.error("Sua sessão expirou. Por favor, faça login novamente.");
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
        return;
      }

      console.log("✅ Sessão válida para usuário:", session.user.email);

      // Verificar permissões
      const { data: roleRows, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (rolesError) {
        console.error("Erro ao verificar permissões:", rolesError);
        throw rolesError;
      }

      const allowedRoles = new Set(["admin", "super_admin", "director", "teacher"]);
      const hasPermission = (roleRows || []).some((r) => allowedRoles.has(r.role));
      if (!hasPermission) {
        toast.error("Sem permissão para salvar módulos. Verifique seu cargo no sistema.");
        return;
      }

      if (!moduleForm.title.trim()) {
        toast.error("Título é obrigatório");
        return;
      }

      if (editingModule) {
        const { error } = await supabase
          .from("modules")
          .update({
            title: moduleForm.title,
            description: moduleForm.description || null
          })
          .eq("id", editingModule.id);

        if (error) throw error;
        toast.success("Módulo atualizado!");
      } else {
        const nextOrder = modules.length > 0
          ? Math.max(...modules.map(m => m.order_index)) + 1
          : 1;

        const { error } = await supabase
          .from("modules")
          .insert({
            course_id: courseId,
            title: moduleForm.title,
            description: moduleForm.description || null,
            order_index: nextOrder
          });

        if (error) throw error;
        toast.success("Módulo criado!");
      }

      setModuleDialogOpen(false);
      setEditingModule(null);
      setModuleForm({ title: "", description: "" });
      loadData();
    } catch (error: any) {
      console.error("Error saving module:", error);

      // Tratamento específico para erros de autenticação
      if (error.message && error.message.includes("session")) {
        toast.error("Sessão expirada. Redirecionando para login...");
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
      } else {
        toast.error(`Erro ao salvar módulo: ${error.message || "Erro desconhecido"}`);
      }
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Tem certeza? Isso excluirá todos os materiais e provas deste módulo.")) return;

    try {
      const { error } = await supabase
        .from("modules")
        .delete()
        .eq("id", moduleId);

      if (error) throw error;
      toast.success("Módulo excluído!");
      loadData();
    } catch (error) {
      console.error("Error deleting module:", error);
      toast.error("Erro ao excluir módulo");
    }
  };

  const handleMaterialFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo 50MB");
        return;
      }
      setMaterialFile(file);

      // Auto-detect type
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') setMaterialForm(f => ({ ...f, material_type: 'pdf' }));
      else if (['doc', 'docx'].includes(ext || '')) setMaterialForm(f => ({ ...f, material_type: 'word' }));
      else if (['ppt', 'pptx'].includes(ext || '')) setMaterialForm(f => ({ ...f, material_type: 'powerpoint' }));
    }
  };

  const handleSaveMaterial = async () => {
    try {
      // Verificar SESSÃO primeiro
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("❌ Sessão expirada ou inválida:", sessionError);
        toast.error("Sua sessão expirou. Por favor, faça login novamente.");
        setUploadingMaterial(false);
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
        return;
      }

      if (!materialForm.title.trim()) {
        toast.error("Título é obrigatório");
        return;
      }

      if (materialForm.material_type === 'video' && !materialForm.youtube_url) {
        toast.error("URL do YouTube é obrigatória para vídeos");
        return;
      }

      if (materialForm.material_type !== 'video' && !materialFile) {
        toast.error("Arquivo é obrigatório");
        return;
      }

      setUploadingMaterial(true);

      let fileUrl = null;

      // Upload file if not video
      if (materialFile && materialForm.material_type !== 'video') {
        const fileExt = materialFile.name.split('.').pop();
        const fileName = `modules/${selectedModuleId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('course-materials')
          .upload(fileName, materialFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('course-materials')
          .getPublicUrl(fileName);

        fileUrl = urlData.publicUrl;
      }

      // Get next order
      const currentModule = modules.find(m => m.id === selectedModuleId);
      const nextOrder = currentModule?.materials?.length
        ? Math.max(...currentModule.materials.map(m => m.order_index)) + 1
        : 1;

      const { error } = await supabase
        .from("module_materials")
        .insert({
          module_id: selectedModuleId,
          title: materialForm.title,
          description: materialForm.description || null,
          material_type: materialForm.material_type,
          file_url: fileUrl,
          youtube_url: materialForm.material_type === 'video' ? materialForm.youtube_url : null,
          order_index: nextOrder
        });

      if (error) throw error;

      toast.success("Material adicionado!");
      setMaterialDialogOpen(false);
      setMaterialForm({ title: "", description: "", material_type: "pdf", youtube_url: "" });
      setMaterialFile(null);
      loadData();
    } catch (error: any) {
      console.error("Error saving material:", error);

      // Tratamento específico para erros de autenticação
      if (error.message && (error.message.includes("session") || error.message.includes("auth"))) {
        toast.error("Sessão expirada. Redirecionando para login...");
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
      } else {
        toast.error(`Erro ao salvar material: ${error.message || "Erro desconhecido"}`);
      }
    } finally {
      setUploadingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm("Excluir este material?")) return;

    try {
      const { error } = await supabase
        .from("module_materials")
        .delete()
        .eq("id", materialId);

      if (error) throw error;
      toast.success("Material excluído!");
      loadData();
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error("Erro ao excluir material");
    }
  };

  const handleSaveExam = async () => {
    try {
      if (!examForm.title.trim()) {
        toast.error("Título é obrigatório");
        return;
      }

      // Check if exam already exists
      const existingExam = modules.find(m => m.id === selectedModuleId)?.exam;

      if (existingExam) {
        const { error } = await supabase
          .from("exams")
          .update({
            title: examForm.title,
            passing_score: examForm.passing_score,
            total_questions: examForm.total_questions,
            max_attempts: examForm.max_attempts,
            retry_wait_days: examForm.retry_wait_days,
            retry_fee: examForm.retry_fee
          })
          .eq("id", existingExam.id);

        if (error) throw error;
        toast.success("Prova atualizada!");
      } else {
        const { error } = await supabase
          .from("exams")
          .insert({
            module_id: selectedModuleId,
            title: examForm.title,
            passing_score: examForm.passing_score,
            total_questions: examForm.total_questions,
            max_attempts: examForm.max_attempts,
            retry_wait_days: examForm.retry_wait_days,
            retry_fee: examForm.retry_fee
          });

        if (error) throw error;
        toast.success("Prova criada!");
      }

      setExamDialogOpen(false);
      setExamForm({
        title: "",
        passing_score: 70,
        total_questions: 10,
        max_attempts: 3,
        retry_wait_days: 7,
        retry_fee: 0
      });
      loadData();
    } catch (error) {
      console.error("Error saving exam:", error);
      toast.error("Erro ao salvar prova");
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'word': return <FileIcon className="h-4 w-4 text-blue-500" />;
      case 'powerpoint': return <FileSpreadsheet className="h-4 w-4 text-orange-500" />;
      case 'video': return <Youtube className="h-4 w-4 text-red-600" />;
      default: return <FileIcon className="h-4 w-4" />;
    }
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
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/cursos")}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-display font-bold">Módulos do Curso</h1>
                <p className="text-sm text-muted-foreground">{course?.title}</p>
              </div>
            </div>
            <Button onClick={() => {
              setEditingModule(null);
              setModuleForm({ title: "", description: "" });
              setModuleDialogOpen(true);
            }} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Módulo
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {modules.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum módulo cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando o primeiro módulo do curso
            </p>
            <Button onClick={() => setModuleDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Módulo
            </Button>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {modules.map((module, index) => (
              <AccordionItem key={module.id} value={module.id} className="border rounded-lg bg-card">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">{index + 1}</Badge>
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-semibold">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {module.materials?.length || 0} materiais •
                        {module.exam ? (
                          <span className="text-success ml-1">Prova configurada</span>
                        ) : (
                          <span className="text-warning ml-1">Sem prova</span>
                        )}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    {/* Module Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingModule(module);
                          setModuleForm({ title: module.title, description: module.description || "" });
                          setModuleDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedModuleId(module.id);
                          setMaterialDialogOpen(true);
                        }}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Adicionar Material
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedModuleId(module.id);
                          if (module.exam) {
                            setExamForm({
                              title: module.exam.title,
                              passing_score: module.exam.passing_score,
                              total_questions: module.exam.total_questions,
                              max_attempts: module.exam.max_attempts,
                              retry_wait_days: module.exam.retry_wait_days,
                              retry_fee: module.exam.retry_fee
                            });
                          } else {
                            setExamForm({
                              title: `Prova - ${module.title}`,
                              passing_score: 70,
                              total_questions: 10,
                              max_attempts: 3,
                              retry_wait_days: 7,
                              retry_fee: 0
                            });
                          }
                          setExamDialogOpen(true);
                        }}
                      >
                        <ClipboardList className="h-4 w-4 mr-1" />
                        {module.exam ? 'Editar Prova' : 'Criar Prova'}
                      </Button>
                      {module.exam && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/provas/${module.exam!.id}/questoes`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Gerenciar Questões
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteModule(module.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>

                    {/* Materials List */}
                    {module.materials && module.materials.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground">Materiais:</h4>
                        <div className="grid gap-2">
                          {module.materials.map((material) => (
                            <div
                              key={material.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                {getMaterialIcon(material.material_type)}
                                <div>
                                  <p className="font-medium text-sm">{material.title}</p>
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {material.material_type}
                                    {material.is_required && ' • Obrigatório'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {material.file_url && (
                                  <Button size="sm" variant="ghost" asChild>
                                    <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                                      <Eye className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                                {material.youtube_url && (
                                  <Button size="sm" variant="ghost" asChild>
                                    <a href={material.youtube_url} target="_blank" rel="noopener noreferrer">
                                      <Youtube className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => handleDeleteMaterial(material.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exam Info */}
                    {module.exam && (
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <ClipboardList className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold">{module.exam.title}</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Nota mínima</p>
                            <p className="font-semibold">{module.exam.passing_score}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Questões</p>
                            <p className="font-semibold">{module.exam.total_questions}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Tentativas</p>
                            <p className="font-semibold">{module.exam.max_attempts}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Taxa retry</p>
                            <p className="font-semibold">
                              {module.exam.retry_fee > 0
                                ? `R$ ${module.exam.retry_fee.toFixed(2)}`
                                : 'Grátis'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </main>

      {/* Module Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModule ? 'Editar Módulo' : 'Novo Módulo'}</DialogTitle>
            <DialogDescription>
              {editingModule ? 'Atualize as informações do módulo' : 'Crie um novo módulo para o curso'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título do Módulo *</Label>
              <Input
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="Ex: Introdução à Bibliologia"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="Descrição do módulo..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveModule}>
              {editingModule ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Material Dialog */}
      <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Material</DialogTitle>
            <DialogDescription>
              Adicione PDFs, Word, PowerPoint ou vídeos do YouTube
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={materialForm.title}
                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                placeholder="Ex: Apostila - Capítulo 1"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Material</Label>
              <Select
                value={materialForm.material_type}
                onValueChange={(value) => setMaterialForm({ ...materialForm, material_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="word">Word (DOC/DOCX)</SelectItem>
                  <SelectItem value="powerpoint">PowerPoint (PPT/PPTX)</SelectItem>
                  <SelectItem value="video">Vídeo do YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {materialForm.material_type === 'video' ? (
              <div className="space-y-2">
                <Label>URL do YouTube *</Label>
                <Input
                  value={materialForm.youtube_url}
                  onChange={(e) => setMaterialForm({ ...materialForm, youtube_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Arquivo *</Label>
                <input
                  type="file"
                  ref={materialFileRef}
                  onChange={handleMaterialFileSelect}
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  className="hidden"
                />
                <div
                  onClick={() => materialFileRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors text-center"
                >
                  {materialFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm">{materialFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Clique para selecionar arquivo</p>
                      <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, PPT, PPTX até 50MB</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={materialForm.description}
                onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                placeholder="Descrição do material..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMaterialDialogOpen(false)} disabled={uploadingMaterial}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMaterial} disabled={uploadingMaterial}>
              {uploadingMaterial ? 'Enviando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exam Dialog */}
      <Dialog open={examDialogOpen} onOpenChange={setExamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Prova</DialogTitle>
            <DialogDescription>
              Configure a prova do módulo. Alunos precisam de 70% para passar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título da Prova *</Label>
              <Input
                value={examForm.title}
                onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                placeholder="Ex: Prova - Módulo 1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nota Mínima (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={examForm.passing_score}
                  onChange={(e) => setExamForm({ ...examForm, passing_score: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Total de Questões</Label>
                <Input
                  type="number"
                  min={1}
                  value={examForm.total_questions}
                  onChange={(e) => setExamForm({ ...examForm, total_questions: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tentativas Grátis</Label>
                <Input
                  type="number"
                  min={1}
                  value={examForm.max_attempts}
                  onChange={(e) => setExamForm({ ...examForm, max_attempts: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Dias para Retry</Label>
                <Input
                  type="number"
                  min={0}
                  value={examForm.retry_wait_days}
                  onChange={(e) => setExamForm({ ...examForm, retry_wait_days: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Taxa Retry (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={examForm.retry_fee}
                  onChange={(e) => setExamForm({ ...examForm, retry_fee: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p><strong>Regras:</strong></p>
              <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                <li>Aluno tem {examForm.max_attempts} tentativas gratuitas</li>
                <li>Após as tentativas, deve pagar R$ {examForm.retry_fee.toFixed(2)} e aguardar {examForm.retry_wait_days} dias</li>
                <li>Precisa de {examForm.passing_score}% para ser aprovado</li>
                <li>Só pode avançar para próximo módulo após aprovação</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExamDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveExam}>Salvar Prova</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseModulesManagement;
