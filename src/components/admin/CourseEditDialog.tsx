import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const COURSE_MODALITIES = [
    { value: "curso_livre", label: "Curso Livre" },
    { value: "basico", label: "Básico" },
    { value: "medio", label: "Médio / Técnico" },
    { value: "bacharel", label: "Bacharelado" },
    { value: "graduacao", label: "Graduação" },
    { value: "pos_graduacao", label: "Pós-Graduação" },
    { value: "mestrado", label: "Mestrado" },
    { value: "doutorado", label: "Doutorado" },
    { value: "extensao", label: "Extensão" },
    { value: "ead", label: "EAD" },
];

interface Course {
    id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    duration_months: number | null;
    total_hours: number | null;
    monthly_price: number;
    modality: string | null;
    mec_rating: number | null;
    is_active: boolean;
}

interface CourseEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: Course;
    onSave: () => void;
}

export const CourseEditDialog = ({
    open,
    onOpenChange,
    course,
    onSave,
}: CourseEditDialogProps) => {
    const [saving, setSaving] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: course.title,
        description: course.description || "",
        duration_months: course.duration_months || 12,
        total_hours: course.total_hours || 540,
        monthly_price: course.monthly_price || 0,
        modality: course.modality || "",
        mec_rating: course.mec_rating || null,
    });

    useEffect(() => {
        if (open) {
            setFormData({
                title: course.title,
                description: course.description || "",
                duration_months: course.duration_months || 12,
                total_hours: course.total_hours || 540,
                monthly_price: course.monthly_price || 0,
                modality: course.modality || "",
                mec_rating: course.mec_rating || null,
            });
            setThumbnailPreview(course.thumbnail_url);
            setThumbnailFile(null);
        }
    }, [open, course]);

    const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Imagem muito grande. Máximo 5MB");
                return;
            }
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleSave = async () => {
        try {
            if (!formData.title.trim()) {
                toast.error("Título é obrigatório");
                return;
            }

            setSaving(true);

            // Detectar se é curso mock
            const isMockCourse = course.id.startsWith("mock-");

            if (isMockCourse) {
                // Atualizar curso mock no localStorage
                const storedCourses = localStorage.getItem("demo_courses");
                if (storedCourses) {
                    const courses = JSON.parse(storedCourses);
                    const courseIndex = courses.findIndex((c: any) => c.id === course.id);

                    if (courseIndex !== -1) {
                        courses[courseIndex] = {
                            ...courses[courseIndex],
                            title: formData.title,
                            description: formData.description || null,
                            duration_months: formData.duration_months,
                            total_hours: formData.total_hours,
                            monthly_price: formData.monthly_price,
                            modality: formData.modality || null,
                            mec_rating: formData.mec_rating,
                        };
                        localStorage.setItem("demo_courses", JSON.stringify(courses));
                        toast.success("Curso atualizado com sucesso!");
                        onSave();
                        onOpenChange(false);
                    } else {
                        toast.error("Curso não encontrado");
                    }
                }
                setSaving(false);
                return;
            }

            // Se não for mock, usar Supabase
            const updates: Record<string, unknown> = {
                title: formData.title,
                description: formData.description || null,
                duration_months: formData.duration_months,
                total_hours: formData.total_hours,
                monthly_price: formData.monthly_price,
                modality: formData.modality || null,
                mec_rating: formData.mec_rating,
            };

            // Upload new thumbnail if selected
            if (thumbnailFile) {
                const fileExt = thumbnailFile.name.split('.').pop();
                const fileName = `courses/${course.id}/thumbnail.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('course-materials')
                    .upload(fileName, thumbnailFile, { upsert: true });

                if (!uploadError) {
                    const { data } = supabase.storage
                        .from('course-materials')
                        .getPublicUrl(fileName);
                    updates.thumbnail_url = data.publicUrl;
                }
            }

            // Update course
            const { error } = await supabase
                .from("courses")
                .update(updates)
                .eq("id", course.id);

            if (error) throw error;

            toast.success("Curso atualizado com sucesso!");
            onSave();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Error updating course:", error);
            toast.error(`Erro ao atualizar curso: ${error.message || "Erro desconhecido"}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Curso</DialogTitle>
                    <DialogDescription>
                        Faça as alterações necessárias no curso.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Thumbnail Upload */}
                    <div className="space-y-2">
                        <Label>Imagem do Curso</Label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleThumbnailSelect}
                            accept="image/*"
                            className="hidden"
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                        >
                            {thumbnailPreview ? (
                                <div className="relative">
                                    <img
                                        src={thumbnailPreview}
                                        alt="Preview"
                                        className="w-full h-40 object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                        <p className="text-white text-sm">Clique para trocar</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 py-8">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Clique para adicionar imagem</p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG até 5MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Título do Curso *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Bacharelado em Teologia"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Descrição do curso..."
                            rows={3}
                        />
                    </div>

                    {/* Duration and Hours */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duração (meses)</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={formData.duration_months}
                                onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hours">Carga Horária (h)</Label>
                            <Input
                                id="hours"
                                type="number"
                                value={formData.total_hours}
                                onChange={(e) => setFormData({ ...formData, total_hours: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    {/* Price, Modality, and MEC Rating */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Mensalidade (R$)</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={formData.monthly_price}
                                onChange={(e) => setFormData({ ...formData, monthly_price: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="modality">Nível / Modalidade</Label>
                            <Select
                                value={formData.modality}
                                onValueChange={(value) => setFormData({ ...formData, modality: value })}
                            >
                                <SelectTrigger id="modality">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COURSE_MODALITIES.map((mod) => (
                                        <SelectItem key={mod.value} value={mod.value}>
                                            {mod.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mec">Nota MEC</Label>
                            <Input
                                id="mec"
                                type="number"
                                min="1"
                                max="5"
                                step="0.1"
                                value={formData.mec_rating || ""}
                                onChange={(e) => setFormData({ ...formData, mec_rating: parseFloat(e.target.value) || null })}
                                placeholder="1-5"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {saving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
