import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AiChatPlaceholder from "@/components/AiChatPlaceholder";

// Auth pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Client pages
import ClientDashboard from "./pages/client/ClientDashboard";
import CaseIntake from "./pages/client/CaseIntake";
import ClientCases from "./pages/client/ClientCases";
import FindLawyers from "./pages/client/FindLawyers";
import ClientMessages from "./pages/client/ClientMessages";
import ClientDocuments from "./pages/client/ClientDocuments";
import ClientPayments from "./pages/client/ClientPayments";
import LawyerProfile from "./pages/client/LawyerProfile";
import AccountSettings from "./pages/client/AccountSettings";

// Lawyer pages
import LawyerDashboard from "./pages/lawyer/LawyerDashboard";
import LawyerLeads from "./pages/lawyer/LawyerLeads";
import LawyerCases from "./pages/lawyer/LawyerCases";
import LawyerCalendar from "./pages/lawyer/LawyerCalendar";
import LawyerDocuments from "./pages/lawyer/LawyerDocuments";
import LawyerMessages from "./pages/lawyer/LawyerMessages";
import LawyerAnalytics from "./pages/lawyer/LawyerAnalytics";
import LawyerBilling from "./pages/lawyer/LawyerBilling";

// Firm & Admin pages
import FirmDashboard from "./pages/firm/FirmDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Shared pages
import CaseWorkspace from "./pages/shared/CaseWorkspace";
import PricingPlans from "./pages/shared/PricingPlans";

// SEO pages
import SeoLandingPage from "./pages/seo/SeoLandingPage";
import CityExplorer from "./pages/CityExplorer";
import CityDepartments from "./pages/CityDepartments";
import SeoDirectory from "./pages/seo/SeoDirectory";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />

        {/* Auth */}
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />

        {/* Client Portal */}
        <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><ClientDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/client/intake" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><CaseIntake /></PageTransition></ProtectedRoute>} />
        <Route path="/client/cases" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><ClientCases /></PageTransition></ProtectedRoute>} />
        <Route path="/client/find-lawyers" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><FindLawyers /></PageTransition></ProtectedRoute>} />
        <Route path="/client/messages" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><ClientMessages /></PageTransition></ProtectedRoute>} />
        <Route path="/client/cases/:caseId" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><CaseWorkspace role="client" /></PageTransition></ProtectedRoute>} />
        <Route path="/client/documents" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><ClientDocuments /></PageTransition></ProtectedRoute>} />
        <Route path="/client/payments" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><ClientPayments /></PageTransition></ProtectedRoute>} />
        <Route path="/client/lawyer/:lawyerId" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><LawyerProfile /></PageTransition></ProtectedRoute>} />
        <Route path="/client/settings" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><AccountSettings /></PageTransition></ProtectedRoute>} />

        {/* Lawyer Portal */}
        <Route path="/lawyer/dashboard" element={<ProtectedRoute allowedRoles={["lawyer", "firm_admin"]}><PageTransition><LawyerDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/lawyer/leads" element={<ProtectedRoute allowedRoles={["lawyer", "firm_admin"]}><PageTransition><LawyerLeads /></PageTransition></ProtectedRoute>} />
        <Route path="/lawyer/cases/:caseId" element={<ProtectedRoute allowedRoles={["lawyer", "firm_admin"]}><PageTransition><CaseWorkspace role="lawyer" /></PageTransition></ProtectedRoute>} />
        <Route path="/lawyer/cases" element={<ProtectedRoute allowedRoles={["lawyer", "firm_admin"]}><PageTransition><LawyerCases /></PageTransition></ProtectedRoute>} />
        <Route path="/lawyer/calendar" element={<ProtectedRoute allowedRoles={["lawyer", "firm_admin"]}><PageTransition><LawyerCalendar /></PageTransition></ProtectedRoute>} />
        <Route path="/lawyer/documents" element={<ProtectedRoute allowedRoles={["lawyer", "firm_admin"]}><PageTransition><LawyerDocuments /></PageTransition></ProtectedRoute>} />
        <Route path="/lawyer/messages" element={<ProtectedRoute allowedRoles={["lawyer", "firm_admin"]}><PageTransition><LawyerMessages /></PageTransition></ProtectedRoute>} />
        <Route path="/lawyer/billing" element={<ProtectedRoute allowedRoles={["lawyer", "firm_admin"]}><PageTransition><LawyerBilling /></PageTransition></ProtectedRoute>} />
        <Route path="/lawyer/analytics" element={<ProtectedRoute allowedRoles={["lawyer", "firm_admin"]}><PageTransition><LawyerAnalytics /></PageTransition></ProtectedRoute>} />

        {/* Firm Admin */}
        <Route path="/firm/dashboard" element={<ProtectedRoute allowedRoles={["firm_admin"]}><PageTransition><FirmDashboard /></PageTransition></ProtectedRoute>} />

        {/* Platform Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["platform_admin"]}><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/pricing" element={<ProtectedRoute allowedRoles={["platform_admin"]}><PageTransition><PricingPlans /></PageTransition></ProtectedRoute>} />

        {/* Public SEO pages */}
        <Route path="/cities" element={<PageTransition><CityExplorer /></PageTransition>} />
        <Route path="/cities/:citySlug" element={<PageTransition><CityDepartments /></PageTransition>} />
        <Route path="/lawyers" element={<PageTransition><SeoDirectory /></PageTransition>} />
        <Route path="/lawyers/:practiceArea/:city" element={<PageTransition><SeoLandingPage /></PageTransition>} />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={200}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
          <AiChatPlaceholder />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
