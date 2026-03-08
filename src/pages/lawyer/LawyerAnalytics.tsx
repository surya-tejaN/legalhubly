import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { SectionHeader, StatCard } from "@/components/DashboardComponents";
import { DollarSign, Users, Briefcase, TrendingUp, Clock, Star, ArrowUpRight, ArrowDownRight, Target, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function LawyerAnalytics() {
  const [payments, setPayments] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [matters, setMatters] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [p, l, m] = await Promise.all([
        supabase.from("payments" as any).select("*"),
        supabase.from("leads" as any).select("*"),
        supabase.from("matters" as any).select("*"),
      ]);
      setPayments((p.data as any[]) || []);
      setLeads((l.data as any[]) || []);
      setMatters((m.data as any[]) || []);
    };
    load();
  }, []);

  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter((p) => p.status === "pending" || p.status === "overdue").reduce((s, p) => s + Number(p.amount), 0);
  const avgLeadScore = leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.lead_score, 0) / leads.length) : 0;

  const caseTypeBreakdown = matters.reduce((acc, m) => {
    const cat = m.legal_category || "Other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxCases = Math.max(...Object.values(caseTypeBreakdown).map(Number), 1);

  const monthlyRevenue = [
    { month: "Oct", revenue: 8400 },
    { month: "Nov", revenue: 11200 },
    { month: "Dec", revenue: 9800 },
    { month: "Jan", revenue: 12500 },
    { month: "Feb", revenue: 13100 },
    { month: "Mar", revenue: totalRevenue },
  ];
  const maxRevenue = Math.max(...monthlyRevenue.map((d) => d.revenue));

  const conversionRate = leads.length > 0 ? Math.round((matters.length / leads.length) * 100) : 0;

  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName="Sarah Chen" userRole="Attorney">
      <SectionHeader title="Analytics" subtitle="Track your practice performance and growth" />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<DollarSign className="h-5 w-5 text-accent" />} label="Revenue MTD" value={`$${totalRevenue.toLocaleString()}`} change="+18%" changeType="positive" />
        <StatCard icon={<Briefcase className="h-5 w-5 text-accent" />} label="Active Matters" value={matters.filter((m) => m.status === "active" || m.status === "discovery").length} change={`${matters.length} total`} />
        <StatCard icon={<Target className="h-5 w-5 text-accent" />} label="Lead Conversion" value={`${conversionRate}%`} change={`${leads.length} leads`} changeType="positive" />
        <StatCard icon={<Zap className="h-5 w-5 text-accent" />} label="Avg Lead Score" value={avgLeadScore} change="out of 100" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl bg-card border shadow-card p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Revenue Trend</h3>
            <span className="text-xs text-muted-foreground">Last 6 months</span>
          </div>
          <div className="flex items-end gap-3 h-48">
            {monthlyRevenue.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-foreground">${(d.revenue / 1000).toFixed(1)}k</span>
                <div
                  className="w-full bg-accent/20 rounded-t-md relative overflow-hidden"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                >
                  <div className="absolute inset-0 gold-gradient opacity-80 rounded-t-md" />
                </div>
                <span className="text-xs text-muted-foreground">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Case Breakdown */}
        <div className="rounded-xl bg-card border shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Matter Types</h3>
          <div className="space-y-4">
            {Object.entries(caseTypeBreakdown).map(([type, count]) => (
              <div key={type}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-foreground">{type}</span>
                  <span className="text-muted-foreground">{count as number}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((count as number) / maxCases) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: "Avg. Resolution Time", value: "23 days", icon: Clock, trend: "-2d" },
          { label: "Client Satisfaction", value: "4.9/5", icon: Star, trend: "+0.1" },
          { label: "Revenue Collected", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: `$${totalPending.toLocaleString()} pending` },
          { label: "Active Clients", value: `${new Set(matters.map((m) => m.client_name)).size}`, icon: Users, trend: `${leads.filter((l) => l.status === "hot" || l.status === "warm").length} prospects` },
        ].map((m) => (
          <div key={m.label} className="rounded-xl bg-card border shadow-card p-5">
            <m.icon className="h-6 w-6 text-accent mb-3" />
            <div className="text-xl font-semibold text-foreground">{m.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
            <div className="text-[10px] text-accent font-medium mt-2">{m.trend}</div>
          </div>
        ))}
      </div>

      {/* Lead Pipeline Funnel */}
      <div className="mt-6 rounded-xl bg-card border shadow-card p-5">
        <h3 className="font-semibold text-foreground mb-4">Lead Pipeline Conversion</h3>
        <div className="flex items-center gap-2">
          {["new", "warm", "hot", "accepted"].map((stage, i) => {
            const count = stage === "accepted" ? matters.length : leads.filter((l) => l.status === stage).length;
            const maxStage = Math.max(leads.length, 1);
            return (
              <div key={stage} className="flex-1">
                <div className="text-center mb-2">
                  <div className="text-lg font-bold text-foreground">{count}</div>
                  <div className="text-[10px] text-muted-foreground capitalize">{stage}</div>
                </div>
                <div className="h-8 rounded-lg bg-accent/20 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 gold-gradient rounded-lg transition-all"
                    style={{ width: `${(count / maxStage) * 100}%` }}
                  />
                </div>
                {i < 3 && <div className="text-center mt-1"><ArrowUpRight className="h-3 w-3 text-accent mx-auto" /></div>}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
