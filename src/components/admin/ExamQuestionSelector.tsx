// Placeholder component - ExamQuestionSelector
// The question_bank table does not exist in the current database schema

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface SelectedQuestion {
    id: string;
    order: number;
    custom_points?: number;
}

interface ExamQuestionSelectorProps {
    onQuestionsSelected: (questions: SelectedQuestion[]) => void;
    initialQuestions?: SelectedQuestion[];
    examLevel?: string;
    examCategory?: string;
}

export const ExamQuestionSelector = ({
    onQuestionsSelected,
    initialQuestions = [],
}: ExamQuestionSelectorProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    Seletor de Questões
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    O banco de questões ainda não foi configurado.
                    Por favor, adicione questões manualmente nas provas.
                </p>
            </CardContent>
        </Card>
    );
};
