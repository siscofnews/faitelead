import { Play, FileText, CreditCard, Award, MessageCircle, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nProvider";

const QuickActions = () => {
  const { t } = useI18n();

  const actions = [
    {
      icon: Play,
      title: t("dashboard.quick_actions.continue_lesson", { defaultValue: "Continuar Aula" }),
      description: t("dashboard.quick_actions.continue_desc", { defaultValue: "Retome de onde parou" }),
      color: "bg-primary",
      href: "/student/lessons",
    },
    {
      icon: FileText,
      title: t("dashboard.quick_actions.history", { defaultValue: "Histórico" }),
      description: t("dashboard.quick_actions.history_desc", { defaultValue: "Boletim acadêmico" }),
      color: "bg-accent",
      href: "/student/historico",
    },
    {
      icon: CreditCard,
      title: t("dashboard.quick_actions.financial", { defaultValue: "Financeiro" }),
      description: t("dashboard.quick_actions.financial_desc", { defaultValue: "Pagamentos" }),
      color: "bg-success",
      href: "/student/financeiro",
    },
    {
      icon: Award,
      title: t("dashboard.quick_actions.certificates", { defaultValue: "Certificados" }),
      description: t("dashboard.quick_actions.certificates_desc", { defaultValue: "Meus diplomas" }),
      color: "bg-primary",
      href: "/student/certificados",
    },
    {
      icon: MessageCircle,
      title: t("dashboard.quick_actions.support", { defaultValue: "Suporte" }),
      description: t("dashboard.quick_actions.support_desc", { defaultValue: "Falar conosco" }),
      color: "bg-accent",
      href: "/student/support",
    },
    {
      icon: BookOpen,
      title: t("dashboard.quick_actions.courses", { defaultValue: "Cursos" }),
      description: t("dashboard.quick_actions.courses_desc", { defaultValue: "Ver catálogo" }),
      color: "bg-success",
      href: "/student/courses",
    },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-display font-bold text-foreground">{t("dashboard.quick_actions.title", { defaultValue: "Acesso Rápido" })}</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Link key={index} to={action.href}>
            <Card className="group cursor-pointer card-hover p-4 text-center border-border/50 hover:border-primary/30 h-full">
              <div className={`${action.color} w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
                <action.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-medium text-sm text-foreground mb-0.5">{action.title}</h3>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
