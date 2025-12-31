import {
    LayoutDashboard,
    BookOpen,
    TrendingUp,
    Trophy,
    Award,
    GraduationCap,
    FileText,
    ScrollText,
    CreditCard,
    Calendar,
    HelpCircle,
} from "lucide-react";
import AppSidebar, { MenuItem } from "./AppSidebar";

interface StudentSidebarProps {
    isOpen: boolean;
    onClose?: () => void;
}

const StudentSidebar = ({ isOpen, onClose }: StudentSidebarProps) => {
    return <StudentSidebarContent isOpen={isOpen} onClose={onClose} />;
};

import { useI18n } from "@/i18n/I18nProvider";

const StudentSidebarContent = ({ isOpen, onClose }: StudentSidebarProps) => {
    const { t } = useI18n();

    const studentMenuItems: MenuItem[] = [
        {
            title: t("nav.start"),
            icon: LayoutDashboard,
            href: "/student",
        },
        {
            title: t("nav.my_progress"),
            icon: TrendingUp,
            href: "/student/progresso",
        },
        {
            title: t("nav.achievements"),
            icon: Trophy,
            href: "/student/conquistas",
        },
        {
            title: t("nav.ranking"),
            icon: Award,
            href: "/student/ranking",
        },
        {
            title: t("nav.my_courses"),
            icon: BookOpen,
            href: "/student/courses",
        },
        {
            title: t("nav.lessons"),
            icon: GraduationCap,
            href: "/student/lessons",
        },
        {
            title: t("nav.exams"),
            icon: FileText,
            href: "/student/exams",
        },
        {
            title: t("nav.transcript"),
            icon: ScrollText,
            href: "/student/historico",
        },
        {
            title: t("nav.certificates"),
            icon: Award,
            href: "/student/certificados",
        },
        {
            title: t("nav.financial"),
            icon: CreditCard,
            href: "/student/financeiro",
        },
        {
            title: t("nav.calendar"),
            icon: Calendar,
            href: "/student/calendar",
        },
        {
            title: t("nav.support"),
            icon: HelpCircle,
            href: "/student/support",
        },
    ];

    return <AppSidebar isOpen={isOpen} onClose={onClose} menuItems={studentMenuItems} />;
}

export default StudentSidebar;
