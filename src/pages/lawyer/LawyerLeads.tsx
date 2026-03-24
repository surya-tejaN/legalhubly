import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { SectionHeader, StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import {
  Phone, Mail, MessageSquare, Clock, Filter, ChevronDown,
  AlertTriangle, Shield, FileText, Briefcase, Bot, ArrowRight,
  CheckCircle2, X, Zap, MapPin, DollarSign, Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const stages = ["All", "hot", "warm", "new", "cold"];
const stageLabels: Record<string, string> = { All: "All", hot: "🔥 Hot", warm: "☀️ Warm", new: "🆕 New", cold: "❄️ Cold" };

export default function LawyerLeads() {
  const { profile } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("leads" as any).select("*").order("created_at", { ascending: false });
      setLeads((data as any[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = activeStage === "All" ? leads : leads.filter((l) => l.status === activeStage);
  const stageCounts = stages.reduce((acc, s) => {
    acc[s] = s === "All" ? leads.length : leads.filter((l) => l.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const updateLeadStatus = async (id: string, status: string) => {
    await supabase.from("leads" as any).update({ status } as any).eq("id", id);
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
  };

  const updateConflict = async (id: string, conflictStatus: string) => {
    await supabase.from("leads" as any).update({ conflict_status: conflictStatus } as any).eq("id", id);
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, conflict_status: conflictStatus } : l));
  };

  const getLeadVariant = (s: string) =>
    s === "hot" ? "destructive" : s === "warm" ? "warning" : s === "new" ? "info" : "default";

  const timeSince = (d: string) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName="Sarah Chen" userRole="Attorney">
      <SectionHeader
        title="Lead Management"
        subtitle="AI-qualified leads waiting for your review"
        action={
          <div className="flex items-center gap-2">
            {leads.some((l) => l.conflict_status === "pending") && (
              <span className="text-xs font-bold bg-warning/10 text-warning px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                {leads.filter((l) => l.conflict_status === "pending").length} conflict checks pending
              </span>
            )}
          </div>
        }
      />

      {/* Pipeline stages */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {stages.map((s) => (
          <button
            key={s}
            onClick={() => setActiveStage(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeStage === s ? "bg-accent text-accent-foreground" : "bg-card border text-muted-foreground hover:bg-muted"
            }`}
          >
            {stageLabels[s]}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeStage === s ? "bg-accent-foreground/20" : "bg-muted"
            }`}>
              {stageCounts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Leads */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-card border shadow-card p-5 animate-pulse">
              <div className="flex gap-4"><div className="h-12 w-12 rounded-full bg-muted" /><div className="flex-1 space-y-2"><div className="h-4 w-48 bg-muted rounded" /><div className="h-3 w-64 bg-muted rounded" /></div></div>
            </div>
          ))
        ) : (
          filtered.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="rounded-xl bg-card border shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0 text-accent font-semibold">
                      {lead.client_name.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{lead.client_name}</h3>
                        <StatusBadge status={lead.status} variant={getLeadVariant(lead.status)} />
                        <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Zap className="h-3 w-3" /> {lead.lead_score}% qualified
                        </span>
                        {lead.conflict_status === "pending" && (
                          <span className="text-[10px] font-bold bg-warning/10 text-warning px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Conflict Check
                          </span>
                        )}
                        {lead.conflict_status === "cleared" && (
                          <span className="text-[10px] font-bold bg-success/10 text-success px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Shield className="h-3 w-3" /> Cleared
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-foreground mt-1">{lead.issue}</div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeSince(lead.created_at)}</span>
                        {lead.budget_range && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {lead.budget_range}</span>}
                        <span className="flex items-center gap-1">Urgency: <span className={lead.urgency === "emergency" || lead.urgency === "urgent" ? "text-destructive font-medium" : ""}>{lead.urgency}</span></span>
                        <span>Source: {lead.source}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" className="h-9 w-9" asChild><a href={`tel:${lead.client_email || ''}`}><Phone className="h-4 w-4" /></a></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" asChild><a href={`mailto:${lead.client_email || ''}`}><Mail className="h-4 w-4" /></a></Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    {lead.conflict_status === "pending" ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => updateConflict(lead.id, "cleared")}>
                          <Shield className="mr-1.5 h-3.5 w-3.5" /> Clear
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => updateConflict(lead.id, "flagged")} className="text-destructive">
                          Flag
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="gold" size="sm" onClick={() => updateLeadStatus(lead.id, "accepted")}>
                          <Briefcase className="mr-1.5 h-3.5 w-3.5" /> Accept
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => updateLeadStatus(lead.id, "declined")}>Decline</Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Summary expandable */}
              {lead.ai_summary && (
                <>
                  <button
                    onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                    className="w-full py-2 border-t text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Bot className="h-3 w-3 text-accent" />
                    {expandedId === lead.id ? "Hide AI Summary" : "View AI Intake Summary"}
                    <ChevronDown className={`h-3 w-3 transition-transform ${expandedId === lead.id ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {expandedId === lead.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-2">
                          <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
                            <div className="flex items-center gap-2 mb-2">
                              <Bot className="h-4 w-4 text-accent" />
                              <span className="text-xs font-semibold text-accent">AI-Generated Summary</span>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">{lead.ai_summary}</p>
                            <div className="flex gap-2 mt-3">
                              <Button variant="outline" size="sm"><FileText className="mr-1.5 h-3.5 w-3.5" /> Full Intake</Button>
                              <Button variant="outline" size="sm"><Briefcase className="mr-1.5 h-3.5 w-3.5" /> Create Matter</Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
