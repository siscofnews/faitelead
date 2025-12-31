import { BookOpen, Award, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/i18n/I18nProvider";

interface WelcomeCardProps {
  userName: string;
  coursesCount: number;
  modulesCompleted: number;
  studyHours: number;
}

const WelcomeCard = ({ userName, coursesCount, modulesCompleted, studyHours }: WelcomeCardProps) => {
  const { t } = useI18n();
  const firstName = userName.split(" ")[0];
  const currentHour = new Date().getHours();

  let greeting = t("dashboard.welcome.good_morning", { defaultValue: "Bom dia" });
  if (currentHour >= 12 && currentHour < 18) greeting = t("dashboard.welcome.good_afternoon", { defaultValue: "Boa tarde" });
  else if (currentHour >= 18) greeting = t("dashboard.welcome.good_evening", { defaultValue: "Boa noite" });

  const stats = [
    {
      icon: BookOpen,
      label: t("dashboard.welcome.courses_enrolled", { defaultValue: "Cursos Matriculados" }),
      value: coursesCount,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Award,
      label: t("dashboard.welcome.modules_completed", { defaultValue: "Módulos Concluídos" }),
      value: modulesCompleted,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Clock,
      label: t("dashboard.welcome.study_hours", { defaultValue: "Horas de Estudo" }),
      value: `${studyHours}h`,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: TrendingUp,
      label: t("dashboard.welcome.overall_progress", { defaultValue: "Progresso Geral" }),
      value: "75%",
      color: "text-primary",
      bgColor: "bg-primary/10",
      isProgress: true,
    },
  ];

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className="bg-gradient-hero p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-primary-foreground/80 text-sm mb-1">{greeting},</p>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-2">
              {firstName}! 👋
            </h1>
            <p className="text-primary-foreground/90 text-sm md:text-base max-w-md">
              {t("dashboard.welcome.continue_learning", { defaultValue: "Continue sua jornada de aprendizado na FAITEL. Você está indo muito bem!" })}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 rounded-full bg-primary-foreground/10 flex items-center justify-center animate-float">
              <span className="text-5xl">📚</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
          {stats.map((stat, index) => (
            <div key={index} className="p-4 md:p-6 flex flex-col items-center text-center group hover:bg-secondary/30 transition-colors">
              <div className={`${stat.bgColor} rounded-full p-3 mb-3 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              {stat.isProgress ? (
                <div className="w-full max-w-[80px]">
                  <Progress value={75} className="h-2 mb-2" />
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeCard;
