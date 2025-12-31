import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  FileText,
  CreditCard,
  HelpCircle,
  Library,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ScrollText,
  Trophy,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/i18n/I18nProvider";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const DashboardSidebar = ({ isOpen, onClose }: DashboardSidebarProps) => {
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      title: t("common.home", { defaultValue: "Home" }),
      icon: Home,
      href: "/",
    },
    {
      title: t("dashboards.student.start", { defaultValue: "Início" }),
      icon: LayoutDashboard,
      href: "/student",
    },
    {
      title: t("dashboards.student.my_progress", { defaultValue: "Meu Progresso" }),
      icon: TrendingUp,
      href: "/student/progresso",
    },
    {
      title: t("dashboard.gamification.achievements", { defaultValue: "Conquistas" }),
      icon: Trophy,
      href: "/student/conquistas",
    },
    {
      title: t("dashboard.gamification.view_ranking", { defaultValue: "Ranking" }),
      icon: Award,
      href: "/student/ranking",
    },
    {
      title: t("dashboards.student.my_courses", { defaultValue: "Meus Cursos" }),
      icon: BookOpen,
      href: "/student/courses",
    },
    {
      title: t("common.lessons", { defaultValue: "Aulas" }),
      icon: GraduationCap,
      href: "/student/lessons",
    },
    {
      title: t("common.exams", { defaultValue: "Provas" }),
      icon: FileText,
      href: "/student/exams",
    },
    {
      title: t("dashboard.quick_actions.history", { defaultValue: "Histórico" }),
      icon: ScrollText,
      href: "/student/historico",
    },
    {
      title: t("dashboard.quick_actions.certificates", { defaultValue: "Certificados" }),
      icon: Award,
      href: "/student/certificados",
    },
    {
      title: t("dashboard.quick_actions.financial", { defaultValue: "Financeiro" }),
      icon: CreditCard,
      href: "/student/financeiro",
    },
    {
      title: t("dashboard.quick_actions.calendar", { defaultValue: "Calendário" }),
      icon: Calendar,
      href: "/student/calendar",
    },
    {
      title: t("dashboard.quick_actions.support", { defaultValue: "Suporte" }),
      icon: HelpCircle,
      href: "/student/support",
    },
    {
      title: t("common.gallery", { defaultValue: "Galeria" }),
      icon: Library,
      href: "/galeria",
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-card border-r border-border transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 z-50 hidden md:flex h-6 w-6 rounded-full border border-border bg-card shadow-md"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        <ScrollArea className="h-full py-4">
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              const linkContent = (
                <NavLink
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary-foreground")} />
                  {!collapsed && (
                    <span className="truncate">{item.title}</span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                </NavLink>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.href}>{linkContent}</div>;
            })}
          </nav>

          {/* Bottom Section */}
          {!collapsed && (
            <div className="mt-8 mx-3 p-4 rounded-xl bg-gradient-hero text-primary-foreground">
              <h4 className="font-display font-semibold mb-1">{t("dashboard.support.help_title", { defaultValue: "Precisa de ajuda?" })}</h4>
              <p className="text-xs opacity-90 mb-3">
                {t("dashboard.support.help_desc", { defaultValue: "Nossa equipe está pronta para te auxiliar" })}
              </p>
              <Button
                size="sm"
                variant="secondary"
                className="w-full text-xs font-medium"
              >
                {t("dashboard.support.contact_button", { defaultValue: "Falar com Suporte" })}
              </Button>
            </div>
          )}
        </ScrollArea>
      </aside>
    </TooltipProvider>
  );
};

export default DashboardSidebar;
