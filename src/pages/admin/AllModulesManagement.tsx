import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Search, BookOpen, MoreVertical, Eye, Edit, 
  Home, ChevronLeft, Layers, Video, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  course_id: string;
  course_title?: string;
  lessons_count?: number;
  created_at: string;
}

const AllModulesManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const { data: modulesData, error } = await supabase
        .from("modules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get courses
      const { data: courses } = await supabase.from("courses").select("id, title");
      const courseMap = new Map(courses?.map(c => [c.id, c.title]) || []);

      // Get lessons count
      const { data: lessons } = await supabase.from("lessons").select("module_id");
      const lessonsCount = lessons?.reduce((acc: Record<string, number>, l) => {
        acc[l.module_id] = (acc[l.module_id] || 0) + 1;
        return acc;
      }, {}) || {};

      const enrichedModules = (modulesData || []).map(m => ({
        ...m,
        course_title: courseMap.get(m.course_id) || "Curso não encontrado",
        lessons_count: lessonsCount[m.id] || 0
      }));

      setModules(enrichedModules);
      setLoading(false);
    } catch (error) {
      console.error("Error loading modules:", error);
      toast.error("Erro ao carregar módulos");
      setLoading(false);
    }
  };

  const filteredModules = modules.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                <Home className="h-5 w-5" />
              </Link>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <h1 className="text-xl font-display font-bold">Todos os Módulos</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Módulos</p>
                <p className="text-2xl font-bold">{modules.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Video className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Aulas</p>
                <p className="text-2xl font-bold">{modules.reduce((acc, m) => acc + (m.lessons_count || 0), 0)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar módulos ou cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Módulos ({filteredModules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Aulas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell>
                      <Badge variant="outline">{module.order_index}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{module.title}</TableCell>
                    <TableCell>{module.course_title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        {module.lessons_count}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/cursos/${module.course_id}/modulos/${module.id}/aulas`)}>
                            <Video className="h-4 w-4 mr-2" />
                            Gerenciar Aulas
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/admin/provas/${module.id}`)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Gerenciar Provas
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredModules.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum módulo encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AllModulesManagement;
