import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { StatCard, SectionHeader, StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, DollarSign, CalendarDays, ArrowRight, TrendingUp, Clock, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const recentLeads = [
  { name: "Alex Johnson", issue: "Wrongful Termination", score: 95, time: "10 min ago", status: "Hot" },
  { name: "Maria Garcia", issue: "Business Formation", score: 82, time: "1 hour ago", status: "Warm" },
  { name: "David Kim", issue: "Contract Dispute", score: 70, time: "3 hours ago", status: "New" },
];

const todaySchedule = [
  { time: "10:00 AM", client: "Alex Johnson", type: "Video Consultation", duration: "30 min" },
  { time: "1:00 PM", client: "Robert Lee", type: "Case Review", duration: "45 min" },
  { time: "3:30 PM", client: "Maria Garcia", type: "Initial Consultation", duration: "30 min" },
];

export default function LawyerDashboard() {
  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName="Sarah Chen" userRole="Attorney">
      <SectionHeader
        title="Good morning, Sarah"
        subtitle="Here's your practice overview for today"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <StatCard icon={<Users className="h-5 w-5 text-accent" />} label="New Leads" value={5} change="+3 today" changeType="positive" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatCard icon={<Briefcase className="h-5 w-5 text-accent" />} label="Active Cases" value={12} change="+2 this week" changeType="positive" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard icon={<DollarSign className="h-5 w-5 text-accent" />} label="Revenue MTD" value="$14,250" change="+18%" changeType="positive" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatCard icon={<CalendarDays className="h-5 w-5 text-accent" />} label="Today's Meetings" value={3} />
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lead Pipeline */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-card border shadow-card">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold text-foreground">Lead Pipeline</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/lawyer/leads">View All <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <div className="divide-y">
              {recentLeads.map((lead) => (
                <div key={lead.name} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 text-accent font-semibold text-sm">
                    {lead.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{lead.name}</span>
                      <StatusBadge
                        status={`${lead.score}% match`}
                        variant={lead.score >= 90 ? "success" : lead.score >= 80 ? "warning" : "info"}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{lead.issue} · {lead.time}</div>
                  </div>
                  <Button variant="outline" size="sm">Review</Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div>
          <div className="rounded-xl bg-card border shadow-card">
            <div className="p-5 border-b">
              <h2 className="font-semibold text-foreground">Today's Schedule</h2>
            </div>
            <div className="p-4 space-y-3">
              {todaySchedule.map((event, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-accent">{event.time}</span>
                    <span className="text-[10px] text-muted-foreground">{event.duration}</span>
                  </div>
                  <div className="font-medium text-sm text-foreground mt-1">{event.client}</div>
                  <div className="text-xs text-muted-foreground">{event.type}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Productivity */}
          <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center">
                <Bot className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground">AI Productivity Agent</div>
                <div className="text-xs text-muted-foreground">Draft documents & responses</div>
              </div>
            </div>
            <Button variant="gold" size="sm" className="w-full" asChild>
              <Link to="/lawyer/documents"><Bot className="mr-2 h-3.5 w-3.5" /> AI Document Studio</Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
