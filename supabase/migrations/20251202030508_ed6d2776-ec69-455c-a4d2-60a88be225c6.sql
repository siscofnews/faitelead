-- Add policy to allow viewing leaderboard data (only gamification stats, not private info)
CREATE POLICY "Students can view leaderboard" ON public.student_gamification 
FOR SELECT USING (true);

-- Also allow viewing earned badges count for leaderboard
CREATE POLICY "Students can view all badges for leaderboard" ON public.student_badges 
FOR SELECT USING (true);