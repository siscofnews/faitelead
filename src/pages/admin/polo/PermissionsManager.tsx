import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface StaffPermission {
    user_id: string;
    user: {
        full_name: string;
        avatar_url: string | null;
        email: string;
    };
    permissions: {
        create_lessons: boolean;
        create_exams: boolean;
        add_questions: boolean;
        manage_students: boolean;
        view_reports: boolean;
    };
}

export const PermissionsManager = ({ poloId }: { poloId: string }) => {
    const [staffPermissions, setStaffPermissions] = useState<StaffPermission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPermissions();
    }, [poloId]);

    const loadPermissions = async () => {
        try {
            // 1. Get all active staff
            const { data: staffData, error: staffError } = await supabase
                .from('polo_staff')
                .select(`
          user_id,
          user:user_id(full_name, email, avatar_url)
        `)
                .eq('polo_id', poloId)
                .eq('is_active', true)
                .neq('staff_role', 'director'); // Directors have all permissions by default

            if (staffError) throw staffError;

            // 2. Get existing permissions
            const { data: permData, error: permError } = await supabase
                .from('staff_permissions')
                .select('*')
                .eq('polo_id', poloId)
                .eq('is_active', true);

            if (permError) throw permError;

            // 3. Merge data
            const merged = (staffData || []).map(staff => {
                const userPerms = (permData || []).filter(p => p.user_id === staff.user_id);

                return {
                    user_id: staff.user_id,
                    user: Array.isArray(staff.user) ? staff.user[0] : staff.user,
                    permissions: {
                        create_lessons: userPerms.some(p => p.permission_type === 'create_lessons'),
                        create_exams: userPerms.some(p => p.permission_type === 'create_exams'),
                        add_questions: userPerms.some(p => p.permission_type === 'add_questions'),
                        manage_students: userPerms.some(p => p.permission_type === 'manage_students'),
                        view_reports: userPerms.some(p => p.permission_type === 'view_reports'),
                    }
                };
            });

            setStaffPermissions(merged);
        } catch (error) {
            console.error('Error loading permissions:', error);
            toast.error('Erro ao carregar permissões');
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = async (userId: string, permissionType: string, currentValue: boolean) => {
        try {
            const { data: userData } = await supabase.auth.getUser();

            if (currentValue) {
                // Remove permission
                const { error } = await supabase
                    .from('staff_permissions')
                    .update({ is_active: false })
                    .eq('polo_id', poloId)
                    .eq('user_id', userId)
                    .eq('permission_type', permissionType);

                if (error) throw error;
            } else {
                // Add permission
                // First check if exists inactive
                const { data: existing } = await supabase
                    .from('staff_permissions')
                    .select('id')
                    .eq('polo_id', poloId)
                    .eq('user_id', userId)
                    .eq('permission_type', permissionType)
                    .maybeSingle();

                if (existing) {
                    await supabase
                        .from('staff_permissions')
                        .update({ is_active: true, granted_by: userData.user?.id })
                        .eq('id', existing.id);
                } else {
                    await supabase
                        .from('staff_permissions')
                        .insert({
                            polo_id: poloId,
                            user_id: userId,
                            permission_type: permissionType,
                            granted_by: userData.user?.id
                        });
                }
            }

            // Update local state
            setStaffPermissions(prev => prev.map(staff => {
                if (staff.user_id === userId) {
                    return {
                        ...staff,
                        permissions: {
                            ...staff.permissions,
                            [permissionType]: !currentValue
                        }
                    };
                }
                return staff;
            }));

            toast.success('Permissão atualizada');
        } catch (error) {
            console.error('Error toggling permission:', error);
            toast.error('Erro ao atualizar permissão');
        }
    };

    if (loading) return <div>Carregando permissões...</div>;

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold">Gerenciamento de Permissões</h3>
                <p className="text-sm text-muted-foreground">
                    Controle o que cada membro da equipe pode fazer no sistema.
                </p>
            </div>

            {staffPermissions.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        Nenhum membro elegível para permissões (diretores têm acesso total).
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {staffPermissions.map((staff) => (
                        <Card key={staff.user_id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={staff.user.avatar_url || undefined} />
                                        <AvatarFallback><Shield /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base">{staff.user.full_name}</CardTitle>
                                        <CardDescription>{staff.user.email}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                        <Label htmlFor={`lessons-${staff.user_id}`} className="flex flex-col">
                                            <span>Criar Aulas</span>
                                            <span className="font-normal text-xs text-muted-foreground">Gerenciar conteúdo</span>
                                        </Label>
                                        <Switch
                                            id={`lessons-${staff.user_id}`}
                                            checked={staff.permissions.create_lessons}
                                            onCheckedChange={() => togglePermission(staff.user_id, 'create_lessons', staff.permissions.create_lessons)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                        <Label htmlFor={`exams-${staff.user_id}`} className="flex flex-col">
                                            <span>Criar Provas</span>
                                            <span className="font-normal text-xs text-muted-foreground">Gerenciar avaliações</span>
                                        </Label>
                                        <Switch
                                            id={`exams-${staff.user_id}`}
                                            checked={staff.permissions.create_exams}
                                            onCheckedChange={() => togglePermission(staff.user_id, 'create_exams', staff.permissions.create_exams)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                        <Label htmlFor={`questions-${staff.user_id}`} className="flex flex-col">
                                            <span>Banco de Questões</span>
                                            <span className="font-normal text-xs text-muted-foreground">Adicionar questões</span>
                                        </Label>
                                        <Switch
                                            id={`questions-${staff.user_id}`}
                                            checked={staff.permissions.add_questions}
                                            onCheckedChange={() => togglePermission(staff.user_id, 'add_questions', staff.permissions.add_questions)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                        <Label htmlFor={`students-${staff.user_id}`} className="flex flex-col">
                                            <span>Gerenciar Alunos</span>
                                            <span className="font-normal text-xs text-muted-foreground">Matrículas e dados</span>
                                        </Label>
                                        <Switch
                                            id={`students-${staff.user_id}`}
                                            checked={staff.permissions.manage_students}
                                            onCheckedChange={() => togglePermission(staff.user_id, 'manage_students', staff.permissions.manage_students)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                        <Label htmlFor={`reports-${staff.user_id}`} className="flex flex-col">
                                            <span>Ver Relatórios</span>
                                            <span className="font-normal text-xs text-muted-foreground">Acesso a métricas</span>
                                        </Label>
                                        <Switch
                                            id={`reports-${staff.user_id}`}
                                            checked={staff.permissions.view_reports}
                                            onCheckedChange={() => togglePermission(staff.user_id, 'view_reports', staff.permissions.view_reports)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
