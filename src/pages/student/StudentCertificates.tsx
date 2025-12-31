import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  Home, ChevronLeft, Award, Download, Share2,
  QrCode, Calendar, Clock, ExternalLink, CheckCircle2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import logoImg from "@/assets/faitel-logo.png";

interface Certificate {
  id: string;
  certificate_number: string;
  certificate_type: string;
  student_name: string;
  course_name: string;
  total_hours: number;
  grade: number | null;
  issued_at: string;
  qr_verification_code: string;
}

const StudentCertificates = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("issued_certificates")
        .select("*")
        .eq("student_id", user.id)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading certificates:", error);
      toast.error(t("dashboards.student.errors.certificates_load", { defaultValue: "Erro ao carregar certificados" }));
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const getCertificateTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      completion: t("common.completion", { defaultValue: "Conclusão" }),
      extension: t("common.extension", { defaultValue: "Extensão" }),
      participation: t("common.participation", { defaultValue: "Participação" })
    };
    return labels[type] || type;
  };

  const getVerificationUrl = (code: string) => {
    return `${window.location.origin}/verify/${code}`;
  };

  const shareCertificate = async (cert: Certificate) => {
    const shareUrl = getVerificationUrl(cert.qr_verification_code);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificado - ${cert.course_name}`,
          text: `Certificado de ${getCertificateTypeLabel(cert.certificate_type)} em ${cert.course_name}`,
          url: shareUrl
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success(t("dashboards.student.verification_link_copied", { defaultValue: "Link de verificação copiado!" }));
    }
  };

  const showQRCode = (cert: Certificate) => {
    setSelectedCert(cert);
    setIsQRDialogOpen(true);
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
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-5 w-5" />
            </Link>
            <Button variant="ghost" size="sm" onClick={() => navigate("/student")}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("common.back")}
            </Button>
            <h1 className="text-xl font-display font-bold">{t("dashboard.quick_actions.certificates")}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 mx-auto text-amber-500 mb-2" />
              <p className="text-3xl font-display font-bold">{certificates.length}</p>
              <p className="text-sm text-muted-foreground">{t("dashboard.quick_actions.certificates")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-3xl font-display font-bold">
                {certificates.reduce((acc, c) => acc + c.total_hours, 0)}h
              </p>
              <p className="text-sm text-muted-foreground">{t("dashboards.student.total_hours", { defaultValue: "Horas Totais" })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-3xl font-display font-bold">
                {certificates.filter(c => c.certificate_type === "completion").length}
              </p>
              <p className="text-sm text-muted-foreground">{t("dashboards.student.courses_completed", { defaultValue: "Cursos Concluídos" })}</p>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Grid */}
        {certificates.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <Card key={cert.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Certificate Preview */}
                <div className="h-40 bg-gradient-to-br from-primary/10 via-amber-500/10 to-primary/5 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Award className="h-12 w-12 mx-auto text-amber-500 mb-2" />
                      <p className="font-display font-bold text-lg">{t("dashboards.student.certificate_label", { defaultValue: "CERTIFICADO" })}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCertificateTypeLabel(cert.certificate_type)}
                      </p>
                    </div>
                  </div>
                  <Badge className="absolute top-3 right-3">
                    {cert.total_hours}h
                  </Badge>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{cert.course_name}</CardTitle>
                  <CardDescription>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Emitido em {formatDate(cert.issued_at)}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("dashboards.student.certificate_number", { defaultValue: "Nº do Certificado:" })}</span>
                    <span className="font-mono">{cert.certificate_number}</span>
                  </div>

                  {cert.grade && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("common.grade", { defaultValue: "Nota" })}:</span>
                      <Badge variant="outline" className="text-green-600">{cert.grade}%</Badge>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => navigate(`/certificate/${cert.id}`)}
                    >
                      <Download className="h-4 w-4" />
                      {t("common.download", { defaultValue: "Baixar" })}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => shareCertificate(cert)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => showQRCode(cert)}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-display font-bold mb-2">{t("dashboards.student.no_certificates", { defaultValue: "Nenhum certificado ainda" })}</h3>
              <p className="text-muted-foreground mb-6">
                {t("dashboards.student.no_certificates_desc", { defaultValue: "Complete seus cursos para receber certificados digitais com QR Code de verificação." })}
              </p>
              <Button onClick={() => navigate("/student")}>
                {t("dashboards.student.view_my_courses", { defaultValue: "Ver Meus Cursos" })}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <QrCode className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">{t("dashboards.student.digital_verification_title", { defaultValue: "Certificados com Verificação Digital" })}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("dashboards.student.digital_verification_desc", { defaultValue: "Todos os certificados emitidos pela FAITEL possuem QR Code para verificação de autenticidade. Basta escanear o código ou acessar o link de verificação para confirmar a validade do documento." })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* QR Code Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              {t("dashboards.student.verification_qrcode", { defaultValue: "QR Code de Verificação" })}
            </DialogTitle>
          </DialogHeader>
          {selectedCert && (
            <div className="flex flex-col items-center py-4">
              <div className="bg-white p-4 rounded-xl shadow-inner border mb-4">
                <QRCodeSVG
                  value={getVerificationUrl(selectedCert.qr_verification_code)}
                  size={200}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: logoImg,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>
              <p className="text-center font-medium mb-1">{selectedCert.course_name}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {t("dashboards.student.certificate_short", { defaultValue: "Certificado Nº:" })} {selectedCert.certificate_number}
              </p>
              <p className="text-xs text-muted-foreground text-center mb-4">
                {t("dashboards.student.scan_qrcode_desc", { defaultValue: "Escaneie este QR Code para verificar a autenticidade do certificado" })}
              </p>
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(getVerificationUrl(selectedCert.qr_verification_code));
                    toast.success(t("dashboards.student.link_copied", { defaultValue: "Link copiado!" }));
                  }}
                >
                  {t("dashboards.student.copy_link", { defaultValue: "Copiar Link" })}
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={() => window.open(getVerificationUrl(selectedCert.qr_verification_code), "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  {t("dashboards.student.verify_label", { defaultValue: "Verificar" })}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentCertificates;
