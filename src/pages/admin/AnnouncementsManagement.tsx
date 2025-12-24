import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Search, Plus, Bell, MoreVertical, Edit, Trash2, 
  Home, ChevronLeft, Eye, Users, Calendar, Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  target_audience: string;
  is_active: boolean;
  published_at: string;
  expires_at: string | null;
  created_at: string;
}

const AnnouncementsManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info",
    target_audience: "all",
    expires_at: ""
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading announcements:", error);
      toast.error("Erro ao carregar comunicados");
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Preencha título e conteúdo");
      return;
    }

    try {
      const { error } = await supabase.from("announcements").insert({
        title: formData.title,
        content: formData.content,
        type: formData.type,
        target_audience: formData.target_audience,
        expires_at: formData.expires_at || null,
        is_active: true
      });

      if (error) throw error;

      toast.success("Comunicado criado com sucesso!");
      setDialogOpen(false);
      setFormData({ title: "", content: "", type: "info", target_audience: "all", expires_at: "" });
      loadAnnouncements();
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error("Erro ao criar comunicado");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Comunicado ${!currentStatus ? "ativado" : "desativado"}`);
      loadAnnouncements();
    } catch (error) {
      toast.error("Erro ao alterar status");
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este comunicado?")) return;
    
    try {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
      toast.success("Comunicado excluído");
      loadAnnouncements();
    } catch (error) {
      toast.error("Erro ao excluir comunicado");
    }
  };

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeLabel = (type: string) => {
    const types: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
      info: { label: "Informativo", variant: "default" },
      warning: { label: "Aviso", variant: "secondary" },
      urgent: { label: "Urgente", variant: "destructive" },
      success: { label: "Sucesso", variant: "outline" }
    };
    return types[type] || { label: type, variant: "default" as const };
  };

  const getAudienceLabel = (audience: string) => {
    const audiences: Record<string, string> = {
      all: "Todos",
      students: "Alunos",
      teachers: "Professores",
      admins: "Administradores"
    };
    return audiences[audience] || audience;
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
              <h1 className="text-xl font-display font-bold">Comunicados</h1>
            </div>
            <Button className="gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Novo Comunicado
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Megaphone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{announcements.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Bell className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{announcements.filter(a => a.is_active).length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar comunicados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Comunicados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Público</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.map((announcement) => {
                  const typeInfo = getTypeLabel(announcement.type);
                  return (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">{announcement.title}</TableCell>
                      <TableCell>
                        <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                      </TableCell>
                      <TableCell>{getAudienceLabel(announcement.target_audience)}</TableCell>
                      <TableCell>
                        <Badge variant={announcement.is_active ? "default" : "secondary"}>
                          {announcement.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(announcement.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleStatus(announcement.id, announcement.is_active)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {announcement.is_active ? "Desativar" : "Ativar"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteAnnouncement(announcement.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Comunicado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título do comunicado"
              />
            </div>
            <div className="space-y-2">
              <Label>Conteúdo *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Conteúdo do comunicado..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Informativo</SelectItem>
                    <SelectItem value="warning">Aviso</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="success">Sucesso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Público Alvo</Label>
                <Select value={formData.target_audience} onValueChange={(v) => setFormData({ ...formData, target_audience: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="students">Alunos</SelectItem>
                    <SelectItem value="teachers">Professores</SelectItem>
                    <SelectItem value="admins">Administradores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Expira em (opcional)</Label>
              <Input
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Criar Comunicado</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementsManagement;
