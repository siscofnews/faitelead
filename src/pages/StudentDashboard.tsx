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

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
}

const StudentDashboard = () => {
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
      type EnrollmentRow = { courses?: Course | null };
      const courses = (enrollments as EnrollmentRow[]).map((e) => e.courses!).filter(Boolean);
      // Remove duplicates just in case
      const uniqueCourses = Array.from(new Map(courses.map(item => [item['id'], item])).values());
      setEnrolledCourses(uniqueCourses);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Logout realizado com sucesso!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-primary-foreground text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <WelcomeCard
        userName={profile?.full_name || "Aluno"}
        coursesCount={enrolledCourses.length}
        modulesCompleted={0}
        studyHours={0}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses Section - 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-foreground">Meus Cursos</h2>
            <button className="text-sm text-primary hover:underline">Ver todos</button>
          </div>

          {enrolledCourses.length === 0 ? (
            <Card className="border-dashed border-2 border-muted">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BookOpen className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  Nenhum curso matriculado
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Entre em contato com a secretaria para realizar sua matrícula em um de nossos cursos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {enrolledCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  thumbnailUrl={course.thumbnail_url}
                  progress={Math.floor(Math.random() * 80)}
                  lessonsCount={24}
                  duration="12 meses"
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Content - 1 column */}
        <div className="space-y-6">
          <GamificationCard />
          <RecentActivity />
          <Announcements />
        </div>
      </div>

      {/* Book Gallery */}
      <BookGallery />
    </div>
  );
};

export default StudentDashboard;
