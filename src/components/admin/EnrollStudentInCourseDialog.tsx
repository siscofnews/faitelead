import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Loader2 } from "lucide-react";
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

interface Course {
    id: string;
    title: string;
}

interface EnrollStudentInCourseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentId: string;
    studentName: string;
    onSuccess: () => void;
}

export const EnrollStudentInCourseDialog = ({
    open,
    onOpenChange,
    studentId,
    studentName,
    onSuccess,
}: EnrollStudentInCourseDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (open) {
            loadCourses();
            setSelectedCourse("");
            setNotes("");
        }
    }, [open]);

    const loadCourses = async () => {
        try {
            // Load active courses
            const { data } = await supabase
                .from("courses")
                .select("id, title")
                .eq("is_active", true)
                .order("title");

            if (data) {
                setCourses(data);
            }
        } catch (error) {
            console.error("Error loading courses:", error);
            toast.error("Erro ao carregar cursos");
        }
    };

    const handleEnroll = async () => {
        if (!selectedCourse) {
            toast.error("Selecione um curso");
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
                studentId,
                courseId: selectedCourse,
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
                        <BookOpen className="h-5 w-5" />
                        Matricular Aluno
                    </DialogTitle>
                    <DialogDescription>
                        Matricular <strong>{studentName}</strong> em um curso
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Selecionar Curso *</Label>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger>
                                <SelectValue placeholder="Escolha um curso..." />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.title}
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
                    <Button onClick={handleEnroll} disabled={loading || !selectedCourse}>
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Confirmar Matrícula
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
