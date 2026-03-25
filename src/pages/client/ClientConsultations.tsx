import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, Phone, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import ClientSupportChat from "@/components/ClientSupportChat";

function getStatus(scheduledAt: string, status: string) {
  if (status === "cancelled") return { label: "Cancelled", color: "bg-destructive/10 text-destructive" };
  const date = new Date(scheduledAt);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const schedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (schedDay.getTime() === today.getTime()) return { label: "Today", color: "bg-warning/10 text-warning" };
  if (date > now) return { label: "Upcoming", color: "bg-success/10 text-success" };
  return { label: "Completed", color: "bg-info/10 text-info" };
}

function sortConsultations(items: any[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return [...items].sort((a, b) => {
    const da = new Date(a.scheduled_at);
    const db = new Date(b.scheduled_at);
    const dayA = new Date(da.getFullYear(), da.getMonth(), da.getDate());
    const dayB = new Date(db.getFullYear(), db.getMonth(), db.getDate());
    const aToday = dayA.getTime() === today.getTime();
    const bToday = dayB.getTime() === today.getTime();
    if (aToday && !bToday) return -1;
    if (!aToday && bToday) return 1;
    const aFuture = da > now;
    const bFuture = db > now;
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;
    if (aFuture && bFuture) return da.getTime() - db.getTime();
    return db.getTime() - da.getTime();
  });
}

export default function ClientConsultations() {
  const { profile } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("consultations")
        .select("*")
        .order("scheduled_at", { ascending: false });
      setConsultations(sortConsultations((data as any[]) || []));
      setLoading(false);
    })();
  }, []);

  const typeIcon = (type: string) => {
    if (type === "video") return <Video className="h-4 w-4" />;
    if (type === "phone") return <Phone className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  const typeLabel = (type: string) => {
    if (type === "video") return "Video Call";
    if (type === "phone") return "Phone Call";
    return "In Person";
  };

  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName={profile?.full_name || "Client"} userRole="Client">
      <SectionHeader
        title="Consultations"
        subtitle="Your scheduled and past consultations"
        action={
          <Button variant="gold" size="sm" asChild>
            <Link to="/client/find-lawyers">Book New</Link>
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
      ) : consultations.length === 0 ? (
        <div className="text-center py-20 rounded-xl bg-card border">
          <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-serif text-lg text-foreground mb-2">No consultations scheduled</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Book your first consultation with a verified lawyer.
          </p>
          <Button variant="gold" asChild>
            <Link to="/client/find-lawyers">Find a Lawyer</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map((c, i) => {
            const date = new Date(c.scheduled_at);
            const status = getStatus(c.scheduled_at, c.status);
            const isUpcoming = date > new Date() && c.status !== "cancelled";
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 p-5 rounded-xl border bg-card hover:shadow-sm transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  {typeIcon(c.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground">{c.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {c.client_name} · {typeLabel(c.type)} · {c.duration_minutes} min
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} at{" "}
                    {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full", status.color)}>
                    {status.label}
                  </span>
                  {isUpcoming && c.type === "video" && (
                    <Button variant="gold" size="sm" className="text-xs">Join</Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <ClientSupportChat />
    </DashboardLayout>
  );
}
