import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Search, Edit, Trash2, GraduationCap, BookOpen, Users } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import type { Database } from "@/integrations/supabase/types";

interface Professor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  education_level: string;
  is_active: boolean;
  created_at: string;
  courses_count?: number;
}

const ProfessorsManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [userName, setUserName] = useState("");
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    cpf: "",
    education_level: "pos_graduacao" as Database["public"]["Enums"]["education_level"],
    password: ""
  });

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

    await loadProfessors();
  };

  const loadProfessors = async () => {
    setLoading(true);
    
    // Get all users with teacher role
    const { data: teacherRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "teacher");

    if (rolesError) {
      toast({ title: "Erro ao carregar professores", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (!teacherRoles || teacherRoles.length === 0) {
      setProfessors([]);
      setLoading(false);
      return;
    }

    const teacherIds = teacherRoles.map(r => r.user_id);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", teacherIds);

    if (profilesError) {
      toast({ title: "Erro ao carregar professores", variant: "destructive" });
    } else {
      setProfessors(profiles || []);
    }
    
    setLoading(false);
  };

  const handleCreateProfessor = async () => {
    if (!formData.full_name || !formData.email || !formData.password) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    try {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            cpf: formData.cpf,
            phone: formData.phone,
            education_level: formData.education_level
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Add teacher role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: authData.user.id, role: "teacher" });

        if (roleError) throw roleError;
      }

      toast({ title: "Professor criado com sucesso!" });
      setIsDialogOpen(false);
      resetForm();
      loadProfessors();
    } catch (error: any) {
      toast({ title: "Erro ao criar professor", description: error.message || "Erro desconhecido", variant: "destructive" });
    }
  };

  const handleUpdateProfessor = async () => {
    if (!editingProfessor) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          education_level: formData.education_level
        })
        .eq("id", editingProfessor.id);

      if (error) throw error;

      toast({ title: "Professor atualizado com sucesso!" });
      setIsDialogOpen(false);
      resetForm();
      loadProfessors();
    } catch (error: any) {
      toast({ title: "Erro ao atualizar professor", description: error.message || "Erro desconhecido", variant: "destructive" });
    }
  };

  const handleToggleActive = async (professor: Professor) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !professor.is_active })
        .eq("id", professor.id);

      if (error) throw error;

      toast({ title: `Professor ${professor.is_active ? "desativado" : "ativado"}!` });
      loadProfessors();
    } catch (error: any) {
      toast({ title: "Erro ao atualizar status", description: error.message || "Erro desconhecido", variant: "destructive" });
    }
  };

  const handleDeleteProfessor = async (professorId: string) => {
    if (!confirm("Tem certeza que deseja excluir este professor? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", professorId);

      if (error) throw error;

      toast({ title: "Professor excluído com sucesso!" });
      loadProfessors();
    } catch (error: any) {
      toast({ title: "Erro ao excluir professor", description: error.message || "Erro desconhecido", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      cpf: "",
      education_level: "pos_graduacao",
      password: ""
    });
    setEditingProfessor(null);
  };

  const openEditDialog = (professor: Professor) => {
    setEditingProfessor(professor);
    setFormData({
      full_name: professor.full_name,
      email: professor.email,
      phone: professor.phone || "",
      cpf: "",
      education_level: professor.education_level,
      password: ""
    });
    setIsDialogOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const filteredProfessors = professors.filter(p =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEducationLabel = (level: string) => {
    const labels: Record<string, string> = {
      medio: "Ensino Médio",
      superior: "Superior",
      pos_graduacao: "Pós-Graduação",
      mestrado: "Mestrado",
      doutorado: "Doutorado"
    };
    return labels[level] || level;
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName={userName} userRole="admin" onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
        </Button>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              Gestão de Professores
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" /> Novo Professor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingProfessor ? "Editar Professor" : "Cadastrar Professor"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Nome Completo *</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Nome completo do professor"
                    />
                  </div>
                  {!editingProfessor && (
                    <>
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
                        <Label>Senha *</Label>
                        <Input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Senha de acesso"
                        />
                      </div>
                      <div>
                        <Label>CPF</Label>
                        <Input
                          value={formData.cpf}
                          onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <Label>Telefone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <Label>Formação</Label>
                    <Select
                      value={formData.education_level}
                      onValueChange={(value) => setFormData({ ...formData, education_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="superior">Superior</SelectItem>
                        <SelectItem value="pos_graduacao">Pós-Graduação</SelectItem>
                        <SelectItem value="mestrado">Mestrado</SelectItem>
                        <SelectItem value="doutorado">Doutorado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={editingProfessor ? handleUpdateProfessor : handleCreateProfessor}
                    className="w-full"
                  >
                    {editingProfessor ? "Salvar Alterações" : "Cadastrar Professor"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : filteredProfessors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum professor encontrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Formação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfessors.map((professor) => (
                    <TableRow key={professor.id}>
                      <TableCell className="font-medium">{professor.full_name}</TableCell>
                      <TableCell>{professor.email}</TableCell>
                      <TableCell>{professor.phone || "-"}</TableCell>
                      <TableCell>{getEducationLabel(professor.education_level)}</TableCell>
                      <TableCell>
                        <Badge variant={professor.is_active ? "default" : "secondary"}>
                          {professor.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(professor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={professor.is_active ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleToggleActive(professor)}
                          >
                            {professor.is_active ? "Desativar" : "Ativar"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProfessor(professor.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

export default ProfessorsManagement;
