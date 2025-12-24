/**
 * Serviço de upload de fotos de alunos
 */
import { supabase } from '@/integrations/supabase/client';

export interface PhotoUploadResult {
    url: string;
    path: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Valida arquivo de foto
 */
export function validatePhotoFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return 'Formato inválido. Use JPG, PNG ou WebP';
    }

    if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
        return `Foto muito grande. Máximo ${sizeMB}MB`;
    }

    return null;
}

/**
 * Faz upload da foto do aluno para o Supabase Storage
 */
export async function uploadStudentPhoto(
    studentId: string,
    file: File
): Promise<PhotoUploadResult> {
    // Validar arquivo
    const validationError = validatePhotoFile(file);
    if (validationError) {
        throw new Error(validationError);
    }

    // Gerar nome do arquivo
    const ext = file.name.split('.').pop();
    const path = `${studentId}/photo.${ext}`;

    // Upload para o bucket
    const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(path, file, {
            upsert: true,
            contentType: file.type
        });

    if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Erro ao fazer upload da foto');
    }

    // Obter URL pública
    const { data } = supabase.storage
        .from('student-photos')
        .getPublicUrl(path);

    return {
        url: data.publicUrl,
        path
    };
}

/**
 * Deleta foto do aluno
 */
export async function deleteStudentPhoto(studentId: string): Promise<void> {
    // Listar arquivos do aluno
    const { data: files, error: listError } = await supabase.storage
        .from('student-photos')
        .list(studentId);

    if (listError) {
        console.error('List error:', listError);
        return;
    }

    if (!files || files.length === 0) return;

    // Deletar todos os arquivos
    const filePaths = files.map(f => `${studentId}/${f.name}`);
    const { error: deleteError } = await supabase.storage
        .from('student-photos')
        .remove(filePaths);

    if (deleteError) {
        console.error('Delete error:', deleteError);
        throw new Error('Erro ao deletar foto');
    }
}

/**
 * Cria preview de imagem para exibição antes do upload
 */
export function createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            resolve(reader.result as string);
        };

        reader.onerror = () => {
            reject(new Error('Erro ao ler arquivo'));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Comprime imagem se necessário
 */
export async function compressImage(file: File, maxWidth: number = 800): Promise<File> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Redimensionar se necessário
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else {
                            resolve(file);
                        }
                    },
                    file.type,
                    0.8 // qualidade 80%
                );
            };
            img.src = e.target?.result as string;
        };

        reader.readAsDataURL(file);
    });
}
