import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import About from "./pages/About";

// Client pages
import FindLawyers from "./pages/client/FindLawyers";
import LawyerProfile from "./pages/client/LawyerProfile";
import MyCases from "./pages/client/MyCases";
import ClientProfile from "./pages/client/ClientProfile";

// Lawyer pages
import LawyerDashboard from "./pages/lawyer/LawyerDashboard";
import LawyerClients from "./pages/lawyer/LawyerClients";
import LawyerTools from "./pages/lawyer/LawyerTools";
import LawyerSettings from "./pages/lawyer/LawyerSettings";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false } },
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
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />

        {/* Public discovery */}
        <Route path="/client/find-lawyers" element={<PageTransition><FindLawyers /></PageTransition>} />
        <Route path="/client/lawyer/:lawyerId" element={<PageTransition><LawyerProfile /></PageTransition>} />

        {/* Client (authenticated) - 3 sections */}
        <Route path="/client/cases" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><MyCases /></PageTransition></ProtectedRoute>} />
        <Route path="/client/profile" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><ClientProfile /></PageTransition></ProtectedRoute>} />
        
        {/* Legacy client routes → redirect */}
        <Route path="/client/dashboard" element={<Navigate to="/client/cases" replace />} />
        <Route path="/client/saved-lawyers" element={<Navigate to="/client/profile" replace />} />
        <Route path="/client/messages" element={<Navigate to="/client/cases" replace />} />
        <Route path="/client/documents" element={<Navigate to="/client/cases" replace />} />
        <Route path="/client/consultations" element={<Navigate to="/client/cases" replace />} />
        <Route path="/client/payments" element={<Navigate to="/client/cases" replace />} />
        <Route path="/client/settings" element={<Navigate to="/client/profile" replace />} />

        {/* Lawyer (authenticated) - 4 sections */}
        <Route path="/lawyer/dashboard" element={<ProtectedRoute allowedRoles={["lawyer"]}><PageTransition><LawyerDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/lawyer/clients" element={<ProtectedRoute allowedRoles={["lawyer"]}><PageTransition><LawyerClients /></PageTransition></ProtectedRoute>} />
        <Route path="/lawyer/tools" element={<ProtectedRoute allowedRoles={["lawyer"]}><PageTransition><LawyerTools /></PageTransition></ProtectedRoute>} />
        <Route path="/lawyer/settings" element={<ProtectedRoute allowedRoles={["lawyer"]}><PageTransition><LawyerSettings /></PageTransition></ProtectedRoute>} />

        {/* Legacy lawyer routes → redirect */}
        <Route path="/lawyer/leads" element={<Navigate to="/lawyer/clients" replace />} />
        <Route path="/lawyer/messages" element={<Navigate to="/lawyer/clients" replace />} />
        <Route path="/lawyer/cases" element={<Navigate to="/lawyer/clients" replace />} />
        <Route path="/lawyer/calendar" element={<Navigate to="/lawyer/tools" replace />} />
        <Route path="/lawyer/billing" element={<Navigate to="/lawyer/tools" replace />} />
        <Route path="/lawyer/documents" element={<Navigate to="/lawyer/tools" replace />} />

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
