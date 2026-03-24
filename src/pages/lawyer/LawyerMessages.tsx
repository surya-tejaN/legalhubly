import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import {
  Send, Paperclip, Bot, Briefcase, Sparkles, User, Info,
  FileText, ListTodo, MessageSquare, BarChart3, AlertTriangle,
  Lock, Loader2, Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
}

interface DBMessage {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
}

const AI_MODES = [
  { value: "chat", label: "General", icon: <MessageSquare className="h-3.5 w-3.5" />, desc: "Research & analysis" },
  { value: "case_summary", label: "Summarize", icon: <FileText className="h-3.5 w-3.5" />, desc: "Generate case brief" },
  { value: "suggest_tasks", label: "Tasks", icon: <ListTodo className="h-3.5 w-3.5" />, desc: "Suggest action items" },
  { value: "suggest_reply", label: "Reply", icon: <Send className="h-3.5 w-3.5" />, desc: "Draft client reply" },
  { value: "case_update", label: "Update", icon: <BarChart3 className="h-3.5 w-3.5" />, desc: "Status update for client" },
];

export default function LawyerMessages() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"clients" | "ai">("clients");

  // Client conversations state
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);

  // AI state
  const [aiMode, setAiMode] = useState("chat");
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hello! I'm your AI legal productivity assistant. I can help with:\n\n- **General chat** — case analysis, research, strategy\n- **Case summaries** — convert intake data into attorney-ready briefs\n- **Task suggestions** — prioritized action items for your cases\n- **Reply drafting** — professional client communications\n- **Case updates** — client-friendly status reports\n\nSelect a mode above or just ask me anything.\n\n*⚖️ AI-generated analysis — for attorney review only.*" },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("conversation_participants")
        .select("conversation_id, conversations(*)")
        .eq("user_id", user.id);
      const items = (data || []).filter((d: any) => d.conversations).map((d: any) => d.conversations as Conversation);
      setConvos(items);
      if (items.length > 0) setSelectedId(items[0].id);
      setLoadingConvos(false);
    })();
  }, [user]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedId)
        .order("created_at", { ascending: true });
      setMessages((data as DBMessage[]) || []);
    })();

    const channel = supabase
      .channel(`lawyer-messages:${selectedId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `conversation_id=eq.${selectedId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as DBMessage]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiMessages]);

  const sendClientMessage = async () => {
    if (!newMessage.trim() || !selectedId || !user) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedId,
      sender_user_id: user.id,
      body: newMessage.trim(),
    });
    if (error) toast.error("Failed to send message");
    setNewMessage("");
    setSending(false);
  };

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedId) return;
    if (file.size > 25 * 1024 * 1024) { toast.error("Max 25MB"); return; }

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file);
    if (uploadError) { toast.error("Upload failed"); return; }

    const { data: urlData } = await supabase.storage.from("documents").createSignedUrl(filePath, 86400);
    const url = urlData?.signedUrl || filePath;

    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedId,
      sender_user_id: user.id,
      body: `📎 [${file.name}](${url})`,
    });
    if (error) toast.error("Failed to send attachment");
    else toast.success("File sent");
    e.target.value = "";
  };

  const sendAI = async () => {
    if (!aiInput.trim() || isStreaming) return;
    const userMsg: Msg = { role: "user", content: aiInput };
    const allMsgs = [...aiMessages, userMsg];
    setAiMessages(allMsgs);
    setAiInput("");
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
        toast.error("AI request failed");
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
          } catch { break; }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to connect to AI");
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName={profile?.full_name || "Attorney"} userRole="Attorney">
      <SectionHeader title="Messages" subtitle="Client communications & AI productivity agent" />

      <div className="rounded-xl bg-card border shadow-card overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-80 border-r flex-col shrink-0 hidden md:flex">
            {/* Tab toggle */}
            <div className="flex border-b">
              <button onClick={() => setActiveTab("clients")} className={cn("flex-1 py-2.5 text-xs font-medium text-center transition-colors", activeTab === "clients" ? "border-b-2 border-accent text-accent" : "text-muted-foreground hover:text-foreground")}>
                <MessageSquare className="h-3.5 w-3.5 inline mr-1" /> Clients
              </button>
              <button onClick={() => setActiveTab("ai")} className={cn("flex-1 py-2.5 text-xs font-medium text-center transition-colors", activeTab === "ai" ? "border-b-2 border-accent text-accent" : "text-muted-foreground hover:text-foreground")}>
                <Bot className="h-3.5 w-3.5 inline mr-1" /> AI Assistant
              </button>
            </div>

            {activeTab === "clients" ? (
              <div className="flex-1 overflow-y-auto">
                {loadingConvos ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div>
                ) : convos.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet</div>
                ) : (
                  convos.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedId(c.id); setActiveTab("clients"); }}
                      className={cn("w-full text-left p-3 border-b transition-colors", selectedId === c.id && activeTab === "clients" ? "bg-accent/5" : "hover:bg-muted/30")}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm text-foreground">Conversation</span>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-4">
                  <Bot className="h-10 w-10 text-accent mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">AI Legal Assistant</p>
                  <p className="text-xs text-muted-foreground mt-1">Multi-mode AI for case analysis</p>
                </div>
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className={cn("h-9 w-9 rounded-full flex items-center justify-center", activeTab === "ai" ? "bg-accent/15" : "bg-muted")}>
                  {activeTab === "ai" ? <Bot className="h-5 w-5 text-accent" /> : <User className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-foreground">
                    {activeTab === "ai" ? "AI Legal Productivity Agent" : "Client Conversation"}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {activeTab === "ai" ? "Multi-mode AI" : <><Lock className="h-3 w-3 text-success" /> Secure messaging</>}
                  </div>
                </div>
              </div>

              {activeTab === "ai" && (
                <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1">
                  {AI_MODES.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setAiMode(mode.value)}
                      className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                        aiMode === mode.value ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >{mode.icon} {mode.label}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeTab === "clients" ? (
                <>
                  {messages.map((msg) => {
                    const isMe = msg.sender_user_id === user?.id;
                    return (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className={cn("flex", isMe ? "justify-end" : "justify-start")}
                      >
                        <div className={cn("max-w-[75%] p-3.5 rounded-xl text-sm",
                          isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"
                        )}>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                          <div className={cn("flex items-center gap-1.5 mt-1.5 text-[10px]", isMe ? "text-primary-foreground/60" : "text-muted-foreground")}>
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {messages.length === 0 && selectedId && (
                    <div className="text-center py-12 text-muted-foreground text-sm">No messages yet. Start the conversation!</div>
                  )}
                  {!selectedId && convos.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm">No conversations yet. They will appear when clients book consultations.</div>
                  )}
                </>
              ) : (
                <>
                  {aiMessages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                    >
                      <div className={cn("max-w-[80%] p-3 rounded-xl text-sm",
                        msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-accent/5 border border-accent/15 text-foreground rounded-bl-sm"
                      )}>
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm max-w-none text-foreground [&_p]:mb-2 [&_ul]:mb-2 [&_li]:text-foreground [&_strong]:text-foreground">
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
                </>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Compliance footer for AI */}
            {activeTab === "ai" && (
              <div className="px-4 py-1.5 border-t border-dashed flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/30">
                <Info className="h-3 w-3 shrink-0" />
                AI-generated analysis is for attorney review only. Verify all facts and citations.
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t">
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileAttach}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.xls,.xlsx" />
              <div className="flex items-center gap-2">
                {activeTab === "clients" && (
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                )}
                {activeTab === "ai" && <div className="shrink-0 h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center"><Bot className="h-4 w-4 text-accent" /></div>}
                <input
                  type="text"
                  value={activeTab === "ai" ? aiInput : newMessage}
                  onChange={(e) => activeTab === "ai" ? setAiInput(e.target.value) : setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (activeTab === "ai" ? sendAI() : sendClientMessage())}
                  placeholder={activeTab === "ai" ? `Ask in ${AI_MODES.find(m => m.value === aiMode)?.label} mode...` : "Type a secure message..."}
                  className="flex-1 bg-muted rounded-lg px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                  disabled={activeTab === "clients" ? sending : isStreaming}
                />
                <Button variant="gold" size="icon" className="shrink-0"
                  onClick={activeTab === "ai" ? sendAI : sendClientMessage}
                  disabled={activeTab === "ai" ? isStreaming : sending || !newMessage.trim()}
                >
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
