import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { SectionHeader, StatCard } from "@/components/DashboardComponents";
import { DollarSign, Users, Briefcase, TrendingUp, Clock, Star } from "lucide-react";

const monthlyData = [
  { month: "Oct", revenue: 8400, cases: 6 },
  { month: "Nov", revenue: 11200, cases: 9 },
  { month: "Dec", revenue: 9800, cases: 7 },
  { month: "Jan", revenue: 12500, cases: 10 },
  { month: "Feb", revenue: 13100, cases: 11 },
  { month: "Mar", revenue: 14250, cases: 12 },
];

const caseTypeBreakdown = [
  { type: "Employment Law", count: 5, percentage: 42 },
  { type: "Business Law", count: 3, percentage: 25 },
  { type: "Real Estate", count: 2, percentage: 17 },
  { type: "IP Law", count: 2, percentage: 16 },
];

const topMetrics = [
  { label: "Avg. Case Duration", value: "23 days", icon: Clock },
  { label: "Client Satisfaction", value: "4.9/5", icon: Star },
  { label: "Lead Conversion", value: "72%", icon: TrendingUp },
  { label: "Active Clients", value: "18", icon: Users },
];

export default function LawyerAnalytics() {
  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName="Sarah Chen" userRole="Attorney">
      <SectionHeader title="Analytics" subtitle="Track your practice performance" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<DollarSign className="h-5 w-5 text-accent" />} label="Revenue MTD" value="$14,250" change="+18%" changeType="positive" />
        <StatCard icon={<Briefcase className="h-5 w-5 text-accent" />} label="Cases Closed" value={8} change="+3 vs last month" changeType="positive" />
        <StatCard icon={<Users className="h-5 w-5 text-accent" />} label="New Clients" value={6} change="+2" changeType="positive" />
        <StatCard icon={<TrendingUp className="h-5 w-5 text-accent" />} label="Conversion Rate" value="72%" change="+5%" changeType="positive" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl bg-card border shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-6">Revenue Trend (6 Months)</h3>
          <div className="flex items-end gap-3 h-48">
            {monthlyData.map((d) => (
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
          <h3 className="font-semibold text-foreground mb-4">Case Type Breakdown</h3>
          <div className="space-y-4">
            {caseTypeBreakdown.map((ct) => (
              <div key={ct.type}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-foreground">{ct.type}</span>
                  <span className="text-muted-foreground">{ct.count} cases</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${ct.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {topMetrics.map((m) => (
          <div key={m.label} className="rounded-xl bg-card border shadow-card p-5 text-center">
            <m.icon className="h-6 w-6 text-accent mx-auto mb-2" />
            <div className="text-xl font-semibold text-foreground">{m.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
