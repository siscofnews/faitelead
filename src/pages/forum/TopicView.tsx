import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, User, Clock, Reply, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Post {
    id: string;
    content: string;
    created_at: string;
    is_solution: boolean;
    author: {
        full_name: string | null;
        avatar_url: string | null;
    };
}

interface TopicDetails {
    id: string;
    title: string;
    content: string;
    created_at: string;
    is_locked: boolean;
    author: {
        full_name: string | null;
        avatar_url: string | null;
    };
    category: {
        title: string;
        slug: string;
        forum_type: string;
    };
}

const TopicView = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const [topic, setTopic] = useState<TopicDetails | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (topicId) {
            loadTopicData();
            // Increment view count
            supabase.rpc('increment_topic_view', { topic_id: topicId });
        }
    }, [topicId]);

    const loadTopicData = async () => {
        try {
            // Load topic details
            const { data: topicData, error: topicError } = await supabase
                .from('forum_topics')
                .select(`
          *,
          author:author_id(full_name, avatar_url),
          category:category_id(title, slug, forum_type)
        `)
                .eq('id', topicId)
                .single();

            if (topicError) throw topicError;
            setTopic(topicData);

            // Load posts
            const { data: postsData, error: postsError } = await supabase
                .from('forum_posts')
                .select(`
          *,
          author:author_id(full_name, avatar_url)
        `)
                .eq('topic_id', topicId)
                .order('created_at', { ascending: true });

            if (postsError) throw postsError;
            setPosts(postsData || []);

        } catch (error) {
            console.error('Error loading topic:', error);
            toast.error('Erro ao carregar tópico');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!replyContent.trim()) return;

        try {
            setSubmitting(true);
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('forum_posts')
                .insert({
                    topic_id: topicId,
                    author_id: userData.user.id,
                    content: replyContent
                });

            if (error) throw error;

            // Update topic last_post_at
            await supabase
                .from('forum_topics')
                .update({ last_post_at: new Date().toISOString() })
                .eq('id', topicId);

            toast.success('Resposta enviada!');
            setReplyContent("");
            loadTopicData(); // Reload to show new post
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error('Erro ao enviar resposta');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando...</div>;
    if (!topic) return <div className="p-8 text-center">Tópico não encontrado</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header / Navigation */}
            <div>
                <Button
                    variant="ghost"
                    className="pl-0 mb-4"
                    onClick={() => navigate(`/forum/${topic.category.forum_type}/${topic.category.slug}`)}
                >
                    ← Voltar para {topic.category.title}
                </Button>

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{topic.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={topic.author.avatar_url || undefined} />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                {topic.author.full_name}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(topic.created_at).toLocaleDateString()} às {new Date(topic.created_at).toLocaleTimeString().slice(0, 5)}
                            </span>
                            <Badge variant="outline">{topic.category.title}</Badge>
                        </div>
                    </div>
                    {topic.is_locked && (
                        <Badge variant="secondary" className="h-8 px-3">
                            <Lock className="h-4 w-4 mr-2" />
                            Tópico Fechado
                        </Badge>
                    )}
                </div>
            </div>

            {/* Main Topic Content */}
            <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-6 space-y-4">
                    <div className="prose max-w-none dark:prose-invert">
                        <p className="whitespace-pre-wrap">{topic.content}</p>
                    </div>
                </CardContent>
            </Card>

            <Separator className="my-8" />

            {/* Replies List */}
            <div className="space-y-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {posts.length} Respostas
                </h3>

                {posts.map((post) => (
                    <Card key={post.id} className={post.is_solution ? "border-green-500 bg-green-50/10" : ""}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={post.author.avatar_url || undefined} />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold">{post.author.full_name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(post.created_at).toLocaleDateString()} às {new Date(post.created_at).toLocaleTimeString().slice(0, 5)}
                                        </div>
                                    </div>
                                </div>
                                {post.is_solution && (
                                    <Badge className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Solução
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="prose max-w-none dark:prose-invert text-sm">
                                <p className="whitespace-pre-wrap">{post.content}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Reply Form */}
            {!topic.is_locked ? (
                <Card className="mt-8">
                    <CardHeader>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Reply className="h-5 w-5" />
                            Responder
                        </h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="Escreva sua resposta..."
                            className="min-h-[150px]"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Button onClick={handleReply} disabled={submitting || !replyContent.trim()}>
                                {submitting ? "Enviando..." : "Enviar Resposta"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
                    Este tópico está fechado para novas respostas.
                </div>
            )}
        </div>
    );
};

export default TopicView;
