import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Search, Award, MoreVertical, Eye, Download, 
  Home, ChevronLeft, FileText, Users, Calendar
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Certificate {
  id: string;
  certificate_number: string;
  student_name: string;
  student_id: string;
  course_name: string;
  course_id: string;
  certificate_type: string;
  total_hours: number;
  grade: number | null;
  issued_at: string;
  qr_verification_code: string;
}

const CertificatesManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    totalHours: 0
  });

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from("issued_certificates")
        .select("*")
        .order("issued_at", { ascending: false });

      if (error) throw error;
      
      const certs = data || [];
      setCertificates(certs);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      setStats({
        total: certs.length,
        thisMonth: certs.filter(c => new Date(c.issued_at) >= startOfMonth).length,
        totalHours: certs.reduce((acc, c) => acc + c.total_hours, 0)
      });

      setLoading(false);
    } catch (error) {
      console.error("Error loading certificates:", error);
      toast.error("Erro ao carregar certificados");
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter(c =>
    c.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.certificate_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCertTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      completion: "Conclusão",
      excellence: "Excelência",
      participation: "Participação"
    };
    return types[type] || type;
  };

  const handleExportCSV = () => {
    let csvContent = "Número,Aluno,Curso,Tipo,Carga Horária,Nota,Data Emissão\n";
    filteredCertificates.forEach(c => {
      csvContent += `"${c.certificate_number}","${c.student_name}","${c.course_name}","${getCertTypeLabel(c.certificate_type)}",${c.total_hours}h,${c.grade || "-"},"${new Date(c.issued_at).toLocaleDateString("pt-BR")}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "certificados_faitel.csv";
    link.click();
    toast.success("Lista exportada com sucesso!");
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
              <h1 className="text-xl font-display font-bold">Certificados Emitidos</h1>
            </div>
            <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Emitidos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Este Mês</p>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Horas Certificadas</p>
                <p className="text-2xl font-bold">{stats.totalHours}h</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por aluno, curso ou número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Certificados ({filteredCertificates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Carga Horária</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Data Emissão</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-mono text-sm">{cert.certificate_number}</TableCell>
                      <TableCell className="font-medium">{cert.student_name}</TableCell>
                      <TableCell>{cert.course_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCertTypeLabel(cert.certificate_type)}</Badge>
                      </TableCell>
                      <TableCell>{cert.total_hours}h</TableCell>
                      <TableCell>{cert.grade ? `${cert.grade}%` : "-"}</TableCell>
                      <TableCell>{new Date(cert.issued_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/verify/${cert.qr_verification_code}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Verificar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredCertificates.length === 0 && (
              <div className="text-center py-12">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum certificado encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CertificatesManagement;
