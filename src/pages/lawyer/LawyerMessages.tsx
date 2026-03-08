import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Bot, Briefcase, Sparkles, User } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

type Msg = { role: "user" | "assistant"; content: string };

const clientConversations = [
  { id: 1, name: "Alex Johnson", case: "Employment Dispute", lastMessage: "Thank you for the update on the response letter.", time: "5 min ago", unread: 1, online: true },
  { id: 2, name: "Robert Lee", case: "Real Estate Closing", lastMessage: "When can we schedule the final walkthrough?", time: "1 hour ago", unread: 0, online: false },
  { id: 3, name: "Jennifer Lee", case: "Discrimination Claim", lastMessage: "I found additional evidence to share.", time: "3 hours ago", unread: 3, online: true },
  { id: "ai", name: "AI Legal Assistant", case: "Research & Drafting", lastMessage: "Ready to help with your cases", time: "Online", unread: 0, online: true, isAI: true },
];

const staticMessages: Msg[] = [
  { role: "user", content: "Hi Sarah, I wanted to follow up on the response letter." },
  { role: "assistant", content: "Hi Alex! I've completed the draft. Key points: non-compete challenge and revised severance demand." },
  { role: "user", content: "Should I avoid contact with my former employer while this is pending?" },
  { role: "assistant", content: "Absolutely. All communication should go through me. If they reach out, let me know immediately." },
];

export default function LawyerMessages() {
  const [activeConvo, setActiveConvo] = useState<string | number>(1);
  const [input, setInput] = useState("");
  const [aiMessages, setAiMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hello, Sarah! I'm your AI legal assistant. I can help you with case analysis, document drafting, research summaries, and client communications. What would you like help with?" },
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
        body: JSON.stringify({ messages: allMsgs }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) { toast({ title: "Rate limited", description: "Please try again shortly.", variant: "destructive" }); }
        else if (resp.status === 402) { toast({ title: "Usage limit", description: "AI credits exhausted.", variant: "destructive" }); }
        else { toast({ title: "Error", description: "AI request failed.", variant: "destructive" }); }
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
      <SectionHeader title="Messages" subtitle="Client communications & AI assistant" />

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
            <div className="p-4 border-b flex items-center gap-3">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center ${isAI ? "bg-accent/15" : "bg-muted"}`}>
                {isAI ? <Bot className="h-5 w-5 text-accent" /> : <User className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div>
                <div className="font-medium text-sm text-foreground">
                  {isAI ? "AI Legal Assistant" : clientConversations.find((c) => c.id === activeConvo)?.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isAI ? "Powered by AI · Research & Drafting" : clientConversations.find((c) => c.id === activeConvo)?.case}
                </div>
              </div>
              {isAI && <Sparkles className="h-4 w-4 text-accent ml-auto animate-pulse" />}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {displayMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] p-3 rounded-xl text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : isAI
                      ? "bg-accent/5 border border-accent/15 text-foreground rounded-bl-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
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

            <div className="p-3 border-t">
              <div className="flex items-center gap-2">
                {!isAI && <Button variant="ghost" size="icon" className="shrink-0"><Paperclip className="h-4 w-4" /></Button>}
                {isAI && <div className="shrink-0 h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center"><Bot className="h-4 w-4 text-accent" /></div>}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (isAI ? sendAI() : null)}
                  placeholder={isAI ? "Ask the AI assistant..." : "Type a message..."}
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
