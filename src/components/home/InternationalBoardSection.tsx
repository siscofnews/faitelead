import { Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nProvider";

const InternationalBoardSection = () => {
  const { t } = useI18n();

  const members = [
    {
      id: "etienne",
      image: "/images/board/etienne_new.jpg",
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
      image: "/images/board/haila.png",
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

        {/* President Section - Highlighted & Horizontal */}
        <div className="flex justify-center mb-16 relative z-20">
          {(() => {
            const president = members[0]; // Etienne
            return (
              <div className="w-full max-w-4xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-accent via-primary to-accent rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                <Card className="relative bg-glass-card border-accent/30 overflow-hidden shadow-2xl hover:shadow-[0_0_40px_rgba(var(--accent-rgb),0.3)] transition-all duration-500 transform hover:-translate-y-1 flex flex-col md:flex-row">
                  {/* Photo Section - Left */}
                  <div className="md:w-2/5 aspect-[3/4] md:aspect-auto relative overflow-hidden">
                    <img
                      src={president.image}
                      alt={t(president.nameKey)}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-transparent to-transparent opacity-60" />
                  </div>

                  {/* Content Section - Right */}
                  <div className="md:w-3/5 p-8 flex flex-col justify-center bg-[hsl(220_50%_8%)] border-t md:border-t-0 md:border-l border-accent/20">
                    <div className="mb-4">
                      <p className="text-sm font-bold bg-gradient-to-r from-accent to-white bg-clip-text text-transparent uppercase tracking-widest mb-2">
                        {t(president.roleKey)}
                      </p>
                      <h3 className="text-2xl md:text-3xl font-display font-black text-white leading-tight drop-shadow-lg">
                        {t(president.nameKey)}
                      </h3>
                    </div>

                    <div className="h-1 w-20 bg-accent/50 rounded-full mb-6" />

                    <p className="text-base text-white/80 leading-relaxed font-medium">
                      {t(president.descKey)}
                    </p>
                  </div>
                </Card>
              </div>
            );
          })()}
        </div>

        {/* Other Members Grid - Horizontal Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {members.slice(1).map((member) => (
            <Card key={member.id} className="bg-glass-card border-white/10 overflow-hidden group hover:border-accent/30 transition-all duration-300 flex flex-col sm:flex-row h-full hover:shadow-xl hover:-translate-y-1">
              {/* Photo - Left */}
              <div className="sm:w-1/3 aspect-[3/4] sm:aspect-auto relative overflow-hidden shrink-0">
                <img
                  src={member.image}
                  alt={t(member.nameKey)}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  style={{ objectPosition: member.id === 'handerson' ? 'center 20%' : 'top' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent opacity-50" />
              </div>

              {/* Content - Right */}
              <CardContent className="p-6 flex flex-col justify-center sm:w-2/3 bg-[hsl(220_50%_8%)] border-t sm:border-t-0 sm:border-l border-white/5">
                <div className="mb-3">
                  <p className="text-[10px] text-accent font-semibold uppercase tracking-wider mb-1">
                    {t(member.roleKey)}
                  </p>
                  <h3 className="text-lg font-display font-bold text-white leading-tight">
                    {t(member.nameKey)}
                  </h3>
                </div>

                <p className="text-xs text-white/70 leading-relaxed">
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