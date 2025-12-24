import { createContext, useContext, useMemo, useState, useEffect } from "react"

type Lang = "pt" | "en" | "es" | "fr" | "de"

type Dict = Record<string, Record<Lang, string>>

const dict: Dict = {
  home: { pt: "Home", en: "Home", es: "Inicio", fr: "Accueil", de: "Startseite" },
  platform_tagline: { pt: "Plataforma EAD", en: "E‑Learning Platform", es: "Plataforma EAD", fr: "Plateforme E‑Learning", de: "E‑Learning Plattform" },
  search_placeholder: { pt: "Buscar cursos, módulos, aulas...", en: "Search courses, modules, lessons...", es: "Buscar cursos, módulos, clases...", fr: "Rechercher cours, modules, leçons...", de: "Kurse, Module, Lektionen suchen..." },
  profile: { pt: "Meu Perfil", en: "My Profile", es: "Mi Perfil", fr: "Mon Profil", de: "Mein Profil" },
  settings: { pt: "Configurações", en: "Settings", es: "Configuración", fr: "Paramètres", de: "Einstellungen" },
  logout: { pt: "Sair", en: "Logout", es: "Salir", fr: "Se déconnecter", de: "Abmelden" },
  role_super_admin: { pt: "Super Administrador", en: "Super Admin", es: "Super Administrador", fr: "Super Administrateur", de: "Super-Administrator" },
  role_admin: { pt: "Administrador", en: "Admin", es: "Administrador", fr: "Administrateur", de: "Administrator" },
  role_teacher: { pt: "Professor", en: "Teacher", es: "Profesor", fr: "Professeur", de: "Lehrer" },
  role_director: { pt: "Diretor", en: "Director", es: "Director", fr: "Directeur", de: "Direktor" },
  role_student: { pt: "Aluno", en: "Student", es: "Estudiante", fr: "Étudiant", de: "Student" },
  courses_management: { pt: "Gestão de Cursos", en: "Course Management", es: "Gestión de Cursos", fr: "Gestion des Cours", de: "Kursverwaltung" },
  new_course: { pt: "Novo Curso", en: "New Course", es: "Nuevo Curso", fr: "Nouveau Cours", de: "Neuer Kurs" },
  create_course: { pt: "Criar Curso", en: "Create Course", es: "Crear Curso", fr: "Créer le Cours", de: "Kurs erstellen" },
  modules: { pt: "Módulos", en: "Modules", es: "Módulos", fr: "Modules", de: "Module" },
  manage_lessons: { pt: "Gerenciar Aulas", en: "Manage Lessons", es: "Gestionar Clases", fr: "Gérer les Leçons", de: "Lektionen verwalten" },
  edit: { pt: "Editar", en: "Edit", es: "Editar", fr: "Modifier", de: "Bearbeiten" },
  delete: { pt: "Excluir", en: "Delete", es: "Eliminar", fr: "Supprimer", de: "Löschen" },
  back: { pt: "Voltar", en: "Back", es: "Volver", fr: "Retour", de: "Zurück" },
  reports_title: { pt: "Relatórios e Análises", en: "Reports & Analytics", es: "Informes y Análisis", fr: "Rapports et Analyses", de: "Berichte & Analysen" },
  generate_report: { pt: "Gerar Relatório", en: "Generate Report", es: "Generar Informe", fr: "Générer un Rapport", de: "Bericht erstellen" },
  exams_title: { pt: "Provas", en: "Exams", es: "Exámenes", fr: "Examens", de: "Prüfungen" },
  period: { pt: "Período", en: "Period", es: "Período", fr: "Période", de: "Zeitraum" },
  period_all: { pt: "Todo o Período", en: "All Time", es: "Todo el período", fr: "Toute la période", de: "Gesamter Zeitraum" },
  period_month: { pt: "Este Mês", en: "This Month", es: "Este Mes", fr: "Ce Mois", de: "Diesen Monat" },
  period_quarter: { pt: "Este Trimestre", en: "This Quarter", es: "Este Trimestre", fr: "Ce Trimestre", de: "Dieses Quartal" },
  save: { pt: "Salvar", en: "Save", es: "Guardar", fr: "Enregistrer", de: "Speichern" },
  cancel: { pt: "Cancelar", en: "Cancel", es: "Cancelar", fr: "Annuler", de: "Abbrechen" },
  new_module: { pt: "Novo Módulo", en: "New Module", es: "Nuevo Módulo", fr: "Nouveau Module", de: "Neues Modul" },
  create_module: { pt: "Criar Módulo", en: "Create Module", es: "Crear Módulo", fr: "Créer un Module", de: "Modul erstellen" },
  finance_title: { pt: "Gestão Financeira", en: "Financial Management", es: "Gestión Financiera", fr: "Gestion Financière", de: "Finanzverwaltung" },
  students_title: { pt: "Gestão de Alunos", en: "Student Management", es: "Gestión de Alumnos", fr: "Gestion des Étudiants", de: "Studentenverwaltung" },
  my_courses: { pt: "Meus Cursos", en: "My Courses", es: "Mis Cursos", fr: "Mes Cours", de: "Meine Kurse" },
  classes_title: { pt: "Minhas Turmas", en: "My Classes", es: "Mis Clases", fr: "Mes Classes", de: "Meine Klassen" }
  ,
  gallery_title: { pt: "Galeria de Fotos", en: "Photo Gallery", es: "Galería de Fotos", fr: "Galerie de Photos", de: "Fotogalerie" },
  add_photo: { pt: "Adicionar Foto", en: "Add Photo", es: "Agregar Foto", fr: "Ajouter une Photo", de: "Foto hinzufügen" }
}

type I18nContextType = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: keyof typeof dict) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export const I18nProvider = ({ children }: { children: any }) => {
  const [lang, setLangState] = useState<Lang>("pt")
  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null
    if (saved) setLangState(saved)
  }, [])
  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem("lang", l)
  }
  const t = (key: keyof typeof dict) => {
    const row = dict[key]
    if (!row) return String(key)
    return row[lang] ?? row["pt"]
  }
  const value = useMemo(() => ({ lang, setLang, t }), [lang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("I18nProvider missing")
  return ctx
}
