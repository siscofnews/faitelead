import { readFileSync, existsSync } from "node:fs"
import { join, resolve } from "node:path"

const BASE = process.env.API_URL || "http://localhost:8090"

async function j(method, path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  })
  if (!r.ok) {
    const t = await r.text().catch(() => "")
    throw new Error(`HTTP ${r.status} on ${path}: ${t}`)
  }
  const ct = r.headers.get("content-type") || ""
  return ct.includes("application/json") ? r.json() : r.text()
}

function readDataJson() {
  const candidates = [
    resolve(process.cwd(), "data.json"),
    resolve(process.cwd(), "backend", "data.json"),
  ]
  for (const p of candidates) {
    if (existsSync(p)) {
      const raw = readFileSync(p, "utf8")
      return { path: p, json: JSON.parse(raw) }
    }
  }
  throw new Error("data.json not found in expected locations")
}

function assert(cond, msg) {
  if (!cond) throw new Error(`Assertion failed: ${msg}`)
}

async function run() {
  console.log("== Courses CRUD test ==")
  const title = `Curso Teste ${Date.now()}`
  const payload = {
    title,
    description: "Curso de teste automatizado",
    duration_months: 6,
    total_hours: 180,
    monthly_price: 99,
    modality: "ead",
    is_active: true,
  }

  const before = await j("GET", "/courses")
  console.log(`Initial courses: ${Array.isArray(before) ? before.length : 0}`)

  const created = await j("POST", "/courses", payload)
  assert(created && created.id, "created course must return id")
  console.log(`Created course id=${created.id}`)

  const afterCreate = await j("GET", "/courses")
  assert(afterCreate.some(c => c.id === created.id), "course must appear in GET /courses after creation")

  let { json: dataCreate } = readDataJson()
  const diskCreate = dataCreate.courses.find(c => c.id === created.id)
  assert(diskCreate, "data.json must contain created course")
  assert(diskCreate.title === title, "created course title must match")

  await j("PATCH", `/courses/${created.id}`, { title: `${title} (Editado)`, is_active: false })
  console.log(`Updated course id=${created.id}`)

  const afterUpdate = await j("GET", "/courses")
  const updated = afterUpdate.find(c => c.id === created.id)
  assert(updated && updated.title.endsWith("(Editado)"), "updated title must be reflected")
  assert(updated.is_active === false, "updated is_active must be false")

  const activeList = await j("GET", "/courses?is_active=true")
  assert(!activeList.some(c => c.id === created.id), "updated course should not appear in active list")

  let { json: dataUpdate } = readDataJson()
  const diskUpdate = dataUpdate.courses.find(c => c.id === created.id)
  assert(diskUpdate && diskUpdate.title.endsWith("(Editado)") && diskUpdate.is_active === false, "data.json must reflect update")

  await j("DELETE", `/courses/${created.id}`)
  console.log(`Deleted course id=${created.id}`)

  const afterDelete = await j("GET", "/courses")
  assert(!afterDelete.some(c => c.id === created.id), "course must be removed from GET /courses after deletion")

  let { json: dataDelete } = readDataJson()
  assert(!dataDelete.courses.some(c => c.id === created.id), "data.json must remove deleted course")

  console.log("All assertions passed ✅")
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
