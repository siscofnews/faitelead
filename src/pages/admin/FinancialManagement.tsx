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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, DollarSign, Search, TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useI18n } from "@/i18n/I18nProvider";

interface Payment {
  id: string;
  student_id: string;
  course_id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: "pending" | "paid" | "overdue" | "cancelled";
  created_at: string;
  student?: { full_name: string; email: string };
  course?: { title: string };
}

interface FinancialStats {
  totalReceived: number;
  totalPending: number;
  totalOverdue: number;
  monthlyRevenue: number;
}

const FinancialManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<FinancialStats>({
    totalReceived: 0,
    totalPending: 0,
    totalOverdue: 0,
    monthlyRevenue: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userName, setUserName] = useState("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

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

    await loadPayments();
    await loadStats();
  };

  const loadPayments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("due_date", { ascending: false });

    if (error) {
      console.error("Error loading payments:", error);
    } else {
      // Load related data manually
      const paymentsWithData = await Promise.all(
        (data || []).map(async (payment) => {
          const { data: studentData } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", payment.student_id)
            .single();

          const { data: courseData } = await supabase
            .from("courses")
            .select("title")
            .eq("id", payment.course_id)
            .single();

          return {
            ...payment,
            student: studentData || undefined,
            course: courseData || undefined
          };
        })
      );
      setPayments(paymentsWithData as Payment[]);
    }

    setLoading(false);
  };

  const loadStats = async () => {
    const { data: allPayments } = await supabase
      .from("payments")
      .select("amount, status, paid_date");

    if (allPayments) {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const stats = allPayments.reduce((acc, payment) => {
        if (payment.status === "paid") {
          acc.totalReceived += Number(payment.amount);
          if (payment.paid_date) {
            const paidDate = new Date(payment.paid_date);
            if (paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear) {
              acc.monthlyRevenue += Number(payment.amount);
            }
          }
        } else if (payment.status === "pending") {
          acc.totalPending += Number(payment.amount);
        } else if (payment.status === "overdue") {
          acc.totalOverdue += Number(payment.amount);
        }
        return acc;
      }, { totalReceived: 0, totalPending: 0, totalOverdue: 0, monthlyRevenue: 0 });

      setStats(stats);
    }
  };

  const handleUpdatePaymentStatus = async (paymentId: string, newStatus: string) => {
    const updateData: any = { status: newStatus };
    
    if (newStatus === "paid") {
      updateData.paid_date = new Date().toISOString().split("T")[0];
    }

    const { error } = await supabase
      .from("payments")
      .update(updateData)
      .eq("id", paymentId);

    if (error) {
      toast({ title: "Financeiro", description: "Erro ao atualizar pagamento", variant: "destructive" });
    } else {
      toast({ title: "Financeiro", description: "Pagamento atualizado com sucesso!" });
      loadPayments();
      loadStats();
    }
    setIsPaymentDialogOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: any }> = {
      paid: { variant: "default", label: "Pago", icon: CheckCircle },
      pending: { variant: "secondary", label: "Pendente", icon: Clock },
      overdue: { variant: "destructive", label: "Vencido", icon: AlertCircle },
      cancelled: { variant: "outline", label: "Cancelado", icon: null }
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon && <config.icon className="h-3 w-3" />}
        {config.label}
      </Badge>
    );
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      (p.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (p.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName={userName} userRole="admin" onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("back")}
        </Button>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Recebido</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalReceived)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita do Mês</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.monthlyRevenue)}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendente</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.totalPending)}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vencido</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalOverdue)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              {t("finance_title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="payments">
              <TabsList className="mb-6">
                <TabsTrigger value="payments">Pagamentos</TabsTrigger>
                <TabsTrigger value="reports">{t("reports_title")}</TabsTrigger>
              </TabsList>

              <TabsContent value="payments">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("search_placeholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="paid">Pagos</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="overdue">Vencidos</SelectItem>
                      <SelectItem value="cancelled">Cancelados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : filteredPayments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum pagamento encontrado
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aluno</TableHead>
                        <TableHead>Curso</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{payment.student?.full_name || "N/A"}</p>
                              <p className="text-sm text-muted-foreground">{payment.student?.email || ""}</p>
                            </div>
                          </TableCell>
                          <TableCell>{payment.course?.title || "N/A"}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(Number(payment.amount))}</TableCell>
                          <TableCell>
                            {format(new Date(payment.due_date), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="text-right">
                            <Dialog open={isPaymentDialogOpen && selectedPayment?.id === payment.id} onOpenChange={(open) => {
                              setIsPaymentDialogOpen(open);
                              if (!open) setSelectedPayment(null);
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedPayment(payment)}
                                >
                                  {t("settings")}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Gerenciar Pagamento</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                  <div>
                                    <Label>Aluno</Label>
                                    <p className="text-sm text-muted-foreground">{payment.student?.full_name}</p>
                                  </div>
                                  <div>
                                    <Label>Valor</Label>
                                    <p className="text-lg font-bold">{formatCurrency(Number(payment.amount))}</p>
                                  </div>
                                  <div>
                                    <Label>Alterar Status</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      <Button
                                        variant="default"
                                        onClick={() => handleUpdatePaymentStatus(payment.id, "paid")}
                                        disabled={payment.status === "paid"}
                                      >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Marcar como Pago
                                      </Button>
                                      <Button
                                        variant="secondary"
                                        onClick={() => handleUpdatePaymentStatus(payment.id, "pending")}
                                        disabled={payment.status === "pending"}
                                      >
                                        <Clock className="mr-2 h-4 w-4" />
                                        Pendente
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleUpdatePaymentStatus(payment.id, "overdue")}
                                        disabled={payment.status === "overdue"}
                                      >
                                        <AlertCircle className="mr-2 h-4 w-4" />
                                        Vencido
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => handleUpdatePaymentStatus(payment.id, "cancelled")}
                                        disabled={payment.status === "cancelled"}
                                      >
                                        Cancelar
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="reports">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span>Total de Pagamentos Recebidos</span>
                          <span className="font-bold text-green-600">{formatCurrency(stats.totalReceived)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span>Total Pendente</span>
                          <span className="font-bold text-yellow-600">{formatCurrency(stats.totalPending)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span>Total Vencido</span>
                          <span className="font-bold text-red-600">{formatCurrency(stats.totalOverdue)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="font-medium">Total Geral Esperado</span>
                          <span className="font-bold">{formatCurrency(stats.totalReceived + stats.totalPending + stats.totalOverdue)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FinancialManagement;
