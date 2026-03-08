import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { SectionHeader, StatCard, StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import {
  DollarSign, Clock, Plus, ArrowRight, Timer, CheckCircle2,
  AlertTriangle, FileText, Play, Pause, RotateCcw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export default function LawyerBilling() {
  const [payments, setPayments] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [matters, setMatters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"payments" | "time">("payments");

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerMatter, setTimerMatter] = useState("");
  const [timerDesc, setTimerDesc] = useState("");

  useEffect(() => {
    const load = async () => {
      const [p, t, m] = await Promise.all([
        supabase.from("payments" as any).select("*").order("created_at", { ascending: false }),
        supabase.from("time_entries" as any).select("*").order("date", { ascending: false }),
        supabase.from("matters" as any).select("*"),
      ]);
      setPayments((p.data as any[]) || []);
      setTimeEntries((t.data as any[]) || []);
      setMatters((m.data as any[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  // Timer
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const saveTimeEntry = async () => {
    if (timerSeconds < 60) return;
    const hours = Math.round((timerSeconds / 3600) * 100) / 100;
    await supabase.from("time_entries" as any).insert({
      matter_id: timerMatter || null,
      description: timerDesc || "Time entry",
      hours,
      rate: 350,
      date: new Date().toISOString().split("T")[0],
    } as any);
    setTimerRunning(false);
    setTimerSeconds(0);
    setTimerDesc("");
    // Reload
    const { data } = await supabase.from("time_entries" as any).select("*").order("date", { ascending: false });
    setTimeEntries((data as any[]) || []);
  };

  const totalCollected = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);
  const totalOverdue = payments.filter((p) => p.status === "overdue").reduce((s, p) => s + Number(p.amount), 0);
  const totalHours = timeEntries.reduce((s, t) => s + Number(t.hours), 0);

  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName="Sarah Chen" userRole="Attorney">
      <SectionHeader
        title="Billing & Payments"
        subtitle="Track revenue, time, and invoices"
        action={<Button variant="gold" size="sm"><Plus className="mr-2 h-3.5 w-3.5" /> New Invoice</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<DollarSign className="h-5 w-5 text-accent" />} label="Collected" value={`$${totalCollected.toLocaleString()}`} change="This month" changeType="positive" />
        <StatCard icon={<Clock className="h-5 w-5 text-accent" />} label="Pending" value={`$${totalPending.toLocaleString()}`} change={`${payments.filter(p => p.status === "pending").length} invoices`} changeType="neutral" />
        <StatCard icon={<AlertTriangle className="h-5 w-5 text-destructive" />} label="Overdue" value={`$${totalOverdue.toLocaleString()}`} changeType="negative" change={`${payments.filter(p => p.status === "overdue").length} invoices`} />
        <StatCard icon={<Timer className="h-5 w-5 text-accent" />} label="Hours Tracked" value={totalHours.toFixed(1)} change="This period" />
      </div>

      {/* Timer */}
      <div className="rounded-xl bg-card border shadow-card p-5 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-3xl font-mono font-bold text-foreground tabular-nums">{formatTimer(timerSeconds)}</div>
          <div className="flex gap-2">
            <Button
              variant={timerRunning ? "outline" : "gold"}
              size="sm"
              onClick={() => setTimerRunning(!timerRunning)}
            >
              {timerRunning ? <><Pause className="mr-1.5 h-3.5 w-3.5" /> Pause</> : <><Play className="mr-1.5 h-3.5 w-3.5" /> Start</>}
            </Button>
            {timerSeconds > 0 && !timerRunning && (
              <Button variant="gold" size="sm" onClick={saveTimeEntry}>
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Save Entry
              </Button>
            )}
            {timerSeconds > 0 && (
              <Button variant="ghost" size="sm" onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
              </Button>
            )}
          </div>
          <div className="flex-1 flex gap-2 min-w-[200px]">
            <select
              value={timerMatter}
              onChange={(e) => setTimerMatter(e.target.value)}
              className="rounded-lg border bg-background px-3 py-1.5 text-sm flex-1"
            >
              <option value="">Select matter...</option>
              {matters.map((m: any) => <option key={m.id} value={m.id}>{m.title} ({m.client_name})</option>)}
            </select>
            <input
              value={timerDesc}
              onChange={(e) => setTimerDesc(e.target.value)}
              placeholder="Description..."
              className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["payments", "time"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? "bg-accent text-accent-foreground" : "bg-card border text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab === "payments" ? "Payments & Invoices" : "Time Entries"}
          </button>
        ))}
      </div>

      {activeTab === "payments" ? (
        <div className="rounded-xl bg-card border shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Client</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">Description</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-foreground">{p.client_name}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground hidden md:table-cell">{p.description}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-foreground">${Number(p.amount).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <StatusBadge
                      status={p.status}
                      variant={p.status === "paid" ? "success" : p.status === "pending" ? "warning" : "destructive"}
                    />
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground hidden lg:table-cell">
                    {p.due_date ? new Date(p.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl bg-card border shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Description</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Hours</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">Rate</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {timeEntries.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">No time entries yet. Start the timer above to track time.</td></tr>
              ) : (
                timeEntries.map((t: any) => (
                  <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4 text-sm text-foreground">{new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{t.description}</td>
                    <td className="px-5 py-4 text-sm font-medium text-foreground">{Number(t.hours).toFixed(1)}h</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground hidden md:table-cell">${Number(t.rate)}/hr</td>
                    <td className="px-5 py-4 text-sm font-semibold text-foreground">${(Number(t.hours) * Number(t.rate)).toFixed(0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
