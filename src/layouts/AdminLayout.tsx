import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getRoles } from "@/lib/demoAuth";
import { toast } from "sonner";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";

const AdminLayout = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [userRole, setUserRole] = useState<string>("admin");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        // VERIFICAR AUTH MOCK PRIMEIRO!
        const roles = getRoles();

        // Se tem roles no localStorage (AUTH MOCK), usar isso!
        if (roles.length > 0) {
            // Pegar email do localStorage também
            const demoUserStr = localStorage.getItem("demoUser");
            const demoUser = demoUserStr ? JSON.parse(demoUserStr) : null;
            const email = demoUser?.email || "Admin";

            if (roles.includes("super_admin")) {
                setProfile({ full_name: email });
                setUserRole("super_admin");
                setLoading(false);
                return;
            }
            if (roles.includes("admin")) {
                setProfile({ full_name: email });
                setUserRole("admin");
                setLoading(false);
                return;
            }
        }

        // Fallback: tentar Supabase auth
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setProfile({ full_name: user.email || "Admin" });
            setUserRole("admin");
            setLoading(false);
            return;
        }

        // Último fallback
        setProfile({ full_name: "Admin Demo" });
        setUserRole("admin");
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/auth");
        toast.success("Logout realizado com sucesso!");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-primary-foreground text-lg font-medium">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader
                userName={profile?.full_name || "Admin"}
                userRole={userRole}
                onLogout={handleLogout}
                onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isSuperAdmin={userRole === "super_admin"}
            />

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <main className="md:ml-64 p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
