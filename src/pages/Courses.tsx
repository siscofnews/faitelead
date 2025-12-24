import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Clock, Calendar, BookOpen, Users, ArrowRight, Check, 
  CreditCard, Smartphone, GraduationCap, Award, Play,
  Menu, ChevronDown, Star, Sparkles, Truck, Package, MessageCircle, Phone
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import faitelLogo from "@/assets/faitel-logo.png";

// Import course images
import juizArbitralImg from "@/assets/courses/juiz-arbitral.png";
import formacaoLideresImg from "@/assets/courses/formacao-lideres-celulas.png";
import direitosHumanosImg from "@/assets/courses/direitos-humanos.png";
import capelaniaImg from "@/assets/courses/capelania-militar.png";
import gestaoIgrejaImg from "@/assets/courses/gestao-igreja.png";
import direitoCanonico from "@/assets/courses/direito-canonico.png";
import juizDePazImg from "@/assets/courses/juiz-de-paz.png";

// Course data
const coursesData = [
  {
    id: 1,
    title: "Juiz Arbitral",
    image: juizArbitralImg,
    description: "Curso completo de Juiz Arbitral pela FAITEL. Capacitação para atuar como árbitro em mediação e resolução de conflitos, com base em princípios éticos e cristãos. Aprenda sobre legislação arbitral, técnicas de mediação e procedimentos legais.",
    topics: [
      "Fundamentos da Arbitragem",
      "Legislação Arbitral Brasileira",
      "Técnicas de Mediação de Conflitos",
      "Ética e Conduta do Árbitro",
      "Procedimentos e Documentação",
      "Prática de Arbitragem"
    ],
    color: "from-[hsl(38_60%_50%)] to-[hsl(220_60%_40%)]",
    borderColor: "border-[hsl(38_60%_50%)]"
  },
  {
    id: 2,
    title: "Formação de Líderes de Células",
    image: formacaoLideresImg,
    description: "Curso de Formação de Líderes de Células no formato Grupo Familiar de Crescimento. Desenvolva habilidades essenciais para liderar grupos de crescimento espiritual, multiplicar células e formar novos líderes em sua comunidade.",
    topics: [
      "Fundamentos dos Grupos Familiares",
      "Liderança Servidora",
      "Multiplicação de Células",
      "Dinâmicas de Grupo",
      "Discipulado Eficaz",
      "Gestão de Conflitos em Células"
    ],
    color: "from-[hsl(140_40%_35%)] to-[hsl(35_50%_45%)]",
    borderColor: "border-[hsl(140_40%_35%)]"
  },
  {
    id: 3,
    title: "Agentes, Defensores e Delegado em Direitos Humanos",
    image: direitosHumanosImg,
    description: "Capacitação completa para atuar como Agente, Defensor e Delegado em Direitos Humanos. Conheça a legislação, os tratados internacionais e as práticas de defesa dos direitos fundamentais da pessoa humana.",
    topics: [
      "Declaração Universal dos Direitos Humanos",
      "Legislação Brasileira de Direitos Humanos",
      "Tratados Internacionais",
      "Advocacy e Defesa de Direitos",
      "Atuação em Casos Práticos",
      "Ética e Responsabilidade Social"
    ],
    color: "from-[hsl(0_0%_95%)] to-[hsl(35_40%_50%)]",
    borderColor: "border-[hsl(35_40%_50%)]"
  },
  {
    id: 4,
    title: "Capelania Geral Militar",
    image: capelaniaImg,
    description: "Curso de Capelania Geral Militar - Esportiva e Militar. Formação completa para atuar como capelão em ambientes militares, esportivos, hospitalares e corporativos. Aprenda aconselhamento, cuidado pastoral e apoio espiritual.",
    topics: [
      "Fundamentos da Capelania",
      "Capelania Militar e Esportiva",
      "Aconselhamento Pastoral",
      "Cuidado em Situações de Crise",
      "Capelania Hospitalar",
      "Ética e Conduta do Capelão"
    ],
    color: "from-[hsl(0_0%_95%)] to-[hsl(0_50%_40%)]",
    borderColor: "border-[hsl(0_50%_40%)]"
  },
  {
    id: 5,
    title: "Gestão Administrativa de Igreja em Software",
    image: gestaoIgrejaImg,
    description: "Curso prático de Gestão Administrativa de Igreja utilizando Software especializado. Aprenda a gerenciar finanças, membros, eventos e comunicação da igreja de forma profissional e eficiente com ferramentas tecnológicas.",
    topics: [
      "Gestão Financeira Eclesiástica",
      "Cadastro e Gestão de Membros",
      "Organização de Eventos e Escalas",
      "Comunicação Digital na Igreja",
      "Ferramentas e Softwares de Gestão",
      "Relatórios e Indicadores"
    ],
    color: "from-[hsl(0_0%_95%)] to-[hsl(140_40%_35%)]",
    borderColor: "border-[hsl(140_40%_35%)]"
  },
  {
    id: 6,
    title: "Direito Religioso Canônico",
    image: direitoCanonico,
    description: "Curso de Direito Religioso Canônico pela FAITEL. Estudo aprofundado do direito canônico, sua história, princípios e aplicação prática nas instituições religiosas. Conheça a legislação eclesiástica e sua relação com o direito civil.",
    topics: [
      "História do Direito Canônico",
      "Princípios do Direito Eclesiástico",
      "Estrutura Jurídica das Igrejas",
      "Direito Matrimonial Canônico",
      "Processos e Procedimentos Canônicos",
      "Relação Igreja-Estado"
    ],
    color: "from-[hsl(0_0%_95%)] to-[hsl(35_50%_45%)]",
    borderColor: "border-[hsl(35_50%_45%)]"
  },
  {
    id: 7,
    title: "Juiz de Paz",
    image: juizDePazImg,
    description: "Curso de Juiz de Paz pela FAITEL - Faculdade Internacional Teológica de Líderes. Formação para atuar na promoção da paz, reconciliação e resolução pacífica de conflitos em comunidades, igrejas e instituições.",
    topics: [
      "Fundamentos da Cultura de Paz",
      "Técnicas de Reconciliação",
      "Mediação Comunitária",
      "Justiça Restaurativa",
      "Comunicação Não-Violenta",
      "Prática do Juiz de Paz"
    ],
    color: "from-[hsl(0_0%_95%)] to-[hsl(220_60%_40%)]",
    borderColor: "border-[hsl(220_60%_40%)]"
  },
];

// Course info card component
const CourseInfoCard = ({ icon: Icon, title, value }: { icon: LucideIcon; title: string; value: string }) => (
  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
      <Icon className="h-5 w-5 text-accent" />
    </div>
    <div>
      <p className="text-xs text-white/60">{title}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  </div>
);

const Courses = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<typeof coursesData[0] | null>(null);

  return (
    <div className="min-h-screen bg-[hsl(220_50%_6%)] text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-glass-dark py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img src={faitelLogo} alt="FAITEL" className="h-10 w-10 object-contain" />
              <div>
                <h1 className="text-xl font-display font-bold text-white tracking-wider">FAITEL</h1>
                <p className="text-[8px] text-accent font-medium tracking-[0.2em]">FACULDADE TEOLÓGICA</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">Início</Link>
              <Link to="/courses" className="text-sm font-medium text-accent transition-colors">Cursos</Link>
              <Link to="/auth" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">Portal do Aluno</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link to="/auth" className="hidden md:block">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold btn-shine px-6">
                  MATRICULE-SE
                </Button>
              </Link>

              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] bg-[hsl(220_50%_8%)] text-white border-white/10">
                  <nav className="flex flex-col gap-4 mt-8">
                    <Link to="/" className="text-lg font-medium py-3 border-b border-white/10">Início</Link>
                    <Link to="/courses" className="text-lg font-medium py-3 border-b border-white/10 text-accent">Cursos</Link>
                    <Link to="/auth" className="text-lg font-medium py-3">Portal do Aluno</Link>
                    <Link to="/auth" className="mt-4">
                      <Button className="w-full bg-accent text-accent-foreground font-bold">MATRICULE-SE</Button>
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[hsl(220_50%_10%)] to-[hsl(220_50%_6%)] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge className="bg-accent/20 text-accent border-accent/30 mb-6 font-semibold">
            <BookOpen className="h-3 w-3 mr-1" />
            NOSSOS CURSOS
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-4 text-3d-white">
            CURSOS DA
          </h1>
          <p className="text-3xl md:text-4xl font-display font-bold text-gradient-gold mb-6">
            FAITEL
          </p>
          
          <div className="w-24 h-1 mx-auto mb-8 neon-line" />
          
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            Formação completa com <span className="text-accent font-bold">certificado reconhecido</span>. 
            Cada curso tem duração de 90 dias, com 1 aula por semana de 3 horas.
          </p>

          {/* Pricing Highlight */}
          <div className="inline-flex flex-col md:flex-row items-center gap-4 md:gap-8 bg-glass-card border border-accent/30 rounded-2xl p-6 md:p-8">
            <div className="text-center md:text-left">
              <p className="text-sm text-white/60 mb-1">Investimento por curso</p>
              <p className="text-4xl md:text-5xl font-display font-black text-accent">R$ 400</p>
            </div>
            <div className="w-px h-12 bg-white/20 hidden md:block" />
            <div className="flex flex-col gap-2 text-left">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-accent" />
                <span className="text-sm text-white">1+3x no cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-accent" />
                <span className="text-sm text-white">À vista no PIX - FAITEL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Info Cards */}
      <section className="py-8 bg-[hsl(220_50%_8%)]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <CourseInfoCard icon={Calendar} title="Duração" value="90 dias" />
            <CourseInfoCard icon={Clock} title="Carga Horária" value="3h por aula" />
            <CourseInfoCard icon={Play} title="Frequência" value="1 aula/semana" />
            <CourseInfoCard icon={Award} title="Certificado" value="Reconhecido" />
          </div>
        </div>
      </section>

      {/* Featured Course - Bacharelado em Teologia */}
      <section className="py-16 bg-gradient-to-b from-[hsl(220_50%_8%)] to-[hsl(220_50%_6%)] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <Badge className="bg-accent/20 text-accent border-accent/30 mb-4 font-semibold">
              <Star className="h-3 w-3 mr-1" />
              CURSO EM DESTAQUE
            </Badge>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white">
              GRADUAÇÃO EM <span className="text-gradient-gold">TEOLOGIA</span>
            </h2>
          </div>

          <Card className="bg-glass-card border-accent/30 overflow-hidden max-w-4xl mx-auto">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left - Image/Info */}
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-success text-white">Nota MEC: 5</Badge>
                    <Badge variant="outline" className="border-accent text-accent">36 meses</Badge>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
                    Bacharelado em Teologia
                  </h3>
                  <p className="text-white/70 mb-6">
                    Formação completa com 2.900 horas, corpo docente de mestres, doutores e pós-doutores. 
                    Grade curricular abrangente incluindo línguas bíblicas, teologia sistemática e práticas pastorais.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-white/10 text-white/80 px-3 py-1 rounded-full">A Distância</span>
                    <span className="text-xs bg-white/10 text-white/80 px-3 py-1 rounded-full">Aulas ao Vivo</span>
                    <span className="text-xs bg-white/10 text-white/80 px-3 py-1 rounded-full">Certificado Nacional</span>
                  </div>
                </div>

                {/* Right - CTA */}
                <div className="p-8 bg-[hsl(220_50%_10%)] flex flex-col justify-center">
                  <p className="text-sm text-white/60 mb-1">A partir de</p>
                  <p className="text-4xl font-display font-black text-accent mb-1">R$ 299<span className="text-lg text-white/60">/mês</span></p>
                  <p className="text-sm text-white/60 mb-6">ou R$ 269 à vista no PIX</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="h-4 w-4 text-accent" />
                      Material didático incluso
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="h-4 w-4 text-accent" />
                      1 aula ao vivo por semana
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="h-4 w-4 text-accent" />
                      Acesso à biblioteca digital
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link to="/courses/bacharelado-teologia" className="block">
                      <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold h-12 btn-shine">
                        VER GRADE CURRICULAR
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/auth" className="block">
                      <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 h-12">
                        MATRICULE-SE AGORA
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Courses Grid - Extensão */}
      <section className="py-16 bg-[hsl(220_50%_6%)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
              CURSOS DE <span className="text-accent">EXTENSÃO</span>
            </h2>
            <p className="text-white/60">Certificação rápida em 90 dias com material didático exclusivo</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coursesData.map((course, index) => (
              <Card 
                key={course.id}
                className={`group bg-glass-card border-white/10 hover:${course.borderColor} overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/10`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-white/5 to-white/0">
                  {/* Book Image with 3D Effect */}
                  <div className="absolute inset-0 flex items-center justify-center p-8 transform group-hover:scale-105 transition-transform duration-500">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-contain drop-shadow-2xl"
                    />
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${course.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  
                  {/* Badge */}
                  <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground font-bold">
                    R$ 400
                  </Badge>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-lg font-display font-bold text-white mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-sm text-white/60 mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Course Details */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-full flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> 90 dias
                    </span>
                    <span className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-full flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 3h/aula
                    </span>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="flex-1 border-white/20 text-white hover:bg-white/10"
                          onClick={() => setSelectedCourse(course)}
                        >
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[hsl(220_50%_8%)] border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-display font-bold text-accent">
                            {course.title}
                          </DialogTitle>
                          <DialogDescription className="text-white/70">
                            Curso pela FAITEL - Faculdade Internacional Teológica de Líderes
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6 mt-4">
                          {/* Course Image */}
                          <div className="aspect-video relative rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center p-8">
                            <img 
                              src={course.image} 
                              alt={course.title}
                              className="max-h-full object-contain drop-shadow-xl"
                            />
                          </div>

                          {/* Description */}
                          <div>
                            <h4 className="font-bold text-white mb-2">Sobre o Curso</h4>
                            <p className="text-white/70 text-sm leading-relaxed">{course.description}</p>
                          </div>

                          {/* Topics */}
                          <div>
                            <h4 className="font-bold text-white mb-3">O que você vai aprender</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {course.topics.map((topic, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                                  <Check className="h-4 w-4 text-accent flex-shrink-0" />
                                  {topic}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Course Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                              <Calendar className="h-6 w-6 text-accent mx-auto mb-2" />
                              <p className="text-xs text-white/60">Duração</p>
                              <p className="font-bold text-white">90 dias</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                              <Clock className="h-6 w-6 text-accent mx-auto mb-2" />
                              <p className="text-xs text-white/60">Carga Horária</p>
                              <p className="font-bold text-white">3h por aula</p>
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="bg-accent/10 border border-accent/30 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-white/70">Investimento</span>
                              <span className="text-3xl font-display font-black text-accent">R$ 400</span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-white/80">
                                <CreditCard className="h-4 w-4 text-accent" />
                                Parcele em 1+3x no cartão de crédito
                              </div>
                              <div className="flex items-center gap-2 text-white/80">
                                <Smartphone className="h-4 w-4 text-accent" />
                                À vista no PIX em nome da FAITEL
                              </div>
                            </div>
                          </div>

                          {/* CTA */}
                          <Link to="/auth">
                            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold h-12 btn-shine">
                              MATRICULAR-SE AGORA
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Link to="/auth" className="flex-1">
                      <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold">
                        Matricular
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Info Section */}
      <section className="py-16 bg-[hsl(220_50%_8%)] border-y border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
              Informações de <span className="text-accent">Envio</span>
            </h2>
            <p className="text-white/60">Material didático enviado para todo o Brasil</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Frete */}
            <div className="bg-glass-card border border-white/10 rounded-xl p-6 text-center hover:border-accent/30 transition-colors">
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Truck className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-bold text-white mb-2">Frete</h3>
              <p className="text-sm text-white/70">
                Calculado pelos <span className="text-accent font-semibold">Correios</span>
              </p>
              <p className="text-xs text-white/50 mt-1">Por conta do comprador</p>
            </div>

            {/* Pagamento */}
            <div className="bg-glass-card border border-white/10 rounded-xl p-6 text-center hover:border-accent/30 transition-colors">
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-bold text-white mb-2">Pagamento</h3>
              <p className="text-sm text-white/70">
                <span className="text-accent font-semibold">PIX</span> e <span className="text-accent font-semibold">Cartão de Crédito</span>
              </p>
              <p className="text-xs text-white/50 mt-1">Parcele em até 4x</p>
            </div>

            {/* Prazo */}
            <div className="bg-glass-card border border-white/10 rounded-xl p-6 text-center hover:border-accent/30 transition-colors">
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Package className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-bold text-white mb-2">Prazo de Envio</h3>
              <p className="text-sm text-white/70">
                Até <span className="text-accent font-semibold">2 dias úteis</span>
              </p>
              <p className="text-xs text-white/50 mt-1">Após confirmação do pagamento</p>
            </div>

            {/* Contato */}
            <div className="bg-glass-card border border-white/10 rounded-xl p-6 text-center hover:border-accent/30 transition-colors group">
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-7 w-7 text-green-500" />
              </div>
              <h3 className="font-bold text-white mb-2">Dúvidas?</h3>
              <a 
                href="https://wa.me/5571959552155" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-green-500 font-semibold hover:text-green-400 transition-colors"
              >
                <Phone className="h-4 w-4" />
                (71) 9595-2155
              </a>
              <p className="text-xs text-white/50 mt-1">WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-accent to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Sparkles className="h-12 w-12 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-4">
            COMECE SUA FORMAÇÃO HOJE
          </h2>
          <p className="text-lg text-white/90 max-w-xl mx-auto mb-8">
            Invista no seu futuro com a FAITEL. Certificação reconhecida e formação de qualidade.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold h-14 px-10">
                <GraduationCap className="mr-2 h-5 w-5" />
                MATRICULE-SE AGORA
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-bold h-14 px-10">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/5571959552155?text=Olá! Gostaria de mais informações sobre os cursos da FAITEL."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}
      >
        <MessageCircle className="h-7 w-7 text-white" />
      </a>

      {/* Footer */}
      <footer className="py-12 bg-[hsl(220_50%_4%)] border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <img src={faitelLogo} alt="FAITEL" className="h-16 w-16 mx-auto mb-4 opacity-80" />
          <p className="text-white/60 text-sm">
            FAITEL - Faculdade Internacional Teológica de Líderes
          </p>
          <p className="text-white/40 text-xs mt-2">
            © {new Date().getFullYear()} Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Courses;
