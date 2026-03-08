import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { StatCard, SectionHeader, StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Briefcase, MessageSquare, FileText, Clock, ArrowRight, Bot, CalendarDays, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const recentCases = [
  { id: "C-2024-001", title: "Employment Dispute", lawyer: "Sarah Chen", status: "Active", statusVariant: "success" as const, updated: "2 hours ago" },
  { id: "C-2024-002", title: "Lease Agreement Review", lawyer: "Michael Park", status: "Pending", statusVariant: "warning" as const, updated: "1 day ago" },
  { id: "C-2024-003", title: "Business Formation", lawyer: "Lisa Wong", status: "Completed", statusVariant: "info" as const, updated: "3 days ago" },
];

const upcomingConsultations = [
  { lawyer: "Sarah Chen", date: "Mar 12, 2026", time: "10:00 AM", type: "Video Call" },
  { lawyer: "Michael Park", date: "Mar 15, 2026", time: "2:30 PM", type: "Phone Call" },
];

export default function ClientDashboard() {
  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName="Alex Johnson" userRole="Client">
      <SectionHeader
        title="Welcome back, Alex"
        subtitle="Here's an overview of your legal matters"
        action={
          <Button variant="gold" asChild>
            <Link to="/client/intake"><Bot className="mr-2 h-4 w-4" /> New Legal Issue</Link>
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <StatCard icon={<Briefcase className="h-5 w-5 text-accent" />} label="Active Cases" value={2} change="+1 this week" changeType="positive" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatCard icon={<MessageSquare className="h-5 w-5 text-accent" />} label="Unread Messages" value={3} change="2 new" changeType="positive" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard icon={<FileText className="h-5 w-5 text-accent" />} label="Documents" value={12} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatCard icon={<CalendarDays className="h-5 w-5 text-accent" />} label="Upcoming Consults" value={2} />
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-card border shadow-card">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold text-foreground">Recent Cases</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/client/cases">View All <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <div className="divide-y">
              {recentCases.map((c) => (
                <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Scale className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{c.title}</span>
                      <StatusBadge status={c.status} variant={c.statusVariant} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{c.id} · {c.lawyer} · Updated {c.updated}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Consultations */}
        <div>
          <div className="rounded-xl bg-card border shadow-card">
            <div className="p-5 border-b">
              <h2 className="font-semibold text-foreground">Upcoming Consultations</h2>
            </div>
            <div className="p-4 space-y-3">
              {upcomingConsultations.map((c, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="font-medium text-sm text-foreground">{c.lawyer}</div>
                  <div className="text-xs text-muted-foreground mt-1">{c.date} at {c.time}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-full">{c.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Assistant Card */}
          <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center">
                <Bot className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground">AI Legal Assistant</div>
                <div className="text-xs text-muted-foreground">Get instant answers</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Ask questions about your cases, legal procedures, or get help with documents.</p>
            <Button variant="gold" size="sm" className="w-full">
              <Bot className="mr-2 h-3.5 w-3.5" /> Start Chat
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
