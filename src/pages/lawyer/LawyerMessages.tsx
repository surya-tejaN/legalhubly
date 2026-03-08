import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import {
  Send, Paperclip, Bot, Briefcase, Sparkles, User, Info,
  FileText, ListTodo, MessageSquare, BarChart3, AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const clientConversations = [
  { id: 1, name: "Alex Johnson", case: "Employment Dispute", lastMessage: "Thank you for the update.", time: "5 min ago", unread: 1, online: true },
  { id: 2, name: "Robert Lee", case: "Real Estate Closing", lastMessage: "When can we schedule the walkthrough?", time: "1 hour ago", unread: 0, online: false },
  { id: 3, name: "Jennifer Lee", case: "Discrimination Claim", lastMessage: "I found additional evidence.", time: "3 hours ago", unread: 3, online: true },
  { id: "ai", name: "AI Legal Assistant", case: "Multi-Agent AI", lastMessage: "Ready to help with your cases", time: "Online", unread: 0, online: true, isAI: true },
];

const AI_MODES = [
  { value: "chat", label: "General", icon: <MessageSquare className="h-3.5 w-3.5" />, desc: "Research & analysis" },
  { value: "case_summary", label: "Summarize", icon: <FileText className="h-3.5 w-3.5" />, desc: "Generate case brief" },
  { value: "suggest_tasks", label: "Tasks", icon: <ListTodo className="h-3.5 w-3.5" />, desc: "Suggest action items" },
  { value: "suggest_reply", label: "Reply", icon: <Send className="h-3.5 w-3.5" />, desc: "Draft client reply" },
  { value: "case_update", label: "Update", icon: <BarChart3 className="h-3.5 w-3.5" />, desc: "Status update for client" },
];

const staticMessages: Msg[] = [
  { role: "user", content: "Hi Sarah, I wanted to follow up on the response letter." },
  { role: "assistant", content: "Hi Alex! I've completed the draft. Key points: non-compete challenge and revised severance demand." },
  { role: "user", content: "Should I avoid contact with my former employer while this is pending?" },
  { role: "assistant", content: "Absolutely. All communication should go through me. If they reach out, let me know immediately." },
];

export default function LawyerMessages() {
  const [activeConvo, setActiveConvo] = useState<string | number>("ai");
  const [input, setInput] = useState("");
  const [aiMode, setAiMode] = useState("chat");
  const [aiMessages, setAiMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hello, Sarah! I'm your AI legal productivity assistant. I can help with:\n\n- **General chat** — case analysis, research, strategy\n- **Case summaries** — convert intake data into attorney-ready briefs\n- **Task suggestions** — prioritized action items for your cases\n- **Reply drafting** — professional client communications\n- **Case updates** — client-friendly status reports\n\nSelect a mode above or just ask me anything.\n\n*⚖️ AI-generated analysis — for attorney review only.*" },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isAI = activeConvo === "ai";
  const displayMessages = isAI ? aiMessages : staticMessages;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  const sendAI = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: Msg = { role: "user", content: input };
    const allMsgs = [...aiMessages, userMsg];
    setAiMessages(allMsgs);
    setInput("");
    setIsStreaming(true);

    let assistantSoFar = "";
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lawyer-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMsgs, agent_mode: aiMode }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast({ title: "Rate limited", description: "Please try again shortly.", variant: "destructive" });
        else if (resp.status === 402) toast({ title: "Usage limit", description: "AI credits exhausted.", variant: "destructive" });
        else toast({ title: "Error", description: "AI request failed.", variant: "destructive" });
        setIsStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setAiMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > allMsgs.length) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to connect to AI.", variant: "destructive" });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName="Sarah Chen" userRole="Attorney">
      <SectionHeader title="Messages" subtitle="Client communications & AI productivity agent" />

      <div className="rounded-xl bg-card border shadow-card overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-80 border-r flex-col shrink-0 hidden md:flex">
            <div className="p-3 border-b">
              <input type="text" placeholder="Search..." className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none placeholder:text-muted-foreground" />
            </div>
            <div className="flex-1 overflow-y-auto">
              {clientConversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConvo(c.id)}
                  className={`w-full text-left p-3 border-b transition-colors ${activeConvo === c.id ? "bg-accent/5" : "hover:bg-muted/30"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${c.isAI ? "bg-accent/15" : "bg-muted"}`}>
                        {c.isAI ? <Bot className="h-5 w-5 text-accent" /> : (
                          <span className="text-xs font-bold text-muted-foreground">{c.name.split(" ").map((n) => n[0]).join("")}</span>
                        )}
                      </div>
                      {c.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-card" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm text-foreground truncate">{c.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{c.time}</span>
                      </div>
                      <div className="text-[10px] text-accent flex items-center gap-1 mt-0.5">
                        {c.isAI ? <Sparkles className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
                        {c.case}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">{c.lastMessage}</div>
                    </div>
                    {c.unread > 0 && (
                      <span className="h-5 w-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center shrink-0">{c.unread}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center ${isAI ? "bg-accent/15" : "bg-muted"}`}>
                  {isAI ? <Bot className="h-5 w-5 text-accent" /> : <User className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-foreground">
                    {isAI ? "AI Legal Productivity Agent" : clientConversations.find((c) => c.id === activeConvo)?.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isAI ? "Multi-mode AI · Chat, Summarize, Tasks, Reply, Update" : clientConversations.find((c) => c.id === activeConvo)?.case}
                  </div>
                </div>
                {isAI && <Sparkles className="h-4 w-4 text-accent animate-pulse" />}
              </div>

              {/* AI Mode Selector */}
              {isAI && (
                <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1">
                  {AI_MODES.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setAiMode(mode.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        aiMode === mode.value
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                      title={mode.desc}
                    >
                      {mode.icon} {mode.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {displayMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : isAI
                      ? "bg-accent/5 border border-accent/15 text-foreground rounded-bl-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}>
                    {msg.role === "assistant" && isAI ? (
                      <div className="prose prose-sm max-w-none text-foreground [&_p]:mb-2 [&_ul]:mb-2 [&_li]:text-foreground [&_strong]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
              {isStreaming && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-xl bg-accent/5 border border-accent/15">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Compliance footer for AI */}
            {isAI && (
              <div className="px-4 py-1.5 border-t border-dashed flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/30">
                <Info className="h-3 w-3 shrink-0" />
                AI-generated analysis is for attorney review only. This does not constitute legal advice. Verify all facts and citations.
              </div>
            )}

            <div className="p-3 border-t">
              <div className="flex items-center gap-2">
                {!isAI && <Button variant="ghost" size="icon" className="shrink-0"><Paperclip className="h-4 w-4" /></Button>}
                {isAI && <div className="shrink-0 h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center"><Bot className="h-4 w-4 text-accent" /></div>}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (isAI ? sendAI() : null)}
                  placeholder={isAI ? `Ask in ${AI_MODES.find(m => m.value === aiMode)?.label} mode...` : "Type a message..."}
                  className="flex-1 bg-muted rounded-lg px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                />
                <Button variant="gold" size="icon" className="shrink-0" onClick={isAI ? sendAI : undefined} disabled={isStreaming}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
