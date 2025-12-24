import { useState } from 'react';
import { toast } from 'sonner';
import { Clock, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
    type MockExam,
    type MockQuestion,
    type MockExamAttempt,
    getMockQuestions,
    startExamAttempt,
    submitExamAttempt,
    getMockAttempts,
    saveMockAttempts,
} from '@/lib/mockLMS';

interface ExamInterfaceProps {
    exam: MockExam;
    onComplete: () => void;
}

export const ExamInterface = ({ exam, onComplete }: ExamInterfaceProps) => {
    const [currentAttempt, setCurrentAttempt] = useState<MockExamAttempt | null>(null);
    const [questions, setQuestions] = useState<MockQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{
        score: number;
        max_score: number;
        percentage: number;
        passed: boolean;
    } | null>(null);

    const currentQuestion = questions[currentQuestionIndex];
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / questions.length) * 100;

    const handleStart = () => {
        const studentId = 'mock-student-1';
        const attempt = startExamAttempt(studentId, exam.id);
        const examQuestions = getMockQuestions(exam.id);

        setCurrentAttempt(attempt);
        setQuestions(examQuestions);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setResult(null);
    };

    const handleAnswerChange = (answer: string) => {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = () => {
        if (!currentAttempt) return;

        const unanswered = questions.filter(q => !answers[q.id]);
        if (unanswered.length > 0) {
            toast.error(`Faltam ${unanswered.length} questões para responder`);
            return;
        }

        setSubmitting(true);

        try {
            const allAttempts = getMockAttempts();
            const attemptIndex = allAttempts.findIndex(a => a.id === currentAttempt.id);
            allAttempts[attemptIndex].answers = Object.entries(answers).map(([questionId, answer]) => ({
                question_id: questionId,
                answer,
            }));
            saveMockAttempts(allAttempts);

            const examResult = submitExamAttempt(currentAttempt.id);
            setResult(examResult);

            if (examResult.passed) {
                toast.success(`Parabéns! Aprovado com ${examResult.percentage.toFixed(1)}%! 🎉`);
            } else {
                toast.error(`Nota: ${examResult.percentage.toFixed(1)}% - Não atingiu o mínimo`);
            }
        } catch (error: any) {
            console.error('Error submitting exam:', error);
            toast.error('Erro ao submeter prova');
        } finally {
            setSubmitting(false);
        }
    };

    // Tela inicial
    if (!currentAttempt) {
        const previousAttempts = getMockAttempts(exam.id);
        const attemptsUsed = previousAttempts.filter(a => a.status === 'completed').length;

        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">{exam.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Questões</p>
                            <p className="text-3xl font-bold">{exam.total_questions}</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Nota Mínima</p>
                            <p className="text-3xl font-bold">{exam.passing_grade}%</p>
                        </div>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Tentativas Disponíveis</p>
                        <p className="text-2xl font-bold">
                            {exam.attempts_allowed - attemptsUsed} de {exam.attempts_allowed}
                        </p>
                    </div>

                    {attemptsUsed < exam.attempts_allowed ? (
                        <Button onClick={handleStart} className="w-full" size="lg">
                            Iniciar Prova
                        </Button>
                    ) : (
                        <p className="text-center text-destructive font-medium">
                            Tentativas esgotadas
                        </p>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Resultado
    if (result) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        {result.passed ? (
                            <>
                                <CheckCircle className="h-8 w-8 text-success" />
                                Parabéns! Aprovado!
                            </>
                        ) : (
                            <>
                                <XCircle className="h-8 w-8 text-destructive" />
                                Resultado
                            </>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center p-6 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Sua Nota</p>
                        <p className={`text-5xl font-bold ${result.passed ? 'text-success' : 'text-destructive'}`}>
                            {result.percentage.toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            {result.score} de {result.max_score} pontos
                        </p>
                    </div>

                    {result.passed && exam.exam_type === 'prova_final' && (
                        <div className="p-4 bg-success/10 border-2 border-success rounded-lg">
                            <p className="text-success font-medium text-center">
                                🎉 Próximo módulo desbloqueado!
                            </p>
                        </div>
                    )}

                    <Button onClick={onComplete} className="w-full" size="lg">
                        Voltar aos Módulos
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Fazendo prova - Interface INTUITIVA e LEVE
    return (
        <div className="max-w-3xl mx-auto space-y-4">
            {/* Cabeçalho com progresso */}
            <Card>
                <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                            Questão {currentQuestionIndex + 1} de {questions.length}
                        </span>
                        <span className="text-muted-foreground">
                            {answeredCount} respondidas
                        </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </CardContent>
            </Card>

            {/* Questão atual - CARD GRANDE E LIMPO */}
            <Card>
                <CardContent className="pt-8 pb-8 space-y-6">
                    {/* Texto da questão */}
                    <div>
                        <p className="text-lg leading-relaxed">{currentQuestion.question_text}</p>
                    </div>

                    {/* Opções - ESPAÇADAS E CLARAS */}
                    {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
                        <RadioGroup
                            value={answers[currentQuestion.id] || ''}
                            onValueChange={handleAnswerChange}
                            className="space-y-3"
                        >
                            {currentQuestion.options.map((option) => (
                                <div
                                    key={option.id}
                                    className="flex items-start space-x-3 p-4 rounded-lg border-2 hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => handleAnswerChange(option.id)}
                                >
                                    <RadioGroupItem value={option.id} id={`opt-${option.id}`} className="mt-0.5" />
                                    <Label
                                        htmlFor={`opt-${option.id}`}
                                        className="flex-1 cursor-pointer text-base leading-relaxed"
                                    >
                                        {option.text}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}

                    {currentQuestion.question_type === 'true_false' && (
                        <RadioGroup
                            value={answers[currentQuestion.id] || ''}
                            onValueChange={handleAnswerChange}
                            className="space-y-3"
                        >
                            <div
                                className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => handleAnswerChange('true')}
                            >
                                <RadioGroupItem value="true" id="opt-true" />
                                <Label htmlFor="opt-true" className="flex-1 cursor-pointer text-base">
                                    Verdadeiro
                                </Label>
                            </div>
                            <div
                                className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => handleAnswerChange('false')}
                            >
                                <RadioGroupItem value="false" id="opt-false" />
                                <Label htmlFor="opt-false" className="flex-1 cursor-pointer text-base">
                                    Falso
                                </Label>
                            </div>
                        </RadioGroup>
                    )}
                </CardContent>
            </Card>

            {/* Navegação - BOTÕES GRANDES E CLAROS */}
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="flex-1"
                >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Anterior
                </Button>

                {currentQuestionIndex < questions.length - 1 ? (
                    <Button
                        size="lg"
                        onClick={handleNext}
                        className="flex-1"
                    >
                        Próxima
                        <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        onClick={handleSubmit}
                        disabled={submitting || answeredCount < questions.length}
                        className="flex-1"
                    >
                        {submitting && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                        Finalizar Prova
                    </Button>
                )}
            </div>

            {/* Indicador visual das questões */}
            <Card>
                <CardContent className="pt-4 pb-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`w-10 h-10 rounded-lg font-medium transition-all ${idx === currentQuestionIndex
                                        ? 'bg-primary text-primary-foreground'
                                        : answers[q.id]
                                            ? 'bg-success/20 text-success border-2 border-success'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/70'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
