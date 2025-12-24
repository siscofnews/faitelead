import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { enrollmentService } from "@/services/enrollmentService";

interface Student {
    id: string;
    full_name: string;
    email: string;
}

interface EnrollStudentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    courseTitle: string;
    onSuccess: () => void;
}

export const EnrollStudentDialog = ({
    open,
    onOpenChange,
    courseId,
    courseTitle,
    onSuccess,
}: EnrollStudentDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (open) {
            loadStudents();
            setSelectedStudent("");
            setNotes("");
        }
    }, [open]);

    const loadStudents = async () => {
        try {
            // Get all users with student role
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

            setStudents((profilesData || []).map(p => ({
                id: p.id,
                full_name: p.full_name || p.email,
                email: p.email
            })));
        } catch (error) {
            console.error("Error loading students:", error);
            toast.error("Erro ao carregar alunos");
        }
    };

    const handleEnroll = async () => {
        if (!selectedStudent) {
            toast.error("Selecione um aluno");
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Usuário não autenticado");
                return;
            }

            const result = await enrollmentService.enrollStudent({
                studentId: selectedStudent,
                courseId,
                enrolledBy: user.id,
                notes,
            });

            if (result.success) {
                toast.success(result.message);
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error enrolling student:", error);
            toast.error("Erro ao matricular aluno");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Matricular Aluno
                    </DialogTitle>
                    <DialogDescription>
                        Matricular no curso: <strong>{courseTitle}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Selecionar Aluno *</Label>
                        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                            <SelectTrigger>
                                <SelectValue placeholder="Escolha um aluno..." />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map((student) => (
                                    <SelectItem key={student.id} value={student.id}>
                                        {student.full_name} ({student.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Observações (opcional)</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Adicione observações..."
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleEnroll} disabled={loading || !selectedStudent}>
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Matricular Aluno
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
