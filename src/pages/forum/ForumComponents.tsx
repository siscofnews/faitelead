import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, Users, Lock, Pin, Clock, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Category {
    id: string;
    title: string;
    description: string;
    slug: string;
    forum_type: 'staff' | 'student';
}

interface Topic {
    id: string;
    title: string;
    content: string;
    author: { full_name: string | null; avatar_url: string | null };
    is_pinned: boolean;
    is_locked: boolean;
    view_count: number;
    reply_count: number;
    last_post_at: string;
    created_at: string;
    category: { title: string; slug: string };
}

export const ForumList = ({ type }: { type: 'staff' | 'student' }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, [type]);

    const loadCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('forum_categories')
                .select('*')
                .eq('forum_type', type)
                .eq('is_active', true)
                .order('display_order');

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Carregando fóruns...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">
                        {type === 'staff' ? 'Fórum de Professores' : 'Fórum de Alunos'}
                    </h1>
                    <p className="text-muted-foreground">
                        {type === 'staff'
                            ? 'Área exclusiva para discussão acadêmica e planos de aula'
                            : 'Espaço para dúvidas, discussões e interação'}
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                    <Link key={category.id} to={`/forum/${type}/${category.slug}`}>
                        <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    <Badge variant="outline">{type === 'staff' ? 'Staff' : 'Aluno'}</Badge>
                                </div>
                                <CardTitle>{category.title}</CardTitle>
                                <CardDescription>{category.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export const TopicList = () => {
    const { type, slug } = useParams();
    const navigate = useNavigate();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [newTopicOpen, setNewTopicOpen] = useState(false);
    const [newTopicData, setNewTopicData] = useState({ title: '', content: '' });

    useEffect(() => {
        if (slug) loadTopics();
    }, [slug]);

    const loadTopics = async () => {
        try {
            // Get category first
            const { data: catData, error: catError } = await supabase
                .from('forum_categories')
                .select('*')
                .eq('slug', slug)
                .single();

            if (catError) throw catError;
            setCategory(catData);

            // Get topics
            const { data, error } = await supabase
                .from('forum_topics')
                .select(`
          *,
          author:author_id(full_name, avatar_url),
          category:category_id(title, slug),
          posts:forum_posts(count)
        `)
                .eq('category_id', catData.id)
                .order('is_pinned', { ascending: false })
                .order('last_post_at', { ascending: false });

            if (error) throw error;

            setTopics(data.map(t => ({
                ...t,
                reply_count: t.posts[0]?.count || 0,
                author: t.author || { full_name: 'Usuário', avatar_url: null }
            })));

        } catch (error) {
            console.error('Error loading topics:', error);
            toast.error('Erro ao carregar tópicos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTopic = async () => {
        if (!newTopicData.title.trim() || !newTopicData.content.trim()) {
            toast.error('Preencha todos os campos');
            return;
        }

        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('forum_topics')
                .insert({
                    category_id: category?.id,
                    author_id: userData.user.id,
                    title: newTopicData.title,
                    content: newTopicData.content
                });

            if (error) throw error;

            toast.success('Tópico criado com sucesso!');
            setNewTopicOpen(false);
            setNewTopicData({ title: '', content: '' });
            loadTopics();
        } catch (error) {
            console.error('Error creating topic:', error);
            toast.error('Erro ao criar tópico');
        }
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" className="mb-2 pl-0" onClick={() => navigate(`/forum/${type}`)}>
                        ← Voltar para Categorias
                    </Button>
                    <h1 className="text-3xl font-bold">{category?.title}</h1>
                    <p className="text-muted-foreground">{category?.description}</p>
                </div>
                <Dialog open={newTopicOpen} onOpenChange={setNewTopicOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Tópico
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Criar Novo Tópico</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título</Label>
                                <Input
                                    id="title"
                                    placeholder="Ex: Dúvida sobre a aula 3"
                                    value={newTopicData.title}
                                    onChange={(e) => setNewTopicData({ ...newTopicData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">Conteúdo</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Descreva sua dúvida ou discussão..."
                                    className="min-h-[200px]"
                                    value={newTopicData.content}
                                    onChange={(e) => setNewTopicData({ ...newTopicData, content: e.target.value })}
                                />
                            </div>
                            <Button onClick={handleCreateTopic} className="w-full">Publicar Tópico</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {topics.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            Nenhum tópico criado nesta categoria ainda.
                        </CardContent>
                    </Card>
                ) : (
                    topics.map((topic) => (
                        <Link key={topic.id} to={`/forum/topic/${topic.id}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {topic.is_pinned && <Pin className="h-4 w-4 text-primary fill-primary" />}
                                                {topic.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                                                <h3 className="font-semibold text-lg truncate">{topic.title}</h3>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarImage src={topic.author.avatar_url || undefined} />
                                                        <AvatarFallback>U</AvatarFallback>
                                                    </Avatar>
                                                    {topic.author.full_name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(topic.last_post_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                            <div className="text-center">
                                                <div className="font-semibold text-foreground">{topic.reply_count}</div>
                                                <div>respostas</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-semibold text-foreground">{topic.view_count}</div>
                                                <div>visitas</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};
