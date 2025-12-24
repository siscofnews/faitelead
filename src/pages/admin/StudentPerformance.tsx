import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, CheckCircle2, BookOpen } from "lucide-react"
import { format, startOfWeek } from "date-fns"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

type Stat = {
  total_lessons: number
  completed_lessons: number
  completion_rate: number
  exams_count: number
  exams_attempted: number
  average_score: number | null
  pass_rate: number
  required_completed: boolean
}

const StudentPerformance = () => {
  const navigate = useNavigate()
  const { studentId } = useParams<{ studentId: string }>()
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([])
  const [stats, setStats] = useState<Record<string, Stat>>({})
  const [studentName, setStudentName] = useState("")
  const [loading, setLoading] = useState(true)
  const [weeklyData, setWeeklyData] = useState<{ week: string; completed: number }[]>([])

  useEffect(() => {
    load()
  }, [studentId])

  const load = async () => {
    if (!studentId) return
    try {
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", studentId).single()
      setStudentName(profile?.full_name || "")
      const { data: enrollments } = await supabase.from("student_enrollments").select("course_id").eq("student_id", studentId)
      const courseIds = (enrollments || []).map((e: any) => e.course_id)
      const courseRows: { id: string; title: string }[] = []
      for (const id of courseIds) {
        const c = await api.getCourse(id)
        if (c) courseRows.push({ id: c.id, title: c.title })
      }
      setCourses(courseRows)
      const st: Record<string, Stat> = {}
      for (const c of courseRows) {
        st[c.id] = await api.getStudentStats(studentId, c.id)
      }
      setStats(st)
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("completed, completed_at, updated_at, created_at")
        .eq("student_id", studentId)
        .eq("completed", true)
      const counts: Record<string, number> = {}
      for (const row of (progress || [])) {
        const dtStr = row.completed_at || row.updated_at || row.created_at
        const dt = dtStr ? new Date(dtStr) : new Date()
        const wk = startOfWeek(dt, { weekStartsOn: 1 })
        const key = format(wk, "dd/MM")
        counts[key] = (counts[key] || 0) + 1
      }
      const series = Object.entries(counts)
        .sort((a, b) => {
          const pa = a[0].split("/").reverse().join("-")
          const pb = b[0].split("/").reverse().join("-")
          return pa.localeCompare(pb)
        })
        .map(([week, completed]) => ({ week, completed }))
      setWeeklyData(series.slice(-12))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/alunos")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
            <h1 className="text-xl font-display font-bold">Desempenho de {studentName}</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendência semanal de aulas concluídas</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="#4f46e5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aluno sem cursos matriculados</p>
            </CardContent>
          </Card>
        ) : (
          courses.map((c) => {
            const s = stats[c.id]
            return (
              <Card key={c.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{c.title}</span>
                    <span className="text-sm text-muted-foreground">Conclusão: {s?.completion_rate ?? 0}%</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-primary/10">
                    <p className="text-sm text-muted-foreground">Aulas concluídas</p>
                    <p className="text-2xl font-bold">{s?.completed_lessons ?? 0}/{s?.total_lessons ?? 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/10">
                    <p className="text-sm text-muted-foreground">Provas</p>
                    <p className="text-2xl font-bold">{s?.exams_attempted ?? 0}/{s?.exams_count ?? 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-success/10">
                    <p className="text-sm text-muted-foreground">Média de Nota</p>
                    <p className="text-2xl font-bold">{s?.average_score ?? "-"}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-warning/10">
                    <p className="text-sm text-muted-foreground">Aprovação</p>
                    <p className="text-2xl font-bold">{s?.pass_rate ?? 0}%</p>
                  </div>
                  <div className="col-span-2 md:col-span-4 p-4 rounded-lg bg-muted/30 flex items-center gap-3">
                    <CheckCircle2 className={`h-5 w-5 ${s?.required_completed ? "text-success" : "text-muted-foreground"}`} />
                    <p className="text-sm">Conteúdos obrigatórios {s?.required_completed ? "concluídos" : "pendentes"}</p>
                    <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      {s?.completion_rate ?? 0}% de progresso
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </main>
    </div>
  )
}

export default StudentPerformance
