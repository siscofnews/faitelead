import { Megaphone, ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/I18nProvider";
import { useMemo } from "react";

const Announcements = () => {
  const { t, lang } = useI18n();

  const announcements = useMemo(() => [
    {
      title: t("dashboards.student.announcements.items.new_module", { defaultValue: "Novo módulo disponível" }),
      description: t("dashboards.student.announcements.items.new_module_desc", { defaultValue: "O módulo de Escatologia já está liberado para acesso" }),
      date: "28 Nov",
      isNew: true,
      type: "info",
    },
    {
      title: t("dashboards.student.announcements.items.exams_week", { defaultValue: "Semana de Provas" }),
      description: t("dashboards.student.announcements.items.exams_week_desc", { defaultValue: "As provas do 2º semestre começam dia 15 de dezembro" }),
      date: "25 Nov",
      isNew: true,
      type: "warning",
    },
    {
      title: t("dashboards.student.announcements.items.recess", { defaultValue: "Recesso de Fim de Ano" }),
      description: t("dashboards.student.announcements.items.recess_desc", { defaultValue: "A plataforma estará em recesso de 24/12 a 02/01" }),
      date: "20 Nov",
      isNew: false,
      type: "info",
    },
  ], [lang, t]);

  return (
    <Card key={`announcements-${lang}`} className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-accent" />
            {t("dashboards.student.announcements.title", { defaultValue: "Avisos" })}
          </CardTitle>
          <button className="text-xs text-primary hover:underline flex items-center gap-1">
            {t("common.view_all", { defaultValue: "Ver todos" })} <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {announcements.map((announcement, index) => (
          <div
            key={index}
            className="p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-secondary/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                {announcement.title}
              </h4>
              {announcement.isNew && (
                <Badge variant="secondary" className="bg-accent/10 text-accent text-xs shrink-0">
                  {t("dashboards.student.announcements.new", { defaultValue: "Novo" })}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {announcement.description}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {announcement.date}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default Announcements;
