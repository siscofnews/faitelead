import { Button } from "@/components/ui/button"
import { ArrowLeft, Link as LinkIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

const GuiaELink = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/biblioteca")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <h1 className="text-xl font-display font-bold flex items-center gap-2">
            <LinkIcon className="h-5 w-5" /> Guia e Link
          </h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Links úteis e guias da biblioteca.</p>
      </main>
    </div>
  )
}

export default GuiaELink
