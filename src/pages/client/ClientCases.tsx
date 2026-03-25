import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { SectionHeader, StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Scale, ArrowRight, Trash2, Briefcase, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ClientSupportChat from "@/components/ClientSupportChat";

const initialCases = [
  { id: "C-2024-001", title: "Employment Dispute — Wrongful Termination", lawyer: "Sarah Chen", firm: "Chen & Associates", status: "Active", statusVariant: "success" as const, progress: 65, updated: "2 hours ago", nextStep: "Lawyer reviewing documents" },
  { id: "C-2024-002", title: "Commercial Lease Agreement Review", lawyer: "Michael Park", firm: "Park Legal Group", status: "Pending Review", statusVariant: "warning" as const, progress: 30, updated: "1 day ago", nextStep: "Awaiting lawyer response" },
  { id: "C-2024-003", title: "LLC Business Formation", lawyer: "Lisa Wong", firm: "Wong Business Law", status: "Completed", statusVariant: "info" as const, progress: 100, updated: "3 days ago", nextStep: "All documents filed" },
  { id: "C-2024-004", title: "Trademark Registration", lawyer: "James Miller", firm: "IP Shield Law", status: "In Progress", statusVariant: "success" as const, progress: 45, updated: "5 hours ago", nextStep: "Filing application with USPTO" },
];

export default function ClientCases() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [cases, setCases] = useState(initialCases);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setCases((prev) => prev.filter((c) => c.id !== id));
    setDeleteTarget(null);
    toast.success("Case deleted successfully");
  };

  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName={profile?.full_name || "Client"} userRole="Client">
      <SectionHeader
        title="My Cases"
        subtitle="Track and manage all your legal matters"
        action={<Button variant="gold" size="sm" asChild><Link to="/client/intake">New Case</Link></Button>}
      />

      {cases.length === 0 ? (
        <div className="text-center py-20 rounded-xl bg-card border">
          <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-serif text-lg text-foreground mb-2">No legal matters yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Your cases will be tracked here once you start working with a lawyer.
          </p>
          <Button variant="gold" asChild>
            <Link to="/client/intake">Start a New Case</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((c, index) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl bg-card border shadow-card p-5 hover:shadow-card-hover transition-all duration-200 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 cursor-pointer" onClick={() => navigate(`/client/cases/${c.id}`)}>
                  <Scale className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/client/cases/${c.id}`)}>
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
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(c.id); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <ArrowRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Delete this case?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All case data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ClientSupportChat />
    </DashboardLayout>
  );
}
