import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, ArrowRight, User, Phone, GraduationCap, Shield, Crown, Users, ArrowLeft, Camera, Building2, Upload } from "lucide-react";
import faitelLogo from "@/assets/faitel-logo.png";

type EducationLevel = "fundamental" | "medio" | "superior" | "pos_graduacao";
type UserType = "student" | "admin" | "super_admin" | null;

interface Polo {
  id: string;
  name: string;
}

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);
  const [showAdminOptions, setShowAdminOptions] = useState(false);

  // Signup fields
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [educationLevel, setEducationLevel] = useState<EducationLevel>("medio");
  const [poloId, setPoloId] = useState<string>("");
  const [polos, setPolos] = useState<Polo[]>([]);

  // Selfie/Photo capture
  const [selfieData, setSelfieData] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPolos();
  }, []);

  const loadPolos = async () => {
    const { data } = await supabase
      .from("polos")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    setPolos(data || []);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      toast.error("Não foi possível acessar a câmera");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setSelfieData(imageData);
        stopCamera();
        toast.success("Foto capturada!");
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const userId = data.user.id;

      if (email.toLowerCase() === "faiteloficial@gmail.com") {
        await supabase.rpc("bootstrap_super_admin").catch(() => {});
      }

      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      const roles = (roleRows || []).map(r => r.role);
      const role = roles.find(r => r === "super_admin") || roles.find(r => r === "admin") || roles[0] || null;

      if (selectedUserType === "super_admin" && role !== "super_admin") {
        toast.error("Acesso negado. Você não é um Super Administrador.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      if (selectedUserType === "admin" && role !== "admin" && role !== "super_admin") {
        toast.error("Acesso negado. Você não é um Administrador.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (role === "super_admin" || role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }

      toast.success("Login realizado com sucesso!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao fazer login";
      toast.error(message);
      console.error("❌ Erro no login:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validations
      const cleanCpf = cpf.replace(/\D/g, "");
      if (cleanCpf.length !== 11) {
        throw new Error("CPF deve conter 11 dígitos");
      }

      if (!selfieData && !photoFile) {
        throw new Error("Por favor, tire uma selfie ou envie uma foto");
      }

      if (!poloId) {
        throw new Error("Por favor, selecione um polo");
      }

      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            cpf: cleanCpf,
            phone: phone.replace(/\D/g, ""),
            education_level: educationLevel,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Upload photo to storage
        const fileName = `${data.user.id}/selfie.jpg`;
        let blob: Blob;

        if (photoFile) {
          blob = photoFile;
        } else if (selfieData) {
          const base64Data = selfieData.split(",")[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: "image/jpeg" });
        } else {
          throw new Error("Nenhuma foto fornecida");
        }

        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(fileName, blob, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("profile-photos")
            .getPublicUrl(fileName);

          // Update profile with selfie URL and polo
          await supabase
            .from("profiles")
            .update({
              selfie_url: urlData.publicUrl,
              polo_id: poloId,
              approval_status: "pending"
            })
            .eq("id", data.user.id);
        }

        toast.success("Cadastro realizado! Aguarde a aprovação do seu diretor de polo.");
        navigate("/pending-approval");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao criar conta";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  const adminOptions = [
    {
      type: "admin" as const,
      title: "Administrador",
      description: "Gerenciamento da plataforma",
      icon: Shield,
      gradient: "from-emerald-500 to-emerald-600",
      shadowColor: "shadow-emerald-500/30",
    },
    {
      type: "super_admin" as const,
      title: "Super Administrador",
      description: "Acesso total ao sistema",
      icon: Crown,
      gradient: "from-amber-500 to-amber-600",
      shadowColor: "shadow-amber-500/30",
    },
  ];

  // Selection screen
  if (!selectedUserType) {
    return (
      <div className="min-h-screen flex">
        {/* Home Button */}
        <button
          onClick={() => navigate("/")}
          className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-background/80 backdrop-blur border border-border text-foreground hover:bg-background/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </button>

        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
            <img
              src={faitelLogo}
              alt="FAITEL"
              className="w-40 h-40 object-contain mb-8 animate-float"
            />
            <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4">
              FAITEL
            </h1>
            <p className="text-xl text-primary-foreground/90 font-light mb-2">
              Faculdade Internacional
            </p>
            <p className="text-xl text-primary-foreground/90 font-light mb-8">
              Teológica de Líderes
            </p>

            <div className="max-w-md space-y-6 text-primary-foreground/80">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center shrink-0">
                  <span className="text-2xl">📚</span>
                </div>
                <p className="text-sm">Cursos completos de teologia com material didático exclusivo</p>
              </div>
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center shrink-0">
                  <span className="text-2xl">🎓</span>
                </div>
                <p className="text-sm">Certificação reconhecida e corpo docente qualificado</p>
              </div>
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center shrink-0">
                  <span className="text-2xl">💻</span>
                </div>
                <p className="text-sm">Plataforma EAD moderna e intuitiva para estudar de qualquer lugar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - User Type Selection */}
        <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
          <div className="w-full max-w-lg space-y-8 animate-fade-in py-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center">
              <img
                src={faitelLogo}
                alt="FAITEL"
                className="w-24 h-24 object-contain mx-auto mb-4"
              />
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                Bem-vindo à FAITEL
              </h2>
              <p className="text-muted-foreground">
                Selecione o tipo de acesso para continuar
              </p>
            </div>

            {!showAdminOptions ? (
              // Main selection - Student or Admin
              <div className="grid gap-4">
                {/* Student Button */}
                <button
                  onClick={() => setSelectedUserType("student")}
                  className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30 shadow-lg hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-display font-bold text-white mb-1">
                        Portal do Aluno
                      </h3>
                      <p className="text-white/80 text-sm">
                        Acesso exclusivo para estudantes
                      </p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </button>

                {/* Admin Button */}
                <button
                  onClick={() => setShowAdminOptions(true)}
                  className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-slate-700 to-slate-800 shadow-slate-700/30 shadow-lg hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-display font-bold text-white mb-1">
                        Administradores
                      </h3>
                      <p className="text-white/80 text-sm">
                        Acesso administrativo e gerenciamento
                      </p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              </div>
            ) : (
              // Admin sub-options
              <div className="space-y-4">
                <button
                  onClick={() => setShowAdminOptions(false)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                <div className="grid gap-4">
                  {adminOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => setSelectedUserType(option.type)}
                      className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br ${option.gradient} ${option.shadowColor} shadow-lg hover:shadow-xl`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="relative flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                          <option.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-display font-bold text-white mb-1">
                            {option.title}
                          </h3>
                          <p className="text-white/80 text-sm">
                            {option.description}
                          </p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground">
              {showAdminOptions
                ? "Selecione seu nível de acesso administrativo"
                : "Escolha seu perfil para acessar as funcionalidades corretas"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Login/Signup forms
  return (
    <div className="min-h-screen flex">
      {/* Home Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-background/80 backdrop-blur border border-border text-foreground hover:bg-background/90 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Home</span>
      </button>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
          <img
            src={faitelLogo}
            alt="FAITEL"
            className="w-40 h-40 object-contain mb-8 animate-float"
          />
          <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4">
            FAITEL
          </h1>
          <p className="text-xl text-primary-foreground/90 font-light mb-2">
            Faculdade Internacional
          </p>
          <p className="text-xl text-primary-foreground/90 font-light mb-8">
            Teológica de Líderes
          </p>

          <div className="max-w-md space-y-6 text-primary-foreground/80">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center shrink-0">
                <span className="text-2xl">📚</span>
              </div>
              <p className="text-sm">Cursos completos de teologia com material didático exclusivo</p>
            </div>
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center shrink-0">
                <span className="text-2xl">🎓</span>
              </div>
              <p className="text-sm">Certificação reconhecida e corpo docente qualificado</p>
            </div>
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center shrink-0">
                <span className="text-2xl">💻</span>
              </div>
              <p className="text-sm">Plataforma EAD moderna e intuitiva para estudar de qualquer lugar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
        <div className="w-full max-w-md space-y-6 animate-fade-in py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <img
              src={faitelLogo}
              alt="FAITEL"
              className="w-24 h-24 object-contain mx-auto mb-4"
            />
          </div>

          {/* Back Button */}
          <button
            onClick={() => {
              setSelectedUserType(null);
              setShowAdminOptions(false);
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          {/* User Type Badge */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${selectedUserType === "student" ? "from-blue-500 to-blue-600" :
              selectedUserType === "admin" ? "from-emerald-500 to-emerald-600" :
                "from-amber-500 to-amber-600"
              }`}>
              {selectedUserType === "student" && <Users className="w-5 h-5 text-white" />}
              {selectedUserType === "admin" && <Shield className="w-5 h-5 text-white" />}
              {selectedUserType === "super_admin" && <Crown className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">
                {selectedUserType === "student" ? "Área do Aluno" :
                  selectedUserType === "admin" ? "Área Administrativa" :
                    "Super Administrador"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedUserType === "student" ? "Acesse sua conta de estudante" :
                  selectedUserType === "admin" ? "Gerencie a plataforma" :
                    "Acesso total ao sistema"}
              </p>
            </div>
          </div>

          {selectedUserType === "student" ? (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <Card className="border-0 shadow-xl">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-xl font-display">Entrar</CardTitle>
                    <CardDescription>
                      Digite suas credenciais para acessar a plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-sm font-medium">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10 h-11"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password" className="text-sm font-medium">
                            Senha
                          </Label>
                          <button
                            type="button"
                            className="text-xs text-primary hover:underline"
                          >
                            Esqueceu a senha?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-10 pr-10 h-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 btn-shine text-base font-medium"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            Entrando...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Entrar
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <Card className="border-0 shadow-xl">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-xl font-display">Criar Conta</CardTitle>
                    <CardDescription>
                      Preencha seus dados para se cadastrar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium">
                          Nome Completo
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            type="text"
                            placeholder="Seu nome completo"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="pl-10 h-11"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm font-medium">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10 h-11"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="cpf" className="text-sm font-medium">
                            CPF
                          </Label>
                          <Input
                            id="cpf"
                            type="text"
                            placeholder="000.000.000-00"
                            value={cpf}
                            onChange={(e) => setCpf(formatCPF(e.target.value))}
                            required
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium">
                            Telefone
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              type="text"
                              placeholder="(00) 00000-0000"
                              value={phone}
                              onChange={(e) => setPhone(formatPhone(e.target.value))}
                              required
                              className="pl-10 h-11"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="education" className="text-sm font-medium">
                          Nível de Escolaridade
                        </Label>
                        <Select value={educationLevel} onValueChange={(v) => setEducationLevel(v as EducationLevel)}>
                          <SelectTrigger className="h-11">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Selecione" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fundamental">Ensino Fundamental</SelectItem>
                            <SelectItem value="medio">Ensino Médio</SelectItem>
                            <SelectItem value="superior">Ensino Superior</SelectItem>
                            <SelectItem value="pos_graduacao">Pós-Graduação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Polo</Label>
                        <Select value={poloId} onValueChange={setPoloId}>
                          <SelectTrigger className="h-11">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Selecione seu polo" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {polos.map((polo) => (
                              <SelectItem key={polo.id} value={polo.id}>{polo.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Selfie (obrigatório)</Label>
                        {!selfieData ? (
                          <div className="space-y-2">
                            {showCamera ? (
                              <div className="relative rounded-lg overflow-hidden bg-muted">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-[4/3] object-cover" style={{ transform: "scaleX(-1)" }} />
                                <canvas ref={canvasRef} className="hidden" />
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                                  <Button type="button" size="sm" onClick={capturePhoto}><Camera className="h-4 w-4 mr-1" />Capturar</Button>
                                  <Button type="button" size="sm" variant="outline" onClick={stopCamera}>Cancelar</Button>
                                </div>
                              </div>
                            ) : (
                              <Button type="button" variant="outline" className="w-full h-20 gap-2" onClick={startCamera}>
                                <Camera className="h-5 w-5" />Tirar Selfie
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            <img src={selfieData} alt="Selfie" className="w-full aspect-[4/3] object-cover rounded-lg" />
                            <Button type="button" size="sm" variant="outline" className="absolute bottom-2 right-2" onClick={() => setSelfieData(null)}>Tirar outra</Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-medium">
                          Senha
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="pl-10 pr-10 h-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 btn-shine text-base font-medium"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            Criando conta...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Criar Conta
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            // Admin/Super Admin Login Only
            <Card className="border-0 shadow-xl">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl font-display">Entrar</CardTitle>
                <CardDescription>
                  Digite suas credenciais de {selectedUserType === "admin" ? "administrador" : "super administrador"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-sm font-medium">
                        Senha
                      </Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className={`w-full h-11 btn-shine text-base font-medium bg-gradient-to-r ${selectedUserType === "admin"
                      ? "from-emerald-500 to-emerald-600"
                      : "from-amber-500 to-amber-600"
                      } hover:opacity-90`}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Entrando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Entrar
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Ao continuar, você concorda com nossos{" "}
            <a href="#" className="text-primary hover:underline">
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="#" className="text-primary hover:underline">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
