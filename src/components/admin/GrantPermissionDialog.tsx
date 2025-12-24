import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Loader2, Calendar, AlertCircle } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { enrollmentService } from "@/services/enrollmentService";

interface GrantPermissionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentId: string;
    studentName: string;
    onSuccess: () => void;
}

export const GrantPermissionDialog = ({
    open,
    onOpenChange,
    studentId,
    studentName,
    onSuccess,
}: GrantPermissionDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState("");
    const [hasExpiration, setHasExpiration] = useState(false);
    const [expirationDate, setExpirationDate] = useState("");
    const [maxConcurrent, setMaxConcurrent] = useState<number | null>(null);

    const handleGrant = async () => {
        if (!reason.trim()) {
            toast.error("Informe o motivo da permissão");
            return;
        }

        if (hasExpiration && !expirationDate) {
            toast.error("Informe a data de expiração");
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("Usuário não autenticado");
                return;
            }

            const result = await enrollmentService.grantPermission({
                studentId,
                grantedBy: user.id,
                reason,
                allowMultipleCourses: true,
                maxConcurrentCourses: maxConcurrent,
                expiresAt: hasExpiration ? new Date(expirationDate) : undefined,
            });

            if (result.success) {
                toast.success(result.message);
                onSuccess();
                onOpenChange(false);
                setReason("");
                setHasExpiration(false);
                setExpirationDate("");
                setMaxConcurrent(null);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error granting permission:", error);
            toast.error("Erro ao conceder permissão");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Conceder Permissão Especial
                    </DialogTitle>
                    <DialogDescription>
                        Permitir que <strong>{studentName}</strong> se matricule em múltiplos cursos simultaneamente
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">Motivo da Permissão *</Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Descreva o motivo para conceder esta permissão..."
                            rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                            Este motivo será registrado no histórico
                        </p>
                    </div>

                    {/* Max Concurrent Courses */}
                    <div className="space-y-2">
                        <Label htmlFor="max-concurrent">
                            Limite de Cursos Simultâneos (opcional)
                        </Label>
                        <Input
                            id="max-concurrent"
                            type="number"
                            min="1"
                            value={maxConcurrent || ""}
                            onChange={(e) => setMaxConcurrent(e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="Ilimitado"
                        />
                        <p className="text-xs text-muted-foreground">
                            Deixe em branco para permitir cursos ilimitados
                        </p>
                    </div>

                    {/* Expiration */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="has-expiration">Definir Data de Expiração</Label>
                            <Switch
                                id="has-expiration"
                                checked={hasExpiration}
                                onCheckedChange={setHasExpiration}
                            />
                        </div>

                        {hasExpiration && (
                            <div className="space-y-2">
                                <Label htmlFor="expiration-date">Data de Expiração</Label>
                                <Input
                                    id="expiration-date"
                                    type="datetime-local"
                                    value={expirationDate}
                                    onChange={(e) => setExpirationDate(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    A permissão será revogada automaticamente nesta data
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Info Alert */}
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                            <strong>Atenção:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>Esta permissão permite matrícula em múltiplos cursos</li>
                                <li>O aluno não precisará completar cursos anteriores</li>
                                <li>A permissão pode ser revogada a qualquer momento</li>
                                <li>Todas as ações são registradas no histórico</li>
                            </ul>
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleGrant} disabled={loading || !reason.trim()}>
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {loading ? "Concedendo..." : "Conceder Permissão"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
