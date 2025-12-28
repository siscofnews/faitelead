import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/i18n/I18nProvider";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import CourseViewer from "./pages/CourseViewer";
import ExamPage from "./pages/ExamPage";
import ExamResult from "./pages/ExamResult";
import Certificate from "./pages/Certificate";
import VerifyCertificate from "./pages/VerifyCertificate";
import RevistaDetails from "./pages/RevistaDetails";
import NotFound from "./pages/NotFound";
import PendingApproval from "./pages/PendingApproval";
import WhatsAppButton from "./components/WhatsAppButton";
import Gallery from "./pages/Gallery";
import Institutional from "./pages/Institutional";
import MissionVisionValues from "./pages/institucional/MissionVisionValues";
import Regimento from "./pages/institucional/Regimento";
import Ouvidoria from "./pages/institucional/Ouvidoria";
import AdministracaoAcademica from "./pages/institucional/AdministracaoAcademica";
import CPA from "./pages/institucional/CPA";
import Ensino from "./pages/Ensino";
import Graduacao from "./pages/ensino/Graduacao";
import GraduacaoEAD from "./pages/ensino/GraduacaoEAD.tsx";
import PosGraduacao from "./pages/ensino/PosGraduacao";
import VestibularOnline from "./pages/vestibular/VestibularOnline";
import VestibularAgendado from "./pages/vestibular/VestibularAgendado";
import EadFaq from "./pages/ead/EadFaq";
import GuiaELink from "./pages/biblioteca/GuiaELink";
import AbntColecao from "./pages/biblioteca/AbntColecao";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import StudentLayout from "./layouts/StudentLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";

// Admin Pages
import StudentsManagement from "./pages/admin/StudentsManagement";
import PolosManagement from "./pages/admin/PolosManagement";
import CoursesManagement from "./pages/admin/CoursesManagement";
import ModulesManagement from "./pages/admin/ModulesManagement";
import AllModulesManagement from "./pages/admin/AllModulesManagement";
import CourseModulesManagement from "./pages/admin/CourseModulesManagement";
import ExamQuestionsManagement from "./pages/admin/ExamQuestionsManagement";
import LessonsManagement from "./pages/admin/LessonsManagement";
import RestoreContent from "./pages/admin/RestoreContent";
import ProfessorsManagement from "./pages/admin/ProfessorsManagement";
import FinancialManagement from "./pages/admin/FinancialManagement";
import ReportsManagement from "./pages/admin/ReportsManagement";
import ExamsManagement from "./pages/admin/ExamsManagement";
import UserApprovals from "./pages/admin/UserApprovals";
import AnnouncementsManagement from "./pages/admin/AnnouncementsManagement";
import CalendarManagement from "./pages/admin/CalendarManagement";
import CertificatesManagement from "./pages/admin/CertificatesManagement";
import StudentPerformance from "./pages/admin/StudentPerformance";
import StudentApplicationsManagement from "./pages/admin/StudentApplicationsManagement";

// Course Hierarchy
import SubjectManager from "./pages/admin/SubjectManager";
import ModuleManager from "./pages/admin/ModuleManager";
import ModuleContentManager from "./pages/admin/ModuleContentManager";

// Polo Management
import PoloDirectorDashboard from "./pages/admin/polo/PoloDirectorDashboard";

// Forum
import { ForumList, TopicList } from "./pages/forum/ForumComponents";
import TopicView from "./pages/forum/TopicView";

// Professor Pages
import ProfessorClasses from "./pages/professor/ProfessorClasses";
import ProfessorGrades from "./pages/professor/ProfessorGrades";
import ProfessorForum from "./pages/professor/ProfessorForum";

// Student Pages
import StudentFinancial from "./pages/student/StudentFinancial";
import StudentCertificates from "./pages/student/StudentCertificates";
import StudentTranscript from "./pages/student/StudentTranscript";
import StudentProgress from "./pages/student/StudentProgress";
import StudentGamification from "./pages/student/StudentGamification";
import StudentLeaderboard from "./pages/student/StudentLeaderboard";
import StudentCourses from "./pages/student/StudentCourses";
import StudentLessons from "./pages/student/StudentLessons";
import StudentExams from "./pages/student/StudentExams";
import StudentCalendar from "./pages/student/StudentCalendar";
import StudentSupport from "./pages/student/StudentSupport";
import StudentLearningArea from "./pages/student/StudentLearningArea";
import StudentRegistrationPage from "./pages/public/StudentRegistrationPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseSlug" element={<CourseDetails />} />
            <Route path="/verify/:code" element={<VerifyCertificate />} />
            <Route path="/revista/:revistaId" element={<RevistaDetails />} />
            <Route path="/galeria" element={<Gallery />} />
            <Route path="/institucional" element={<Institutional />} />
            <Route path="/institucional/missao" element={<MissionVisionValues />} />
            <Route path="/institucional/regimento" element={<Regimento />} />
            <Route path="/institucional/ouvidoria" element={<Ouvidoria />} />
            <Route path="/institucional/administracao" element={<AdministracaoAcademica />} />
            <Route path="/institucional/cpa" element={<CPA />} />
            <Route path="/ensino" element={<Ensino />} />
            <Route path="/ensino/graduacao" element={<Graduacao />} />
            <Route path="/ensino/graduacao-ead" element={<GraduacaoEAD />} />
            <Route path="/ensino/pos-graduacao" element={<PosGraduacao />} />
            <Route path="/vestibular/online-2026" element={<VestibularOnline />} />
            <Route path="/vestibular/agendado-2026" element={<VestibularAgendado />} />
            <Route path="/ead/faq" element={<EadFaq />} />
            <Route path="/biblioteca/guia-link" element={<GuiaELink />} />
            <Route path="/biblioteca/abnt-colecao" element={<AbntColecao />} />

            {/* Public Student Registration */}
            <Route path="/inscricao" element={<StudentRegistrationPage />} />

            {/* Pending Approval */}
            <Route path="/pending-approval" element={<PendingApproval />} />

            {/* Admin Portal */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/alunos/:studentId/desempenho" element={<StudentPerformance />} />
              <Route path="/admin/alunos" element={<StudentsManagement />} />
              <Route path="/admin/inscricoes" element={<StudentApplicationsManagement />} />
              <Route path="/admin/professores" element={<ProfessorsManagement />} />
              <Route path="/admin/cursos" element={<CoursesManagement />} />
              <Route path="/admin/modulos" element={<AllModulesManagement />} />
              <Route path="/admin/cursos/:courseId/modulos" element={<ModulesManagement />} />
              <Route path="/admin/aulas" element={<LessonsManagement />} />
              <Route path="/admin/cursos/:courseId/modulos/:moduleId/aulas" element={<LessonsManagement />} />
              <Route path="/admin/restore" element={<RestoreContent />} />
              <Route path="/admin/polos" element={<PolosManagement />} />
              <Route path="/admin/financeiro" element={<FinancialManagement />} />
              <Route path="/admin/relatorios" element={<ReportsManagement />} />
              <Route path="/admin/provas" element={<ExamsManagement />} />
              <Route path="/admin/provas/:moduleId" element={<ExamsManagement />} />
              <Route path="/admin/provas/:examId/questoes" element={<ExamQuestionsManagement />} />
              <Route path="/admin/cursos/:courseId/conteudo" element={<CourseModulesManagement />} />
              <Route path="/admin/aprovacoes" element={<UserApprovals />} />
              <Route path="/admin/comunicados" element={<AnnouncementsManagement />} />
              <Route path="/admin/calendario" element={<CalendarManagement />} />
              <Route path="/admin/certificados" element={<CertificatesManagement />} />
              <Route path="/admin/certificados" element={<CertificatesManagement />} />

              {/* Course Hierarchy */}
              <Route path="/admin/courses/:courseId/subjects" element={<SubjectManager />} />
              <Route path="/admin/subjects/:subjectId/modules" element={<ModuleManager />} />
              <Route path="/admin/modules/:moduleId/content" element={<ModuleContentManager />} />

              {/* Polo Management */}
              <Route path="/admin/polo-dashboard" element={<PoloDirectorDashboard />} />
            </Route>

            {/* SuperAdmin Portal */}
            <Route element={<SuperAdminLayout />}>
              <Route path="/superadmin" element={<SuperAdminDashboard />} />
            </Route>

            {/* Professor Portal */}
            <Route path="/professor" element={<ProfessorDashboard />} />
            <Route path="/professor/turmas" element={<ProfessorClasses />} />
            <Route path="/professor/notas" element={<ProfessorGrades />} />
            <Route path="/professor/forum" element={<ProfessorForum />} />

            {/* Student Portal */}
            <Route element={<StudentLayout />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/financeiro" element={<StudentFinancial />} />
              <Route path="/student/certificados" element={<StudentCertificates />} />
              <Route path="/student/historico" element={<StudentTranscript />} />
              <Route path="/student/progresso" element={<StudentProgress />} />
              <Route path="/student/conquistas" element={<StudentGamification />} />
              <Route path="/student/ranking" element={<StudentLeaderboard />} />
              <Route path="/student/courses" element={<StudentCourses />} />
              <Route path="/student/lessons" element={<StudentLessons />} />
              <Route path="/student/exams" element={<StudentExams />} />
              <Route path="/student/calendar" element={<StudentCalendar />} />
              <Route path="/student/support" element={<StudentSupport />} />
              <Route path="/aluno/cursos" element={<StudentLearningArea />} />
              <Route path="/course/:courseId" element={<CourseViewer />} />
              <Route path="/exam/:examId" element={<ExamPage />} />
              <Route path="/exam-result/:examId" element={<ExamResult />} />
              <Route path="/certificate/:examId" element={<Certificate />} />
            </Route>

            {/* Forum Routes */}
            <Route path="/forum/staff" element={<ForumList type="staff" />} />
            <Route path="/forum/student" element={<ForumList type="student" />} />
            <Route path="/forum/:type/:slug" element={<TopicList />} />
            <Route path="/forum/topic/:topicId" element={<TopicView />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <WhatsAppButton />
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
