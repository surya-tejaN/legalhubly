import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { StatCard, SectionHeader, StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import {
  Users, Briefcase, DollarSign, CalendarDays, ArrowRight, TrendingUp,
  Clock, Bot, CheckCircle2, AlertTriangle, Timer, FileText, Plus,
  Zap, Bell, ChevronRight, RefreshCw, Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

export default function LawyerDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [matters, setMatters] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [leadsRes, mattersRes, tasksRes, consultsRes, paymentsRes] = await Promise.all([
        supabase.from("leads" as any).select("*").order("created_at", { ascending: false }).limit(4),
        supabase.from("matters" as any).select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("tasks" as any).select("*").neq("status", "completed").order("due_date").limit(5),
        supabase.from("consultations" as any).select("*").gte("scheduled_at", new Date().toISOString().split("T")[0]).order("scheduled_at").limit(4),
        supabase.from("payments" as any).select("*"),
      ]);
      setLeads((leadsRes.data as any[]) || []);
      setMatters((mattersRes.data as any[]) || []);
      setTasks((tasksRes.data as any[]) || []);
      setConsultations((consultsRes.data as any[]) || []);
      setPayments((paymentsRes.data as any[]) || []);
    };
    load();
  }, []);

  const hotLeads = leads.filter((l) => l.status === "hot").length;
  const activeMatters = matters.filter((m) => m.status === "active" || m.status === "discovery").length;
  const pendingTasks = tasks.filter((t) => t.status !== "completed").length;
  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const pendingPayments = payments.filter((p) => p.status === "pending" || p.status === "overdue").reduce((s, p) => s + Number(p.amount), 0);

  const getLeadVariant = (s: string) => s === "hot" ? "destructive" : s === "warm" ? "warning" : s === "new" ? "info" : "default";

  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName="Sarah Chen" userRole="Attorney">
      <SectionHeader
        title="Good morning, Sarah"
        subtitle="Here's your practice overview for today"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/lawyer/leads"><Bell className="mr-2 h-3.5 w-3.5" /> {hotLeads} urgent leads</Link>
            </Button>
            <Button variant="gold" size="sm" asChild>
              <Link to="/lawyer/cases"><Plus className="mr-2 h-3.5 w-3.5" /> New Matter</Link>
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <Users className="h-5 w-5 text-accent" />, label: "New Leads", value: leads.length, change: `${hotLeads} hot`, changeType: "positive" as const },
          { icon: <Briefcase className="h-5 w-5 text-accent" />, label: "Active Matters", value: activeMatters, change: `${pendingTasks} tasks due`, changeType: "neutral" as const },
          { icon: <DollarSign className="h-5 w-5 text-accent" />, label: "Revenue MTD", value: `$${totalRevenue.toLocaleString()}`, change: `$${pendingPayments.toLocaleString()} pending`, changeType: "positive" as const },
          { icon: <CalendarDays className="h-5 w-5 text-accent" />, label: "Today's Meetings", value: consultations.filter(c => new Date(c.scheduled_at).toDateString() === new Date().toDateString()).length || consultations.length },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: Leads + Matters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Pipeline */}
          <div className="rounded-xl bg-card border shadow-card">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">Lead Pipeline</h2>
                {leads.some(l => l.conflict_status === "pending") && (
                  <span className="text-[10px] font-bold bg-warning/10 text-warning px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Conflict checks pending
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/lawyer/leads">View All <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <div className="divide-y">
              {leads.slice(0, 4).map((lead) => (
                <div key={lead.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 text-accent font-semibold text-sm">
                    {lead.client_name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{lead.client_name}</span>
                      <StatusBadge status={lead.status} variant={getLeadVariant(lead.status)} />
                      <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">{lead.lead_score}%</span>
                      {lead.conflict_status === "pending" && (
                        <span className="text-[10px] font-bold bg-warning/10 text-warning px-1.5 py-0.5 rounded-full">⚠ Conflict</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{lead.issue}</div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/lawyer/leads">Review</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Matters */}
          <div className="rounded-xl bg-card border shadow-card">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold text-foreground">Active Matters</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/lawyer/cases">View All <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <div className="divide-y">
              {matters.slice(0, 4).map((m: any) => (
                <div key={m.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{m.title}</span>
                      <StatusBadge
                        status={m.status}
                        variant={m.status === "active" ? "success" : m.status === "discovery" ? "info" : m.status === "pending" ? "warning" : "default"}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {m.client_name} · ${Number(m.total_billed).toLocaleString()} billed
                      {m.next_deadline && ` · Due ${new Date(m.next_deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${m.priority === "high" ? "text-destructive" : m.priority === "medium" ? "text-warning" : "text-muted-foreground"}`}>
                    {m.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Due */}
          <div className="rounded-xl bg-card border shadow-card">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold text-foreground">Upcoming Tasks</h2>
              <span className="text-xs text-muted-foreground">{pendingTasks} pending</span>
            </div>
            <div className="divide-y">
              {tasks.slice(0, 4).map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 p-4">
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    t.status === "completed" ? "border-success bg-success/10" : t.status === "in_progress" ? "border-accent bg-accent/10" : "border-border"
                  }`}>
                    {t.status === "completed" && <CheckCircle2 className="h-3 w-3 text-success" />}
                    {t.status === "in_progress" && <Timer className="h-3 w-3 text-accent" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-foreground">{t.title}</span>
                  </div>
                  {t.due_date && (
                    <span className={`text-xs font-medium ${new Date(t.due_date) < new Date() ? "text-destructive" : "text-muted-foreground"}`}>
                      {new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="rounded-xl bg-card border shadow-card">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold text-foreground">Schedule</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/lawyer/calendar">Full Calendar <ChevronRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <div className="p-4 space-y-3">
              {consultations.slice(0, 4).map((c: any) => (
                <div key={c.id} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-accent">
                      {new Date(c.scheduled_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{c.duration_minutes} min</span>
                  </div>
                  <div className="font-medium text-sm text-foreground mt-1">{c.client_name}</div>
                  <div className="text-xs text-muted-foreground">{c.title} · {c.type}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="rounded-xl bg-card border shadow-card p-5">
            <h2 className="font-semibold text-foreground mb-4">Revenue Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Collected</span>
                <span className="text-sm font-semibold text-success">${totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="text-sm font-semibold text-warning">${payments.filter(p => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Overdue</span>
                <span className="text-sm font-semibold text-destructive">${payments.filter(p => p.status === "overdue").reduce((s, p) => s + Number(p.amount), 0).toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">Total Outstanding</span>
                  <span className="text-sm font-bold text-foreground">${pendingPayments.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Assistant */}
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center">
                <Bot className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground">AI Legal Assistant</div>
                <div className="text-xs text-muted-foreground">Research, draft & analyze</div>
              </div>
              <Zap className="h-4 w-4 text-accent ml-auto animate-pulse" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-success" /> 3 case summaries generated today
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <FileText className="h-3 w-3 text-accent" /> 1 document draft in progress
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="gold" size="sm" className="flex-1" asChild>
                <Link to="/lawyer/documents"><Bot className="mr-2 h-3.5 w-3.5" /> AI Studio</Link>
              </Button>
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link to="/lawyer/messages"><Zap className="mr-2 h-3.5 w-3.5" /> Ask AI</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
