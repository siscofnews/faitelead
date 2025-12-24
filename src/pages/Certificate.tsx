import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { 
  Download, 
  Share2, 
  ArrowLeft, 
  Award,
  CheckCircle2,
  Calendar,
  BookOpen,
  GraduationCap,
  Clock,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import html2canvas from 'html2canvas';
import logoImg from "@/assets/faitel-logo.png";

interface CertificateData {
  id: string;
  studentName: string;
  courseName: string;
  moduleName: string;
  examTitle: string;
  score: number;
  completedAt: string;
  certificateNumber: string;
  verificationCode: string;
  totalHours: number;
  certificateType: string;
}

const Certificate = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CertificateData | null>(null);

  useEffect(() => {
    loadCertificateData();
  }, [examId]);

  const loadCertificateData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // First check if this is an issued certificate ID
      const { data: issuedCert } = await supabase
        .from("issued_certificates")
        .select("*")
        .eq("id", examId)
        .single();

      if (issuedCert) {
        setData({
          id: issuedCert.id,
          studentName: issuedCert.student_name,
          courseName: issuedCert.course_name,
          moduleName: "",
          examTitle: "",
          score: issuedCert.grade || 0,
          completedAt: new Date(issuedCert.issued_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          }),
          certificateNumber: issuedCert.certificate_number,
          verificationCode: issuedCert.qr_verification_code,
          totalHours: issuedCert.total_hours,
          certificateType: issuedCert.certificate_type
        });
        setLoading(false);
        return;
      }

      // Otherwise load from exam submission
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const { data: submission } = await supabase
        .from("exam_submissions")
        .select("score, submitted_at")
        .eq("exam_id", examId)
        .eq("student_id", user.id)
        .eq("passed", true)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single();

      if (!submission) {
        toast.error("Certificado não encontrado");
        navigate("/student");
        return;
      }

      const { data: exam } = await supabase
        .from("exams")
        .select(`
          title,
          modules (
            title,
            courses (
              title,
              total_hours
            )
          )
        `)
        .eq("id", examId)
        .single();

      type ExamSelectRow = {
        title?: string;
        modules?: {
          title?: string;
          courses?: { title?: string; total_hours?: number };
        };
      };

      const ex = exam as unknown as ExamSelectRow | null;
      const courseTitle = ex?.modules?.courses?.title || "Curso";
      const moduleTitle = ex?.modules?.title || "Módulo";
      const totalHours = ex?.modules?.courses?.total_hours || 40;

      // Generate verification code
      const verificationCode = `FAITEL-${new Date().getFullYear()}-${examId?.slice(0, 8).toUpperCase()}`;
      const certificateNumber = `${new Date().getFullYear()}${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;

      setData({
        id: examId || "",
        studentName: profile?.full_name || "Aluno",
        courseName: courseTitle,
        moduleName: moduleTitle,
        examTitle: exam?.title || "Prova",
        score: submission.score,
        completedAt: new Date(submission.submitted_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }),
        certificateNumber,
        verificationCode,
        totalHours,
        certificateType: "module"
      });

      setLoading(false);
    } catch (error) {
      console.error("Error loading certificate:", error);
      toast.error("Erro ao carregar certificado");
      setLoading(false);
    }
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      });

      const link = document.createElement('a');
      link.download = `certificado-faitel-${data?.certificateNumber}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      toast.success("Certificado baixado com sucesso!");
    } catch (error) {
      toast.error("Erro ao baixar certificado");
    }
  };

  const shareCertificate = async () => {
    const shareUrl = `${window.location.origin}/verify/${data?.verificationCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Certificado FAITEL',
          text: `Certificado de conclusão: ${data?.courseName} - Verifique em:`,
          url: shareUrl
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link de verificação copiado!");
    }
  };

  const verificationUrl = `${window.location.origin}/verify/${data?.verificationCode}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground text-xl">Gerando certificado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={shareCertificate}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Compartilhar</span>
            </Button>
            <Button
              onClick={downloadCertificate}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Baixar PDF</span>
            </Button>
          </div>
        </div>

        {/* Certificate */}
        <div 
          ref={certificateRef}
          className="bg-white aspect-[1.414/1] rounded-2xl shadow-2xl overflow-hidden relative"
          style={{ minHeight: '650px' }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230A4E8A' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          {/* Decorative Borders */}
          <div className="absolute inset-3 border-2 border-primary/20 rounded-xl pointer-events-none" />
          <div className="absolute inset-5 border border-accent/30 rounded-lg pointer-events-none" />

          {/* Corner Decorations */}
          <div className="absolute top-6 left-6 w-20 h-20 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
          <div className="absolute top-6 right-6 w-20 h-20 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
          <div className="absolute bottom-6 left-6 w-20 h-20 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
          <div className="absolute bottom-6 right-6 w-20 h-20 border-b-4 border-r-4 border-primary rounded-br-2xl" />

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-between p-10 text-center">
            {/* Top Section */}
            <div className="w-full">
              {/* Logo */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <img src={logoImg} alt="FAITEL" className="h-16" />
              </div>
              <h3 className="text-primary font-bold text-sm tracking-[0.3em] uppercase">
                Faculdade Internacional Teológica de Líderes
              </h3>
            </div>

            {/* Middle Section */}
            <div className="flex-1 flex flex-col items-center justify-center py-6">
              {/* Certificate Title */}
              <div className="mb-6">
                <Award className="w-16 h-16 text-amber-500 mx-auto mb-2" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-wide">
                  CERTIFICADO
                </h1>
                <p className="text-gray-500 text-lg mt-1">de Conclusão</p>
              </div>

              {/* Divider */}
              <div className="w-40 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mb-6" />

              {/* Student Name */}
              <p className="text-gray-500 mb-1">Certificamos que</p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 font-serif">
                {data?.studentName}
              </h2>

              {/* Course Info */}
              <p className="text-gray-600 max-w-xl text-lg leading-relaxed">
                concluiu com êxito o curso
                <br />
                <strong className="text-gray-800 text-xl">"{data?.courseName}"</strong>
                {data?.moduleName && (
                  <>
                    <br />
                    <span className="text-base">Módulo: {data?.moduleName}</span>
                  </>
                )}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-center gap-8 mt-6">
                <div className="text-center">
                  <Clock className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                  <p className="text-2xl font-bold text-gray-800">{data?.totalHours}h</p>
                  <p className="text-xs text-gray-500">Carga Horária</p>
                </div>
                {data?.score && data.score > 0 && (
                  <div className="text-center">
                    <GraduationCap className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                    <p className="text-2xl font-bold text-green-600">{data?.score}%</p>
                    <p className="text-xs text-gray-500">Aproveitamento</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="w-full">
              {/* Date */}
              <p className="text-gray-500 text-sm mb-4">
                <Calendar className="w-4 h-4 inline mr-1" />
                Emitido em {data?.completedAt}
              </p>

              {/* Signatures and QR */}
              <div className="flex items-end justify-between">
                {/* Left Signature */}
                <div className="text-center flex-1">
                  <div className="w-32 border-t-2 border-gray-300 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Pastor Valdinei Ferreira</p>
                  <p className="text-xs text-gray-400">Chanceler</p>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center mx-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm border">
                    <QRCodeSVG
                      value={verificationUrl}
                      size={80}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Verifique a autenticidade</p>
                </div>

                {/* Right Signature */}
                <div className="text-center flex-1">
                  <div className="w-32 border-t-2 border-gray-300 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Coordenação Acadêmica</p>
                  <p className="text-xs text-gray-400">FAITEL</p>
                </div>
              </div>

              {/* Certificate Number */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Certificado Nº: {data?.certificateNumber}
                  </span>
                  <span>|</span>
                  <span>Código: {data?.verificationCode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Info */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Certificado com Verificação Digital</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Este certificado possui um QR Code único para verificação de autenticidade. 
                Qualquer pessoa pode verificar a validade deste documento escaneando o código 
                ou acessando o link de verificação.
              </p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {verificationUrl}
                </code>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(verificationUrl);
                    toast.success("Link copiado!");
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
