import { Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nProvider";

const InternationalBoardSection = () => {
  const { t } = useI18n();

  const members = [
    {
      id: "etienne",
      image: "/images/board/etienne.png",
      roleKey: "board.etienne.role",
      nameKey: "board.etienne.name",
      descKey: "board.etienne.desc"
    },
    {
      id: "handerson",
      image: "/images/board/handerson.jpg",
      roleKey: "board.handerson.role",
      nameKey: "board.handerson.name",
      descKey: "board.handerson.desc"
    },
    {
      id: "leonardo",
      image: "/images/board/leonardo.jpg",
      roleKey: "board.leonardo.role",
      nameKey: "board.leonardo.name",
      descKey: "board.leonardo.desc"
    },
    {
      id: "haila",
      image: "/images/board/haila.jpg",
      roleKey: "board.haila.role",
      nameKey: "board.haila.name",
      descKey: "board.haila.desc"
    }
  ];

  return (
    <section className="py-24 bg-[hsl(220_50%_10%)] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-4 font-semibold">
            <Globe className="h-3 w-3 mr-1" />
            {t('board.badge')}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-4 text-3d-white">
            {t('board.title')}
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {t('board.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {members.map((member) => (
            <Card key={member.id} className="bg-glass-card border-white/10 overflow-hidden group hover:border-accent/30 transition-all duration-300 flex flex-col h-full">
              <div className="aspect-[3/4] overflow-hidden relative">
                <img
                  src={member.image}
                  alt={t(member.nameKey)}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

                {/* Overlay Name/Role for visual impact */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-sm font-display font-bold text-white mb-1 leading-tight text-center">
                    {t(member.nameKey)}
                  </h3>
                  <p className="text-[10px] text-accent font-semibold uppercase tracking-wider text-center mb-2">
                    {t(member.roleKey)}
                  </p>
                </div>
              </div>

              <CardContent className="p-4 flex-grow bg-[hsl(220_50%_8%)] border-t border-white/5">
                <p className="text-xs text-white/70 text-center leading-relaxed">
                  {t(member.descKey)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InternationalBoardSection;