import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { SectionHeader, StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight, Plus, Clock, CheckCircle2, Timer, StickyNote, Briefcase,
  ChevronDown, FileText, DollarSign, Tag, AlertTriangle, X, Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const filterTabs = ["All", "active", "discovery", "pending", "under-review", "closed"];
const filterLabels: Record<string, string> = { All: "All Cases", active: "Active", discovery: "Discovery", pending: "Pending", "under-review": "Under Review", closed: "Closed" };

export default function LawyerCases() {
  const [matters, setMatters] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [showNewMatter, setShowNewMatter] = useState(false);
  const [showNewTask, setShowNewTask] = useState<string | null>(null);
  const [matterForm, setMatterForm] = useState({ title: "", client_name: "", legal_category: "", priority: "medium" });
  const [taskForm, setTaskForm] = useState({ title: "", due_date: "" });

  useEffect(() => {
    const load = async () => {
      const [mattersRes, tasksRes, notesRes] = await Promise.all([
        supabase.from("matters" as any).select("*").order("created_at", { ascending: false }),
        supabase.from("tasks" as any).select("*").order("due_date"),
        supabase.from("internal_notes" as any).select("*").order("created_at", { ascending: false }),
      ]);
      setMatters((mattersRes.data as any[]) || []);
      setTasks((tasksRes.data as any[]) || []);
      setNotes((notesRes.data as any[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = activeFilter === "All" ? matters : matters.filter((m) => m.status === activeFilter);

  const matterTasks = (matterId: string) => tasks.filter((t) => t.matter_id === matterId);
  const matterNotes = (matterId: string) => notes.filter((n) => n.matter_id === matterId);

  const addNote = async (matterId: string) => {
    if (!newNote.trim()) return;
    const { data } = await supabase.from("internal_notes" as any).insert({ matter_id: matterId, content: newNote, author_name: "Sarah Chen" } as any).select();
    if (data) setNotes((prev) => [...(data as any[]), ...prev]);
    setNewNote("");
  };

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    await supabase.from("tasks" as any).update({ status: newStatus, completed_at: newStatus === "completed" ? new Date().toISOString() : null } as any).eq("id", taskId);
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const statusVariant = (s: string) =>
    s === "active" ? "success" : s === "discovery" ? "info" : s === "pending" ? "warning" : "default";

  const createMatter = async () => {
    if (!matterForm.title.trim() || !matterForm.client_name.trim()) { toast.error("Title and client name required"); return; }
    const { data, error } = await supabase.from("matters" as any).insert(matterForm as any).select();
    if (error) { toast.error("Failed to create matter"); return; }
    if (data) setMatters((prev) => [...(data as any[]), ...prev]);
    setMatterForm({ title: "", client_name: "", legal_category: "", priority: "medium" });
    setShowNewMatter(false);
    toast.success("Matter created");
  };

  const createTask = async (matterId: string) => {
    if (!taskForm.title.trim()) { toast.error("Task title required"); return; }
    const { data, error } = await supabase.from("tasks" as any).insert({ matter_id: matterId, title: taskForm.title, due_date: taskForm.due_date || null } as any).select();
    if (error) { toast.error("Failed to create task"); return; }
    if (data) setTasks((prev) => [...prev, ...(data as any[])]);
    setTaskForm({ title: "", due_date: "" });
    setShowNewTask(null);
    toast.success("Task added");
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    await supabase.from("tasks" as any).delete().eq("id", taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    toast.success("Task deleted");
  };

  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName={profile?.full_name || "Attorney"} userRole="Attorney">
      <SectionHeader
        title="Case Management"
        subtitle="Manage and track all your active matters"
        action={<Button variant="gold" size="sm" onClick={() => setShowNewMatter(true)}><Plus className="mr-2 h-3.5 w-3.5" /> New Matter</Button>}
      />

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filterTabs.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === f ? "bg-accent text-accent-foreground" : "bg-card border text-muted-foreground hover:bg-muted"
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-card border p-6 animate-pulse"><div className="h-5 w-64 bg-muted rounded mb-2" /><div className="h-4 w-48 bg-muted rounded" /></div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-xl bg-card border">
            <Briefcase className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No cases found. Create a new matter to get started.</p>
          </div>
        ) : (
          filtered.map((m, index) => {
            const mt = matterTasks(m.id);
            const mn = matterNotes(m.id);
            const completedTasks = mt.filter((t) => t.status === "completed").length;
            const isExpanded = expandedId === m.id;

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="rounded-xl bg-card border shadow-card hover:shadow-card-hover transition-all overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{m.title}</h3>
                        <StatusBadge status={m.status} variant={statusVariant(m.status)} />
                        <span className={`text-xs font-semibold ${m.priority === "high" ? "text-destructive" : m.priority === "medium" ? "text-warning" : "text-muted-foreground"}`}>
                          {m.priority} priority
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{m.client_name} · {m.legal_category}</div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> ${Number(m.total_billed).toLocaleString()}</span>
                        {m.next_deadline && (
                          <span className={`flex items-center gap-1 ${new Date(m.next_deadline) < new Date() ? "text-destructive" : ""}`}>
                            <Clock className="h-3 w-3" /> {new Date(m.next_deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                        <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {completedTasks}/{mt.length} tasks</span>
                        <span className="flex items-center gap-1"><StickyNote className="h-3 w-3" /> {mn.length} notes</span>
                      </div>
                      {m.tags?.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                          {m.tags.map((tag: string) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                              <Tag className="h-2.5 w-2.5" /> {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="sm"><FileText className="mr-1.5 h-3.5 w-3.5" /> Docs</Button>
                      <Button variant="outline" size="sm">Open <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </div>

                {/* Expand: Tasks + Notes */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : m.id)}
                  className="w-full py-2 border-t text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors flex items-center justify-center gap-1"
                >
                  {isExpanded ? "Collapse" : "Tasks & Notes"}
                  <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 grid md:grid-cols-2 gap-4">
                        {/* Tasks */}
                        <div>
                          <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-accent" /> Tasks</h4>
                          <div className="space-y-1.5">
                            {mt.length === 0 && <p className="text-xs text-muted-foreground">No tasks yet</p>}
                            {mt.map((t) => (
                              <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                <button onClick={() => toggleTask(t.id, t.status)} className="shrink-0">
                                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                    t.status === "completed" ? "border-success bg-success/10" : t.status === "in_progress" ? "border-accent" : "border-border"
                                  }`}>
                                    {t.status === "completed" && <CheckCircle2 className="h-2.5 w-2.5 text-success" />}
                                    {t.status === "in_progress" && <Timer className="h-2.5 w-2.5 text-accent" />}
                                  </div>
                                </button>
                                <span className={`text-xs flex-1 ${t.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</span>
                                {t.due_date && (
                                  <span className={`text-[10px] ${new Date(t.due_date) < new Date() && t.status !== "completed" ? "text-destructive" : "text-muted-foreground"}`}>
                                    {new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  </span>
                                )}
                                <button onClick={() => deleteTask(t.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <Button variant="outline" size="sm" className="h-7 text-xs mt-2" onClick={() => setShowNewTask(m.id)}>
                            <Plus className="mr-1 h-3 w-3" /> Add Task
                          </Button>
                        </div>

                        {/* Notes */}
                        <div>
                          <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><StickyNote className="h-3.5 w-3.5 text-accent" /> Internal Notes</h4>
                          <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
                            {mn.length === 0 && <p className="text-xs text-muted-foreground">No notes yet</p>}
                            {mn.map((n) => (
                              <div key={n.id} className="p-2 rounded-lg bg-muted/50 text-xs">
                                <p className="text-foreground">{n.content}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">{n.author_name} · {new Date(n.created_at).toLocaleDateString()}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && addNote(m.id)}
                              placeholder="Add note..."
                              className="flex-1 bg-muted rounded-lg px-3 py-1.5 text-xs outline-none placeholder:text-muted-foreground"
                            />
                            <Button variant="outline" size="sm" onClick={() => addNote(m.id)} className="h-7 text-xs">Add</Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* New Matter Dialog */}
      <Dialog open={showNewMatter} onOpenChange={setShowNewMatter}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Matter</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={matterForm.title} onChange={(e) => setMatterForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Smith Employment Dispute" /></div>
            <div><Label>Client Name</Label><Input value={matterForm.client_name} onChange={(e) => setMatterForm(f => ({ ...f, client_name: e.target.value }))} placeholder="Client full name" /></div>
            <div><Label>Legal Category</Label><Input value={matterForm.legal_category} onChange={(e) => setMatterForm(f => ({ ...f, legal_category: e.target.value }))} placeholder="e.g. Employment Law" /></div>
            <div><Label>Priority</Label>
              <select value={matterForm.priority} onChange={(e) => setMatterForm(f => ({ ...f, priority: e.target.value }))} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
            <Button variant="gold" className="w-full" onClick={createMatter}>Create Matter</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Task Dialog */}
      <Dialog open={!!showNewTask} onOpenChange={() => setShowNewTask(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Task Title</Label><Input value={taskForm.title} onChange={(e) => setTaskForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Draft response letter" /></div>
            <div><Label>Due Date</Label><Input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm(f => ({ ...f, due_date: e.target.value }))} /></div>
            <Button variant="gold" className="w-full" onClick={() => showNewTask && createTask(showNewTask)}>Add Task</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
