import { BookOpen, ExternalLink, Users, Calendar, FileText, Euro, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

// Importar imagens das revistas
import revistaAdultos from "@/assets/revistas/adultos.png";
import revistaJovens from "@/assets/revistas/jovens.png";
import revistaAdolescentes from "@/assets/revistas/adolescentes.png";
import revistaCriancas from "@/assets/revistas/criancas.png";

// Revistas SECC
const revistas = [
  {
    id: "adultos",
    title: "Adultos",
    subtitle: "Série Cartas de Paulo",
    tema: "Carta aos Romanos",
    trimestre: "1º Trimestre 2026",
    licoes: 13,
    preco: 30,
    image: revistaAdultos,
    descricao: "Material completo para estudos bíblicos aprofundados. Aborda a Carta aos Romanos com análises teológicas, contexto histórico e aplicações práticas para a vida cristã adulta. Ideal para classes de Escola Bíblica Dominical.",
  },
  {
    id: "jovens",
    title: "Jovens",
    subtitle: "Adolescentes & Jovens",
    tema: "Romanos: Fé e Atitude Jovem",
    trimestre: "1º Trimestre 2026",
    licoes: 13,
    preco: 30,
    image: revistaJovens,
    descricao: "Conteúdo dinâmico e relevante para a juventude cristã. Conecta os ensinamentos de Romanos com os desafios contemporâneos dos jovens, promovendo fé ativa e atitude cristã no dia a dia.",
  },
  {
    id: "adolescentes",
    title: "Adolescentes",
    subtitle: "Escola Bíblica",
    tema: "Carta aos Romanos",
    trimestre: "1º Trimestre 2026",
    licoes: 13,
    preco: 30,
    image: revistaAdolescentes,
    descricao: "Material adaptado para adolescentes com linguagem acessível e atividades interativas. Estuda o livro de Romanos de forma envolvente, fortalecendo a fé e o conhecimento bíblico nesta fase importante da vida.",
  },
  {
    id: "criancas",
    title: "Crianças",
    subtitle: "Escola Bíblica Infantil (7 a 11 anos)",
    tema: "Carta aos Romanos",
    trimestre: "1º Trimestre 2026",
    licoes: 13,
    preco: 30,
    image: revistaCriancas,
    descricao: "Revista colorida e ilustrada para crianças de 7 a 11 anos. Apresenta as verdades bíblicas de Romanos de forma lúdica, com histórias, jogos, atividades e lições que marcam o coração das crianças.",
  },
];

const SECCSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-[hsl(220_50%_6%)] to-[hsl(220_50%_8%)] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      {/* Decorative */}
      <div className="absolute top-10 right-10 opacity-10">
        <BookOpen className="h-40 w-40 text-accent" strokeWidth={0.5} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-4 font-semibold">
            <BookOpen className="h-3 w-3 mr-1" />
            MATERIAL DIDÁTICO
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4 text-3d-white">
            REVISTA SECC
          </h2>
          <p className="text-xl font-display text-gradient-gold mb-2">
            Sistema de Educação Cristã Continuada
          </p>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Escola Bíblica Dominical - Material didático completo para todas as idades
          </p>
        </div>

        {/* Revistas Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {revistas.map((revista, index) => (
            <Card 
              key={index} 
              className="bg-glass-card border-white/10 overflow-hidden group card-hover hover:border-accent/30"
            >
              <div className="h-56 bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center relative p-4">
                <img 
                  src={revista.image} 
                  alt={`Revista ${revista.title}`}
                  className="h-full w-auto object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground border-accent text-xs font-bold">
                  €{revista.preco}
                </Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="text-lg font-display font-bold text-white mb-1 group-hover:text-accent transition-colors">
                  {revista.title}
                </h3>
                <p className="text-xs text-accent/80 font-medium mb-1">{revista.subtitle}</p>
                <p className="text-sm text-white/80 font-semibold mb-2">{revista.tema}</p>
                <p className="text-xs text-white/60 mb-3 line-clamp-3">{revista.descricao}</p>
                
                <div className="flex items-center gap-4 text-xs text-white/60 mb-4">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3 text-accent" />
                    {revista.licoes} Lições
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-accent" />
                    Trimestral
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/50">{revista.trimestre}</span>
                  <span className="flex items-center gap-1 text-accent font-bold">
                    <Euro className="h-3 w-3" />
                    {revista.preco},00
                  </span>
                </div>

                <Link to={`/revista/${revista.id}`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs border-white/20 text-white/80 hover:bg-accent hover:text-accent-foreground hover:border-accent"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver Detalhes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Box */}
        <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-white/10 max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-4">
                  Sobre as Revistas SECC
                </h3>
                <p className="text-white/70 mb-4">
                  As revistas do Sistema de Educação Cristã Continuada são produzidas trimestralmente, 
                  oferecendo 13 lições completas para cada faixa etária. O tema deste 1º trimestre de 2026 
                  é a <strong className="text-accent">Carta aos Romanos</strong>, uma das epístolas mais importantes do Apóstolo Paulo.
                </p>
                <p className="text-white/70 mb-6">
                  Cada revista custa <strong className="text-accent">€30,00</strong> e inclui material do professor, 
                  atividades complementares e recursos digitais.
                </p>
                <a href="https://secc.org.br/" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold btn-shine">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visitar Site da SECC
                  </Button>
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center bg-white/5 border border-white/10 rounded-xl p-4">
                  <Users className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-xl font-display font-bold text-white">4</p>
                  <p className="text-xs text-white/60">Faixas Etárias</p>
                </div>
                <div className="text-center bg-white/5 border border-white/10 rounded-xl p-4">
                  <BookOpen className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-xl font-display font-bold text-white">13</p>
                  <p className="text-xs text-white/60">Lições/Trimestre</p>
                </div>
                <div className="text-center bg-white/5 border border-white/10 rounded-xl p-4">
                  <FileText className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-xl font-display font-bold text-white">52</p>
                  <p className="text-xs text-white/60">Lições/Ano</p>
                </div>
                <div className="text-center bg-white/5 border border-white/10 rounded-xl p-4">
                  <Euro className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-xl font-display font-bold text-white">30</p>
                  <p className="text-xs text-white/60">Euros/Revista</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SECCSection;
