import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Lock, Phone, Video, Search, X, MessageSquare, Loader2, Paperclip } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import ClientSupportChat from "@/components/ClientSupportChat";

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
}

interface ConvoWithMeta {
  conversation: Conversation;
  lastMessage?: string;
  lastTime?: string;
}

export default function ClientMessages() {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const urlConvoId = searchParams.get("conversationId");
  const [convos, setConvos] = useState<ConvoWithMeta[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const [searchConvo, setSearchConvo] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("conversation_participants")
        .select("conversation_id, conversations(*)")
        .eq("user_id", user.id);
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
      const items: ConvoWithMeta[] = (data || [])
        .filter((d: any) => d.conversations)
        .map((d: any) => ({ conversation: d.conversations }));
      setConvos(items);
      // Auto-select from URL param or first
      const target = urlConvoId && items.find((i) => i.conversation.id === urlConvoId);
      if (target) {
        setSelectedId(target.conversation.id);
        setShowMobileList(false);
      } else if (items.length > 0) {
        setSelectedId(items[0].conversation.id);
      }
      setLoading(false);
    })();
  }, [user, urlConvoId]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedId)
        .order("created_at", { ascending: true });
      setMessages((data as Message[]) || []);
    })();

    // Realtime subscription
    const channel = supabase
      .channel(`messages:${selectedId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${selectedId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedId || !user) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedId,
      sender_user_id: user.id,
      body: newMessage.trim(),
    });
    if (error) {
      toast.error("Failed to send message");
      console.error(error);
    }
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

  if (loading) {
    return (
      <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName={profile?.full_name || "User"} userRole="Client">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  if (convos.length === 0) {
    return (
      <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName={profile?.full_name || "User"} userRole="Client">
        <SectionHeader title="Secure Messages" subtitle="Private communication with your legal team" />
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-success/5 border border-success/20 mb-4 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-success shrink-0" />
          Messages are encrypted in transit and at rest, visible only to you and your assigned lawyers
        </div>
        <div className="text-center py-20 rounded-xl bg-card border">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-serif text-lg text-foreground mb-2">No conversations yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Contact a lawyer to start a conversation. Messages will appear here.
          </p>
        </div>
        <ClientSupportChat />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName={profile?.full_name || "User"} userRole="Client">
      <SectionHeader title="Secure Messages" subtitle="Private communication with your legal team" />

      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-success/5 border border-success/20 mb-4 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5 text-success shrink-0" />
        Messages are encrypted in transit and at rest, visible only to you and your assigned lawyers
      </div>

      <div className="rounded-xl bg-card border shadow-card overflow-hidden" style={{ height: "calc(100vh - 300px)" }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className={cn("w-full md:w-80 border-r flex flex-col shrink-0", !showMobileList && "hidden md:flex")}>
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
              {convos.map((c) => (
                <button
                  key={c.conversation.id}
                  onClick={() => { setSelectedId(c.conversation.id); setShowMobileList(false); }}
                  className={cn(
                    "w-full text-left p-3.5 border-b transition-colors",
                    selectedId === c.conversation.id ? "bg-accent/5" : "hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm text-foreground">Conversation</span>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(c.conversation.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={cn("flex-1 flex flex-col", showMobileList && "hidden md:flex")}>
            <div className="p-4 border-b flex items-center gap-3">
              <button className="md:hidden text-muted-foreground" onClick={() => setShowMobileList(true)}>←</button>
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-foreground">Conversation</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3 text-success" /> Encrypted
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender_user_id === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex", isMe ? "justify-end" : "justify-start")}
                  >
                    <div className={cn(
                      "max-w-[75%] p-3.5 rounded-xl text-sm",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    )}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                      <div className={cn(
                        "flex items-center gap-1.5 mt-1.5 text-[10px]",
                        isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                      )}>
                        <Lock className="h-2.5 w-2.5" />
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No messages yet. Start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t">
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileAttach}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.xls,.xlsx" />
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a secure message..."
                  className="flex-1 bg-muted rounded-lg px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                  disabled={sending}
                />
                <Button variant="gold" size="icon" className="shrink-0" onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClientSupportChat />
    </DashboardLayout>
  );
}
