import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Clock, Calendar, BookOpen, Users, ArrowRight, Check,
  CreditCard, GraduationCap, Award, Play, Download,
  Menu, ChevronDown, Star, Sparkles, MessageCircle, Phone,
  Target, Briefcase, FileText, Building, Globe, Video,
  ChevronRight, ArrowLeft, Shield, Trophy, Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";
import faitelLogo from "@/assets/faitel-logo.png";

// Curriculum Data - Bacharelado em Teologia
const getCurriculumData = (t: any) => ({
  totalHours: 2900,
  duration: t("courses.curriculum.duration_value", { defaultValue: "36 meses" }),
  mec_rating: 5,
  modality: t("modalities.ead_title"),
  modules: [
    {
      name: t("courses.curriculum.modules.leveling"),
      subjects: [
        { name: "Formação Inicial em Educação a Distância", professor: "Dr. Paulo Mendes", title: "Doutorado", hours: 15 },
        { name: "Metodologia do Estudo Teológico", professor: "Me. Ana Costa", title: "Mestrado", hours: 15 },
      ]
    },
    {
      name: t("courses.curriculum.modules.foundations"),
      subjects: [
        { name: "Introdução à Teologia", professor: "Dr. Carlos Silva", title: "Doutorado", hours: 45 },
        { name: "Formação Cidadã Contemporânea", professor: "Dr. Roberto Lima", title: "Doutorado", hours: 45 },
        { name: "Produção Textual Acadêmica", professor: "Me. Juliana Santos", title: "Mestrado", hours: 45 },
      ]
    },
    {
      name: t("courses.curriculum.modules.ot"),
      subjects: [
        { name: "História de Israel", professor: "Dr. Marcos Oliveira", title: "Pós-Doutorado", hours: 45 },
        { name: "Pentateuco", professor: "Me. Rafael Souza", title: "Mestrado", hours: 45 },
        { name: "Livros Históricos", professor: "Dr. Marcos Oliveira", title: "Pós-Doutorado", hours: 45 },
        { name: "Livros Poéticos e Proféticos", professor: "Dra. Sandra Ribeiro", title: "Doutorado", hours: 45 },
        { name: "Teologia do Antigo Testamento", professor: "Dra. Sandra Ribeiro", title: "Doutorado", hours: 45 },
      ]
    },
    {
      name: t("courses.curriculum.modules.nt"),
      subjects: [
        { name: "Evangelhos e Atos dos Apóstolos", professor: "Me. Márcio Pelinski", title: "Mestrado", hours: 45 },
        { name: "Cartas Paulinas e Gerais", professor: "Me. Rodrigo Rangel", title: "Mestrado", hours: 45 },
        { name: "Teologia do Novo Testamento", professor: "Me. Athos Aires", title: "Mestrado", hours: 45 },
        { name: "Escatologia e Apocalipse", professor: "Dra. Sandra Ribeiro", title: "Doutorado", hours: 45 },
      ]
    },
    {
      name: t("courses.curriculum.modules.languages"),
      subjects: [
        { name: "Hebraico Instrumental", professor: "Me. Rodrigo Rangel", title: "Mestrado", hours: 45 },
        { name: "Grego Instrumental", professor: "Me. Rodrigo Rangel", title: "Mestrado", hours: 45 },
      ]
    },
    {
      name: t("courses.curriculum.modules.hermeneutics"),
      subjects: [
        { name: "Hermenêutica Bíblica", professor: "Me. Rodrigo Rangel", title: "Mestrado", hours: 45 },
        { name: "Exegese Bíblica", professor: "Dra. Sandra Ribeiro", title: "Doutorado", hours: 45 },
        { name: "Arqueologia e Geografia Bíblica", professor: "Dr. Marcos Oliveira", title: "Pós-Doutorado", hours: 45 },
      ]
    },
    {
      name: t("courses.curriculum.modules.systematic"),
      subjects: [
        { name: "Teologia Sistemática I (Prolegômenos, Teontologia, Cristologia)", professor: "Dra. Sandra Ribeiro", title: "Doutorado", hours: 45 },
        { name: "Teologia Sistemática II (Pneumatologia, Antropologia, Soteriologia)", professor: "Dr. Adriano Lima", title: "Doutorado", hours: 45 },
        { name: "Eclesiologia", professor: "Me. Athos Aires", title: "Mestrado", hours: 45 },
      ]
    },
    {
      name: t("courses.curriculum.modules.history"),
      subjects: [
        { name: "História da Igreja Antiga e Medieval", professor: "Dra. Daiane Batista", title: "Mestrado", hours: 45 },
        { name: "História da Igreja Moderna e Contemporânea", professor: "Dra. Daiane Batista", title: "Mestrado", hours: 45 },
        { name: "História do Cristianismo no Brasil", professor: "Dr. Cícero Bezerra", title: "Pós-Doutorado", hours: 45 },
      ]
    },
    {
      name: t("courses.curriculum.modules.practical"),
      subjects: [
        { name: "Homilética (Pregação)", professor: "Me. Athos Aires", title: "Mestrado", hours: 45 },
        { name: "Evangelização e Missões", professor: "Dr. Adriano Lima", title: "Doutorado", hours: 45 },
        { name: "Liderança Cristã", professor: "Dra. Sandra Ribeiro", title: "Doutorado", hours: 45 },
        { name: "Educação Cristã", professor: "Dra. Daiane Batista", title: "Mestrado", hours: 45 },
        { name: "Aconselhamento Pastoral", professor: "Dr. Adriano Lima", title: "Doutorado", hours: 45 },
      ]
    }
  ]
});

// Differentials
const getDifferentials = (t: any) => [
  { icon: Trophy, title: t("courses.differentials.mec_rating", { defaultValue: "Nota Máxima MEC" }), description: t("courses.differentials.mec_desc", { defaultValue: "Curso reconhecido com conceito 5 pelo MEC" }) },
  { icon: GraduationCap, title: t("courses.differentials.faculty", { defaultValue: "Corpo Docente" }), description: t("courses.differentials.faculty_desc", { defaultValue: "Mestres, Doutores e Pós-Doutores" }) },
  { icon: Globe, title: t("courses.differentials.flexibility", { defaultValue: "Estude de Qualquer Lugar" }), description: t("courses.differentials.flexibility_desc", { defaultValue: "100% online com aulas ao vivo semanais" }) },
  { icon: Lightbulb, title: t("courses.differentials.research", { defaultValue: "Grupos de Pesquisa" }), description: t("courses.differentials.research_desc", { defaultValue: "Participe de projetos de pesquisa acadêmica" }) },
  { icon: Video, title: t("modalities.live_class"), description: t("courses.differentials.live_desc", { defaultValue: "1 aula ao vivo por semana com os professores" }) },
  { icon: Shield, title: t("about.certification"), description: t("courses.differentials.cert_desc", { defaultValue: "Diploma reconhecido em todo território nacional" }) },
];

// Career opportunities
const getCareerOpportunities = (t: any) => t("courses.opportunities.list", { returnObjects: true }) || [
  "Pastorado e liderança em igrejas e comunidades",
  "Capelania hospitalar, militar, esportiva e empresarial",
  "Missões nacionais e internacionais",
  "Educação cristã e docência em seminários",
  "Assessoria e gestão de instituições religiosas",
  "Aconselhamento pastoral e familiar",
  "Produção de conteúdo teológico",
  "Pesquisa acadêmica e docência no ensino superior",
];

// Student profile
const getStudentProfile = (t: any) => t("courses.profile_list", { returnObjects: true }) || [
  "Líderes e pastores que desejam aprofundar conhecimentos teológicos",
  "Pessoas com vocação para o ministério cristão",
  "Profissionais que atuam em capelania e aconselhamento",
  "Interessados em compreender melhor as Escrituras",
  "Missionários e evangelistas em formação",
  "Professores de escola dominical e educação cristã",
];

const CourseDetails = () => {
  const { t } = useI18n();
  const curriculumData = getCurriculumData(t);
  const differentials = getDifferentials(t);
  const careerOpportunities = getCareerOpportunities(t);
  const studentProfile = getStudentProfile(t);
  const { courseId } = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      if (courseId) {
        const { data } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (data) {
          setCourse(data);
        }
      }
      setLoading(false);
    };

    loadCourse();
  }, [courseId]);

  const totalCurriculumHours = curriculumData.modules.reduce(
    (acc, mod) => acc + mod.subjects.reduce((subAcc, sub) => subAcc + sub.hours, 0), 0
  );

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
              <Link to="/" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">{t("common.home")}</Link>
              <Link to="/courses" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">{t("nav.courses")}</Link>
              <Link to="/auth" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">{t("nav.student_portal")}</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link to="/auth" className="hidden md:block">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold btn-shine px-6">
                  {t("courses.details_page.enroll_now_caps")}
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
                    <Link to="/" className="text-lg font-medium py-3 border-b border-white/10">{t("common.home")}</Link>
                    <Link to="/courses" className="text-lg font-medium py-3 border-b border-white/10">{t("nav.courses")}</Link>
                    <Link to="/auth" className="text-lg font-medium py-3">{t("nav.student_portal")}</Link>
                    <Link to="/auth" className="mt-4">
                      <Button className="w-full bg-accent text-accent-foreground font-bold">{t("courses.details_page.enroll_now_caps")}</Button>
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="pt-24 pb-4 bg-[hsl(220_50%_8%)]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Link to="/" className="hover:text-accent transition-colors">{t("common.home")}</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/courses" className="hover:text-accent transition-colors">{t("courses.details_page.courses_breadcrumb")}</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-accent">{t("footer.courses_list.bachelor")}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-[hsl(220_50%_10%)] to-[hsl(220_50%_6%)] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <Badge className="bg-accent/20 text-accent border-accent/30 mb-4 font-semibold">
                {t("courses.details_page.graduation_badge", { defaultValue: "GRADUAÇÃO" })}
              </Badge>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-white mb-4 text-3d-white">
                {t("footer.courses_list.bachelor").toUpperCase()}
              </h1>

              <p className="text-xl text-accent font-semibold mb-6">
                {t("courses.details_page.theology_subtitle", { defaultValue: "Formação Teológica Completa e Interconfessional" })}
              </p>

              {/* Course Badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                <Badge variant="outline" className="border-white/30 text-white px-4 py-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  {curriculumData.duration}
                </Badge>
                <Badge variant="outline" className="border-white/30 text-white px-4 py-2">
                  <Globe className="h-4 w-4 mr-2" />
                  {curriculumData.modality}
                </Badge>
                <Badge variant="outline" className="border-white/30 text-white px-4 py-2">
                  <Clock className="h-4 w-4 mr-2" />
                  {curriculumData.totalHours} {t("courses.hours")}
                </Badge>
                <Badge className="bg-success text-white px-4 py-2">
                  <Star className="h-4 w-4 mr-2" />
                  {t("courses.curriculum.mec_rating")}: {curriculumData.mec_rating}
                </Badge>
              </div>

              <p className="text-white/70 text-lg leading-relaxed mb-6">
                O <strong className="text-white">Bacharelado em Teologia</strong> da FAITEL oferece uma formação
                sólida e abrangente, preparando você para atuar em diversas atividades ministeriais e religiosas.
                Com um corpo docente composto por mestres, doutores e pós-doutores, você terá acesso a um ensino
                de excelência reconhecido pelo MEC com nota máxima.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/auth">
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold btn-shine glow-gold">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    {t("courses.details_page.enroll_now_caps")}
                  </Button>
                </Link>
                <a href="#grade">
                  <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold border-none">
                    <BookOpen className="mr-2 h-5 w-5" />
                    {t("courses.details_page.view_curriculum")}
                  </Button>
                </a>
              </div>
            </div>

            {/* CTA Card */}
            <Card className="bg-glass-card border-accent/30">
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <p className="text-sm text-white/60 mb-2">{t("courses.starting_from", { defaultValue: "Investimento mensal a partir de" })}</p>
                  <p className="text-4xl font-display font-black text-accent">R$ 299</p>
                  <p className="text-sm text-white/60">{t("courses.pix_discount", { defaultValue: "ou R$ 269 à vista no PIX" })}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-accent" />
                    {t("courses.details_page.material_included")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-accent" />
                    {t("courses.details_page.live_classes")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-accent" />
                    {t("courses.details_page.recognized_cert")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-accent" />
                    {t("courses.details_page.digital_library")}
                  </div>
                </div>

                <Link to="/auth" className="block">
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold h-12">
                    {t("courses.details_page.enroll_button_caps")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <a
                  href={`https://wa.me/5571959552155?text=${encodeURIComponent(t("cta.whatsapp_message"))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full border-success text-success hover:bg-success/10">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {t("courses.details_page.speak_consultant")}
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Differentials */}
      <section className="py-12 bg-[hsl(220_50%_8%)]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-display font-bold text-white mb-8 text-center uppercase">
            {t("courses.details_page.differentials_title", { defaultValue: "DIFERENCIAIS DO CURSO" })}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {differentials.map((diff, index) => (
              <Card key={index} className="bg-white/5 border-white/10 hover:border-accent/30 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-3">
                    <diff.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{diff.title}</h3>
                  <p className="text-xs text-white/60">{diff.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-16 bg-[hsl(220_50%_6%)]">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="about" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-white/5 p-1 rounded-xl">
              <TabsTrigger value="about" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                {t("courses.about_label")}
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                {t("courses.details_page.student_profile")}
              </TabsTrigger>
              <TabsTrigger value="curriculum" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                {t("courses.details_page.curriculum_label")}
              </TabsTrigger>
              <TabsTrigger value="career" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                {t("courses.details_page.career_label")}
              </TabsTrigger>
              <TabsTrigger value="research" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                {t("courses.details_page.research_label")}
              </TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-8">
              <Card className="bg-glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">{t("courses.details_page.about_teology", { defaultValue: "Sobre o Bacharelado em Teologia" })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-white/80">
                  <p>
                    {t("courses.details_page.about_teology_p1", { defaultValue: "O curso de Teologia da FAITEL estuda o campo teórico investigativo da teologia, do ensino, da aprendizagem e do trabalho comunitário presentes na prática profissional do teólogo." })}
                  </p>
                  <p>
                    {t("courses.details_page.about_teology_p2", { defaultValue: "Nossa formação capacita você a exercer funções de liderança e gestão nas comunidades, mobilizar pessoas em torno de projetos humanitários, além de produzir e difundir conhecimento em contextos religiosos." })}
                  </p>

                  <h3 className="text-xl font-bold text-white mt-8">{t("courses.learning_label")}</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {(t("courses.details_page.learning_teology_items", { returnObjects: true }) || [
                      "Teologia Bíblica do Antigo e Novo Testamento",
                      "Línguas bíblicas (Hebraico e Grego)",
                      "Hermenêutica e Exegese Bíblica",
                      "Teologia Sistemática completa",
                      "História da Igreja",
                      "Homilética e Comunicação",
                      "Liderança e Gestão Eclesiástica",
                      "Aconselhamento Pastoral",
                      "Missões e Evangelização",
                      "Ética Cristã e Teologia Pública"
                    ]).map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-accent flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold text-white mt-8">{t("courses.details_page.methodology_label", { defaultValue: "Metodologia" })}</h3>
                  <p>
                    {t("courses.details_page.methodology_desc", { defaultValue: "O curso possui modalidade EAD com uma aula ao vivo semanal, permitindo que você estude com flexibilidade enquanto mantém interação direta com professores e colegas. Também realizamos estágio supervisionado em práticas pastorais para aliar teoria e prática." })}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="bg-glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-2xl text-white flex items-center gap-3">
                    <Users className="h-6 w-6 text-accent" />
                    {t("courses.details_page.student_profile")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-white/80">
                    {t("courses.details_page.student_profile_desc", { defaultValue: "O Bacharelado em Teologia é destinado a pessoas com perfil de liderança em atividades pastorais, evangelísticas, missionárias e comunitárias." })}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {studentProfile.map((profile, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                        <Users className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-white/80">{profile}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Curriculum Tab */}
            <TabsContent value="curriculum" id="grade">
              <Card className="bg-glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <CardTitle className="text-2xl text-white flex items-center gap-3">
                      <BookOpen className="h-6 w-6 text-accent" />
                      {t("courses.details_page.curriculum_label")}
                    </CardTitle>
                    <Badge className="bg-accent/20 text-accent border-accent/30">
                      Total: {totalCurriculumHours} {t("courses.hours")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-2">
                    {curriculumData.modules.map((module, index) => (
                      <AccordionItem
                        key={index}
                        value={`module-${index}`}
                        className="border border-white/10 rounded-xl overflow-hidden bg-white/5"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:bg-white/5 hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <span className="font-bold text-white">{module.name}</span>
                              <p className="text-xs text-white/60">
                                {module.subjects.length} {t("courses.details_page.subjects_label", { defaultValue: "disciplinas" })} • {module.subjects.reduce((acc, s) => acc + s.hours, 0)}h
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-white/10">
                                  <th className="text-left py-2 text-white/60 font-medium">{t("courses.details_page.subject_column", { defaultValue: "Disciplina" })}</th>
                                  <th className="text-left py-2 text-white/60 font-medium hidden md:table-cell">{t("courses.details_page.professor_column", { defaultValue: "Professor" })}</th>
                                  <th className="text-left py-2 text-white/60 font-medium hidden md:table-cell">{t("courses.details_page.title_column", { defaultValue: "Titulação" })}</th>
                                  <th className="text-right py-2 text-white/60 font-medium">{t("courses.details_page.hours_column", { defaultValue: "Carga Horária" })}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {module.subjects.map((subject, subIndex) => (
                                  <tr key={subIndex} className="border-b border-white/5 last:border-0">
                                    <td className="py-3 text-white">{subject.name}</td>
                                    <td className="py-3 text-white/70 hidden md:table-cell">{subject.professor}</td>
                                    <td className="py-3 hidden md:table-cell">
                                      <Badge variant="outline" className="border-white/20 text-white/70 text-xs">
                                        {subject.title}
                                      </Badge>
                                    </td>
                                    <td className="py-3 text-right text-accent font-medium">{subject.hours}h</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Career Tab */}
            <TabsContent value="career">
              <Card className="bg-glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-2xl text-white flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-accent" />
                    {t("courses.details_page.career_label")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-white/80">
                    {t("courses.details_page.career_desc", { defaultValue: "Os formados em Teologia pela FAITEL têm oportunidades de trabalhar em diversos contextos. Para aqueles que desejam avançar na carreira acadêmica, há também a possibilidade de atuação na docência e pesquisa no ensino superior." })}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {careerOpportunities.map((opportunity, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                        <Briefcase className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-white/80">{opportunity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Research Tab */}
            <TabsContent value="research">
              <Card className="bg-glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-2xl text-white flex items-center gap-3">
                    <Lightbulb className="h-6 w-6 text-accent" />
                    Linha de Pesquisa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-2">{t("courses.details_page.research_group_label", { defaultValue: "Grupo de Pesquisa" })}</h3>
                    <p className="text-white/80 mb-4">
                      "{t("courses.details_page.research_group_name", { defaultValue: "EDUCAÇÃO TEOLÓGICA: CENÁRIOS DE DOCÊNCIA, CURRÍCULO E APRENDIZAGEM" })}"
                    </p>

                    <h4 className="font-bold text-accent mb-2">{t("courses.details_page.research_line_label", { defaultValue: "Linha de Pesquisa:" })}</h4>
                    <p className="text-white/80 mb-4">{t("courses.details_page.research_line_name", { defaultValue: "Teologia e Sociedade" })}</p>

                    <h4 className="font-bold text-accent mb-2">{t("courses.details_page.research_project_label", { defaultValue: "Projeto de Pesquisa:" })}</h4>
                    <p className="text-white/80 mb-4">
                      {t("courses.details_page.research_project_name", { defaultValue: "Teologia, Filosofia e Ciências da Religião: Diálogos Orgânicos" })}
                    </p>

                    <p className="text-white/70 text-sm">
                      {t("courses.details_page.research_project_desc", { defaultValue: "O projeto tem como foco estudar os inúmeros desafios da sociedade, que tangem aos contextos sociais, religiosos, teológicos, filosóficos, entre outros, buscando a formação de cidadãos éticos e atuantes em suas comunidades." })}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-primary/10 border-primary/20">
                      <CardContent className="p-4 text-center">
                        <h4 className="font-bold text-white mb-2">{t("courses.details_page.axis_1", { defaultValue: "Eixo 1" })}</h4>
                        <p className="text-sm text-white/70">{t("courses.details_page.axis_1_desc", { defaultValue: "Teologia Sistemática e História" })}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-accent/10 border-accent/20">
                      <CardContent className="p-4 text-center">
                        <h4 className="font-bold text-white mb-2">{t("courses.details_page.axis_2", { defaultValue: "Eixo 2" })}</h4>
                        <p className="text-sm text-white/70">{t("courses.details_page.axis_2_desc", { defaultValue: "Teologia Bíblica e Missiologia" })}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-success/10 border-success/20">
                      <CardContent className="p-4 text-center">
                        <h4 className="font-bold text-white mb-2">{t("courses.details_page.axis_3", { defaultValue: "Eixo 3" })}</h4>
                        <p className="text-sm text-white/70">{t("courses.details_page.axis_3_desc", { defaultValue: "Teologia Prática e Movimentos Religiosos" })}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-b from-[hsl(220_50%_8%)] to-[hsl(220_50%_6%)]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            {t("cta.ready_to_transform", { defaultValue: "Pronto para transformar sua vida?" })}
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            {t("cta.join_thousands", { defaultValue: "Junte-se a milhares de alunos que já transformaram suas vidas através da formação teológica da FAITEL." })}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold btn-shine glow-gold px-8">
                {t("courses.details_page.enroll_now_caps")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a
              href={`https://wa.me/5571959552155?text=${encodeURIComponent(t("cta.whatsapp_message"))}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="border-success text-success hover:bg-success/10 px-8">
                <MessageCircle className="mr-2 h-5 w-5" />
                {t("cta.whatsapp").toUpperCase()}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* WhatsApp Float Button */}
      <a
        href={`https://wa.me/5571959552155?text=${encodeURIComponent(t("cta.whatsapp_message"))}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-success rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform glow-gold"
      >
        <MessageCircle className="h-7 w-7 text-white" />
      </a>

      {/* Footer */}
      <footer className="py-8 bg-[hsl(220_50%_4%)] border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-white/60 text-sm">
          <p>© 2024 FAITEL - {t("footer.rights")}</p>
        </div>
      </footer>
    </div>
  );
};

export default CourseDetails;
