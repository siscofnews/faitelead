import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Search, Plus, Calendar, MoreVertical, Edit, Trash2, 
  Home, ChevronLeft, Clock, MapPin
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

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

const CalendarManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "general",
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("academic_calendar")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading events:", error);
      toast.error("Erro ao carregar eventos");
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.start_date) {
      toast.error("Preencha título e data de início");
      return;
    }

    try {
      const { error } = await supabase.from("academic_calendar").insert({
        title: formData.title,
        description: formData.description || null,
        event_type: formData.event_type,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        is_active: true
      });

      if (error) throw error;

      toast.success("Evento criado com sucesso!");
      setDialogOpen(false);
      setFormData({ title: "", description: "", event_type: "general", start_date: "", end_date: "" });
      loadEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Erro ao criar evento");
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    
    try {
      const { error } = await supabase.from("academic_calendar").delete().eq("id", id);
      if (error) throw error;
      toast.success("Evento excluído");
      loadEvents();
    } catch (error) {
      toast.error("Erro ao excluir evento");
    }
  };

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      general: { label: "Geral", color: "bg-blue-500" },
      exam: { label: "Prova", color: "bg-red-500" },
      holiday: { label: "Feriado", color: "bg-green-500" },
      enrollment: { label: "Matrícula", color: "bg-purple-500" },
      class: { label: "Aula", color: "bg-amber-500" },
      event: { label: "Evento", color: "bg-pink-500" }
    };
    return types[type] || { label: type, color: "bg-gray-500" };
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
              <h1 className="text-xl font-display font-bold">Calendário Acadêmico</h1>
            </div>
            <Button className="gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Novo Evento
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Eventos</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próximos</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => new Date(e.start_date) >= new Date()).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Eventos do Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Data Fim</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => {
                  const typeInfo = getEventTypeLabel(event.event_type);
                  return (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>
                        <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                      </TableCell>
                      <TableCell>{new Date(event.start_date).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        {event.end_date ? new Date(event.end_date).toLocaleDateString("pt-BR") : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={event.is_active ? "default" : "secondary"}>
                          {event.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => deleteEvent(event.id)} className="text-destructive">
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
            <DialogTitle>Novo Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título do evento"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do evento..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Evento</Label>
              <Select value={formData.event_type} onValueChange={(v) => setFormData({ ...formData, event_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Geral</SelectItem>
                  <SelectItem value="exam">Prova</SelectItem>
                  <SelectItem value="holiday">Feriado</SelectItem>
                  <SelectItem value="enrollment">Período de Matrícula</SelectItem>
                  <SelectItem value="class">Aula Especial</SelectItem>
                  <SelectItem value="event">Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Início *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Criar Evento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarManagement;
