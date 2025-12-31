import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Home, ChevronLeft, CreditCard, Receipt, AlertCircle,
  CheckCircle2, Clock, Download, QrCode, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Payment {
  id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: "paid" | "pending" | "overdue";
  course_id: string;
  course_title?: string;
}

const StudentFinancial = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          courses (title)
        `)
        .eq("student_id", user.id)
        .order("due_date", { ascending: false });

      if (error) throw error;

      const paymentsWithCourse = (data || []).map(p => ({
        ...p,
        course_title: p.courses?.title || "Curso"
      }));

      setPayments(paymentsWithCourse);

      // Calcular estatísticas
      const paid = paymentsWithCourse.filter(p => p.status === "paid").reduce((acc, p) => acc + Number(p.amount), 0);
      const pending = paymentsWithCourse.filter(p => p.status === "pending").reduce((acc, p) => acc + Number(p.amount), 0);
      const overdue = paymentsWithCourse.filter(p => p.status === "overdue").reduce((acc, p) => acc + Number(p.amount), 0);

      setStats({ totalPaid: paid, totalPending: pending, totalOverdue: overdue });
      setLoading(false);
    } catch (error) {
      console.error("Error loading payments:", error);
      toast.error(t("dashboards.student.errors.financial_load", { defaultValue: "Erro ao carregar dados financeiros" }));
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success"><CheckCircle2 className="h-3 w-3 mr-1" />{t("dashboards.student.payment_status_paid", { defaultValue: "Pago" })}</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{t("dashboards.student.payment_status_pending", { defaultValue: "Pendente" })}</Badge>;
      case "overdue":
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />{t("dashboards.student.payment_status_overdue", { defaultValue: "Atrasado" })}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const copyPixCode = () => {
    // Mock PIX code
    navigator.clipboard.writeText("00020126580014BR.GOV.BCB.PIX0136faitel@pix.com520400005303986");
    toast.success(t("dashboards.student.pix_code_copied", { defaultValue: "Código PIX copiado!" }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.status === "pending" || p.status === "overdue");
  const paidPayments = payments.filter(p => p.status === "paid");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-5 w-5" />
            </Link>
            <Button variant="ghost" size="sm" onClick={() => navigate("/student")}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("common.back")}
            </Button>
            <h1 className="text-xl font-display font-bold">{t("dashboard.quick_actions.financial")}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-success/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("dashboards.student.total_paid", { defaultValue: "Total Pago" })}</p>
                <p className="text-2xl font-display font-bold text-success">{formatCurrency(stats.totalPaid)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("common.pending")}</p>
                <p className="text-2xl font-display font-bold text-warning">{formatCurrency(stats.totalPending)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-destructive/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("dashboards.student.overdue_label", { defaultValue: "Em Atraso" })}</p>
                <p className="text-2xl font-display font-bold text-destructive">{formatCurrency(stats.totalOverdue)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        {pendingPayments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboards.student.make_payment", { defaultValue: "Efetuar Pagamento" })}</CardTitle>
              <CardDescription>{t("dashboards.student.choose_payment_method", { defaultValue: "Escolha a forma de pagamento" })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={copyPixCode}>
                  <CardContent className="p-4 text-center">
                    <QrCode className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="font-medium">PIX</p>
                    <p className="text-sm text-muted-foreground">{t("dashboards.student.instant_payment", { defaultValue: "Pagamento instantâneo" })}</p>
                    <Button variant="outline" size="sm" className="mt-3 gap-1">
                      <Copy className="h-3 w-3" />
                      {t("dashboards.student.copy_code", { defaultValue: "Copiar Código" })}
                    </Button>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="p-4 text-center">
                    <Receipt className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="font-medium">{t("dashboards.student.bank_slip", { defaultValue: "Boleto" })}</p>
                    <p className="text-sm text-muted-foreground">{t("dashboards.student.due_3_days", { defaultValue: "Vencimento em 3 dias" })}</p>
                    <Button variant="outline" size="sm" className="mt-3 gap-1">
                      <Download className="h-3 w-3" />
                      {t("dashboards.student.generate_slip", { defaultValue: "Gerar Boleto" })}
                    </Button>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="p-4 text-center">
                    <CreditCard className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="font-medium">{t("dashboards.student.card_label", { defaultValue: "Cartão" })}</p>
                    <p className="text-sm text-muted-foreground">{t("dashboards.student.credit_debit", { defaultValue: "Crédito ou débito" })}</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      {t("dashboards.student.pay_with_card", { defaultValue: "Pagar com Cartão" })}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payments Tabs */}
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              {t("dashboards.student.pending_tab", { defaultValue: "Pendentes" })} ({pendingPayments.length})
            </TabsTrigger>
            <TabsTrigger value="paid">
              {t("dashboards.student.paid_tab", { defaultValue: "Pagos" })} ({paidPayments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {pendingPayments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("common.course")}</TableHead>
                        <TableHead>{t("dashboards.student.due_date_label", { defaultValue: "Vencimento" })}</TableHead>
                        <TableHead>{t("dashboards.student.amount_label", { defaultValue: "Valor" })}</TableHead>
                        <TableHead>{t("common.status")}</TableHead>
                        <TableHead className="text-right">{t("dashboards.student.actions_label", { defaultValue: "Ações" })}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.course_title}</TableCell>
                          <TableCell>{formatDate(payment.due_date)}</TableCell>
                          <TableCell>{formatCurrency(Number(payment.amount))}</TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm">{t("dashboards.student.pay_button", { defaultValue: "Pagar" })}</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success" />
                    <p>{t("dashboards.student.no_pending_payments", { defaultValue: "Nenhum pagamento pendente!" })}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paid" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {paidPayments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("common.course")}</TableHead>
                        <TableHead>{t("dashboards.student.payment_date_label", { defaultValue: "Data Pagamento" })}</TableHead>
                        <TableHead>{t("dashboards.student.amount_label", { defaultValue: "Valor" })}</TableHead>
                        <TableHead>{t("common.status")}</TableHead>
                        <TableHead className="text-right">{t("dashboards.student.receipt_label", { defaultValue: "Recibo" })}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paidPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.course_title}</TableCell>
                          <TableCell>{payment.paid_date ? formatDate(payment.paid_date) : "-"}</TableCell>
                          <TableCell>{formatCurrency(Number(payment.amount))}</TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              {t("dashboards.student.receipt_button", { defaultValue: "Recibo" })}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-4" />
                    <p>{t("dashboards.student.no_paid_payments", { defaultValue: "Nenhum pagamento realizado ainda" })}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentFinancial;
