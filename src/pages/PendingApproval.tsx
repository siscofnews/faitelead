import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Mail, Phone, LogOut, RefreshCw } from "lucide-react";
import faitelLogo from "@/assets/faitel-logo.png";
import { toast } from "sonner";

const PendingApproval = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{
    full_name: string;
    email: string;
    is_active: boolean;
  } | null>(null);

  useEffect(() => {
    checkApprovalStatus();
  }, []);

  const checkApprovalStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, is_active")
      .eq("id", user.id)
      .single();

    if (profile?.is_active) {
      // Check role and redirect
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData?.role === "admin" || roleData?.role === "super_admin" || roleData?.role === "teacher") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
      return;
    }

    setUserInfo({
      full_name: profile?.full_name || "",
      email: profile?.email || "",
      is_active: profile?.is_active || false
    });
    setLoading(false);
  };

  const handleRefresh = () => {
    setLoading(true);
    checkApprovalStatus();
    toast.info("Verificando status...");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Logout realizado");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <img
            src={faitelLogo}
            alt="FAITEL"
            className="w-20 h-20 object-contain mx-auto"
          />
          <div>
            <CardTitle className="text-2xl font-display">Cadastro em Análise</CardTitle>
            <CardDescription className="mt-2">
              Olá, {userInfo?.full_name?.split(" ")[0]}!
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center animate-pulse">
              <Clock className="h-12 w-12 text-amber-600" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Seu cadastro está sendo analisado pela nossa equipe.
            </p>
            <p className="text-sm text-muted-foreground">
              Você receberá uma notificação assim que for aprovado.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm">Enquanto isso:</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Verifique sua caixa de entrada para atualizações
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Mantenha seu telefone atualizado para contato
              </li>
            </ul>
          </div>

          <div className="bg-primary/5 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-primary">
              Tempo médio de aprovação: até 24 horas úteis
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar Status
            </Button>
            <Button
              variant="ghost"
              className="gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Dúvidas? Entre em contato: faiteloficial@gmail.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;
