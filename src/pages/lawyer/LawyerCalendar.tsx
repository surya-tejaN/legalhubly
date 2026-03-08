import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Clock, Video, Phone, Users } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const hours = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

const events: Record<string, { time: string; title: string; client: string; type: string; duration: string }[]> = {
  Mon: [
    { time: "10:00 AM", title: "Consultation", client: "Alex Johnson", type: "video", duration: "30 min" },
    { time: "2:00 PM", title: "Case Review", client: "Robert Lee", type: "in-person", duration: "1 hr" },
  ],
  Tue: [
    { time: "9:00 AM", title: "Deposition Prep", client: "Jennifer Lee", type: "in-person", duration: "2 hr" },
    { time: "3:00 PM", title: "Follow-up Call", client: "Maria Garcia", type: "phone", duration: "15 min" },
  ],
  Wed: [
    { time: "11:00 AM", title: "Initial Consultation", client: "New Lead", type: "video", duration: "30 min" },
  ],
  Thu: [
    { time: "10:00 AM", title: "Document Review", client: "Susan Park", type: "video", duration: "45 min" },
    { time: "1:00 PM", title: "Settlement Discussion", client: "Tom Wilson", type: "phone", duration: "30 min" },
    { time: "4:00 PM", title: "Team Sync", client: "Internal", type: "in-person", duration: "30 min" },
  ],
  Fri: [
    { time: "9:00 AM", title: "Court Hearing", client: "Alex Johnson", type: "in-person", duration: "3 hr" },
  ],
};

const typeIcon = (type: string) => {
  if (type === "video") return <Video className="h-3 w-3" />;
  if (type === "phone") return <Phone className="h-3 w-3" />;
  return <Users className="h-3 w-3" />;
};

export default function LawyerCalendar() {
  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName="Sarah Chen" userRole="Attorney">
      <SectionHeader
        title="Calendar"
        subtitle="Manage your schedule and appointments"
        action={<Button variant="gold" size="sm"><Plus className="mr-2 h-3.5 w-3.5" /> New Event</Button>}
      />

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
          <h2 className="font-semibold text-foreground">March 10 – 14, 2026</h2>
          <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Today</Button>
          <Button variant="outline" size="sm">Week</Button>
          <Button variant="ghost" size="sm">Month</Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl bg-card border shadow-card overflow-hidden">
        <div className="grid grid-cols-5 border-b">
          {days.map((day, i) => (
            <div key={day} className={`p-3 text-center border-r last:border-r-0 ${i === 0 ? "bg-accent/5" : ""}`}>
              <div className="text-xs text-muted-foreground font-medium">{day}</div>
              <div className={`text-lg font-semibold mt-0.5 ${i === 0 ? "text-accent" : "text-foreground"}`}>{10 + i}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 min-h-[500px]">
          {days.map((day) => (
            <div key={day} className="border-r last:border-r-0 p-2 space-y-2">
              {(events[day] || []).map((event, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-accent/8 border border-accent/15 hover:bg-accent/12 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-accent font-semibold">
                    <Clock className="h-3 w-3" /> {event.time}
                  </div>
                  <div className="text-xs font-medium text-foreground mt-1">{event.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{event.client}</div>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                    {typeIcon(event.type)} {event.duration}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
