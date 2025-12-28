import { useI18n } from "@/i18n/I18nProvider"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

const langs = [
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
] as const

const LanguageSwitcher = ({ className }: { className?: string }) => {
  const { lang, setLang } = useI18n()
  const current = langs.find(l => l.code === lang)?.label || "Português"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`gap-2 ${className || ''}`}>
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{current}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {langs.map(l => (
          <DropdownMenuItem
            key={l.code}
            onSelect={() => setLang(l.code as any)}
            className="cursor-pointer"
          >
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSwitcher
