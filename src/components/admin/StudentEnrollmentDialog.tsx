import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Loader2, User, Calendar, Mail, Lock, FileText, Globe } from 'lucide-react';
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
    const [saving, setSaving] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        birth_date: '',
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
            toast.error('Erro ao carregar preview da foto');
        }
    };

    const handleDocumentChange = (value: string) => {
        const masked = maskDocument(documentType, value);
        setFormData(prev => ({ ...prev, document_number: masked }));
    };

    const validateForm = (): boolean => {
        // Nome
        if (!formData.full_name.trim()) {
            toast.error('Nome completo é obrigatório');
            return false;
        }

        // Email
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error('Email inválido');
            return false;
        }

        // Data de nascimento
        if (!formData.birth_date) {
            toast.error('Data de nascimento é obrigatória');
            return false;
        }

        // Validar idade mínima (16 anos)
        const birthDate = new Date(formData.birth_date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 16) {
            toast.error('Aluno deve ter pelo menos 16 anos');
            return false;
        }

        // Documento
        const cleanDoc = formData.document_number.replace(/\D/g, '');
        if (!validateDocument(documentType, cleanDoc)) {
            toast.error(`${documentType} inválido`);
            return false;
        }

        // Senha
        if (formData.password.length < 6) {
            toast.error('Senha deve ter pelo menos 6 caracteres');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('As senhas não coincidem');
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
            if (!authData.user) throw new Error('Erro ao criar usuário');

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
                    birth_date: formData.birth_date,
                    country: formData.country,
                    document_type: documentType,
                    document_number: formData.document_number.replace(/\D/g, ''),
                    photo_url: photoUrl,
                    is_active: true,
                    approval_status: 'approved',
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

            toast.success('Aluno matriculado com sucesso!');
            onOpenChange(false);
            onSuccess();

            // Limpar formulário
            setFormData({
                full_name: '',
                email: '',
                birth_date: '',
                password: '',
                confirmPassword: '',
                country: 'Brasil',
                document_number: '',
            });
            setPhotoFile(null);
            setPhotoPreview(null);
            
        } catch (error: any) {
            console.error('Error enrolling student:', error);
            toast.error(error.message || 'Erro ao matricular aluno');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Matricular Novo Aluno</DialogTitle>
                    <DialogDescription>
                        Preencha os dados do aluno para criar a matrícula
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Upload de Foto */}
                    <div className="space-y-2">
                        <Label>Foto do Aluno</Label>
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
                                        <p className="text-sm font-medium">Foto selecionada</p>
                                        <p className="text-xs text-muted-foreground">
                                            Clique para alterar
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Clique para fazer upload</p>
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
                            Nome Completo *
                        </Label>
                        <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            placeholder="Nome completo do aluno"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            <Mail className="h-4 w-4 inline mr-2" />
                            Email *
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="email@exemplo.com"
                        />
                    </div>

                    {/* Data de Nascimento */}
                    <div className="space-y-2">
                        <Label htmlFor="birth_date">
                            <Calendar className="h-4 w-4 inline mr-2" />
                            Data de Nascimento *
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
                            País *
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
                                Senha *
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                <Lock className="h-4 w-4 inline mr-2" />
                                Confirmar Senha *
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="Repita a senha"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Matricular Aluno
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
