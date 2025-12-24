/**
 * Mock implementation for student enrollment (development/testing)
 * Permite testar o sistema sem precisar do Supabase
 */

export interface MockStudent {
    id: string;
    full_name: string;
    email: string;
    birth_date: string;
    country: string;
    document_type: string;
    document_number: string;
    photo_url: string | null;
    is_active: boolean;
    created_at: string;
    password_hash: string; // Para mock, vamos guardar a senha
}

const STORAGE_KEY = 'mock_students';

/**
 * Obter todos os alunos mock
 */
export function getMockStudents(): MockStudent[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
}

/**
 * Salvar alunos mock
 */
export function saveMockStudents(students: MockStudent[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

/**
 * Adicionar aluno mock
 */
export function addMockStudent(studentData: Omit<MockStudent, 'id' | 'created_at'>): MockStudent {
    const students = getMockStudents();

    // Verificar se email já existe
    if (students.some(s => s.email === studentData.email)) {
        throw new Error('Email já cadastrado');
    }

    // Verificar se documento já existe
    if (students.some(s => s.document_number === studentData.document_number)) {
        throw new Error('Documento já cadastrado');
    }

    const newStudent: MockStudent = {
        ...studentData,
        id: `mock-student-${Date.now()}`,
        created_at: new Date().toISOString(),
    };

    students.push(newStudent);
    saveMockStudents(students);

    return newStudent;
}

/**
 * Atualizar aluno mock
 */
export function updateMockStudent(id: string, updates: Partial<MockStudent>): MockStudent | null {
    const students = getMockStudents();
    const index = students.findIndex(s => s.id === id);

    if (index === -1) return null;

    students[index] = { ...students[index], ...updates };
    saveMockStudents(students);

    return students[index];
}

/**
 * Deletar aluno mock
 */
export function deleteMockStudent(id: string): boolean {
    const students = getMockStudents();
    const filtered = students.filter(s => s.id !== id);

    if (filtered.length === students.length) return false;

    saveMockStudents(filtered);
    return true;
}

/**
 * Buscar aluno por email
 */
export function findMockStudentByEmail(email: string): MockStudent | null {
    const students = getMockStudents();
    return students.find(s => s.email === email) || null;
}

/**
 * Buscar aluno por documento
 */
export function findMockStudentByDocument(documentNumber: string): MockStudent | null {
    const students = getMockStudents();
    return students.find(s => s.document_number === documentNumber) || null;
}

/**
 * Limpar todos os alunos mock
 */
export function clearMockStudents(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Criar alunos de exemplo
 */
export function createSampleStudents(): void {
    const samples: Omit<MockStudent, 'id' | 'created_at'>[] = [
        {
            full_name: 'João da Silva',
            email: 'joao.silva@example.com',
            birth_date: '2000-05-15',
            country: 'Brasil',
            document_type: 'CPF',
            document_number: '12345678909',
            photo_url: null,
            is_active: true,
            password_hash: 'senha123',
        },
        {
            full_name: 'Maria Santos',
            email: 'maria.santos@example.com',
            birth_date: '1998-08-22',
            country: 'Portugal',
            document_type: 'NIF',
            document_number: '123456789',
            photo_url: null,
            is_active: true,
            password_hash: 'senha123',
        },
        {
            full_name: 'Pierre Dubois',
            email: 'pierre.dubois@example.com',
            birth_date: '1995-12-03',
            country: 'França',
            document_type: 'NIR',
            document_number: '185127512345678',
            photo_url: null,
            is_active: true,
            password_hash: 'senha123',
        },
    ];

    clearMockStudents();
    samples.forEach(student => {
        try {
            addMockStudent(student);
        } catch (error) {
            console.log('Sample student already exists:', student.email);
        }
    });
}
