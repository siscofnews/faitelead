import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, Trophy, Crown, Medal, Star, Flame, TrendingUp, Users
} from 'lucide-react';

interface LeaderboardEntry {
  student_id: string;
  total_points: number;
  current_level: number;
  current_streak: number;
  lessons_completed: number;
  exams_passed: number;
  badges_count: number;
  student_name: string;
  rank: number;
}

export default function StudentLeaderboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [filter, setFilter] = useState<'points' | 'level' | 'streak' | 'lessons'>('points');

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setCurrentUserId(user.id);

      // Get gamification data with profiles
      const { data: gamificationData, error } = await supabase
        .from('student_gamification')
        .select('*')
        .order(getOrderColumn(), { ascending: false });

      if (error) throw error;

      // Get badges count for each student
      const { data: badgesData } = await supabase
        .from('student_badges')
        .select('student_id');

      const badgesCount: Record<string, number> = {};
      badgesData?.forEach(b => {
        badgesCount[b.student_id] = (badgesCount[b.student_id] || 0) + 1;
      });

      // Get student names from profiles
      const studentIds = gamificationData?.map(g => g.student_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', studentIds);

      const profilesMap: Record<string, string> = {};
      profilesData?.forEach(p => {
        profilesMap[p.id] = p.full_name;
      });

      // Build leaderboard
      const entries: LeaderboardEntry[] = (gamificationData || []).map((g, index) => ({
        student_id: g.student_id,
        total_points: g.total_points,
        current_level: g.current_level,
        current_streak: g.current_streak,
        lessons_completed: g.lessons_completed,
        exams_passed: g.exams_passed,
        badges_count: badgesCount[g.student_id] || 0,
        student_name: profilesMap[g.student_id] || 'Aluno',
        rank: index + 1
      }));

      setLeaderboard(entries);

      // Find current user's rank
      const userEntry = entries.find(e => e.student_id === user.id);
      setUserRank(userEntry || null);
      setLoading(false);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, navigate]);

  const getOrderColumn = () => {
    switch (filter) {
      case 'level': return 'current_level';
      case 'streak': return 'current_streak';
      case 'lessons': return 'lessons_completed';
      default: return 'total_points';
    }
  };

  const getMetricValue = (entry: LeaderboardEntry) => {
    switch (filter) {
      case 'level': return `Nível ${entry.current_level}`;
      case 'streak': return `${entry.current_streak} dias`;
      case 'lessons': return `${entry.lessons_completed} aulas`;
      default: return `${entry.total_points} XP`;
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 border-yellow-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-400/5 border-gray-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600/20 to-amber-600/5 border-amber-600/30';
    return 'bg-card';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Ranking
              </h1>
              <p className="text-sm text-muted-foreground">Veja sua posição entre os alunos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* User's Position Card */}
        {userRank && (
          <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-background border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">#{userRank.rank}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sua posição</p>
                    <p className="text-lg font-bold text-foreground">{userRank.student_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{userRank.total_points} XP</Badge>
                      <Badge variant="outline">Nível {userRank.current_level}</Badge>
                      <Badge variant="outline" className="gap-1">
                        <Trophy className="h-3 w-3" /> {userRank.badges_count}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>{userRank.current_streak} dias de sequência</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{leaderboard.length}</p>
              <p className="text-xs text-muted-foreground">Participantes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {leaderboard[0]?.total_points || 0}
              </p>
              <p className="text-xs text-muted-foreground">Maior pontuação</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Crown className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {leaderboard[0]?.current_level || 1}
              </p>
              <p className="text-xs text-muted-foreground">Maior nível</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-8 w-8 mx-auto text-orange-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {Math.max(...leaderboard.map(l => l.current_streak), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Maior sequência</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v: 'points' | 'level' | 'streak' | 'lessons') => setFilter(v)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="points" className="gap-1">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Pontos</span>
            </TabsTrigger>
            <TabsTrigger value="level" className="gap-1">
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Nível</span>
            </TabsTrigger>
            <TabsTrigger value="streak" className="gap-1">
              <Flame className="h-4 w-4" />
              <span className="hidden sm:inline">Sequência</span>
            </TabsTrigger>
            <TabsTrigger value="lessons" className="gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Aulas</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Leaderboard List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Top Alunos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum aluno no ranking ainda</p>
              </div>
            ) : (
              leaderboard.map((entry) => (
                <div
                  key={entry.student_id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    entry.student_id === currentUserId 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : getRankBg(entry.rank)
                  }`}
                >
                  {/* Rank */}
                  <div className="w-10 h-10 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={entry.rank <= 3 ? 'bg-primary/20 text-primary' : ''}>
                      {getInitials(entry.student_name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {entry.student_name}
                      {entry.student_id === currentUserId && (
                        <Badge variant="secondary" className="ml-2 text-xs">Você</Badge>
                      )}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Nível {entry.current_level}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" /> {entry.badges_count}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" /> {entry.current_streak}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{getMetricValue(entry)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
