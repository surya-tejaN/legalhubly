import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star, MapPin, Clock, Shield, Calendar, ArrowUpDown,
  Briefcase, ChevronDown, Scale, ArrowLeft, ArrowRight,
  User, Building2, Award, Search, Info, Video, Phone, Heart,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

interface City {
  id: string;
  name: string;
  state: string;
  slug: string;
}

interface PracticeArea {
  id: string;
  name: string;
  slug: string;
}

interface Lawyer {
  id: string;
  name: string;
  firm: string;
  avatar_initials: string;
  verified: boolean;
  practice_areas: string[];
  experience_years: number;
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
  profile_photo?: string | null;
}

type SortKey = "rating" | "review_count" | "experience" | "completeness";

const SORT_OPTIONS: { value: SortKey; label: string; icon: typeof Star }[] = [
  { value: "rating", label: "Rating", icon: Star },
  { value: "review_count", label: "Reviews", icon: Award },
  { value: "experience", label: "Experience", icon: Briefcase },
  { value: "completeness", label: "Profile", icon: User },
];

function getProfileCompleteness(l: Lawyer): number {
  let score = 0;
  if (l.name) score += 15;
  if (l.firm) score += 10;
  if (l.bio) score += 15;
  if (l.city) score += 10;
  if (l.practice_areas?.length) score += 15;
  if (l.experience_years > 0) score += 10;
  if (l.rating > 0) score += 10;
  if (l.consultation_fee !== null) score += 5;
  if (l.hourly_rate !== null) score += 5;
  if (l.review_count > 0) score += 5;
  return score;
}

function getConsultIcon(type: string) {
  if (type === "video") return Video;
  if (type === "phone") return Phone;
  return Building2;
}

// ─── Step 1: City Selection ──────────────────────────────────────────────────

function CityStep({ cities, loading, onSelect }: { cities: City[]; loading: boolean; onSelect: (c: City) => void }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search.trim()) return cities;
    const q = search.toLowerCase();
    return cities.filter((c) => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q));
  }, [cities, search]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-accent/10 mb-4">
          <MapPin className="h-7 w-7 text-accent" />
        </div>
        <h2 className="text-2xl md:text-3xl font-serif text-foreground">Where do you need a lawyer?</h2>
        <p className="text-muted-foreground mt-2">Select your city to find local attorneys</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 bg-card border border-border/60 rounded-xl px-4 py-2.5 focus-within:border-accent/30 focus-within:ring-2 focus-within:ring-accent/10 transition-all">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cities..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {filtered.map((city) => (
            <motion.button
              key={city.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(city)}
              className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border border-border/60 bg-card hover:border-accent/30 hover:bg-accent/5 transition-all group"
            >
              <MapPin className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
              <span className="text-sm font-medium text-foreground">{city.name}</span>
              <span className="text-[11px] text-muted-foreground">{city.state}</span>
            </motion.button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground text-sm">No cities match your search</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Practice Area Selection ─────────────────────────────────────────

function PracticeAreaStep({ areas, loading, city, onSelect, onBack }: {
  areas: PracticeArea[];
  loading: boolean;
  city: City;
  onSelect: (pa: PracticeArea) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-accent/10 mb-4">
          <Briefcase className="h-7 w-7 text-accent" />
        </div>
        <h2 className="text-2xl md:text-3xl font-serif text-foreground">What type of legal help?</h2>
        <p className="text-muted-foreground mt-2">
          Lawyers in <span className="font-medium text-foreground">{city.name}, {city.state}</span>
        </p>
      </div>

      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto">
        <ArrowLeft className="h-4 w-4" /> Change city
      </button>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {areas.map((pa) => (
            <motion.button
              key={pa.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(pa)}
              className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card hover:border-accent/30 hover:bg-accent/5 transition-all text-left group"
            >
              <Scale className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
              <span className="text-sm font-medium text-foreground">{pa.name}</span>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Lawyer Results ──────────────────────────────────────────────────

function LawyerCard({ lawyer, index, savedIds, onToggleSave }: { lawyer: Lawyer; index: number; savedIds: Set<string>; onToggleSave: (id: string) => void }) {
  const isSaved = savedIds.has(lawyer.id);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="rounded-2xl bg-card border border-border/60 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
    >
      <div className="p-5 md:p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Photo / avatar */}
          <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-2 shrink-0">
            <div className="relative">
              {lawyer.profile_photo ? (
                <img src={lawyer.profile_photo} alt={lawyer.name} className="h-20 w-20 rounded-2xl object-cover border border-border/30" />
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center text-accent text-2xl font-bold font-serif border border-accent/10">
                  {lawyer.avatar_initials}
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[2.5px] border-card ${
                lawyer.availability_status === "available" ? "bg-success" : lawyer.availability_status === "busy" ? "bg-warning" : "bg-muted-foreground"
              }`} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2.5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link to={`/client/lawyer/${lawyer.id}`} className="text-lg font-semibold text-foreground hover:text-accent transition-colors">
                  {lawyer.name}
                </Link>
                {lawyer.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-success/10 text-success px-2 py-0.5 rounded-full border border-success/20">
                    <Shield className="h-3 w-3" /> Verified
                  </span>
                )}
                <button
                  onClick={() => onToggleSave(lawyer.id)}
                  className="ml-auto sm:ml-0"
                  title={isSaved ? "Remove from saved" : "Save lawyer"}
                >
                  <Heart className={`h-5 w-5 transition-colors ${isSaved ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-destructive"}`} />
                </button>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> {lawyer.firm}
              </div>
            </div>

            {/* Key stats */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{lawyer.experience_years}</span> yrs exp
              </span>
              <span className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(lawyer.rating) ? "text-accent fill-accent" : "text-border"}`} />
                  ))}
                </div>
                <span className="font-semibold text-foreground">{lawyer.rating}</span>
                <span className="text-muted-foreground">({lawyer.review_count})</span>
              </span>
            </div>

            {/* Practice areas */}
            <div className="flex flex-wrap gap-1.5">
              {(lawyer.practice_areas || []).slice(0, 3).map((pa) => (
                <Badge key={pa} variant="secondary" className="text-[11px] px-2 py-0.5 font-medium rounded-lg">{pa}</Badge>
              ))}
              {(lawyer.practice_areas || []).length > 3 && (
                <Badge variant="outline" className="text-[11px] px-2 py-0.5 rounded-lg">+{lawyer.practice_areas.length - 3}</Badge>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0">
            <div className="text-right">
              <div className="text-xl font-serif text-foreground">
                {lawyer.consultation_fee ? `$${lawyer.consultation_fee}` : "Free"}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {lawyer.consultation_fee ? "consultation" : "free consult"}
              </div>
            </div>
            <Button variant="gold" size="default" asChild>
              <Link to={`/client/lawyer/${lawyer.id}`}>
                <Calendar className="mr-2 h-4 w-4" /> Book Consultation
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LawyerResults({ lawyers, loading, city, practiceArea, sortBy, onSortChange, onBack, savedIds, onToggleSave }: {
  lawyers: Lawyer[];
  loading: boolean;
  city: City;
  practiceArea: PracticeArea;
  sortBy: SortKey;
  onSortChange: (s: SortKey) => void;
  onBack: () => void;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
}) {
  const sorted = useMemo(() => {
    const arr = [...lawyers];
    switch (sortBy) {
      case "rating": arr.sort((a, b) => b.rating - a.rating); break;
      case "review_count": arr.sort((a, b) => b.review_count - a.review_count); break;
      case "experience": arr.sort((a, b) => b.experience_years - a.experience_years); break;
      case "completeness": arr.sort((a, b) => getProfileCompleteness(b) - getProfileCompleteness(a)); break;
    }
    return arr;
  }, [lawyers, sortBy]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <button onClick={onBack} className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <span>·</span>
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{city.name}, {city.state}</span>
        <span>·</span>
        <span className="flex items-center gap-1 font-medium text-foreground"><Scale className="h-3.5 w-3.5" />{practiceArea.name}</span>
      </div>

      <div>
        <h2 className="text-2xl md:text-3xl font-serif text-foreground">
          {practiceArea.name} Lawyers in {city.name}
        </h2>
        <p className="text-muted-foreground mt-1">
          {loading ? "Searching..." : `${sorted.length} lawyer${sorted.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-muted-foreground font-medium shrink-0 flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5" /> Sort:
        </span>
        {SORT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                sortBy === opt.value
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-accent/20"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {opt.label}
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-card border shadow-card p-6 animate-pulse">
              <div className="flex gap-5">
                <div className="h-20 w-20 rounded-2xl bg-muted shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-48 bg-muted rounded-lg" />
                  <div className="h-4 w-32 bg-muted rounded-lg" />
                  <div className="h-4 w-64 bg-muted rounded-lg" />
                </div>
              </div>
            </div>
          ))
        ) : sorted.length > 0 ? (
          sorted.map((lawyer, i) => <LawyerCard key={lawyer.id} lawyer={lawyer} index={i} savedIds={savedIds} onToggleSave={onToggleSave} />)
        ) : (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Search className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <h3 className="font-serif text-xl text-foreground mb-2">No lawyers found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              No {practiceArea.name.toLowerCase()} lawyers are listed in {city.name} yet. Check back soon!
            </p>
          </div>
        )}
      </div>

      {sorted.length > 0 && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/60" />
          <span>Results are sorted by {SORT_OPTIONS.find(o => o.value === sortBy)?.label.toLowerCase()}. Always verify credentials during your consultation.</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FindLawyers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cities, setCities] = useState<City[]>([]);
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedArea, setSelectedArea] = useState<PracticeArea | null>(null);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [loadingLawyers, setLoadingLawyers] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("rating");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const urlApplied = useRef(false);

  // Load saved lawyer IDs
  useEffect(() => {
    if (!user) return;
    supabase.from("saved_lawyers").select("lawyer_id").eq("user_id", user.id).then(({ data }) => {
      setSavedIds(new Set((data || []).map((d: any) => d.lawyer_id)));
    });
  }, [user]);

  const toggleSave = async (lawyerId: string) => {
    if (!user) { toast.error("Please sign in to save lawyers"); return; }
    const isSaved = savedIds.has(lawyerId);
    if (isSaved) {
      await supabase.from("saved_lawyers").delete().eq("user_id", user.id).eq("lawyer_id", lawyerId);
      setSavedIds((prev) => { const next = new Set(prev); next.delete(lawyerId); return next; });
      toast.success("Removed from saved");
    } else {
      await supabase.from("saved_lawyers").insert({ user_id: user.id, lawyer_id: lawyerId });
      setSavedIds((prev) => new Set(prev).add(lawyerId));
      toast.success("Lawyer saved!");
    }
    // Invalidate dashboard saved lawyers count
    queryClient.invalidateQueries({ queryKey: ["saved-lawyers"] });
  };

  // Fetch cities
  useEffect(() => {
    supabase.from("cities").select("*").order("name").then(({ data }) => {
      setCities((data as City[]) || []);
      setLoadingCities(false);
    });
  }, []);

  // Fetch practice areas
  useEffect(() => {
    supabase.from("practice_areas").select("*").order("name").then(({ data }) => {
      setPracticeAreas((data as PracticeArea[]) || []);
      setLoadingAreas(false);
    });
  }, []);

  // Apply URL parameters to skip steps
  useEffect(() => {
    if (urlApplied.current) return;
    const urlLocation = searchParams.get("location");
    const urlCategory = searchParams.get("category");
    if (!urlLocation && !urlCategory) return;
    if (cities.length === 0 || practiceAreas.length === 0) return;

    const matchedCity = cities.find(
      (c) => `${c.name}, ${c.state}` === urlLocation || c.name.toLowerCase() === urlLocation?.toLowerCase()
    );
    const matchedArea = practiceAreas.find(
      (pa) => pa.name === urlCategory || pa.slug === urlCategory?.toLowerCase()
    );

    if (matchedCity && matchedArea) {
      setSelectedCity(matchedCity);
      setSelectedArea(matchedArea);
      setStep(3);
      urlApplied.current = true;
    } else if (matchedCity) {
      setSelectedCity(matchedCity);
      setStep(2);
      urlApplied.current = true;
    }
  }, [searchParams, cities, practiceAreas]);


  useEffect(() => {
    if (!selectedCity || !selectedArea) return;
    setLoadingLawyers(true);
    supabase
      .from("lawyers")
      .select("*")
      .eq("city", selectedCity.name)
      .contains("practice_areas", [selectedArea.name])
      .then(({ data }) => {
        setLawyers(
          ((data as any[]) || []).map((l) => ({
            ...l,
            practice_areas: l.practice_areas || [],
            languages: l.languages || [],
            consultation_types: l.consultation_types || [],
          }))
        );
        setLoadingLawyers(false);
      });
  }, [selectedCity, selectedArea]);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setStep(2);
  };

  const handleAreaSelect = (area: PracticeArea) => {
    setSelectedArea(area);
    setStep(3);
  };

  // Progress indicator
  const steps = [
    { num: 1, label: "City" },
    { num: 2, label: "Practice Area" },
    { num: 3, label: "Results" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-nav border-b border-border/50">
        <div className="container flex items-center gap-3 h-16">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-accent" />
            <span className="font-serif text-base text-foreground hidden sm:inline">Legalhubly</span>
          </Link>
          <div className="flex-1" />
          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-1.5">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= s.num ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {s.num}
                </div>
                <span className="text-xs text-muted-foreground hidden sm:inline">{s.label}</span>
                {i < steps.length - 1 && <ArrowRight className="h-3 w-3 text-border mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="container py-8 md:py-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <CityStep cities={cities} loading={loadingCities} onSelect={handleCitySelect} />
            </motion.div>
          )}
          {step === 2 && selectedCity && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <PracticeAreaStep areas={practiceAreas} loading={loadingAreas} city={selectedCity} onSelect={handleAreaSelect} onBack={() => setStep(1)} />
            </motion.div>
          )}
          {step === 3 && selectedCity && selectedArea && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <LawyerResults
                lawyers={lawyers}
                loading={loadingLawyers}
                city={selectedCity}
                practiceArea={selectedArea}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onBack={() => setStep(2)}
                savedIds={savedIds}
                onToggleSave={toggleSave}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
