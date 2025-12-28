import { BadgeCheck, Shield, Globe, Book, Users, FileCheck, Award, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nProvider";

const CertificationsSection = () => {
  const { t } = useI18n();

  const differentials = [
    {
      icon: Star,
      title: t('certifications.diff_quality.title'),
      description: t('certifications.diff_quality.desc')
    },
    {
      icon: Globe,
      title: t('certifications.diff_validity.title'),
      description: t('certifications.diff_validity.desc')
    },
    {
      icon: Book,
      title: t('certifications.diff_curriculum.title'),
      description: t('certifications.diff_curriculum.desc')
    },
    {
      icon: Users,
      title: t('certifications.diff_community.title'),
      description: t('certifications.diff_community.desc')
    },
    {
      icon: FileCheck,
      title: t('certifications.diff_legal.title'),
      description: t('certifications.diff_legal.desc')
    },
    {
      icon: Award,
      title: t('certifications.diff_tradition.title'),
      description: t('certifications.diff_tradition.desc')
    }
  ];

  return (
    <section id="certificacoes" className="py-24 bg-[hsl(220_50%_8%)] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <Badge className="bg-accent/20 text-accent border-accent/30 mb-4 font-semibold">
            <BadgeCheck className="h-3 w-3 mr-1" />
            {t('certifications.credibility_badge')}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4 text-3d-white">
            {t('certifications.title_prefix')} <span className="text-gradient-gold">{t('certifications.title_suffix')}</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {t('certifications.description')}
          </p>
        </div>

        {/* Certificações Principais */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-glass-card border-white/10 overflow-hidden group hover:border-accent/30 transition-colors">
            <CardContent className="p-8 flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">{t('certifications.cec.name')}</h3>
                <p className="text-sm text-primary font-bold mb-3">{t('certifications.cec.full_name')} {t('certifications.cec.org')}</p>
                <p className="text-white/70 leading-relaxed mb-4">
                  {t('certifications.cec.desc')}
                </p>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {t('certifications.cec.type')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-glass-card border-white/10 overflow-hidden group hover:border-accent/30 transition-colors">
            <CardContent className="p-8 flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Award className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">{t('certifications.cemadeb.name')}</h3>
                <p className="text-sm text-accent font-bold mb-3">{t('certifications.cemadeb.full_name')} {t('certifications.cemadeb.org')}</p>
                <p className="text-white/70 leading-relaxed mb-4">
                  {t('certifications.cemadeb.desc')}
                </p>
                <Badge variant="outline" className="border-accent/30 text-accent">
                  {t('certifications.cemadeb.type')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas de Credibilidade */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-display font-black text-white mb-2">65K+</p>
              <p className="text-sm text-white/60 font-medium">{t('certifications.stats.graduated')}</p>
            </div>
            <div>
              <p className="text-4xl font-display font-black text-white mb-2">23</p>
              <p className="text-sm text-white/60 font-medium">{t('certifications.stats.history')}</p>
            </div>
            <div>
              <p className="text-4xl font-display font-black text-white mb-2">100%</p>
              <p className="text-sm text-white/60 font-medium">{t('certifications.stats.certificates')}</p>
            </div>
            <div>
              <p className="text-4xl font-display font-black text-white mb-2">50+</p>
              <p className="text-sm text-white/60 font-medium">{t('certifications.stats.polos')}</p>
            </div>
          </div>
        </div>

        {/* Diferenciais */}
        <div>
          <h3 className="text-2xl font-display font-bold text-white text-center mb-10">
            {t('certifications.differentials_title_prefix')} <span className="text-gradient-gold">{t('certifications.differentials_title_suffix')}</span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {differentials.map((item, index) => (
              <div key={index} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-accent">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-6 py-3 rounded-full">
            <Shield className="h-5 w-5 text-green-500" />
            <span className="text-green-400 font-bold">{t('certifications.trust.title')}</span>
            <span className="w-1 h-1 rounded-full bg-white/20 mx-2" />
            <span className="text-white/60 text-sm">{t('certifications.trust.subtitle')}</span>
          </div>
          <p className="mt-4 text-white/40 text-sm max-w-lg mx-auto">
            {t('certifications.trust.desc')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;