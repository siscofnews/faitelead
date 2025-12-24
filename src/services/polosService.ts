/**
 * API functions for Polos management
 */
import { supabase } from '@/integrations/supabase/client';

export interface Polo {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    is_international: boolean;
    cep: string | null;
    street: string | null;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string;
    state: string | null;
    country: string;
    director_name: string;
    director_email: string;
    director_user_id: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreatePoloData {
    name: string;
    email: string;
    phone?: string;
    is_international?: boolean;
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state?: string;
    country?: string;
    director_name: string;
    director_email: string;
}

/**
 * List all polos
 */
export async function listPolos() {
    const { data, error } = await supabase
        .from('polos')
        .select('*')
        .order('name');

    if (error) throw error;
    return data as Polo[];
}

/**
 * Get polo by ID
 */
export async function getPolo(id: string) {
    const { data, error } = await supabase
        .from('polos')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as Polo;
}

/**
 * Create new polo
 */
export async function createPolo(poloData: CreatePoloData) {
    const { data, error } = await supabase
        .from('polos')
        .insert({
            ...poloData,
            country: poloData.country || 'Brasil',
        })
        .select()
        .single();

    if (error) throw error;
    return data as Polo;
}

/**
 * Update polo
 */
export async function updatePolo(id: string, updates: Partial<CreatePoloData>) {
    const { data, error } = await supabase
        .from('polos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Polo;
}

/**
 * Delete polo
 */
export async function deletePolo(id: string) {
    const { error } = await supabase
        .from('polos')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Get students count for polo
 */
export async function getPoloStudentsCount(poloId: string) {
    const { count, error } = await supabase
        .from('student_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('polo_id', poloId);

    if (error) throw error;
    return count || 0;
}

/**
 * Get students assigned to polo
 */
export async function getPoloStudents(poloId: string) {
    const { data, error } = await supabase
        .from('student_assignments')
        .select(`
      *,
      profiles:student_id (
        id,
        full_name,
        email
      )
    `)
        .eq('polo_id', poloId);

    if (error) throw error;
    return data;
}

/**
 * Assign student to polo
 */
export async function assignStudentToPolo(studentId: string, poloId: string) {
    const { data, error } = await supabase
        .from('student_assignments')
        .upsert({
            student_id: studentId,
            assignment_type: 'polo',
            polo_id: poloId,
            nucleo_id: null,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}
