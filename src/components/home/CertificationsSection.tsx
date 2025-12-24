import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, Award, CheckCircle, GraduationCap, Globe, 
  BookOpen, Users, FileCheck, BadgeCheck, Star
} from "lucide-react";
import cecLogo from "@/assets/certifications/cec-logo.png";
import cemadebLogo from "@/assets/certifications/cemadeb-logo.png";

const certifications = [
  {
    logo: cecLogo,
    name: "CEC",
    fullName: "Conselho de Educação e Cultura",
    organization: "da CEMADEB",
    description: "Órgão responsável pela avaliação e certificação dos cursos teológicos em conformidade com os padrões educacionais evangélicos.",
    type: "Certificação Educacional"
  },
  {
    logo: cemadebLogo,
    name: "CEMADEB",
    fullName: "Convenção Evangélica de Ministro das Assembleias de Deus",
    organization: "No Exterior e no Brasil",
    description: "Convenção que congrega ministros e igrejas das Assembleias de Deus, garantindo legitimidade e reconhecimento ministerial.",
    type: "Reconhecimento Ministerial"
  }
];

const additionalSeals = [
  {
    icon: GraduationCap,
    title: "Ensino de Qualidade",
    description: "Corpo docente qualificado com mestres e doutores",
    color: "from-primary to-primary/70"
  },
  {
    icon: Globe,
    title: "Validade Internacional",
    description: "Certificados reconhecidos em diversos países",
    color: "from-accent to-accent/70"
  },
  {
    icon: BookOpen,
    title: "Grade Curricular Completa",
    description: "Currículo atualizado e fundamentado nas Escrituras",
    color: "from-success to-success/70"
  },
  {
    icon: Users,
    title: "Comunidade de Aprendizado",
    description: "Rede de milhares de alunos e ex-alunos",
    color: "from-primary to-accent"
  },
  {
    icon: FileCheck,
    title: "Documentação Legal",
    description: "Instituição registrada e em conformidade legal",
    color: "from-accent to-primary"
  },
  {
    icon: BadgeCheck,
    title: "23 Anos de Tradição",
    description: "Mais de duas décadas formando líderes para o Reino",
    color: "from-success to-accent"
  }
];

const CertificationsSection = () => {
  return (
    <section id="certificacoes" className="py-24 bg-gradient-to-b from-[hsl(220_50%_4%)] via-[hsl(220_50%_6%)] to-[hsl(220_50%_8%)] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[200px]" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[200px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-accent/20 text-accent border-accent/30 mb-4">
            <Shield className="w-3 h-3 mr-1" />
            CREDIBILIDADE E EXCELÊNCIA
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-4 text-3d-white">
            SELOS E <span className="text-gradient-gold">CERTIFICAÇÕES</span>
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            A FAITEL é uma instituição comprometida com a excelência no ensino teológico, 
            reconhecida por importantes órgãos educacionais e ministeriais.
          </p>
        </div>

        {/* Main Certifications */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {certifications.map((cert, index) => (
            <Card 
              key={index} 
              className="bg-glass-card border-white/10 overflow-hidden group hover:border-accent/30 transition-all duration-500"
            >
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  {/* Logo */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
                    <img 
                      src={cert.logo} 
                      alt={cert.name}
                      className="w-32 h-32 lg:w-40 lg:h-40 object-contain relative z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="text-center lg:text-left flex-1">
                    <Badge className="bg-primary/20 text-primary border-primary/30 mb-3 text-xs">
                      {cert.type}
                    </Badge>
                    <h3 className="text-2xl font-display font-bold text-white mb-1">
                      {cert.name}
                    </h3>
                    <p className="text-accent font-medium mb-1">{cert.fullName}</p>
                    <p className="text-xs text-white/50 mb-3">{cert.organization}</p>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {cert.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certification Seal */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 backdrop-blur-sm border border-accent/30 rounded-full px-8 py-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-success" />
              <span className="text-white font-bold">100% dos Cursos</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <span className="text-white/70">Reconhecidos pelo CEC e CEMADEB</span>
          </div>
        </div>

        {/* Additional Quality Seals */}
        <div className="mb-12">
          <h3 className="text-2xl font-display font-bold text-white text-center mb-8">
            Nossos <span className="text-gradient-gold">Diferenciais de Qualidade</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {additionalSeals.map((seal, index) => (
              <div 
                key={index}
                className="group text-center p-6 rounded-2xl bg-glass-card border border-white/10 hover:border-accent/30 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 mb-4 rounded-xl bg-gradient-to-br ${seal.color} group-hover:scale-110 transition-transform duration-300`}>
                  <seal.icon className="h-7 w-7 text-white" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{seal.title}</h4>
                <p className="text-xs text-white/60 leading-relaxed">{seal.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "5.000+", label: "Alunos Formados", icon: GraduationCap },
            { value: "23", label: "Anos de História", icon: Award },
            { value: "100%", label: "Certificados Válidos", icon: FileCheck },
            { value: "50+", label: "Polos de Apoio", icon: Globe }
          ].map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <stat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
              <p className="text-3xl md:text-4xl font-display font-black text-white mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-accent" fill="currentColor" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold">Instituição de Confiança</p>
                <p className="text-sm text-white/60">Escolhida por milhares de líderes</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/20" />
            <p className="text-white/70 text-sm max-w-md">
              Faça parte de uma comunidade de excelência em formação teológica com reconhecimento nacional e internacional.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
