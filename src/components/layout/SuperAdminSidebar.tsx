import {
    LayoutDashboard,
    Settings,
    CreditCard,
    Globe,
    Building,
    Users,
    Palette
} from "lucide-react";
import AppSidebar, { MenuItem } from "./AppSidebar";

interface SuperAdminSidebarProps {
    isOpen: boolean;
    onClose?: () => void;
}

const superAdminMenuItems: MenuItem[] = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/superadmin",
    },
    {
        title: "Geral",
        icon: Globe,
        href: "/superadmin/geral",
    },
    {
        title: "Matrizes",
        icon: Building,
        href: "/superadmin/matrizes",
    },

    {
        title: "Usuários",
        icon: Users,
        href: "/superadmin/usuarios",
    },
    {
        title: "Branding",
        icon: Palette,
        href: "/superadmin/branding",
    },
    {
        title: "Financeiro",
        icon: CreditCard,
        href: "/superadmin/financeiro",
    },
    {
        title: "Configurações",
        icon: Settings,
        href: "/superadmin/config",
    },
];



const SuperAdminSidebar = ({ isOpen, onClose }: SuperAdminSidebarProps) => {
    return <AppSidebar isOpen={isOpen} onClose={onClose} menuItems={superAdminMenuItems} isSuperAdmin={true} />;
};

export default SuperAdminSidebar;
