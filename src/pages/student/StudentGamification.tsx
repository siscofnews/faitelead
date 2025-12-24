import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Trophy, Star, Flame, Zap, Crown, Award, Medal,
  BookOpen, CheckCircle, GraduationCap, TrendingUp, Rocket, Play, Sparkles
} from 'lucide-react';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirement_type: string;
  requirement_value: number;
}

interface StudentBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badges: BadgeData;
}

interface GamificationData {
  total_points: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  lessons_completed: number;
  exams_passed: number;
  perfect_scores: number;
  certificates_earned: number;
  last_activity_date: string | null;
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'trophy': Trophy,
  'star': Star,
  'flame': Flame,
  'zap': Zap,
  'crown': Crown,
  'award': Award,
  'medal': Medal,
  'book-open': BookOpen,
  'check-circle': CheckCircle,
  'graduation-cap': GraduationCap,
  'trending-up': TrendingUp,
  'rocket': Rocket,
  'play': Play,
  'sparkles': Sparkles,
};

export default function StudentGamification() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allBadges, setAllBadges] = useState<BadgeData[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<StudentBadge[]>([]);
  const [gamification, setGamification] = useState<GamificationData | null>(null);

  useEffect(() => {
    loadGamificationData();
  }, [loadGamificationData]);

  const loadGamificationData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Load all badges
      const { data: badges } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('points', { ascending: true });

      // Load earned badges
      const { data: studentBadges } = await supabase
        .from('student_badges')
        .select('*, badges(*)')
        .eq('student_id', user.id);

      // Load gamification stats
      const { data: stats } = await supabase
        .from('student_gamification')
        .select('*')
        .eq('student_id', user.id)
        .single();

      setAllBadges(badges || []);
      setEarnedBadges(studentBadges as StudentBadge[] || []);
      setGamification(stats);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const getPointsForNextLevel = (level: number) => level * 100;
  
  const getLevelProgress = () => {
    if (!gamification) return 0;
    const pointsForCurrentLevel = (gamification.current_level - 1) * 100;
    const pointsForNextLevel = gamification.current_level * 100;
    const progressPoints = gamification.total_points - pointsForCurrentLevel;
    return Math.min((progressPoints / (pointsForNextLevel - pointsForCurrentLevel)) * 100, 100);
  };

  const isBadgeEarned = (badgeId: string) => {
    return earnedBadges.some(eb => eb.badge_id === badgeId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'lesson': 'Aulas',
      'exam': 'Provas',
      'streak': 'Sequência',
      'level': 'Nível',
      'certificate': 'Certificados',
      'achievement': 'Conquistas'
    };
    return labels[category] || category;
  };

  const renderIcon = (iconName: string, className?: string) => {
    const IconComponent = iconMap[iconName] || Trophy;
    return <IconComponent className={className} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = gamification || {
    total_points: 0,
    current_level: 1,
    current_streak: 0,
    longest_streak: 0,
    lessons_completed: 0,
    exams_passed: 0,
    perfect_scores: 0,
    certificates_earned: 0
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/student')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Conquistas e Badges</h1>
              <p className="text-sm text-muted-foreground">Acompanhe seu progresso e desbloqueie recompensas</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Level Card */}
        <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-background border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nível Atual</p>
                  <p className="text-3xl font-bold text-primary">Nível {stats.current_level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{stats.total_points}</p>
                <p className="text-sm text-muted-foreground">pontos totais</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso para o próximo nível</span>
                <span className="text-foreground font-medium">
                  {stats.total_points % 100} / {getPointsForNextLevel(stats.current_level)} XP
                </span>
              </div>
              <Progress value={getLevelProgress()} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-8 w-8 mx-auto text-orange-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.current_streak}</p>
              <p className="text-xs text-muted-foreground">Dias seguidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.lessons_completed}</p>
              <p className="text-xs text-muted-foreground">Aulas concluídas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.exams_passed}</p>
              <p className="text-xs text-muted-foreground">Provas aprovadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.perfect_scores}</p>
              <p className="text-xs text-muted-foreground">Notas perfeitas</p>
            </CardContent>
          </Card>
        </div>

        {/* Badges Section */}
        <Tabs defaultValue="earned" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="earned">
              Conquistados ({earnedBadges.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              Todos os Badges ({allBadges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earned" className="mt-4">
            {earnedBadges.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Trophy className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhum badge conquistado ainda</h3>
                  <p className="text-muted-foreground">Continue estudando para desbloquear suas primeiras conquistas!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {earnedBadges.map((studentBadge) => (
                  <Card key={studentBadge.id} className="border-primary/50 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          {renderIcon(studentBadge.badges.icon, "h-7 w-7 text-primary")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">{studentBadge.badges.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              +{studentBadge.badges.points} XP
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{studentBadge.badges.description}</p>
                          <p className="text-xs text-primary mt-2">
                            Conquistado em {formatDate(studentBadge.earned_at)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <div className="space-y-6">
              {['lesson', 'exam', 'streak', 'level', 'certificate'].map((category) => {
                const categoryBadges = allBadges.filter(b => b.category === category);
                if (categoryBadges.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      {getCategoryLabel(category)}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryBadges.map((badge) => {
                        const earned = isBadgeEarned(badge.id);
                        return (
                          <Card 
                            key={badge.id} 
                            className={earned ? 'border-primary/50 bg-primary/5' : 'opacity-60'}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  earned ? 'bg-primary/20' : 'bg-muted'
                                }`}>
                                  {renderIcon(badge.icon, `h-7 w-7 ${earned ? 'text-primary' : 'text-muted-foreground'}`)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-foreground truncate">{badge.name}</h4>
                                    <Badge variant={earned ? "secondary" : "outline"} className="text-xs">
                                      +{badge.points} XP
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">{badge.description}</p>
                                  {earned && (
                                    <p className="text-xs text-primary mt-2 flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" /> Conquistado
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Tips Card */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Dicas para ganhar mais pontos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Flame className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Mantenha sua sequência</p>
                <p className="text-sm text-muted-foreground">Estude todos os dias para ganhar bônus de sequência</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Busque a perfeição</p>
                <p className="text-sm text-muted-foreground">Notas máximas em provas dão pontos extras</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <GraduationCap className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Complete cursos</p>
                <p className="text-sm text-muted-foreground">Certificados garantem grandes recompensas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
