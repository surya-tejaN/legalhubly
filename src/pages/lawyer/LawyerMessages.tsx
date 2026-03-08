import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Bot, User, Briefcase } from "lucide-react";

const conversations = [
  { id: 1, name: "Alex Johnson", case: "Employment Dispute", lastMessage: "Thank you for the update on the response letter.", time: "5 min ago", unread: 1, online: true },
  { id: 2, name: "Robert Lee", case: "Real Estate Closing", lastMessage: "When can we schedule the final walkthrough?", time: "1 hour ago", unread: 0, online: false },
  { id: 3, name: "Jennifer Lee", case: "Discrimination Claim", lastMessage: "I found additional evidence to share.", time: "3 hours ago", unread: 3, online: true },
  { id: 4, name: "AI Case Summary", case: "System", lastMessage: "New case summary generated for C-2024-006", time: "4 hours ago", unread: 1, online: true, isAI: true },
];

const messages = [
  { id: 1, sender: "Alex Johnson", isMe: false, content: "Hi Sarah, I wanted to follow up on the response letter. Have you had a chance to finalize it?", time: "2:15 PM" },
  { id: 2, sender: "Me", isMe: true, content: "Hi Alex! Yes, I've completed the draft. I'm sending it over for your review now. The key points are the non-compete challenge and revised severance demand.", time: "2:20 PM" },
  { id: 3, sender: "Alex Johnson", isMe: false, content: "That's great news! I'll review it this evening. One question - should I avoid any contact with my former employer while this is pending?", time: "2:25 PM" },
  { id: 4, sender: "Me", isMe: true, content: "Absolutely. Please do not communicate with them directly about anything related to the termination. All communication should go through me. If they reach out, let me know immediately.", time: "2:28 PM" },
  { id: 5, sender: "Alex Johnson", isMe: false, content: "Understood. Thank you for the update on the response letter. I feel much more confident about this.", time: "2:30 PM" },
];

export default function LawyerMessages() {
  const [activeConvo, setActiveConvo] = useState(1);
  const [newMessage, setNewMessage] = useState("");

  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName="Sarah Chen" userRole="Attorney">
      <SectionHeader title="Messages" subtitle="Client communications" />

      <div className="rounded-xl bg-card border shadow-card overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
        <div className="flex h-full">
          {/* Conversations */}
          <div className="w-80 border-r flex-col shrink-0 hidden md:flex">
            <div className="p-3 border-b">
              <input type="text" placeholder="Search clients..." className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none placeholder:text-muted-foreground" />
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
                        {c.isAI ? <Bot className="h-5 w-5 text-accent" /> : (
                          <span className="text-xs font-bold text-muted-foreground">{c.name.split(" ").map(n => n[0]).join("")}</span>
                        )}
                      </div>
                      {c.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-card" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm text-foreground truncate">{c.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{c.time}</span>
                      </div>
                      <div className="text-[10px] text-accent flex items-center gap-1 mt-0.5"><Briefcase className="h-3 w-3" /> {c.case}</div>
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

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">AJ</span>
              </div>
              <div>
                <div className="font-medium text-sm text-foreground">Alex Johnson</div>
                <div className="text-xs text-muted-foreground">C-2024-001 · Employment Dispute</div>
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
                <Button variant="ghost" size="icon" className="shrink-0"><Bot className="h-4 w-4 text-accent" /></Button>
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
