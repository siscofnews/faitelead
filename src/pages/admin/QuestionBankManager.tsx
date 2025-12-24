import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
    Search, Plus, Filter, Download, Upload, BookOpen,
    Edit, Trash2, Eye, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Question {
    id: string;
    question_text: string;
    question_type: string;
    category: string;
    subcategory: string | null;
    academic_level: string;
    difficulty: number;
    points: number;
    biblical_references: string[] | null;
    tags: string[] | null;
    is_active: boolean;
    created_at: string;
}

const CATEGORIES = [
    "Teologia",
    "Bíblia",
    "Ciências",
    "Cultura"
];

const ACADEMIC_LEVELS = [
    { value: "basico", label: "Básico" },
    { value: "medio", label: "Médio" },
    { value: "bacharel", label: "Bacharelado" },
    { value: "graduacao", label: "Graduação" },
    { value: "pos_graduacao", label: "Pós-Graduação" },
    { value: "mestrado", label: "Mestrado" },
    { value: "doutorado", label: "Doutorado" }
];

const QuestionBankManager = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterLevel, setFilterLevel] = useState<string>("all");
    const [stats, setStats] = useState({
        total: 0,
        byCategory: {} as Record<string, number>,
        byLevel: {} as Record<string, number>
    });

    useEffect(() => {
        loadQuestions();
    }, [filterCategory, filterLevel]);

    const loadQuestions = async () => {
        try {
            setLoading(true);

            let query = supabase
                .from("question_bank")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            if (filterCategory !== "all") {
                query = query.eq("category", filterCategory);
            }

            if (filterLevel !== "all") {
                query = query.eq("academic_level", filterLevel);
            }

            const { data, error } = await query;

            if (error) throw error;

            setQuestions(data || []);
            calculateStats(data || []);
        } catch (error) {
            console.error("Error loading questions:", error);
            toast.error("Erro ao carregar questões");
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: Question[]) => {
        const byCategory: Record<string, number> = {};
        const byLevel: Record<string, number> = {};

        data.forEach(q => {
            byCategory[q.category] = (byCategory[q.category] || 0) + 1;
            byLevel[q.academic_level] = (byLevel[q.academic_level] || 0) + 1;
        });

        setStats({
            total: data.length,
            byCategory,
            byLevel
        });
    };

    const filteredQuestions = questions.filter(q =>
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subcategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getLevelBadgeColor = (level: string) => {
        const colors: Record<string, string> = {
            basico: "bg-green-500",
            medio: "bg-blue-500",
            bacharel: "bg-purple-500",
            graduacao: "bg-orange-500",
            pos_graduacao: "bg-red-500",
            mestrado: "bg-pink-500",
            doutorado: "bg-indigo-500"
        };
        return colors[level] || "bg-gray-500";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/admin")}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Banco de Questões</h1>
                            <p className="text-muted-foreground">
                                Gerencie questões de provas para todos os cursos
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Button variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Importar
                        </Button>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Questão
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total de Questões
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    {CATEGORIES.map(category => (
                        <Card key={category}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {category}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {stats.byCategory[category] || 0}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar questões..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as Categorias</SelectItem>
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filterLevel} onValueChange={setFilterLevel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Nível" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Níveis</SelectItem>
                                    {ACADEMIC_LEVELS.map(level => (
                                        <SelectItem key={level.value} value={level.value}>
                                            {level.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Questions Table */}
                <Card>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Questão</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Subcategoria</TableHead>
                                    <TableHead>Nível</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Pontos</TableHead>
                                    <TableHead>Referências</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredQuestions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                            Nenhuma questão encontrada
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredQuestions.map((question) => (
                                        <TableRow key={question.id}>
                                            <TableCell className="max-w-md">
                                                <div className="truncate" title={question.question_text}>
                                                    {question.question_text}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{question.category}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {question.subcategory || "-"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getLevelBadgeColor(question.academic_level)}>
                                                    {ACADEMIC_LEVELS.find(l => l.value === question.academic_level)?.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm capitalize">
                                                    {question.question_type.replace('_', ' ')}
                                                </span>
                                            </TableCell>
                                            <TableCell>{question.points}</TableCell>
                                            <TableCell>
                                                {question.biblical_references && question.biblical_references.length > 0 ? (
                                                    <div className="text-xs text-muted-foreground">
                                                        {question.biblical_references.slice(0, 2).join(", ")}
                                                        {question.biblical_references.length > 2 && "..."}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default QuestionBankManager;
