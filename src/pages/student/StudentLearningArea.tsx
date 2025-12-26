import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, CheckCircle, PlayCircle, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ExamInterface } from '@/components/student/ExamInterface';
import { learningService } from '@/services/learningService';
import { examService } from '@/services/examService';
import { supabase } from '@/integrations/supabase/client';

const StudentLearningArea = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [selectedModule, setSelectedModule] = useState<any | null>(null);
    const [selectedExam, setSelectedExam] = useState<any | null>(null);
    const [showExam, setShowExam] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Carregar cursos
            const myCourses = await learningService.getStudentCourses(user.id);
            setCourses(myCourses);

            // Carregar módulos de todos os cursos
            // (Para simplificar, carrega do primeiro curso ou todos se possível, 
            // aqui vamos assumir que queremos ver módulos de todos os cursos matriculados)
            let allModules: any[] = [];
            for (const course of myCourses) {
                const courseModules = await learningService.getCourseModules(course.id, user.id);
                allModules = [...allModules, ...courseModules];
            }
            setModules(allModules);

        } catch (error) {
            console.error("Error loading learning area:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartExam = async (module: any) => {
        try {
            const exam = await examService.getExamByModule(module.id);
            
            if (exam) {
                setSelectedModule(module);
                setSelectedExam(exam);
                setShowExam(true);
            } else {
                console.error("No exam found for this module");
            }
        } catch (error) {
            console.error("Error starting exam:", error);
        }
    };

    const handleExamComplete = () => {
        setShowExam(false);
        setSelectedModule(null);
        setSelectedExam(null);
        loadData(); // Recarregar para ver progresso atualizado
    };

    const getModuleProgress = (module: any) => {
        if (module.status === 'completed') return 100;
        if (module.status === 'locked') return 0;
        return module.lessons_total > 0 
            ? (module.lessons_completed / module.lessons_total) * 100
            : 0;
    };

    // Se está fazendo prova, mostrar interface de prova
    if (showExam && selectedExam) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <Button
                    variant="ghost"
                    onClick={() => setShowExam(false)}
                    className="mb-4"
                >
                    ← Voltar aos Módulos
                </Button>
                <ExamInterface exam={selectedExam} onComplete={handleExamComplete} />
            </div>
        );
    }

    if (loading) {
        return <div className="p-8 text-center">Carregando seus cursos...</div>;
    }

    // Dashboard principal
    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold">Meus Cursos</h1>
                <p className="text-muted-foreground">
                    Acompanhe seu progresso e continue seus estudos
                </p>
            </div>

            {/* Cursos e Módulos */}
            {courses.map((course) => {
                const courseModules = modules.filter(m => m.course_id === course.id);
                if (courseModules.length === 0) return null;

                const completedModules = courseModules.filter(m => m.status === 'completed').length;
                const totalModules = courseModules.length;
                const courseProgress = totalModules > 0 
                    ? (completedModules / totalModules) * 100
                    : 0;

                return (
                    <Card key={course.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        <GraduationCap className="h-6 w-6 text-primary" />
                                        {course.title}
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        {course.description}
                                    </CardDescription>
                                </div>
                                <Badge variant={courseProgress === 100 ? 'default' : 'secondary'} className="text-sm">
                                    {completedModules} / {totalModules} Módulos
                                </Badge>
                            </div>

                            {/* Progresso Geral do Curso */}
                            <div className="space-y-2 mt-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Progresso Geral</span>
                                    <span className="font-medium">{courseProgress.toFixed(0)}%</span>
                                </div>
                                <Progress value={courseProgress} className="h-2" />
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Lista de Módulos */}
                            {courseModules.map((module, index) => {
                                const progress = getModuleProgress(module);
                                const isLocked = module.status === 'locked';
                                const isCompleted = module.status === 'completed';

                                return (
                                    <Card
                                        key={module.id}
                                        className={`${isLocked ? 'opacity-60' : ''} ${isCompleted ? 'border-success' : ''}`}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                                                        {isCompleted && <CheckCircle className="h-4 w-4 text-success" />}
                                                        {!isLocked && !isCompleted && <PlayCircle className="h-4 w-4 text-primary" />}
                                                        <CardTitle className="text-lg">{module.title}</CardTitle>
                                                    </div>
                                                    <CardDescription className="mt-1">
                                                        {module.description}
                                                    </CardDescription>
                                                </div>

                                                <Badge
                                                    variant={
                                                        isCompleted ? 'default' :
                                                            isLocked ? 'secondary' :
                                                                'outline'
                                                    }
                                                >
                                                    {isCompleted ? 'Completo' :
                                                        isLocked ? 'Bloqueado' :
                                                            'Em Andamento'}
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            {/* Progresso do Módulo */}
                                            {!isLocked && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">
                                                            Aulas: {module.lessons_completed} / {module.lessons_total}
                                                        </span>
                                                        <span className="font-medium">{progress.toFixed(0)}%</span>
                                                    </div>
                                                    <Progress value={progress} className="h-1.5" />
                                                </div>
                                            )}

                                            {/* Nota da Prova Final (se completou) */}
                                            {isCompleted && module.final_exam_score !== null && (
                                                <div className="p-3 bg-success/10 border border-success rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <TrendingUp className="h-4 w-4 text-success" />
                                                            <span className="text-sm font-medium text-success">
                                                                Prova Final Aprovada
                                                            </span>
                                                        </div>
                                                        <span className="text-lg font-bold text-success">
                                                            {module.final_exam_score.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Ações */}
                                            {isLocked && (
                                                <p className="text-sm text-muted-foreground text-center py-2">
                                                    🔒 Complete o módulo anterior para desbloquear
                                                </p>
                                            )}

                                            {!isLocked && !isCompleted && (
                                                <div className="flex gap-2">
                                                    <Button variant="outline" className="flex-1" onClick={() => navigate(`/student/lessons/${module.id}`)}>
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        Ver Aulas
                                                    </Button>
                                                    <Button
                                                        className="flex-1"
                                                        onClick={() => handleStartExam(module)}
                                                        disabled={module.lessons_completed < module.lessons_total}
                                                    >
                                                        <GraduationCap className="h-4 w-4 mr-2" />
                                                        Fazer Prova Final
                                                    </Button>
                                                </div>
                                            )}

                                            {isCompleted && (
                                                <div className="text-center p-3 bg-muted rounded-lg">
                                                    <p className="text-sm text-muted-foreground">
                                                        ✅ Módulo concluído com sucesso!
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </CardContent>
                    </Card>
                );
            })}

            {/* Mensagem se não tem cursos */}
            {courses.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            Nenhum curso matriculado
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Entre em contato com a administração para se matricular em um curso
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default StudentLearningArea;
