import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  requirement_type: string;
  requirement_value: number;
}

export const useGamification = () => {
  const initializeGamification = async (userId: string) => {
    const { data: existing } = await supabase
      .from('student_gamification')
      .select('id')
      .eq('student_id', userId)
      .single();

    if (!existing) {
      await supabase
        .from('student_gamification')
        .insert({ student_id: userId });
    }
  };

  const updateStreak = async (userId: string) => {
    const { data: gamification } = await supabase
      .from('student_gamification')
      .select('*')
      .eq('student_id', userId)
      .single();

    if (!gamification) {
      await initializeGamification(userId);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = gamification.last_activity_date;

    if (lastActivity === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (lastActivity === yesterdayStr) {
      newStreak = gamification.current_streak + 1;
    }

    const longestStreak = Math.max(newStreak, gamification.longest_streak);

    await supabase
      .from('student_gamification')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today
      })
      .eq('student_id', userId);

    await checkAndAwardBadges(userId);
  };

  const addPoints = async (userId: string, points: number) => {
    const { data: gamification } = await supabase
      .from('student_gamification')
      .select('*')
      .eq('student_id', userId)
      .single();

    if (!gamification) {
      await initializeGamification(userId);
      return;
    }

    const newPoints = gamification.total_points + points;
    const newLevel = Math.floor(newPoints / 100) + 1;

    await supabase
      .from('student_gamification')
      .update({
        total_points: newPoints,
        current_level: newLevel
      })
      .eq('student_id', userId);

    if (newLevel > gamification.current_level) {
      toast({
        title: '🎉 Nível Up!',
        description: `Parabéns! Você alcançou o nível ${newLevel}!`,
      });
    }

    await checkAndAwardBadges(userId);
  };

  const recordLessonCompletion = async (userId: string) => {
    await updateStreak(userId);

    const { data: gamification } = await supabase
      .from('student_gamification')
      .select('*')
      .eq('student_id', userId)
      .single();

    if (!gamification) {
      await initializeGamification(userId);
      await supabase
        .from('student_gamification')
        .update({ lessons_completed: 1 })
        .eq('student_id', userId);
    } else {
      await supabase
        .from('student_gamification')
        .update({ lessons_completed: gamification.lessons_completed + 1 })
        .eq('student_id', userId);
    }

    await addPoints(userId, 10);
    await checkAndAwardBadges(userId);
  };

  const recordExamPassed = async (userId: string, score: number) => {
    const { data: gamification } = await supabase
      .from('student_gamification')
      .select('*')
      .eq('student_id', userId)
      .single();

    if (!gamification) {
      await initializeGamification(userId);
      return;
    }

    const updates: Record<string, number> = {
      exams_passed: gamification.exams_passed + 1
    };

    if (score === 100) {
      updates.perfect_scores = gamification.perfect_scores + 1;
      await addPoints(userId, 75);
    } else {
      await addPoints(userId, 25);
    }

    await supabase
      .from('student_gamification')
      .update(updates)
      .eq('student_id', userId);

    await checkAndAwardBadges(userId);
  };

  const recordCertificateEarned = async (userId: string) => {
    const { data: gamification } = await supabase
      .from('student_gamification')
      .select('*')
      .eq('student_id', userId)
      .single();

    if (!gamification) {
      await initializeGamification(userId);
      return;
    }

    await supabase
      .from('student_gamification')
      .update({ certificates_earned: gamification.certificates_earned + 1 })
      .eq('student_id', userId);

    await addPoints(userId, 500);
    await checkAndAwardBadges(userId);
  };

  const checkAndAwardBadges = async (userId: string) => {
    const { data: gamification } = await supabase
      .from('student_gamification')
      .select('*')
      .eq('student_id', userId)
      .single();

    if (!gamification) return;

    const { data: allBadges } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true);

    const { data: earnedBadges } = await supabase
      .from('student_badges')
      .select('badge_id')
      .eq('student_id', userId);

    const earnedBadgeIds = new Set(earnedBadges?.map(b => b.badge_id) || []);

    for (const badge of allBadges || []) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let earned = false;
      const value = gamification[badge.requirement_type as keyof typeof gamification] as number;

      if (typeof value === 'number' && value >= badge.requirement_value) {
        earned = true;
      }

      if (earned) {
        await awardBadge(userId, badge as Badge);
      }
    }
  };

  const awardBadge = async (userId: string, badge: Badge) => {
    const { error } = await supabase
      .from('student_badges')
      .insert({
        student_id: userId,
        badge_id: badge.id
      });

    if (!error) {
      toast({
        title: '🏆 Novo Badge Conquistado!',
        description: `Você desbloqueou "${badge.name}" e ganhou ${badge.points} XP!`,
      });

      await addPoints(userId, badge.points);
    }
  };

  return {
    initializeGamification,
    updateStreak,
    addPoints,
    recordLessonCompletion,
    recordExamPassed,
    recordCertificateEarned,
    checkAndAwardBadges
  };
};
