import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, Eye, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Application {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    birth_date: string;
    country: string;
    document_type: string;
    document_number: string;
    desired_course_name: string;
    status: 'pending' | 'approved' | 'rejected' | 'enrolled';
    created_at: string;
    why_course: string;
    photo_url: string | null;
}

const StudentApplicationsManagement = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('student_applications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setApplications(data || []);
        } catch (error: any) {
            console.error('Error loading applications:', error);
            toast.error('Erro ao carregar inscrições');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (application: Application) => {
        setProcessing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error('Usuário não autenticado');
                return;
            }

            const { error } = await supabase.rpc('approve_student_application', {
                p_application_id: application.id,
                p_approved_by: user.id,
            });

            if (error) throw error;

            toast.success(`Inscrição de ${application.full_name} aprovada!`);
            loadApplications();
            setShowDetails(false);
        } catch (error: any) {
            console.error('Error approving application:', error);
            toast.error('Erro ao aprovar inscrição');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedApplication) return;
        if (!rejectionReason.trim()) {
            toast.error('Informe o motivo da rejeição');
            return;
        }

        setProcessing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error('Usuário não autenticado');
                return;
            }

            const { error } = await supabase.rpc('reject_student_application', {
                p_application_id: selectedApplication.id,
                p_rejected_by: user.id,
                p_reason: rejectionReason,
            });

            if (error) throw error;

            toast.success('Inscrição rejeitada');
            loadApplications();
            setShowReject(false);
            setShowDetails(false);
            setRejectionReason('');
        } catch (error: any) {
            console.error('Error rejecting application:', error);
            toast.error('Erro ao rejeitar inscrição');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline">Pendente</Badge>;
            case 'approved':
                return <Badge variant="default">Aprovado</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejeitado</Badge>;
            case 'enrolled':
                return <Badge className="bg-success">Matriculado</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-display font-bold">Inscrições de Alunos</h1>
                <p className="text-muted-foreground">
                    Gerencie as inscrições recebidas
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Inscrições</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Curso</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium">{app.full_name}</TableCell>
                                    <TableCell>{app.email}</TableCell>
                                    <TableCell>{app.desired_course_name}</TableCell>
                                    <TableCell>
                                        {new Date(app.created_at).toLocaleDateString('pt-BR')}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedApplication(app);
                                                setShowDetails(true);
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Ver
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Dialog de Detalhes */}
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalhes da Inscrição</DialogTitle>
                    </DialogHeader>
                    {selectedApplication && (
                        <div className="space-y-4">
                            {selectedApplication.photo_url && (
                                <div className="flex justify-center">
                                    <img
                                        src={selectedApplication.photo_url}
                                        alt="Foto"
                                        className="w-32 h-32 rounded-lg object-cover"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Nome</p>
                                    <p className="font-medium">{selectedApplication.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{selectedApplication.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Telefone</p>
                                    <p className="font-medium">{selectedApplication.phone || 'Não informado'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                                    <p className="font-medium">
                                        {new Date(selectedApplication.birth_date).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">País</p>
                                    <p className="font-medium">{selectedApplication.country}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{selectedApplication.document_type}</p>
                                    <p className="font-medium">{selectedApplication.document_number}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">Curso de Interesse</p>
                                    <p className="font-medium">{selectedApplication.desired_course_name}</p>
                                </div>
                                {selectedApplication.why_course && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Motivação</p>
                                        <p className="text-sm">{selectedApplication.why_course}</p>
                                    </div>
                                )}
                            </div>

                            {selectedApplication.status === 'pending' && (
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        className="flex-1"
                                        onClick={() => handleApprove(selectedApplication)}
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                        )}
                                        Aprovar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => setShowReject(true)}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Rejeitar
                                    </Button>
                                </div>
                            )}

                            {selectedApplication.status === 'approved' && (
                                <div className="p-4 bg-success/10 border border-success rounded-lg">
                                    <p className="text-success text-center font-medium">
                                        ✅ Aprovado - Aguardando matrícula oficial
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog de Rejeição */}
            <Dialog open={showReject} onOpenChange={setShowReject}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rejeitar Inscrição</DialogTitle>
                        <DialogDescription>
                            Informe o motivo da rejeição para o candidato.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="reason">Motivo *</Label>
                        <Textarea
                            id="reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Ex: Documentação incompleta, idade mínima não atingida..."
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReject(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={processing}>
                            {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Confirmar Rejeição
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StudentApplicationsManagement;
