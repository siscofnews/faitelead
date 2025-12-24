import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Search, Plus, MapPin, Users, Building2, 
  MoreVertical, Eye, Edit, Trash2, Home, ChevronLeft, Phone, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Polo {
  id: string;
  name: string;
  type: string;
  state: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const PolosManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [polos, setPolos] = useState<Polo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "regional",
    state: "",
    city: "",
    address: "",
    phone: "",
    email: ""
  });

  useEffect(() => {
    loadPolos();
  }, []);

  const loadPolos = async () => {
    try {
      const { data, error } = await supabase
        .from("polos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPolos(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading polos:", error);
      toast.error("Erro ao carregar polos");
      setLoading(false);
    }
  };

  const handleCreatePolo = async () => {
    try {
      if (!formData.name || !formData.state) {
        toast.error("Nome e estado são obrigatórios");
        return;
      }

      const { error } = await supabase
        .from("polos")
        .insert({
          name: formData.name,
          type: formData.type,
          state: formData.state,
          city: formData.city || null,
          address: formData.address || null,
          phone: formData.phone || null,
          email: formData.email || null
        });

      if (error) throw error;

      toast.success("Polo criado com sucesso!");
      setDialogOpen(false);
      setFormData({
        name: "",
        type: "regional",
        state: "",
        city: "",
        address: "",
        phone: "",
        email: ""
      });
      loadPolos();
    } catch (error) {
      console.error("Error creating polo:", error);
      toast.error("Erro ao criar polo");
    }
  };

  const togglePoloStatus = async (poloId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("polos")
        .update({ is_active: !currentStatus })
        .eq("id", poloId);

      if (error) throw error;

      toast.success(`Polo ${!currentStatus ? "ativado" : "desativado"} com sucesso`);
      loadPolos();
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Erro ao alterar status do polo");
    }
  };

  const filteredPolos = polos.filter(polo => {
    const matchesSearch = 
      polo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      polo.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      polo.state?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || polo.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const estadualCount = polos.filter(p => p.type === "estadual").length;
  const regionalCount = polos.filter(p => p.type === "regional").length;

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
                Voltar
              </Button>
              <h1 className="text-xl font-display font-bold">Gestão de Polos</h1>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Polo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Novo Polo</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do polo educacional
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome do Polo *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Polo São Paulo Centro"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo *</Label>
                      <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="estadual">Estadual</SelectItem>
                          <SelectItem value="regional">Regional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Estado *</Label>
                      <Select value={formData.state} onValueChange={(v) => setFormData({ ...formData, state: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {brazilianStates.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Endereço</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Endereço completo"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="polo@faitel.com"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreatePolo}>Criar Polo</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Polos</p>
                <p className="text-2xl font-display font-bold">{polos.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Polos Estaduais</p>
                <p className="text-2xl font-display font-bold">{estadualCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Polos Regionais</p>
                <p className="text-2xl font-display font-bold">{regionalCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, cidade ou estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="estadual">Estaduais</SelectItem>
              <SelectItem value="regional">Regionais</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Polos Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPolos.map((polo) => (
            <Card key={polo.id} className={`${!polo.is_active ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{polo.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {polo.city ? `${polo.city}, ${polo.state}` : polo.state}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={polo.type === "estadual" ? "default" : "secondary"}>
                      {polo.type === "estadual" ? "Estadual" : "Regional"}
                    </Badge>
                    <Badge variant={polo.is_active ? "outline" : "destructive"}>
                      {polo.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {polo.address && (
                  <p className="text-sm text-muted-foreground">{polo.address}</p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  {polo.phone && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {polo.phone}
                    </span>
                  )}
                  {polo.email && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {polo.email}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                  <Button 
                    variant={polo.is_active ? "secondary" : "default"} 
                    size="sm"
                    onClick={() => togglePoloStatus(polo.id, polo.is_active)}
                  >
                    {polo.is_active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPolos.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum polo encontrado</p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Polo
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default PolosManagement;
