import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { SectionHeader, StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, ThumbsUp, ThumbsDown, Clock, Filter } from "lucide-react";

const leads = [
  { name: "Alex Johnson", email: "alex@email.com", issue: "Wrongful Termination", score: 95, status: "Hot", time: "10 min ago", budget: "$5,000 - $10,000", urgency: "Urgent", source: "AI Intake" },
  { name: "Maria Garcia", email: "maria@email.com", issue: "Business Formation (LLC)", score: 82, status: "Warm", time: "1 hour ago", budget: "$1,000 - $5,000", urgency: "Standard", source: "Referral" },
  { name: "David Kim", email: "david@email.com", issue: "Commercial Contract Dispute", score: 70, status: "New", time: "3 hours ago", budget: "$5,000 - $10,000", urgency: "Standard", source: "AI Intake" },
  { name: "Jennifer Lee", email: "jen@email.com", issue: "Employment Discrimination", score: 88, status: "Warm", time: "5 hours ago", budget: "$10,000+", urgency: "Urgent", source: "Website" },
  { name: "Tom Wilson", email: "tom@email.com", issue: "Non-Compete Agreement", score: 45, status: "Cold", time: "1 day ago", budget: "Under $1,000", urgency: "Low", source: "AI Intake" },
];

const stages = ["All", "Hot", "Warm", "New", "Cold"];

export default function LawyerLeads() {
  const [activeStage, setActiveStage] = useState("All");
  const filtered = activeStage === "All" ? leads : leads.filter(l => l.status === activeStage);

  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName="Sarah Chen" userRole="Attorney">
      <SectionHeader title="Lead Management" subtitle="AI-qualified leads waiting for your review" />

      {/* Pipeline stages */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {stages.map((s) => (
          <button
            key={s}
            onClick={() => setActiveStage(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeStage === s ? "bg-accent text-accent-foreground" : "bg-card border text-muted-foreground hover:bg-muted"
            }`}
          >
            {s} {s !== "All" && <span className="ml-1 text-xs opacity-70">({leads.filter(l => s === "All" || l.status === s).length})</span>}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((lead) => (
          <div key={lead.name} className="rounded-xl bg-card border shadow-card p-5 hover:shadow-card-hover transition-all duration-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0 text-accent font-semibold">
                  {lead.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{lead.name}</h3>
                    <StatusBadge
                      status={lead.status}
                      variant={lead.status === "Hot" ? "destructive" : lead.status === "Warm" ? "warning" : lead.status === "New" ? "info" : "default"}
                    />
                    <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">{lead.score}% qualified</span>
                  </div>
                  <div className="text-sm text-foreground mt-1">{lead.issue}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lead.time}</span>
                    <span>Budget: {lead.budget}</span>
                    <span>Urgency: {lead.urgency}</span>
                    <span>Source: {lead.source}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="icon" className="h-9 w-9"><Phone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9"><Mail className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9"><MessageSquare className="h-4 w-4" /></Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button variant="gold" size="sm">Accept</Button>
                <Button variant="outline" size="sm">Decline</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
