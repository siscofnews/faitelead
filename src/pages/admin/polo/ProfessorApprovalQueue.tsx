import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, XCircle, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ApprovalRequest {
    id: string;
    professor_id: string;
    requested_at: string;
    professor: {
        full_name: string;
        email: string;
        avatar_url: string | null;
    };
}

export const ProfessorApprovalQueue = ({ poloId }: { poloId: string }) => {
    const [requests, setRequests] = useState<ApprovalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    useEffect(() => {
        loadRequests();
    }, [poloId]);

    const loadRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('professor_approvals')
                .select(`
          id,
          professor_id,
          requested_at,
          professor:professor_id(full_name, email, avatar_url)
        `)
                .eq('polo_id', poloId)
                .eq('status', 'pending')
                .order('requested_at', { ascending: false });

            if (error) throw error;

            // Transform data to match interface
            const transformed = (data || []).map(item => ({
                id: item.id,
                professor_id: item.professor_id,
                requested_at: item.requested_at,
                professor: Array.isArray(item.professor) ? item.professor[0] : item.professor
            }));

            setRequests(transformed);
        } catch (error) {
            console.error('Error loading requests:', error);
            toast.error('Erro ao carregar solicitações');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (request: ApprovalRequest) => {
        try {
            const { data: userData } = await supabase.auth.getUser();

            // 1. Update approval status
            const { error: approvalError } = await supabase
                .from('professor_approvals')
                .update({
                    status: 'approved',
                    reviewed_by: userData.user?.id,
                    reviewed_at: new Date().toISOString()
                })
                .eq('id', request.id);

            if (approvalError) throw approvalError;

            // 2. Add to polo_staff
            const { error: staffError } = await supabase
                .from('polo_staff')
                .insert({
                    polo_id: poloId,
                    user_id: request.professor_id,
                    staff_role: 'teacher',
                    assigned_by: userData.user?.id
                });

            if (staffError) throw staffError;

            // 3. Add teacher role if not exists
            // This might fail if role already exists, which is fine
            await supabase
                .from('user_roles')
                .insert({
                    user_id: request.professor_id,
                    role: 'teacher'
                })
                .select()
                .maybeSingle();

            toast.success('Professor aprovado com sucesso!');
            loadRequests();
        } catch (error) {
            console.error('Error approving professor:', error);
            toast.error('Erro ao aprovar professor');
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectionReason.trim()) return;

        try {
            const { data: userData } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('professor_approvals')
                .update({
                    status: 'rejected',
                    reviewed_by: userData.user?.id,
                    reviewed_at: new Date().toISOString(),
                    rejection_reason: rejectionReason
                })
                .eq('id', selectedRequest.id);

            if (error) throw error;

            toast.success('Solicitação rejeitada');
            setRejectDialogOpen(false);
            setRejectionReason("");
            setSelectedRequest(null);
            loadRequests();
        } catch (error) {
            console.error('Error rejecting professor:', error);
            toast.error('Erro ao rejeitar solicitação');
        }
    };

    if (loading) return <div>Carregando solicitações...</div>;

    if (requests.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    Nenhuma solicitação de professor pendente.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((request) => (
                <Card key={request.id}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={request.professor.avatar_url || undefined} />
                                    <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-lg">{request.professor.full_name}</h3>
                                    <p className="text-sm text-muted-foreground">{request.professor.email}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        Solicitado em {new Date(request.requested_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => {
                                        setSelectedRequest(request);
                                        setRejectDialogOpen(true);
                                    }}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Rejeitar
                                </Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(request)}
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Aprovar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rejeitar Solicitação</DialogTitle>
                        <DialogDescription>
                            Informe o motivo da rejeição para o professor.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Motivo</Label>
                            <Textarea
                                id="reason"
                                placeholder="Ex: Documentação incompleta..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleReject}>Rejeitar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
