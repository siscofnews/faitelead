
import { supabase } from "@/integrations/supabase/client";

export interface AdminDashboardStats {
    total_students: number;
    total_courses: number;
    active_enrollments: number;
    pending_payments: number;
    total_revenue: number;
    new_students_this_month: number;
    completion_rate: number;
}

export interface CourseStats {
    course_id: string;
    total_enrolled: number;
    active_students: number;
    completion_rate: number;
    average_grade: number;
    total_modules: number;
    dropout_rate: number;
}

export interface ProfessorStats {
    professor_id: string;
    courses_teaching: number;
    total_students: number;
    average_student_grade: number;
    pending_exams: number;
}

export interface SystemStats {
    total_users: number;
    total_polos: number;
    total_nucleos: number;
    total_courses: number;
    active_enrollments: number;
    system_health: string;
    database_size_mb: number;
}

export interface EnrollmentTrend {
    trend: Array<{ date: string; count: number }>;
    total_period: number;
    growth_percentage: number;
}

class StatsService {
    
    async getAdminDashboardStats(params?: {
        polo_id?: string;
        nucleo_id?: string;
    }): Promise<AdminDashboardStats> {
        try {
            // Parallel requests for counts
            const [
                { count: totalStudents },
                { count: totalCourses },
                { count: activeEnrollments },
                { count: pendingPayments },
                { data: payments }
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
                supabase.from('courses').select('*', { count: 'exact', head: true }),
                supabase.from('student_enrollments').select('*', { count: 'exact', head: true }).eq('is_active', true),
                supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('payments').select('amount').eq('status', 'paid').limit(1000) // Limit for performance
            ]);

            // Calculate revenue client-side (approximation based on last 1000 payments)
            const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

            // New students this month
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            
            const { count: newStudents } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'student')
                .gte('created_at', startOfMonth.toISOString());

            return {
                total_students: totalStudents || 0,
                total_courses: totalCourses || 0,
                active_enrollments: activeEnrollments || 0,
                pending_payments: pendingPayments || 0,
                total_revenue: totalRevenue,
                new_students_this_month: newStudents || 0,
                completion_rate: 0 // Requires complex calculation, returning 0 for now
            };
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            // Return empty stats on error to prevent crash
            return {
                total_students: 0,
                total_courses: 0,
                active_enrollments: 0,
                pending_payments: 0,
                total_revenue: 0,
                new_students_this_month: 0,
                completion_rate: 0
            };
        }
    }

    async getCourseStats(courseId: string): Promise<CourseStats> {
        try {
            const [
                { count: totalEnrolled },
                { count: activeStudents },
                { count: totalModules }
            ] = await Promise.all([
                supabase.from('student_enrollments').select('*', { count: 'exact', head: true }).eq('course_id', courseId),
                supabase.from('student_enrollments').select('*', { count: 'exact', head: true }).eq('course_id', courseId).eq('is_active', true),
                supabase.from('modules').select('*', { count: 'exact', head: true }).eq('course_id', courseId)
            ]);

            return {
                course_id: courseId,
                total_enrolled: totalEnrolled || 0,
                active_students: activeStudents || 0,
                completion_rate: 0,
                average_grade: 0,
                total_modules: totalModules || 0,
                dropout_rate: 0
            };
        } catch (error) {
            console.error(`Error fetching stats for course ${courseId}:`, error);
            return {
                course_id: courseId,
                total_enrolled: 0,
                active_students: 0,
                completion_rate: 0,
                average_grade: 0,
                total_modules: 0,
                dropout_rate: 0
            };
        }
    }

    async getProfessorStats(professorId: string): Promise<ProfessorStats> {
        // This would require filtering courses by professor, which might be complex depending on schema
        // Returning basic stats for now
        return {
            professor_id: professorId,
            courses_teaching: 0,
            total_students: 0,
            average_student_grade: 0,
            pending_exams: 0
        };
    }

    async getSystemStats(): Promise<SystemStats> {
        try {
            const [
                { count: totalUsers },
                { count: totalPolos },
                { count: totalCourses },
                { count: activeEnrollments }
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('polos').select('*', { count: 'exact', head: true }),
                supabase.from('courses').select('*', { count: 'exact', head: true }),
                supabase.from('student_enrollments').select('*', { count: 'exact', head: true }).eq('is_active', true)
            ]);

            return {
                total_users: totalUsers || 0,
                total_polos: totalPolos || 0,
                total_nucleos: 0, // Nucleos concept might need clarification in schema
                total_courses: totalCourses || 0,
                active_enrollments: activeEnrollments || 0,
                system_health: 'Healthy',
                database_size_mb: 0 // Not accessible from client
            };
        } catch (error) {
            console.error('Error fetching system stats:', error);
            return {
                total_users: 0,
                total_polos: 0,
                total_nucleos: 0,
                total_courses: 0,
                active_enrollments: 0,
                system_health: 'Unknown',
                database_size_mb: 0
            };
        }
    }

    async getEnrollmentTrend(params?: {
        days?: number;
        polo_id?: string;
    }): Promise<EnrollmentTrend> {
        // Mock implementation for trend as it requires complex grouping
        return {
            trend: [],
            total_period: 0,
            growth_percentage: 0
        };
    }
}

export const statsService = new StatsService();
