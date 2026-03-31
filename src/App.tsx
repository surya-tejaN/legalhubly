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

// Auth pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmailSuccess from "./pages/auth/VerifyEmailSuccess";

// Client pages
import ClientDashboard from "./pages/client/ClientDashboard";
import FindLawyers from "./pages/client/FindLawyers";
import LawyerProfile from "./pages/client/LawyerProfile";
import AccountSettings from "./pages/client/AccountSettings";
import SavedLawyers from "./pages/client/SavedLawyers";
import ClientMessages from "./pages/client/ClientMessages";
import ClientDocuments from "./pages/client/ClientDocuments";
import ClientCases from "./pages/client/ClientCases";
import ClientConsultations from "./pages/client/ClientConsultations";
import ClientPayments from "./pages/client/ClientPayments";

// Lawyer pages
import LawyerDashboard from "./pages/lawyer/LawyerDashboard";
import LawyerLeads from "./pages/lawyer/LawyerLeads";
import LawyerMessages from "./pages/lawyer/LawyerMessages";
import LawyerCases from "./pages/lawyer/LawyerCases";
import LawyerCalendar from "./pages/lawyer/LawyerCalendar";
import LawyerBilling from "./pages/lawyer/LawyerBilling";
import LawyerDocuments from "./pages/lawyer/LawyerDocuments";

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
        <Route path="/verify-email-success" element={<PageTransition><VerifyEmailSuccess /></PageTransition>} />

        {/* Lawyer Discovery (public) */}
        <Route path="/client/find-lawyers" element={<PageTransition><FindLawyers /></PageTransition>} />
        <Route path="/client/lawyer/:lawyerId" element={<PageTransition><LawyerProfile /></PageTransition>} />

        {/* Client (authenticated) */}
        <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><ClientDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/client/saved-lawyers" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><SavedLawyers /></PageTransition></ProtectedRoute>} />
        <Route path="/client/messages" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><ClientMessages /></PageTransition></ProtectedRoute>} />
        <Route path="/client/cases" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><ClientCases /></PageTransition></ProtectedRoute>} />
        <Route path="/client/consultations" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><ClientConsultations /></PageTransition></ProtectedRoute>} />
        <Route path="/client/documents" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><ClientDocuments /></PageTransition></ProtectedRoute>} />
        <Route path="/client/payments" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><ClientPayments /></PageTransition></ProtectedRoute>} />
        <Route path="/client/settings" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><AccountSettings /></PageTransition></ProtectedRoute>} />

        {/* Lawyer (authenticated) */}
        <Route path="/lawyer/dashboard" element={<ProtectedRoute allowedRoles={["lawyer"]}><PageTransition><LawyerDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/lawyer/leads" element={<ProtectedRoute allowedRoles={["lawyer"]}><PageTransition><LawyerLeads /></PageTransition></ProtectedRoute>} />
        <Route path="/lawyer/messages" element={<ProtectedRoute allowedRoles={["lawyer"]}><PageTransition><LawyerMessages /></PageTransition></ProtectedRoute>} />
        <Route path="/lawyer/cases" element={<ProtectedRoute allowedRoles={["lawyer"]}><PageTransition><LawyerCases /></PageTransition></ProtectedRoute>} />
        <Route path="/lawyer/calendar" element={<ProtectedRoute allowedRoles={["lawyer"]}><PageTransition><LawyerCalendar /></PageTransition></ProtectedRoute>} />
        <Route path="/lawyer/billing" element={<ProtectedRoute allowedRoles={["lawyer"]}><PageTransition><LawyerBilling /></PageTransition></ProtectedRoute>} />
        <Route path="/lawyer/documents" element={<ProtectedRoute allowedRoles={["lawyer"]}><PageTransition><LawyerDocuments /></PageTransition></ProtectedRoute>} />

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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
