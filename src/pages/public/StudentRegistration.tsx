import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, Upload, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

const StudentRegistration = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameraActive, setCameraActive] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        date_of_birth: "",
        birthplace: "",
        terms_accepted: false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.full_name.trim()) {
            newErrors.full_name = "Nome completo é obrigatório";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email é obrigatório";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email inválido";
        }

        if (!formData.password) {
            newErrors.password = "Senha é obrigatória";
        } else if (formData.password.length < 6) {
            newErrors.password = "Senha deve ter no mínimo 6 caracteres";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "As senhas não coincidem";
        }

        if (!formData.date_of_birth) {
            newErrors.date_of_birth = "Data de nascimento é obrigatória";
        }

        if (!formData.birthplace.trim()) {
            newErrors.birthplace = "Naturalidade é obrigatória";
        }

        if (!photoFile) {
            newErrors.photo = "Foto é obrigatória";
        }

        if (!formData.terms_accepted) {
            newErrors.terms = "Você deve aceitar os termos";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Formato inválido. Use JPG ou PNG.");
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error("Arquivo muito grande. Máximo 5MB.");
            return;
        }

        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
            }
        } catch (error) {
            toast.error("Não foi possível acessar a câmera");
            console.error(error);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
                    setPhotoFile(file);
                    setPhotoPreview(canvas.toDataURL('image/jpeg'));
                    stopCamera();
                }
            }, 'image/jpeg', 0.9);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            setCameraActive(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Por favor, corrija os erros no formulário");
            return;
        }

        setLoading(true);

        try {
            // 1. Create user account
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.full_name,
                        date_of_birth: formData.date_of_birth,
                        birthplace: formData.birthplace
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Erro ao criar conta");

            // 2. Upload photo
            let photoUrl = null;
            if (photoFile) {
                const fileExt = photoFile.name.split('.').pop();
                const fileName = `${authData.user.id}/profile.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('student-photos')
                    .upload(fileName, photoFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('student-photos')
                    .getPublicUrl(fileName);

                photoUrl = urlData.publicUrl;
            }

            // 3. Update profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    date_of_birth: formData.date_of_birth,
                    birthplace: formData.birthplace,
                    photo_url: photoUrl,
                    registration_status: 'pending',
                    submitted_at: new Date().toISOString(),
                    terms_accepted_at: new Date().toISOString()
                })
                .eq('id', authData.user.id);

            if (profileError) throw profileError;

            // 4. Update registration link usage
            if (token) {
                await supabase.rpc('increment_link_usage', { link_token: token });
            }

            setSubmitted(true);
            toast.success("Cadastro enviado com sucesso!");

        } catch (error: any) {
            console.error("Registration error:", error);
            toast.error(error.message || "Erro ao enviar cadastro");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl">Cadastro Enviado!</CardTitle>
                        <CardDescription>
                            Seu cadastro foi recebido com sucesso
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <p className="text-muted-foreground">
                            Enviamos um email de confirmação para <strong>{formData.email}</strong>
                        </p>
                        <p className="text-muted-foreground">
                            Seu cadastro está sendo analisado por nossa equipe. Você receberá um email assim que for aprovado.
                        </p>
                        <Alert>
                            <AlertDescription>
                                <strong>Importante:</strong> Verifique sua caixa de entrada e spam para confirmar seu email.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">Cadastro de Aluno</CardTitle>
                        <CardDescription>
                            Preencha os dados abaixo para se cadastrar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Nome Completo */}
                            <div className="space-y-2">
                                <Label htmlFor="full_name">
                                    Nome Completo <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="full_name"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="Digite seu nome completo"
                                    className={errors.full_name ? "border-destructive" : ""}
                                />
                                {errors.full_name && (
                                    <p className="text-sm text-destructive">{errors.full_name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="seu@email.com"
                                    className={errors.email ? "border-destructive" : ""}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            {/* Senha */}
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Senha <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Mínimo 6 caracteres"
                                        className={errors.password ? "border-destructive" : ""}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirmar Senha */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    Confirmar Senha <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="Digite a senha novamente"
                                    className={errors.confirmPassword ? "border-destructive" : ""}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                                )}
                            </div>

                            {/* Data de Nascimento */}
                            <div className="space-y-2">
                                <Label htmlFor="date_of_birth">
                                    Data de Nascimento <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="date_of_birth"
                                    type="date"
                                    value={formData.date_of_birth}
                                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                    className={errors.date_of_birth ? "border-destructive" : ""}
                                />
                                {errors.date_of_birth && (
                                    <p className="text-sm text-destructive">{errors.date_of_birth}</p>
                                )}
                            </div>

                            {/* Naturalidade */}
                            <div className="space-y-2">
                                <Label htmlFor="birthplace">
                                    Naturalidade <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="birthplace"
                                    value={formData.birthplace}
                                    onChange={(e) => setFormData({ ...formData, birthplace: e.target.value })}
                                    placeholder="Cidade/Estado de nascimento"
                                    className={errors.birthplace ? "border-destructive" : ""}
                                />
                                {errors.birthplace && (
                                    <p className="text-sm text-destructive">{errors.birthplace}</p>
                                )}
                            </div>

                            {/* Foto */}
                            <div className="space-y-2">
                                <Label>
                                    Foto <span className="text-destructive">*</span>
                                </Label>
                                <div className="space-y-4">
                                    {photoPreview ? (
                                        <div className="relative">
                                            <img
                                                src={photoPreview}
                                                alt="Preview"
                                                className="w-32 h-32 object-cover rounded-lg mx-auto border-2 border-primary"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setPhotoPreview(null);
                                                    setPhotoFile(null);
                                                }}
                                                className="mt-2 w-full"
                                            >
                                                Trocar Foto
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            {cameraActive ? (
                                                <div className="space-y-2">
                                                    <video
                                                        ref={videoRef}
                                                        autoPlay
                                                        playsInline
                                                        className="w-full rounded-lg border"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            type="button"
                                                            onClick={capturePhoto}
                                                            className="flex-1"
                                                        >
                                                            <Camera className="h-4 w-4 mr-2" />
                                                            Capturar
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={stopCamera}
                                                            className="flex-1"
                                                        >
                                                            Cancelar
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="h-24"
                                                    >
                                                        <div className="text-center">
                                                            <Upload className="h-6 w-6 mx-auto mb-2" />
                                                            <span className="text-sm">Upload</span>
                                                        </div>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={startCamera}
                                                        className="h-24"
                                                    >
                                                        <div className="text-center">
                                                            <Camera className="h-6 w-6 mx-auto mb-2" />
                                                            <span className="text-sm">Selfie</span>
                                                        </div>
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                    {errors.photo && (
                                        <p className="text-sm text-destructive">{errors.photo}</p>
                                    )}
                                </div>
                            </div>

                            {/* Termo de Responsabilidade */}
                            <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                                <h3 className="font-semibold">Termo de Responsabilidade</h3>
                                <div className="text-sm text-muted-foreground space-y-2 max-h-40 overflow-y-auto">
                                    <p>
                                        Ao me cadastrar na plataforma FAITEL, declaro estar ciente e concordo com os seguintes termos:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-1 ml-2">
                                        <li>Comprometo-me a efetuar o pagamento das mensalidades nos prazos estabelecidos.</li>
                                        <li>Estou ciente de que o não pagamento pode resultar em suspensão do acesso à plataforma.</li>
                                        <li>Comprometo-me a cumprir todas as obrigações acadêmicas, incluindo participação em aulas, entrega de trabalhos e realização de provas.</li>
                                        <li>Declaro que todas as informações fornecidas são verdadeiras.</li>
                                        <li>Autorizo o uso da minha foto para fins de identificação acadêmica.</li>
                                        <li>Estou ciente das regras e regulamentos da instituição.</li>
                                    </ol>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        id="terms"
                                        checked={formData.terms_accepted}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, terms_accepted: checked as boolean })
                                        }
                                    />
                                    <label
                                        htmlFor="terms"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Li e aceito os termos de responsabilidade de pagamento e obrigações acadêmicas{" "}
                                        <span className="text-destructive">*</span>
                                    </label>
                                </div>
                                {errors.terms && (
                                    <p className="text-sm text-destructive">{errors.terms}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? "Enviando..." : "Enviar Cadastro"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StudentRegistration;
