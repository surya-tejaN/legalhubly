import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Bot, User, Shield, Lock, Phone, Video, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ClientSupportChat from "@/components/ClientSupportChat";

const conversations = [
  { id: 1, name: "Sarah Chen", role: "Employment Lawyer", avatar: "SC", lastMessage: "I've reviewed your termination letter and found several key issues...", time: "10 min ago", unread: 2, online: true, caseId: "C-2024-001" },
  { id: 2, name: "Michael Park", role: "Real Estate Lawyer", avatar: "MP", lastMessage: "The lease terms look reasonable, however there are some provisions...", time: "2 hours ago", unread: 0, online: false, caseId: "C-2024-002" },
  { id: 3, name: "Lisa Wong", role: "Business Lawyer", avatar: "LW", lastMessage: "Your LLC formation has been completed and filed with the state.", time: "3 days ago", unread: 0, online: false, caseId: "C-2024-003" },
  { id: 4, name: "AI Legal Assistant", role: "AI Agent", avatar: "AI", lastMessage: "Based on your case details, here are some recommended next steps...", time: "1 day ago", unread: 1, online: true, isAI: true },
];

const messagesByConvo: Record<number, Array<{ id: number; sender: string; isMe: boolean; content: string; time: string; encrypted?: boolean }>> = {
  1: [
    { id: 1, sender: "Sarah Chen", isMe: false, content: "Hi Alex, I've reviewed the termination letter you uploaded. There are several points we should discuss.", time: "10:30 AM", encrypted: true },
    { id: 2, sender: "Me", isMe: true, content: "Thank you for looking into this. What are the main concerns?", time: "10:35 AM", encrypted: true },
    { id: 3, sender: "Sarah Chen", isMe: false, content: "First, the non-compete clause appears overly broad — it restricts you from working in your field for 2 years, which courts in California typically find unenforceable.\n\nSecond, the severance terms don't align with your employment contract, which guaranteed 3 months severance, not the 1 month they're offering.\n\nI'd recommend we challenge both provisions.", time: "10:42 AM", encrypted: true },
    { id: 4, sender: "Me", isMe: true, content: "That sounds like a good plan. What's our next step?", time: "10:45 AM", encrypted: true },
    { id: 5, sender: "Sarah Chen", isMe: false, content: "I'll draft a formal response letter contesting the non-compete and demanding the full severance. I'll have it ready for your review by end of day tomorrow.\n\nIn the meantime, please don't sign anything from your former employer.", time: "10:48 AM", encrypted: true },
  ],
  2: [
    { id: 1, sender: "Michael Park", isMe: false, content: "I've started reviewing your commercial lease. The terms are mostly standard, but I want to flag a few items.", time: "Yesterday, 3:00 PM", encrypted: true },
  ],
  3: [
    { id: 1, sender: "Lisa Wong", isMe: false, content: "Great news! Your LLC has been successfully formed. I've uploaded the operating agreement and filing confirmation to your document vault.", time: "Mar 5, 2:00 PM", encrypted: true },
  ],
  4: [
    { id: 1, sender: "AI Legal Assistant", isMe: false, content: "Based on your employment dispute case, here are some recommended next steps:\n\n1. **Gather documentation** — collect all pay stubs and performance reviews\n2. **Timeline** — note key dates of your employment\n3. **Witnesses** — identify any colleagues who can corroborate events\n\n*This is general information, not legal advice. Please consult with Sarah Chen for case-specific guidance.*", time: "Yesterday" },
  ],
};

export default function ClientMessages() {
  const [activeConvo, setActiveConvo] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const [searchConvo, setSearchConvo] = useState("");
  const [showMobileList, setShowMobileList] = useState(true);

  const messages = messagesByConvo[activeConvo] || [];
  const activeConvoData = conversations.find((c) => c.id === activeConvo);

  const filteredConvos = conversations.filter((c) =>
    !searchConvo || c.name.toLowerCase().includes(searchConvo.toLowerCase())
  );

  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName="Alex Johnson" userRole="Client">
      <SectionHeader
        title="Secure Messages"
        subtitle="End-to-end encrypted communication with your legal team"
      />

      {/* Encryption banner */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-success/5 border border-success/20 mb-4 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5 text-success shrink-0" />
        Messages are encrypted and only visible to you and your assigned lawyers
      </div>

      <div className="rounded-xl bg-card border shadow-card overflow-hidden" style={{ height: "calc(100vh - 280px)" }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className={cn(
            "w-full md:w-80 border-r flex flex-col shrink-0",
            !showMobileList && "hidden md:flex"
          )}>
            <div className="p-3 border-b">
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchConvo}
                  onChange={(e) => setSearchConvo(e.target.value)}
                  placeholder="Search conversations..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConvos.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setActiveConvo(c.id); setShowMobileList(false); }}
                  className={cn(
                    "w-full text-left p-3.5 border-b transition-colors",
                    activeConvo === c.id ? "bg-accent/5" : "hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center font-semibold text-xs",
                        c.isAI ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
                      )}>
                        {c.isAI ? <Bot className="h-5 w-5" /> : c.avatar}
                      </div>
                      {c.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-card" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm text-foreground truncate">{c.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{c.time}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{c.role}</div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">{c.lastMessage}</div>
                    </div>
                    {c.unread > 0 && (
                      <span className="h-5 w-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={cn(
            "flex-1 flex flex-col",
            showMobileList && "hidden md:flex"
          )}>
            {/* Chat header */}
            <div className="p-4 border-b flex items-center gap-3">
              <button
                className="md:hidden text-muted-foreground"
                onClick={() => setShowMobileList(true)}
              >
                ←
              </button>
              <div className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold",
                activeConvoData?.isAI ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
              )}>
                {activeConvoData?.isAI ? <Bot className="h-4 w-4" /> : activeConvoData?.avatar}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-foreground">{activeConvoData?.name}</div>
                <div className="text-xs text-success flex items-center gap-1">
                  {activeConvoData?.online ? "Online" : "Offline"}
                  {activeConvoData?.caseId && <span className="text-muted-foreground ml-2">· {activeConvoData.caseId}</span>}
                </div>
              </div>
              {!activeConvoData?.isAI && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Video className="h-4 w-4" /></Button>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", msg.isMe ? "justify-end" : "justify-start")}
                >
                  <div className={cn(
                    "max-w-[75%] p-3.5 rounded-xl text-sm",
                    msg.isMe
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <div className={cn(
                      "flex items-center gap-1.5 mt-1.5 text-[10px]",
                      msg.isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                    )}>
                      {msg.encrypted && <Lock className="h-2.5 w-2.5" />}
                      {msg.time}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
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
      </div>

      <ClientSupportChat />
    </DashboardLayout>
  );
}
