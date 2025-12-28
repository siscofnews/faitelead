import { Award, Shield, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/I18nProvider";

const RecognitionBanner = () => {
  const { t } = useI18n();

  return (
    <div className="bg-gradient-to-r from-[hsl(220_50%_8%)] to-[hsl(220_50%_10%)] border-y border-white/10 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="lg:w-1/2">
            <Badge className="bg-accent/20 text-accent border-accent/30 mb-6 font-semibold">
              <Shield className="h-3 w-3 mr-1" />
              {t('recognition.badge')}
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-6 leading-tight">
              {t('recognition.title_prefix')} <span className="text-gradient-gold">{t('recognition.title_suffix1')}</span> {t('recognition.title_separator')} <span className="text-gradient-gold">{t('recognition.title_suffix2')}</span>
            </h2>
            
            <p className="text-lg text-white/70 mb-8 leading-relaxed">
              {t('recognition.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-start gap-4 bg-white/5 border border-white/10 p-4 rounded-xl">
                <div className="bg-accent/20 p-2 rounded-lg">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">{t('recognition.cec.name')}</h4>
                  <p className="text-xs text-white/60">{t('recognition.cec.desc')}</p>
                  <p className="text-xs text-accent mt-1">{t('recognition.cec.sub')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white/5 border border-white/10 p-4 rounded-xl">
                <div className="bg-accent/20 p-2 rounded-lg">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">{t('recognition.cemadeb.name')}</h4>
                  <p className="text-xs text-white/60">{t('recognition.cemadeb.desc')}</p>
                  <p className="text-xs text-accent mt-1">{t('recognition.cemadeb.sub')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Visual Representation */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative">
              {/* Central Seal */}
              <div className="w-64 h-64 rounded-full border-4 border-accent/30 flex items-center justify-center bg-gradient-to-br from-[hsl(220_50%_10%)] to-[hsl(220_50%_6%)] relative z-10 animate-pulse-slow">
                <div className="text-center p-6">
                  <Award className="h-16 w-16 text-accent mx-auto mb-4" />
                  <p className="font-display font-black text-xl text-white mb-2">{t('recognition.official_cert')}</p>
                  <div className="flex justify-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Orbiting Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/10 rounded-full animate-spin-slow" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-dashed border-white/10 rounded-full animate-spin-slow-reverse" />
              
              {/* Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent/5 blur-3xl -z-10" />
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center border-t border-white/10 pt-8">
          <p className="text-white/50 text-sm flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            {t('recognition.bottom_text')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecognitionBanner;