import { Play, FileText, CreditCard, Award, MessageCircle, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const actions = [
  {
    icon: Play,
    title: "Continuar Aula",
    description: "Retome de onde parou",
    color: "bg-primary",
    href: "/student/lessons",
  },
  {
    icon: FileText,
    title: "Histórico",
    description: "Boletim acadêmico",
    color: "bg-accent",
    href: "/student/historico",
  },
  {
    icon: CreditCard,
    title: "Financeiro",
    description: "Pagamentos",
    color: "bg-success",
    href: "/student/financeiro",
  },
  {
    icon: Award,
    title: "Certificados",
    description: "Meus diplomas",
    color: "bg-primary",
    href: "/student/certificados",
  },
  {
    icon: MessageCircle,
    title: "Suporte",
    description: "Falar conosco",
    color: "bg-accent",
    href: "/student/support",
  },
  {
    icon: BookOpen,
    title: "Cursos",
    description: "Ver catálogo",
    color: "bg-success",
    href: "/student/courses",
  },
];

const QuickActions = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-display font-bold text-foreground">Acesso Rápido</h2>
      
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
