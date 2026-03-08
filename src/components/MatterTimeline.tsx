import { CheckCircle2, Circle, Clock, FileText, MessageSquare, Bot, Scale, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "milestone" | "document" | "message" | "ai" | "appointment" | "task";
  completed: boolean;
  current?: boolean;
}

const iconMap = {
  milestone: <Scale className="h-3.5 w-3.5" />,
  document: <FileText className="h-3.5 w-3.5" />,
  message: <MessageSquare className="h-3.5 w-3.5" />,
  ai: <Bot className="h-3.5 w-3.5" />,
  appointment: <Calendar className="h-3.5 w-3.5" />,
  task: <CheckCircle2 className="h-3.5 w-3.5" />,
};

export default function MatterTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="relative">
      {events.map((event, i) => (
        <div key={event.id} className="flex gap-4 pb-6 last:pb-0">
          {/* Vertical line + dot */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors",
                event.completed && "bg-success/10 border-success text-success",
                event.current && "bg-accent/10 border-accent text-accent animate-pulse-gold",
                !event.completed && !event.current && "bg-muted border-border text-muted-foreground"
              )}
            >
              {event.completed ? <CheckCircle2 className="h-4 w-4" /> : iconMap[event.type]}
            </div>
            {i < events.length - 1 && (
              <div className={cn("w-0.5 flex-1 mt-1", event.completed ? "bg-success/30" : "bg-border")} />
            )}
          </div>

          {/* Content */}
          <div className={cn("flex-1 min-w-0 pb-2", event.current && "pt-0.5")}>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-medium",
                event.completed ? "text-foreground" : event.current ? "text-accent" : "text-muted-foreground"
              )}>
                {event.title}
              </span>
              {event.current && (
                <span className="text-[10px] font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded-full">Current</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
            <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-1">
              <Clock className="h-2.5 w-2.5" /> {event.date}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
