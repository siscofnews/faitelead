import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { 
  CheckCircle2, XCircle, Award, Calendar, Clock, 
  User, BookOpen, GraduationCap, Shield, ExternalLink,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import logoImg from "@/assets/faitel-logo.png";

interface CertificateVerification {
  id: string;
  certificate_number: string;
  certificate_type: string;
  student_name: string;
  course_name: string;
  total_hours: number;
  grade: number | null;
  issued_at: string;
  qr_verification_code: string;
  student_id: string;
  course_id: string;
}

const VerifyCertificate = () => {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<CertificateVerification | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    verifyCertificate();
  }, [code]);

  const verifyCertificate = async () => {
    if (!code) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      const { data, error: dbError } = await supabase
        .from("issued_certificates")
        .select("*")
        .eq("qr_verification_code", code)
        .single();

      if (dbError || !data) {
        setError(true);
      } else {
        setCertificate(data);
      }
    } catch (err) {
      console.error("Error verifying certificate:", err);
      setError(true);
    }

    setLoading(false);
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
      completion: "Conclusão de Curso",
      extension: "Curso de Extensão",
      participation: "Participação",
      module: "Conclusão de Módulo"
    };
    return labels[type] || type;
  };

  const verificationUrl = `${window.location.origin}/verify/${code}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Verificando certificado...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-background to-red-50 dark:from-red-950/20 dark:to-red-950/20 p-4">
        <Card className="max-w-lg w-full border-red-200 dark:border-red-900">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
              Certificado Não Encontrado
            </h1>
            <p className="text-muted-foreground mb-6">
              O código de verificação informado não corresponde a nenhum certificado válido em nossa base de dados.
            </p>
            <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-600 dark:text-red-400">
                <strong>Código verificado:</strong> {code || "Não informado"}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Se você acredita que isso é um erro, entre em contato com a instituição emissora do certificado.
            </p>
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Ir para a Página Inicial
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-primary/5 dark:from-green-950/20 dark:via-background dark:to-primary/10 p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/">
            <img src={logoImg} alt="FAITEL" className="h-16 mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-primary">Sistema de Verificação de Certificados</h1>
          <p className="text-muted-foreground">Faculdade Internacional Teológica de Líderes</p>
        </div>

        {/* Verification Status */}
        <Card className="border-green-200 dark:border-green-900 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Certificado Autêntico
                </h2>
                <p className="text-muted-foreground">
                  Este certificado foi verificado e é válido conforme os registros da FAITEL.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Certificate Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-6 w-6 text-accent" />
                <CardTitle>Detalhes do Certificado</CardTitle>
              </div>
              <CardDescription>
                Informações verificadas do documento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Student Info */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <User className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">CERTIFICADO CONFERIDO A</span>
                </div>
                <h3 className="text-2xl font-bold">{certificate.student_name}</h3>
              </div>

              {/* Course Info */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">CURSO</span>
                </div>
                <h3 className="text-xl font-semibold">{certificate.course_name}</h3>
                <Badge className="mt-2">{getCertificateTypeLabel(certificate.certificate_type)}</Badge>
              </div>

              <Separator />

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Número do Certificado</p>
                  <p className="font-mono font-medium">{certificate.certificate_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Carga Horária</p>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {certificate.total_hours} horas
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Data de Emissão</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(certificate.issued_at)}
                  </p>
                </div>
                {certificate.grade && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Aproveitamento</p>
                    <p className="font-medium flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {certificate.grade}%
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Verification Code */}
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Código de Verificação</p>
                <p className="font-mono text-lg font-bold text-primary">{certificate.qr_verification_code}</p>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">QR Code de Verificação</CardTitle>
              <CardDescription>
                Escaneie para verificar
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl shadow-inner mb-4">
                <QRCodeSVG
                  value={verificationUrl}
                  size={180}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: logoImg,
                    height: 35,
                    width: 35,
                    excavate: true,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mb-4">
                Este QR Code pode ser escaneado para verificar a autenticidade do certificado
              </p>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href={verificationUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Abrir Link
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Institution Info */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <img src={logoImg} alt="FAITEL" className="h-20" />
              <div className="text-center md:text-left">
                <h4 className="font-bold text-lg">FAITEL - Faculdade Internacional Teológica de Líderes</h4>
                <p className="text-muted-foreground text-sm mt-1">
                  Instituição de ensino superior comprometida com a formação de líderes 
                  para a igreja e a sociedade, oferecendo cursos de graduação, pós-graduação 
                  e extensão na modalidade EAD e presencial.
                </p>
                <div className="mt-3">
                  <Link to="/">
                    <Button variant="link" className="gap-2 p-0 h-auto">
                      <ExternalLink className="h-4 w-4" />
                      Visitar site oficial
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} FAITEL. Todos os direitos reservados.
          </p>
          <p className="mt-1">
            Este sistema de verificação garante a autenticidade dos certificados emitidos pela instituição.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
