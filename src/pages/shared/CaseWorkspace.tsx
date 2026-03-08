import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems, lawyerNavItems } from "@/lib/navigation";
import { StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import MatterTimeline from "@/components/MatterTimeline";
import TaskChecklist from "@/components/TaskChecklist";
import ClientSupportChat from "@/components/ClientSupportChat";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft, Scale, FileText, MessageSquare, Clock, CheckCircle2,
  Calendar, Bot, CreditCard, StickyNote, Briefcase, Send, Paperclip,
  Download, Eye, Upload, Lock, Shield, Loader2, Sparkles, Plus,
  DollarSign, Timer, User, Star, ChevronDown, BarChart3, Pin,
  Video, Phone, Building2, AlertCircle
} from "lucide-react";

// ── Tab types ──────────────────────────────────────────────
type WorkspaceTab = "overview" | "timeline" | "files" | "messages" | "tasks" | "notes" | "consultations" | "billing" | "ai-recap";

const tabs: { id: WorkspaceTab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <Briefcase className="h-4 w-4" /> },
  { id: "timeline", label: "Timeline", icon: <Clock className="h-4 w-4" /> },
  { id: "files", label: "Files", icon: <FileText className="h-4 w-4" /> },
  { id: "messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "tasks", label: "Tasks", icon: <CheckCircle2 className="h-4 w-4" /> },
  { id: "notes", label: "Notes", icon: <StickyNote className="h-4 w-4" /> },
  { id: "consultations", label: "Consultations", icon: <Calendar className="h-4 w-4" /> },
  { id: "billing", label: "Billing", icon: <CreditCard className="h-4 w-4" /> },
  { id: "ai-recap", label: "AI Recap", icon: <Bot className="h-4 w-4" /> },
];

// ── Mock data ──────────────────────────────────────────────
const matterData = {
  id: "C-2024-001",
  caseNumber: "M-2026-0042",
  title: "Employment Dispute — Wrongful Termination",
  description: "Client was terminated without cause after 4 years. Non-compete clause appears overly broad. Severance offer below contractual obligation.",
  client: "Alex Johnson",
  clientEmail: "alex.johnson@email.com",
  lawyer: "Sarah Chen",
  lawyerInitials: "SC",
  firm: "Chen & Associates",
  status: "Active",
  statusVariant: "success" as const,
  priority: "High",
  legalCategory: "Employment Law",
  progress: 65,
  nextStep: "Review response letter draft",
  totalBilled: 1050,
  created: "Mar 1, 2026",
  updated: "2 hours ago",
  nextDeadline: "Mar 15, 2026",
  tags: ["Wrongful Termination", "Non-Compete", "Severance"],
};

const timelineEvents = [
  { id: "1", title: "AI Intake Completed", description: "Case details collected and classified by AI intake agent", date: "Mar 1, 2026 · 2:14 PM", type: "ai" as const, completed: true },
  { id: "2", title: "Lawyer Matched", description: "Matched with Sarah Chen — 95% fit score, Employment Law specialist with 12 years experience", date: "Mar 2, 2026 · 9:30 AM", type: "milestone" as const, completed: true },
  { id: "3", title: "Engagement Letter Signed", description: "Both parties signed the engagement agreement", date: "Mar 3, 2026 · 11:00 AM", type: "document" as const, completed: true },
  { id: "4", title: "Initial Consultation", description: "30-min video call — discussed case strategy, identified key issues with non-compete and severance", date: "Mar 4, 2026 · 10:00 AM", type: "appointment" as const, completed: true },
  { id: "5", title: "Documents Uploaded", description: "Employment contract, termination letter, and performance reviews submitted to secure vault", date: "Mar 5, 2026 · 3:45 PM", type: "document" as const, completed: true },
  { id: "6", title: "Document Review", description: "Sarah Chen reviewed all uploaded documents and identified key legal issues", date: "Mar 6, 2026 · 5:00 PM", type: "task" as const, completed: true },
  { id: "7", title: "Response Letter Drafting", description: "Formal response challenging non-compete and demanding full severance — in progress", date: "Mar 8, 2026", type: "task" as const, completed: false, current: true },
  { id: "8", title: "Client Review", description: "Alex to review and approve the response letter", date: "Pending", type: "document" as const, completed: false },
  { id: "9", title: "Send to Opposing Party", description: "Deliver formal response to former employer", date: "Upcoming", type: "milestone" as const, completed: false },
  { id: "10", title: "Settlement Negotiation", description: "Begin negotiation for improved severance terms", date: "Upcoming", type: "milestone" as const, completed: false },
];

const sharedFiles = [
  { name: "Employment Contract (2022)", type: "PDF", size: "245 KB", uploaded: "Mar 5, 2026", by: "Alex Johnson", secure: true },
  { name: "Termination Letter", type: "PDF", size: "120 KB", uploaded: "Mar 5, 2026", by: "Alex Johnson", secure: true },
  { name: "Performance Reviews 2023–2025", type: "PDF", size: "890 KB", uploaded: "Mar 5, 2026", by: "Alex Johnson", secure: true },
  { name: "Response Draft v2", type: "DOCX", size: "85 KB", uploaded: "Mar 8, 2026", by: "Sarah Chen", secure: true },
  { name: "Engagement Letter — Signed", type: "PDF", size: "180 KB", uploaded: "Mar 3, 2026", by: "Sarah Chen", secure: true },
  { name: "Pay Stubs Q4 2025", type: "PDF", size: "1.2 MB", uploaded: "Mar 7, 2026", by: "Alex Johnson", secure: true },
];

const chatMessages = [
  { id: 1, sender: "Sarah Chen", isLawyer: true, content: "Hi Alex, I've finished reviewing all the documents you uploaded. There are several strong points in our favor.", time: "Mar 6, 10:30 AM" },
  { id: 2, sender: "Alex Johnson", isLawyer: false, content: "That's great to hear. What did you find?", time: "Mar 6, 10:35 AM" },
  { id: 3, sender: "Sarah Chen", isLawyer: true, content: "Two key issues:\n\n1. **Non-compete clause** — It restricts you from the entire industry for 2 years. California courts almost always find these unenforceable.\n\n2. **Severance shortfall** — Your contract guarantees 3 months severance. They're offering 1 month. This is a clear breach.\n\nI'll draft a formal response challenging both.", time: "Mar 6, 10:42 AM" },
  { id: 4, sender: "Alex Johnson", isLawyer: false, content: "Perfect. What's the timeline for the response?", time: "Mar 6, 10:45 AM" },
  { id: 5, sender: "Sarah Chen", isLawyer: true, content: "I'll have the draft ready for your review by March 10. Once you approve, we'll send it immediately. In the meantime, please don't sign anything from your former employer.", time: "Mar 6, 10:48 AM" },
  { id: 6, sender: "Alex Johnson", isLawyer: false, content: "Understood. I've also uploaded my pay stubs as you requested.", time: "Mar 7, 2:15 PM" },
  { id: 7, sender: "Sarah Chen", isLawyer: true, content: "Perfect, received them. This strengthens our damages calculation significantly. The draft is coming along well — I'll share it tomorrow.", time: "Mar 7, 4:30 PM" },
];

const workspaceTasks = [
  { id: "1", title: "Upload last 3 months of pay stubs", description: "Needed for damages calculation", dueDate: "Mar 10", priority: "high" as const, completed: true, assignedBy: "Sarah Chen", caseName: "Employment Dispute" },
  { id: "2", title: "Review and approve response letter", description: "Check all facts before we send to opposing party", dueDate: "Mar 12", priority: "high" as const, completed: false, assignedBy: "Sarah Chen", caseName: "Employment Dispute" },
  { id: "3", title: "List all witnesses from workplace", description: "Colleagues who can corroborate the events", dueDate: "Mar 14", priority: "medium" as const, completed: false, assignedBy: "Sarah Chen", caseName: "Employment Dispute" },
  { id: "4", title: "Provide former employer's legal counsel info", priority: "medium" as const, completed: false, assignedBy: "Sarah Chen", caseName: "Employment Dispute" },
  { id: "5", title: "Complete intake questionnaire", priority: "low" as const, completed: true, assignedBy: "System", caseName: "Employment Dispute" },
  { id: "6", title: "Sign engagement letter", priority: "high" as const, completed: true, assignedBy: "Sarah Chen", caseName: "Employment Dispute" },
];

const internalNotes = [
  { id: "1", author: "Sarah Chen", content: "Strong case. Non-compete is clearly overbroad under CA law. Recommend aggressive posture on severance — contract is unambiguous.", time: "Mar 6, 5:30 PM", pinned: true },
  { id: "2", author: "Sarah Chen", content: "Client is responsive and organized. Has provided all requested documents promptly. Good candidate for negotiated settlement.", time: "Mar 5, 4:00 PM", pinned: false },
  { id: "3", author: "Alex Johnson", content: "Former manager James Wilson might be willing to provide a statement. He was sympathetic when I was let go.", time: "Mar 7, 11:00 AM", pinned: false },
  { id: "4", author: "Sarah Chen", content: "Pay stubs confirm $145K annual salary. Damages calculation: 2 months unpaid severance = $24,166 + potential punitive.", time: "Mar 7, 5:00 PM", pinned: true },
];

const consultationRecords = [
  { id: "1", title: "Initial Case Strategy", date: "Mar 4, 2026", time: "10:00 AM", duration: "32 min", type: "video", status: "Completed", notes: "Discussed case merits, identified two primary legal issues. Client authorized engagement." },
  { id: "2", title: "Document Review Follow-up", date: "Mar 12, 2026", time: "10:00 AM", duration: "30 min", type: "video", status: "Scheduled", notes: "Review draft response letter with client before sending." },
];

const billingItems = [
  { id: "1", description: "Initial Consultation (30 min)", date: "Mar 4, 2026", hours: 0.5, rate: 350, amount: 175, status: "Paid" },
  { id: "2", description: "Document Review — Contract & Termination Letter", date: "Mar 6, 2026", hours: 2, rate: 350, amount: 700, status: "Paid" },
  { id: "3", description: "Response Letter Drafting", date: "Mar 8, 2026", hours: 3, rate: 350, amount: 1050, status: "Pending" },
  { id: "4", description: "Pay Stub Analysis & Damages Calculation", date: "Mar 7, 2026", hours: 0.5, rate: 350, amount: 175, status: "Pending" },
];

const aiRecap = {
  generatedAt: "Mar 8, 2026 — 6:00 PM",
  summary: `## Case Summary: Employment Dispute — Wrongful Termination

**Client:** Alex Johnson | **Attorney:** Sarah Chen, Esq. | **Status:** Active — Legal Review Phase

### Key Facts
- Client employed for 4 years at TechCorp Inc., terminated without documented cause on Feb 25, 2026
- Employment contract includes a 2-year non-compete clause covering the entire technology sector
- Contract guarantees 3 months severance upon termination; employer offered only 1 month

### Legal Issues Identified
1. **Non-Compete Enforceability** — The clause is overly broad in scope and duration. Under California Business & Professions Code §16600, non-compete agreements are generally unenforceable. *[Source: Employment contract, Section 12]*
2. **Severance Breach** — Clear contractual entitlement to 3 months severance (§8.2 of employment agreement). Employer's 1-month offer constitutes a material breach. *[Source: Employment contract, Section 8.2]*

### Current Status
- All relevant documents collected and reviewed ✓
- Response letter challenging both issues is being drafted
- Estimated damages: $24,166 (2 months unpaid severance) + potential punitive damages

### Recommended Next Steps
1. Client to review and approve response letter draft (due Mar 12)
2. Formal response to be delivered to opposing party's counsel
3. Begin settlement negotiations — target: full severance + legal fees
4. If no settlement within 30 days, prepare for arbitration filing

### Risk Assessment
**Strength:** Strong (8/10) — Clear contractual breach + favorable CA law on non-competes
**Settlement Likelihood:** High — Employer likely to settle to avoid litigation costs`,
  sources: [
    "Employment Contract (2022) — Sections 8.2, 12",
    "Termination Letter — Feb 25, 2026",
    "Pay stubs Q4 2025",
    "Initial consultation notes — Mar 4, 2026",
    "California Business & Professions Code §16600",
  ],
  disclaimer: "This AI-generated summary is based on available case documents and consultation notes. It provides legal information, not legal advice. All strategic decisions should be discussed with your attorney.",
};

// ── File type styling ──────────────────────────────────────
const fileTypeStyles: Record<string, string> = {
  PDF: "bg-destructive/10 text-destructive",
  DOCX: "bg-info/10 text-info",
  JPG: "bg-success/10 text-success",
};

const consultTypeIcons: Record<string, React.ReactNode> = {
  video: <Video className="h-3.5 w-3.5" />,
  phone: <Phone className="h-3.5 w-3.5" />,
  "in-person": <Building2 className="h-3.5 w-3.5" />,
};

// ── Component ──────────────────────────────────────────────
export default function CaseWorkspace({ role = "client" }: { role?: "client" | "lawyer" }) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
  const [newMessage, setNewMessage] = useState("");
  const [newNote, setNewNote] = useState("");
  const [isGeneratingRecap, setIsGeneratingRecap] = useState(false);
  const navigate = useNavigate();

  const navItems = role === "lawyer" ? lawyerNavItems : clientNavItems;
  const portalLabel = role === "lawyer" ? "Lawyer Portal" : "Client Portal";
  const userName = role === "lawyer" ? "Sarah Chen" : "Alex Johnson";
  const userRole = role === "lawyer" ? "Attorney" : "Client";

  const handleGenerateRecap = useCallback(async () => {
    setIsGeneratingRecap(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lawyer-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          mode: "case_summary",
          context: {
            case_title: matterData.title,
            client_name: matterData.client,
            status: matterData.status,
            legal_category: matterData.legalCategory,
            description: matterData.description,
            timeline: timelineEvents.map(e => `${e.date}: ${e.title} - ${e.description}`).join("\n"),
            notes: internalNotes.map(n => `${n.author}: ${n.content}`).join("\n"),
          },
        }),
      });
      if (!resp.ok) throw new Error("Failed");
      toast.success("AI recap refreshed");
    } catch {
      toast.error("Using cached recap");
    } finally {
      setIsGeneratingRecap(false);
    }
  }, []);

  return (
    <DashboardLayout sidebarItems={navItems} portalLabel={portalLabel} userName={userName} userRole={userRole}>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(role === "lawyer" ? "/lawyer/cases" : "/client/cases")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {role === "lawyer" ? "matters" : "cases"}
        </button>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-serif text-foreground">{matterData.title}</h1>
              <StatusBadge status={matterData.status} variant={matterData.statusVariant} />
              <span className="text-xs font-medium bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">{matterData.priority}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              <span>{matterData.caseNumber}</span>
              <span className="hidden sm:inline">·</span>
              <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {matterData.client}</span>
              <span className="hidden sm:inline">·</span>
              <span className="flex items-center gap-1"><Scale className="h-3.5 w-3.5" /> {matterData.lawyer}, {matterData.firm}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {matterData.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>

          {/* Progress ring */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center">
              <div className="relative h-16 w-16">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--accent))" strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - matterData.progress / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-accent">{matterData.progress}%</span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">Progress</span>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs text-muted-foreground">Next Deadline</div>
              <div className="text-sm font-semibold text-foreground">{matterData.nextDeadline}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Billed</div>
              <div className="text-sm font-semibold text-accent">${matterData.totalBilled.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="mb-6 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 border-b overflow-x-auto">
        <div className="flex gap-0.5 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* ── Overview ───────────────────────────── */}
          {activeTab === "overview" && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Case details */}
                <div className="rounded-xl bg-card border shadow-card p-5">
                  <h3 className="font-semibold text-foreground mb-3">Matter Details</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{matterData.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Category", value: matterData.legalCategory },
                      { label: "Created", value: matterData.created },
                      { label: "Last Updated", value: matterData.updated },
                      { label: "Next Step", value: matterData.nextStep },
                      { label: "Next Deadline", value: matterData.nextDeadline },
                      { label: "Priority", value: matterData.priority },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{item.label}</div>
                        <div className="text-sm font-medium text-foreground mt-0.5">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent timeline */}
                <div className="rounded-xl bg-card border shadow-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Recent Activity</h3>
                    <button onClick={() => setActiveTab("timeline")} className="text-xs text-accent hover:underline font-medium">View Full Timeline</button>
                  </div>
                  <MatterTimeline events={timelineEvents.slice(-5)} />
                </div>
              </div>

              <div className="space-y-6">
                {/* Pending tasks */}
                <div className="rounded-xl bg-card border shadow-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground text-sm">Pending Tasks</h3>
                    <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                      {workspaceTasks.filter(t => !t.completed).length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {workspaceTasks.filter(t => !t.completed).slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/30">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-medium text-foreground">{task.title}</div>
                          {task.dueDate && <div className="text-[10px] text-muted-foreground">Due {task.dueDate}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveTab("tasks")} className="text-xs text-accent hover:underline font-medium mt-2 block">View All Tasks</button>
                </div>

                {/* Team */}
                <div className="rounded-xl bg-card border shadow-card p-5">
                  <h3 className="font-semibold text-foreground text-sm mb-3">Case Team</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">SC</div>
                      <div>
                        <div className="text-sm font-medium text-foreground">Sarah Chen</div>
                        <div className="text-[10px] text-muted-foreground">Lead Attorney · Employment Law</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">AJ</div>
                      <div>
                        <div className="text-sm font-medium text-foreground">Alex Johnson</div>
                        <div className="text-[10px] text-muted-foreground">Client</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="rounded-xl bg-card border shadow-card p-5">
                  <h3 className="font-semibold text-foreground text-sm mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setActiveTab("messages")}>
                      <MessageSquare className="mr-2 h-3.5 w-3.5" /> Send Message
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setActiveTab("files")}>
                      <Upload className="mr-2 h-3.5 w-3.5" /> Upload Document
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setActiveTab("ai-recap")}>
                      <Bot className="mr-2 h-3.5 w-3.5" /> View AI Recap
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Timeline ───────────────────────────── */}
          {activeTab === "timeline" && (
            <div className="max-w-3xl">
              <div className="rounded-xl bg-card border shadow-card p-6">
                <h3 className="font-semibold text-foreground mb-6">Complete Case Timeline</h3>
                <MatterTimeline events={timelineEvents} />
              </div>
            </div>
          )}

          {/* ── Files ──────────────────────────────── */}
          {activeTab === "files" && (
            <div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/20 mb-5">
                <Lock className="h-4 w-4 text-success shrink-0" />
                <span className="text-xs text-muted-foreground">Files are encrypted and only accessible by the case team</span>
              </div>
              <div className="rounded-xl bg-card border shadow-card overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold text-foreground text-sm">{sharedFiles.length} Shared Files</h3>
                  <Button variant="gold" size="sm"><Upload className="mr-2 h-3.5 w-3.5" /> Upload</Button>
                </div>
                <div className="divide-y">
                  {sharedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors">
                      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", fileTypeStyles[file.type] || "bg-muted text-muted-foreground")}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground">{file.name}</span>
                          {file.secure && <Lock className="h-3 w-3 text-success" />}
                        </div>
                        <div className="text-xs text-muted-foreground">{file.type} · {file.size} · Uploaded {file.uploaded} by {file.by}</div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Messages ───────────────────────────── */}
          {activeTab === "messages" && (
            <div className="rounded-xl bg-card border shadow-card overflow-hidden" style={{ height: "calc(100vh - 360px)", minHeight: 400 }}>
              <div className="flex flex-col h-full">
                <div className="p-4 border-b flex items-center gap-3">
                  <Lock className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-foreground">Secure Case Chat</span>
                  <span className="text-xs text-muted-foreground">· {matterData.caseNumber}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={cn("flex", msg.isLawyer ? "justify-start" : "justify-end")}>
                      <div className="flex items-start gap-2.5 max-w-[80%]">
                        {msg.isLawyer && (
                          <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[10px] font-bold shrink-0 mt-1">SC</div>
                        )}
                        <div>
                          <div className={cn("text-[10px] mb-1", msg.isLawyer ? "text-muted-foreground" : "text-muted-foreground text-right")}>
                            {msg.sender} · {msg.time}
                          </div>
                          <div className={cn(
                            "p-3.5 rounded-xl text-sm leading-relaxed",
                            msg.isLawyer ? "bg-muted text-foreground rounded-tl-sm" : "bg-primary text-primary-foreground rounded-br-sm"
                          )}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="shrink-0"><Paperclip className="h-4 w-4" /></Button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a secure message..."
                      className="flex-1 bg-muted rounded-lg px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <Button variant="gold" size="icon" className="shrink-0"><Send className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tasks ──────────────────────────────── */}
          {activeTab === "tasks" && (
            <div className="max-w-3xl">
              <div className="rounded-xl bg-card border shadow-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Task Checklist</h3>
                  <span className="text-xs text-muted-foreground">
                    {workspaceTasks.filter(t => t.completed).length}/{workspaceTasks.length} complete
                  </span>
                </div>
                <TaskChecklist tasks={workspaceTasks} />
              </div>
            </div>
          )}

          {/* ── Notes ──────────────────────────────── */}
          {activeTab === "notes" && (
            <div className="max-w-3xl space-y-4">
              {/* Add note */}
              <div className="rounded-xl bg-card border shadow-card p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[10px] font-bold shrink-0 mt-1">
                    {role === "lawyer" ? "SC" : "AJ"}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={2}
                      placeholder="Add a note to this case..."
                      className="w-full bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground"
                    />
                    <div className="flex justify-end mt-2">
                      <Button variant="gold" size="sm" disabled={!newNote.trim()} onClick={() => { toast.success("Note added"); setNewNote(""); }}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Note
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing notes */}
              {internalNotes.map((note) => (
                <div key={note.id} className={cn("rounded-xl bg-card border shadow-card p-4", note.pinned && "border-accent/30 bg-accent/[0.02]")}>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                      {note.author.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{note.author}</span>
                        {note.pinned && <Pin className="h-3 w-3 text-accent" />}
                        <span className="text-[10px] text-muted-foreground ml-auto">{note.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{note.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Consultations ──────────────────────── */}
          {activeTab === "consultations" && (
            <div className="max-w-3xl space-y-4">
              {consultationRecords.map((c) => (
                <div key={c.id} className="rounded-xl bg-card border shadow-card p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-11 w-11 rounded-xl flex items-center justify-center",
                        c.status === "Completed" ? "bg-success/10" : "bg-accent/10"
                      )}>
                        {c.status === "Completed" ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Calendar className="h-5 w-5 text-accent" />}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{c.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                          <span>{c.date} at {c.time}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">{consultTypeIcons[c.type]} {c.type}</span>
                          <span>·</span>
                          <span>{c.duration}</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={c.status} variant={c.status === "Completed" ? "success" : "warning"} />
                  </div>
                  {c.notes && (
                    <div className="mt-3 p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
                      {c.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Billing ────────────────────────────── */}
          {activeTab === "billing" && (
            <div>
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Billed", value: `$${billingItems.reduce((s, b) => s + b.amount, 0).toLocaleString()}`, icon: <DollarSign className="h-4 w-4 text-accent" /> },
                  { label: "Hours Logged", value: `${billingItems.reduce((s, b) => s + b.hours, 0)}h`, icon: <Timer className="h-4 w-4 text-accent" /> },
                  { label: "Paid", value: `$${billingItems.filter(b => b.status === "Paid").reduce((s, b) => s + b.amount, 0).toLocaleString()}`, icon: <CheckCircle2 className="h-4 w-4 text-success" /> },
                  { label: "Outstanding", value: `$${billingItems.filter(b => b.status === "Pending").reduce((s, b) => s + b.amount, 0).toLocaleString()}`, icon: <Clock className="h-4 w-4 text-warning" /> },
                ].map((s) => (
                  <div key={s.label} className="p-4 rounded-xl bg-card border shadow-card">
                    <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-xs text-muted-foreground">{s.label}</span></div>
                    <div className="text-xl font-semibold text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Line items */}
              <div className="rounded-xl bg-card border shadow-card overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-foreground text-sm">Billing Details</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Description</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Date</th>
                        <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Hours</th>
                        <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Amount</th>
                        <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {billingItems.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/20">
                          <td className="px-5 py-3.5 text-sm text-foreground">{item.description}</td>
                          <td className="px-5 py-3.5 text-sm text-muted-foreground hidden sm:table-cell">{item.date}</td>
                          <td className="px-5 py-3.5 text-sm text-muted-foreground text-right">{item.hours}h</td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-foreground text-right">${item.amount}</td>
                          <td className="px-5 py-3.5 text-right">
                            <StatusBadge status={item.status} variant={item.status === "Paid" ? "success" : "warning"} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── AI Recap ───────────────────────────── */}
          {activeTab === "ai-recap" && (
            <div className="max-w-4xl">
              <div className="rounded-xl bg-card border shadow-card overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">AI-Generated Case Recap</div>
                      <div className="text-xs text-muted-foreground">Last updated: {aiRecap.generatedAt}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleGenerateRecap} disabled={isGeneratingRecap}>
                    {isGeneratingRecap ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
                    Refresh
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="prose prose-sm max-w-none text-foreground
                    [&_h2]:font-serif [&_h2]:text-lg [&_h2]:text-foreground [&_h2]:mt-0 [&_h2]:mb-4
                    [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:text-sm [&_h3]:mt-5 [&_h3]:mb-2
                    [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed
                    [&_li]:text-sm [&_li]:text-muted-foreground
                    [&_strong]:text-foreground
                    [&_em]:text-muted-foreground/80 [&_em]:text-xs
                  ">
                    {/* Render as formatted sections */}
                    {aiRecap.summary.split("\n").map((line, i) => {
                      if (line.startsWith("## ")) return <h2 key={i}>{line.replace("## ", "")}</h2>;
                      if (line.startsWith("### ")) return <h3 key={i}>{line.replace("### ", "")}</h3>;
                      if (line.startsWith("**") && line.endsWith("**")) return <p key={i}><strong>{line.replace(/\*\*/g, "")}</strong></p>;
                      if (line.match(/^\d\./)) return <p key={i} className="ml-4">{line.replace(/\*\*(.*?)\*\*/g, "").replace(/\*(.*?)\*/g, "")}<br/><span className="text-xs text-muted-foreground/70">{line.match(/\*\[(.*?)\]\*/)?.[1] || line.match(/\[(.*?)\]/)?.[1] || ""}</span></p>;
                      if (line.startsWith("- ")) return <p key={i} className="ml-4 flex items-start gap-2"><span className="text-accent mt-1">•</span>{line.replace("- ", "")}</p>;
                      if (line.trim() === "") return <div key={i} className="h-2" />;
                      return <p key={i}>{line}</p>;
                    })}
                  </div>
                </div>

                {/* Sources */}
                <div className="px-6 pb-4">
                  <div className="rounded-lg bg-muted/30 border p-4">
                    <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-accent" /> Source Documents
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {aiRecap.sources.map((source, i) => (
                        <span key={i} className="text-[10px] bg-card border px-2.5 py-1 rounded-full text-muted-foreground">{source}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="px-6 pb-5">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20">
                    <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{aiRecap.disclaimer}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      <ClientSupportChat />
    </DashboardLayout>
  );
}
