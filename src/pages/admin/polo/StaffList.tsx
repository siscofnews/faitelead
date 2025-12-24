import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Shield, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface StaffMember {
    id: string;
    user_id: string;
    staff_role: 'director' | 'secretary' | 'treasurer' | 'teacher';
    user: {
        full_name: string;
        email: string;
        avatar_url: string | null;
    };
}

export const StaffList = ({ poloId }: { poloId: string }) => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStaff();
    }, [poloId]);

    const loadStaff = async () => {
        try {
            const { data, error } = await supabase
                .from('polo_staff')
                .select(`
          id,
          user_id,
          staff_role,
          user:user_id(full_name, email, avatar_url)
        `)
                .eq('polo_id', poloId)
                .eq('is_active', true)
                .order('staff_role');

            if (error) throw error;

            // Transform data to match interface
            const transformed = (data || []).map(item => ({
                id: item.id,
                user_id: item.user_id,
                staff_role: item.staff_role as StaffMember["staff_role"],
                user: Array.isArray(item.user) ? item.user[0] : item.user
            }));

            setStaff(transformed);
        } catch (error) {
            console.error('Error loading staff:', error);
            toast.error('Erro ao carregar equipe');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (memberId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('polo_staff')
                .update({ staff_role: newRole })
                .eq('id', memberId);

            if (error) throw error;
            toast.success('Função atualizada');
            loadStaff();
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Erro ao atualizar função');
        }
    };

    const handleRemove = async (memberId: string, name: string) => {
        if (!confirm(`Tem certeza que deseja remover ${name} da equipe?`)) return;

        try {
            const { error } = await supabase
                .from('polo_staff')
                .update({ is_active: false })
                .eq('id', memberId);

            if (error) throw error;
            toast.success('Membro removido');
            loadStaff();
        } catch (error) {
            console.error('Error removing member:', error);
            toast.error('Erro ao remover membro');
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'director': return <Badge className="bg-purple-600">Diretor</Badge>;
            case 'secretary': return <Badge className="bg-blue-600">Secretaria</Badge>;
            case 'treasurer': return <Badge className="bg-green-600">Tesouraria</Badge>;
            case 'teacher': return <Badge variant="outline">Professor</Badge>;
            default: return <Badge variant="secondary">{role}</Badge>;
        }
    };

    if (loading) return <div>Carregando equipe...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Membros da Equipe</h3>
                {/* Add Invite Member button here if needed */}
            </div>

            {staff.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        Nenhum membro na equipe.
                    </CardContent>
                </Card>
            ) : (
                staff.map((member) => (
                    <Card key={member.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={member.user.avatar_url || undefined} />
                                    <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold">{member.user.full_name}</h4>
                                        {getRoleBadge(member.staff_role)}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        {member.user.email}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {member.staff_role !== 'director' && (
                                    <>
                                        <Select
                                            defaultValue={member.staff_role}
                                            onValueChange={(value) => handleRoleChange(member.id, value)}
                                        >
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="secretary">Secretaria</SelectItem>
                                                <SelectItem value="treasurer">Tesouraria</SelectItem>
                                                <SelectItem value="teacher">Professor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleRemove(member.id, member.user.full_name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
};
