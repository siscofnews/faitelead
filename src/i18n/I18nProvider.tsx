import { createContext, useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

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
    const detectIPLanguage = async () => {
      // If we already have a language set in localStorage or i18next, don't override
      const savedLang = localStorage.getItem("i18nextLng");
      if (savedLang) return;

      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        const countryCode = data.country_code; // e.g., 'BR', 'FR', 'US'

        const countryToLang: Record<string, Lang> = {
          BR: "pt",
          PT: "pt",
          FR: "fr",
          CA: "fr",
          ES: "es",
          MX: "es",
          DE: "de",
          US: "en",
          GB: "en"
        };

        const targetLang = countryToLang[countryCode];
        if (targetLang && targetLang !== lang) {
          setLang(targetLang);
        }
      } catch (error) {
        console.error("IP Language detection failed:", error);
      }
    };

    detectIPLanguage();
  }, []);

  const setLang = (l: Lang) => {
    i18n.changeLanguage(l)
    setLangState(l)
    localStorage.setItem("i18nextLng", l)
  }

  // Wrapper for t function to handle missing keys gracefully if needed, 
  // but i18next does that too.
  // The existing app uses keys that might not be in the JSON yet, 
  // so we might want to fallback to the old dict if we wanted to be super safe,
  // but I'm replacing the provider, so the old dict is gone.
  // I added the critical keys to the JSONs.

  const value = { lang, setLang, t: (k: string, options?: any) => t(k, options) }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("I18nProvider missing")
  return ctx
}
