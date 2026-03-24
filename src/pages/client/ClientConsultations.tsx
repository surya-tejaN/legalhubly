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
import ClientSupportChat from "@/components/ClientSupportChat";

export default function ClientConsultations() {
  const { user, profile } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("consultations")
        .select("*")
        .order("scheduled_at", { ascending: false });
      setConsultations((data as any[]) || []);
      setLoading(false);
    })();
  }, []);

  const typeIcon = (type: string) => {
    if (type === "video") return <Video className="h-4 w-4" />;
    if (type === "phone") return <Phone className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  const statusColor = (s: string) => {
    if (s === "completed") return "bg-success/10 text-success";
    if (s === "cancelled") return "bg-destructive/10 text-destructive";
    return "bg-accent/10 text-accent";
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
          <h3 className="font-serif text-lg text-foreground mb-2">No consultations yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Book a consultation with a lawyer to get started.
          </p>
          <Button variant="gold" asChild>
            <Link to="/client/find-lawyers">Find a Lawyer</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map((c, i) => {
            const date = new Date(c.scheduled_at);
            const isPast = date < new Date();
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
                    {c.client_name} · {c.type} · {c.duration_minutes} min
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at{" "}
                    {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${statusColor(c.status)}`}>
                  {c.status}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      <ClientSupportChat />
    </DashboardLayout>
  );
}
