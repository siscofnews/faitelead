/**
 * Mock implementation for LMS - Testing without Supabase
 */

export interface MockModule {
    id: string;
    course_id: string;
    title: string;
    description: string;
    order_index: number;
    passing_grade: number;
    status: 'locked' | 'in_progress' | 'completed';
    lessons_total: number;
    lessons_completed: number;
    final_exam_score: number | null;
}

export interface MockExam {
    id: string;
    module_id: string;
    title: string;
    exam_type: 'simulado' | 'prova_final';
    total_questions: number;
    duration_minutes: number;
    passing_grade: number;
    attempts_allowed: number;
}

export interface MockQuestion {
    id: string;
    exam_id: string;
    question_text: string;
    question_type: 'multiple_choice' | 'true_false';
    options?: Array<{
        id: string;
        text: string;
        is_correct: boolean;
    }>;
    correct_answer?: string;
    points: number;
}

export interface MockExamAttempt {
    id: string;
    student_id: string;
    exam_id: string;
    attempt_number: number;
    started_at: string;
    completed_at: string | null;
    score: number | null;
    percentage: number | null;
    passed: boolean | null;
    answers: Array<{
        question_id: string;
        answer: string;
    }>;
    status: 'in_progress' | 'completed';
}

const MODULES_KEY = 'mock_lms_modules';
const EXAMS_KEY = 'mock_lms_exams';
const QUESTIONS_KEY = 'mock_lms_questions';
const ATTEMPTS_KEY = 'mock_lms_attempts';

// ============================================
// Módulos
// ============================================

export function getMockModules(courseId?: string): MockModule[] {
    const stored = localStorage.getItem(MODULES_KEY);
    if (!stored) return [];
    const modules = JSON.parse(stored);
    return courseId ? modules.filter((m: MockModule) => m.course_id === courseId) : modules;
}

export function saveMockModules(modules: MockModule[]): void {
    localStorage.setItem(MODULES_KEY, JSON.stringify(modules));
}

export function updateModuleProgress(moduleId: string, updates: Partial<MockModule>): void {
    const modules = getMockModules();
    const index = modules.findIndex(m => m.id === moduleId);
    if (index !== -1) {
        modules[index] = { ...modules[index], ...updates };
        saveMockModules(modules);
    }
}

export function unlockNextModule(currentModuleId: string): boolean {
    const modules = getMockModules();
    const currentModule = modules.find(m => m.id === currentModuleId);
    if (!currentModule) return false;

    // Marcar atual como completo
    updateModuleProgress(currentModuleId, { status: 'completed' });

    // Buscar próximo módulo
    const nextModule = modules.find(
        m => m.course_id === currentModule.course_id &&
            m.order_index === currentModule.order_index + 1
    );

    if (nextModule) {
        updateModuleProgress(nextModule.id, { status: 'in_progress' });
        return true;
    }

    return false; // Era o último módulo
}

// ============================================
// Exames
// ============================================

export function getMockExams(moduleId?: string): MockExam[] {
    const stored = localStorage.getItem(EXAMS_KEY);
    if (!stored) return [];
    const exams = JSON.parse(stored);
    return moduleId ? exams.filter((e: MockExam) => e.module_id === moduleId) : exams;
}

export function saveMockExams(exams: MockExam[]): void {
    localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
}

// ============================================
// Questões
// ============================================

export function getMockQuestions(examId: string): MockQuestion[] {
    const stored = localStorage.getItem(QUESTIONS_KEY);
    if (!stored) return [];
    const questions = JSON.parse(stored);
    return questions.filter((q: MockQuestion) => q.exam_id === examId);
}

export function saveMockQuestions(questions: MockQuestion[]): void {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
}

// ============================================
// Tentativas de Prova
// ============================================

export function getMockAttempts(examId?: string): MockExamAttempt[] {
    const stored = localStorage.getItem(ATTEMPTS_KEY);
    if (!stored) return [];
    const attempts = JSON.parse(stored);
    return examId ? attempts.filter((a: MockExamAttempt) => a.exam_id === examId) : attempts;
}

export function saveMockAttempts(attempts: MockExamAttempt[]): void {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

export function startExamAttempt(studentId: string, examId: string): MockExamAttempt {
    const attempts = getMockAttempts(examId);
    const attemptNumber = attempts.length + 1;

    const newAttempt: MockExamAttempt = {
        id: `attempt-${Date.now()}`,
        student_id: studentId,
        exam_id: examId,
        attempt_number: attemptNumber,
        started_at: new Date().toISOString(),
        completed_at: null,
        score: null,
        percentage: null,
        passed: null,
        answers: [],
        status: 'in_progress',
    };

    const allAttempts = getMockAttempts();
    allAttempts.push(newAttempt);
    saveMockAttempts(allAttempts);

    return newAttempt;
}

export function submitExamAttempt(attemptId: string): {
    score: number;
    max_score: number;
    percentage: number;
    passed: boolean;
} {
    const allAttempts = getMockAttempts();
    const attempt = allAttempts.find(a => a.id === attemptId);
    if (!attempt) throw new Error('Tentativa não encontrada');

    const exam = getMockExams().find(e => e.id === attempt.exam_id);
    if (!exam) throw new Error('Prova não encontrada');

    const questions = getMockQuestions(exam.id);

    let score = 0;
    let maxScore = 0;

    questions.forEach(question => {
        maxScore += question.points;
        const answer = attempt.answers.find(a => a.question_id === question.id);

        if (answer) {
            if (question.question_type === 'multiple_choice') {
                const correctOption = question.options?.find(o => o.is_correct);
                if (correctOption && correctOption.id === answer.answer) {
                    score += question.points;
                }
            } else if (question.question_type === 'true_false') {
                if (question.correct_answer === answer.answer) {
                    score += question.points;
                }
            }
        }
    });

    const percentage = (score / maxScore) * 100;
    const passed = percentage >= exam.passing_grade;

    // Atualizar tentativa
    const attemptIndex = allAttempts.findIndex(a => a.id === attemptId);
    allAttempts[attemptIndex] = {
        ...attempt,
        completed_at: new Date().toISOString(),
        score,
        percentage,
        passed,
        status: 'completed',
    };
    saveMockAttempts(allAttempts);

    // Se passou na prova final, desbloquear próximo módulo
    if (exam.exam_type === 'prova_final' && passed) {
        updateModuleProgress(exam.module_id, {
            final_exam_score: percentage,
            status: 'completed'
        });
        unlockNextModule(exam.module_id);
    }

    return { score, max_score: maxScore, percentage, passed };
}

// ============================================
// Criar Dados de Exemplo
// ============================================

export function createSampleLMSData(): void {
    // Módulos
    const modules: MockModule[] = [
        {
            id: 'mod-1',
            course_id: 'mock-1', // Teologia Básica
            title: 'Módulo 1: Introdução à Teologia',
            description: 'Fundamentos básicos da teologia cristã',
            order_index: 0,
            passing_grade: 70,
            status: 'in_progress',
            lessons_total: 8,
            lessons_completed: 0,
            final_exam_score: null,
        },
        {
            id: 'mod-2',
            course_id: 'mock-1',
            title: 'Módulo 2: Teologia Sistemática',
            description: 'Estudo aprofundado das doutrinas',
            order_index: 1,
            passing_grade: 70,
            status: 'locked',
            lessons_total: 10,
            lessons_completed: 0,
            final_exam_score: null,
        },
        {
            id: 'mod-3',
            course_id: 'mock-1',
            title: 'Módulo 3: Aplicação Prática',
            description: 'Como aplicar os conhecimentos',
            order_index: 2,
            passing_grade: 70,
            status: 'locked',
            lessons_total: 6,
            lessons_completed: 0,
            final_exam_score: null,
        },
    ];

    // Exames
    const exams: MockExam[] = [
        {
            id: 'exam-1',
            module_id: 'mod-1',
            title: 'Prova Final - Módulo 1',
            exam_type: 'prova_final',
            total_questions: 10,
            duration_minutes: 60,
            passing_grade: 70,
            attempts_allowed: 3,
        },
    ];

    // Questões
    const questions: MockQuestion[] = [
        {
            id: 'q1',
            exam_id: 'exam-1',
            question_text: 'O que significa a palavra "Teologia"?',
            question_type: 'multiple_choice',
            options: [
                { id: 'a', text: 'Estudo de Deus', is_correct: true },
                { id: 'b', text: 'Estudo da natureza', is_correct: false },
                { id: 'c', text: 'Estudo do homem', is_correct: false },
                { id: 'd', text: 'Estudo da filosofia', is_correct: false },
            ],
            points: 1,
        },
        {
            id: 'q2',
            exam_id: 'exam-1',
            question_text: 'A Bíblia é dividida em quantos testamentos?',
            question_type: 'multiple_choice',
            options: [
                { id: 'a', text: 'Um', is_correct: false },
                { id: 'b', text: 'Dois', is_correct: true },
                { id: 'c', text: 'Três', is_correct: false },
                { id: 'd', text: 'Quatro', is_correct: false },
            ],
            points: 1,
        },
        {
            id: 'q3',
            exam_id: 'exam-1',
            question_text: 'A Trindade é composta por Pai, Filho e Espírito Santo?',
            question_type: 'true_false',
            correct_answer: 'true',
            points: 1,
        },
        {
            id: 'q4',
            exam_id: 'exam-1',
            question_text: 'Jesus Cristo é o fundamento da fé cristã?',
            question_type: 'true_false',
            correct_answer: 'true',
            points: 1,
        },
        {
            id: 'q5',
            exam_id: 'exam-1',
            question_text: 'Qual é o primeiro livro da Bíblia?',
            question_type: 'multiple_choice',
            options: [
                { id: 'a', text: 'Êxodo', is_correct: false },
                { id: 'b', text: 'Gênesis', is_correct: true },
                { id: 'c', text: 'Levítico', is_correct: false },
                { id: 'd', text: 'Números', is_correct: false },
            ],
            points: 1,
        },
        {
            id: 'q6',
            exam_id: 'exam-1',
            question_text: 'Quantos livros tem a Bíblia?',
            question_type: 'multiple_choice',
            options: [
                { id: 'a', text: '50', is_correct: false },
                { id: 'b', text: '60', is_correct: false },
                { id: 'c', text: '66', is_correct: true },
                { id: 'd', text: '70', is_correct: false },
            ],
            points: 1,
        },
        {
            id: 'q7',
            exam_id: 'exam-1',
            question_text: 'A justificação pela fé é um princípio da Reforma Protestante?',
            question_type: 'true_false',
            correct_answer: 'true',
            points: 1,
        },
        {
            id: 'q8',
            exam_id: 'exam-1',
            question_text: 'A graça de Deus é merecida pelas boas obras?',
            question_type: 'true_false',
            correct_answer: 'false',
            points: 1,
        },
        {
            id: 'q9',
            exam_id: 'exam-1',
            question_text: 'Quem escreveu a maior parte do Novo Testamento?',
            question_type: 'multiple_choice',
            options: [
                { id: 'a', text: 'Pedro', is_correct: false },
                { id: 'b', text: 'João', is_correct: false },
                { id: 'c', text: 'Paulo', is_correct: true },
                { id: 'd', text: 'Tiago', is_correct: false },
            ],
            points: 1,
        },
        {
            id: 'q10',
            exam_id: 'exam-1',
            question_text: 'A salvação é exclusivamente pela fé em Jesus Cristo?',
            question_type: 'true_false',
            correct_answer: 'true',
            points: 1,
        },
    ];

    saveMockModules(modules);
    saveMockExams(exams);
    saveMockQuestions(questions);

    console.log('✅ Dados LMS criados com sucesso!');
}
