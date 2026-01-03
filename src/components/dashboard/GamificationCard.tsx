import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, Star, Crown, ChevronRight, Users } from 'lucide-react';

interface GamificationStats {
  total_points: number;
  current_level: number;
  current_streak: number;
  lessons_completed: number;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
}

interface StudentBadge {
  id: string;
  badges: Badge | Badge[] | any; // Relaxing type to handle Supabase join result which can vary
  earned_at: string;
}

export default function GamificationCard() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [recentBadges, setRecentBadges] = useState<StudentBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: gamification } = await supabase
        .from('student_gamification')
        .select('total_points, current_level, current_streak, lessons_completed')
        .eq('student_id', user.id)
        .single();

      const { data: badges } = await supabase
        .from('student_badges')
        .select('id, earned_at, badges(id, name, icon)')
        .eq('student_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(3);

      setStats(gamification);
      setRecentBadges(badges as StudentBadge[] || []);
    } catch (error) {
      console.error('Error loading gamification:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelProgress = () => {
    if (!stats) return 0;
    return ((stats.total_points % 100) / 100) * 100;
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-20 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const currentStats = stats || {
    total_points: 0,
    current_level: 1,
    current_streak: 0,
    lessons_completed: 0
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {t("dashboards.student.gamification.achievements", { defaultValue: "Conquistas" })}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/student/conquistas')}
            className="text-xs gap-1"
          >
            {t("dashboards.student.gamification.see_all", { defaultValue: "Ver todas" })} <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Level & Points */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <Crown className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-semibold text-foreground">{t("dashboards.student.gamification.level", { defaultValue: "Nível" })} {currentStats.current_level}</span>
              <span className="text-sm text-muted-foreground">{currentStats.total_points} XP</span>
            </div>
            <Progress value={getLevelProgress()} className="h-2" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-lg font-bold text-foreground">{currentStats.current_streak}</p>
              <p className="text-xs text-muted-foreground">{t("dashboards.student.gamification.streak", { defaultValue: "Dias seguidos" })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-lg font-bold text-foreground">{recentBadges.length}</p>
              <p className="text-xs text-muted-foreground">{t("dashboards.student.gamification.badges", { defaultValue: "Badges" })}</p>
            </div>
          </div>
        </div>

        {/* Recent Badges */}
        {recentBadges.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">{t("dashboards.student.gamification.recent_achievements", { defaultValue: "Últimas conquistas" })}</p>
            <div className="flex gap-2">
              {recentBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1"
                >
                  <Trophy className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary truncate max-w-[80px]">
                    {badge.badges.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ranking Link */}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => navigate('/student/ranking')}
        >
          <Users className="h-4 w-4" />
          {t("dashboards.student.gamification.view_ranking", { defaultValue: "Ver Ranking" })}
        </Button>
      </CardContent>
    </Card>
  );
}
