import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
    Plus, Trash2, GripVertical, ChevronLeft, FileText, Video, Youtube, Link as LinkIcon, Eye, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentUploadDialog } from "@/components/admin/ContentUploadDialog";
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

interface Content {
    id: string;
    title: string;
    content_type: string;
    content_order: number;
    is_required: boolean;
    duration_minutes: number | null;
}

interface Module {
    id: string;
    title: string;
    subject_id: string;
}

const SortableContentItem = ({ content, onDelete, onComplete }: {
    content: Content;
    onDelete: () => void;
    onComplete: () => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: content.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getIcon = () => {
        switch (content.content_type) {
            case 'video': return <Video className="h-4 w-4" />;
            case 'youtube': return <Youtube className="h-4 w-4" />;
            case 'external_link': return <LinkIcon className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
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
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-full">
                            {getIcon()}
                        </div>
                        <div>
                            <h3 className="font-medium">{content.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                    {content.content_type.toUpperCase()}
                                </Badge>
                                {content.duration_minutes && (
                                    <span>{content.duration_minutes} min</span>
                                )}
                                {content.is_required && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                        Obrigatório
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onComplete} title="Concluir conteúdo">
                            <CheckCircle2 className="h-4 w-4 text-success" />
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

const ModuleContentManager = () => {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [module, setModule] = useState<Module | null>(null);
    const [contents, setContents] = useState<Content[]>([]);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (moduleId) {
            loadModule();
            loadContents();
        }
    }, [moduleId]);

    const loadModule = async () => {
        try {
            // Se o moduleId começa com "mock-", retornar dados mock
            if (String(moduleId).startsWith("mock-")) {
                setModule({
                    id: String(moduleId),
                    title: "Módulo de Demonstração",
                    subject_id: "mock-subject-1"
                });
                return;
            }

            const data = await api.getModule(String(moduleId));
            setModule(data);
        } catch (error) {
            console.error("Error loading module:", error);
            // Se der erro, criar módulo mock
            setModule({
                id: String(moduleId),
                title: "Módulo (offline)",
                subject_id: "mock-subject-1"
            });
            toast.info("Módulo em modo demonstração");
        }
    };

    const loadContents = async () => {
        try {
            setLoading(true);

            // Se é módulo mock, retornar array vazio
            if (String(moduleId).startsWith("mock-")) {
                setContents([]);
                toast.info("Módulos de demonstração não possuem conteúdo. Você pode adicionar!");
                setLoading(false);
                return;
            }

            const data = await api.listContentsByModule(String(moduleId));
            const rows = Array.isArray(data) ? data : [];
            setContents(rows.map((r: any) => ({
                id: r.id,
                title: r.title || r.url || "Conteúdo",
                content_type: r.content_type,
                content_order: r.order || 0,
                is_required: !!r.is_required,
                duration_minutes: r.duration_minutes ?? null
            })));
        } catch (error) {
            console.error("Error loading contents:", error);
            // Se der erro, retornar vazio
            setContents([]);
            toast.info("Nenhum conteúdo encontrado (modo demonstração)");
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = contents.findIndex((c) => c.id === active.id);
            const newIndex = contents.findIndex((c) => c.id === over.id);

            const reordered = arrayMove(contents, oldIndex, newIndex);
            const updated = reordered.map((content, index) => ({
                ...content,
                content_order: index + 1
            }));

            setContents(updated);

            try {
                for (const content of updated) {
                    await api.updateContent(content.id, { order: content.content_order });
                }
                toast.success("Ordem atualizada");
            } catch (error) {
                console.error("Error updating order:", error);
                toast.error("Erro ao atualizar ordem");
                loadContents();
            }
        }
    };

    const handleDelete = async (content: Content) => {
        if (!confirm(`Tem certeza que deseja excluir "${content.title}"?`)) {
            return;
        }

        try {
            await api.deleteContent(content.id);
            toast.success("Conteúdo excluído");
            loadContents();
        } catch (error) {
            console.error("Error deleting content:", error);
            toast.error("Erro ao excluir conteúdo");
        }
    };

    const handleComplete = async (content: Content) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/auth");
                return;
            }
            await api.upsertContentProgress(null, { student_id: user.id, content_id: content.id, completed: true });
            toast.success("Conteúdo concluído!");
        } catch (error) {
            console.error("Error completing content:", error);
            toast.error("Erro ao concluir conteúdo");
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
                            onClick={() => navigate(`/admin/subjects/${module?.subject_id}/modules`)}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Conteúdos do Módulo</h1>
                            <p className="text-muted-foreground">{module?.title}</p>
                        </div>
                    </div>
                    <Button onClick={() => setUploadDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Conteúdo
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Conteúdos ({contents.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {contents.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum conteúdo neste módulo</p>
                                <Button onClick={() => setUploadDialogOpen(true)} className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar Primeiro Conteúdo
                                </Button>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={contents.map(c => c.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {contents.map((content) => (
                                            <SortableContentItem
                                                key={content.id}
                                                content={content}
                                                onComplete={() => handleComplete(content)}
                                                onDelete={() => handleDelete(content)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </CardContent>
                </Card>

                <ContentUploadDialog
                    open={uploadDialogOpen}
                    onOpenChange={setUploadDialogOpen}
                    moduleId={moduleId!}
                    onSuccess={loadContents}
                />
            </div>
        </div>
    );
};

export default ModuleContentManager;
