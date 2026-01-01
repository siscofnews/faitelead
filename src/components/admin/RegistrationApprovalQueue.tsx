import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
    CheckCircle2, XCircle, Eye, Mail
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PendingStudent {
    id: string;
    full_name: string;
    email: string;
    cpf: string;
    phone: string;
    created_at: string;
    is_active: boolean;
}

export const RegistrationApprovalQueue = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<PendingStudent[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<PendingStudent | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadPendingStudents();
    }, []);

    const loadPendingStudents = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("profiles")
                .select("id, full_name, email, cpf, phone, created_at, is_active")
                .eq("is_active", false)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setStudents(data || []);
        } catch (error) {
            console.error("Error loading students:", error);
            toast.error(t("common.unknown_error"));
        } finally {
            setLoading(false);
        }
    };

    const approveStudent = async (studentId: string) => {
        try {
            setProcessing(true);

            // Update profile to active
            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    is_active: true
                })
                .eq("id", studentId);

            if (updateError) throw updateError;

            // Check if student role already exists
            const { data: existingRole } = await supabase
                .from("user_roles")
                .select("id")
                .eq("user_id", studentId)
                .eq("role", "student")
                .maybeSingle();

            if (!existingRole) {
                // Add student role
                const { error: roleError } = await supabase
                    .from("user_roles")
                    .insert({
                        user_id: studentId,
                        role: "student"
                    });

                if (roleError) throw roleError;
            }

            toast.success(t("dashboards.admin.approvals.approve_success"));
            loadPendingStudents();
            setViewDialogOpen(false);
            setSelectedStudent(null);
        } catch (error) {
            console.error("Error approving student:", error);
            toast.error(t("common.unknown_error"));
        } finally {
            setProcessing(false);
        }
    };

    const rejectStudent = async () => {
        if (!selectedStudent) {
            return;
        }

        try {
            setProcessing(true);

            // Just keep the user inactive - we could also delete
            toast.success(t("dashboards.admin.approvals.reject_success"));
            loadPendingStudents();
            setRejectDialogOpen(false);
            setViewDialogOpen(false);
            setSelectedStudent(null);
            setRejectionReason("");
        } catch (error) {
            console.error("Error rejecting student:", error);
            toast.error(t("common.unknown_error"));
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR");
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return t("common.time_ago.days", { count: diffDays, defaultValue: `há ${diffDays} dias` });
        if (diffHours > 0) return t("common.time_ago.hours", { count: diffHours, defaultValue: `há ${diffHours} horas` });
        return t("common.time_ago.minutes", { defaultValue: 'há poucos minutos' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{t("dashboards.admin.approvals.title")}</h2>
                    <p className="text-muted-foreground">
                        {students.length} {t("dashboards.admin.approvals.waiting", { count: students.length })}
                    </p>
                </div>
            </div>

            {students.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        {t("dashboards.admin.approvals.empty")}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {students.map((student) => (
                        <Card key={student.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarFallback>
                                            {student.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-semibold text-lg">{student.full_name}</h3>
                                                <div className="space-y-1 mt-2">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="h-4 w-4" />
                                                        {student.email}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <Badge variant="secondary">
                                                    {t("common.registered")} {getTimeAgo(student.created_at)}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    setViewDialogOpen(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                {t("dashboards.admin.approvals.view_details")}
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => approveStudent(student.id)}
                                                disabled={processing}
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                {t("dashboards.admin.approvals.approve")}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    setRejectDialogOpen(true);
                                                }}
                                                disabled={processing}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                {t("dashboards.admin.approvals.reject")}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* View Details Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t("dashboards.admin.approvals.details_title")}</DialogTitle>
                        <DialogDescription>
                            {t("dashboards.admin.approvals.details_desc")}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedStudent && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-24 w-24">
                                    <AvatarFallback className="text-2xl">
                                        {selectedStudent.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-semibold">{selectedStudent.full_name}</h3>
                                    <p className="text-muted-foreground">{selectedStudent.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">{t("auth.cpf_label")}</Label>
                                    <p className="font-medium">{selectedStudent.cpf}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">{t("auth.phone_label")}</Label>
                                    <p className="font-medium">{selectedStudent.phone}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">{t("common.registered_at", { defaultValue: "Cadastrado em" })}</Label>
                                    <p className="font-medium">{formatDate(selectedStudent.created_at)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                            {t("common.close", { defaultValue: "Fechar" })}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setViewDialogOpen(false);
                                setRejectDialogOpen(true);
                            }}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            {t("dashboards.admin.approvals.reject")}
                        </Button>
                        <Button
                            onClick={() => selectedStudent && approveStudent(selectedStudent.id)}
                            disabled={processing}
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {t("dashboards.admin.approvals.approve")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("dashboards.admin.approvals.reject_title")}</DialogTitle>
                        <DialogDescription>
                            {t("dashboards.admin.approvals.reject_desc", { defaultValue: "Informe o motivo da rejeição (opcional)." })}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="rejection_reason">{t("dashboards.admin.approvals.reject_reason_label")}</Label>
                            <Textarea
                                id="rejection_reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder={t("dashboards.admin.approvals.reject_placeholder", { defaultValue: "Ex: Documentação incompleta, etc." })}
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                            {t("common.cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={rejectStudent}
                            disabled={processing}
                        >
                            {t("dashboards.admin.approvals.reject_confirm")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
