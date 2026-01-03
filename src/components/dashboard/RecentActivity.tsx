import { Play, CheckCircle, FileText, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/i18n/I18nProvider";

const RecentActivity = () => {
  const { t } = useI18n();

  const activities = [
    {
      icon: Play,
      title: t("dashboards.student.recent_activity.lesson_watched", { defaultValue: "Aula assistida" }),
      description: "Introdução à Hermenêutica",
      time: t("common.hours_ago", { count: 2, defaultValue: "Há 2 horas" }),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: CheckCircle,
      title: t("dashboards.student.recent_activity.module_completed", { defaultValue: "Módulo concluído" }),
      description: "Teologia Sistemática I",
      time: t("common.yesterday", { defaultValue: "Ontem" }),
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: FileText,
      title: t("dashboards.student.recent_activity.exam_completed", { defaultValue: "Prova realizada" }),
      description: "Nota: 9.5",
      time: t("common.days_ago", { count: 3, defaultValue: "Há 3 dias" }),
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Award,
      title: t("dashboards.student.recent_activity.certificate_available", { defaultValue: "Certificado disponível" }),
      description: "Módulo de Ética Cristã",
      time: t("common.week_ago", { defaultValue: "Há 1 semana" }),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display">{t("dashboards.student.recent_activity.title", { defaultValue: "Atividade Recente" })}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-1 p-4 pt-0">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group"
              >
                <div className={`${activity.bgColor} rounded-full p-2 shrink-0 group-hover:scale-110 transition-transform`}>
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
