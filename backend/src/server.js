import Fastify from "fastify"
import cors from "@fastify/cors"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { store } from "./store.js"
import { supabase, isSupabaseConnected } from "./supabase-client.js"
import "dotenv/config"

const app = Fastify({ logger: true })
await app.register(cors, { origin: true })

const tenants = store.get("tenants")
const courses = store.get("courses")
const modules = store.get("modules")
const subjects = store.get("subjects")
const contents = store.get("contents")
const enrollments = store.get("enrollments")
const exams = store.get("exams")
const exam_results = store.get("exam_results")
const gallery = store.get("gallery")

app.get("/health", async () => ({ status: "ok" }))

app.post("/auth/login", async (req, reply) => {
  const { email, password } = req.body || {}
  if (!email || !password) return reply.code(400).send({ error: "invalid" })
  return { user: { id: "u-demo", email }, roles: ["super_admin", "admin"] }
})

app.get("/tenants", async () => tenants)
app.get("/courses", async (req) => {
  const t = req.query?.tenant_id
  const active = req.query?.is_active
  let rows = courses
  if (t) rows = rows.filter(c => c.tenant_id === t)
  if (typeof active !== "undefined") rows = rows.filter(c => String(c.is_active) === String(active))
  return rows
})
app.patch("/courses/:id", async (req, reply) => {
  const id = req.params.id
  const patch = req.body || {}
  const count = store.update("courses", r => r.id === id, patch)
  if (!count) return reply.code(404).send({ error: "not_found" })
  return { id }
})
app.delete("/courses/:id", async (req, reply) => {
  const id = req.params.id
  const count = store.remove("courses", r => r.id === id)
  if (!count) return reply.code(404).send({ error: "not_found" })
  return { id }
})
app.get("/modules", async (req) => {
  const c = req.query?.course_id
  const s = req.query?.subject_id
  if (c) return modules.filter(m => m.course_id === c)
  if (s) return modules.filter(m => m.subject_id === s)
  return modules
})
app.get("/modules/:id", async (req, reply) => {
  const id = req.params.id
  const m = modules.find(x => x.id === id)
  if (!m) return reply.code(404).send({ error: "not_found" })
  return m
})
app.post("/courses", async (req) => {
  const payload = req.body || {}
  const id = crypto.randomUUID()
  const row = {
    id,
    tenant_id: payload.tenant_id || "tenant-1",
    title: payload.title || "Novo Curso",
    description: payload.description || null,
    duration_months: payload.duration_months ?? 12,
    total_hours: payload.total_hours ?? 0,
    monthly_price: payload.monthly_price ?? 0,
    modality: payload.modality || "ead",
    thumbnail_url: payload.thumbnail_url || null,
    is_active: payload.is_active ?? true
  }
  store.insert("courses", row)
  return { id }
})
app.post("/modules", async (req) => {
  const payload = req.body || {}
  const id = crypto.randomUUID()
  const row = { id, course_id: payload.course_id || "course-1", subject_id: payload.subject_id, title: payload.title || "Novo Módulo", order_index: payload.order_index || 1, description: payload.description || "" }
  store.insert("modules", row)
  return { id }
})
app.patch("/modules/:id", async (req, reply) => {
  const id = req.params.id
  const patch = req.body || {}
  const count = store.update("modules", r => r.id === id, patch)
  if (!count) return reply.code(404).send({ error: "not_found" })
  return { id }
})
app.delete("/modules/:id", async (req, reply) => {
  const id = req.params.id
  const count = store.remove("modules", r => r.id === id)
  if (!count) return reply.code(404).send({ error: "not_found" })
  return { id }
})

app.get("/subjects", async (req) => {
  const c = req.query?.course_id
  if (c) return subjects.filter(s => s.course_id === c)
  return subjects
})
app.get("/subjects/:id", async (req, reply) => {
  const id = req.params.id
  const s = subjects.find(x => x.id === id)
  if (!s) return reply.code(404).send({ error: "not_found" })
  return s
})
app.post("/subjects", async (req) => {
  const payload = req.body || {}
  const id = crypto.randomUUID()
  const row = { id, course_id: payload.course_id || "course-1", title: payload.title || "Nova Matéria", order: payload.order || 1 }
  store.insert("subjects", row)
  return { id }
})

app.get("/contents", async (req) => {
  const m = req.query?.module_id
  if (m) return contents.filter(ct => ct.module_id === m)
  return contents
})
app.post("/contents", async (req) => {
  const payload = req.body || {}
  const id = crypto.randomUUID()
  const row = {
    id,
    module_id: payload.module_id || "module-1",
    content_type: payload.content_type || "pdf",
    title: payload.title || "Conteúdo",
    url: payload.url || "/media/resource.pdf",
    order: payload.order || 1,
    is_required: payload.is_required ?? false,
    duration_minutes: payload.duration_minutes ?? null,
    payload: payload.payload || null
  }
  store.insert("contents", row)
  return { id }
})
app.patch("/contents/:id", async (req, reply) => {
  const id = req.params.id
  const patch = req.body || {}
  const count = store.update("contents", r => r.id === id, patch)
  if (!count) return reply.code(404).send({ error: "not_found" })
  return { id }
})
app.delete("/contents/:id", async (req, reply) => {
  const id = req.params.id
  const count = store.remove("contents", r => r.id === id)
  if (!count) return reply.code(404).send({ error: "not_found" })
  return { id }
})

app.get("/enrollments", async (req) => {
  const s = req.query?.student_id
  const c = req.query?.course_id
  let rows = enrollments
  if (s) rows = rows.filter(e => e.student_id === s)
  if (c) rows = rows.filter(e => e.course_id === c)
  return rows
})
app.post("/enrollments", async (req) => {
  const payload = req.body || {}
  const id = crypto.randomUUID()
  const row = {
    id,
    student_id: payload.student_id,
    course_id: payload.course_id,
    is_active: payload.is_active ?? true,
    enrolled_at: new Date().toISOString()
  }
  store.insert("enrollments", row)
  return { id }
})
app.delete("/enrollments/:id", async (req, reply) => {
  const id = req.params.id
  const count = store.remove("enrollments", r => r.id === id)
  if (!count) return reply.code(404).send({ error: "not_found" })
  return { id }
})

app.get("/content-progress", async (req) => {
  const s = req.query?.student_id
  const c = req.query?.course_id
  let rows = store.get("content_progress")
  if (s) rows = rows.filter(p => p.student_id === s)
  if (c) {
    const courseContentIds = contents.filter(ct => modules.find(m => m.id === ct.module_id)?.course_id === c).map(ct => ct.id)
    rows = rows.filter(p => courseContentIds.includes(p.content_id))
  }
  return rows
})
app.post("/content-progress", async (req) => {
  const payload = req.body || {}
  const id = crypto.randomUUID()
  const row = { id, student_id: payload.student_id, content_id: payload.content_id, completed: payload.completed ?? true, updated_at: new Date().toISOString() }
  store.insert("content_progress", row)
  return { id }
})
app.patch("/content-progress/:id", async (req, reply) => {
  const id = req.params.id
  const patch = req.body || {}
  const count = store.update("content_progress", r => r.id === id, { ...patch, updated_at: new Date().toISOString() })
  if (!count) return reply.code(404).send({ error: "not_found" })
  return { id }
})

app.get("/exams", async (req) => {
  const c = req.query?.course_id
  const m = req.query?.module_id
  let rows = exams
  if (c) rows = rows.filter(e => e.course_id === c)
  if (m) rows = rows.filter(e => e.module_id === m)
  return rows
})
app.post("/exams", async (req) => {
  const payload = req.body || {}
  const id = crypto.randomUUID()
  const row = {
    id,
    course_id: payload.course_id,
    module_id: payload.module_id || null,
    title: payload.title || "Prova",
    passing_score: payload.passing_score ?? 60,
    attempts: payload.attempts ?? 1,
    auto_grade: payload.auto_grade ?? true
  }
  store.insert("exams", row)
  return { id }
})
app.patch("/exams/:id", async (req, reply) => {
  const id = req.params.id
  const patch = req.body || {}
  const count = store.update("exams", r => r.id === id, patch)
  if (!count) return reply.code(404).send({ error: "not_found" })
  return { id }
})
app.delete("/exams/:id", async (req, reply) => {
  const id = req.params.id
  const count = store.remove("exams", r => r.id === id)
  if (!count) return reply.code(404).send({ error: "not_found" })
  return { id }
})
app.get("/exam-results", async (req) => {
  const s = req.query?.student_id
  const e = req.query?.exam_id
  let rows = exam_results
  if (s) rows = rows.filter(r => r.student_id === s)
  if (e) rows = rows.filter(r => r.exam_id === e)
  return rows
})
app.post("/exam-results", async (req) => {
  const payload = req.body || {}
  const id = crypto.randomUUID()
  const status = typeof payload.score === "number" ? (payload.score >= (payload.passing_score ?? 60) ? "approved" : "failed") : "pending"
  const row = {
    id,
    exam_id: payload.exam_id,
    student_id: payload.student_id,
    score: payload.score ?? null,
    status,
    attempt: payload.attempt ?? 1
  }
  store.insert("exam_results", row)
  return { id }
})
app.patch("/exam-results/:id", async (req, reply) => {
  const id = req.params.id
  const patch = req.body || {}
  const count = store.update("exam_results", r => r.id === id, patch)
  if (!count) return reply.code(404).send({ error: "not_found" })
  return { id }
})

app.get("/docs", async (req, reply) => {
  const yaml = readFileSync(join(process.cwd(), "backend", "openapi.yaml"), "utf8")
  reply.header("content-type", "text/yaml")
  return yaml
})

app.get("/gallery", async () => gallery)
app.post("/gallery", async (req) => {
  const payload = req.body || {}
  const id = crypto.randomUUID()
  const row = {
    id,
    url: payload.url,
    title: payload.title || null,
    created_at: new Date().toISOString()
  }
  store.insert("gallery", row)
  return { id }
})
app.delete("/gallery/:id", async (req, reply) => {
  const id = req.params.id
  const count = store.remove("gallery", r => r.id === id)
  if (!count) return reply.code(404).send({ error: "not_found" })
  return { id }
})

app.get("/student-stats", async (req, reply) => {
  const student_id = req.query?.student_id
  const course_id = req.query?.course_id
  if (!student_id || !course_id) return reply.code(400).send({ error: "missing_params" })
  const moduleIds = modules.filter(m => m.course_id === course_id).map(m => m.id)
  const courseContents = contents.filter(c => moduleIds.includes(c.module_id))
  const contentIds = courseContents.map(c => c.id)
  const progressRows = store.get("content_progress").filter(p => p.student_id === student_id && contentIds.includes(p.content_id) && p.completed)
  const total_lessons = courseContents.length
  const completed_lessons = progressRows.length
  const completion_rate = total_lessons ? Math.round((completed_lessons / total_lessons) * 100) : 0
  const courseExams = exams.filter(e => e.course_id === course_id || (e.module_id && moduleIds.includes(e.module_id)))
  const examIds = courseExams.map(e => e.id)
  const results = exam_results.filter(r => r.student_id === student_id && examIds.includes(r.exam_id))
  const exams_count = courseExams.length
  const exams_attempted = results.length
  const avg = results.length ? Math.round(results.reduce((s, r) => s + (Number(r.score) || 0), 0) / results.length) : null
  const passes = results.filter(r => r.status === "approved").length
  const pass_rate = results.length ? Math.round((passes / results.length) * 100) : 0
  const required_completed = courseContents.filter(c => c.is_required).map(c => c.id).every(id => progressRows.find(p => p.content_id === id))
  return {
    student_id,
    course_id,
    total_lessons,
    completed_lessons,
    completion_rate,
    exams_count,
    exams_attempted,
    average_score: avg,
    pass_rate,
    required_completed
  }
})

// ============================================================================
// STATISTICS ENDPOINTS
// ============================================================================

// Admin Dashboard Statistics
app.get("/stats/admin-dashboard", async (req, reply) => {
  try {
    if (!isSupabaseConnected()) {
      // Fallback to in-memory store
      return {
        total_students: store.get("enrollments").length,
        total_courses: courses.length,
        active_enrollments: enrollments.filter(e => e.is_active).length,
        pending_payments: 0,
        total_revenue: 0,
        new_students_this_month: 0,
        completion_rate: 0
      }
    }

    const { polo_id, nucleo_id, date_from, date_to } = req.query || {}

    // Total students
    let studentsQuery = supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "ALUNO")
      .eq("ativo", true)

    const { count: totalStudents } = await studentsQuery

    // Total courses
    let coursesQuery = supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)

    if (polo_id) coursesQuery = coursesQuery.eq("polo_id", polo_id)
    if (nucleo_id) coursesQuery = coursesQuery.eq("nucleo_id", nucleo_id)

    const { count: totalCourses } = await coursesQuery

    // Active enrollments
    let enrollmentsQuery = supabase
      .from("student_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)

    const { count: activeEnrollments } = await enrollmentsQuery

    // Pending payments
    const { count: pendingPayments } = await supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")

    // Total revenue
    const { data: payments } = await supabase
      .from("payments")
      .select("amount")
      .eq("status", "completed")

    const totalRevenue = payments?.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) || 0

    // New students this month
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const { count: newStudentsThisMonth } = await supabase
      .from("student_enrollments")
      .select("id", { count: "exact", head: true })
      .gte("enrolled_at", firstDayOfMonth.toISOString())

    // Completion rate (based on student progress)
    const { data: progressData } = await supabase
      .from("content_progress")
      .select("completed")

    const completedCount = progressData?.filter(p => p.completed).length || 0
    const totalProgress = progressData?.length || 1
    const completionRate = Math.round((completedCount / totalProgress) * 100)

    return {
      total_students: totalStudents || 0,
      total_courses: totalCourses || 0,
      active_enrollments: activeEnrollments || 0,
      pending_payments: pendingPayments || 0,
      total_revenue: totalRevenue,
      new_students_this_month: newStudentsThisMonth || 0,
      completion_rate: completionRate
    }
  } catch (error) {
    console.error("Error loading admin dashboard stats:", error)
    reply.code(500).send({ error: "Failed to load statistics" })
  }
})

// Course Statistics
app.get("/stats/course/:id", async (req, reply) => {
  try {
    const courseId = req.params.id

    if (!isSupabaseConnected()) {
      return {
        course_id: courseId,
        total_enrolled: 0,
        active_students: 0,
        completion_rate: 0,
        average_grade: 0,
        total_modules: 0,
        dropout_rate: 0
      }
    }

    // Total enrolled
    const { count: totalEnrolled } = await supabase
      .from("student_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("course_id", courseId)

    // Active students
    const { count: activeStudents } = await supabase
      .from("student_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("course_id", courseId)
      .eq("is_active", true)

    // Total modules
    const { count: totalModules } = await supabase
      .from("modules")
      .select("id", { count: "exact", head: true })
      .eq("course_id", courseId)

    // Get all content for this course
    const { data: modulesList } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", courseId)

    const moduleIds = modulesList?.map(m => m.id) || []

    // Completion rate
    let completionRate = 0
    if (moduleIds.length > 0) {
      const { data: courseContents } = await supabase
        .from("contents")
        .select("id")
        .in("module_id", moduleIds)

      const contentIds = courseContents?.map(c => c.id) || []

      if (contentIds.length > 0) {
        const { data: progressData } = await supabase
          .from("content_progress")
          .select("completed")
          .in("content_id", contentIds)

        const completedCount = progressData?.filter(p => p.completed).length || 0
        completionRate = Math.round((completedCount / (contentIds.length * (activeStudents || 1))) * 100)
      }
    }

    // Average grade from exam results
    const { data: examResults } = await supabase
      .from("exam_submissions")
      .select("score")
      .eq("course_id", courseId)
      .not("score", "is", null)

    const averageGrade = examResults?.length > 0
      ? Math.round(examResults.reduce((sum, r) => sum + parseFloat(r.score || 0), 0) / examResults.length * 10) / 10
      : 0

    // Dropout rate
    const dropoutRate = totalEnrolled > 0
      ? Math.round(((totalEnrolled - activeStudents) / totalEnrolled) * 100)
      : 0

    return {
      course_id: courseId,
      total_enrolled: totalEnrolled || 0,
      active_students: activeStudents || 0,
      completion_rate: completionRate,
      average_grade: averageGrade,
      total_modules: totalModules || 0,
      dropout_rate: dropoutRate
    }
  } catch (error) {
    console.error("Error loading course stats:", error)
    reply.code(500).send({ error: "Failed to load course statistics" })
  }
})

// Professor Statistics
app.get("/stats/professor/:id", async (req, reply) => {
  try {
    const professorId = req.params.id

    if (!isSupabaseConnected()) {
      return {
        professor_id: professorId,
        courses_teaching: 0,
        total_students: 0,
        average_student_grade: 0,
        pending_exams: 0
      }
    }

    // Get courses where professor is assigned
    const { data: professorCourses } = await supabase
      .from("user_roles")
      .select("curso_id")
      .eq("user_id", professorId)
      .eq("role", "PROFESSOR")
      .eq("active", true)

    const courseIds = professorCourses?.map(pc => pc.curso_id).filter(Boolean) || []
    const coursesTeaching = courseIds.length

    // Total students across all courses
    let totalStudents = 0
    if (courseIds.length > 0) {
      const { count } = await supabase
        .from("student_enrollments")
        .select("id", { count: "exact", head: true })
        .in("course_id", courseIds)
        .eq("is_active", true)

      totalStudents = count || 0
    }

    // Average student grade
    let averageStudentGrade = 0
    if (courseIds.length > 0) {
      const { data: examResults } = await supabase
        .from("exam_submissions")
        .select("score")
        .in("course_id", courseIds)
        .not("score", "is", null)

      if (examResults?.length > 0) {
        const total = examResults.reduce((sum, r) => sum + parseFloat(r.score || 0), 0)
        averageStudentGrade = Math.round((total / examResults.length) * 10) / 10
      }
    }

    // Pending exams to grade
    let pendingExams = 0
    if (courseIds.length > 0) {
      const { count } = await supabase
        .from("exam_submissions")
        .select("id", { count: "exact", head: true })
        .in("course_id", courseIds)
        .eq("status", "pending")

      pendingExams = count || 0
    }

    return {
      professor_id: professorId,
      courses_teaching: coursesTeaching,
      total_students: totalStudents,
      average_student_grade: averageStudentGrade,
      pending_exams: pendingExams
    }
  } catch (error) {
    console.error("Error loading professor stats:", error)
    reply.code(500).send({ error: "Failed to load professor statistics" })
  }
})

// System Statistics (SuperAdmin)
app.get("/stats/system", async (req, reply) => {
  try {
    if (!isSupabaseConnected()) {
      return {
        total_users: 0,
        total_polos: 0,
        total_nucleos: 0,
        total_courses: 0,
        active_enrollments: 0,
        system_health: "healthy",
        database_size_mb: 0
      }
    }

    // Total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("ativo", true)

    // Total polos
    const { count: totalPolos } = await supabase
      .from("polos")
      .select("id", { count: "exact", head: true })
      .eq("status", true)
      .is("deleted_at", null)

    // Total nucleos
    const { count: totalNucleos } = await supabase
      .from("nucleos")
      .select("id", { count: "exact", head: true })
      .eq("status", true)
      .is("deleted_at", null)

    // Total courses
    const { count: totalCourses } = await supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)

    // Active enrollments
    const { count: activeEnrollments } = await supabase
      .from("student_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)

    return {
      total_users: totalUsers || 0,
      total_polos: totalPolos || 0,
      total_nucleos: totalNucleos || 0,
      total_courses: totalCourses || 0,
      active_enrollments: activeEnrollments || 0,
      system_health: "healthy",
      database_size_mb: 0 // Would require database-level query
    }
  } catch (error) {
    console.error("Error loading system stats:", error)
    reply.code(500).send({ error: "Failed to load system statistics" })
  }
})

// Enrollment Trends
app.get("/stats/enrollments-trend", async (req, reply) => {
  try {
    const days = parseInt(req.query?.days || "30")
    const { polo_id } = req.query || {}

    if (!isSupabaseConnected()) {
      return {
        trend: [],
        total_period: 0,
        growth_percentage: 0
      }
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get enrollments for the period
    let enrollmentsQuery = supabase
      .from("student_enrollments")
      .select("enrolled_at")
      .gte("enrolled_at", startDate.toISOString())

    const { data: enrollments } = await enrollmentsQuery

    // Group by date
    const trendMap = {}
    enrollments?.forEach(enrollment => {
      const date = new Date(enrollment.enrolled_at).toISOString().split("T")[0]
      trendMap[date] = (trendMap[date] || 0) + 1
    })

    const trend = Object.entries(trendMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const totalPeriod = enrollments?.length || 0

    // Calculate growth percentage (compare first half vs second half)
    const halfPoint = Math.floor(days / 2)
    const midDate = new Date()
    midDate.setDate(midDate.getDate() - halfPoint)

    const firstHalf = enrollments?.filter(e => new Date(e.enrolled_at) < midDate).length || 0
    const secondHalf = enrollments?.filter(e => new Date(e.enrolled_at) >= midDate).length || 0

    const growthPercentage = firstHalf > 0
      ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100)
      : 0

    return {
      trend,
      total_period: totalPeriod,
      growth_percentage: growthPercentage
    }
  } catch (error) {
    console.error("Error loading enrollment trends:", error)
    reply.code(500).send({ error: "Failed to load enrollment trends" })
  }
})

const port = process.env.PORT ? Number(process.env.PORT) : 8090
await app.listen({ port, host: "0.0.0.0" })
