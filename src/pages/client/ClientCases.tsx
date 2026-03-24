import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { SectionHeader, StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Scale, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import ClientSupportChat from "@/components/ClientSupportChat";

const cases = [
  { id: "C-2024-001", title: "Employment Dispute — Wrongful Termination", lawyer: "Sarah Chen", firm: "Chen & Associates", status: "Active", statusVariant: "success" as const, progress: 65, updated: "2 hours ago", nextStep: "Lawyer reviewing documents" },
  { id: "C-2024-002", title: "Commercial Lease Agreement Review", lawyer: "Michael Park", firm: "Park Legal Group", status: "Pending Review", statusVariant: "warning" as const, progress: 30, updated: "1 day ago", nextStep: "Awaiting lawyer response" },
  { id: "C-2024-003", title: "LLC Business Formation", lawyer: "Lisa Wong", firm: "Wong Business Law", status: "Completed", statusVariant: "info" as const, progress: 100, updated: "3 days ago", nextStep: "All documents filed" },
  { id: "C-2024-004", title: "Trademark Registration", lawyer: "James Miller", firm: "IP Shield Law", status: "In Progress", statusVariant: "success" as const, progress: 45, updated: "5 hours ago", nextStep: "Filing application with USPTO" },
];

export default function ClientCases() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName={profile?.full_name || "Client"} userRole="Client">
      <SectionHeader
        title="My Cases"
        subtitle="Track and manage all your legal matters"
        action={<Button variant="gold" size="sm" asChild><Link to="/client/intake">New Case</Link></Button>}
      />

      <div className="space-y-4">
        {cases.map((c, index) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(`/client/cases/${c.id}`)}
            className="rounded-xl bg-card border shadow-card p-5 hover:shadow-card-hover transition-all duration-200 cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Scale className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground">{c.title}</h3>
                  <StatusBadge status={c.status} variant={c.statusVariant} />
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {c.id} · {c.lawyer} at {c.firm} · Updated {c.updated}
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{c.nextStep}</span>
                    <span className="font-medium text-foreground">{c.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${c.progress}%` }} />
                  </div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 hidden sm:block" />
            </div>
          </motion.div>
        ))}
      </div>

      <ClientSupportChat />
    </DashboardLayout>
  );
}
