import DashboardLayout from "@/components/DashboardLayout";
import { adminNavItems } from "@/lib/navigation";
import { StatCard, SectionHeader, StatusBadge } from "@/components/DashboardComponents";
import { Users, Building2, Shield, TrendingUp, BarChart3, AlertTriangle, CheckCircle2, Bot } from "lucide-react";
import { motion } from "framer-motion";

const platformStats = [
  { label: "Total Users", value: "12,450", change: "+340 this month", changeType: "positive" as const, icon: Users },
  { label: "Active Firms", value: "285", change: "+12", changeType: "positive" as const, icon: Building2 },
  { label: "Cases This Month", value: "1,847", change: "+18%", changeType: "positive" as const, icon: BarChart3 },
  { label: "AI Agent Actions", value: "45,200", change: "+32%", changeType: "positive" as const, icon: Bot },
];

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
  { name: "Lawyer Productivity Agent", actions: 2000, successRate: "91%", status: "Operational" },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout sidebarItems={adminNavItems} portalLabel="Platform Admin" userName="Platform Admin" userRole="Super Admin">
      <SectionHeader title="Admin Control Center" subtitle="LegalBridge platform operations" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {platformStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <StatCard icon={<s.icon className="h-5 w-5 text-accent" />} label={s.label} value={s.value} change={s.change} changeType={s.changeType} />
          </motion.div>
        ))}
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
