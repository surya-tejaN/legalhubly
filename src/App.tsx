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
        <Route path="/client/settings" element={<ProtectedRoute allowedRoles={["client"]}><PageTransition><AccountSettings /></PageTransition></ProtectedRoute>} />

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
