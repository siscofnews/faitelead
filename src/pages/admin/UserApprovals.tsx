import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Search, Home, ChevronLeft, UserCheck, UserX, Eye,
  Mail, Phone, Calendar, MapPin, Shield, GraduationCap, Building2
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface PendingUser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  cpf: string;
  education_level: string;
  created_at: string;
  selfie_url: string | null;
  photo_url: string | null;
  polo_id: string | null;
  approval_status: string;
  role: string;
  polo_name?: string;
}

interface Polo {
  id: string;
  name: string;
}

const UserApprovals = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [polos, setPolos] = useState<Polo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserPoloId, setCurrentUserPoloId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    students: 0,
    teachers: 0,
    admins: 0
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

    // Get current user's role and polo
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    // Get polo_id using raw query approach
  const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setCurrentUserRole(roleData?.role || null);
    setCurrentUserPoloId(profileData?.polo_id || null);

    await Promise.all([loadPendingUsers(), loadPolos()]);
    setLoading(false);
  };

  const loadPolos = async () => {
    const { data } = await supabase
      .from("polos")
      .select("id, name")
      .eq("is_active", true);
    setPolos(data || []);
  };

  const loadPendingUsers = async () => {
    try {
      // Get profiles with pending approval using raw select
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter pending users (since approval_status might not be in types yet)
      const pendingProfiles = (profiles || []).filter(
        (p: any) => p.approval_status === "pending"
      );

      // Get user roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      // Get polo names
      const { data: polosData } = await supabase
        .from("polos")
        .select("id, name");

      const poloMap = new Map(polosData?.map(p => [p.id, p.name]) || []);

      const usersWithRoles: PendingUser[] = pendingProfiles.map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        phone: p.phone,
        cpf: p.cpf,
        education_level: p.education_level,
        created_at: p.created_at,
        selfie_url: p.selfie_url || null,
        photo_url: p.photo_url || null,
        polo_id: p.polo_id || null,
        approval_status: p.approval_status || "pending",
        role: roleMap.get(p.id) || "student",
        polo_name: p.polo_id ? poloMap.get(p.polo_id) : undefined
      }));

      setPendingUsers(usersWithRoles);

      // Calculate stats
      setStats({
        total: usersWithRoles.length,
        students: usersWithRoles.filter(u => u.role === "student").length,
        teachers: usersWithRoles.filter(u => u.role === "teacher").length,
        admins: usersWithRoles.filter(u => u.role === "admin").length
      });

    } catch (error) {
      console.error("Error loading pending users:", error);
      toast.error("Erro ao carregar usuários pendentes");
    }
  };

  const canApprove = (user: PendingUser): boolean => {
    // Super admin can approve admins
    if (currentUserRole === "super_admin" && user.role === "admin") {
      return true;
    }

    // Super admin and admin can approve everyone except admins
    if ((currentUserRole === "super_admin" || currentUserRole === "admin") && user.role !== "admin") {
      return true;
    }

    // Polo director can approve students and teachers from same polo
    if (currentUserRole === "polo_director" && 
        (user.role === "student" || user.role === "teacher") &&
        user.polo_id === currentUserPoloId) {
      return true;
    }

    return false;
  };

  const handleApprove = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("profiles")
        .update({
          approval_status: "approved",
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Usuário aprovado com sucesso!");
      loadPendingUsers();
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Erro ao aprovar usuário");
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          approval_status: "rejected",
          is_active: false
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Usuário rejeitado");
      loadPendingUsers();
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error("Erro ao rejeitar usuário");
    }
  };

  const filteredUsers = pendingUsers.filter(user => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = 
      roleFilter === "all" || user.role === roleFilter;

    // Only show users that current user can approve
    const canView = canApprove(user);

    return matchesSearch && matchesRole && canView;
  });

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      student: "bg-blue-500/10 text-blue-600",
      teacher: "bg-purple-500/10 text-purple-600",
      admin: "bg-emerald-500/10 text-emerald-600",
      polo_director: "bg-amber-500/10 text-amber-600"
    };
    const labels: Record<string, string> = {
      student: "Aluno",
      teacher: "Professor",
      admin: "Administrador",
      polo_director: "Diretor de Polo"
    };
    return (
      <Badge variant="outline" className={colors[role] || ""}>
        {labels[role] || role}
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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
                Voltar
              </Button>
              <h1 className="text-xl font-display font-bold">Aprovação de Cadastros</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-3xl font-display font-bold text-amber-600">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Alunos</p>
              <p className="text-3xl font-display font-bold text-blue-600">{stats.students}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Professores</p>
              <p className="text-3xl font-display font-bold text-purple-600">{stats.teachers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Administradores</p>
              <p className="text-3xl font-display font-bold text-emerald-600">{stats.admins}</p>
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
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="student">Alunos</SelectItem>
                  <SelectItem value="teacher">Professores</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Cadastros Pendentes ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum cadastro pendente de aprovação</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Polo</TableHead>
                      <TableHead>Data Cadastro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.selfie_url || user.photo_url || ""} />
                              <AvatarFallback>
                                {user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.full_name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          {user.polo_name || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(user.id)}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReject(user.id)}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Cadastro</DialogTitle>
            <DialogDescription>
              Revise os dados do usuário antes de aprovar
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Photo */}
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={selectedUser.selfie_url || selectedUser.photo_url || ""} />
                    <AvatarFallback className="text-3xl">
                      {selectedUser.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    {getRoleBadge(selectedUser.role)}
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nome Completo</p>
                  <p className="font-medium">{selectedUser.full_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedUser.phone || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">CPF</p>
                  <p className="font-medium">{selectedUser.cpf || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Polo</p>
                  <p className="font-medium">{selectedUser.polo_name || "Não informado"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Data do Cadastro</p>
                  <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Fechar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedUser.id)}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(selectedUser.id)}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserApprovals;
