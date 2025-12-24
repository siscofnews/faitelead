import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, User, Clock, FileEdit, Trash2, Plus, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuditLog } from "@/hooks/useAuditLog";

interface CourseHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    courseTitle?: string;
}

const getActionIcon = (action: string) => {
    switch (action) {
        case 'INSERT':
            return <Plus className="h-4 w-4" />;
        case 'UPDATE':
            return <FileEdit className="h-4 w-4" />;
        case 'DELETE':
            return <Trash2 className="h-4 w-4" />;
        default:
            return <History className="h-4 w-4" />;
    }
};

const getActionLabel = (action: string) => {
    switch (action) {
        case 'INSERT':
            return 'Criação';
        case 'UPDATE':
            return 'Atualização';
        case 'DELETE':
            return 'Exclusão';
        default:
            return action;
    }
};

const getActionColor = (action: string) => {
    switch (action) {
        case 'INSERT':
            return 'bg-success text-success-foreground';
        case 'UPDATE':
            return 'bg-primary text-primary-foreground';
        case 'DELETE':
            return 'bg-destructive text-destructive-foreground';
        default:
            return 'bg-muted text-muted-foreground';
    }
};

const formatFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
        title: 'Título',
        description: 'Descrição',
        duration_months: 'Duração (meses)',
        total_hours: 'Carga Horária',
        monthly_price: 'Mensalidade',
        modality: 'Modalidade',
        mec_rating: 'Nota MEC',
        thumbnail_url: 'Imagem',
        is_active: 'Status',
        deleted_at: 'Data de Exclusão',
        deletion_reason: 'Motivo da Exclusão',
    };
    return fieldNames[field] || field;
};

const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Ativo' : 'Inativo';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string' && value.startsWith('http')) return 'URL da imagem';
    return String(value);
};

export const CourseHistoryDialog = ({
    open,
    onOpenChange,
    courseId,
    courseTitle,
}: CourseHistoryDialogProps) => {
    const { getAuditHistory } = useAuditLog();
    const [loading, setLoading] = useState(true);
    interface AuditLogEntry {
        id: string;
        action: string;
        user_role?: string;
        created_at: string;
        user_email?: string;
        changed_fields?: string[];
        old_values?: Record<string, unknown>;
        new_values?: Record<string, unknown>;
        metadata?: { deletion_reason?: string } & Record<string, unknown>;
    }
    const [history, setHistory] = useState<AuditLogEntry[]>([]);

    const loadHistory = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAuditHistory("courses", courseId);
            setHistory((data || []) as AuditLogEntry[]);
        } catch (error) {
            console.error("Error loading history:", error);
        } finally {
            setLoading(false);
        }
    }, [courseId, getAuditHistory]);

    useEffect(() => {
        if (open && courseId) {
            loadHistory();
        }
    }, [open, courseId, loadHistory]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Histórico de Alterações
                    </DialogTitle>
                    <DialogDescription>
                        {courseTitle && `Curso: ${courseTitle}`}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[60vh] pr-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <History className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Nenhum histórico encontrado</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((entry, index) => (
                                <Card key={entry.id} className="relative">
                                    <CardContent className="p-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Badge className={getActionColor(entry.action)}>
                                                    {getActionIcon(entry.action)}
                                                    <span className="ml-1">{getActionLabel(entry.action)}</span>
                                                </Badge>
                                                {entry.user_role && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {entry.user_role}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(entry.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                            </div>
                                        </div>

                                        {/* User Info */}
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                            <User className="h-4 w-4" />
                                            <span>{entry.user_email || 'Usuário desconhecido'}</span>
                                        </div>

                                        {/* Changed Fields */}
                                        {entry.changed_fields && entry.changed_fields.length > 0 && (
                                            <>
                                                <Separator className="my-3" />
                                                <div className="space-y-2">
                                                    <p className="text-sm font-semibold">Campos Alterados:</p>
                                                    <div className="grid gap-3">
                                                        {entry.changed_fields.map((field: string) => (
                                                            <div key={field} className="grid grid-cols-3 gap-2 text-sm">
                                                                <div className="font-medium text-muted-foreground">
                                                                    {formatFieldName(field)}:
                                                                </div>
                                                                <div className="text-destructive line-through">
                                                                    {formatValue(entry.old_values?.[field])}
                                                                </div>
                                                                <div className="text-success font-medium">
                                                                    {formatValue(entry.new_values?.[field])}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Deletion Reason */}
                                        {entry.action === 'DELETE' && entry.metadata?.deletion_reason && (
                                            <>
                                                <Separator className="my-3" />
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold">Motivo da Exclusão:</p>
                                                    <p className="text-sm text-muted-foreground italic">
                                                        "{entry.metadata.deletion_reason}"
                                                    </p>
                                                </div>
                                            </>
                                        )}

                                        {/* Timeline Connector */}
                                        {index < history.length - 1 && (
                                            <div className="absolute left-8 top-full h-4 w-0.5 bg-border" />
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
