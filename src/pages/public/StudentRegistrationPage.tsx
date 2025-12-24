import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, GraduationCap, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { validateDocument, getDocumentMask, formatDocument } from '@/services/documentValidator';
import { validatePhotoFile, createImagePreview } from '@/services/photoService';

interface Course {
    id: string;
    title: string;
    description: string;
}

const StudentRegistrationPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        birth_date: '',
        country: 'Brasil',
        document_number: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: '',
        desired_course_id: '',
        education_level: '',
        why_course: '',
        how_found_us: '',
    });

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('id, title, description')
                .eq('is_active', true)
                .order('title');

            if (error) throw error;
            setCourses(data || []);
        } catch (error) {
            console.error('Error loading courses:', error);
            // Fallback para cursos mock
            setCourses([
                { id: 'mock-1', title: 'Bacharelado em Teologia', description: 'Curso superior completo' },
                { id: 'mock-2', title: 'Licenciatura em Teologia', description: 'Formação de professores' },
            ]);
        }
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            validatePhotoFile(file);
            setPhotoFile(file);
            const preview = await createImagePreview(file);
            setPhotoPreview(preview);
        } catch (error: any) {
            toast.error(error.message);
            e.target.value = '';
        }
    };

    const removePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
    };

    const handleDocumentChange = (value: string) => {
        const documentType = formData.country === 'Brasil' ? 'CPF'
            : formData.country === 'Portugal' ? 'NIF'
                : 'NIR';

        const formatted = formatDocument(value, documentType);
        setFormData(prev => ({ ...prev, document_number: formatted }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validações
        if (!formData.full_name || !formData.email || !formData.birth_date) {
            toast.error('Preencha todos os campos obrigatórios');
            return;
        }

        if (!formData.desired_course_id) {
            toast.error('Selecione o curso desejado');
            return;
        }

        // Validar idade mínima (16 anos)
        const birthDate = new Date(formData.birth_date);
        const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 16) {
            toast.error('Você deve ter pelo menos 16 anos');
            return;
        }

        // Validar documento
        const documentType = formData.country === 'Brasil' ? 'CPF'
            : formData.country === 'Portugal' ? 'NIF'
                : 'NIR';

        if (!validateDocument(formData.document_number, documentType)) {
            toast.error(`${documentType} inválido`);
            return;
        }

        setLoading(true);

        try {
            const selectedCourse = courses.find(c => c.id === formData.desired_course_id);

            const applicationData = {
                ...formData,
                document_type: documentType,
                document_number: formData.document_number.replace(/\D/g, ''),
                desired_course_name: selectedCourse?.title,
                photo_url: photoPreview, // Em produção, fazer upload real
                status: 'pending',
            };

            const { error } = await supabase
                .from('student_applications')
                .insert([applicationData]);

            if (error) throw error;

            toast.success('Inscrição enviada com sucesso! Aguarde aprovação.', {
                duration: 5000,
            });

            // Limpar formulário
            setFormData({
                full_name: '',
                email: '',
                phone: '',
                birth_date: '',
                country: 'Brasil',
                document_number: '',
                street: '',
                number: '',
                complement: '',
                neighborhood: '',
                city: '',
                state: '',
                zip_code: '',
                desired_course_id: '',
                education_level: '',
                why_course: '',
                how_found_us: '',
            });
            setPhotoFile(null);
            setPhotoPreview(null);

            // Redirecionar após 3 segundos
            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (error: any) {
            console.error('Error submitting application:', error);
            toast.error('Erro ao enviar inscrição. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
            <div className="container max-w-4xl mx-auto">
                <Card>
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <GraduationCap className="h-16 w-16 text-primary" />
                        </div>
                        <CardTitle className="text-3xl">Cadastro de Aluno</CardTitle>
                        <CardDescription className="text-base">
                            Preencha o formulário abaixo para se inscrever em nossos cursos.
                            Após aprovação, você receberá suas credenciais de acesso.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Dados Pessoais */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Dados Pessoais</h3>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="full_name">Nome Completo *</Label>
                                        <Input
                                            id="full_name"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Telefone</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="birth_date">Data de Nascimento *</Label>
                                        <Input
                                            id="birth_date"
                                            type="date"
                                            value={formData.birth_date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Foto */}
                                <div className="space-y-2">
                                    <Label>Foto (opcional)</Label>
                                    {!photoPreview ? (
                                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                            <Label htmlFor="photo" className="cursor-pointer text-sm text-muted-foreground">
                                                Clique para fazer upload (JPG, PNG, WebP - Max 2MB)
                                            </Label>
                                            <Input
                                                id="photo"
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={handlePhotoChange}
                                                className="hidden"
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-0 right-0"
                                                onClick={removePhoto}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Documento */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Documentação</h3>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="country">País *</Label>
                                        <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value, document_number: '' }))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Brasil">Brasil</SelectItem>
                                                <SelectItem value="Portugal">Portugal</SelectItem>
                                                <SelectItem value="França">França</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="document">
                                            {formData.country === 'Brasil' ? 'CPF' : formData.country === 'Portugal' ? 'NIF' : 'NIR'} *
                                        </Label>
                                        <Input
                                            id="document"
                                            value={formData.document_number}
                                            onChange={(e) => handleDocumentChange(e.target.value)}
                                            placeholder={getDocumentMask(formData.country === 'Brasil' ? 'CPF' : formData.country === 'Portugal' ? 'NIF' : 'NIR')}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Curso Desejado */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Curso de Interesse</h3>

                                <div className="space-y-2">
                                    <Label htmlFor="course">Qual curso você deseja fazer? *</Label>
                                    <Select value={formData.desired_course_id} onValueChange={(value) => setFormData(prev => ({ ...prev, desired_course_id: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o curso" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="why_course">Por que você quer fazer este curso?</Label>
                                    <Textarea
                                        id="why_course"
                                        value={formData.why_course}
                                        onChange={(e) => setFormData(prev => ({ ...prev, why_course: e.target.value }))}
                                        rows={3}
                                        placeholder="Conte-nos sua motivação..."
                                    />
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="flex gap-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/')}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1" disabled={loading}>
                                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Enviar Inscrição
                                </Button>
                            </div>

                            <p className="text-sm text-muted-foreground text-center">
                                * Campos obrigatórios
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StudentRegistrationPage;
