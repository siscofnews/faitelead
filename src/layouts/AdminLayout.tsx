import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
        // Fallback: tentar Supabase auth
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: roles } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", user.id);
            const r = (roles || []).map((x: any) => x.role);
            const isSuper = r.includes("super_admin");
            const isAdmin = r.includes("admin");
            setProfile({ full_name: user.email || "Admin" });
            setUserRole(isSuper ? "super_admin" : (isAdmin ? "admin" : "admin"));
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
