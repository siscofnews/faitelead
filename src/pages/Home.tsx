import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  GraduationCap, Clock, Monitor, Award, BookOpen, Users, 
  ChevronRight, Play, MessageCircle, Phone, Mail, MapPin,
  Facebook, Instagram, Youtube, Linkedin, CheckCircle, Star, ArrowRight,
  Calendar, Video, Menu, X, Wifi, Building, Sparkles, 
  Trophy, Shield, Flame, Church, PlayCircle, Globe, Zap,
  Radio, MonitorPlay, UserCheck, BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import faitelLogo from "@/assets/faitel-logo.png";
import { ScrollReveal } from "@/hooks/useScrollReveal";
import QuickNav from "@/components/QuickNav";

// Import home sections
import DevotionalSection from "@/components/home/DevotionalSection";
import ChancellorsSection from "@/components/home/ChancellorsSection";
import SECCSection from "@/components/home/SECCSection";
import AnnouncementBanner from "@/components/home/AnnouncementBanner";
import RecognitionBanner from "@/components/home/RecognitionBanner";
import CertificationsSection from "@/components/home/CertificationsSection";

// Import course images
import juizArbitralImg from "@/assets/courses/juiz-arbitral.png";
import formacaoLideresImg from "@/assets/courses/formacao-lideres-celulas.png";
import direitosHumanosImg from "@/assets/courses/direitos-humanos.png";
import capelaniaImg from "@/assets/courses/capelania-militar.png";

// Modalities - The 3 learning modes
const modalities = [
  {
    icon: Building,
    title: "PRESENCIAL",
    subtitle: "100% em Sala de Aula",
    description: "Aulas presenciais com professores qualificados, interação direta e networking com outros alunos.",
    features: ["Aulas diárias", "Laboratórios práticos", "Biblioteca física", "Mentoria presencial"],
    color: "from-primary to-primary/80",
    badge: null,
  },
  {
    icon: MonitorPlay,
    title: "EAD",
    subtitle: "100% Online",
    description: "Estude no seu ritmo com aulas gravadas de alta qualidade, disponíveis 24 horas por dia.",
    features: ["Aulas gravadas HD", "Material digital", "Acesso vitalício", "Certificado online"],
    color: "from-accent to-accent/80",
    badge: "MAIS POPULAR",
  },
  {
    icon: Radio,
    title: "SEMI-PRESENCIAL",
    subtitle: "Híbrido com Aula ao Vivo",
    description: "O melhor dos dois mundos: flexibilidade do EAD com uma aula ao vivo por semana.",
    features: ["1 aula ao vivo/semana", "Conteúdo gravado", "Interação em tempo real", "Tira-dúvidas ao vivo"],
    color: "from-success to-success/80",
    badge: "NOVO",
    isLive: true,
  },
];

// Stats with impressive numbers
const stats = [
  { value: "23+", label: "Anos de História", icon: Trophy },
  { value: "65K+", label: "Alunos Formados", icon: Users },
  { value: "98%", label: "Taxa de Aprovação", icon: BadgeCheck },
  { value: "500+", label: "Aulas Disponíveis", icon: PlayCircle },
];

// Courses
const courses = [
  {
    title: "Bacharel em Teologia",
    level: "Graduação",
    duration: "4 anos",
    hours: "3.200h",
    featured: true,
  },
  {
    title: "Teologia Básica",
    level: "Extensão",
    duration: "1 ano",
    hours: "540h",
  },
  {
    title: "Teologia Intermediária",
    level: "Extensão",
    duration: "1 ano",
    hours: "720h",
  },
  {
    title: "Especialização em Liderança",
    level: "Pós-graduação",
    duration: "6 meses",
    hours: "360h",
  },
];

// FAITEL Courses with book images
const faitelCourses = [
  { title: "Juiz Arbitral", image: juizArbitralImg },
  { title: "Formação de Líderes de Células", image: formacaoLideresImg },
  { title: "Agentes e Defensores em Direitos Humanos", image: direitosHumanosImg },
  { title: "Capelania Geral Militar", image: capelaniaImg },
];

// Testimonials
const testimonials = [
  {
    name: "Pastor João Silva",
    role: "Igreja Batista Central",
    text: "A FAITEL transformou meu ministério. A profundidade teológica e a praticidade dos ensinamentos foram fundamentais.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Maria Santos",
    role: "Missionária",
    text: "A modalidade semi-presencial me permitiu continuar meus estudos mesmo em campo missionário. As aulas ao vivo são incríveis!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Rev. Carlos Oliveira",
    role: "Seminário Teológico",
    text: "Formação completa que une teoria e prática. Os materiais didáticos da WST Editora são de primeira qualidade.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
];

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(220_50%_6%)] text-foreground overflow-x-hidden">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-glass-dark py-2' : 'bg-transparent py-4'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img src={faitelLogo} alt="FAITEL" className="h-12 w-12 object-contain transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-white tracking-wider">FAITEL</h1>
                <p className="text-[10px] text-accent font-medium tracking-[0.3em]">FACULDADE TEOLÓGICA</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#modalidades" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">Modalidades</a>
              <a href="#cursos" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">Cursos</a>
              <a href="#certificacoes" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">Certificações</a>
              <a href="#sobre" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">Sobre</a>
              <a href="#depoimentos" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">Depoimentos</a>
              <Link to="/auth" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">Portal do Aluno</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link to="/auth" className="hidden md:block">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold btn-shine btn-3d-gold px-6">
                  MATRICULE-SE
                </Button>
              </Link>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] bg-[hsl(220_50%_8%)] text-white border-white/10">
                  <nav className="flex flex-col gap-4 mt-8">
                    <a href="#modalidades" className="text-lg font-medium py-3 border-b border-white/10 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Modalidades</a>
                    <a href="#cursos" className="text-lg font-medium py-3 border-b border-white/10 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Cursos</a>
                    <a href="#certificacoes" className="text-lg font-medium py-3 border-b border-white/10 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Certificações</a>
                    <a href="#sobre" className="text-lg font-medium py-3 border-b border-white/10 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Sobre</a>
                    <a href="#depoimentos" className="text-lg font-medium py-3 border-b border-white/10 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Depoimentos</a>
                    <Link to="/auth" className="text-lg font-medium py-3 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Portal do Aluno</Link>
                    <Link to="/auth" className="mt-4" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-accent text-accent-foreground font-bold">MATRICULE-SE</Button>
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        <QuickNav />
      </header>

      {/* Announcement Banner */}
      <div className="pt-20">
        <AnnouncementBanner />
      </div>

      {/* Hero Section - Ultra Modern 3D */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-animated-gradient">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(220_50%_6%)/50] to-[hsl(220_50%_6%)]" />
        
        {/* 3D Floating Elements */}
        <div className="absolute top-20 left-10 opacity-20 animate-float">
          <BookOpen className="h-32 w-32 text-accent" strokeWidth={1} />
        </div>
        <div className="absolute bottom-32 right-10 opacity-20 animate-float-delayed">
          <GraduationCap className="h-28 w-28 text-primary" strokeWidth={1} />
        </div>
        <div className="absolute top-1/3 right-1/4 opacity-10 animate-float-slow">
          <Church className="h-40 w-40 text-white" strokeWidth={0.5} />
        </div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto px-4 relative z-10 text-center pt-24">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-sm font-medium text-white">AULAS AO VIVO TODA SEMANA</span>
          </div>

          {/* Main 3D Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-white mb-4 text-3d-white animate-fade-in" style={{ animationDelay: '0.2s' }}>
            FAITEL
          </h1>
          
          <p className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-gradient-gold text-glow-gold mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            FACULDADE DE TEOLOGIA
          </p>

          {/* Neon Divider */}
          <div className="w-32 h-1 mx-auto mb-8 neon-line animate-fade-in" style={{ animationDelay: '0.5s' }} />

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            Formando líderes para o Reino há <span className="text-accent font-bold">23 anos</span>
          </p>

          <p className="text-base md:text-lg text-white/60 max-w-xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            Escolha sua modalidade: <span className="text-white font-semibold">Presencial</span>, <span className="text-white font-semibold">EAD</span> ou <span className="text-white font-semibold">Semi-Presencial</span> com aulas ao vivo
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <Link to="/auth">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-lg h-14 px-10 btn-shine btn-3d-gold glow-gold">
                <Zap className="mr-2 h-5 w-5" />
                COMECE AGORA
              </Button>
            </Link>
            <a href="#modalidades">
              <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold text-lg h-14 px-10 backdrop-blur-sm">
                <Play className="mr-2 h-5 w-5" />
                CONHECER MODALIDADES
              </Button>
            </a>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-8 h-12 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-accent rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Devotional Section - Café com o Chanceler */}
      <DevotionalSection />

      {/* Stats Section */}
      <section className="py-16 bg-[hsl(220_50%_8%)] relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <ScrollReveal key={index} animation="fade-up" delay={index * 100}>
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 group-hover:border-accent/50 transition-colors">
                    <stat.icon className="h-8 w-8 text-accent" />
                  </div>
                  <p className="text-4xl md:text-5xl font-display font-black text-white mb-2 text-3d-white">{stat.value}</p>
                  <p className="text-sm text-white/60 font-medium">{stat.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition Banner */}
      <RecognitionBanner />

      {/* Modalities Section - 3D Cards */}
      <section id="modalidades" className="py-24 bg-[hsl(220_50%_6%)] relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal animation="fade-up" className="text-center mb-16">
            <Badge className="bg-accent/20 text-accent border-accent/30 mb-4 font-semibold">
              <Sparkles className="h-3 w-3 mr-1" />
              ESCOLHA SUA JORNADA
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-4 text-3d-white">
              MODALIDADES DE
            </h2>
            <p className="text-3xl md:text-4xl font-display font-bold text-gradient-gold">
              ENSINO
            </p>
            <div className="w-24 h-1 mx-auto mt-6 neon-line" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 perspective-2000">
            {modalities.map((modality, index) => (
              <Card 
                key={index} 
                className={`relative bg-glass-card border-white/10 overflow-hidden group card-hover transform-3d ${
                  modality.isLive ? 'border-accent/30' : ''
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {modality.badge && (
                  <div className={`absolute top-4 right-4 z-10 ${
                    modality.badge === 'NOVO' ? 'bg-success' : 'bg-accent'
                  } text-xs font-bold px-3 py-1 rounded-full text-white shimmer`}>
                    {modality.badge}
                  </div>
                )}
                
                {modality.isLive && (
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-red-500/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    AO VIVO
                  </div>
                )}

                <CardContent className="p-8 relative">
                  {/* Icon */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${modality.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <modality.icon className="h-10 w-10 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-display font-bold text-white mb-2">{modality.title}</h3>
                  <p className="text-accent font-semibold text-sm mb-4">{modality.subtitle}</p>
                  
                  {/* Description */}
                  <p className="text-white/70 text-sm mb-6 leading-relaxed">{modality.description}</p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {modality.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link to="/auth">
                    <Button className={`w-full font-bold ${
                      modality.isLive 
                        ? 'bg-accent text-accent-foreground hover:bg-accent/90 glow-gold' 
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    }`}>
                      SAIBA MAIS
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>

                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Live Class Highlight Section */}
      <section className="py-20 bg-gradient-to-r from-[hsl(220_50%_10%)] via-[hsl(280_40%_15%)] to-[hsl(220_50%_10%)] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        {/* Animated Background */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2 mb-6">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-sm font-bold text-red-400">EXCLUSIVO</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6 text-3d-white">
                AULA AO VIVO
                <span className="block text-gradient-gold">TODA SEMANA</span>
              </h2>

              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Na modalidade <span className="text-accent font-bold">Semi-Presencial</span>, você tem acesso a uma 
                aula ao vivo por semana com nossos professores. Tire suas dúvidas em tempo real, 
                interaja com outros alunos e tenha uma experiência de aprendizado única.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <Video className="h-8 w-8 text-accent mb-2" />
                  <p className="font-bold text-white">HD Quality</p>
                  <p className="text-sm text-white/60">Transmissão em alta definição</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <MessageCircle className="h-8 w-8 text-accent mb-2" />
                  <p className="font-bold text-white">Chat ao Vivo</p>
                  <p className="text-sm text-white/60">Interação em tempo real</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <Calendar className="h-8 w-8 text-accent mb-2" />
                  <p className="font-bold text-white">Agenda Fixa</p>
                  <p className="text-sm text-white/60">Horários definidos</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <PlayCircle className="h-8 w-8 text-accent mb-2" />
                  <p className="font-bold text-white">Gravação</p>
                  <p className="text-sm text-white/60">Assista depois se perder</p>
                </div>
              </div>

              <Link to="/auth">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold btn-shine btn-3d-gold">
                  QUERO AULAS AO VIVO
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Video Preview Mockup */}
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-glass-card">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80')`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-24 h-24 rounded-full bg-accent/90 text-accent-foreground flex items-center justify-center hover:scale-110 transition-transform shadow-xl glow-gold animate-pulse-glow">
                    <Play className="h-12 w-12 ml-1" fill="currentColor" />
                  </button>
                </div>

                {/* Live Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  AO VIVO
                </div>

                {/* Viewers Count */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-lg">
                  <Users className="inline h-4 w-4 mr-1" />
                  234 assistindo
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white font-bold text-lg mb-1">Hermenêutica Bíblica - Aula 12</p>
                  <p className="text-white/70 text-sm">Prof. Dr. Valdinei Pereira</p>
                </div>
              </div>

              {/* Decorative Glow */}
              <div className="absolute -inset-4 bg-accent/20 rounded-3xl blur-2xl -z-10 animate-pulse-slow" />
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="cursos" className="py-24 bg-[hsl(220_50%_6%)] relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal animation="fade-up" className="text-center mb-16">
            <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 font-semibold">
              <GraduationCap className="h-3 w-3 mr-1" />
              FORMAÇÃO COMPLETA
            </Badge>
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4 text-3d-white">
              NOSSOS CURSOS
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-2">
              Cursos de 90 dias • 1 aula por semana • 3 horas/aula
            </p>
            <p className="text-2xl font-display font-bold text-accent">
              R$ 400,00 <span className="text-base font-normal text-white/60">| 1+3x no cartão ou PIX</span>
            </p>
            <div className="w-24 h-1 mx-auto mt-6 neon-line-blue" />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {faitelCourses.map((course, index) => (
              <ScrollReveal key={index} animation="fade-up" delay={index * 100}>
                <Card 
                  className="bg-glass-card border-white/10 overflow-hidden group card-hover hover:border-accent/30 h-full"
                >
                  <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-white/5 to-white/0 p-6">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-contain drop-shadow-xl transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground font-bold text-xs">
                      R$ 400
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-sm font-display font-bold text-white mb-3 line-clamp-2 group-hover:text-accent transition-colors min-h-[2.5rem]">
                      {course.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-xs text-white/60 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-accent" />
                        90 dias
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-accent" />
                        3h/aula
                      </span>
                    </div>

                    <Link to="/courses">
                      <Button className="w-full font-semibold bg-white/10 text-white hover:bg-accent hover:text-accent-foreground text-xs h-9">
                        VER DETALHES
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/courses">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold btn-shine">
                VER TODOS OS CURSOS
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECC Section - Revistas */}
      <SECCSection />

      {/* Chancellors Section */}
      <ChancellorsSection />

      {/* Certifications Section */}
      <CertificationsSection />

      {/* About Section */}
      <section id="sobre" className="py-24 bg-[hsl(220_50%_8%)] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-accent/20 text-accent border-accent/30 mb-6 font-semibold">
                <Trophy className="h-3 w-3 mr-1" />
                NOSSA HISTÓRIA
              </Badge>
              
              <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6 text-3d-white">
                <span className="text-gradient-gold">23 ANOS</span>
                <span className="block">DE EXCELÊNCIA</span>
              </h2>

              <p className="text-lg text-white/70 mb-6 leading-relaxed">
                Fundada pelo <span className="text-white font-semibold">Pastor Valdinei</span>, a FAITEL 
                nasceu como um seminário teológico com a visão de formar líderes cristãos 
                comprometidos com a Palavra de Deus.
              </p>

              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Hoje somos uma <span className="text-accent font-semibold">Faculdade Teológica de excelência</span>, 
                de mãos dadas com a <span className="text-white font-semibold">WST Editora e Gráfica</span>, 
                produzindo nossos próprios materiais didáticos exclusivos.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                  <Shield className="h-10 w-10 text-accent" />
                  <div>
                    <p className="font-bold text-white">Material Próprio</p>
                    <p className="text-sm text-white/60">WST Editora</p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                  <Award className="h-10 w-10 text-accent" />
                  <div>
                    <p className="font-bold text-white">Certificação</p>
                    <p className="text-sm text-white/60">Reconhecida</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Video/Image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80')`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220_50%_8%)] via-transparent to-transparent" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-20 h-20 rounded-full bg-accent/90 text-accent-foreground flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
                    <Play className="h-10 w-10 ml-1" fill="currentColor" />
                  </button>
                </div>
              </div>
              
              {/* Decorative Glow */}
              <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-24 bg-[hsl(220_50%_6%)] relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-accent/20 text-accent border-accent/30 mb-4 font-semibold">
              <Star className="h-3 w-3 mr-1" />
              DEPOIMENTOS
            </Badge>
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4 text-3d-white">
              O QUE DIZEM
            </h2>
            <p className="text-2xl font-display text-gradient-gold">NOSSOS ALUNOS</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-glass-card border-white/10 overflow-hidden group card-hover">
                <CardContent className="p-6">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-accent fill-accent" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-white/80 mb-6 leading-relaxed italic">"{testimonial.text}"</p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-accent/30"
                    />
                    <div>
                      <p className="font-bold text-white">{testimonial.name}</p>
                      <p className="text-sm text-white/60">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary via-primary/90 to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px]" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 text-3d-white">
            COMECE SUA
            <span className="block text-gradient-gold">JORNADA HOJE</span>
          </h2>
          
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Escolha a modalidade que melhor se adapta à sua rotina e transforme seu chamado em conhecimento.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-lg h-16 px-12 btn-shine btn-3d-gold glow-gold">
                MATRICULE-SE AGORA
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-2 border-white/50 text-white hover:bg-white/10 font-semibold text-lg h-16 px-12">
                <MessageCircle className="mr-2 h-6 w-6" />
                FALE CONOSCO
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(220_50%_4%)] py-16 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <img src={faitelLogo} alt="FAITEL" className="h-12 w-12 object-contain" />
                <div>
                  <h3 className="text-xl font-display font-bold text-white">FAITEL</h3>
                  <p className="text-xs text-accent">FACULDADE TEOLÓGICA</p>
                </div>
              </div>
              <p className="text-white/60 text-sm mb-6">
                Formando líderes para o Reino há 23 anos com excelência e compromisso com a Palavra de Deus.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Links Rápidos */}
            <div>
              <h4 className="font-display font-bold text-white mb-4">LINKS RÁPIDOS</h4>
              <ul className="space-y-3">
                <li><a href="#modalidades" className="text-white/60 hover:text-accent transition-colors text-sm">Modalidades</a></li>
                <li><Link to="/courses" className="text-white/60 hover:text-accent transition-colors text-sm">Curso</Link></li>
                <li><a href="#about" className="text-white/60 hover:text-accent transition-colors text-sm">À Propos</a></li>
                <li><a href="#chancellors" className="text-white/60 hover:text-accent transition-colors text-sm">Chancelaria</a></li>
                <li><a href="#secc" className="text-white/60 hover:text-accent transition-colors text-sm">SECC</a></li>
                <li><a href="#testimonials" className="text-white/60 hover:text-accent transition-colors text-sm">Testemunhos</a></li>
              </ul>
            </div>

            {/* Nossos Programas */}
            <div>
              <h4 className="font-display font-bold text-white mb-4">NOSSOS PROGRAMAS</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">Graduação</a></li>
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">Pós-graduação</a></li>
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">Mestrado</a></li>
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">Doutorado</a></li>
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">Profissionalizante</a></li>
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">EJA</a></li>
              </ul>
            </div>

            {/* Cursos */}
            <div>
              <h4 className="font-display font-bold text-white mb-4">CURSOS</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">Bacharel em Teologia</a></li>
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">Teologia Básica</a></li>
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">Especializações</a></li>
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">Pós-Graduação</a></li>
              </ul>
            </div>

            {/* Modalidades */}
            <div>
              <h4 className="font-display font-bold text-white mb-4">MODALIDADES</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">Presencial</a></li>
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">EAD - 100% Online</a></li>
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm flex items-center gap-2">
                  Semi-Presencial
                  <Badge className="bg-success text-white text-[10px] py-0">NOVO</Badge>
                </a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1">
              <h4 className="font-display font-bold text-white mb-4">CONTATO</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-white/60 text-sm">
                  <Phone className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p>+55 71 98338-4883</p>
                    <p>+55 75 9 9101-8335</p>
                    <p>+55 71 9 9682-2782</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-white/60 text-sm">
                  <Mail className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p>pr.vcsantos@gmail.com</p>
                    <p>faiteloficial@gmail.com</p>
                  </div>
                </li>
              </ul>
              
              <h4 className="font-display font-bold text-white mb-3 mt-6">ENDEREÇOS</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-white/60 text-sm">
                  <MapPin className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium mb-1">Matriz</p>
                    <p>BA 099 km 90 da Linha Verde, nº 001</p>
                    <p>Bairro: Comunidade Limoeiro</p>
                    <p>Entre Rios - BA, CEP: 48.180-000</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-white/60 text-sm">
                  <MapPin className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium mb-1">Sede Administrativa</p>
                    <p>Rua Henrique Alves Barbosa, 119</p>
                    <p>Bairro: Siriri</p>
                    <p>Aguaí - SP, CEP: 13.866-052</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              © 2024 FAITEL - Faculdade de Teologia. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-white/40 hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="text-white/40 hover:text-white transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/5571983384883?text=Olá! Gostaria de mais informações sobre os cursos da FAITEL."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-pulse-glow"
        style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}
      >
        <MessageCircle className="h-7 w-7 text-white" />
      </a>
    </div>
  );
};

export default Home;
