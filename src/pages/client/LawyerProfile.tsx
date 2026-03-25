import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star, MapPin, Clock, Shield, Calendar, Phone, Video, Building2,
  ArrowLeft, Globe, Briefcase, BookOpen, MessageSquare, Heart,
  ChevronRight, Award, Users, Scale, GraduationCap, Languages,
  CheckCircle2, Timer, Loader2, ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ConsultationBooking from "@/components/ConsultationBooking";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Lawyer {
  id: string;
  name: string;
  firm: string;
  avatar_initials: string;
  verified: boolean;
  practice_areas: string[];
  experience_years: number;
  jurisdictions: string[];
  city: string | null;
  state: string | null;
  languages: string[];
  consultation_fee: number | null;
  hourly_rate: number | null;
  consultation_types: string[];
  avg_response_hours: number;
  availability_status: string;
  rating: number;
  review_count: number;
  review_summary: string | null;
  bio: string | null;
  specialization_tags: string[];
  email: string | null;
  phone: string | null;
  next_available_date: string | null;
}

// ─── Mock data for sections not in DB ───────────────────────────────────────

const mockEducation = [
  { degree: "Juris Doctor (J.D.)", school: "Harvard Law School", year: "2008" },
  { degree: "B.A. in Political Science", school: "Yale University", year: "2005" },
];

const mockReviews = [
  { name: "Sarah M.", rating: 5, date: "2 weeks ago", text: "Incredibly knowledgeable and responsive. Made a complex immigration case feel manageable. Highly recommend!" },
  { name: "James T.", rating: 5, date: "1 month ago", text: "Professional, thorough, and genuinely cared about the outcome. Kept me informed throughout the entire process." },
  { name: "Maria L.", rating: 4, date: "2 months ago", text: "Great experience overall. Very responsive to emails and explained everything clearly. Would use again." },
  { name: "David K.", rating: 5, date: "3 months ago", text: "Outstanding legal representation. Won my case and exceeded all expectations. Worth every penny." },
];

const mockAchievements = [
  "Super Lawyers® Rising Star 2023",
  "ABA Pro Bono Service Award",
  "Martindale-Hubbell AV Preeminent",
  "Top 40 Under 40 – National Trial Lawyers",
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

function stagger(i: number) {
  return { ...fadeUp, transition: { ...fadeUp.transition, delay: i * 0.08 } };
}

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

function getAvailabilityDays() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      date: d,
      available: d.getDay() !== 0 && d.getDay() !== 6 && Math.random() > 0.3,
    });
  }
  return days;
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn("h-4 w-4", s <= Math.round(rating) ? "fill-accent text-accent" : "text-border")} />
      ))}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function LawyerProfile() {
  const { lawyerId } = useParams();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const availabilityDays = getAvailabilityDays();

  useEffect(() => {
    if (!lawyerId) return;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("lawyers")
          .select("*")
          .eq("id", lawyerId)
          .maybeSingle();
        if (error) {
          console.error(error);
          toast.error("Failed to load lawyer profile");
        } else {
          setLawyer(data as Lawyer | null);
        }
      } catch (err) {
        console.error("Unexpected error loading lawyer:", err);
        toast.error("Something went wrong loading this profile");
      }
      setLoading(false);
    })();
  }, [lawyerId]);

  useEffect(() => {
    if (!lawyerId) return;
    (async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;
      const { data } = await supabase
        .from("saved_lawyers")
        .select("id")
        .eq("lawyer_id", lawyerId)
        .eq("user_id", userId);
      if (data && data.length > 0) setSaved(true);
    })();
  }, [lawyerId]);

  const handleSave = async () => {
    if (!lawyerId) return;
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) { toast.error("Please sign in to save lawyers"); return; }

    if (saved) {
      await supabase.from("saved_lawyers").delete().eq("lawyer_id", lawyerId).eq("user_id", userId);
      setSaved(false);
      toast.success("Lawyer removed from saved");
    } else {
      await supabase.from("saved_lawyers").insert({ lawyer_id: lawyerId, user_id: userId });
      setSaved(true);
      toast.success("Lawyer saved!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Lawyer not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const location = [lawyer.city, lawyer.state].filter(Boolean).join(", ");
  const responseLabel = lawyer.avg_response_hours < 1 ? "< 1 hour" : lawyer.avg_response_hours < 24 ? `${Math.round(lawyer.avg_response_hours)} hours` : `${Math.round(lawyer.avg_response_hours / 24)} days`;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "experience", label: "Experience" },
    { id: "reviews", label: "Reviews" },
    { id: "availability", label: "Availability" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Navigation ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 glass-nav border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to results
          </button>
          <Link to="/" className="font-serif text-lg text-foreground">
            Legalhubly
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <motion.section {...fadeUp} className="hero-gradient text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="h-28 w-28 md:h-32 md:w-32 rounded-2xl bg-accent/20 border-2 border-accent/30 flex items-center justify-center shrink-0">
              <span className="text-3xl md:text-4xl font-bold text-accent">{lawyer.avatar_initials}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-serif">{lawyer.name}</h1>
                {lawyer.verified && (
                  <Badge className="bg-accent/20 text-accent border-accent/30 gap-1">
                    <Shield className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
              <p className="text-primary-foreground/70 mb-3">{lawyer.firm}</p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-primary-foreground/60">
                {location && (
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {location}</span>
                )}
                <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {lawyer.experience_years} years</span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {lawyer.rating.toFixed(1)} ({lawyer.review_count} reviews)
                </span>
                <span className="flex items-center gap-1.5"><Timer className="h-3.5 w-3.5" /> Responds in {responseLabel}</span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <Button variant="gold" size="lg" onClick={() => setShowBooking(true)} className="gap-2">
                  <Calendar className="h-4 w-4" /> Book Consultation
                </Button>
                <Button variant="outline" size="lg" className="gap-2 border-white/40 text-white hover:bg-white/15 hover:text-white hover:border-white/60">
                  <MessageSquare className="h-4 w-4" /> Send Message
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSave}
                  className={cn(
                    "gap-2 border-white/40 hover:bg-white/15 hover:border-white/60",
                    saved ? "text-accent border-accent/40 hover:text-accent" : "text-white hover:text-white"
                  )}
                >
                  <Heart className={cn("h-4 w-4", saved && "fill-accent")} />
                  {saved ? "Saved" : "Save"}
                </Button>
              </div>
            </div>

            {/* Quick stats card */}
            <div className="hidden lg:block rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 p-5 min-w-[220px]">
              <p className="text-xs text-primary-foreground/50 uppercase tracking-wider mb-3">Consultation</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-foreground/70">Fee</span>
                  <span className="text-sm font-semibold">
                    {lawyer.consultation_fee ? `$${lawyer.consultation_fee}` : "Free"}
                    <span className="ml-1 text-[10px] font-bold bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">MVP FREE</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-foreground/70">Hourly</span>
                  <span className="text-sm font-semibold">{lawyer.hourly_rate ? `$${lawyer.hourly_rate}/hr` : "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-foreground/70">Types</span>
                  <div className="flex gap-1.5">
                    {(lawyer.consultation_types || []).map((t) => (
                      <span key={t} className="text-primary-foreground/60">{typeIcons[t]}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-foreground/70">Status</span>
                  <Badge className={cn(
                    "text-[10px] border-0",
                    lawyer.availability_status === "available" ? "bg-success/20 text-success" : "bg-muted/20 text-muted-foreground"
                  )}>
                    {lawyer.availability_status === "available" ? "Available Now" : "Busy"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Tab Navigation ─────────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-background border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            {activeTab === "overview" && (
              <motion.div {...fadeUp} className="space-y-8">
                {/* About */}
                <section className="rounded-2xl border bg-card p-6 shadow-card">
                  <h2 className="font-serif text-xl text-foreground mb-4">About {lawyer.name}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {lawyer.bio || `${lawyer.name} is an experienced attorney at ${lawyer.firm} with ${lawyer.experience_years} years of practice. They specialize in ${(lawyer.practice_areas || []).slice(0, 3).join(", ")} and are committed to providing exceptional legal representation to their clients.`}
                  </p>
                </section>

                {/* Practice Areas */}
                <section className="rounded-2xl border bg-card p-6 shadow-card">
                  <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
                    <Scale className="h-5 w-5 text-accent" /> Practice Areas
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(lawyer.practice_areas || []).map((area) => (
                      <Badge key={area} variant="secondary" className="px-3 py-1.5 text-sm rounded-lg">
                        {area}
                      </Badge>
                    ))}
                  </div>
                  {(lawyer.specialization_tags || []).length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Specializations</p>
                      <div className="flex flex-wrap gap-2">
                        {(lawyer.specialization_tags || []).map((tag) => (
                          <Badge key={tag} className="bg-accent/10 text-accent border-accent/20 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* Languages */}
                <section className="rounded-2xl border bg-card p-6 shadow-card">
                  <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-accent" /> Languages
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {(lawyer.languages || []).map((lang) => (
                      <div key={lang} className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2.5">
                        <Languages className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{lang}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Jurisdictions */}
                {(lawyer.jurisdictions || []).length > 0 && (
                  <section className="rounded-2xl border bg-card p-6 shadow-card">
                    <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-accent" /> Jurisdictions
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {(lawyer.jurisdictions || []).map((j) => (
                        <Badge key={j} variant="outline" className="px-3 py-1.5 text-sm">
                          {j}
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}
              </motion.div>
            )}

            {/* Experience */}
            {activeTab === "experience" && (
              <motion.div {...fadeUp} className="space-y-8">
                {/* Education */}
                <section className="rounded-2xl border bg-card p-6 shadow-card">
                  <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-accent" /> Education
                  </h2>
                  <div className="space-y-4">
                    {mockEducation.map((edu, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                          <BookOpen className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{edu.degree}</p>
                          <p className="text-sm text-muted-foreground">{edu.school} · {edu.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Achievements */}
                <section className="rounded-2xl border bg-card p-6 shadow-card">
                  <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-accent" /> Awards & Recognition
                  </h2>
                  <div className="space-y-3">
                    {mockAchievements.map((a, i) => (
                      <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-3">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                        <span className="text-sm text-foreground">{a}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Experience summary */}
                <section className="rounded-2xl border bg-card p-6 shadow-card">
                  <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-accent" /> Professional Summary
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Years of Practice", value: `${lawyer.experience_years}+` },
                      { label: "Cases Handled", value: `${Math.floor(lawyer.experience_years * 40)}+` },
                      { label: "Client Rating", value: `${lawyer.rating.toFixed(1)}/5` },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-4 bg-muted/50 rounded-xl">
                        <p className="text-2xl font-bold text-foreground font-serif">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {/* Reviews */}
            {activeTab === "reviews" && (
              <motion.div {...fadeUp} className="space-y-6">
                {/* Rating summary */}
                <section className="rounded-2xl border bg-card p-6 shadow-card">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-foreground font-serif">{lawyer.rating.toFixed(1)}</p>
                      <div className="mt-1">{renderStars(lawyer.rating)}</div>
                      <p className="text-xs text-muted-foreground mt-1">{lawyer.review_count} reviews</p>
                    </div>
                    {lawyer.review_summary && (
                      <div className="flex-1 border-l pl-6">
                        <p className="text-sm text-muted-foreground italic">"{lawyer.review_summary}"</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Individual reviews */}
                {mockReviews.map((review, i) => (
                  <motion.section key={i} {...stagger(i)} className="rounded-2xl border bg-card p-6 shadow-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-accent">{review.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{review.name}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                  </motion.section>
                ))}
              </motion.div>
            )}

            {/* Availability */}
            {activeTab === "availability" && (
              <motion.div {...fadeUp} className="space-y-8">
                <section className="rounded-2xl border bg-card p-6 shadow-card">
                  <h2 className="font-serif text-xl text-foreground mb-2">Availability</h2>
                  <p className="text-sm text-muted-foreground mb-6">Select a date to book a consultation</p>

                  <div className="grid grid-cols-7 gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <div key={d} className="text-center text-xs text-muted-foreground font-medium py-2">{d}</div>
                    ))}
                    {/* Offset for first day */}
                    {Array.from({ length: (availabilityDays[0].date.getDay() + 6) % 7 }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {availabilityDays.map((day, i) => (
                      <button
                        key={i}
                        disabled={!day.available}
                        onClick={() => {
                          setShowBooking(true);
                        }}
                        className={cn(
                          "aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all",
                          day.available
                            ? "bg-accent/10 text-foreground hover:bg-accent/20 hover:shadow-sm cursor-pointer"
                            : "bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                        )}
                      >
                        <span className="font-semibold">{day.date.getDate()}</span>
                        <span className="text-[9px]">{day.date.toLocaleDateString("en-US", { month: "short" })}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Consultation types */}
                <section className="rounded-2xl border bg-card p-6 shadow-card">
                  <h2 className="font-serif text-xl text-foreground mb-4">Consultation Options</h2>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {lawyer.consultation_types.map((type) => (
                      <button
                        key={type}
                        onClick={() => setShowBooking(true)}
                        className="flex items-center gap-3 p-4 rounded-xl border bg-muted/30 hover:border-accent/30 hover:bg-accent/5 transition-all group"
                      >
                        <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
                          {typeIcons[type]}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-foreground">{typeLabels[type]}</p>
                          <p className="text-xs text-muted-foreground">30 min · Free (MVP)</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* CTA Card */}
            <div className="rounded-2xl border bg-card p-6 shadow-card sticky top-36">
              <p className="font-serif text-lg text-foreground mb-1">Book a Consultation</p>
              <p className="text-xs text-muted-foreground mb-5">Free during MVP · 30 min</p>

              <Button variant="gold" className="w-full mb-3 gap-2" onClick={() => setShowBooking(true)}>
                <Calendar className="h-4 w-4" /> Book Now
              </Button>
              <Button variant="outline" className="w-full mb-3 gap-2">
                <MessageSquare className="h-4 w-4" /> Send Message
              </Button>
              <Button variant="ghost" className="w-full gap-2" onClick={handleSave}>
                <Heart className={cn("h-4 w-4", saved && "fill-accent text-accent")} />
                {saved ? "Saved" : "Save Lawyer"}
              </Button>

              <div className="mt-5 pt-5 border-t space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Response Time</span>
                  <span className="font-medium text-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-accent" /> {responseLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium text-foreground">{lawyer.experience_years} years</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-medium text-foreground flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {lawyer.rating.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Hourly Rate</span>
                  <span className="font-medium text-foreground">{lawyer.hourly_rate ? `$${lawyer.hourly_rate}` : "Contact"}</span>
                </div>
              </div>

              {/* Contact */}
              {(lawyer.phone || lawyer.email) && (
                <div className="mt-5 pt-5 border-t space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Contact</p>
                  {lawyer.phone && (
                    <p className="text-sm text-foreground flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {lawyer.phone}
                    </p>
                  )}
                  {lawyer.email && (
                    <p className="text-sm text-foreground flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" /> {lawyer.email}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Booking Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <ConsultationBooking
            lawyerName={lawyer.name}
            lawyerId={lawyer.id}
            consultationTypes={lawyer.consultation_types}
            consultationFee={lawyer.consultation_fee}
            onClose={() => setShowBooking(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
