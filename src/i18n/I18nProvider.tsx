import { createContext, useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { supabase } from "@/integrations/supabase/client"

type Lang = "pt" | "en" | "es" | "fr" | "de"

type I18nContextType = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, options?: any) => any
}

const I18nContext = createContext<I18nContextType | null>(null)

export const I18nProvider = ({ children }: { children: any }) => {
  const { t, i18n } = useTranslation()
  const [lang, setLangState] = useState<Lang>((i18n.language?.split('-')[0] as Lang) || "pt")

  useEffect(() => {
    // Sync local state with i18n
    const handleLangChange = (lng: string) => {
      setLangState(lng.split('-')[0] as Lang)
    }
    i18n.on('languageChanged', handleLangChange)
    return () => {
      i18n.off('languageChanged', handleLangChange)
    }
  }, [i18n])

  useEffect(() => {
    const initLanguage = async () => {
      // 1. Check user profile if logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Try to get language from profile if column exists (assuming 'language' column or metadata)
        // For now, let's assume we store it in metadata or local storage is enough, but user asked for DB.
        // Since we can't easily change schema here without migration, we'll try to use user_metadata first.
        const userLang = session.user.user_metadata?.language as Lang;
        if (userLang && ['pt', 'en', 'es', 'fr', 'de'].includes(userLang)) {
           if (userLang !== lang) {
             setLang(userLang);
           }
           return;
        }
      }

      // 2. If not in profile, check localStorage
      const savedLang = localStorage.getItem("i18nextLng");
      if (savedLang) return;

      // 3. IP Detection fallback
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        const countryCode = data.country_code;

        const countryToLang: Record<string, Lang> = {
          BR: "pt", PT: "pt",
          FR: "fr", CA: "fr",
          ES: "es", MX: "es",
          DE: "de",
          US: "en", GB: "en"
        };

        const targetLang = countryToLang[countryCode];
        if (targetLang && targetLang !== lang) {
          setLang(targetLang);
        }
      } catch (error) {
        console.error("IP Language detection failed:", error);
      }
    };

    initLanguage();
  }, []);

  const setLang = async (l: Lang) => {
    i18n.changeLanguage(l)
    setLangState(l)
    localStorage.setItem("i18nextLng", l)
    
    // Persist to user metadata if logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.auth.updateUser({
        data: { language: l }
      });
    }
  }

  const value = { lang, setLang, t: (k: string, options?: any) => t(k, options) }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("I18nProvider missing")
  return ctx
}
