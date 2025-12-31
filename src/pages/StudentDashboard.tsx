import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGamification } from "@/hooks/useGamification";

import WelcomeCard from "@/components/dashboard/WelcomeCard";
import QuickActions from "@/components/dashboard/QuickActions";
import CourseCard from "@/components/dashboard/CourseCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import Announcements from "@/components/dashboard/Announcements";
import BookGallery from "@/components/BookGallery";
import GamificationCard from "@/components/dashboard/GamificationCard";
import { useI18n } from "@/i18n/I18nProvider";
import { MessageSquare, PlayCircle } from "lucide-react"; // Added imports

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  professor?: string; // Added prop
}

const StudentDashboard = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  type ProfileMin = { full_name?: string } | null;
  const [profile, setProfile] = useState<ProfileMin>(null);
  const [userRole, setUserRole] = useState<string>("student");
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const { initializeGamification } = useGamification();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(profileData);

    // Fetch user role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData) {
      setUserRole(roleData.role);

      // Redirect admin/super_admin users to admin dashboard
      if (roleData.role === "admin" || roleData.role === "super_admin") {
        navigate("/admin");
        return;
      }

      // Initialize gamification for students
      if (roleData.role === "student") {
        await initializeGamification(user.id);
      }
    }

    const { data: enrollments } = await supabase
      .from("student_enrollments")
      .select(`
        course_id,
        courses (
          id,
          title,
          description,
          thumbnail_url
        )
      `)
      .eq("student_id", user.id)
      .eq("is_active", true);

    if (enrollments) {
      const courses = (enrollments as any[]).map((e) => e.courses).filter(Boolean) as Course[];
      // Remove duplicates just in case
      const uniqueCourses = Array.from(new Map(courses.map(item => [item['id'], item])).values());
      setEnrolledCourses(uniqueCourses);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success(t("common.logout_success"));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-primary-foreground text-lg font-medium">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section - Estilo EAD Guru / Netflix */}
      {enrolledCourses.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-10" />
          <img
            src={enrolledCourses[0].thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop"}
            alt="Hero Course"
            className="w-full h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute bottom-0 left-0 p-8 z-20 max-w-2xl space-y-4">
            <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-bold rounded-full uppercase tracking-wider">
              {t("dashboards.student.continue_watching")}
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white drop-shadow-lg">
              {enrolledCourses[0].title}
            </h1>
            <p className="text-gray-200 text-lg line-clamp-2 drop-shadow-md">
              {enrolledCourses[0].description}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => navigate(`/course/${enrolledCourses[0].id}`)}
                className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-all hover:scale-105 shadow-lg shadow-primary/25"
              >
                <PlayCircle className="w-6 h-6" />
                {t("dashboards.student.continue_lesson")}
              </button>
              <button
                onClick={() => navigate("/student/courses")}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg font-medium backdrop-blur-sm transition-all"
              >
                {t("dashboards.student.view_full_grade")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Principal (Cursos) - 8 colunas */}
        <div className="lg:col-span-8 space-y-8">

          {/* Seção Meus Cursos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                {t("dashboards.student.my_courses")}
              </h2>
            </div>

            {enrolledCourses.length === 0 ? (
              <Card className="border-dashed border-2 border-muted bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <BookOpen className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                    {t("dashboards.student.no_courses")}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    {t("dashboards.student.no_courses_desc")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    thumbnailUrl={course.thumbnail_url}
                    progress={Math.floor(Math.random() * 80)} // Simulação de progresso
                    lessonsCount={24}
                    duration="12 meses"
                    professor={course.professor || "Prof. Valmir Santos"} // Nome do professor
                  />
                ))}
              </div>
            )}
          </div>

          {/* Seção Comunidade / Forum */}
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              {t("dashboards.student.academic_community")}
            </h2>
            <Card className="bg-gradient-to-br from-card to-muted border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="hidden md:flex w-24 h-24 rounded-2xl bg-primary/10 items-center justify-center shrink-0">
                    <MessageSquare className="w-10 h-10 text-primary" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xl font-semibold">{t("dashboards.student.forum_title")}</h3>
                    <p className="text-muted-foreground">
                      {t("dashboards.student.forum_desc")}
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => navigate("/forum/student")}
                        className="text-primary font-medium hover:underline flex items-center gap-2"
                      >
                        {t("dashboards.student.access_forum")} <BookOpen className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <BookGallery />
        </div>

        {/* Sidebar Lateral - 4 colunas */}
        <div className="lg:col-span-4 space-y-6">
          <WelcomeCard
            userName={profile?.full_name || "Aluno"}
            coursesCount={enrolledCourses.length}
            modulesCompleted={0}
            studyHours={0}
          />
          <QuickActions />
          <GamificationCard />
          <RecentActivity />
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
