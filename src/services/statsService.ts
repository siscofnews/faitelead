// Statistics Service for Backend API Integration
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8090';

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
    private async fetchAPI<T>(endpoint: string): Promise<T> {
        try {
            const response = await fetch(`${BACKEND_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            throw error;
        }
    }

    async getAdminDashboardStats(params?: {
        polo_id?: string;
        nucleo_id?: string;
    }): Promise<AdminDashboardStats> {
        const queryParams = new URLSearchParams();
        if (params?.polo_id) queryParams.append('polo_id', params.polo_id);
        if (params?.nucleo_id) queryParams.append('nucleo_id', params.nucleo_id);

        const query = queryParams.toString();
        return this.fetchAPI<AdminDashboardStats>(
            `/stats/admin-dashboard${query ? `?${query}` : ''}`
        );
    }

    async getCourseStats(courseId: string): Promise<CourseStats> {
        return this.fetchAPI<CourseStats>(`/stats/course/${courseId}`);
    }

    async getProfessorStats(professorId: string): Promise<ProfessorStats> {
        return this.fetchAPI<ProfessorStats>(`/stats/professor/${professorId}`);
    }

    async getSystemStats(): Promise<SystemStats> {
        return this.fetchAPI<SystemStats>('/stats/system');
    }

    async getEnrollmentTrend(params?: {
        days?: number;
        polo_id?: string;
    }): Promise<EnrollmentTrend> {
        const queryParams = new URLSearchParams();
        if (params?.days) queryParams.append('days', params.days.toString());
        if (params?.polo_id) queryParams.append('polo_id', params.polo_id);

        const query = queryParams.toString();
        return this.fetchAPI<EnrollmentTrend>(
            `/stats/enrollments-trend${query ? `?${query}` : ''}`
        );
    }
}

export const statsService = new StatsService();
