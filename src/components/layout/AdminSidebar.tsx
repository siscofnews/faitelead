import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    MapPin,
    CreditCard,
    FileText,
    Calendar,
    Settings,
    FileCheck,
    Megaphone,
    Award
} from "lucide-react";
import AppSidebar, { MenuItem } from "./AppSidebar";

interface AdminSidebarProps {
    isOpen: boolean;
    onClose?: () => void;
    isSuperAdmin?: boolean;
}

const adminMenuItems: MenuItem[] = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin",
    },
    {
        title: "Alunos",
        icon: Users,
        href: "/admin/alunos",
    },
    {
        title: "Professores",
        icon: GraduationCap,
        href: "/admin/professores",
    },
    {
        title: "Cursos",
        icon: BookOpen,
        href: "/admin/cursos",
    },
    {
        title: "Polos",
        icon: MapPin,
        href: "/admin/polos",
    },
    {
        title: "Financeiro",
        icon: CreditCard,
        href: "/admin/financeiro",
    },
    {
        title: "Relatórios",
        icon: FileText,
        href: "/admin/relatorios",
    },
    {
        title: "Provas",
        icon: FileCheck,
        href: "/admin/provas",
    },
    {
        title: "Aprovações",
        icon: Users,
        href: "/admin/aprovacoes",
    },
    {
        title: "Comunicados",
        icon: Megaphone,
        href: "/admin/comunicados",
    },
    {
        title: "Calendário",
        icon: Calendar,
        href: "/admin/calendario",
    },
    {
        title: "Certificados",
        icon: Award,
        href: "/admin/certificados",
    },
    {
        title: "Restaurar Conteúdo",
        icon: Settings,
        href: "/admin/restore",
    },
];

const AdminSidebar = ({ isOpen, onClose, isSuperAdmin = false }: AdminSidebarProps) => {
    return <AppSidebar isOpen={isOpen} onClose={onClose} menuItems={adminMenuItems} isSuperAdmin={isSuperAdmin} />;
};

export default AdminSidebar;
