import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MessageCircle, Phone, Mail, Clock,
  Send, HelpCircle, BookOpen, FileText, CreditCard,
  ChevronDown, ChevronUp, ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    category: "Acesso",
    icon: HelpCircle,
    questions: [
      {
        question: "Como acesso minhas aulas?",
        answer: "Após fazer login, vá para 'Meus Cursos' no menu lateral. Clique no curso desejado e você terá acesso a todas as aulas disponíveis organizadas por módulos."
      },
      {
        question: "Esqueci minha senha, o que fazer?",
        answer: "Na tela de login, clique em 'Esqueci minha senha'. Você receberá um e-mail com instruções para redefinir sua senha. Verifique também sua caixa de spam."
      },
      {
        question: "Posso acessar de qualquer dispositivo?",
        answer: "Sim! Nossa plataforma é responsiva e funciona em computadores, tablets e smartphones. Basta acessar com seu e-mail e senha cadastrados."
      }
    ]
  },
  {
    category: "Aulas e Conteúdo",
    icon: BookOpen,
    questions: [
      {
        question: "As aulas ficam disponíveis para sempre?",
        answer: "Sim, enquanto sua matrícula estiver ativa, você terá acesso ilimitado a todo o conteúdo do seu curso, podendo revisar as aulas quantas vezes quiser."
      },
      {
        question: "Posso fazer download do material?",
        answer: "Sim, os materiais em PDF disponibilizados podem ser baixados. Os vídeos das aulas ficam disponíveis apenas para visualização online."
      },
      {
        question: "Como funciona a aula ao vivo semanal?",
        answer: "Para alunos do modo semi-presencial, há uma aula ao vivo por semana. Você será notificado por e-mail e poderá acessar pela página de Calendário."
      }
    ]
  },
  {
    category: "Provas e Certificados",
    icon: FileText,
    questions: [
      {
        question: "Como faço as provas?",
        answer: "Após completar todas as aulas de um módulo, a prova será desbloqueada. Acesse 'Minhas Provas' para realizá-la. A nota mínima para aprovação é 70%."
      },
      {
        question: "Posso refazer uma prova?",
        answer: "Sim, caso não atinja a nota mínima, você pode refazer a prova após 24 horas. Não há limite de tentativas."
      },
      {
        question: "Quando recebo meu certificado?",
        answer: "O certificado é emitido automaticamente após você completar 100% do curso e ser aprovado em todas as provas. Ele fica disponível na área de Certificados."
      }
    ]
  },
  {
    category: "Financeiro",
    icon: CreditCard,
    questions: [
      {
        question: "Quais formas de pagamento?",
        answer: "Aceitamos cartão de crédito, boleto bancário e PIX. As mensalidades podem ser parceladas no cartão em até 12x."
      },
      {
        question: "Como acesso meus boletos?",
        answer: "Na área 'Financeiro' você encontra todos os seus boletos, com opção de segunda via e histórico de pagamentos."
      },
      {
        question: "Há desconto para pagamento antecipado?",
        answer: "Sim! Oferecemos 5% de desconto para pagamentos realizados até 5 dias antes do vencimento. Para pagamento à vista do curso completo, o desconto é de 15%."
      }
    ]
  }
];

const contactInfo = [
  {
    icon: Phone,
    title: "Telefone",
    value: "(11) 1234-5678",
    description: "Segunda a Sexta, 8h às 18h"
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "(11) 91234-5678",
    description: "Atendimento rápido"
  },
  {
    icon: Mail,
    title: "E-mail",
    value: "suporte@faitel.edu.br",
    description: "Resposta em até 24h"
  }
];

const StudentSupport = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !subject || !message) {
      toast.error("Preencha todos os campos");
      return;
    }

    setSending(true);
    
    // Simulate sending message
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Mensagem enviada com sucesso! Responderemos em breve.");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/student")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Central de Suporte</h1>
              <p className="text-sm text-muted-foreground">
                Tire suas dúvidas e entre em contato
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {contactInfo.map((contact, index) => (
            <Card key={index} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <contact.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{contact.title}</p>
                  <p className="font-semibold text-foreground">{contact.value}</p>
                  <p className="text-xs text-muted-foreground">{contact.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-foreground">
              Perguntas Frequentes
            </h2>
            
            {faqs.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <category.icon className="h-5 w-5 text-primary" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className="text-sm text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-xl font-display font-bold text-foreground mb-6">
              Enviar Mensagem
            </h2>
            
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Nome</label>
                      <Input
                        placeholder="Seu nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">E-mail</label>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Assunto</label>
                    <Input
                      placeholder="Qual o motivo do seu contato?"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Mensagem</label>
                    <Textarea
                      placeholder="Descreva sua dúvida ou solicitação com detalhes..."
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={sending}
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Tempo médio de resposta: 4 horas úteis
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Links Úteis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a 
                  href="#" 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">Tutorial da Plataforma</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
                <a 
                  href="#" 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">Regulamento do Curso</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
                <a 
                  href="#" 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">Política de Privacidade</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentSupport;
