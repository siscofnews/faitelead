import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Search, Plus, BookOpen, GripVertical, Home, ChevronLeft, 
  MoreVertical, Eye, Edit, Trash2, Play, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useI18n } from "@/i18n/I18nProvider";

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  lessons_count?: number;
}

interface Course {
  id: string;
  title: string;
}

const ModulesManagement = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: ""
  });

  useEffect(() => {
    if (courseId) {
      loadCourseAndModules();
    }
  }, [courseId]);

  const loadCourseAndModules = async () => {
    try {
      // Carregar curso
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title")
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Carregar módulos
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (modulesError) throw modulesError;

      // Buscar contagem de aulas
      const { data: lessons } = await supabase
        .from("lessons")
        .select("module_id");

      const lessonsCount = lessons?.reduce((acc: Record<string, number>, l) => {
        acc[l.module_id] = (acc[l.module_id] || 0) + 1;
        return acc;
      }, {}) || {};

      const enrichedModules = (modulesData || []).map(m => ({
        ...m,
        lessons_count: lessonsCount[m.id] || 0
      }));

      setModules(enrichedModules);
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
      setLoading(false);
    }
  };

  const handleSaveModule = async () => {
    try {
      if (!courseId) {
        toast.error("Erro: ID do curso não encontrado");
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) {
        toast.error("Você precisa estar logado para salvar o módulo");
        navigate("/auth");
        return;
      }

      const { data: roleRows, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id);

      if (rolesError) throw rolesError;

      const allowedRoles = new Set(["admin", "super_admin", "director", "teacher"]);
      const hasPermission = (roleRows || []).some(r => allowedRoles.has(r.role));
      if (!hasPermission) {
        toast.error("Sem permissão para salvar módulos. Verifique seu cargo no sistema.");
        return;
      }

      if (!formData.title) {
        toast.error("Título é obrigatório");
        return;
      }

      if (editingModule) {
        // Atualizar módulo existente
        const { error } = await supabase
          .from("modules")
          .update({
            title: formData.title,
            description: formData.description || null
          })
          .eq("id", editingModule.id);

        if (error) throw error;
        toast.success("Módulo atualizado com sucesso!");
      } else {
        // Criar novo módulo
        const maxOrder = modules.length > 0 
          ? Math.max(...modules.map(m => m.order_index)) 
          : 0;

        const { error } = await supabase
          .from("modules")
          .insert({
            course_id: courseId,
            title: formData.title,
            description: formData.description || null,
            order_index: maxOrder + 1
          });

        if (error) throw error;
        toast.success("Módulo criado com sucesso!");
      }

      setDialogOpen(false);
      setEditingModule(null);
      setFormData({ title: "", description: "" });
      loadCourseAndModules();
    } catch (error) {
      console.error("Error saving module:", error);
      const message =
        (error as any)?.message ||
        (error as any)?.error_description ||
        "Erro desconhecido";
      toast.error(`Erro ao salvar módulo: ${message}`);
    }
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      description: module.description || ""
    });
    setDialogOpen(true);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Tem certeza que deseja excluir este módulo? Todas as aulas serão excluídas também.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("modules")
        .delete()
        .eq("id", moduleId);

      if (error) throw error;
      toast.success("Módulo excluído com sucesso!");
      loadCourseAndModules();
    } catch (error) {
      console.error("Error deleting module:", error);
      toast.error("Erro ao excluir módulo");
    }
  };

  const filteredModules = modules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                {t("courses_management")}
              </Button>
              <div>
                <h1 className="text-xl font-display font-bold">{t("modules")}</h1>
                <p className="text-sm text-muted-foreground">{course?.title}</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingModule(null);
                setFormData({ title: "", description: "" });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("new_module")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingModule ? "Editar Módulo" : "Criar Novo Módulo"}</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do módulo
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Título do Módulo *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Módulo 1 - Introdução"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição do módulo..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("cancel")}</Button>
                  <Button onClick={handleSaveModule}>
                    {editingModule ? t("save") : t("create_module")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Módulos</p>
                <p className="text-2xl font-display font-bold">{modules.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Play className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Aulas</p>
                <p className="text-2xl font-display font-bold">
                  {modules.reduce((acc, m) => acc + (m.lessons_count || 0), 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar módulos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {filteredModules.map((module, index) => (
            <Card key={module.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-muted-foreground cursor-grab">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{module.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {module.description || "Sem descrição"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      <Play className="h-3 w-3 mr-1" />
                      {module.lessons_count} aulas
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/cursos/${courseId}/modulos/${module.id}/aulas`)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {t("manage_lessons")}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditModule(module)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteModule(module.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredModules.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum módulo encontrado</p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Módulo
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ModulesManagement;
