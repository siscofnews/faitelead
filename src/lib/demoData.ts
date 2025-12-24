export type Course = { id: string; title: string; description?: string; is_active: boolean }
export type Module = { id: string; course_id: string; title: string; description?: string | null; order_index: number; created_at: string }
export type Lesson = { id: string; module_id: string; title: string; order_index: number }

const now = () => new Date().toISOString()

const courses: Course[] = [
  { id: "course-1", title: "Curso de Demonstração", description: "Somente front-end", is_active: true },
]

const modules: Module[] = [
  { id: "module-1", course_id: "course-1", title: "Módulo 1 - Introdução", description: "Demo", order_index: 1, created_at: now() },
]

const lessons: Lesson[] = [
  { id: "lesson-1", module_id: "module-1", title: "Aula 1", order_index: 1 },
]

export function list(table: string): any[] {
  if (table === "courses") return [...courses]
  if (table === "modules") return [...modules]
  if (table === "lessons") return [...lessons]
  return []
}

export function insert(table: string, rows: any | any[]): { data: any[] } {
  const arr = Array.isArray(rows) ? rows : [rows]
  const out: any[] = []
  for (const r of arr) {
    if (!r.id) r.id = crypto.randomUUID()
    if (table === "courses") courses.push(r)
    if (table === "modules") modules.push({ ...r, created_at: now() })
    if (table === "lessons") lessons.push(r)
    out.push(r)
  }
  return { data: out }
}

export function update(table: string, predicate: (r: any) => boolean, patch: any): { count: number } {
  let count = 0
  if (table === "courses") {
    for (const r of courses) if (predicate(r)) { Object.assign(r, patch); count++ }
  }
  if (table === "modules") {
    for (const r of modules) if (predicate(r)) { Object.assign(r, patch); count++ }
  }
  if (table === "lessons") {
    for (const r of lessons) if (predicate(r)) { Object.assign(r, patch); count++ }
  }
  return { count }
}

export function remove(table: string, predicate: (r: any) => boolean): { count: number } {
  let count = 0
  if (table === "courses") {
    const before = courses.length
    for (let i = courses.length - 1; i >= 0; i--) if (predicate(courses[i])) courses.splice(i, 1)
    count = before - courses.length
  }
  if (table === "modules") {
    const before = modules.length
    for (let i = modules.length - 1; i >= 0; i--) if (predicate(modules[i])) modules.splice(i, 1)
    count = before - modules.length
  }
  if (table === "lessons") {
    const before = lessons.length
    for (let i = lessons.length - 1; i >= 0; i--) if (predicate(lessons[i])) lessons.splice(i, 1)
    count = before - lessons.length
  }
  return { count }
}
