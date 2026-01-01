import { useNavigate } from "react-router-dom";
import { GraduationCap, Play, Clock, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/i18n/I18nProvider";

interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  progress?: number;
  lessonsCount?: number;
  duration?: string;
  professor?: string;
}

const CourseCard = ({
  id,
  title,
  description,
  thumbnailUrl,
  progress = 0,
  lessonsCount = 0,
  duration = "12 meses",
  professor = "FAITEL",
}: CourseCardProps) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleOpenCourse = () => {
    navigate(`/course/${id}`);
  };
  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 card-hover">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-hero overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <GraduationCap className="w-16 h-16 text-primary-foreground/60 group-hover:scale-110 transition-transform" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="lg"
            className="rounded-full w-14 h-14 bg-primary-foreground/90 hover:bg-primary-foreground text-primary shadow-xl"
            onClick={handleOpenCourse}
          >
            <Play className="h-6 w-6 ml-1" fill="currentColor" />
          </Button>
        </div>

        {/* Status Badge */}
        <Badge className="absolute top-3 right-3 bg-success/90 text-success-foreground border-0">
          {t('common.active', { defaultValue: 'Ativo' })}
        </Badge>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>
        <p className="text-xs text-primary font-medium">{professor}</p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description || t('dashboards.student.course_card.default_desc', { defaultValue: 'Curso completo de teologia com material didático exclusivo' })}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {lessonsCount} {t('common.lessons', { defaultValue: 'aulas' })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {duration}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t('dashboards.student.course_card.progress', { defaultValue: 'Progresso' })}</span>
            <span className="font-medium text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* CTA */}
        <Button
          className="w-full bg-gradient-primary hover:opacity-90 btn-shine"
          onClick={handleOpenCourse}
        >
          <Play className="mr-2 h-4 w-4" />
          {t('dashboards.student.course_card.continue', { defaultValue: 'Continuar Curso' })}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
