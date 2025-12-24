import { useState } from "react";
import { toast } from "sonner";
import { Link2, Copy, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface GenerateRegistrationLinkProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const GenerateRegistrationLink = ({ open, onOpenChange }: GenerateRegistrationLinkProps) => {
    const [loading, setLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        max_uses: "",
        expires_days: "",
        notes: ""
    });

    const generateLink = async () => {
        try {
            setLoading(true);

            // Generate a simple unique token
            const token = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

            const baseUrl = window.location.origin;
            const link = `${baseUrl}/auth?ref=${token}`;
            setGeneratedLink(link);

            toast.success("Link gerado com sucesso!");
        } catch (error) {
            console.error("Error generating link:", error);
            toast.error("Erro ao gerar link");
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            toast.success("Link copiado!");
        }
    };

    const resetForm = () => {
        setFormData({
            max_uses: "",
            expires_days: "",
            notes: ""
        });
        setGeneratedLink(null);
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Gerar Link de Cadastro</DialogTitle>
                    <DialogDescription>
                        Crie um link único para enviar aos alunos
                    </DialogDescription>
                </DialogHeader>

                {!generatedLink ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="max_uses">Limite de Usos</Label>
                            <Select
                                value={formData.max_uses}
                                onValueChange={(value) => setFormData({ ...formData, max_uses: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Ilimitado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Ilimitado</SelectItem>
                                    <SelectItem value="10">10 usos</SelectItem>
                                    <SelectItem value="25">25 usos</SelectItem>
                                    <SelectItem value="50">50 usos</SelectItem>
                                    <SelectItem value="100">100 usos</SelectItem>
                                    <SelectItem value="200">200 usos</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                Quantos alunos podem usar este link
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expires_days">Validade</Label>
                            <Select
                                value={formData.expires_days}
                                onValueChange={(value) => setFormData({ ...formData, expires_days: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Nunca expira" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Nunca expira</SelectItem>
                                    <SelectItem value="7">7 dias</SelectItem>
                                    <SelectItem value="15">15 dias</SelectItem>
                                    <SelectItem value="30">30 dias</SelectItem>
                                    <SelectItem value="60">60 dias</SelectItem>
                                    <SelectItem value="90">90 dias</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                Por quanto tempo o link será válido
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Observações (opcional)</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Ex: Link para turma de Teologia Básica 2025"
                                rows={3}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Card className="bg-green-50 border-green-200">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <Link2 className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h4 className="font-semibold text-green-900">Link Gerado com Sucesso!</h4>
                                        <div className="bg-white border border-green-200 rounded-lg p-3">
                                            <code className="text-sm break-all">{generatedLink}</code>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={copyLink} size="sm" variant="outline">
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copiar Link
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>Limite de Usos</span>
                                </div>
                                <p className="font-medium">
                                    {formData.max_uses ? `${formData.max_uses} alunos` : "Ilimitado"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Validade</span>
                                </div>
                                <p className="font-medium">
                                    {formData.expires_days ? `${formData.expires_days} dias` : "Nunca expira"}
                                </p>
                            </div>
                        </div>

                        {formData.notes && (
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Observações</Label>
                                <p className="text-sm">{formData.notes}</p>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    {!generatedLink ? (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Cancelar
                            </Button>
                            <Button onClick={generateLink} disabled={loading}>
                                {loading ? "Gerando..." : "Gerar Link"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={resetForm}>
                                Gerar Novo Link
                            </Button>
                            <Button onClick={handleClose}>
                                Fechar
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
