import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Search, Plus, Play, GripVertical, Home, ChevronLeft, 
  MoreVertical, Edit, Trash2, FileText, Upload, Clock, Youtube, File
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  pdf_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  created_at: string;
}

interface Module {
  id: string;
  title: string;
  course_id: string;
}

interface Course {
  id: string;
  title: string;
}

const LessonsManagement = () => {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [course, setCourse] = useState<Course | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtube_url: "",
    duration_minutes: 0,
    pdf_file: null as File | null
  });

  useEffect(() => {
    if (courseId && moduleId) {
      loadData();
    }
  }, [courseId, moduleId]);

  const loadData = async () => {
    try {
      // Carregar curso
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title")
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Carregar módulo
      const { data: moduleData, error: moduleError } = await supabase
        .from("modules")
        .select("id, title, course_id")
        .eq("id", moduleId)
        .single();

      if (moduleError) throw moduleError;
      setModule(moduleData);

      // Carregar aulas
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", moduleId)
        .order("order_index", { ascending: true });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
      setLoading(false);
    }
  };

  const uploadPDF = async (file: File, lessonTitle: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${courseId}/${moduleId}/${Date.now()}_${lessonTitle.replace(/\s+/g, '_')}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('course-materials')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('course-materials')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading PDF:", error);
      throw error;
    }
  };

  const handleSaveLesson = async () => {
    try {
      if (!formData.title || !formData.youtube_url) {
        toast.error("Título e URL do YouTube são obrigatórios");
        return;
      }

      setUploading(true);
      setUploadProgress(20);

      let pdfUrl = editingLesson?.pdf_url || null;

      // Upload do PDF se houver
      if (formData.pdf_file) {
        setUploadProgress(50);
        pdfUrl = await uploadPDF(formData.pdf_file, formData.title);
        setUploadProgress(80);
      }

      if (editingLesson) {
        // Atualizar aula existente
        const { error } = await supabase
          .from("lessons")
          .update({
            title: formData.title,
            description: formData.description || null,
            youtube_url: formData.youtube_url,
            duration_minutes: formData.duration_minutes || null,
            pdf_url: pdfUrl
          })
          .eq("id", editingLesson.id);

        if (error) throw error;
        toast.success("Aula atualizada com sucesso!");
      } else {
        // Criar nova aula
        const maxOrder = lessons.length > 0 
          ? Math.max(...lessons.map(l => l.order_index)) 
          : 0;

        const { error } = await supabase
          .from("lessons")
          .insert({
            module_id: moduleId,
            title: formData.title,
            description: formData.description || null,
            youtube_url: formData.youtube_url,
            duration_minutes: formData.duration_minutes || null,
            pdf_url: pdfUrl,
            order_index: maxOrder + 1
          });

        if (error) throw error;
        toast.success("Aula criada com sucesso!");
      }

      setUploadProgress(100);
      setDialogOpen(false);
      setEditingLesson(null);
      setFormData({
        title: "",
        description: "",
        youtube_url: "",
        duration_minutes: 0,
        pdf_file: null
      });
      loadData();
    } catch (error: any) {
      console.error("Error saving lesson:", error);
      toast.error(`Erro ao salvar aula: ${error.message || "Erro desconhecido"}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      youtube_url: lesson.youtube_url,
      duration_minutes: lesson.duration_minutes || 0,
      pdf_file: null
    });
    setDialogOpen(true);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta aula?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lessonId);

      if (error) throw error;
      toast.success("Aula excluída com sucesso!");
      loadData();
    } catch (error: any) {
      console.error("Error deleting lesson:", error);
      toast.error(`Erro ao excluir aula: ${error.message || "Erro desconhecido"}`);
    }
  };

  const handleRemovePDF = async (lessonId: string, pdfUrl: string) => {
    try {
      // Extrair o path do arquivo da URL
      const urlParts = pdfUrl.split('/course-materials/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('course-materials').remove([filePath]);
      }

      const { error } = await supabase
        .from("lessons")
        .update({ pdf_url: null })
        .eq("id", lessonId);

      if (error) throw error;
      toast.success("PDF removido com sucesso!");
      loadData();
    } catch (error) {
      console.error("Error removing PDF:", error);
      toast.error("Erro ao remover PDF");
    }
  };

  const extractYoutubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDuration = lessons.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);

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
              <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/cursos/${courseId}/modulos`)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Módulos
              </Button>
              <div>
                <h1 className="text-xl font-display font-bold">Aulas</h1>
                <p className="text-sm text-muted-foreground">{module?.title} • {course?.title}</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingLesson(null);
                setFormData({
                  title: "",
                  description: "",
                  youtube_url: "",
                  duration_minutes: 0,
                  pdf_file: null
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Aula
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingLesson ? "Editar Aula" : "Criar Nova Aula"}</DialogTitle>
                  <DialogDescription>
                    Preencha as informações da aula
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    <Label>Título da Aula *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Aula 1 - Introdução ao tema"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição da aula..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-500" />
                      URL do YouTube *
                    </Label>
                    <Input
                      value={formData.youtube_url}
                      onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    {formData.youtube_url && extractYoutubeId(formData.youtube_url) && (
                      <div className="mt-2 rounded-lg overflow-hidden aspect-video bg-muted">
                        <img 
                          src={`https://img.youtube.com/vi/${extractYoutubeId(formData.youtube_url)}/mqdefault.jpg`}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Duração (minutos)</Label>
                    <Input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                      placeholder="Ex: 45"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Material de Apoio (PDF)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setFormData({ ...formData, pdf_file: e.target.files?.[0] || null })}
                        className="flex-1"
                      />
                    </div>
                    {formData.pdf_file && (
                      <p className="text-sm text-muted-foreground">
                        Arquivo selecionado: {formData.pdf_file.name}
                      </p>
                    )}
                    {editingLesson?.pdf_url && !formData.pdf_file && (
                      <p className="text-sm text-success flex items-center gap-1">
                        <File className="h-3 w-3" />
                        PDF atual anexado
                      </p>
                    )}
                  </div>
                  {uploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-sm text-muted-foreground text-center">
                        Enviando... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={uploading}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveLesson} disabled={uploading}>
                    {uploading ? "Enviando..." : editingLesson ? "Salvar" : "Criar Aula"}
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
                <Play className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Aulas</p>
                <p className="text-2xl font-display font-bold">{lessons.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duração Total</p>
                <p className="text-2xl font-display font-bold">
                  {Math.floor(totalDuration / 60)}h {totalDuration % 60}min
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PDFs Anexados</p>
                <p className="text-2xl font-display font-bold">
                  {lessons.filter(l => l.pdf_url).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar aulas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          {filteredLessons.map((lesson, index) => {
            const videoId = extractYoutubeId(lesson.youtube_url);
            return (
              <Card key={lesson.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-muted-foreground cursor-grab">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="w-24 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {videoId ? (
                        <img 
                          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                          alt={lesson.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">#{index + 1}</span>
                        <h3 className="font-semibold truncate">{lesson.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {lesson.description || "Sem descrição"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {lesson.duration_minutes && (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {lesson.duration_minutes} min
                        </Badge>
                      )}
                      {lesson.pdf_url && (
                        <Badge variant="secondary" className="gap-1">
                          <FileText className="h-3 w-3" />
                          PDF
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditLesson(lesson)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {lesson.pdf_url && (
                            <>
                              <DropdownMenuItem asChild>
                                <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-4 w-4 mr-2" />
                                  Ver PDF
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRemovePDF(lesson.id, lesson.pdf_url!)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remover PDF
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir Aula
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredLessons.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma aula encontrada</p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Aula
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default LessonsManagement;
