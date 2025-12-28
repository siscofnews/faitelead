import { Coffee, BookOpen, Heart, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import chancellorImg from "@/assets/chancellors/pastor-valdinei-thelma.jpg";
import { useI18n } from "@/i18n/I18nProvider";

const DevotionalSection = () => {
  const { t, lang } = useI18n();
  // Get current date
  const today = new Date();

  // Using Intl.DateTimeFormat for localized date
  // lang is passed from useI18n context which is a string like 'pt', 'en', etc.
  // We map it to a full locale string if needed, or pass it directly if it's a valid locale code.
  // Assuming 'pt' maps to 'pt-BR', 'en' to 'en-US', etc. or relying on browser default if unsure?
  // Ideally, use a map or just pass the lang. 'pt' usually works fine for date formatting.
  const formattedDate = new Intl.DateTimeFormat(lang || 'pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(today);

  return (
    <section className="py-24 bg-gradient-to-b from-[hsl(220_50%_8%)] to-[hsl(220_50%_6%)] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 opacity-10">
        <Coffee className="h-32 w-32 text-accent" strokeWidth={0.5} />
      </div>
      <div className="absolute bottom-20 right-10 opacity-10">
        <BookOpen className="h-28 w-28 text-primary" strokeWidth={0.5} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mb-4 font-semibold">
            <Coffee className="h-3 w-3 mr-1" />
            {t('devotional.badge')}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4 text-3d-white">
            {t('devotional.title')}
          </h2>
          <p className="text-2xl font-display text-gradient-gold">
            {t('devotional.subtitle')}
          </p>
          <p className="text-white/60 mt-4 text-lg">
            {formattedDate}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-glass-card border-white/10 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              {/* Versículo */}
              <div className="relative mb-8">
                <Quote className="absolute -top-2 -left-2 h-12 w-12 text-accent/30" />
                <blockquote className="text-xl md:text-2xl text-white/90 italic text-center leading-relaxed pl-8">
                  "Porque eu sei os pensamentos que tenho a vosso respeito, diz o SENHOR; pensamentos de paz e não de mal, para vos dar o fim que esperais."
                </blockquote>
                <p className="text-accent font-bold text-center mt-4 text-lg">
                  Jeremias 29:11
                </p>
              </div>

              {/* Divider */}
              <div className="w-24 h-1 mx-auto mb-8 bg-gradient-to-r from-transparent via-accent to-transparent" />

              {/* Reflexão */}
              <div className="mb-8">
                <h3 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-accent" />
                  {t('devotional.reflection_title')}
                </h3>
                <p className="text-white/70 leading-relaxed mb-4">
                  {t('devotional.reflection_p1')}
                </p>
                <p className="text-white/70 leading-relaxed mb-4">
                  {t('devotional.reflection_p2')}
                </p>
                <p className="text-accent font-bold text-lg">
                  {t('devotional.blessing')}
                </p>
              </div>

              {/* Assinatura */}
              <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                <img
                  src={chancellorImg}
                  alt="Pastor Valdinei e Pastora Thelma"
                  className="w-16 h-16 rounded-full object-cover border-2 border-accent/50"
                />
                <div>
                  <p className="font-display font-bold text-white text-lg">
                    {t('devotional.signature_name')}
                  </p>
                  <p className="text-white/60 text-sm">
                    {t('devotional.signature_role')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DevotionalSection;
