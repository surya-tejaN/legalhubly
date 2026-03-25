import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Video, Phone, Building2, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BookingProps {
  lawyerName: string;
  lawyerId: string;
  consultationTypes: string[];
  consultationFee: number | null;
  onClose: () => void;
  onBooked?: () => void;
}

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
];

const typeIcons: Record<string, React.ReactNode> = {
  video: <Video className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />,
  "in-person": <Building2 className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  video: "Video Call",
  phone: "Phone Call",
  "in-person": "In Person",
};

// Generate dates for next 2 weeks
function getAvailableDates() {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0 && d.getDay() !== 6) { // Skip weekends
      dates.push(d);
    }
  }
  return dates;
}

export default function ConsultationBooking({ lawyerName, lawyerId, consultationTypes, consultationFee, onClose, onBooked }: BookingProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(consultationTypes[0] || "video");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [clientName, setClientName] = useState(profile?.full_name || "");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const dates = getAvailableDates();

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !clientName.trim()) return;
    setIsSubmitting(true);

    try {
      const scheduledAt = new Date(selectedDate);
      const [time, period] = selectedTime.split(" ");
      const [hours, minutes] = time.split(":");
      let h = parseInt(hours);
      if (period === "PM" && h !== 12) h += 12;
      if (period === "AM" && h === 12) h = 0;
      scheduledAt.setHours(h, parseInt(minutes), 0, 0);

      // Create consultation
      const { error } = await supabase.from("consultations").insert({
        lawyer_id: lawyerId,
        client_name: clientName.trim(),
        title: `Consultation with ${lawyerName}`,
        scheduled_at: scheduledAt.toISOString(),
        type: selectedType,
        notes: notes.trim() || null,
        status: "scheduled",
        duration_minutes: 30,
      });
      if (error) throw error;

      // Create conversation + add participants if user is logged in
      let newConvoId: string | null = null;
      if (user) {
        const { data: convo, error: convoErr } = await supabase
          .from("conversations")
          .insert({})
          .select("id")
          .single();
        if (!convoErr && convo) {
          newConvoId = convo.id;
          await supabase.from("conversation_participants").insert([
            { conversation_id: convo.id, user_id: user.id },
          ]);
          // Send initial message
          await supabase.from("messages").insert({
            conversation_id: convo.id,
            sender_user_id: user.id,
            body: `📅 Consultation booked: ${typeLabels[selectedType]} with ${lawyerName} on ${scheduledAt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at ${selectedTime}.`,
          });
        }
      }

      setConversationId(newConvoId);
      setBooked(true);

      // Send booking confirmation email
      if (user?.email) {
        const bookingId = crypto.randomUUID();
        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "booking-confirmation",
            recipientEmail: user.email,
            idempotencyKey: `booking-confirm-${bookingId}`,
            templateData: {
              clientName: clientName.trim(),
              lawyerName,
              consultationType: typeLabels[selectedType],
              date: selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
              time: selectedTime,
              duration: "30 minutes",
            },
          },
        }).catch(console.error);
      }

      toast.success("Consultation booked! Check your email for confirmation.");
      onBooked?.();
    } catch (e) {
      console.error(e);
      toast.error("Failed to book consultation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (booked) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 px-6">
        <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h3 className="font-serif text-xl text-foreground mb-2">Consultation Booked!</h3>
        <p className="text-sm text-muted-foreground mb-1">
          {typeLabels[selectedType]} with <strong>{lawyerName}</strong>
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at {selectedTime}
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          <span className="inline-flex items-center gap-1 bg-success/10 text-success font-bold px-2 py-0.5 rounded-full text-[10px]">FREE CONSULTATION (MVP)</span>
        </p>
        <div className="flex gap-3 justify-center">
          {conversationId && (
            <Button variant="gold" onClick={() => { onClose(); navigate(`/client/messages?conversationId=${conversationId}`); }}>
              Open Chat
            </Button>
          )}
          <Button variant={conversationId ? "outline" : "gold"} onClick={onClose}>Done</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-serif text-lg text-foreground">Book Consultation</h3>
          <p className="text-xs text-muted-foreground mt-0.5">with {lawyerName}</p>
        </div>
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className={cn(
              "h-2 w-8 rounded-full transition-colors",
              s <= step ? "bg-accent" : "bg-muted"
            )} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-sm font-medium text-foreground mb-3">Consultation Type</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {consultationTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-all",
                    selectedType === type
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/30"
                  )}
                >
                  <div className="flex justify-center mb-2 text-accent">{typeIcons[type]}</div>
                  <div className="text-xs font-medium text-foreground">{typeLabels[type]}</div>
                </button>
              ))}
            </div>

            <p className="text-sm font-medium text-foreground mb-3">Your Name</p>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/30 mb-4"
            />

            <Button variant="gold" className="w-full" disabled={!clientName.trim()} onClick={() => setStep(2)}>
              Choose Date & Time
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3">
              <ArrowLeft className="h-3 w-3" /> Back
            </button>

            <p className="text-sm font-medium text-foreground mb-3">Select Date</p>
            <div className="grid grid-cols-5 gap-2 mb-5">
              {dates.slice(0, 10).map((d) => (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelectedDate(d)}
                  className={cn(
                    "p-2.5 rounded-lg border text-center transition-all",
                    selectedDate?.toDateString() === d.toDateString()
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/30"
                  )}
                >
                  <div className="text-[10px] text-muted-foreground uppercase">
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className="text-sm font-semibold text-foreground">{d.getDate()}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {d.toLocaleDateString("en-US", { month: "short" })}
                  </div>
                </button>
              ))}
            </div>

            {selectedDate && (
              <>
                <p className="text-sm font-medium text-foreground mb-3">Select Time</p>
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={cn(
                        "py-2 px-3 rounded-lg border text-xs font-medium transition-all",
                        selectedTime === slot
                          ? "border-accent bg-accent/5 text-accent"
                          : "border-border text-muted-foreground hover:border-accent/30"
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </>
            )}

            <Button
              variant="gold"
              className="w-full"
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(3)}
            >
              Review Booking
            </Button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setStep(2)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-3 w-3" /> Back
            </button>

            <div className="rounded-xl border bg-muted/30 p-4 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Lawyer</span>
                <span className="text-sm font-medium text-foreground">{lawyerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Type</span>
                <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  {typeIcons[selectedType]} {typeLabels[selectedType]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Date</span>
                <span className="text-sm font-medium text-foreground">
                  {selectedDate?.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Time</span>
                <span className="text-sm font-medium text-foreground">{selectedTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Duration</span>
                <span className="text-sm font-medium text-foreground">30 minutes</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs font-medium text-foreground">Fee</span>
                  <div className="flex items-center gap-2">
                    {consultationFee ? (
                      <span className="text-sm line-through text-muted-foreground">${consultationFee}</span>
                    ) : null}
                    <span className="text-[10px] font-bold bg-success/10 text-success px-2 py-0.5 rounded-full">FREE (MVP)</span>
                  </div>
                </div>
            </div>

            <p className="text-sm font-medium text-foreground mb-2">Notes (optional)</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Anything you'd like the lawyer to know beforehand..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none resize-none placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/30 mb-4"
            />

            <Button variant="gold" className="w-full" onClick={handleBook} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking...</> : "Confirm Booking"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
