import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Bot, User } from "lucide-react";

const conversations = [
  { id: 1, name: "Sarah Chen", role: "Employment Lawyer", lastMessage: "I've reviewed your termination letter and...", time: "10 min ago", unread: 2, online: true },
  { id: 2, name: "Michael Park", role: "Business Lawyer", lastMessage: "The lease terms look reasonable, however...", time: "2 hours ago", unread: 0, online: false },
  { id: 3, name: "AI Legal Assistant", role: "AI Agent", lastMessage: "Based on your case details, here are some...", time: "1 day ago", unread: 1, online: true, isAI: true },
];

const messages = [
  { id: 1, sender: "Sarah Chen", isMe: false, content: "Hi Alex, I've reviewed the termination letter you uploaded. There are several points we should discuss.", time: "10:30 AM" },
  { id: 2, sender: "Me", isMe: true, content: "Thank you for looking into this. What are the main concerns?", time: "10:35 AM" },
  { id: 3, sender: "Sarah Chen", isMe: false, content: "First, the non-compete clause appears overly broad. Second, the severance terms don't align with your employment contract. I'd recommend we challenge both provisions.", time: "10:42 AM" },
  { id: 4, sender: "Me", isMe: true, content: "That sounds like a good plan. What's our next step?", time: "10:45 AM" },
  { id: 5, sender: "Sarah Chen", isMe: false, content: "I'll draft a formal response letter. I'll have it ready for your review by end of day tomorrow. In the meantime, please don't sign anything from your former employer.", time: "10:48 AM" },
];

export default function ClientMessages() {
  const [activeConvo, setActiveConvo] = useState(1);
  const [newMessage, setNewMessage] = useState("");

  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName="Alex Johnson" userRole="Client">
      <SectionHeader title="Messages" subtitle="Communicate securely with your lawyers" />

      <div className="rounded-xl bg-card border shadow-card overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className="w-80 border-r flex flex-col shrink-0 hidden md:flex">
            <div className="p-3 border-b">
              <input type="text" placeholder="Search conversations..." className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none placeholder:text-muted-foreground" />
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConvo(c.id)}
                  className={`w-full text-left p-3 border-b transition-colors ${activeConvo === c.id ? "bg-accent/5" : "hover:bg-muted/30"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${c.isAI ? "bg-accent/15" : "bg-muted"}`}>
                        {c.isAI ? <Bot className="h-5 w-5 text-accent" /> : <User className="h-5 w-5 text-muted-foreground" />}
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
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium text-sm text-foreground">Sarah Chen</div>
                <div className="text-xs text-success">Online</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] p-3 rounded-xl text-sm ${
                    msg.isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"
                  }`}>
                    <p>{msg.content}</p>
                    <div className={`text-[10px] mt-1.5 ${msg.isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</div>
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
                  placeholder="Type a message..."
                  className="flex-1 bg-muted rounded-lg px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                />
                <Button variant="gold" size="icon" className="shrink-0"><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
