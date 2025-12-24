import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  DollarSign,
  Building2,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Calendar,
  Video,
  MessageSquare,
  Award,
  UserCog,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const menuItems = [
  { 
    title: "Dashboard", 
    icon: LayoutDashboard, 
    path: "/admin",
    exact: true
  },
  { 
    title: "Aprovações", 
    icon: UserCheck, 
    path: "/admin/aprovacoes",
    badge: "pending"
  },
  { 
    title: "Alunos", 
    icon: Users, 
    path: "/admin/alunos" 
  },
  { 
    title: "Professores", 
    icon: UserCog, 
    path: "/admin/professores" 
  },
  { 
    title: "Cursos", 
    icon: GraduationCap, 
    path: "/admin/cursos" 
  },
  { 
    title: "Módulos", 
    icon: BookOpen, 
    path: "/admin/modulos" 
  },
  { 
    title: "Aulas", 
    icon: Video, 
    path: "/admin/aulas" 
  },
  { 
    title: "Provas", 
    icon: FileText, 
    path: "/admin/provas" 
  },
  { 
    title: "Certificados", 
    icon: Award, 
    path: "/admin/certificados" 
  },
  { 
    title: "Financeiro", 
    icon: DollarSign, 
    path: "/admin/financeiro" 
  },
  { 
    title: "Polos", 
    icon: Building2, 
    path: "/admin/polos" 
  },
  { 
    title: "Comunicados", 
    icon: Bell, 
    path: "/admin/comunicados" 
  },
  { 
    title: "Calendário", 
    icon: Calendar, 
    path: "/admin/calendario" 
  },
  { 
    title: "Relatórios", 
    icon: BarChart3, 
    path: "/admin/relatorios" 
  },
  { 
    title: "Configurações", 
    icon: Settings, 
    path: "/admin/configuracoes" 
  },
];

interface AdminSidebarProps {
  pendingApprovals?: number;
}

const AdminSidebar = ({ pendingApprovals = 0 }: AdminSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  const isActive = (item: typeof menuItems[0]) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-6 border-b border-border",
        collapsed && "justify-center px-2"
      )}>
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-display font-bold text-lg">FAITEL</h1>
            <p className="text-xs text-muted-foreground">Painel Admin</p>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
              "hover:bg-primary/10 hover:text-primary",
              isActive(item) 
                ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" 
                : "text-muted-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "h-6 w-6")} />
            {!collapsed && (
              <span className="flex-1 text-sm font-medium">{item.title}</span>
            )}
            {!collapsed && item.badge === "pending" && pendingApprovals > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-destructive text-destructive-foreground rounded-full">
                {pendingApprovals}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn("p-4 border-t border-border", collapsed && "px-2")}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 md:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex fixed left-0 top-0 h-full bg-card border-r border-border flex-col transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent />
        
        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-card shadow-sm"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </aside>

      {/* Spacer for content */}
      <div className={cn(
        "hidden md:block transition-all duration-300 flex-shrink-0",
        collapsed ? "w-16" : "w-64"
      )} />
    </>
  );
};

export default AdminSidebar;
