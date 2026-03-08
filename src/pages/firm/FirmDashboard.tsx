import DashboardLayout from "@/components/DashboardLayout";
import { firmNavItems } from "@/lib/navigation";
import { StatCard, SectionHeader, StatusBadge } from "@/components/DashboardComponents";
import { Building2, Users, DollarSign, Briefcase, TrendingUp, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const teamMembers = [
  { name: "Sarah Chen", role: "Partner", activeCases: 12, revenue: "$14,250", satisfaction: "4.9" },
  { name: "James Miller", role: "Senior Associate", activeCases: 8, revenue: "$9,800", satisfaction: "4.7" },
  { name: "Lisa Wong", role: "Associate", activeCases: 6, revenue: "$7,100", satisfaction: "4.8" },
  { name: "David Kim", role: "Junior Associate", activeCases: 4, revenue: "$3,200", satisfaction: "4.5" },
];

const recentActivity = [
  { action: "New case assigned", detail: "Sarah Chen → Employment Dispute (C-2024-008)", time: "30 min ago" },
  { action: "Case closed", detail: "Lisa Wong closed Business Formation (C-2024-003)", time: "2 hours ago" },
  { action: "Invoice paid", detail: "$4,200 received for C-2024-005", time: "4 hours ago" },
  { action: "New lead", detail: "AI qualified lead for Immigration case", time: "5 hours ago" },
  { action: "Document generated", detail: "AI drafted NDA for C-2024-007", time: "6 hours ago" },
];

export default function FirmDashboard() {
  return (
    <DashboardLayout sidebarItems={firmNavItems} portalLabel="Firm Admin" userName="Managing Partner" userRole="Admin">
      <SectionHeader title="Firm Operations" subtitle="Chen & Associates — Practice overview" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><StatCard icon={<Users className="h-5 w-5 text-accent" />} label="Team Members" value={4} /></motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}><StatCard icon={<Briefcase className="h-5 w-5 text-accent" />} label="Active Cases" value={30} change="+8 this month" changeType="positive" /></motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}><StatCard icon={<DollarSign className="h-5 w-5 text-accent" />} label="Revenue MTD" value="$34,350" change="+22%" changeType="positive" /></motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}><StatCard icon={<TrendingUp className="h-5 w-5 text-accent" />} label="Avg. Satisfaction" value="4.7/5" /></motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Team Performance */}
        <div className="lg:col-span-2 rounded-xl bg-card border shadow-card overflow-hidden">
          <div className="p-5 border-b"><h2 className="font-semibold text-foreground">Team Performance</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Member</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Cases</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Revenue</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {teamMembers.map((m) => (
                  <tr key={m.name} className="hover:bg-muted/20">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                          {m.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="text-sm font-medium text-foreground">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{m.role}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-foreground">{m.activeCases}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-foreground">{m.revenue}</td>
                    <td className="px-5 py-3.5 text-sm text-accent font-medium">⭐ {m.satisfaction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-xl bg-card border shadow-card">
          <div className="p-5 border-b"><h2 className="font-semibold text-foreground">Recent Activity</h2></div>
          <div className="p-4 space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-2 w-2 rounded-full bg-accent mt-2 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-foreground">{a.action}</div>
                  <div className="text-xs text-muted-foreground">{a.detail}</div>
                  <div className="text-[10px] text-muted-foreground/70 mt-0.5">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
