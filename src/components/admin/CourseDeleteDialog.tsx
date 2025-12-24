import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Users, BookOpen } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Course {
    id: string;
    title: string;
    modules_count?: number;
    students_count?: number;
}

interface CourseDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: Course;
    onDelete: () => void;
}

export const CourseDeleteDialog = ({
    open,
    onOpenChange,
    course,
    onDelete,
}: CourseDeleteDialogProps) => {
    const [deleting, setDeleting] = useState(false);
    const [reason, setReason] = useState("");

    const handleDelete = async () => {
        try {
            if (!reason.trim()) {
                toast.error("Por favor, informe o motivo da exclusão");
                return;
            }

            setDeleting(true);

            // Verificar se é curso MOCK (localStorage)
            const isMock = course.id.startsWith("mock-");

            if (isMock) {
                // Excluir do localStorage
                console.log("Excluindo curso MOCK:", course.id);
                const stored = localStorage.getItem("demo_courses");
                if (stored) {
                    const courses = JSON.parse(stored);
                    const filtered = courses.filter((c: any) => c.id !== course.id);
                    localStorage.setItem("demo_courses", JSON.stringify(filtered));
                }

                toast.success("Curso excluído com sucesso!");
                onDelete();
                onOpenChange(false);
                setReason("");
                setDeleting(false);
                return;
            }

            // Se não for mock, tentar excluir do Supabase
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("Usuário não autenticado");
                setDeleting(false);
                return;
            }

            await api.deleteCourse(course.id);

            console.log("Course deleted:", course.id, "Reason:", reason);

            toast.success("Curso excluído com sucesso!");
            onDelete();
            onOpenChange(false);
            setReason("");
        } catch (error: any) {
            console.error("Error deleting course:", error);
            toast.error(`Erro ao excluir curso: ${error.message || "Erro desconhecido"}`);
        } finally {
            setDeleting(false);
        }
    };

    const hasStudents = (course.students_count || 0) > 0;
    const hasModules = (course.modules_count || 0) > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Excluir Curso
                    </DialogTitle>
                    <DialogDescription>
                        Esta ação não pode ser desfeita. O curso será excluído permanentemente.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Course Info */}
                    <div className="rounded-lg border border-border p-4 bg-muted/50">
                        <h4 className="font-semibold mb-2">{course.title}</h4>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                {course.modules_count || 0} módulos
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {course.students_count || 0} alunos
                            </span>
                        </div>
                    </div>

                    {/* Warnings */}
                    {(hasStudents || hasModules) && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                {hasStudents && (
                                    <p className="mb-1">
                                        <strong>Atenção:</strong> Este curso possui {course.students_count} aluno(s) matriculado(s).
                                    </p>
                                )}
                                {hasModules && (
                                    <p>
                                        <strong>Atenção:</strong> Este curso possui {course.modules_count} módulo(s) cadastrado(s).
                                    </p>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Deletion Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">
                            Motivo da Exclusão *
                        </Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Descreva o motivo da exclusão deste curso..."
                            rows={3}
                            className="resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            setReason("");
                        }}
                        disabled={deleting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting || !reason.trim()}
                    >
                        {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {deleting ? "Excluindo..." : "Confirmar Exclusão"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
