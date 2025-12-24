import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, UserCheck, Shield, School, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfessorApprovalQueue } from "./ProfessorApprovalQueue";
import { PermissionsManager } from "./PermissionsManager";
import { StaffList } from "./StaffList";

interface Polo {
    id: string;
    name: string;
    city: string;
    state: string;
}

const PoloDirectorDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [polo, setPolo] = useState<Polo | null>(null);
    const [stats, setStats] = useState({
        professors: 0,
        students: 0,
        pendingApprovals: 0
    });

    useEffect(() => {
        loadPoloData();
    }, []);

    const loadPoloData = async () => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) return;

            // Find polo where user is director
            const { data: staffData, error: staffError } = await supabase
                .from('polo_staff')
                .select('polo_id, polos(id, name, city, state)')
                .eq('user_id', userData.user.id)
                .eq('staff_role', 'director')
                .eq('is_active', true)
                .single();

            if (staffError) throw staffError;

            if (staffData && staffData.polos) {
                // @ts-ignore - Supabase types might need update
                setPolo(staffData.polos);
                loadStats(staffData.polo_id);
            }
        } catch (error) {
            console.error('Error loading polo data:', error);
            toast.error('Erro ao carregar dados do polo');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async (poloId: string) => {
        try {
            // Count professors
            const { count: profCount } = await supabase
                .from('polo_staff')
                .select('*', { count: 'exact', head: true })
                .eq('polo_id', poloId)
                .eq('staff_role', 'teacher')
                .eq('is_active', true);

            // Count pending approvals
            const { count: approvalCount } = await supabase
                .from('professor_approvals')
                .select('*', { count: 'exact', head: true })
                .eq('polo_id', poloId)
                .eq('status', 'pending');

            setStats({
                professors: profCount || 0,
                students: 0, // TODO: Implement student count by polo
                pendingApprovals: approvalCount || 0
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando painel...</div>;
    if (!polo) return <div className="p-8 text-center">Você não administra nenhum polo.</div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Painel do Diretor</h1>
                    <p className="text-muted-foreground">
                        Gerenciando Polo: {polo.name} ({polo.city}/{polo.state})
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Professores</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.professors}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aprovações Pendentes</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
                        {stats.pendingApprovals > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Professores aguardando aprovação
                            </p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
                        <School className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Em breve
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="approvals" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="approvals">Aprovações</TabsTrigger>
                    <TabsTrigger value="staff">Equipe</TabsTrigger>
                    <TabsTrigger value="permissions">Permissões</TabsTrigger>
                </TabsList>

                <TabsContent value="approvals" className="space-y-4">
                    <ProfessorApprovalQueue poloId={polo.id} />
                </TabsContent>

                <TabsContent value="staff" className="space-y-4">
                    <StaffList poloId={polo.id} />
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4">
                    <PermissionsManager poloId={polo.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PoloDirectorDashboard;
