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
import { useI18n } from "@/i18n/I18nProvider";

interface AdminSidebarProps {
    isOpen: boolean;
    onClose?: () => void;
    isSuperAdmin?: boolean;
}

const AdminSidebar = ({ isOpen, onClose, isSuperAdmin = false }: AdminSidebarProps) => {
    const { t } = useI18n();

    const adminMenuItems: MenuItem[] = [
        {
            title: t("nav.dashboard"),
            icon: LayoutDashboard,
            href: "/admin",
        },
        {
            title: t("nav.students"),
            icon: Users,
            href: "/admin/alunos",
        },
        {
            title: t("nav.professors"),
            icon: GraduationCap,
            href: "/admin/professores",
        },
        {
            title: t("nav.courses"),
            icon: BookOpen,
            href: "/admin/cursos",
        },
        {
            title: t("nav.polos"),
            icon: MapPin,
            href: "/admin/polos",
        },
        {
            title: t("nav.financial"),
            icon: CreditCard,
            href: "/admin/financeiro",
        },
        {
            title: t("nav.reports"),
            icon: FileText,
            href: "/admin/relatorios",
        },
        {
            title: t("nav.exams"),
            icon: FileCheck,
            href: "/admin/provas",
        },
        {
            title: t("nav.approvals"),
            icon: Users,
            href: "/admin/aprovacoes",
        },
        {
            title: t("nav.announcements"),
            icon: Megaphone,
            href: "/admin/comunicados",
        },
        {
            title: t("nav.calendar"),
            icon: Calendar,
            href: "/admin/calendario",
        },
        {
            title: t("nav.certificates"),
            icon: Award,
            href: "/admin/certificados",
        },
        {
            title: t("nav.restore"),
            icon: Settings,
            href: "/admin/restore",
        },
    ];

    return <AppSidebar isOpen={isOpen} onClose={onClose} menuItems={adminMenuItems} isSuperAdmin={isSuperAdmin} />;
};

export default AdminSidebar;
