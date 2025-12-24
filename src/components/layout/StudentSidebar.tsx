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

const studentMenuItems: MenuItem[] = [
    {
        title: "Início",
        icon: LayoutDashboard,
        href: "/student",
    },
    {
        title: "Meu Progresso",
        icon: TrendingUp,
        href: "/student/progresso",
    },
    {
        title: "Conquistas",
        icon: Trophy,
        href: "/student/conquistas",
    },
    {
        title: "Ranking",
        icon: Award,
        href: "/student/ranking",
    },
    {
        title: "Meus Cursos",
        icon: BookOpen,
        href: "/student/courses",
    },
    {
        title: "Aulas",
        icon: GraduationCap,
        href: "/student/lessons",
    },
    {
        title: "Provas",
        icon: FileText,
        href: "/student/exams",
    },
    {
        title: "Histórico",
        icon: ScrollText,
        href: "/student/historico",
    },
    {
        title: "Certificados",
        icon: Award,
        href: "/student/certificados",
    },
    {
        title: "Financeiro",
        icon: CreditCard,
        href: "/student/financeiro",
    },
    {
        title: "Calendário",
        icon: Calendar,
        href: "/student/calendar",
    },
    {
        title: "Suporte",
        icon: HelpCircle,
        href: "/student/support",
    },
];

const StudentSidebar = ({ isOpen, onClose }: StudentSidebarProps) => {
    return <AppSidebar isOpen={isOpen} onClose={onClose} menuItems={studentMenuItems} />;
};

export default StudentSidebar;
