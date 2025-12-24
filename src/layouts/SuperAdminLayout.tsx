import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getRoles } from "@/lib/demoAuth";
import { toast } from "sonner";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SuperAdminSidebar from "@/components/layout/SuperAdminSidebar";

const SuperAdminLayout = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [userRole, setUserRole] = useState<string>("super_admin");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const roles = getRoles();

        if (!user) {
            setProfile({ full_name: "Super Admin Demo" });
            setUserRole("super_admin");
            setLoading(false);
            return;
        }

        if (roles.includes("super_admin")) {
            setProfile({ full_name: user.email || "Super Admin" });
            setUserRole("super_admin");
            setLoading(false);
            return;
        }

        if (roles.includes("admin")) {
            setProfile({ full_name: user.email || "Admin" });
            setUserRole("super_admin");
            setLoading(false);
            return;
        }

        setProfile({ full_name: "Super Admin Demo" });
        setUserRole("super_admin");
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
                userName={profile?.full_name || "Super Admin"}
                userRole={userRole}
                onLogout={handleLogout}
                onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            <SuperAdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
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

export default SuperAdminLayout;
