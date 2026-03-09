import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { SectionHeader, StatCard, StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import {
  DollarSign, Clock, Plus, Timer, CheckCircle2,
  AlertTriangle, Play, Pause, RotateCcw, Bot, FileText,
  Send, Sparkles, X, Info, TrendingUp, Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

export default function LawyerBilling() {
  const [payments, setPayments] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [matters, setMatters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"payments" | "time" | "projections" | "ai">("payments");

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerMatter, setTimerMatter] = useState("");
  const [timerDesc, setTimerDesc] = useState("");

  // AI billing agent
  const [aiAction, setAiAction] = useState<string | null>(null);
  const [aiOutput, setAiOutput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (aiLoading) aiEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiOutput, aiLoading]);

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
    const { data } = await supabase.from("time_entries" as any).select("*").order("date", { ascending: false });
    setTimeEntries((data as any[]) || []);
  };

  const runBillingAgent = async (action: string) => {
    setAiAction(action);
    setAiOutput("");
    setAiLoading(true);
    setActiveTab("ai");

    const body: any = { action };
    if (action === "generate_invoice") {
      body.matter_id = matters[0]?.id;
      body.time_entries = timeEntries.filter((t) => t.billable);
      body.client_name = matters[0]?.client_name;
    } else if (action === "payment_reminder") {
      body.client_name = payments.find((p) => p.status === "pending" || p.status === "overdue")?.client_name;
      body.payments = payments.filter((p) => p.status === "pending" || p.status === "overdue");
    } else if (action === "consultation_receipt") {
      body.client_name = "Alex Johnson";
      body.payments = [{ amount: 250 }];
    }

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/billing-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast({ title: "Rate limited", variant: "destructive" });
        else toast({ title: "Error", description: "Billing agent failed.", variant: "destructive" });
        setAiLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              content += delta;
              setAiOutput(content);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to connect to billing agent.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const totalCollected = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);
  const totalOverdue = payments.filter((p) => p.status === "overdue").reduce((s, p) => s + Number(p.amount), 0);
  const totalHours = timeEntries.reduce((s, t) => s + Number(t.hours), 0);
  const avgRate = timeEntries.length > 0 ? timeEntries.reduce((s, t) => s + Number(t.rate), 0) / timeEntries.length : 350;
  const projectedMonthly = totalHours * avgRate;

  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName="Sarah Chen" userRole="Attorney">
      <SectionHeader title="Billing & Payments" subtitle="Track revenue, time, and AI-generated invoices" />

      {/* MVP banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-3 rounded-xl bg-accent/5 border border-accent/20 flex items-center gap-3"
      >
        <Sparkles className="h-4 w-4 text-accent shrink-0" />
        <span className="text-xs text-muted-foreground">
          <strong className="text-foreground">Free MVP Mode</strong> — All platform fees waived. Track billable hours and generate invoices for your records.
        </span>
        <span className="text-[10px] font-bold bg-accent/10 text-accent px-3 py-1 rounded-full shrink-0">FREE BETA</span>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<DollarSign className="h-5 w-5 text-accent" />} label="Collected" value={`$${totalCollected.toLocaleString()}`} change="This month" changeType="positive" />
        <StatCard icon={<Clock className="h-5 w-5 text-accent" />} label="Pending" value={`$${totalPending.toLocaleString()}`} change={`${payments.filter(p => p.status === "pending").length} invoices`} changeType="neutral" />
        <StatCard icon={<AlertTriangle className="h-5 w-5 text-destructive" />} label="Overdue" value={`$${totalOverdue.toLocaleString()}`} changeType="negative" change={`${payments.filter(p => p.status === "overdue").length} invoices`} />
        <StatCard icon={<Timer className="h-5 w-5 text-accent" />} label="Hours Tracked" value={totalHours.toFixed(1)} change="This period" />
      </div>

      {/* AI Billing Quick Actions */}
      <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-accent/5 border border-accent/15">
        <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
          <Bot className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-foreground">Billing Agent</div>
          <div className="text-xs text-muted-foreground">Generate invoices, payment reminders, and receipts with AI</div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => runBillingAgent("generate_invoice")} disabled={aiLoading}>
            <FileText className="mr-1.5 h-3.5 w-3.5" /> Invoice
          </Button>
          <Button variant="outline" size="sm" onClick={() => runBillingAgent("payment_reminder")} disabled={aiLoading}>
            <Send className="mr-1.5 h-3.5 w-3.5" /> Reminder
          </Button>
          <Button variant="outline" size="sm" onClick={() => runBillingAgent("consultation_receipt")} disabled={aiLoading}>
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Receipt
          </Button>
        </div>
      </div>

      {/* Timer */}
      <div className="rounded-xl bg-card border shadow-card p-5 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-3xl font-mono font-bold text-foreground tabular-nums">{formatTimer(timerSeconds)}</div>
          <div className="flex gap-2">
            <Button variant={timerRunning ? "outline" : "gold"} size="sm" onClick={() => setTimerRunning(!timerRunning)}>
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
            <select value={timerMatter} onChange={(e) => setTimerMatter(e.target.value)} className="rounded-lg border bg-background px-3 py-1.5 text-sm flex-1">
              <option value="">Select matter...</option>
              {matters.map((m: any) => <option key={m.id} value={m.id}>{m.title} ({m.client_name})</option>)}
            </select>
            <input value={timerDesc} onChange={(e) => setTimerDesc(e.target.value)} placeholder="Description..." className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm outline-none" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(["payments", "time", "projections", "ai"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab ? "bg-accent text-accent-foreground" : "bg-card border text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab === "payments" ? "Payments & Invoices" : tab === "time" ? "Time Entries" : tab === "projections" ? <><TrendingUp className="h-3.5 w-3.5" /> Projected Earnings</> : <><Bot className="h-3.5 w-3.5" /> AI Output</>}
          </button>
        ))}
      </div>

      {activeTab === "projections" ? (
        <div className="space-y-6">
          {/* Projected earnings cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-card border shadow-card p-5">
              <div className="text-xs text-muted-foreground mb-1">Monthly Projection</div>
              <div className="text-2xl font-bold text-foreground">${projectedMonthly.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">{totalHours.toFixed(1)}h × ${avgRate.toFixed(0)}/hr avg</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl bg-card border shadow-card p-5">
              <div className="text-xs text-muted-foreground mb-1">Annual Projection</div>
              <div className="text-2xl font-bold text-foreground">${(projectedMonthly * 12).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">Based on current billing rate</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl bg-card border shadow-card p-5">
              <div className="text-xs text-muted-foreground mb-1">Active Matters</div>
              <div className="text-2xl font-bold text-foreground">{matters.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Avg ${matters.length > 0 ? Math.round(projectedMonthly / matters.length).toLocaleString() : 0}/matter</div>
            </motion.div>
          </div>

          {/* Revenue breakdown by matter */}
          <div className="rounded-xl bg-card border shadow-card overflow-hidden">
            <div className="p-5 border-b">
              <h3 className="font-semibold text-foreground">Revenue by Matter</h3>
            </div>
            <div className="p-5 space-y-4">
              {matters.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No matters yet</p>
              ) : (
                matters.map((m: any) => {
                  const matterEntries = timeEntries.filter((t) => t.matter_id === m.id);
                  const matterHours = matterEntries.reduce((s, t) => s + Number(t.hours), 0);
                  const matterRevenue = matterEntries.reduce((s, t) => s + Number(t.hours) * Number(t.rate), 0);
                  return (
                    <div key={m.id} className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{m.title}</div>
                        <div className="text-xs text-muted-foreground">{m.client_name} · {matterHours.toFixed(1)}h tracked</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-foreground">${matterRevenue.toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground">+ ${Number(m.total_billed).toLocaleString()} billed</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Platform fee notice */}
          <div className="p-4 rounded-xl bg-success/5 border border-success/20 flex items-center gap-3">
            <Lock className="h-5 w-5 text-success shrink-0" />
            <div>
              <div className="text-sm font-medium text-foreground">No Platform Fees (MVP)</div>
              <div className="text-xs text-muted-foreground">When payments go live, the Professional plan waives lead fees and reduces commission to 5%.</div>
            </div>
          </div>
        </div>
      ) : activeTab === "ai" ? (
        <div className="rounded-xl bg-card border shadow-card p-6">
          {aiOutput ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Bot className="h-3 w-3" /> AI Generated
                </span>
                <span className="text-xs text-muted-foreground capitalize">{aiAction?.replace(/_/g, " ")}</span>
              </div>
              <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-warning/5 border border-warning/20 text-xs text-warning">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>AI-generated document — review all amounts and details before sending to clients.</span>
              </div>
              <div className="prose prose-sm max-w-none text-foreground">
                <ReactMarkdown>{aiOutput}</ReactMarkdown>
              </div>
              {aiLoading && (
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 bg-accent rounded-full animate-pulse" />
                  Generating...
                </div>
              )}
              <div ref={aiEndRef} />
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Click an AI action above to generate an invoice, reminder, or receipt</p>
            </div>
          )}
        </div>
      ) : activeTab === "payments" ? (
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
              {payments.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">No payments recorded yet</td></tr>
              ) : (
                payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-foreground">{p.client_name}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground hidden md:table-cell">{p.description}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-foreground">${Number(p.amount).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} variant={p.status === "paid" ? "success" : p.status === "pending" ? "warning" : "destructive"} />
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground hidden lg:table-cell">
                      {p.due_date ? new Date(p.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                    </td>
                  </tr>
                ))
              )}
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
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">No time entries yet. Start the timer above.</td></tr>
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
