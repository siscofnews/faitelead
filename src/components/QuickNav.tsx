import { Link } from "react-router-dom"
import { Menu } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const items = [
  { label: "INSTITUCIONAL", href: "/institucional" },
  { label: "ENSINO", href: "/ensino" },
  { label: "VESTIBULAR", href: "/vestibular" },
  { label: "EAD", href: "/ead-info" },
  { label: "BIBLIOTECA", href: "/biblioteca" },
]

const QuickNav = () => {
  return (
    <div className="hidden lg:block w-full bg-[#0f0638] text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-8 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Link to="/institucional" className="flex items-center gap-2 text-sm tracking-wide hover:text-accent transition-colors">
                <Menu className="h-4 w-4" />
                INSTITUCIONAL
              </Link>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0f0638] text-white border-white/20">
              <DropdownMenuItem asChild>
                <Link to="/institucional/missao">MISSÃO, VISÃO E VALORES</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/institucional/regimento">REGIMENTO</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/institucional/ouvidoria">OUVIDORIA</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/institucional/administracao">ADMINISTRAÇÃO ACADEMICA</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/institucional/cpa">CPA</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Link to="/ensino" className="flex items-center gap-2 text-sm tracking-wide hover:text-accent transition-colors">
                <Menu className="h-4 w-4" />
                ENSINO
              </Link>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0f0638] text-white border-white/20">
              <DropdownMenuItem asChild>
                <Link to="/ensino/graduacao">GRADUAÇÃO</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/ensino/graduacao-ead">GRADUAÇÃO EAD</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/ensino/pos-graduacao">POS GRADUAÇÃO</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Link to="/ensino/graduacao" className="flex items-center gap-2 text-sm tracking-wide hover:text-accent transition-colors">
                <Menu className="h-4 w-4" />
                GRADUAÇÃO
              </Link>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0f0638] text-white border-white/20">
              <DropdownMenuItem asChild>
                <Link to="/ensino/graduacao">GRADUAÇÃO</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/ensino/graduacao-ead">GRADUAÇÃO EAD</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/ensino/pos-graduacao">POS GRADUAÇÃO</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Link to="/vestibular" className="flex items-center gap-2 text-sm tracking-wide hover:text-accent transition-colors">
                <Menu className="h-4 w-4" />
                VESTIBULAR
              </Link>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0f0638] text-white border-white/20">
              <DropdownMenuItem asChild>
                <Link to="/vestibular/online-2026">VESTIBULAR ONLINE 2026</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/vestibular/agendado-2026">VESTIBULAR AGENDADO 2026</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Link to="/ead-info" className="flex items-center gap-2 text-sm tracking-wide hover:text-accent transition-colors">
                <Menu className="h-4 w-4" />
                EAD
              </Link>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0f0638] text-white border-white/20">
              <DropdownMenuItem asChild>
                <Link to="/auth">ACESSE SUA SALA</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/ead/faq">FAQ DE ATENDIMENTO</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Link to="/biblioteca" className="flex items-center gap-2 text-sm tracking-wide hover:text-accent transition-colors">
                <Menu className="h-4 w-4" />
                BIBLIOTECA
              </Link>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0f0638] text-white border-white/20">
              <DropdownMenuItem asChild>
                <Link to="/biblioteca/guia-link">GUIA E LINK</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/biblioteca/abnt-colecao">ABNT COLEÇÃO</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/galeria" className="flex items-center gap-2 text-sm tracking-wide hover:text-accent transition-colors">
            <Menu className="h-4 w-4" />
            GALERIA
          </Link>
        </div>
      </div>
    </div>
  )
}

export default QuickNav
