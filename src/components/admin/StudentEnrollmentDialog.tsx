import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Loader2, User, Calendar, Mail, Lock, FileText, Globe } from 'lucide-react';
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    type Country,
    type DocumentType,
    getDocumentTypeForCountry,
    validateDocument,
    maskDocument,
    getDocumentPlaceholder,
    getDocumentMaxLength
} from '@/services/documentValidator';
import { uploadStudentPhoto, createImagePreview, validatePhotoFile } from '@/services/photoService';

interface StudentEnrollmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const StudentEnrollmentDialog = ({
    open,
    onOpenChange,
    onSuccess,
}: StudentEnrollmentDialogProps) => {
    const { t } = useTranslation();
    const [saving, setSaving] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        birth_date: '',
        phone: '',
        password: '',
        confirmPassword: '',
        country: 'Brasil' as Country,
        document_number: '',
    });

    const [documentType, setDocumentType] = useState<DocumentType>('CPF');

    // Atualizar tipo de documento quando país mudar
    useEffect(() => {
        const newDocType = getDocumentTypeForCountry(formData.country);
        setDocumentType(newDocType);
        setFormData(prev => ({ ...prev, document_number: '' }));
    }, [formData.country]);

    const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar
        const error = validatePhotoFile(file);
        if (error) {
            toast.error(error);
            return;
        }

        setPhotoFile(file);

        // Criar preview
        try {
            const preview = await createImagePreview(file);
            setPhotoPreview(preview);
        } catch (error) {
            toast.error(t("common.unknown_error"));
        }
    };

    const handleDocumentChange = (value: string) => {
        const masked = maskDocument(documentType, value);
        setFormData(prev => ({ ...prev, document_number: masked }));
    };

    const validateForm = (): boolean => {
        // Nome
        if (!formData.full_name.trim()) {
            toast.error(t("auth.fullname_label") + " " + t("common.required", { defaultValue: "é obrigatório" }));
            return false;
        }

        // Email
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error(t("auth.invalid_email", { defaultValue: "Email inválido" }));
            return false;
        }

        // Data de nascimento
        if (!formData.birth_date) {
            toast.error(t("auth.birth_date") + " " + t("common.required", { defaultValue: "é obrigatória" }));
            return false;
        }

        // Validar idade mínima (16 anos)
        const birthDate = new Date(formData.birth_date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 16) {
            toast.error(t("auth.age_error"));
            return false;
        }

        // Documento
        const cleanDoc = formData.document_number.replace(/\D/g, '');
        if (!validateDocument(documentType, cleanDoc)) {
            toast.error(`${documentType} ` + t("auth.document_invalid"));
            return false;
        }

        // Senha
        if (formData.password.length < 6) {
            toast.error(t("auth.password_min_length"));
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error(t("auth.passwords_match_error"));
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);

        try {
            // 1. Criar usuário no Supabase Auth
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.full_name,
                    }
                }
            });

            if (signUpError) throw signUpError;
            if (!authData.user) throw new Error(t("auth.error_enrollment"));

            const userId = authData.user.id;

            // 2. Upload da foto (se houver)
            let photoUrl: string | null = null;
            if (photoFile) {
                try {
                    const result = await uploadStudentPhoto(userId, photoFile);
                    photoUrl = result.url;
                } catch (photoError) {
                    console.error('Photo upload error:', photoError);
                    // Continuar sem foto
                }
            }

            // 3. Atualizar perfil
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    birth_date: formData.birth_date,
                    country: formData.country,
                    document_type: documentType,
                    document_number: formData.document_number.replace(/\D/g, ''),
                    photo_url: photoUrl,
                    is_active: true,
                    approval_status: 'approved',
                    role: 'student'
                });

            if (profileError) throw profileError;

            // 4. Adicionar role de student
            const { error: roleError } = await supabase
                .from('user_roles')
                .insert({
                    user_id: userId,
                    role: 'student',
                });

            if (roleError) throw roleError;

            toast.success(t("auth.success_enrollment"));
            onOpenChange(false);
            onSuccess();

            // 2. Limpar formulário
            setFormData({
                full_name: '',
                email: '',
                birth_date: '',
                phone: '',
                password: '',
                confirmPassword: '',
                country: 'Brasil',
                document_number: '',
            });
            setPhotoFile(null);
            setPhotoPreview(null);
            
        } catch (error: any) {
            console.error('Error enrolling student:', error);
            toast.error(error.message || t("auth.error_enrollment"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("auth.student_enrollment_title")}</DialogTitle>
                    <DialogDescription>
                        {t("auth.student_enrollment_desc")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Upload de Foto */}
                    <div className="space-y-2">
                        <Label>{t("auth.photo_label")}</Label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoSelect}
                            accept="image/*"
                            className="hidden"
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                        >
                            {photoPreview ? (
                                <div className="flex items-center gap-4">
                                    <img
                                        src={photoPreview}
                                        alt="Preview"
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="text-sm font-medium">{t("auth.photo_selected")}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {t("auth.click_to_change")}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">{t("auth.click_to_upload")}</p>
                                        <p className="text-xs text-muted-foreground">
                                            JPG, PNG ou WebP (max 2MB)
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nome Completo */}
                    <div className="space-y-2">
                        <Label htmlFor="full_name">
                            <User className="h-4 w-4 inline mr-2" />
                            {t("auth.fullname_label")} *
                        </Label>
                        <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            placeholder={t("auth.full_name_placeholder")}
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            <Mail className="h-4 w-4 inline mr-2" />
                            {t("auth.email_label")} *
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder={t("auth.email_placeholder")}
                        />
                    </div>

                    {/* Data de Nascimento */}
                    <div className="space-y-2">
                        <Label htmlFor="birth_date">
                            <Calendar className="h-4 w-4 inline mr-2" />
                            {t("auth.birth_date")} *
                        </Label>
                        <Input
                            id="birth_date"
                            type="date"
                            value={formData.birth_date}
                            onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    {/* País */}
                    <div className="space-y-2">
                        <Label htmlFor="country">
                            <Globe className="h-4 w-4 inline mr-2" />
                            {t("common.country")} *
                        </Label>
                        <Select
                            value={formData.country}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, country: value as Country }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Brasil">🇧🇷 Brasil</SelectItem>
                                <SelectItem value="Portugal">🇵🇹 Portugal</SelectItem>
                                <SelectItem value="França">🇫🇷 França</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Documento */}
                    <div className="space-y-2">
                        <Label htmlFor="document">
                            <FileText className="h-4 w-4 inline mr-2" />
                            {documentType} *
                        </Label>
                        <Input
                            id="document"
                            value={formData.document_number}
                            onChange={(e) => handleDocumentChange(e.target.value)}
                            placeholder={getDocumentPlaceholder(documentType)}
                            maxLength={getDocumentMaxLength(documentType)}
                        />
                    </div>

                    {/* Senha */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                <Lock className="h-4 w-4 inline mr-2" />
                                {t("auth.password_label")} *
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder={t("auth.password_min_length")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                <Lock className="h-4 w-4 inline mr-2" />
                                {t("auth.confirm_password")} *
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder={t("auth.confirm_password")}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t("common.cancel")}
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {t("dashboards.admin.students.new")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
