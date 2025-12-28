import { Link } from "react-router-dom"
import { Menu } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useI18n } from "@/i18n/I18nProvider"

const QuickNav = () => {
  const { t } = useI18n()

  return (
    <div className="hidden lg:block w-full bg-[#0f0638] text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-8 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Link to="/institucional" className="flex items-center gap-2 text-sm tracking-wide hover:text-accent transition-colors">
                <Menu className="h-4 w-4" />
                {t('quicknav.institucional')}
              </Link>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0f0638] text-white border-white/20">
              <DropdownMenuItem asChild>
                <Link to="/institucional/missao">{t('quicknav.mission')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/institucional/regimento">{t('quicknav.regiment')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/institucional/ouvidoria">{t('quicknav.ombudsman')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/institucional/administracao">{t('quicknav.admin')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/institucional/cpa">{t('quicknav.cpa')}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Link to="/ensino" className="flex items-center gap-2 text-sm tracking-wide hover:text-accent transition-colors">
                <Menu className="h-4 w-4" />
                {t('quicknav.teaching')}
              </Link>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0f0638] text-white border-white/20">
              <DropdownMenuItem asChild>
                <Link to="/ensino/graduacao">{t('quicknav.graduation')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/ensino/graduacao-ead">{t('quicknav.graduation_ead')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/ensino/pos-graduacao">{t('quicknav.post_grad')}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Link to="/ensino/graduacao" className="flex items-center gap-2 text-sm tracking-wide hover:text-accent transition-colors">
                <Menu className="h-4 w-4" />
                {t('quicknav.graduation')}
              </Link>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0f0638] text-white border-white/20">
              <DropdownMenuItem asChild>
                <Link to="/ensino/graduacao">{t('quicknav.graduation')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/ensino/graduacao-ead">{t('quicknav.graduation_ead')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/ensino/pos-graduacao">{t('quicknav.post_grad')}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Link to="/vestibular" className="flex items-center gap-2 text-sm tracking-wide hover:text-accent transition-colors">
                <Menu className="h-4 w-4" />
                {t('quicknav.vestibular')}
              </Link>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0f0638] text-white border-white/20">
              <DropdownMenuItem asChild>
                <Link to="/vestibular/online-2026">{t('quicknav.vestibular_online')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/vestibular/agendado-2026">{t('quicknav.vestibular_scheduled')}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Link to="/ead-info" className="flex items-center gap-2 text-sm tracking-wide hover:text-accent transition-colors">
                <Menu className="h-4 w-4" />
                {t('quicknav.ead')}
              </Link>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0f0638] text-white border-white/20">
              <DropdownMenuItem asChild>
                <Link to="/auth">{t('quicknav.access_room')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/ead/faq">{t('quicknav.faq')}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Link to="/biblioteca" className="flex items-center gap-2 text-sm tracking-wide hover:text-accent transition-colors">
                <Menu className="h-4 w-4" />
                {t('quicknav.library')}
              </Link>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0f0638] text-white border-white/20">
              <DropdownMenuItem asChild>
                <Link to="/biblioteca/guia-link">{t('quicknav.guide_link')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/biblioteca/abnt-colecao">{t('quicknav.abnt_collection')}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/galeria" className="flex items-center gap-2 text-sm tracking-wide hover:text-accent transition-colors">
            <Menu className="h-4 w-4" />
            {t('quicknav.gallery')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default QuickNav