import { Award, Users, Church, BookOpen, Trophy, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import chancellorImg from "@/assets/chancellors/pastor-valdinei-thelma.jpg";
import { useI18n } from "@/i18n/I18nProvider";

const ChancellorsSection = () => {
  const { t } = useI18n();

  return (
    <section className="py-24 bg-[hsl(220_50%_6%)] relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-20" />

      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 font-semibold">
            <Award className="h-3 w-3 mr-1" />
            {t('chancellors.badge')}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4 text-3d-white">
            {t('chancellors.title')}
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {t('chancellors.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Foto do Casal */}
          <div className="relative">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
              <img
                src={chancellorImg}
                alt={t('chancellors.valdinei.img_alt')}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                <p className="text-white font-display font-bold text-xl">
                  {t('chancellors.founders_label')}
                </p>
              </div>
            </div>
            {/* Decorative Glow */}
            <div className="absolute -inset-4 bg-accent/20 rounded-3xl blur-2xl -z-10" />
          </div>

          {/* Informações */}
          <div className="space-y-8">
            {/* Pastor Valdinei */}
            <Card className="bg-glass-card border-white/10">
              <CardContent className="p-6">
                <h3 className="text-2xl font-display font-bold text-white mb-2">
                  {t('chancellors.valdinei.name')}
                </h3>
                <p className="text-accent font-semibold mb-4">{t('chancellors.valdinei.role')}</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 text-white/70">
                    <Church className="h-4 w-4 text-accent flex-shrink-0" />
                    {t('chancellors.valdinei.church')}
                  </li>
                  <li className="flex items-center gap-3 text-white/70">
                    <Users className="h-4 w-4 text-accent flex-shrink-0" />
                    {t('chancellors.valdinei.convention')}
                  </li>
                  <li className="flex items-center gap-3 text-white/70">
                    <BookOpen className="h-4 w-4 text-accent flex-shrink-0" />
                    {t('chancellors.valdinei.publisher')}
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pastora Thelma */}
            <Card className="bg-glass-card border-white/10">
              <CardContent className="p-6">
                <h3 className="text-2xl font-display font-bold text-white mb-2">
                  {t('chancellors.thelma.name')}
                </h3>
                <p className="text-accent font-semibold mb-4">{t('chancellors.thelma.role')}</p>
                <p className="text-white/70 mb-4">
                  {t('chancellors.thelma.desc')}
                </p>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center bg-white/5 border border-white/10 rounded-xl p-4">
                <Trophy className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-display font-bold text-white">25+</p>
                <p className="text-xs text-white/60">{t('chancellors.stats.ministry')}</p>
              </div>
              <div className="text-center bg-white/5 border border-white/10 rounded-xl p-4">
                <Church className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-display font-bold text-white">5.000+</p>
                <p className="text-xs text-white/60">{t('chancellors.stats.churches')}</p>
              </div>
              <div className="text-center bg-white/5 border border-white/10 rounded-xl p-4">
                <Heart className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-display font-bold text-white">100K+</p>
                <p className="text-xs text-white/60">{t('chancellors.stats.lives')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChancellorsSection;