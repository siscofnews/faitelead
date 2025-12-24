import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_PATH = join(__dirname, "..", "data.json")

function load() {
  if (!existsSync(DATA_PATH)) {
    const initial = {
      tenants: [{ id: "tenant-1", name: "FAITEL", domain: "faitel.local" }],
      courses: [{ id: "course-1", tenant_id: "tenant-1", title: "Curso de Demonstração", description: "Somente front-end", duration_months: 12, total_hours: 120, monthly_price: 0, modality: "ead", is_active: true }],
      modules: [{ id: "module-1", course_id: "course-1", subject_id: null, title: "Introdução", order_index: 1, description: "" }],
      subjects: [{ id: "subject-1", course_id: "course-1", title: "Fundamentos", order: 1 }],
      contents: [{ id: "content-1", module_id: "module-1", content_type: "pdf", title: "Apostila Inicial", url: "/media/intro.pdf", order: 1, is_required: true, duration_minutes: 10 }],
      enrollments: [],
      content_progress: [],
      exams: [],
      exam_results: [],
      gallery: []
    }
    writeFileSync(DATA_PATH, JSON.stringify(initial, null, 2))
  }
  const raw = readFileSync(DATA_PATH, "utf8")
  return JSON.parse(raw)
}

let db = load()

function save() {
  writeFileSync(DATA_PATH, JSON.stringify(db, null, 2))
}

export const store = {
  get(table) {
    return db[table] || []
  },
  insert(table, row) {
    const r = Array.isArray(row) ? row : [row]
    db[table] = db[table] || []
    for (const item of r) {
      if (!item.id) item.id = crypto.randomUUID()
      db[table].push(item)
    }
    save()
    return r
  },
  update(table, predicate, patch) {
    let count = 0
    const rows = db[table] || []
    for (let i = 0; i < rows.length; i++) {
      if (predicate(rows[i])) {
        rows[i] = { ...rows[i], ...patch }
        count++
      }
    }
    db[table] = rows
    if (count) save()
    return count
  },
  remove(table, predicate) {
    const rows = db[table] || []
    const before = rows.length
    const kept = rows.filter(r => !predicate(r))
    db[table] = kept
    const count = before - kept.length
    if (count) save()
    return count
  }
}
