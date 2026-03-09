import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminNavItems } from "@/lib/navigation";
import { StatCard, SectionHeader, StatusBadge } from "@/components/DashboardComponents";
import { Users, Building2, Shield, TrendingUp, BarChart3, AlertTriangle, CheckCircle2, Bot, DollarSign, Calendar, Briefcase, Target } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const recentUsers = [
  { name: "Alex Johnson", email: "alex@email.com", role: "Client", joined: "Mar 8, 2026", status: "Active" },
  { name: "Sarah Chen", email: "sarah@chen.law", role: "Lawyer", joined: "Mar 7, 2026", status: "Active" },
  { name: "Maria Garcia", email: "maria@email.com", role: "Client", joined: "Mar 7, 2026", status: "Active" },
  { name: "James Miller", email: "james@ipshield.law", role: "Lawyer", joined: "Mar 6, 2026", status: "Pending" },
  { name: "Park Legal Group", email: "admin@parklegal.com", role: "Firm", joined: "Mar 5, 2026", status: "Active" },
];

const aiAgentStats = [
  { name: "Legal Intake Agent", actions: 12400, successRate: "96%", status: "Operational" },
  { name: "Case Summary Agent", actions: 8200, successRate: "94%", status: "Operational" },
  { name: "Document Drafting Agent", actions: 5600, successRate: "92%", status: "Operational" },
  { name: "Client Support Agent", actions: 10200, successRate: "89%", status: "Degraded" },
  { name: "Lead Qualification Agent", actions: 6800, successRate: "97%", status: "Operational" },
  { name: "Billing Agent", actions: 2000, successRate: "91%", status: "Operational" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ leads: 0, consultations: 0, matters: 0, payments: 0, potentialRevenue: 0, conversionRate: 0 });

  useEffect(() => {
    const load = async () => {
      const [leads, consults, matters, payments] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("consultations").select("id", { count: "exact", head: true }),
        supabase.from("matters").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("amount, status"),
      ]);
      const paymentData = (payments.data as any[]) || [];
      const totalPotential = paymentData.reduce((s, p) => s + Number(p.amount), 0);
      const leadCount = leads.count || 0;
      const matterCount = matters.count || 0;
      const conversion = leadCount > 0 ? Math.round((matterCount / leadCount) * 100) : 0;

      setStats({
        leads: leadCount,
        consultations: consults.count || 0,
        matters: matterCount,
        payments: paymentData.filter((p) => p.status === "paid").length,
        potentialRevenue: totalPotential,
        conversionRate: conversion,
      });
    };
    load();
  }, []);

  return (
    <DashboardLayout sidebarItems={adminNavItems} portalLabel="Platform Admin" userName="Platform Admin" userRole="Super Admin">
      <SectionHeader title="Admin Control Center" subtitle="LegalBridge platform operations & revenue analytics" />

      {/* MVP Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-3 rounded-xl bg-accent/5 border border-accent/20 flex items-center gap-3"
      >
        <span className="text-[10px] font-bold bg-accent/10 text-accent px-3 py-1 rounded-full">MVP MODE</span>
        <span className="text-xs text-muted-foreground">All services are free. Revenue figures show projected earnings when payments are enabled.</span>
      </motion.div>

      {/* Top-level stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, label: "Total Leads", value: stats.leads.toString(), change: "All time", changeType: "neutral" as const },
          { icon: Calendar, label: "Consultations", value: stats.consultations.toString(), change: "Booked", changeType: "positive" as const },
          { icon: Briefcase, label: "Active Matters", value: stats.matters.toString(), change: "In progress", changeType: "positive" as const },
          { icon: Target, label: "Conversion Rate", value: `${stats.conversionRate}%`, change: "Lead → Matter", changeType: stats.conversionRate > 30 ? "positive" as const : "neutral" as const },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <StatCard icon={<s.icon className="h-5 w-5 text-accent" />} label={s.label} value={s.value} change={s.change} changeType={s.changeType} />
          </motion.div>
        ))}
      </div>

      {/* Revenue analytics */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-card border shadow-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-accent" />
            <h3 className="font-semibold text-sm text-foreground">Potential Revenue</h3>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">${stats.potentialRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">From recorded payments & invoices</p>
          <div className="mt-3 p-2 rounded-lg bg-warning/5 border border-warning/15 text-[10px] text-warning font-medium">
            💡 Projected — payments not yet collected in MVP
          </div>
        </div>

        <div className="rounded-xl bg-card border shadow-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-accent" />
            <h3 className="font-semibold text-sm text-foreground">Revenue Projections</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: "Lead fees", value: `$${(stats.leads * 25).toLocaleString()}`, desc: `${stats.leads} leads × $25` },
              { label: "Subscriptions", value: `$${(3 * 149).toLocaleString()}`, desc: "Est. 3 Pro tier" },
              { label: "Consultation fees", value: `$${(stats.consultations * 35).toLocaleString()}`, desc: `${stats.consultations} bookings × $35` },
              { label: "Commissions (10%)", value: `$${Math.round(stats.potentialRevenue * 0.1).toLocaleString()}`, desc: "On paid consultations" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-foreground font-medium">{r.label}</span>
                  <span className="text-muted-foreground ml-1">· {r.desc}</span>
                </div>
                <span className="font-semibold text-foreground">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-card border shadow-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-accent" />
            <h3 className="font-semibold text-sm text-foreground">Funnel Metrics</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Leads Generated", value: stats.leads, bar: 100 },
              { label: "Consultations Booked", value: stats.consultations, bar: stats.leads > 0 ? (stats.consultations / stats.leads) * 100 : 0 },
              { label: "Matters Opened", value: stats.matters, bar: stats.leads > 0 ? (stats.matters / stats.leads) * 100 : 0 },
              { label: "Payments Made", value: stats.payments, bar: stats.leads > 0 ? (stats.payments / stats.leads) * 100 : 0 },
            ].map((f) => (
              <div key={f.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-medium text-foreground">{f.value}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(f.bar, 2)}%` }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="h-full bg-accent rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Users */}
        <div className="lg:col-span-2 rounded-xl bg-card border shadow-card overflow-hidden">
          <div className="p-5 border-b"><h2 className="font-semibold text-foreground">Recent Users</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Joined</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentUsers.map((u) => (
                  <tr key={u.email} className="hover:bg-muted/20">
                    <td className="px-5 py-3">
                      <div className="text-sm font-medium text-foreground">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        u.role === "Lawyer" ? "bg-accent/10 text-accent" :
                        u.role === "Firm" ? "bg-info/10 text-info" : "bg-muted text-muted-foreground"
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground hidden sm:table-cell">{u.joined}</td>
                    <td className="px-5 py-3"><StatusBadge status={u.status} variant={u.status === "Active" ? "success" : "warning"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Agents Status */}
        <div className="rounded-xl bg-card border shadow-card">
          <div className="p-5 border-b">
            <h2 className="font-semibold text-foreground">AI Agent Status</h2>
          </div>
          <div className="p-4 space-y-3">
            {aiAgentStats.map((agent) => (
              <div key={agent.name} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{agent.name}</span>
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    agent.status === "Operational" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  }`}>
                    {agent.status === "Operational" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {agent.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{agent.actions.toLocaleString()} actions</span>
                  <span>{agent.successRate} success</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
