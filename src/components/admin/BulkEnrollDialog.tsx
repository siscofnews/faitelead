import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Loader2, Search, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { enrollmentService } from "@/services/enrollmentService";

interface Student {
    id: string;
    full_name: string;
    email: string;
    eligibility?: {
        can_enroll: boolean;
        reason: string;
        has_permission: boolean;
    };
}

interface BulkEnrollDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    courseTitle: string;
    onSuccess: () => void;
}

export const BulkEnrollDialog = ({
    open,
    onOpenChange,
    courseId,
    courseTitle,
    onSuccess,
}: BulkEnrollDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [notes, setNotes] = useState("");
    const [progress, setProgress] = useState(0);
    const [checkingEligibility, setCheckingEligibility] = useState(false);

    const loadStudents = useCallback(async () => {
        setLoading(true);
        setCheckingEligibility(true);
        try {
            // Get all profiles with student role
            const { data: roleData } = await supabase
                .from("user_roles")
                .select("user_id")
                .eq("role", "student");

            if (!roleData) {
                setStudents([]);
                return;
            }

            const userIds = roleData.map(r => r.user_id);

            // Get profiles for these users
            const { data: profilesData } = await supabase
                .from("profiles")
                .select("id, full_name, email")
                .in("id", userIds)
                .eq("is_active", true);

            const studentList: Student[] = (profilesData || []).map((p) => ({
                id: p.id,
                full_name: p.full_name || p.email,
                email: p.email,
            }));

            // Check eligibility for each student
            const studentsWithEligibility = await Promise.all(
                studentList.map(async (student) => {
                    const eligibility = await enrollmentService.checkEligibility(
                        student.id,
                        courseId
                    );
                    return { ...student, eligibility };
                })
            );

            setStudents(studentsWithEligibility);
        } catch (error) {
            console.error("Error loading students:", error);
            toast.error("Erro ao carregar alunos");
        } finally {
            setLoading(false);
            setCheckingEligibility(false);
        }
    }, [courseId]);

    useEffect(() => {
        if (open) {
            loadStudents();
            setSelectedIds(new Set());
            setNotes("");
            setSearchTerm("");
            setProgress(0);
        }
    }, [open, loadStudents]);

    const toggleStudent = (studentId: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(studentId)) {
            newSelected.delete(studentId);
        } else {
            newSelected.add(studentId);
        }
        setSelectedIds(newSelected);
    };

    const filteredStudents = students.filter(
        (student) =>
            student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const eligibleCount = filteredStudents.filter(
        (s) => s.eligibility?.can_enroll
    ).length;

    const toggleAll = () => {
        const eligibleStudents = filteredStudents.filter(
            (s) => s.eligibility?.can_enroll
        );
        if (selectedIds.size === eligibleStudents.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(eligibleStudents.map((s) => s.id)));
        }
    };

    const handleBulkEnroll = async () => {
        if (selectedIds.size === 0) {
            toast.error("Selecione pelo menos um aluno");
            return;
        }

        setEnrolling(true);
        setProgress(0);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Usuário não autenticado");
                return;
            }

            const result = await enrollmentService.bulkEnroll({
                studentIds: Array.from(selectedIds),
                courseId,
                enrolledBy: user.id,
                notes,
            });

            setProgress(100);

            if (result.successful.length > 0) {
                toast.success(`${result.successful.length} aluno(s) matriculado(s)!`);
            }
            if (result.failed.length > 0) {
                toast.warning(`${result.failed.length} matrícula(s) falharam.`);
            }

            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Error bulk enrolling:", error);
            toast.error("Erro ao processar matrículas");
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Matrícula em Massa
                    </DialogTitle>
                    <DialogDescription>
                        Matricular múltiplos alunos no curso: <strong>{courseTitle}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar alunos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span>Selecionados: <strong>{selectedIds.size}</strong></span>
                        <Button variant="outline" size="sm" onClick={toggleAll} disabled={checkingEligibility}>
                            Selecionar Todos
                        </Button>
                    </div>

                    <ScrollArea className="h-[300px] border rounded-lg">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="flex items-center justify-center py-12 text-muted-foreground">
                                Nenhum aluno encontrado
                            </div>
                        ) : (
                            <div className="p-4 space-y-2">
                                {filteredStudents.map((student) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer"
                                        onClick={() => student.eligibility?.can_enroll && toggleStudent(student.id)}
                                    >
                                        <Checkbox
                                            checked={selectedIds.has(student.id)}
                                            disabled={!student.eligibility?.can_enroll}
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">{student.full_name}</p>
                                            <p className="text-sm text-muted-foreground">{student.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    <div className="space-y-2">
                        <Label>Observações (opcional)</Label>
                        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
                    </div>

                    {enrolling && <Progress value={progress} />}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={enrolling}>
                        Cancelar
                    </Button>
                    <Button onClick={handleBulkEnroll} disabled={enrolling || selectedIds.size === 0}>
                        {enrolling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Matricular {selectedIds.size} Aluno(s)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
