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
import { Image as ImageIcon, Plus, Trash2, ArrowLeft, Video, Play } from "lucide-react"
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
      toast.success("Item adicionado")
      setAddOpen(false)
      setForm({ url: "", title: "" })
      load()
    } catch {
      toast.error("Erro ao adicionar item")
    }
  }

  const deletePhoto = async (id: string) => {
    try {
      await api.deleteGallery(id)
      toast.success("Item removido")
      load()
    } catch {
      toast.error("Erro ao remover item")
    }
  }

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|mov|webm)$/i) || url.includes('youtube.com') || url.includes('youtu.be');
  }

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  const renderMedia = (item: Photo, thumbnail = false) => {
    const youtubeId = getYoutubeId(item.url);
    
    if (youtubeId) {
      if (thumbnail) {
        return (
          <div className="relative w-full h-full bg-black group-hover:scale-105 transition-transform flex items-center justify-center">
            <img 
              src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`} 
              alt={item.title} 
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <Play className="relative z-10 h-12 w-12 text-white drop-shadow-lg" />
          </div>
        );
      }
      return (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${youtubeId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-lg aspect-video"
        />
      );
    }

    if (item.url.match(/\.(mp4|mov|webm)$/i)) {
       if (thumbnail) {
        return (
           <div className="w-full h-full bg-black flex items-center justify-center relative">
             <video src={item.url} className="w-full h-full object-cover opacity-80" />
             <Play className="absolute z-10 h-12 w-12 text-white drop-shadow-lg" />
           </div>
        )
       }
       return (
        <video controls className="w-full h-auto rounded-lg" src={item.url}>
          Seu navegador não suporta vídeos HTML5.
        </video>
       )
    }

    // Imagem normal
    return (
      <img 
        src={item.url} 
        alt={item.title || "Foto"} 
        className={`w-full ${thumbnail ? 'h-full object-cover group-hover:scale-105 transition-transform' : 'h-auto rounded-lg'}`} 
        onClick={() => thumbnail && setSelected(item)} 
      />
    );
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
              <h1 className="text-xl font-display font-bold">Galeria Multimídia</h1>
              <p className="text-sm text-muted-foreground">Fotos e Vídeos de Momentos Especiais</p>
            </div>
          </div>
          {canManage && (
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Mídia
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Foto ou Vídeo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm">URL (Imagem ou Vídeo/YouTube) *</label>
                    <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Título</label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Formatura 2024" />
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
              <p className="text-muted-foreground">Nenhuma mídia cadastrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((p) => (
              <Card key={p.id} className="overflow-hidden group cursor-pointer" onClick={() => setSelected(p)}>
                <div className="relative aspect-square bg-muted">
                  {renderMedia(p, true)}
                  {p.title && (
                    <Badge className="absolute bottom-2 left-2 bg-background/80 backdrop-blur text-foreground z-20">{p.title}</Badge>
                  )}
                  {canManage && (
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30" 
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePhoto(p.id);
                      }}
                    >
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
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/90 border-none">
          <DialogHeader className="sr-only">
            <DialogTitle>{selected?.title || "Visualização"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="w-full flex items-center justify-center p-4">
              {renderMedia(selected, false)}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Gallery
