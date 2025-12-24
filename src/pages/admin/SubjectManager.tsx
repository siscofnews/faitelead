import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";
import {
    Plus, Edit, Trash2, GripVertical, ChevronLeft, BookOpen, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Subject {
    id: string;
    course_id: string;
    title: string;
    description: string | null;
    subject_order: number;
    estimated_hours: number | null;
    has_exam: boolean;
    passing_score: number;
    is_active: boolean;
}

interface Course {
    id: string;
    title: string;
    is_lifetime: boolean;
}

const SortableSubjectItem = ({ subject, onEdit, onDelete }: {
    subject: Subject;
    onEdit: () => void;
    onDelete: () => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: subject.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-4 p-4 bg-card border rounded-lg hover:shadow-md transition-all"
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="font-semibold text-lg">{subject.title}</h3>
                        {subject.description && (
                            <p className="text-sm text-muted-foreground mt-1">{subject.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                            {subject.estimated_hours && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    {subject.estimated_hours}h
                                </div>
                            )}
                            {subject.has_exam && (
                                <Badge variant="secondary">
                                    Prova: {subject.passing_score}% mínimo
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={onEdit}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onDelete}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SubjectManager = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { logAction } = useAuditLog();
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState<Course | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        estimated_hours: "",
        has_exam: true,
        passing_score: "70"
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (courseId) {
            loadCourse();
            loadSubjects();
        }
    }, [courseId]);

    const loadCourse = async () => {
        try {
            const { data, error } = await supabase
                .from("courses")
                .select("id, title, is_lifetime")
                .eq("id", courseId)
                .single();

            if (error) throw error;
            setCourse(data);
        } catch (error) {
            console.error("Error loading course:", error);
            toast.error("Erro ao carregar curso");
        }
    };

    const loadSubjects = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("course_subjects")
                .select("*")
                .eq("course_id", courseId)
                .eq("is_active", true)
                .order("subject_order");

            if (error) throw error;
            setSubjects(data || []);
        } catch (error) {
            console.error("Error loading subjects:", error);
            toast.error("Erro ao carregar matérias");
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = subjects.findIndex((s) => s.id === active.id);
            const newIndex = subjects.findIndex((s) => s.id === over.id);

            const reordered = arrayMove(subjects, oldIndex, newIndex);
            const updated = reordered.map((subject, index) => ({
                ...subject,
                subject_order: index + 1
            }));

            setSubjects(updated);

            // Update order in database
            try {
                for (const subject of updated) {
                    await supabase
                        .from("course_subjects")
                        .update({ subject_order: subject.subject_order })
                        .eq("id", subject.id);
                }

                await logAction(
                    "subjects_reordered",
                    "course_subjects",
                    courseId!,
                    null,
                    { course_title: course?.title }
                );

                toast.success("Ordem atualizada");
            } catch (error) {
                console.error("Error updating order:", error);
                toast.error("Erro ao atualizar ordem");
                loadSubjects(); // Reload to restore original order
            }
        }
    };

    const openCreateDialog = () => {
        setEditingSubject(null);
        setFormData({
            title: "",
            description: "",
            estimated_hours: "",
            has_exam: true,
            passing_score: "70"
        });
        setDialogOpen(true);
    };

    const openEditDialog = (subject: Subject) => {
        setEditingSubject(subject);
        setFormData({
            title: subject.title,
            description: subject.description || "",
            estimated_hours: subject.estimated_hours?.toString() || "",
            has_exam: subject.has_exam,
            passing_score: subject.passing_score.toString()
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            toast.error("Título é obrigatório");
            return;
        }

        try {
            if (editingSubject) {
                // Update existing subject
                const { error } = await supabase
                    .from("course_subjects")
                    .update({
                        title: formData.title,
                        description: formData.description || null,
                        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
                        has_exam: formData.has_exam,
                        passing_score: parseFloat(formData.passing_score)
                    })
                    .eq("id", editingSubject.id);

                if (error) throw error;

                await logAction(
                    "subject_updated",
                    "course_subjects",
                    editingSubject.id,
                    null,
                    { subject_title: formData.title, course_title: course?.title }
                );

                toast.success("Matéria atualizada");
            } else {
                // Create new subject
                const { error } = await supabase
                    .from("course_subjects")
                    .insert({
                        course_id: courseId,
                        title: formData.title,
                        description: formData.description || null,
                        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
                        has_exam: formData.has_exam,
                        passing_score: parseFloat(formData.passing_score),
                        subject_order: subjects.length + 1
                    });

                if (error) throw error;

                await logAction(
                    "subject_created",
                    "course_subjects",
                    courseId!,
                    null,
                    { subject_title: formData.title, course_title: course?.title }
                );

                toast.success("Matéria criada");
            }

            setDialogOpen(false);
            loadSubjects();
        } catch (error) {
            console.error("Error saving subject:", error);
            toast.error("Erro ao salvar matéria");
        }
    };

    const handleDelete = async (subject: Subject) => {
        if (!confirm(`Tem certeza que deseja excluir a matéria "${subject.title}"?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from("course_subjects")
                .update({ is_active: false })
                .eq("id", subject.id);

            if (error) throw error;

            await logAction(
                "subject_deleted",
                "course_subjects",
                subject.id,
                null,
                { subject_title: subject.title, course_title: course?.title }
            );

            toast.success("Matéria excluída");
            loadSubjects();
        } catch (error) {
            console.error("Error deleting subject:", error);
            toast.error("Erro ao excluir matéria");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/admin/courses")}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Matérias do Curso</h1>
                            <p className="text-muted-foreground">{course?.title}</p>
                        </div>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Matéria
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total de Matérias
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{subjects.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Com Prova
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {subjects.filter(s => s.has_exam).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Horas Totais
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {subjects.reduce((sum, s) => sum + (s.estimated_hours || 0), 0)}h
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Subjects List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Matérias ({subjects.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {subjects.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhuma matéria cadastrada ainda</p>
                                <Button onClick={openCreateDialog} className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Criar Primeira Matéria
                                </Button>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={subjects.map(s => s.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {subjects.map((subject) => (
                                            <SortableSubjectItem
                                                key={subject.id}
                                                subject={subject}
                                                onEdit={() => openEditDialog(subject)}
                                                onDelete={() => handleDelete(subject)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </CardContent>
                </Card>

                {/* Create/Edit Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingSubject ? "Editar Matéria" : "Nova Matéria"}
                            </DialogTitle>
                            <DialogDescription>
                                Preencha os dados da matéria
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Pneumatologia"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Descrição da matéria"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estimated_hours">Carga Horária Estimada</Label>
                                <Input
                                    id="estimated_hours"
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={formData.estimated_hours}
                                    onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                                    placeholder="Ex: 40"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="has_exam"
                                    checked={formData.has_exam}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, has_exam: checked as boolean })
                                    }
                                />
                                <label htmlFor="has_exam" className="text-sm font-medium">
                                    Matéria tem prova ao final
                                </label>
                            </div>

                            {formData.has_exam && (
                                <div className="space-y-2">
                                    <Label htmlFor="passing_score">Nota Mínima para Aprovação (%)</Label>
                                    <Input
                                        id="passing_score"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.passing_score}
                                        onChange={(e) => setFormData({ ...formData, passing_score: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSubmit}>
                                {editingSubject ? "Salvar" : "Criar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default SubjectManager;
