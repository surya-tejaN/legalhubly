import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AiChatPlaceholder from "@/components/AiChatPlaceholder";

// Client pages
import ClientDashboard from "./pages/client/ClientDashboard";
import CaseIntake from "./pages/client/CaseIntake";
import ClientCases from "./pages/client/ClientCases";
import FindLawyers from "./pages/client/FindLawyers";
import ClientMessages from "./pages/client/ClientMessages";
import ClientDocuments from "./pages/client/ClientDocuments";
import ClientPayments from "./pages/client/ClientPayments";
import LawyerProfile from "./pages/client/LawyerProfile";

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

        {/* Client Portal */}
        <Route path="/client/dashboard" element={<PageTransition><ClientDashboard /></PageTransition>} />
        <Route path="/client/intake" element={<PageTransition><CaseIntake /></PageTransition>} />
        <Route path="/client/cases" element={<PageTransition><ClientCases /></PageTransition>} />
        <Route path="/client/find-lawyers" element={<PageTransition><FindLawyers /></PageTransition>} />
        <Route path="/client/messages" element={<PageTransition><ClientMessages /></PageTransition>} />
        <Route path="/client/cases/:caseId" element={<PageTransition><CaseWorkspace role="client" /></PageTransition>} />
        <Route path="/client/documents" element={<PageTransition><ClientDocuments /></PageTransition>} />
        <Route path="/client/payments" element={<PageTransition><ClientPayments /></PageTransition>} />
        <Route path="/client/lawyer/:lawyerId" element={<PageTransition><LawyerProfile /></PageTransition>} />

        {/* Lawyer Portal */}
        <Route path="/lawyer/dashboard" element={<PageTransition><LawyerDashboard /></PageTransition>} />
        <Route path="/lawyer/leads" element={<PageTransition><LawyerLeads /></PageTransition>} />
        <Route path="/lawyer/cases/:caseId" element={<PageTransition><CaseWorkspace role="lawyer" /></PageTransition>} />
        <Route path="/lawyer/cases" element={<PageTransition><LawyerCases /></PageTransition>} />
        <Route path="/lawyer/calendar" element={<PageTransition><LawyerCalendar /></PageTransition>} />
        <Route path="/lawyer/documents" element={<PageTransition><LawyerDocuments /></PageTransition>} />
        <Route path="/lawyer/messages" element={<PageTransition><LawyerMessages /></PageTransition>} />
        <Route path="/lawyer/billing" element={<PageTransition><LawyerBilling /></PageTransition>} />
        <Route path="/lawyer/analytics" element={<PageTransition><LawyerAnalytics /></PageTransition>} />

        {/* Firm Admin */}
        <Route path="/firm/dashboard" element={<PageTransition><FirmDashboard /></PageTransition>} />

        {/* Platform Admin */}
        <Route path="/admin/dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="/admin/pricing" element={<PageTransition><PricingPlans /></PageTransition>} />

        {/* City Explorer */}
        <Route path="/cities" element={<PageTransition><CityExplorer /></PageTransition>} />
        <Route path="/cities/:citySlug" element={<PageTransition><CityDepartments /></PageTransition>} />
        <Route path="/lawyers" element={<PageTransition><SeoDirectory /></PageTransition>} />

        {/* SEO Landing Pages - city/practice-area format */}
        <Route path="/:city/:practiceArea" element={<PageTransition><SeoLandingPage /></PageTransition>} />

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
        <AnimatedRoutes />
        <AiChatPlaceholder />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
