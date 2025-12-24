const BASE = import.meta.env.VITE_API_URL || "http://localhost:8090"

async function j(method: string, path: string, body?: any) {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  })
  if (!r.ok) throw new Error(`http ${r.status}`)
  const ct = r.headers.get("content-type") || ""
  if (ct.includes("application/json")) return r.json()
  return r.text()
}

export const api = {
  listCourses(params?: { tenant_id?: string; is_active?: boolean }) {
    const qs = new URLSearchParams()
    if (params?.tenant_id) qs.set("tenant_id", params.tenant_id)
    if (typeof params?.is_active !== "undefined") qs.set("is_active", String(params.is_active))
    const s = qs.toString()
    return j("GET", `/courses${s ? `?${s}` : ""}`)
  },
  createCourse(payload: { tenant_id?: string; title: string; description?: string; duration_months?: number; total_hours?: number; monthly_price?: number; modality?: string; thumbnail_url?: string; is_active?: boolean }) {
    return j("POST", "/courses", payload)
  },
  updateCourse(id: string, patch: any) {
    return j("PATCH", `/courses/${id}`, patch)
  },
  deleteCourse(id: string) {
    return j("DELETE", `/courses/${id}`)
  },
  getCourse(id: string) {
    return j("GET", `/courses`).then((rows: any) => {
      const list = Array.isArray(rows) ? rows : []
      return list.find((r: any) => r.id === id) || null
    })
  },
  listEnrollmentsByStudent(studentId: string) {
    return j("GET", `/enrollments?student_id=${encodeURIComponent(studentId)}`)
  },
  createEnrollment(payload: { student_id: string; course_id: string; is_active?: boolean }) {
    return j("POST", "/enrollments", payload)
  },
  deleteEnrollment(id: string) {
    return j("DELETE", `/enrollments/${id}`)
  },
  getSubject(id: string) {
    return j("GET", `/subjects/${id}`)
  },
  getModulesBySubject(subjectId: string) {
    return j("GET", `/modules?subject_id=${encodeURIComponent(subjectId)}`)
  },
  getModulesByCourse(courseId: string) {
    return j("GET", `/modules?course_id=${encodeURIComponent(courseId)}`)
  },
  getModule(id: string) {
    return j("GET", `/modules/${id}`)
  },
  createModule(payload: { subject_id: string; course_id?: string; title: string; description?: string; order_index?: number }) {
    return j("POST", "/modules", payload)
  },
  updateModule(id: string, patch: any) {
    return j("PATCH", `/modules/${id}`, patch)
  },
  deleteModule(id: string) {
    return j("DELETE", `/modules/${id}`)
  },
  listContentsByModule(moduleId: string) {
    return j("GET", `/contents?module_id=${encodeURIComponent(moduleId)}`)
  },
  createContent(payload: { module_id: string; title: string; content_type: string; url?: string | null; order?: number; is_required?: boolean; duration_minutes?: number; payload?: any }) {
    return j("POST", "/contents", payload)
  },
  updateContent(id: string, patch: any) {
    return j("PATCH", `/contents/${id}`, patch)
  },
  deleteContent(id: string) {
    return j("DELETE", `/contents/${id}`)
  },
  listContentProgress(studentId: string, courseId: string) {
    const qs = new URLSearchParams({ student_id: studentId, course_id: courseId })
    return j("GET", `/content-progress?${qs.toString()}`)
  },
  listContentProgressAny(studentId: string) {
    const qs = new URLSearchParams({ student_id: studentId })
    return j("GET", `/content-progress?${qs.toString()}`)
  },
  upsertContentProgress(id: string | null, payload: { student_id: string; content_id: string; completed: boolean }) {
    if (id) return j("PATCH", `/content-progress/${id}`, payload)
    return j("POST", `/content-progress`, payload)
  },
  listGallery() {
    return j("GET", "/gallery")
  },
  createGallery(payload: { url: string; title?: string }) {
    return j("POST", "/gallery", payload)
  },
  deleteGallery(id: string) {
    return j("DELETE", `/gallery/${id}`)
  },
  getStudentStats(student_id: string, course_id: string) {
    const qs = new URLSearchParams({ student_id, course_id }).toString()
    return j("GET", `/student-stats?${qs}`)
  }
}
