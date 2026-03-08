import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { StatCard, SectionHeader, StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Briefcase, MessageSquare, FileText, ArrowRight, Bot, CalendarDays, Scale, CheckCircle2, Clock, Bell, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MatterTimeline from "@/components/MatterTimeline";
import TaskChecklist from "@/components/TaskChecklist";
import ClientSupportChat from "@/components/ClientSupportChat";

const recentCases = [
  { id: "C-2024-001", title: "Employment Dispute", lawyer: "Sarah Chen", status: "Active", statusVariant: "success" as const, updated: "2 hours ago", progress: 65 },
  { id: "C-2024-002", title: "Lease Agreement Review", lawyer: "Michael Park", status: "Pending", statusVariant: "warning" as const, updated: "1 day ago", progress: 30 },
  { id: "C-2024-003", title: "Business Formation", lawyer: "Lisa Wong", status: "Completed", statusVariant: "info" as const, updated: "3 days ago", progress: 100 },
];

const timelineEvents = [
  { id: "1", title: "Intake Completed", description: "AI intake processed and case summary generated", date: "Mar 1, 2026", type: "ai" as const, completed: true },
  { id: "2", title: "Lawyer Matched", description: "Matched with Sarah Chen — Employment Law specialist", date: "Mar 2, 2026", type: "milestone" as const, completed: true },
  { id: "3", title: "Initial Consultation", description: "30-min video call to discuss case details", date: "Mar 4, 2026", type: "appointment" as const, completed: true },
  { id: "4", title: "Documents Uploaded", description: "Employment contract and termination letter submitted", date: "Mar 5, 2026", type: "document" as const, completed: true },
  { id: "5", title: "Legal Review in Progress", description: "Sarah Chen is reviewing your documents and drafting response", date: "Mar 8, 2026", type: "task" as const, completed: false, current: true },
  { id: "6", title: "Response Letter Draft", description: "Review and approve the formal response letter", date: "Pending", type: "document" as const, completed: false },
  { id: "7", title: "Settlement Negotiation", description: "Negotiate terms with former employer", date: "Upcoming", type: "milestone" as const, completed: false },
];

const myTasks = [
  { id: "1", title: "Upload last 3 months of pay stubs", description: "Needed for damages calculation", dueDate: "Mar 10", priority: "high" as const, completed: false, assignedBy: "Sarah Chen", caseName: "Employment Dispute" },
  { id: "2", title: "Review draft response letter", description: "Check facts and approve before sending", dueDate: "Mar 12", priority: "high" as const, completed: false, assignedBy: "Sarah Chen", caseName: "Employment Dispute" },
  { id: "3", title: "Sign engagement letter", dueDate: "Mar 11", priority: "medium" as const, completed: false, assignedBy: "Michael Park", caseName: "Lease Review" },
  { id: "4", title: "Provide employer contact information", priority: "low" as const, completed: true, assignedBy: "Sarah Chen", caseName: "Employment Dispute" },
  { id: "5", title: "Complete intake questionnaire", priority: "medium" as const, completed: true, assignedBy: "System", caseName: "Employment Dispute" },
];

const upcomingConsultations = [
  { lawyer: "Sarah Chen", date: "Mar 12, 2026", time: "10:00 AM", type: "Video Call", status: "Confirmed" },
  { lawyer: "Michael Park", date: "Mar 15, 2026", time: "2:30 PM", type: "Phone Call", status: "Pending" },
];

const anim = (delay: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.4 } });

export default function ClientDashboard() {
  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName="Alex Johnson" userRole="Client">
      {/* Welcome section — calm, reassuring */}
      <div className="mb-8">
        <motion.div {...anim(0)}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-foreground">Welcome back, Alex</h1>
              <p className="text-muted-foreground mt-1">Your legal matters are being handled with care. Here's your latest update.</p>
            </div>
            <Button variant="gold" asChild>
              <Link to="/client/intake"><Sparkles className="mr-2 h-4 w-4" /> New Legal Issue</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <Briefcase className="h-5 w-5 text-accent" />, label: "Active Cases", value: 2, change: "+1 this week", changeType: "positive" as const },
          { icon: <MessageSquare className="h-5 w-5 text-accent" />, label: "Unread Messages", value: 3, change: "2 new", changeType: "positive" as const },
          { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, label: "Tasks Due", value: 3, change: "2 urgent", changeType: "negative" as const },
          { icon: <CalendarDays className="h-5 w-5 text-accent" />, label: "Upcoming Consults", value: 2 },
        ].map((stat, i) => (
          <motion.div key={stat.label} {...anim(i * 0.05)}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: Cases + Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active matter with timeline */}
          <motion.div {...anim(0.15)}>
            <div className="rounded-xl bg-card border shadow-card">
              <div className="flex items-center justify-between p-5 border-b">
                <div>
                  <h2 className="font-semibold text-foreground">Employment Dispute — Progress</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">C-2024-001 · Sarah Chen · Chen & Associates</p>
                </div>
                <StatusBadge status="Active" variant="success" />
              </div>
              <div className="p-5">
                <MatterTimeline events={timelineEvents} />
              </div>
            </div>
          </motion.div>

          {/* My Tasks */}
          <motion.div {...anim(0.2)}>
            <div className="rounded-xl bg-card border shadow-card">
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-semibold text-foreground">My Tasks</h2>
                <span className="text-xs font-medium text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
                  {myTasks.filter(t => !t.completed && t.priority === "high").length} urgent
                </span>
              </div>
              <div className="p-4">
                <TaskChecklist tasks={myTasks} />
              </div>
            </div>
          </motion.div>

          {/* Recent Cases */}
          <motion.div {...anim(0.25)}>
            <div className="rounded-xl bg-card border shadow-card">
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-semibold text-foreground">All Cases</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/client/cases">View All <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
              <div className="divide-y">
                {recentCases.map((c) => (
                  <Link key={c.id} to="/client/cases" className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Scale className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{c.title}</span>
                        <StatusBadge status={c.status} variant={c.statusVariant} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{c.id} · {c.lawyer}</div>
                      <div className="mt-2">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${c.progress}%` }} />
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Upcoming Consultations */}
          <motion.div {...anim(0.1)}>
            <div className="rounded-xl bg-card border shadow-card">
              <div className="p-5 border-b">
                <h2 className="font-semibold text-foreground">Upcoming Consultations</h2>
              </div>
              <div className="p-4 space-y-3">
                {upcomingConsultations.map((c, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-foreground">{c.lawyer}</div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        c.status === "Confirmed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      }`}>{c.status}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" /> {c.date} at {c.time}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-full">{c.type}</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/client/find-lawyers">Book New Consultation</Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div {...anim(0.15)}>
            <div className="rounded-xl bg-card border shadow-card p-5">
              <h2 className="font-semibold text-foreground text-sm mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Find Lawyers", icon: <Scale className="h-4 w-4" />, to: "/client/find-lawyers" },
                  { label: "Messages", icon: <MessageSquare className="h-4 w-4" />, to: "/client/messages" },
                  { label: "Documents", icon: <FileText className="h-4 w-4" />, to: "/client/documents" },
                  { label: "Payments", icon: <Shield className="h-4 w-4" />, to: "/client/payments" },
                ].map((a) => (
                  <Link
                    key={a.label}
                    to={a.to}
                    className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/30 hover:border-accent/20 transition-all text-sm font-medium text-foreground"
                  >
                    <span className="text-accent">{a.icon}</span>
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* AI Assistant promo */}
          <motion.div {...anim(0.2)}>
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">Need Help?</div>
                  <div className="text-xs text-muted-foreground">Our AI assistant is here 24/7</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Ask about your cases, legal procedures, or platform features. Click the chat bubble in the bottom-right corner.</p>
              <div className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                <Shield className="h-2.5 w-2.5" /> General guidance only — not legal advice
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <ClientSupportChat />
    </DashboardLayout>
  );
}
