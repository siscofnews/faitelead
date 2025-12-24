import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageSquare, Plus, Search, MessageCircle, Pin, Lock, Eye } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  author_id: string;
  course_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  created_at: string;
  author?: { full_name: string };
  course?: { title: string };
  replies_count?: number;
}

const ProfessorForum = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    course_id: ""
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    setUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (profile) {
      setUserName(profile.full_name);
    }

    await loadCourses();
    await loadTopics();
  };

  const loadCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("id, title")
      .eq("is_active", true)
      .order("title");

    setCourses(data || []);
  };

  const loadTopics = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("forum_topics")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar tópicos", variant: "destructive" });
    } else {
      // Load related data
      const topicsWithData = await Promise.all(
        (data || []).map(async (topic) => {
          const { data: authorData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", topic.author_id)
            .single();

          const { data: courseData } = await supabase
            .from("courses")
            .select("title")
            .eq("id", topic.course_id)
            .single();

          const { count } = await supabase
            .from("forum_replies")
            .select("*", { count: "exact", head: true })
            .eq("topic_id", topic.id);

          return {
            ...topic,
            author: authorData || undefined,
            course: courseData || undefined,
            replies_count: count || 0
          };
        })
      );

      setTopics(topicsWithData);
    }

    setLoading(false);
  };

  const handleCreateTopic = async () => {
    if (!formData.title || !formData.content || !formData.course_id) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("forum_topics").insert({
      title: formData.title,
      content: formData.content,
      course_id: formData.course_id,
      author_id: userId
    });

    if (error) {
      toast({ title: "Erro ao criar tópico", variant: "destructive" });
    } else {
      toast({ title: "Tópico criado com sucesso!" });
      setIsDialogOpen(false);
      setFormData({ title: "", content: "", course_id: "" });
      loadTopics();
    }
  };

  const handleTogglePin = async (topic: ForumTopic) => {
    const { error } = await supabase
      .from("forum_topics")
      .update({ is_pinned: !topic.is_pinned })
      .eq("id", topic.id);

    if (!error) {
      toast({ title: topic.is_pinned ? "Tópico desafixado" : "Tópico fixado" });
      loadTopics();
    }
  };

  const handleToggleLock = async (topic: ForumTopic) => {
    const { error } = await supabase
      .from("forum_topics")
      .update({ is_locked: !topic.is_locked })
      .eq("id", topic.id);

    if (!error) {
      toast({ title: topic.is_locked ? "Tópico desbloqueado" : "Tópico bloqueado" });
      loadTopics();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const filteredTopics = topics.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName={userName} userRole="teacher" onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/professor")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
        </Button>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Fórum de Discussão
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary">
                  <Plus className="mr-2 h-4 w-4" /> Novo Tópico
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Tópico</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Curso</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={formData.course_id}
                      onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                    >
                      <option value="">Selecione um curso</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Título</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Título do tópico"
                    />
                  </div>
                  <div>
                    <Label>Conteúdo</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Escreva sua mensagem..."
                      rows={5}
                    />
                  </div>
                  <Button onClick={handleCreateTopic} className="w-full">
                    Criar Tópico
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tópicos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : filteredTopics.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum tópico encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTopics.map((topic) => (
                  <Card key={topic.id} className={topic.is_pinned ? "border-primary" : ""}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {topic.is_pinned && (
                              <Badge variant="secondary" className="text-xs">
                                <Pin className="h-3 w-3 mr-1" /> Fixado
                              </Badge>
                            )}
                            {topic.is_locked && (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="h-3 w-3 mr-1" /> Bloqueado
                              </Badge>
                            )}
                            <Badge variant="outline">{topic.course?.title}</Badge>
                          </div>
                          <h3 className="font-semibold text-lg">{topic.title}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                            {topic.content}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span>Por: {topic.author?.full_name}</span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {topic.replies_count} respostas
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {topic.views_count} visualizações
                            </span>
                            <span>
                              {format(new Date(topic.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePin(topic)}
                          >
                            <Pin className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleLock(topic)}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProfessorForum;
