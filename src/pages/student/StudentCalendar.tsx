import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Calendar as CalendarIcon, ArrowLeft, Clock, Video, FileText,
  MapPin, Users, Bell
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO, isAfter, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  event_type: string;
  course_id: string | null;
}

interface LiveClass {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  instructor_name: string;
  room_code: string;
  course_title: string;
}

const StudentCalendar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  const loadCalendarData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get enrolled courses
      const { data: enrollments } = await supabase
        .from("student_enrollments")
        .select("course_id")
        .eq("student_id", user.id)
        .eq("is_active", true);

      const courseIds = enrollments?.map(e => e.course_id) || [];

      // Load academic calendar events
      const { data: eventsData } = await supabase
        .from("academic_calendar")
        .select("*")
        .eq("is_active", true)
        .or(`course_id.is.null,course_id.in.(${courseIds.join(",")})`);

      setEvents(eventsData || []);

      // Load live classes
      if (courseIds.length > 0) {
        const { data: classesData } = await supabase
          .from("live_classes")
          .select(`
            *,
            courses (title)
          `)
          .in("course_id", courseIds)
          .eq("is_active", true)
          .gte("scheduled_at", new Date().toISOString());

        type LiveClassRow = LiveClass & { courses?: { title: string } };
        const mappedClasses: LiveClass[] = (classesData || []).map((cls: LiveClassRow) => ({
          ...cls,
          course_title: cls.courses?.title || ""
        }));

        setLiveClasses(mappedClasses);
      }
    } catch (error) {
      console.error("Error loading calendar:", error);
      toast.error("Erro ao carregar calendário");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const startDate = parseISO(event.start_date);
      const endDate = event.end_date ? parseISO(event.end_date) : startDate;
      return (isSameDay(date, startDate) || 
              (isAfter(date, startDate) && isBefore(date, endDate)) ||
              isSameDay(date, endDate));
    });
  };

  const getLiveClassesForDate = (date: Date) => {
    return liveClasses.filter(cls => isSameDay(parseISO(cls.scheduled_at), date));
  };

  const selectedDateEvents = getEventsForDate(selectedDate);
  const selectedDateClasses = getLiveClassesForDate(selectedDate);

  // Get dates with events for calendar highlighting
  const datesWithEvents = new Set<string>();
  events.forEach(event => {
    const startDate = parseISO(event.start_date);
    datesWithEvents.add(format(startDate, "yyyy-MM-dd"));
  });
  liveClasses.forEach(cls => {
    const date = parseISO(cls.scheduled_at);
    datesWithEvents.add(format(date, "yyyy-MM-dd"));
  });

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "exam": return "bg-destructive text-destructive-foreground";
      case "deadline": return "bg-accent text-accent-foreground";
      case "holiday": return "bg-success text-success-foreground";
      case "event": return "bg-primary text-primary-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "exam": return "Prova";
      case "deadline": return "Prazo";
      case "holiday": return "Feriado";
      case "event": return "Evento";
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground text-lg font-medium">Carregando calendário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/student")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Calendário Acadêmico</h1>
              <p className="text-sm text-muted-foreground">
                Eventos, prazos e aulas ao vivo
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Calendário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                modifiers={{
                  hasEvent: (date) => datesWithEvents.has(format(date, "yyyy-MM-dd"))
                }}
                modifiersStyles={{
                  hasEvent: {
                    fontWeight: "bold",
                    backgroundColor: "hsl(var(--primary) / 0.1)",
                    borderRadius: "50%"
                  }
                }}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Events for Selected Date */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateEvents.length === 0 && selectedDateClasses.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum evento para esta data</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Live Classes */}
                    {selectedDateClasses.map((cls) => (
                      <div 
                        key={cls.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20"
                      >
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Video className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-primary text-primary-foreground">
                              Aula ao Vivo
                            </Badge>
                            <Badge variant="outline">{cls.course_title}</Badge>
                          </div>
                          <h4 className="font-semibold text-foreground">{cls.title}</h4>
                          <p className="text-sm text-muted-foreground">{cls.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(parseISO(cls.scheduled_at), "HH:mm")} - {cls.duration_minutes}min
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {cls.instructor_name}
                            </span>
                          </div>
                        </div>
                        <Button size="sm">
                          Entrar
                        </Button>
                      </div>
                    ))}

                    {/* Calendar Events */}
                    {selectedDateEvents.map((event) => (
                      <div 
                        key={event.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getEventTypeColor(event.event_type)}`}>
                          {event.event_type === "exam" ? (
                            <FileText className="h-6 w-6" />
                          ) : event.event_type === "deadline" ? (
                            <Bell className="h-6 w-6" />
                          ) : (
                            <CalendarIcon className="h-6 w-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getEventTypeColor(event.event_type)}>
                              {getEventTypeLabel(event.event_type)}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-foreground">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Live Classes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Próximas Aulas ao Vivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {liveClasses.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhuma aula ao vivo agendada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {liveClasses.slice(0, 5).map((cls) => (
                      <div 
                        key={cls.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Video className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{cls.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(cls.scheduled_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{cls.course_title}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentCalendar;
