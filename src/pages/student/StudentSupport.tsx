import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/I18nProvider";
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

const StudentSupport = () => {
  const { t } = useI18n();
  const navigate = useNavigate();

  const faqs = [
    {
      category: t("dashboards.student.support_category_access", { defaultValue: "Acesso" }),
      icon: HelpCircle,
      questions: [
        {
          question: t("dashboards.student.faq_access_q1", { defaultValue: "Como acesso minhas aulas?" }),
          answer: t("dashboards.student.faq_access_a1", { defaultValue: "Após fazer login, vá para 'Meus Cursos' no menu lateral. Clique no curso desejado e você terá acesso a todas as aulas disponíveis organizadas por módulos." })
        },
        {
          question: t("dashboards.student.faq_access_q2", { defaultValue: "Esqueci minha senha, o que fazer?" }),
          answer: t("dashboards.student.faq_access_a2", { defaultValue: "Na tela de login, clique em 'Esqueci minha senha'. Você receberá um e-mail com instruções para redefinir sua senha. Verifique também sua caixa de spam." })
        },
        {
          question: t("dashboards.student.faq_access_q3", { defaultValue: "Posso acessar de qualquer dispositivo?" }),
          answer: t("dashboards.student.faq_access_a3", { defaultValue: "Sim! Nossa plataforma é responsiva e funciona em computadores, tablets e smartphones. Basta acessar com seu e-mail e senha cadastrados." })
        }
      ]
    },
    {
      category: t("dashboards.student.support_category_lessons", { defaultValue: "Aulas e Conteúdo" }),
      icon: BookOpen,
      questions: [
        {
          question: t("dashboards.student.faq_lessons_q1", { defaultValue: "As aulas ficam disponíveis para sempre?" }),
          answer: t("dashboards.student.faq_lessons_a1", { defaultValue: "Sim, enquanto sua matrícula estiver ativa, você terá acesso ilimitado a todo o conteúdo do seu curso, podendo revisar as aulas quantas vezes quiser." })
        },
        {
          question: t("dashboards.student.faq_lessons_q2", { defaultValue: "Posso fazer download do material?" }),
          answer: t("dashboards.student.faq_lessons_a2", { defaultValue: "Sim, os materiais em PDF disponibilizados podem ser baixados. Os vídeos das aulas ficam disponíveis apenas para visualização online." })
        },
        {
          question: t("dashboards.student.faq_lessons_q3", { defaultValue: "Como funciona a aula ao vivo semanal?" }),
          answer: t("dashboards.student.faq_lessons_a3", { defaultValue: "Para alunos do modo semi-presencial, há uma aula ao vivo por semana. Você será notificado por e-mail e poderá acessar pela página de Calendário." })
        }
      ]
    },
    {
      category: t("dashboards.student.support_category_exams", { defaultValue: "Provas e Certificados" }),
      icon: FileText,
      questions: [
        {
          question: t("dashboards.student.faq_exams_q1", { defaultValue: "Como faço as provas?" }),
          answer: t("dashboards.student.faq_exams_a1", { defaultValue: "Após completar todas as aulas de um módulo, a prova será desbloqueada. Acesse 'Minhas Provas' para realizá-la. A nota mínima para aprovação é 70%." })
        },
        {
          question: t("dashboards.student.faq_exams_q2", { defaultValue: "Posso refazer uma prova?" }),
          answer: t("dashboards.student.faq_exams_a2", { defaultValue: "Sim, caso não atinja a nota mínima, você pode refazer a prova após 24 horas. Não há limite de tentativas." })
        },
        {
          question: t("dashboards.student.faq_exams_q3", { defaultValue: "Quando recebo meu certificado?" }),
          answer: t("dashboards.student.faq_exams_a3", { defaultValue: "O certificado é emitido automaticamente após você completar 100% do curso e ser aprovado em todas as provas. Ele fica disponível na área de Certificados." })
        }
      ]
    },
    {
      category: t("dashboards.student.support_category_financial", { defaultValue: "Financeiro" }),
      icon: CreditCard,
      questions: [
        {
          question: t("dashboards.student.faq_financial_q1", { defaultValue: "Quais formas de pagamento?" }),
          answer: t("dashboards.student.faq_financial_a1", { defaultValue: "Aceitamos cartão de crédito, boleto bancário e PIX. As mensalidades podem ser parceladas no cartão em até 12x." })
        },
        {
          question: t("dashboards.student.faq_financial_q2", { defaultValue: "Como acesso meus boletos?" }),
          answer: t("dashboards.student.faq_financial_a2", { defaultValue: "Na área 'Financeiro' você encontra todos os seus boletos, com opção de segunda via e histórico de pagamentos." })
        },
        {
          question: t("dashboards.student.faq_financial_q3", { defaultValue: "Há desconto para pagamento antecipado?" }),
          answer: t("dashboards.student.faq_financial_a3", { defaultValue: "Sim! Oferecemos 5% de desconto para pagamentos realizados até 5 dias antes do vencimento. Para pagamento à vista do curso completo, o desconto é de 15%." })
        }
      ]
    }
  ];

  const contactInfo = [
    {
      icon: Phone,
      title: t("common.phone", { defaultValue: "Telefone" }),
      value: "(11) 1234-5678",
      description: t("dashboards.student.support_phone_desc", { defaultValue: "Segunda a Sexta, 8h às 18h" })
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: "(11) 91234-5678",
      description: t("dashboards.student.support_whatsapp_desc", { defaultValue: "Atendimento rápido" })
    },
    {
      icon: Mail,
      title: "E-mail",
      value: "suporte@faitel.edu.br",
      description: t("dashboards.student.support_email_desc", { defaultValue: "Resposta em até 24h" })
    }
  ];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !subject || !message) {
      toast.error(t("common.fill_all_fields", { defaultValue: "Preencha todos os campos" }));
      return;
    }

    setSending(true);

    // Simulate sending message
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success(t("dashboards.student.support_message_success", { defaultValue: "Mensagem enviada com sucesso! Responderemos em breve." }));
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
              <h1 className="text-2xl font-display font-bold text-foreground">{t("dashboard.quick_actions.support")}</h1>
              <p className="text-sm text-muted-foreground">
                {t("dashboards.student.support_subtitle", { defaultValue: "Tire suas dúvidas e entre em contato" })}
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
              {t("dashboards.student.faq_title", { defaultValue: "Perguntas Frequentes" })}
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
              {t("dashboards.student.send_message_title", { defaultValue: "Enviar Mensagem" })}
            </h2>

            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{t("common.name")}</label>
                      <Input
                        placeholder={t("common.full_name_placeholder", { defaultValue: "Seu nome completo" })}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">E-mail</label>
                      <Input
                        type="email"
                        placeholder={t("common.email_placeholder", { defaultValue: "seu@email.com" })}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("common.subject")}</label>
                    <Input
                      placeholder={t("common.subject_placeholder", { defaultValue: "Qual o motivo do seu contato?" })}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("common.message")}</label>
                    <Textarea
                      placeholder={t("common.message_placeholder", { defaultValue: "Descreva sua dúvida ou solicitação com detalhes..." })}
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
                        {t("common.sending", { defaultValue: "Enviando..." })}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t("dashboards.student.send_message_button", { defaultValue: "Enviar Mensagem" })}
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {t("dashboards.student.average_response_time", { defaultValue: "Tempo médio de resposta: 4 horas úteis" })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">{t("common.useful_links", { defaultValue: "Links Úteis" })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a
                  href="#"
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">{t("dashboards.student.platform_tutorial", { defaultValue: "Tutorial da Plataforma" })}</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">{t("dashboards.student.course_regulation", { defaultValue: "Regulamento do Curso" })}</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">{t("common.privacy_policy", { defaultValue: "Política de Privacidade" })}</span>
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
