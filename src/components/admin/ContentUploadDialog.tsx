import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Upload, FileText, Video, Youtube, Link as LinkIcon, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

interface ContentUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    moduleId: string;
    onSuccess: () => void;
}

type ContentType =
    | "pdf"
    | "word"
    | "powerpoint"
    | "video"
    | "youtube"
    | "text"
    | "external_link";

export const ContentUploadDialog = ({
    open,
    onOpenChange,
    moduleId,
    onSuccess
}: ContentUploadDialogProps) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        content_type: "pdf" as ContentType,
        text_content: "",
        youtube_url: "",
        external_url: "",
        duration_minutes: "",
        is_required: true,
        is_downloadable: true
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 100MB)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error(t("content.file_too_large"));
            return;
        }

        setSelectedFile(file);
        if (!formData.title) {
            setFormData({ ...formData, title: file.name });
        }
    };

    const uploadFile = async (file: File): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${moduleId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('course-materials')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from('course-materials')
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            toast.error(t("content.title_required"));
            return;
        }

        // Validate based on content type
        if (['pdf', 'word', 'powerpoint', 'video'].includes(formData.content_type) && !selectedFile) {
            toast.error(t("content.select_file_error"));
            return;
        }

        if (formData.content_type === 'youtube' && !formData.youtube_url) {
            toast.error(t("content.youtube_url_required"));
            return;
        }

        if (formData.content_type === 'external_link' && !formData.external_url) {
            toast.error(t("content.external_url_required"));
            return;
        }

        if (formData.content_type === 'text' && !formData.text_content.trim()) {
            toast.error(t("content.text_content_required"));
            return;
        }

        try {
            setLoading(true);
            setUploadProgress(10);
            let fileUrl = null;

            // Upload file if needed
            if (selectedFile) {
                setUploadProgress(30);
                fileUrl = await uploadFile(selectedFile);
                setUploadProgress(70);
            }

            // Get next order for contents
            const existing = await api.listContentsByModule(moduleId);
            const count = Array.isArray(existing) ? existing.length : 0;

            setUploadProgress(80);

            // Create content via backend
            const payload: any = {
                module_id: moduleId,
                title: formData.title,
                content_type: formData.content_type,
                order: (count || 0) + 1,
                is_required: formData.is_required
            }
            if (fileUrl) payload.url = fileUrl
            if (formData.youtube_url) payload.url = formData.youtube_url
            if (formData.external_url) payload.url = formData.external_url
            if (formData.text_content) payload.payload = { text: formData.text_content }
            if (formData.duration_minutes) payload.duration_minutes = Number(formData.duration_minutes)
            await api.createContent(payload)

            setUploadProgress(100);
            toast.success(t("content.success_upload"));
            onSuccess();
            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error("Error uploading content:", error);
            toast.error(t("content.error_upload"));
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            content_type: "pdf",
            text_content: "",
            youtube_url: "",
            external_url: "",
            duration_minutes: "",
            is_required: true,
            is_downloadable: true
        });
        setSelectedFile(null);
    };

    const getContentTypeIcon = () => {
        switch (formData.content_type) {
            case 'pdf':
            case 'word':
            case 'powerpoint':
                return <FileText className="h-5 w-5" />;
            case 'video':
                return <Video className="h-5 w-5" />;
            case 'youtube':
                return <Youtube className="h-5 w-5" />;
            case 'external_link':
                return <LinkIcon className="h-5 w-5" />;
            default:
                return <Upload className="h-5 w-5" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("content.upload_title")}</DialogTitle>
                    <DialogDescription>
                        {t("content.upload_desc")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Content Type */}
                    <div className="space-y-2">
                        <Label>{t("content.type_label")} *</Label>
                        <Select
                            value={formData.content_type}
                            onValueChange={(value: ContentType) => setFormData({ ...formData, content_type: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pdf">{t("content.types.pdf")}</SelectItem>
                                <SelectItem value="word">{t("content.types.word")}</SelectItem>
                                <SelectItem value="powerpoint">{t("content.types.powerpoint")}</SelectItem>
                                <SelectItem value="video">{t("content.types.video")}</SelectItem>
                                <SelectItem value="youtube">{t("content.types.youtube")}</SelectItem>
                                <SelectItem value="text">{t("content.types.text")}</SelectItem>
                                <SelectItem value="external_link">{t("content.types.external_link")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">{t("content.title_label")} *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={t("content.title_placeholder")}
                        />
                    </div>

                    {/* File Upload */}
                    {['pdf', 'word', 'powerpoint', 'video'].includes(formData.content_type) && (
                        <div className="space-y-2">
                            <Label>{t("content.file_label")} *</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                {selectedFile ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-center gap-2">
                                            {getContentTypeIcon()}
                                            <span className="font-medium">{selectedFile.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setSelectedFile(null)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                                            {t("auth.select_placeholder")}
                                        </Button>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {t("content.max_size")}
                                        </p>
                                    </>
                                )}
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept={
                                        formData.content_type === 'pdf' ? '.pdf' :
                                            formData.content_type === 'word' ? '.doc,.docx' :
                                                formData.content_type === 'powerpoint' ? '.ppt,.pptx' :
                                                    '.mp4,.mov,.avi'
                                    }
                                    onChange={handleFileSelect}
                                />
                            </div>
                        </div>
                    )}

                    {/* YouTube URL */}
                    {formData.content_type === 'youtube' && (
                        <div className="space-y-2">
                            <Label htmlFor="youtube_url">{t("content.youtube_url_label")} *</Label>
                            <Input
                                id="youtube_url"
                                value={formData.youtube_url}
                                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                        </div>
                    )}

                    {/* External URL */}
                    {formData.content_type === 'external_link' && (
                        <div className="space-y-2">
                            <Label htmlFor="external_url">{t("content.external_url_label")} *</Label>
                            <Input
                                id="external_url"
                                value={formData.external_url}
                                onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    )}

                    {/* Text Content */}
                    {formData.content_type === 'text' && (
                        <div className="space-y-2">
                            <Label htmlFor="text_content">{t("content.text_content_label")} *</Label>
                            <Textarea
                                id="text_content"
                                value={formData.text_content}
                                onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                                placeholder={t("content.text_content_placeholder")}
                                rows={10}
                            />
                        </div>
                    )}

                    {/* Duration */}
                    {['video', 'youtube'].includes(formData.content_type) && (
                        <div className="space-y-2">
                            <Label htmlFor="duration">{t("content.duration_label")}</Label>
                            <Input
                                id="duration"
                                type="number"
                                min="0"
                                value={formData.duration_minutes}
                                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                                placeholder="Ex: 45"
                            />
                        </div>
                    )}

                    {/* Options */}
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_required"
                                checked={formData.is_required}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, is_required: checked as boolean })
                                }
                            />
                            <label htmlFor="is_required" className="text-sm font-medium">
                                {t("content.is_required")}
                            </label>
                        </div>

                        {['pdf', 'word', 'powerpoint'].includes(formData.content_type) && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_downloadable"
                                    checked={formData.is_downloadable}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, is_downloadable: checked as boolean })
                                    }
                                />
                                <label htmlFor="is_downloadable" className="text-sm font-medium">
                                    {t("content.is_downloadable")}
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Upload Progress */}
                    {loading && uploadProgress > 0 && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>{t("content.uploading")}</span>
                                <span>{Math.round(uploadProgress)}%</span>
                            </div>
                            <Progress value={uploadProgress} />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        {t("common.cancel")}
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? t("content.uploading") : t("content.upload_button")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
