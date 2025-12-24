import { Badge } from "@/components/ui/badge";
import { Shield, Award, CheckCircle } from "lucide-react";
import cecLogo from "@/assets/certifications/cec-logo.png";
import cemadebLogo from "@/assets/certifications/cemadeb-logo.png";

const RecognitionBanner = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-[hsl(220_50%_8%)] via-[hsl(220_50%_6%)] to-[hsl(220_50%_4%)] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <Badge className="bg-accent/20 text-accent border-accent/30 mb-4">
            <Shield className="w-3 h-3 mr-1" />
            INSTITUIÇÃO RECONHECIDA
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-white mb-4">
            CURSOS <span className="text-gradient-gold">RECONHECIDOS</span> E <span className="text-gradient-gold">CERTIFICADOS</span>
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            Todos os cursos da FAITE e FAITEL são oficialmente reconhecidos pelo CEC - Conselho de Educação e Cultura da CEMADEB e pela CEMADEB - Convenção Evangélica de Ministro das Assembleias de Deus no Exterior e no Brasil.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* CEC Logo */}
          <div className="flex flex-col items-center group">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
              <img 
                src={cecLogo} 
                alt="CEC - Conselho de Educação e Cultura da CEMADEB" 
                className="w-40 h-40 md:w-48 md:h-48 object-contain relative z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-bold text-white">CEC</h3>
              <p className="text-sm text-white/60">Conselho de Educação e Cultura</p>
              <p className="text-xs text-accent">da CEMADEB</p>
            </div>
          </div>

          {/* Connection */}
          <div className="flex flex-col items-center gap-3">
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-accent to-accent" />
              <CheckCircle className="w-8 h-8 text-accent animate-pulse" />
              <div className="w-16 h-0.5 bg-gradient-to-l from-transparent via-accent to-accent" />
            </div>
            <div className="lg:hidden flex items-center gap-2">
              <div className="h-16 w-0.5 bg-gradient-to-b from-transparent via-accent to-accent" />
            </div>
            <Badge className="bg-success/20 text-success border-success/30 text-xs">
              <Award className="w-3 h-3 mr-1" />
              CERTIFICAÇÃO OFICIAL
            </Badge>
          </div>

          {/* CEMADEB Logo */}
          <div className="flex flex-col items-center group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
              <img 
                src={cemadebLogo} 
                alt="CEMADEB - Convenção Evangélica de Ministro das Assembleias de Deus" 
                className="w-40 h-40 md:w-48 md:h-48 object-contain relative z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-bold text-white">CEMADEB</h3>
              <p className="text-sm text-white/60 max-w-[200px]">Convenção Evangélica de Ministro das Assembleias de Deus</p>
              <p className="text-xs text-accent">No Exterior e no Brasil</p>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-white/80 text-sm">
              Certificados válidos e reconhecidos em todo território nacional e internacional
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecognitionBanner;
