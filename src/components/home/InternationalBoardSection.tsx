import { Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nProvider";

import etienneImg from "@/assets/board/etienne.jpg";
import handersonImg from "@/assets/board/handerson.jpg";
import leonardoImg from "@/assets/board/leonardo.jpg";
import hailaImg from "@/assets/board/haila.jpg";

const InternationalBoardSection = () => {
  const { t } = useI18n();

  const members = [
    {
      id: "etienne",
      image: etienneImg,
      roleKey: "board.etienne.role",
      nameKey: "board.etienne.name"
    },
    {
      id: "handerson",
      image: handersonImg,
      roleKey: "board.handerson.role",
      nameKey: "board.handerson.name"
    },
    {
      id: "leonardo",
      image: leonardoImg,
      roleKey: "board.leonardo.role",
      nameKey: "board.leonardo.name"
    },
    {
      id: "haila",
      image: hailaImg,
      roleKey: "board.haila.role",
      nameKey: "board.haila.name"
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {members.map((member) => (
            <Card key={member.id} className="bg-glass-card border-white/10 overflow-hidden group hover:border-accent/30 transition-all duration-300">
              <div className="aspect-[3/4] overflow-hidden relative">
                <img 
                  src={member.image} 
                  alt={t(member.nameKey)}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              </div>
              <CardContent className="p-6 relative -mt-24">
                <div className="bg-[hsl(220_50%_12%)]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl text-center transform transition-transform duration-300 group-hover:-translate-y-2 shadow-xl">
                  <h3 className="text-sm font-display font-bold text-white mb-2 leading-tight min-h-[2.5rem] flex items-center justify-center">
                    {t(member.nameKey)}
                  </h3>
                  <div className="w-8 h-1 bg-accent mx-auto mb-3" />
                  <p className="text-[10px] text-accent font-semibold uppercase tracking-wider">
                    {t(member.roleKey)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InternationalBoardSection;