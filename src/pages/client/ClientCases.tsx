import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { SectionHeader, StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Scale, ArrowRight, Filter, ArrowLeft, Clock, CheckCircle2, FileText, MessageSquare, Calendar, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MatterTimeline from "@/components/MatterTimeline";
import TaskChecklist from "@/components/TaskChecklist";
import ClientSupportChat from "@/components/ClientSupportChat";
import { cn } from "@/lib/utils";

const cases = [
  {
    id: "C-2024-001", title: "Employment Dispute — Wrongful Termination", lawyer: "Sarah Chen", firm: "Chen & Associates",
    status: "Active", statusVariant: "success" as const, progress: 65, updated: "2 hours ago", nextStep: "Lawyer reviewing documents",
    timeline: [
      { id: "1", title: "Intake Completed", description: "AI processed your case details", date: "Mar 1", type: "ai" as const, completed: true },
      { id: "2", title: "Matched with Sarah Chen", description: "Employment law specialist with 12 years experience", date: "Mar 2", type: "milestone" as const, completed: true },
      { id: "3", title: "Initial Consultation", description: "Video call — case strategy discussed", date: "Mar 4", type: "appointment" as const, completed: true },
      { id: "4", title: "Documents Submitted", description: "Contract and termination letter uploaded", date: "Mar 5", type: "document" as const, completed: true },
      { id: "5", title: "Legal Review", description: "Drafting response letter", date: "Mar 8", type: "task" as const, completed: false, current: true },
      { id: "6", title: "Response Letter", description: "Review and approve", date: "Pending", type: "document" as const, completed: false },
    ],
    tasks: [
      { id: "1", title: "Upload pay stubs", priority: "high" as const, completed: false, assignedBy: "Sarah Chen", caseName: "Employment Dispute" },
      { id: "2", title: "Review draft letter", priority: "high" as const, completed: false, assignedBy: "Sarah Chen", caseName: "Employment Dispute", dueDate: "Mar 12" },
    ],
  },
  {
    id: "C-2024-002", title: "Commercial Lease Agreement Review", lawyer: "Michael Park", firm: "Park Legal Group",
    status: "Pending Review", statusVariant: "warning" as const, progress: 30, updated: "1 day ago", nextStep: "Awaiting lawyer response",
    timeline: [
      { id: "1", title: "Intake Completed", description: "Case details submitted", date: "Feb 28", type: "ai" as const, completed: true },
      { id: "2", title: "Matched with Michael Park", description: "Real estate law specialist", date: "Mar 1", type: "milestone" as const, completed: true },
      { id: "3", title: "Awaiting Review", description: "Lawyer is reviewing your lease", date: "Mar 3", type: "task" as const, completed: false, current: true },
    ],
    tasks: [
      { id: "3", title: "Sign engagement letter", priority: "medium" as const, completed: false, assignedBy: "Michael Park", caseName: "Lease Review", dueDate: "Mar 11" },
    ],
  },
  {
    id: "C-2024-003", title: "LLC Business Formation", lawyer: "Lisa Wong", firm: "Wong Business Law",
    status: "Completed", statusVariant: "info" as const, progress: 100, updated: "3 days ago", nextStep: "All documents filed",
    timeline: [
      { id: "1", title: "Intake Completed", description: "Business formation details provided", date: "Feb 15", type: "ai" as const, completed: true },
      { id: "2", title: "Matched with Lisa Wong", description: "Business law specialist", date: "Feb 16", type: "milestone" as const, completed: true },
      { id: "3", title: "LLC Documents Drafted", description: "Operating agreement prepared", date: "Feb 20", type: "document" as const, completed: true },
      { id: "4", title: "Filed with State", description: "LLC formation completed", date: "Feb 25", type: "milestone" as const, completed: true },
    ],
    tasks: [],
  },
];

type Tab = "overview" | "timeline" | "tasks";

export default function ClientCases() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const expandedCase = cases.find((c) => c.id === expandedId);

  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName="Alex Johnson" userRole="Client">
      <AnimatePresence mode="wait">
        {expandedCase ? (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button
              onClick={() => { setExpandedId(null); setActiveTab("overview"); }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to all cases
            </button>

            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-serif text-foreground">{expandedCase.title}</h1>
                  <StatusBadge status={expandedCase.status} variant={expandedCase.statusVariant} />
                </div>
                <p className="text-muted-foreground mt-1">{expandedCase.id} · {expandedCase.lawyer} at {expandedCase.firm}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild><Link to="/client/messages"><MessageSquare className="mr-2 h-3.5 w-3.5" /> Message</Link></Button>
                <Button variant="outline" size="sm" asChild><Link to="/client/documents"><FileText className="mr-2 h-3.5 w-3.5" /> Documents</Link></Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="rounded-xl bg-card border shadow-card p-5 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Case Progress</span>
                <span className="text-sm font-bold text-accent">{expandedCase.progress}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${expandedCase.progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Next: {expandedCase.nextStep}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-muted/50 rounded-lg p-1 w-fit">
              {(["overview", "timeline", "tasks"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize",
                    activeTab === tab ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-xl bg-card border shadow-card p-5">
                  <h3 className="font-semibold text-foreground mb-4">Timeline</h3>
                  <MatterTimeline events={expandedCase.timeline} />
                </div>
                <div className="rounded-xl bg-card border shadow-card p-5">
                  <h3 className="font-semibold text-foreground mb-4">Your Tasks ({expandedCase.tasks.filter(t => !t.completed).length} pending)</h3>
                  {expandedCase.tasks.length > 0 ? (
                    <TaskChecklist tasks={expandedCase.tasks} />
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No pending tasks</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="rounded-xl bg-card border shadow-card p-6">
                <MatterTimeline events={expandedCase.timeline} />
              </div>
            )}

            {activeTab === "tasks" && (
              <div className="rounded-xl bg-card border shadow-card p-5">
                {expandedCase.tasks.length > 0 ? (
                  <TaskChecklist tasks={expandedCase.tasks} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">All tasks completed!</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SectionHeader
              title="My Cases"
              subtitle="Track and manage all your legal matters"
              action={
                <Button variant="gold" size="sm" asChild><Link to="/client/intake">New Case</Link></Button>
              }
            />

            <div className="space-y-4">
              {cases.map((c, index) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setExpandedId(c.id)}
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
          </motion.div>
        )}
      </AnimatePresence>

      <ClientSupportChat />
    </DashboardLayout>
  );
}
