import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Image as ImageIcon, Plus, Trash2, ArrowLeft } from "lucide-react"
import { useI18n } from "@/i18n/I18nProvider"

type Photo = { id: string; url: string; title?: string; created_at?: string }

const Gallery = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selected, setSelected] = useState<Photo | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ url: "", title: "" })
  const [canManage, setCanManage] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const rows = await api.listGallery()
      setPhotos(Array.isArray(rows) ? rows.reverse() : [])
      const { data: { user } } = await supabase.auth.getUser()
      setCanManage(!!user)
    } catch {
      toast.error("Erro ao carregar galeria")
    } finally {
      setLoading(false)
    }
  }

  const addPhoto = async () => {
    if (!form.url.trim()) {
      toast.error("URL é obrigatória")
      return
    }
    try {
      await api.createGallery({ url: form.url.trim(), title: form.title.trim() || undefined })
      toast.success("Foto adicionada")
      setAddOpen(false)
      setForm({ url: "", title: "" })
      load()
    } catch {
      toast.error("Erro ao adicionar foto")
    }
  }

  const deletePhoto = async (id: string) => {
    try {
      await api.deleteGallery(id)
      toast.success("Foto removida")
      load()
    } catch {
      toast.error("Erro ao remover foto")
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
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t("back")}
            </Button>
            <div>
              <h1 className="text-xl font-display font-bold">Galeria de Fotos</h1>
              <p className="text-sm text-muted-foreground">Momentos especiais</p>
            </div>
          </div>
          {canManage && (
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Foto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Foto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm">URL da Imagem *</label>
                    <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Título</label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Formatura" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
                    <Button onClick={addPhoto}>Salvar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {photos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma foto cadastrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((p) => (
              <Card key={p.id} className="overflow-hidden group cursor-pointer">
                <div className="relative aspect-square bg-muted">
                  <img src={p.url} alt={p.title || "Foto"} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onClick={() => setSelected(p)} />
                  {p.title && (
                    <Badge className="absolute bottom-2 left-2 bg-background/80 backdrop-blur text-foreground">{p.title}</Badge>
                  )}
                  {canManage && (
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deletePhoto(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selected?.title || "Foto"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="w-full">
              <img src={selected.url} alt={selected.title || "Foto"} className="w-full h-auto rounded-lg" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Gallery
