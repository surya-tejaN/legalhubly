import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { StatCard, SectionHeader, StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users, Briefcase, DollarSign, CalendarDays, ArrowRight, TrendingUp,
  Clock, Bot, CheckCircle2, AlertTriangle, Timer, FileText, Plus,
  Zap, Bell, ChevronRight, RefreshCw, Star, MessageSquare, User,
  Settings, Edit, Mail, MapPin, BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const anim = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

export default function LawyerDashboard() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] || "Counselor";

  const [leads, setLeads] = useState<any[]>([]);
  const [matters, setMatters] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [leadsRes, mattersRes, consultsRes, paymentsRes, reviewsRes] = await Promise.all([
        supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("matters").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("consultations").select("*").gte("scheduled_at", new Date().toISOString().split("T")[0]).order("scheduled_at").limit(4),
        supabase.from("payments").select("*"),
        supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      setLeads((leadsRes.data as any[]) || []);
      setMatters((mattersRes.data as any[]) || []);
      setConsultations((consultsRes.data as any[]) || []);
      setPayments((paymentsRes.data as any[]) || []);
      setReviews((reviewsRes.data as any[]) || []);
    };
    load();
  }, []);

  const hotLeads = leads.filter((l) => l.status === "hot").length;
  const activeMatters = matters.filter((m) => m.status === "active" || m.status === "discovery").length;
  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1) : "—";

  const getLeadVariant = (s: string) => s === "hot" ? "destructive" : s === "warm" ? "warning" : s === "new" ? "info" : "default";

  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName={profile?.full_name || "Attorney"} userRole="Attorney">
      {/* Welcome */}
      <motion.div {...anim(0)} className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-foreground">Good morning, {firstName}</h1>
            <p className="text-muted-foreground mt-1">Here's your practice overview for today.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/lawyer/leads"><Bell className="mr-2 h-3.5 w-3.5" /> {hotLeads} urgent leads</Link>
            </Button>
            <Button variant="gold" size="sm" asChild>
              <Link to="/lawyer/cases"><Plus className="mr-2 h-3.5 w-3.5" /> New Matter</Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <Users className="h-5 w-5 text-accent" />, label: "Incoming Requests", value: leads.length, change: `${hotLeads} hot`, changeType: "positive" as const },
          { icon: <Briefcase className="h-5 w-5 text-accent" />, label: "Active Matters", value: activeMatters },
          { icon: <DollarSign className="h-5 w-5 text-accent" />, label: "Revenue MTD", value: `$${totalRevenue.toLocaleString()}`, changeType: "positive" as const },
          { icon: <Star className="h-5 w-5 text-accent" />, label: "Avg Rating", value: avgRating, change: `${reviews.length} reviews`, changeType: "positive" as const },
        ].map((stat, i) => (
          <motion.div key={stat.label} {...anim(i * 0.05)}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incoming Client Requests (Leads) */}
          <motion.div {...anim(0.1)}>
            <div className="rounded-xl bg-card border shadow-card">
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" /> Incoming Client Requests
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/lawyer/leads">View All <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
              {leads.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No incoming requests yet.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {leads.slice(0, 4).map((lead) => (
                    <div key={lead.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 text-accent font-semibold text-sm">
                        {lead.client_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-foreground">{lead.client_name}</span>
                          <StatusBadge status={lead.status} variant={getLeadVariant(lead.status)} />
                          <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">{lead.lead_score}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">{lead.issue}</div>
                        {lead.ai_summary && (
                          <div className="text-xs text-muted-foreground/70 mt-0.5 truncate italic">AI: {lead.ai_summary}</div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/lawyer/leads">Respond</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Consultation Bookings */}
          <motion.div {...anim(0.15)}>
            <div className="rounded-xl bg-card border shadow-card">
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-accent" /> Consultation Bookings
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/lawyer/calendar">Full Calendar <ChevronRight className="ml-1 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
              {consultations.length === 0 ? (
                <div className="p-8 text-center">
                  <CalendarDays className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No upcoming consultations.</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {consultations.slice(0, 4).map((c: any) => (
                    <div key={c.id} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-accent">
                          {new Date(c.scheduled_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          c.status === "confirmed" ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "bg-accent/10 text-accent"
                        }`}>{c.status}</span>
                      </div>
                      <div className="font-medium text-sm text-foreground mt-1">{c.client_name}</div>
                      <div className="text-xs text-muted-foreground">{c.title} · {c.type} · {c.duration_minutes}min</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Messages / Responses */}
          <motion.div {...anim(0.2)}>
            <div className="rounded-xl bg-card border shadow-card">
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-accent" /> Response Messages
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/lawyer/messages">Open Inbox <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
              <div className="p-8 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Client messages and your responses will appear here.</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link to="/lawyer/messages">Go to Messages</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Profile Card */}
          <motion.div {...anim(0.05)}>
            <div className="rounded-xl bg-card border shadow-card">
              <div className="p-5 border-b">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-accent" /> Your Profile
                </h2>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {profile?.profile_photo ? (
                      <img src={profile.profile_photo} className="h-14 w-14 rounded-full object-cover" alt="" />
                    ) : (
                      <User className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground">{profile?.full_name || "Your Name"}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {profile?.email || "Not set"}
                    </div>
                    {profile?.city && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {profile.city}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Star className="h-4 w-4 text-accent fill-accent" />
                  <span className="font-semibold text-foreground">{avgRating}</span>
                  <span>({reviews.length} reviews)</span>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/lawyer/settings"><Edit className="mr-2 h-3.5 w-3.5" /> Edit Profile</Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Reviews */}
          <motion.div {...anim(0.1)}>
            <div className="rounded-xl bg-card border shadow-card">
              <div className="p-5 border-b">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent" /> Recent Reviews
                </h2>
              </div>
              {reviews.length === 0 ? (
                <div className="p-6 text-center">
                  <Star className="h-7 w-7 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No reviews yet.</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {reviews.slice(0, 3).map((r: any) => (
                    <div key={r.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{r.reviewer_name}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < Number(r.rating) ? "text-accent fill-accent" : "text-muted-foreground/20"}`}
                            />
                          ))}
                        </div>
                      </div>
                      {r.review_text && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{r.review_text}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Analytics Quick View */}
          <motion.div {...anim(0.15)}>
            <div className="rounded-xl bg-card border shadow-card p-5">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <BarChart3 className="h-4 w-4 text-accent" /> Analytics
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Revenue collected</span>
                  <span className="text-sm font-semibold text-[hsl(var(--success))]">${totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending payments</span>
                  <span className="text-sm font-semibold text-accent">${payments.filter(p => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active matters</span>
                  <span className="text-sm font-semibold text-foreground">{activeMatters}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Lead conversion</span>
                  <span className="text-sm font-semibold text-foreground">
                    {leads.length > 0 ? `${Math.round((leads.filter(l => l.status === "converted").length / leads.length) * 100)}%` : "—"}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <Link to="/lawyer/analytics"><BarChart3 className="mr-2 h-3.5 w-3.5" /> Full Analytics</Link>
              </Button>
            </div>
          </motion.div>

          {/* AI Assistant */}
          <motion.div {...anim(0.2)}>
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">AI Legal Assistant</div>
                  <div className="text-xs text-muted-foreground">Research, draft & analyze</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="gold" size="sm" className="flex-1" asChild>
                  <Link to="/lawyer/documents"><Bot className="mr-2 h-3.5 w-3.5" /> AI Studio</Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link to="/lawyer/messages"><Zap className="mr-2 h-3.5 w-3.5" /> Ask AI</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
