import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Calendar, FileText, Euro, Download, ShoppingCart, Check, Users, Clock, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Importar imagens das revistas
import revistaAdultos from "@/assets/revistas/adultos.png";
import revistaJovens from "@/assets/revistas/jovens.png";
import revistaAdolescentes from "@/assets/revistas/adolescentes.png";
import revistaCriancas from "@/assets/revistas/criancas.png";

// Dados das revistas
const revistasData = {
  adultos: {
    id: "adultos",
    title: "Escola Bíblica Adultos",
    subtitle: "Série Cartas de Paulo",
    tema: "Carta aos Romanos",
    trimestre: "1º Trimestre 2026",
    licoes: 13,
    preco: 30,
    image: revistaAdultos,
    faixaEtaria: "Adultos (18+)",
    formato: "Revista impressa + Material digital",
    paginas: 96,
    descricao: "Material completo para estudos bíblicos aprofundados. Aborda a Carta aos Romanos com análises teológicas, contexto histórico e aplicações práticas para a vida cristã adulta. Ideal para classes de Escola Bíblica Dominical.",
    descricaoCompleta: "A Revista SECC para Adultos do 1º Trimestre de 2026 mergulha profundamente na Carta aos Romanos, uma das mais importantes epístolas do Apóstolo Paulo. Este material foi cuidadosamente elaborado para proporcionar um estudo sistemático e transformador das Escrituras, combinando análise exegética, contexto histórico-cultural e aplicações práticas para a vida cristã contemporânea.",
    recursos: [
      "13 lições completas com estudos aprofundados",
      "Material do professor com metodologias de ensino",
      "Mapas e ilustrações do contexto romano",
      "Glossário teológico",
      "Questões para reflexão e discussão em grupo",
      "Aplicações práticas para o dia a dia",
    ],
    licoesSumario: [
      { numero: 1, titulo: "Introdução à Carta aos Romanos", tema: "Contexto histórico e autoria de Paulo" },
      { numero: 2, titulo: "O Evangelho de Deus", tema: "A justiça de Deus revelada (Rm 1:1-17)" },
      { numero: 3, titulo: "A Humanidade Sem Desculpa", tema: "A ira de Deus contra o pecado (Rm 1:18-32)" },
      { numero: 4, titulo: "O Julgamento Divino", tema: "Judeus e gentios diante de Deus (Rm 2:1-29)" },
      { numero: 5, titulo: "Todos Pecaram", tema: "A universalidade do pecado (Rm 3:1-20)" },
      { numero: 6, titulo: "Justificação pela Fé", tema: "A graça mediante a fé (Rm 3:21-31)" },
      { numero: 7, titulo: "O Exemplo de Abraão", tema: "A fé que justifica (Rm 4:1-25)" },
      { numero: 8, titulo: "Os Frutos da Justificação", tema: "Paz e esperança em Cristo (Rm 5:1-11)" },
      { numero: 9, titulo: "Adão e Cristo", tema: "O paralelo entre a morte e a vida (Rm 5:12-21)" },
      { numero: 10, titulo: "Mortos para o Pecado", tema: "Vida nova em Cristo (Rm 6:1-23)" },
      { numero: 11, titulo: "A Lei e o Pecado", tema: "Conflito interior do ser humano (Rm 7:1-25)" },
      { numero: 12, titulo: "Vida no Espírito", tema: "Vitória sobre a carne (Rm 8:1-17)" },
      { numero: 13, titulo: "Mais que Vencedores", tema: "O amor inseparável de Deus (Rm 8:18-39)" },
    ],
  },
  jovens: {
    id: "jovens",
    title: "Escola Bíblica & Jovens",
    subtitle: "Adolescentes & Jovens",
    tema: "Romanos: Fé e Atitude Jovem",
    trimestre: "1º Trimestre 2026",
    licoes: 13,
    preco: 30,
    image: revistaJovens,
    faixaEtaria: "Jovens (15-25 anos)",
    formato: "Revista impressa + Conteúdo digital",
    paginas: 80,
    descricao: "Conteúdo dinâmico e relevante para a juventude cristã. Conecta os ensinamentos de Romanos com os desafios contemporâneos dos jovens, promovendo fé ativa e atitude cristã no dia a dia.",
    descricaoCompleta: "Esta revista foi desenvolvida especialmente para jovens que desejam aprofundar sua fé e aplicar os ensinamentos bíblicos em suas vidas. Através de uma linguagem contemporânea e exemplos práticos, exploramos a Carta aos Romanos mostrando sua relevância para as questões que a juventude enfrenta hoje.",
    recursos: [
      "13 lições com linguagem jovem e dinâmica",
      "QR Codes com conteúdo digital exclusivo",
      "Desafios semanais de aplicação prática",
      "Histórias de jovens transformados",
      "Atividades interativas em grupo",
      "Playlist de músicas relacionadas aos temas",
    ],
    licoesSumario: [
      { numero: 1, titulo: "Paulo: Um Jovem Transformado", tema: "A história de uma vida impactada por Cristo" },
      { numero: 2, titulo: "Não Tenho Vergonha", tema: "Coragem para viver a fé (Rm 1:16)" },
      { numero: 3, titulo: "Escolhas e Consequências", tema: "A realidade do pecado na juventude" },
      { numero: 4, titulo: "Quebrando Preconceitos", tema: "Todos são iguais diante de Deus" },
      { numero: 5, titulo: "O Problema é Universal", tema: "Reconhecendo nossa necessidade de Deus" },
      { numero: 6, titulo: "Graça que Transforma", tema: "Salvação como presente, não conquista" },
      { numero: 7, titulo: "Fé que Age", tema: "O exemplo de Abraão para jovens" },
      { numero: 8, titulo: "Paz em Meio ao Caos", tema: "Encontrando esperança nas dificuldades" },
      { numero: 9, titulo: "Nova Identidade", tema: "Quem somos em Cristo" },
      { numero: 10, titulo: "Liberdade Verdadeira", tema: "Vencendo vícios e escravidões" },
      { numero: 11, titulo: "A Luta Interior", tema: "Lidando com conflitos e tentações" },
      { numero: 12, titulo: "Vida Espiritual Ativa", tema: "Cultivando intimidade com Deus" },
      { numero: 13, titulo: "Nada Vai Nos Separar", tema: "Segurança e propósito em Cristo" },
    ],
  },
  adolescentes: {
    id: "adolescentes",
    title: "Escola Bíblica Adolescentes",
    subtitle: "Série Cartas de Paulo",
    tema: "Carta aos Romanos",
    trimestre: "1º Trimestre 2026",
    licoes: 13,
    preco: 30,
    image: revistaAdolescentes,
    faixaEtaria: "Adolescentes (12-17 anos)",
    formato: "Revista impressa + Recursos online",
    paginas: 72,
    descricao: "Material adaptado para adolescentes com linguagem acessível e atividades interativas. Estuda o livro de Romanos de forma envolvente, fortalecendo a fé e o conhecimento bíblico nesta fase importante da vida.",
    descricaoCompleta: "A adolescência é uma fase de descobertas, questionamentos e formação de identidade. Esta revista foi pensada para acompanhar os adolescentes nessa jornada, apresentando as verdades eternas da Carta aos Romanos de forma relevante e aplicável à sua realidade.",
    recursos: [
      "13 lições com linguagem adolescente",
      "Atividades criativas e desafiadoras",
      "Espaço para anotações e reflexões pessoais",
      "Histórias e testemunhos inspiradores",
      "Jogos e dinâmicas para a classe",
      "Material para os pais acompanharem",
    ],
    licoesSumario: [
      { numero: 1, titulo: "Conhecendo Paulo", tema: "O autor da carta e sua missão" },
      { numero: 2, titulo: "Orgulho de Ser Cristão", tema: "O poder do Evangelho (Rm 1:16)" },
      { numero: 3, titulo: "Por Que o Mundo Está Assim?", tema: "Entendendo as consequências do pecado" },
      { numero: 4, titulo: "Somos Todos Iguais?", tema: "Judeus e gentios perante Deus" },
      { numero: 5, titulo: "Ninguém É Perfeito", tema: "Reconhecendo nossos erros" },
      { numero: 6, titulo: "Presente de Graça", tema: "A salvação pela fé" },
      { numero: 7, titulo: "Confiança Total", tema: "A fé de Abraão como modelo" },
      { numero: 8, titulo: "Paz Interior", tema: "Os benefícios de estar em Cristo" },
      { numero: 9, titulo: "Mudança de História", tema: "De Adão a Cristo" },
      { numero: 10, titulo: "Vida Nova", tema: "Morrendo para o pecado" },
      { numero: 11, titulo: "Batalha Interior", tema: "A luta contra o pecado" },
      { numero: 12, titulo: "Filhos de Deus", tema: "Vivendo pelo Espírito" },
      { numero: 13, titulo: "Amor Inabalável", tema: "Nada nos separa de Cristo" },
    ],
  },
  criancas: {
    id: "criancas",
    title: "Escola Bíblica Infantil",
    subtitle: "Crianças de 7 a 11 anos",
    tema: "Carta aos Romanos",
    trimestre: "1º Trimestre 2026",
    licoes: 13,
    preco: 30,
    image: revistaCriancas,
    faixaEtaria: "Crianças (7-11 anos)",
    formato: "Revista colorida + Atividades",
    paginas: 64,
    descricao: "Revista colorida e ilustrada para crianças de 7 a 11 anos. Apresenta as verdades bíblicas de Romanos de forma lúdica, com histórias, jogos, atividades e lições que marcam o coração das crianças.",
    descricaoCompleta: "Desenvolvida com muito carinho para as crianças, esta revista apresenta os grandes ensinamentos da Carta aos Romanos de forma adequada à faixa etária, usando histórias, ilustrações coloridas, jogos e atividades que tornam o aprendizado divertido e memorável.",
    recursos: [
      "13 lições ilustradas e coloridas",
      "Histórias bíblicas adaptadas",
      "Jogos, quebra-cabeças e atividades",
      "Versículos para memorizar",
      "Página de adesivos",
      "Certificado de conclusão",
    ],
    licoesSumario: [
      { numero: 1, titulo: "Quem Foi Paulo?", tema: "Conhecendo o autor da carta" },
      { numero: 2, titulo: "Boas Notícias!", tema: "O que é o Evangelho?" },
      { numero: 3, titulo: "Fazendo Escolhas", tema: "O que agrada a Deus?" },
      { numero: 4, titulo: "Deus Ama Todos", tema: "Não há favoritos para Deus" },
      { numero: 5, titulo: "Todos Precisam de Jesus", tema: "Ninguém é perfeito sozinho" },
      { numero: 6, titulo: "Um Presente Especial", tema: "A salvação é de graça" },
      { numero: 7, titulo: "Abraão, o Amigo de Deus", tema: "Confiando em Deus sempre" },
      { numero: 8, titulo: "Paz no Coração", tema: "Jesus nos traz paz" },
      { numero: 9, titulo: "Nova Família", tema: "Fazemos parte da família de Deus" },
      { numero: 10, titulo: "Vida Diferente", tema: "Vivendo como Jesus quer" },
      { numero: 11, titulo: "Ajuda do Espírito Santo", tema: "Deus nos ajuda a fazer o certo" },
      { numero: 12, titulo: "Filhos Amados", tema: "Somos filhos de Deus" },
      { numero: 13, titulo: "Amor Para Sempre", tema: "Deus nunca vai nos deixar" },
    ],
  },
};

const RevistaDetails = () => {
  const { revistaId } = useParams();
  const revista = revistasData[revistaId as keyof typeof revistasData];

  if (!revista) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Revista não encontrada</h1>
          <Link to="/#secc">
            <Button>Voltar para Revistas</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleComprar = () => {
    toast.success("Redirecionando para o pagamento...", {
      description: `Revista ${revista.title} - €${revista.preco},00`,
    });
    // Aqui seria integrado com Stripe ou outro gateway de pagamento
  };

  const handleBaixarAmostra = () => {
    toast.info("Preparando amostra gratuita...", {
      description: "O download iniciará em instantes.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/#secc" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Revistas SECC
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Imagem */}
          <div className="flex justify-center items-start">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
              <img 
                src={revista.image} 
                alt={revista.title}
                className="relative w-full max-w-md h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                {revista.trimestre}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-display font-black text-foreground mb-2">
                {revista.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-2">{revista.subtitle}</p>
              <p className="text-xl font-semibold text-primary">{revista.tema}</p>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {revista.descricaoCompleta}
            </p>

            {/* Especificações */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Público</p>
                  <p className="text-sm font-medium">{revista.faixaEtaria}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Lições</p>
                  <p className="text-sm font-medium">{revista.licoes} lições</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Páginas</p>
                  <p className="text-sm font-medium">{revista.paginas} páginas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Período</p>
                  <p className="text-sm font-medium">Trimestral</p>
                </div>
              </div>
            </div>

            {/* Preço e Compra */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Preço</p>
                    <p className="text-3xl font-bold text-primary flex items-center gap-1">
                      <Euro className="h-6 w-6" />
                      {revista.preco},00
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                    Em Estoque
                  </Badge>
                </div>
                <div className="space-y-3">
                  <Button onClick={handleComprar} className="w-full" size="lg">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Comprar Agora
                  </Button>
                  <Button onClick={handleBaixarAmostra} variant="outline" className="w-full" size="lg">
                    <Download className="h-5 w-5 mr-2" />
                    Baixar Amostra Grátis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recursos */}
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            O Que Você Vai Encontrar
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {revista.recursos.map((recurso, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{recurso}</span>
              </div>
            ))}
          </div>
        </section>

        <Separator className="mb-16" />

        {/* Sumário das Lições */}
        <section>
          <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Sumário - {revista.licoes} Lições
          </h2>
          <div className="grid gap-4">
            {revista.licoesSumario.map((licao) => (
              <Card key={licao.numero} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{licao.numero}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{licao.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{licao.tema}</p>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0 hidden sm:flex">
                    Lição {licao.numero}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-display font-bold text-foreground mb-4">
                Pronto para Transformar sua Escola Bíblica?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Adquira agora a Revista SECC {revista.title} e proporcione um ensino bíblico 
                de qualidade para sua igreja.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleComprar} size="lg" className="text-lg px-8">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Comprar por €{revista.preco},00
                </Button>
                <Link to="/#secc">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    Ver Outras Revistas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer simples */}
      <footer className="mt-16 py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 SECC - Sistema de Educação Cristã Continuada. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default RevistaDetails;
