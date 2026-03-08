import { useState } from "react";
import { Bell, X, CheckCircle2, Calendar, FileText, MessageSquare, Scale, CreditCard, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "case" | "message" | "document" | "appointment" | "payment" | "task" | "ai";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: "1", type: "message", title: "New message from Sarah Chen", description: "I've reviewed your termination letter and found several important points...", time: "10 min ago", read: false },
  { id: "2", type: "appointment", title: "Consultation tomorrow", description: "Video call with Sarah Chen at 10:00 AM", time: "1 hour ago", read: false },
  { id: "3", type: "task", title: "Task assigned: Upload pay stubs", description: "Sarah Chen assigned you a task for your Employment Dispute case", time: "3 hours ago", read: false },
  { id: "4", type: "document", title: "Document ready for review", description: "Response Draft v2 has been uploaded by Sarah Chen", time: "5 hours ago", read: true },
  { id: "5", type: "case", title: "Case status updated", description: "Employment Dispute moved to Active status", time: "1 day ago", read: true },
  { id: "6", type: "payment", title: "Invoice received", description: "INV-003 for $700.00 — Response Drafting", time: "1 day ago", read: true },
  { id: "7", type: "ai", title: "AI case summary ready", description: "Your intake summary has been processed and matched with lawyers", time: "2 days ago", read: true },
];

const iconMap = {
  case: <Scale className="h-4 w-4" />,
  message: <MessageSquare className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  appointment: <Calendar className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
  task: <CheckCircle2 className="h-4 w-4" />,
  ai: <Bot className="h-4 w-4" />,
};

const colorMap = {
  case: "bg-accent/10 text-accent",
  message: "bg-info/10 text-info",
  document: "bg-warning/10 text-warning",
  appointment: "bg-success/10 text-success",
  payment: "bg-destructive/10 text-destructive",
  task: "bg-accent/10 text-accent",
  ai: "bg-accent/10 text-accent",
};

export default function NotificationsCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(!open)}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              className="absolute right-0 top-full mt-2 z-50 w-[380px] max-h-[480px] rounded-xl bg-card border shadow-card-hover overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-accent hover:underline font-medium">
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[400px] divide-y">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "w-full text-left p-3.5 hover:bg-muted/30 transition-colors flex items-start gap-3",
                      !n.read && "bg-accent/[0.03]"
                    )}
                  >
                    <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5", colorMap[n.type])}>
                      {iconMap[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-medium", n.read ? "text-muted-foreground" : "text-foreground")}>{n.title}</span>
                        {!n.read && <span className="h-2 w-2 rounded-full bg-accent shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                      <span className="text-[10px] text-muted-foreground/70 mt-1 block">{n.time}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
