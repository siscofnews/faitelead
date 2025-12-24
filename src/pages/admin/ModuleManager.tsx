import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";
import {
    Plus, Edit, Trash2, GripVertical, ChevronLeft, Layers, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Module {
    id: string;
    subject_id: string;
    title: string;
    description: string | null;
    module_order: number;
}

interface Subject {
    id: string;
    title: string;
    course_id: string;
}

const SortableModuleItem = ({ module, onEdit, onDelete, onManageContent }: {
    module: Module;
    onEdit: () => void;
    onDelete: () => void;
    onManageContent: () => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: module.id });

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
                        <h3 className="font-semibold text-lg">{module.title}</h3>
                        {module.description && (
                            <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={onManageContent}>
                            <FileText className="h-4 w-4 mr-2" />
                            Conteúdos
                        </Button>
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

const ModuleManager = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const { logAction } = useAuditLog();
    const [loading, setLoading] = useState(true);
    const [subject, setSubject] = useState<Subject | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: ""
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (subjectId) {
            loadSubject();
            loadModules();
        }
    }, [subjectId]);

    const loadSubject = async () => {
        try {
            const data = await api.getSubject(String(subjectId));
            setSubject(data);
        } catch (error) {
            console.error("Error loading subject:", error);
            toast.error("Erro ao carregar matéria");
        }
    };

    const loadModules = async () => {
        try {
            setLoading(true);
            const data = await api.getModulesBySubject(String(subjectId));
            setModules((data || []).map((m: any) => ({
                id: m.id,
                subject_id: m.subject_id || String(subjectId),
                title: m.title,
                description: m.description || null,
                module_order: m.order_index || 0
            })));
        } catch (error) {
            console.error("Error loading modules:", error);
            toast.error("Erro ao carregar módulos");
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = modules.findIndex((m) => m.id === active.id);
            const newIndex = modules.findIndex((m) => m.id === over.id);

            const reordered = arrayMove(modules, oldIndex, newIndex);
            const updated = reordered.map((module, index) => ({
                ...module,
                module_order: index + 1
            }));

            setModules(updated);

            try {
                for (const module of updated) {
                    await api.updateModule(module.id, { order_index: module.module_order });
                }
                toast.success("Ordem atualizada");
            } catch (error) {
                console.error("Error updating order:", error);
                toast.error("Erro ao atualizar ordem");
                loadModules();
            }
        }
    };

    const openCreateDialog = () => {
        setEditingModule(null);
        setFormData({ title: "", description: "" });
        setDialogOpen(true);
    };

    const openEditDialog = (module: Module) => {
        setEditingModule(module);
        setFormData({
            title: module.title,
            description: module.description || ""
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            toast.error("Título é obrigatório");
            return;
        }

        try {
            // Importar supabase
            const { supabase } = await import("@/integrations/supabase/client");

            // Verificar se usuário está autenticado
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                toast.error("Sessão expirada. Faça login novamente.");
                return;
            }

            if (editingModule) {
                // Atualizar módulo
                const { error } = await supabase
                    .from("modules")
                    .update({
                        title: formData.title,
                        description: formData.description || null
                    })
                    .eq("id", editingModule.id);

                if (error) throw error;
                toast.success("Módulo atualizado");
            } else {
                // Criar módulo
                const { error } = await supabase
                    .from("modules")
                    .insert({
                        subject_id: String(subjectId),
                        title: formData.title,
                        description: formData.description || null,
                        order_index: modules.length + 1
                    });

                if (error) throw error;
                toast.success("Módulo criado");
            }

            setDialogOpen(false);
            loadModules();
        } catch (error) {
            console.error("Error saving module:", error);
            const message =
                (error as any)?.message ||
                (error as any)?.error_description ||
                "Erro desconhecido";
            toast.error(`Erro ao salvar módulo: ${message}`);
        }
    };

    const handleDelete = async (module: Module) => {
        if (!confirm(`Tem certeza que deseja excluir o módulo "${module.title}"?`)) {
            return;
        }

        try {
            await api.deleteModule(module.id);
            toast.success("Módulo excluído");
            loadModules();
        } catch (error) {
            console.error("Error deleting module:", error);
            toast.error("Erro ao excluir módulo");
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/courses/${subject?.course_id}/subjects`)}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Módulos</h1>
                            <p className="text-muted-foreground">{subject?.title}</p>
                        </div>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Módulo
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Módulos ({modules.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {modules.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum módulo cadastrado nesta matéria</p>
                                <Button onClick={openCreateDialog} className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Criar Primeiro Módulo
                                </Button>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={modules.map(m => m.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {modules.map((module) => (
                                            <SortableModuleItem
                                                key={module.id}
                                                module={module}
                                                onEdit={() => openEditDialog(module)}
                                                onDelete={() => handleDelete(module)}
                                                onManageContent={() => navigate(`/admin/modules/${module.id}/content`)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingModule ? "Editar Módulo" : "Novo Módulo"}
                            </DialogTitle>
                            <DialogDescription>
                                Organize o conteúdo da matéria em módulos
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Módulo 1: Introdução"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Descrição do conteúdo deste módulo"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSubmit}>
                                {editingModule ? "Salvar" : "Criar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default ModuleManager;
