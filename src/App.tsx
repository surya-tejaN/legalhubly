import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Client pages
import ClientDashboard from "./pages/client/ClientDashboard";
import CaseIntake from "./pages/client/CaseIntake";
import ClientCases from "./pages/client/ClientCases";
import FindLawyers from "./pages/client/FindLawyers";
import ClientMessages from "./pages/client/ClientMessages";
import ClientDocuments from "./pages/client/ClientDocuments";
import ClientPayments from "./pages/client/ClientPayments";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Client Portal */}
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/client/intake" element={<CaseIntake />} />
          <Route path="/client/cases" element={<ClientCases />} />
          <Route path="/client/find-lawyers" element={<FindLawyers />} />
          <Route path="/client/messages" element={<ClientMessages />} />
          <Route path="/client/cases/:caseId" element={<CaseWorkspace role="client" />} />
          <Route path="/client/documents" element={<ClientDocuments />} />
          <Route path="/client/payments" element={<ClientPayments />} />

          {/* Lawyer Portal */}
          <Route path="/lawyer/dashboard" element={<LawyerDashboard />} />
          <Route path="/lawyer/leads" element={<LawyerLeads />} />
          <Route path="/lawyer/cases/:caseId" element={<CaseWorkspace role="lawyer" />} />
          <Route path="/lawyer/cases" element={<LawyerCases />} />
          <Route path="/lawyer/calendar" element={<LawyerCalendar />} />
          <Route path="/lawyer/documents" element={<LawyerDocuments />} />
          <Route path="/lawyer/messages" element={<LawyerMessages />} />
          <Route path="/lawyer/billing" element={<LawyerBilling />} />
          <Route path="/lawyer/analytics" element={<LawyerAnalytics />} />

          {/* Firm Admin */}
          <Route path="/firm/dashboard" element={<FirmDashboard />} />

          {/* Platform Admin */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
