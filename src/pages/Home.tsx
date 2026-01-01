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
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";

// Import home sections
import DevotionalSection from "@/components/home/DevotionalSection";
import ChancellorsSection from "@/components/home/ChancellorsSection";
import InternationalBoardSection from "@/components/home/InternationalBoardSection";
import TranslationTeamSection from "@/components/home/TranslationTeamSection";
import SECCSection from "@/components/home/SECCSection";
import AnnouncementBanner from "@/components/home/AnnouncementBanner";
import RecognitionBanner from "@/components/home/RecognitionBanner";
import CertificationsSection from "@/components/home/CertificationsSection";

// Import course images
import juizArbitralImg from "@/assets/courses/juiz-arbitral.png";
import formacaoLideresImg from "@/assets/courses/formacao-lideres-celulas.png";
import direitosHumanosImg from "@/assets/courses/direitos-humanos.png";
import capelaniaImg from "@/assets/courses/capelania-militar.png";

const Home = () => {
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Modalities - The 3 learning modes
  const modalities = [
    {
      icon: Building,
      title: t('modalities.presencial_title'),
      subtitle: t('modalities.presencial_subtitle'),
      description: t('modalities.presencial_desc'),
      features: [t('modalities.presencial_subtitle'), t('modalities.features.networking'), t('modalities.features.mentorship')], // Simplified for brevity/translation
      color: "from-primary to-primary/80",
      badge: null,
    },
    {
      icon: MonitorPlay,
      title: t('modalities.ead_title'),
      subtitle: t('modalities.ead_subtitle'),
      description: t('modalities.ead_desc'),
      features: [t('modalities.features.hd_video'), t('modalities.features.online_247'), t('modalities.features.online_platform')],
      color: "from-accent to-accent/80",
      badge: t('modalities.ead_badge'),
    },
    {
      icon: Radio,
      title: t('modalities.semi_title'),
      subtitle: t('modalities.semi_subtitle'),
      description: t('modalities.semi_desc'),
      features: [t('modalities.features.live_class'), t('modalities.features.hybrid'), t('modalities.features.interactive')],
      color: "from-success to-success/80",
      badge: t('modalities.semi_badge'),
      isLive: true,
    },
  ];

  // Stats with impressive numbers
  const stats = [
    { value: "23+", label: t('stats.years_history'), icon: Trophy },
    { value: "65K+", label: t('stats.students_graduated'), icon: Users },
    { value: "98%", label: t('stats.approval_rate'), icon: BadgeCheck },
    { value: "500+", label: t('stats.classes_available'), icon: PlayCircle },
  ];

  // FAITEL Courses with book images
  const faitelCourses = [
    { title: t('courses.names.juiz_arbitral'), image: juizArbitralImg },
    { title: t('courses.names.lideres'), image: formacaoLideresImg },
    { title: t('courses.names.direitos_humanos'), image: direitosHumanosImg },
    { title: t('courses.names.capelania'), image: capelaniaImg },
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Pastor João Silva",
      role: t('testimonials.t1.role'),
      text: t('testimonials.t1.text'),
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Maria Santos",
      role: t('testimonials.t2.role'),
      text: t('testimonials.t2.text'),
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Rev. Carlos Oliveira",
      role: t('testimonials.t3.role'),
      text: t('testimonials.t3.text'),
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
  ];

  return (
    <div className="min-h-screen bg-[hsl(220_50%_6%)] text-foreground overflow-x-hidden">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-glass-dark py-2' : 'bg-transparent py-4'
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
                <p className="text-[10px] text-accent font-medium tracking-[0.3em]">{t('hero.theology_faculty')}</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#modalidades" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">{t('nav.modalities')}</a>
              <a href="#cursos" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">{t('nav.courses')}</a>
              <a href="#certificacoes" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">{t('nav.certifications')}</a>
              <a href="#sobre" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">{t('nav.about')}</a>
              <a href="#depoimentos" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">{t('nav.testimonials')}</a>
              <Link to="/auth" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">{t('nav.student_portal')}</Link>
            </nav>

            <div className="flex items-center gap-4">
              <LanguageSwitcher className="text-white hover:text-accent hover:bg-white/10" />
              <Link to="/auth" className="hidden md:block">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold btn-shine btn-3d-gold px-6">
                  {t('enroll')}
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
                    <a href="#modalidades" className="text-lg font-medium py-3 border-b border-white/10 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>{t('nav.modalities')}</a>
                    <a href="#cursos" className="text-lg font-medium py-3 border-b border-white/10 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>{t('nav.courses')}</a>
                    <a href="#certificacoes" className="text-lg font-medium py-3 border-b border-white/10 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>{t('nav.certifications')}</a>
                    <a href="#sobre" className="text-lg font-medium py-3 border-b border-white/10 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>{t('nav.about')}</a>
                    <a href="#depoimentos" className="text-lg font-medium py-3 border-b border-white/10 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>{t('nav.testimonials')}</a>
                    <div className="py-3 border-b border-white/10">
                      <LanguageSwitcher className="w-full justify-start text-lg font-medium text-white hover:text-accent p-0 hover:bg-transparent" />
                    </div>
                    <Link to="/auth" className="text-lg font-medium py-3 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>{t('nav.student_portal')}</Link>
                    <Link to="/auth" className="mt-4" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-accent text-accent-foreground font-bold">{t('enroll')}</Button>
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
            <span className="text-sm font-medium text-white">{t('hero.live_class_weekly')}</span>
          </div>

          {/* Main 3D Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-white mb-4 text-3d-white animate-fade-in" style={{ animationDelay: '0.2s' }}>
            FAITEL
          </h1>

          <p className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-gradient-gold text-glow-gold mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {t('hero.theology_faculty')}
          </p>

          {/* Neon Divider */}
          <div className="w-32 h-1 mx-auto mb-8 neon-line animate-fade-in" style={{ animationDelay: '0.5s' }} />

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {t('hero.forming_leaders')} <span className="text-accent font-bold">{t('hero.years')}</span>
          </p>

          <p className="text-base md:text-lg text-white/60 max-w-xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            {t('hero.choose_modality')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <Link to="/auth">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-lg h-14 px-10 btn-shine btn-3d-gold glow-gold">
                <Zap className="mr-2 h-5 w-5" />
                {t('hero.start_now')}
              </Button>
            </Link>
            <a href="#modalidades">
              <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold text-lg h-14 px-10 border-none">
                <Play className="mr-2 h-5 w-5" />
                {t('nav.know_modalities')}
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
              {t('modalities.choose_journey')}
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-4 text-3d-white">
              {t('modalities.title_prefix')}
            </h2>
            <p className="text-3xl md:text-4xl font-display font-bold text-gradient-gold">
              {t('modalities.title_suffix')}
            </p>
            <div className="w-24 h-1 mx-auto mt-6 neon-line" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 perspective-2000">
            {modalities.map((modality, index) => (
              <Card
                key={index}
                className={`relative bg-glass-card border-white/10 overflow-hidden group card-hover transform-3d ${modality.isLive ? 'border-accent/30' : ''
                  }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {modality.badge && (
                  <div className={`absolute top-4 right-4 z-10 ${modality.badge === 'NOVO' ? 'bg-success' : 'bg-accent'
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
                    {t('modalities.live')}
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
                    <Button className={`w-full font-bold ${modality.isLive
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90 glow-gold'
                      : 'bg-yellow-400 text-black hover:bg-yellow-500 border-none'
                      }`}>
                      {t('modalities.learn_more')}
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
                <span className="text-sm font-bold text-red-400">{t('live.exclusive')}</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6 text-3d-white">
                {t('live.title').split(' ').slice(0, 3).join(' ')}
                <span className="block text-gradient-gold">{t('live.title').split(' ').slice(3).join(' ')}</span>
              </h2>

              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                {t('live.desc')}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <Video className="h-8 w-8 text-accent mb-2" />
                  <p className="font-bold text-white">{t('live.hd_quality')}</p>
                  <p className="text-sm text-white/60">{t('live.hd_desc')}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <MessageCircle className="h-8 w-8 text-accent mb-2" />
                  <p className="font-bold text-white">{t('live.live_chat')}</p>
                  <p className="text-sm text-white/60">{t('live.chat_desc')}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <Calendar className="h-8 w-8 text-accent mb-2" />
                  <p className="font-bold text-white">{t('live.fixed_schedule')}</p>
                  <p className="text-sm text-white/60">{t('live.schedule_desc')}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <PlayCircle className="h-8 w-8 text-accent mb-2" />
                  <p className="font-bold text-white">{t('live.recording')}</p>
                  <p className="text-sm text-white/60">{t('live.recording_desc')}</p>
                </div>
              </div>

              <Link to="/auth">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold btn-shine btn-3d-gold">
                  {t('live.cta')}
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
                  {t('modalities.live')}
                </div>

                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-lg">
                  <Users className="inline h-4 w-4 mr-1" />
                  234 {t('live.watching')}
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white font-bold text-lg mb-1">{t('live.demo_title')}</p>
                  <p className="text-white/70 text-sm">{t('live.demo_prof')}</p>
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
              {t('courses.complete_formation')}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4 text-3d-white">
              {t('courses.our_courses')}
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-2">
              {t('courses.info')}
            </p>
            <p className="text-2xl font-display font-bold text-accent">
              {t('courses.price')} <span className="text-base font-normal text-white/60">{t('courses.payment')}</span>
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
                      {t('courses.price').split(' ')[0] + ' ' + t('courses.price').split(' ')[1]}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-sm font-display font-bold text-white mb-3 line-clamp-2 group-hover:text-accent transition-colors min-h-[2.5rem]">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-white/60 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-accent" />
                        {t('courses.days')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-accent" />
                        {t('courses.hours')}
                      </span>
                    </div>

                    <Link to="/courses">
                      <Button className="w-full font-bold bg-yellow-400 text-black hover:bg-yellow-500 text-xs h-9">
                        {t('courses.details')}
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
                {t('courses.see_all')}
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
      <InternationalBoardSection />
      <TranslationTeamSection />
      <DevotionalSection />

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
                {t('about.our_history')}
              </Badge>

              <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6 text-3d-white">
                <span className="text-gradient-gold">23 ANOS</span>
                <span className="block">DE EXCELÊNCIA</span>
              </h2>

              <p className="text-lg text-white/70 mb-6 leading-relaxed">
                {t('about.p1')}
              </p>

              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                {t('about.p2')}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                  <Shield className="h-10 w-10 text-accent" />
                  <div>
                    <p className="font-bold text-white">{t('about.own_material')}</p>
                    <p className="text-sm text-white/60">{t('about.wst_publisher')}</p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                  <Award className="h-10 w-10 text-accent" />
                  <div>
                    <p className="font-bold text-white">{t('about.certification')}</p>
                    <p className="text-sm text-white/60">{t('about.recognized')}</p>
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
              {t('testimonials.badge')}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4 text-3d-white">
              {t('testimonials.what_they_say')}
            </h2>
            <p className="text-2xl font-display text-gradient-gold">{t('testimonials.our_students')}</p>
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
            {t('cta.start_journey').split(' ').slice(0, 2).join(' ')}
            <span className="block text-gradient-gold">{t('cta.start_journey').split(' ').slice(2).join(' ')}</span>
          </h2>

          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            {t('cta.desc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-lg h-16 px-12 btn-shine btn-3d-gold glow-gold">
                {t('cta.enroll_now')}
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold text-lg h-16 px-12 border-none">
                <MessageCircle className="mr-2 h-6 w-6" />
                {t('cta.contact_us')}
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
                  <p className="text-xs text-accent">{t('hero.theology_faculty')}</p>
                </div>
              </div>
              <p className="text-white/60 text-sm mb-6">
                {t('about.p1').substring(0, 100)}...
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
              <h4 className="font-display font-bold text-white mb-4">{t('footer.quick_links')}</h4>
              <ul className="space-y-3">
                <li><a href="#modalidades" className="text-white/60 hover:text-accent transition-colors text-sm">{t('nav.modalities')}</a></li>
                <li><Link to="/courses" className="text-white/60 hover:text-accent transition-colors text-sm">{t('nav.courses')}</Link></li>
                <li><a href="#sobre" className="text-white/60 hover:text-accent transition-colors text-sm">{t('nav.about')}</a></li>
                <li><a href="#depoimentos" className="text-white/60 hover:text-accent transition-colors text-sm">{t('nav.testimonials')}</a></li>
              </ul>
            </div>

            {/* Nossos Programas */}
            <div>
              <h4 className="font-display font-bold text-white mb-4">{t('footer.programs')}</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">{t('footer.programs_list.graduation')}</a></li>
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">{t('footer.programs_list.post_grad')}</a></li>
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">{t('footer.programs_list.master')}</a></li>
              </ul>
            </div>

            {/* Cursos */}
            <div>
              <h4 className="font-display font-bold text-white mb-4">{t('footer.courses')}</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">{t('footer.courses_list.bachelor')}</a></li>
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">{t('footer.courses_list.basic')}</a></li>
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">{t('footer.courses_list.specialization')}</a></li>
              </ul>
            </div>

            {/* Modalidades */}
            <div>
              <h4 className="font-display font-bold text-white mb-4">{t('footer.modalities')}</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">{t('modalities.presencial_title')}</a></li>
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">{t('modalities.ead_title')}</a></li>
                <li><a href="#" className="text-white/60 hover:text-accent transition-colors text-sm flex items-center gap-2">
                  {t('modalities.semi_title')}
                  <Badge className="bg-success text-white text-[10px] py-0">{t('modalities.semi_badge')}</Badge>
                </a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1">
              <h4 className="font-display font-bold text-white mb-4">{t('footer.contact')}</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-white/60 text-sm">
                  <Phone className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p>+55 71 98338-4883</p>
                    <p>+55 75 9 9101-8335</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-white/60 text-sm">
                  <Mail className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p>faiteloficial@gmail.com</p>
                  </div>
                </li>
              </ul>

              <h4 className="font-display font-bold text-white mb-3 mt-6">{t('footer.addresses')}</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-white/60 text-sm">
                  <MapPin className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium mb-1">{t('footer.matriz')}</p>
                    <p>Entre Rios - BA</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              {t('footer.rights')}
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-white/40 hover:text-white transition-colors">{t('footer.terms')}</a>
              <a href="#" className="text-white/40 hover:text-white transition-colors">{t('footer.privacy')}</a>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <a
        href={`https://wa.me/5571983384883?text=${encodeURIComponent(t('cta.whatsapp_message'))}`}
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