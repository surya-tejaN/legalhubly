import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, MessageCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

export default function ClientSupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your Legalhubly support assistant. I can help you understand how the platform works, explain legal processes, and guide you through your journey.\n\nWhat can I help you with?" },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: Msg = { role: "user", content: input };
    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setInput("");
    setIsStreaming(true);

    let assistantSoFar = "";
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/client-support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMsgs }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast({ title: "Rate limited", description: "Please try again shortly.", variant: "destructive" });
        else if (resp.status === 402) toast({ title: "Usage limit", description: "AI credits exhausted.", variant: "destructive" });
        else toast({ title: "Error", description: "Support chat failed.", variant: "destructive" });
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
              setMessages((prev) => {
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
      toast({ title: "Error", description: "Failed to connect.", variant: "destructive" });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-gold flex items-center justify-center hover:bg-accent/90 transition-colors"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] rounded-2xl bg-card border shadow-card-hover flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3 bg-accent/5">
              <div className="h-9 w-9 rounded-full bg-accent/15 flex items-center justify-center">
                <Bot className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-foreground">Support Assistant</div>
                <div className="text-[10px] text-muted-foreground">Platform help & legal process guide</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-2.5 rounded-xl text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none text-foreground [&_p]:mb-1.5 [&_p]:text-sm [&_li]:text-sm [&_li]:text-foreground">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isStreaming && (
                <div className="flex justify-start">
                  <div className="p-2.5 rounded-xl bg-muted">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Disclaimer */}
            <div className="px-3 py-1 border-t border-dashed flex items-center gap-1 text-[9px] text-muted-foreground bg-muted/30">
              <Info className="h-2.5 w-2.5 shrink-0" />
              General information only — not legal advice. Consult your attorney for case-specific guidance.
            </div>

            {/* Input */}
            <div className="p-2.5 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Ask about the platform..."
                  className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
                <Button variant="gold" size="icon" className="shrink-0 h-9 w-9" onClick={send} disabled={isStreaming}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
