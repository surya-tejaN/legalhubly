import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, ChevronLeft, ChevronRight, Clock, Video, Phone, Users, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const typeIcon = (type: string) => {
  if (type === "video") return <Video className="h-3 w-3" />;
  if (type === "phone") return <Phone className="h-3 w-3" />;
  return <Users className="h-3 w-3" />;
};

const typeColor = (type: string) => {
  if (type === "video") return "border-info/30 bg-info/5";
  if (type === "phone") return "border-accent/30 bg-accent/5";
  return "border-success/30 bg-success/5";
};

export default function LawyerCalendar() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [eventForm, setEventForm] = useState({ title: "", client_name: "", scheduled_at: "", type: "video", duration_minutes: 30 });

  const createEvent = async () => {
    if (!eventForm.title.trim() || !eventForm.client_name.trim() || !eventForm.scheduled_at) {
      toast.error("Fill in all required fields"); return;
    }
    const { data, error } = await supabase.from("consultations" as any).insert(eventForm as any).select();
    if (error) { toast.error("Failed to create event"); return; }
    if (data) setConsultations((prev) => [...prev, ...(data as any[])]);
    setEventForm({ title: "", client_name: "", scheduled_at: "", type: "video", duration_minutes: 30 });
    setShowNewEvent(false);
    toast.success("Event created");
  };

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("consultations" as any).select("*").order("scheduled_at");
      setConsultations((data as any[]) || []);
    };
    load();
  }, []);

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1 + weekOffset * 7); // Monday
    d.setHours(0, 0, 0, 0);
    return d;
  }, [weekOffset]);

  const days = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    })
  , [weekStart]);

  const dayEvents = (date: Date) =>
    consultations.filter((c) => {
      const cd = new Date(c.scheduled_at);
      return cd.toDateString() === date.toDateString();
    });

  const formatWeek = () => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 4);
    return `${weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${end.toLocaleDateString("en-US", { day: "numeric", year: "numeric" })}`;
  };

  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();

  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName="Sarah Chen" userRole="Attorney">
      <SectionHeader
        title="Calendar"
        subtitle="Manage your schedule and appointments"
        action={<Button variant="gold" size="sm" onClick={() => setShowNewEvent(true)}><Plus className="mr-2 h-3.5 w-3.5" /> New Event</Button>}
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((w) => w - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-semibold text-foreground">{formatWeek()}</h2>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((w) => w + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>Today</Button>
        </div>
      </div>

      <div className="rounded-xl bg-card border shadow-card overflow-hidden">
        <div className="grid grid-cols-5 border-b">
          {days.map((day) => (
            <div key={day.toISOString()} className={`p-3 text-center border-r last:border-r-0 ${isToday(day) ? "bg-accent/5" : ""}`}>
              <div className="text-xs text-muted-foreground font-medium">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
              <div className={`text-lg font-semibold mt-0.5 ${isToday(day) ? "text-accent" : "text-foreground"}`}>{day.getDate()}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 min-h-[500px]">
          {days.map((day) => (
            <div key={day.toISOString()} className="border-r last:border-r-0 p-2 space-y-2">
              {dayEvents(day).map((event) => (
                <div
                  key={event.id}
                  className={`p-2.5 rounded-lg border transition-colors cursor-pointer hover:shadow-sm ${typeColor(event.type)}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-accent font-semibold">
                    <Clock className="h-3 w-3" />
                    {new Date(event.scheduled_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </div>
                  <div className="text-xs font-medium text-foreground mt-1">{event.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{event.client_name}</div>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                    {typeIcon(event.type)} {event.duration_minutes} min
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showNewEvent} onOpenChange={setShowNewEvent}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Calendar Event</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={eventForm.title} onChange={(e) => setEventForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Initial Consultation" /></div>
            <div><Label>Client Name</Label><Input value={eventForm.client_name} onChange={(e) => setEventForm(f => ({ ...f, client_name: e.target.value }))} placeholder="Client full name" /></div>
            <div><Label>Date & Time</Label><Input type="datetime-local" value={eventForm.scheduled_at} onChange={(e) => setEventForm(f => ({ ...f, scheduled_at: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Type</Label>
                <select value={eventForm.type} onChange={(e) => setEventForm(f => ({ ...f, type: e.target.value }))} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                  <option value="video">Video</option><option value="phone">Phone</option><option value="in-person">In Person</option>
                </select>
              </div>
              <div><Label>Duration (min)</Label><Input type="number" value={eventForm.duration_minutes} onChange={(e) => setEventForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 30 }))} /></div>
            </div>
            <Button variant="gold" className="w-full" onClick={createEvent}>Create Event</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
