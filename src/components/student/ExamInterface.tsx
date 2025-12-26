import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Clock, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { examService, type Exam, type Question, type ExamSubmission } from '@/services/examService';

interface ExamInterfaceProps {
    exam: Exam;
    onComplete: () => void;
}

export const ExamInterface = ({ exam, onComplete }: ExamInterfaceProps) => {
    const [currentAttempt, setCurrentAttempt] = useState<ExamSubmission | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [attemptsUsed, setAttemptsUsed] = useState(0);
    const [result, setResult] = useState<{
        score: number;
        max_score: number;
        percentage: number;
        passed: boolean;
    } | null>(null);

    // Carregar tentativas anteriores e questões
    useEffect(() => {
        loadExamData();
    }, [exam.id]);

    const loadExamData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Carregar histórico
            const history = await examService.getHistory(exam.id, user.id);
            setAttemptsUsed(history.length);

            // Carregar questões
            const examQuestions = await examService.getQuestions(exam.id);
            setQuestions(examQuestions);

        } catch (error) {
            console.error("Error loading exam data:", error);
            toast.error("Erro ao carregar dados da prova");
        } finally {
            setLoading(false);
        }
    };

    const currentQuestion = questions[currentQuestionIndex];
    const answeredCount = Object.keys(answers).length;
    const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

    const handleStart = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Usuário não autenticado");
                return;
            }

            const attempt = await examService.startAttempt(exam.id, user.id);
            setCurrentAttempt(attempt);
            setCurrentQuestionIndex(0);
            setAnswers({});
            setResult(null);
        } catch (error) {
            console.error("Error starting attempt:", error);
            toast.error("Erro ao iniciar prova");
        }
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

    const handleSubmit = async () => {
        if (!currentAttempt) return;

        const unanswered = questions.filter(q => !answers[q.id]);
        if (unanswered.length > 0) {
            toast.error(`Faltam ${unanswered.length} questões para responder`);
            return;
        }

        setSubmitting(true);

        try {
            // Calcular nota
            let correctCount = 0;
            questions.forEach(q => {
                if (answers[q.id] === q.correct_answer) {
                    correctCount++;
                }
            });

            const score = correctCount * 10; // Assumindo 10 pontos por questão, ajustar se necessário
            const maxScore = questions.length * 10;
            const percentage = (score / maxScore) * 100;
            const passed = percentage >= exam.passing_score;

            await examService.submitAttempt(currentAttempt.id, answers, percentage, passed);

            setResult({
                score: percentage, // Usando percentage como score final para simplificar display
                max_score: 100,
                percentage,
                passed
            });

            if (passed) {
                toast.success(`Parabéns! Aprovado com ${percentage.toFixed(1)}%! 🎉`);
            } else {
                toast.error(`Nota: ${percentage.toFixed(1)}% - Não atingiu o mínimo`);
            }
        } catch (error: any) {
            console.error('Error submitting exam:', error);
            toast.error('Erro ao submeter prova');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Carregando prova...</div>;
    }

    // Tela inicial
    if (!currentAttempt) {
        // Mocking attempts allowed logic since it's not in DB yet, defaulting to 3
        const attemptsAllowed = 3;

        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">{exam.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Questões</p>
                            <p className="text-3xl font-bold">{questions.length}</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Nota Mínima</p>
                            <p className="text-3xl font-bold">{exam.passing_score}%</p>
                        </div>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Tentativas Realizadas</p>
                        <p className="text-2xl font-bold">
                            {attemptsUsed}
                        </p>
                    </div>

                    <Button onClick={handleStart} className="w-full" size="lg">
                        Iniciar Prova
                    </Button>
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
                            Mínimo para aprovação: {exam.passing_score}%
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

    // Fazendo prova
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

            {/* Questão atual */}
            {currentQuestion && (
            <Card>
                <CardContent className="pt-8 pb-8 space-y-6">
                    {/* Texto da questão */}
                    <div>
                        <p className="text-lg leading-relaxed">{currentQuestion.question_text}</p>
                    </div>

                    {/* Opções */}
                    <RadioGroup
                        value={answers[currentQuestion.id] || ''}
                        onValueChange={handleAnswerChange}
                        className="space-y-3"
                    >
                        {/* Mapeamento dinâmico das opções A, B, C, D */}
                        {[
                            { id: 'A', text: currentQuestion.option_a },
                            { id: 'B', text: currentQuestion.option_b },
                            { id: 'C', text: currentQuestion.option_c },
                            { id: 'D', text: currentQuestion.option_d }
                        ].filter(opt => opt.text).map((option) => (
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
                </CardContent>
            </Card>
            )}

            {/* Navegação */}
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
