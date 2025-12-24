import { supabase } from "@/integrations/supabase/client";
import { logActionDirect } from "@/hooks/useAuditLog";

interface EnrollmentEligibility {
    can_enroll: boolean;
    reason: string;
    has_permission: boolean;
    incomplete_courses: number;
    current_enrollments: number;
}

interface EnrollStudentParams {
    studentId: string;
    courseId: string;
    enrolledBy: string;
    notes?: string;
    requiresCompletion?: boolean;
    passingScore?: number;
    maxExamAttempts?: number;
}

interface BulkEnrollParams {
    studentIds: string[];
    courseId: string;
    enrolledBy: string;
    notes?: string;
    requiresCompletion?: boolean;
}

interface GrantPermissionParams {
    studentId: string;
    grantedBy: string;
    reason: string;
    allowMultipleCourses?: boolean;
    specificCourses?: string[];
    maxConcurrentCourses?: number;
    expiresAt?: Date;
}

interface CompleteCourseParams {
    enrollmentId: string;
    examScore: number;
}

export const enrollmentService = {
    /**
     * Check if a student can enroll in a course
     */
    async checkEligibility(
        studentId: string,
        courseId: string
    ): Promise<EnrollmentEligibility> {
        try {
            const { data, error } = await supabase.rpc("can_student_enroll", {
                p_student_id: studentId,
                p_course_id: courseId,
            });

            if (error) throw error;

            return data[0] || {
                can_enroll: false,
                reason: "Erro ao verificar elegibilidade",
                has_permission: false,
                incomplete_courses: 0,
                current_enrollments: 0,
            };
        } catch (error) {
            console.error("Error checking eligibility:", error);
            return {
                can_enroll: false,
                reason: "Erro ao verificar elegibilidade",
                has_permission: false,
                incomplete_courses: 0,
                current_enrollments: 0,
            };
        }
    },

    /**
     * Enroll a single student in a course
     */
    async enrollStudent(params: EnrollStudentParams): Promise<{
        success: boolean;
        message: string;
        enrollmentId?: string;
    }> {
        

        try {
            // Check if already enrolled
            const { data: existing } = await supabase
                .from("student_enrollments")
                .select("id, is_active")
                .eq("student_id", params.studentId)
                .eq("course_id", params.courseId)
                .single();

            if (existing?.is_active) {
                return {
                    success: false,
                    message: "Aluno já está matriculado neste curso",
                };
            }

            // Create enrollment
            const { data: enrollment, error } = await supabase
                .from("student_enrollments")
                .insert({
                    student_id: params.studentId,
                    course_id: params.courseId,
                    enrolled_by: params.enrolledBy,
                    enrollment_type: "manual",
                    enrollment_notes: params.notes || null,
                    requires_completion: params.requiresCompletion ?? true,
                    passing_score: params.passingScore || 70.0,
                    max_exam_attempts: params.maxExamAttempts || null,
                    is_active: true,
                })
                .select()
                .single();

            if (error) throw error;

            // Log audit trail
            await logActionDirect({
                tableName: "student_enrollments",
                recordId: enrollment.id,
                action: "INSERT",
                newValues: {
                    student_id: params.studentId,
                    course_id: params.courseId,
                    enrolled_by: params.enrolledBy,
                },
                metadata: {
                    enrollment_type: "manual",
                    notes: params.notes,
                },
            });

            return {
                success: true,
                message: "Aluno matriculado com sucesso!",
                enrollmentId: enrollment.id,
            };
        } catch (error) {
            console.error("Error enrolling student:", error);
            return {
                success: false,
                message: "Erro ao matricular aluno",
            };
        }
    },

    /**
     * Enroll multiple students in a course (bulk enrollment)
     */
    async bulkEnroll(params: BulkEnrollParams): Promise<{
        successful: Array<{ studentId: string; enrollmentId: string }>;
        failed: Array<{ studentId: string; reason: string }>;
    }> {
        
        const successful: Array<{ studentId: string; enrollmentId: string }> = [];
        const failed: Array<{ studentId: string; reason: string }> = [];

        for (const studentId of params.studentIds) {
            try {
                // Check eligibility
                const eligibility = await this.checkEligibility(
                    studentId,
                    params.courseId
                );

                if (!eligibility.can_enroll) {
                    failed.push({
                        studentId,
                        reason: eligibility.reason,
                    });
                    continue;
                }

                // Check if already enrolled
                const { data: existing } = await supabase
                    .from("student_enrollments")
                    .select("id, is_active")
                    .eq("student_id", studentId)
                    .eq("course_id", params.courseId)
                    .single();

                if (existing?.is_active) {
                    failed.push({
                        studentId,
                        reason: "Já matriculado",
                    });
                    continue;
                }

                // Create enrollment
                const { data: enrollment, error } = await supabase
                    .from("student_enrollments")
                    .insert({
                        student_id: studentId,
                        course_id: params.courseId,
                        enrolled_by: params.enrolledBy,
                        enrollment_type: "bulk",
                        enrollment_notes: params.notes || null,
                        requires_completion: params.requiresCompletion ?? true,
                        is_active: true,
                    })
                    .select()
                    .single();

                if (error) throw error;

                successful.push({
                    studentId,
                    enrollmentId: enrollment.id,
                });

                // Log audit trail
                await logActionDirect({
                    tableName: "student_enrollments",
                    recordId: enrollment.id,
                    action: "INSERT",
                    newValues: {
                        student_id: studentId,
                        course_id: params.courseId,
                    },
                    metadata: {
                        enrollment_type: "bulk",
                        bulk_count: params.studentIds.length,
                    },
                });
            } catch (error) {
                console.error(`Error enrolling student ${studentId}:`, error);
                failed.push({
                    studentId,
                    reason: "Erro ao processar matrícula",
                });
            }
        }

        return { successful, failed };
    },

    /**
     * Grant special enrollment permission to a student
     */
    async grantPermission(params: GrantPermissionParams): Promise<{
        success: boolean;
        message: string;
        permissionId?: string;
    }> {
        

        try {
            // Get granter's role
            const { data: roleData } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", params.grantedBy)
                .single();

            const { data: permission, error } = await supabase
                .from("enrollment_permissions")
                .insert({
                    student_id: params.studentId,
                    granted_by: params.grantedBy,
                    granted_by_role: roleData?.role || "unknown",
                    reason: params.reason,
                    allow_multiple_courses: params.allowMultipleCourses ?? true,
                    specific_courses: params.specificCourses || [],
                    max_concurrent_courses: params.maxConcurrentCourses || null,
                    expires_at: params.expiresAt?.toISOString() || null,
                    is_active: true,
                })
                .select()
                .single();

            if (error) throw error;

            // Log audit trail
            await logActionDirect({
                tableName: "enrollment_permissions",
                recordId: permission.id,
                action: "INSERT",
                newValues: {
                    student_id: params.studentId,
                    granted_by: params.grantedBy,
                    reason: params.reason,
                },
                metadata: {
                    permission_type: "enrollment",
                    allow_multiple: params.allowMultipleCourses,
                },
            });

            return {
                success: true,
                message: "Permissão concedida com sucesso!",
                permissionId: permission.id,
            };
        } catch (error) {
            console.error("Error granting permission:", error);
            return {
                success: false,
                message: "Erro ao conceder permissão",
            };
        }
    },

    /**
     * Revoke an enrollment permission
     */
    async revokePermission(
        permissionId: string,
        revokedBy: string,
        reason: string
    ): Promise<{ success: boolean; message: string }> {
        

        try {
            const { error } = await supabase
                .from("enrollment_permissions")
                .update({
                    is_active: false,
                    revoked_at: new Date().toISOString(),
                    revoked_by: revokedBy,
                    revoke_reason: reason,
                })
                .eq("id", permissionId);

            if (error) throw error;

            // Log audit trail
            await logActionDirect({
                tableName: "enrollment_permissions",
                recordId: permissionId,
                action: "UPDATE",
                oldValues: { is_active: true },
                newValues: { is_active: false, revoke_reason: reason },
                metadata: {
                    action_type: "revoke_permission",
                },
            });

            return {
                success: true,
                message: "Permissão revogada com sucesso!",
            };
        } catch (error) {
            console.error("Error revoking permission:", error);
            return {
                success: false,
                message: "Erro ao revogar permissão",
            };
        }
    },

    /**
     * Complete a course enrollment (after passing exam)
     */
    async completeCourse(params: CompleteCourseParams): Promise<{
        success: boolean;
        message: string;
        is_approved: boolean;
    }> {
        

        try {
            const { data, error } = await supabase.rpc("complete_course_enrollment", {
                p_enrollment_id: params.enrollmentId,
                p_exam_score: params.examScore,
            });

            if (error) throw error;

            const result = data[0];

            // Log audit trail
            await logActionDirect({
                tableName: "student_enrollments",
                recordId: params.enrollmentId,
                action: "UPDATE",
                newValues: {
                    final_exam_score: params.examScore,
                    completed_at: result.is_approved ? new Date().toISOString() : null,
                },
                metadata: {
                    exam_score: params.examScore,
                    is_approved: result.is_approved,
                },
            });

            return result;
        } catch (error) {
            console.error("Error completing course:", error);
            return {
                success: false,
                message: "Erro ao processar conclusão do curso",
                is_approved: false,
            };
        }
    },

    /**
     * Get student's active enrollments
     */
    async getStudentEnrollments(studentId: string) {
        try {
            const { data, error } = await supabase
                .from("student_enrollments")
                .select(`
          *,
          courses (
            id,
            title,
            description,
            thumbnail_url,
            duration_months,
            total_hours
          )
        `)
                .eq("student_id", studentId)
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error fetching enrollments:", error);
            return [];
        }
    },

    /**
     * Get student's enrollment permissions
     */
    async getStudentPermissions(studentId: string) {
        try {
            const { data, error } = await supabase
                .from("enrollment_permissions")
                .select("*")
                .eq("student_id", studentId)
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error fetching permissions:", error);
            return [];
        }
    },
};
