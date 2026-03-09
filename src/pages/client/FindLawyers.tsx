import { useState, useEffect, useCallback, useMemo, useTransition } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star, MapPin, Clock, Shield, Filter, Search, Calendar,
  ArrowUpDown, Briefcase, ChevronDown, X, Zap, Scale,
  DollarSign, Timer, Award, Phone, Video, Building2, Info,
  ArrowLeft, Globe, SlidersHorizontal, Languages, User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  complexity_levels: string[];
  budget_ranges: string[];
  match_score: number;
  score_breakdown: Record<string, number>;
  match_explanation?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "best_match", label: "Best Match", icon: Zap },
  { value: "highest_rated", label: "Highest Rating", icon: Star },
  { value: "highest_experience", label: "Most Experience", icon: Award },
  { value: "fastest_response", label: "Fastest Response", icon: Timer },
];

const PRACTICE_AREAS = [
  "All", "Immigration Law", "Family Law", "Criminal Defense", "Personal Injury",
  "Employment Law", "Business Law", "Real Estate Law", "Estate Planning",
  "Civil Litigation", "Bankruptcy Law", "Tax Law", "Intellectual Property",
  "Medical Malpractice", "Consumer Protection", "Traffic Violations",
  "Landlord / Tenant Law", "Education Law", "Environmental Law",
  "Military Law", "International Law",
];

const LANGUAGES = ["All", "English", "Spanish", "Mandarin", "Korean", "Hindi", "French", "Arabic"];

const EXPERIENCE_RANGES = [
  { label: "Any", min: 0 },
  { label: "5+ years", min: 5 },
  { label: "10+ years", min: 10 },
  { label: "20+ years", min: 20 },
];

const PRICE_RANGES = [
  { label: "Any", max: Infinity },
  { label: "Free consult", max: 0 },
  { label: "Under $100", max: 100 },
  { label: "Under $250", max: 250 },
  { label: "Under $500", max: 500 },
];

const RATING_OPTIONS = [
  { label: "Any", min: 0 },
  { label: "4+ stars", min: 4 },
  { label: "4.5+ stars", min: 4.5 },
  { label: "5 stars", min: 5 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatResponseTime(hours: number): string {
  if (hours < 1) return "< 1 hour";
  if (hours <= 2) return `~${hours}hr`;
  if (hours <= 24) return `~${Math.round(hours)}hr`;
  return `${Math.round(hours / 24)} days`;
}

function getAvailabilityInfo(status: string) {
  if (status === "available") return { color: "bg-success", ring: "ring-success/20", label: "Available" };
  if (status === "busy") return { color: "bg-warning", ring: "ring-warning/20", label: "Busy" };
  return { color: "bg-muted-foreground", ring: "ring-muted/20", label: "Unavailable" };
}

function getConsultIcon(type: string) {
  if (type === "video") return Video;
  if (type === "phone") return Phone;
  return Building2;
}

// ─── Filter Dropdown Component ───────────────────────────────────────────────

function FilterDropdown({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: any;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const isActive = value !== options[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm border transition-all duration-200 ${
          isActive
            ? "bg-accent/8 border-accent/25 text-accent font-medium"
            : "bg-card border-border/60 text-muted-foreground hover:border-accent/20 hover:text-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{label}:</span>
        <span className="font-medium text-foreground">{isActive ? value : "Any"}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-1.5 bg-card border rounded-xl shadow-elevated z-30 py-1 min-w-[180px] max-h-64 overflow-y-auto"
            >
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    value === opt ? "bg-accent/8 text-accent font-medium" : "text-foreground hover:bg-muted/60"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Lawyer Card Component ───────────────────────────────────────────────────

function LawyerCard({ lawyer, index, expanded, onToggle }: {
  lawyer: Lawyer;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const avail = getAvailabilityInfo(lawyer.availability_status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="rounded-2xl bg-card border border-border/60 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-5">

          {/* Profile photo / avatar */}
          <div className="flex md:flex-col items-center gap-4 md:gap-2 shrink-0">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center text-accent text-2xl font-bold font-serif border border-accent/10">
                {lawyer.avatar_initials}
              </div>
              <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[2.5px] border-card ${avail.color} ${avail.ring} ring-2`} />
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${
              lawyer.availability_status === "available" ? "text-success" : "text-muted-foreground"
            }`}>
              {avail.label}
            </span>
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Name row */}
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <Link to={`/client/lawyer/${lawyer.id}`} className="text-lg font-semibold text-foreground font-sans hover:text-accent transition-colors">{lawyer.name}</Link>
                {lawyer.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-success/10 text-success px-2 py-0.5 rounded-full border border-success/20">
                    <Shield className="h-3 w-3" /> Verified
                  </span>
                )}
                {lawyer.match_score >= 80 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-accent/8 text-accent px-2 py-0.5 rounded-full border border-accent/15">
                    <Zap className="h-3 w-3" /> {lawyer.match_score}% Match
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {lawyer.firm}
              </div>
            </div>

            {/* Key details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Location</div>
                  <div className="text-sm font-medium text-foreground">{lawyer.city || "—"}, {lawyer.state || "—"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Experience</div>
                  <div className="text-sm font-medium text-foreground">{lawyer.experience_years} years</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Languages</div>
                  <div className="text-sm font-medium text-foreground">{(lawyer.languages || []).slice(0, 2).join(", ")}{(lawyer.languages || []).length > 2 ? ` +${lawyer.languages.length - 2}` : ""}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Response</div>
                  <div className="text-sm font-medium text-foreground">{formatResponseTime(lawyer.avg_response_hours)}</div>
                </div>
              </div>
            </div>

            {/* Practice areas */}
            <div className="flex flex-wrap gap-1.5">
              {(lawyer.practice_areas || []).slice(0, 4).map((pa) => (
                <Badge key={pa} variant="secondary" className="text-[11px] px-2.5 py-0.5 font-medium rounded-lg">
                  {pa}
                </Badge>
              ))}
              {(lawyer.practice_areas || []).length > 4 && (
                <Badge variant="outline" className="text-[11px] px-2.5 py-0.5 rounded-lg">
                  +{lawyer.practice_areas.length - 4} more
                </Badge>
              )}
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${s <= Math.round(lawyer.rating) ? "text-accent fill-accent" : "text-border"}`} />
                  ))}
                </div>
                <span className="font-semibold text-foreground">{lawyer.rating}</span>
                <span className="text-muted-foreground">({lawyer.review_count} reviews)</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
                {(lawyer.consultation_types || []).map((ct) => {
                  const Icon = getConsultIcon(ct);
                  return (
                    <div key={ct} className="flex items-center gap-1 text-xs">
                      <Icon className="h-3.5 w-3.5" />
                      <span className="capitalize">{ct}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0 md:min-w-[140px]">
            <div className="text-right">
              <div className="text-2xl font-serif text-foreground">
                {lawyer.consultation_fee ? `$${lawyer.consultation_fee}` : "Free"}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {lawyer.consultation_fee ? "consultation fee" : "free consultation"}
              </div>
              {lawyer.hourly_rate && (
                <div className="text-xs text-muted-foreground">
                  ${lawyer.hourly_rate}/hr ongoing
                </div>
              )}
            </div>
            <Button variant="gold" size="default" className="w-full md:w-auto mt-0 md:mt-3">
              <Calendar className="mr-2 h-4 w-4" /> Book Consultation
            </Button>
          </div>
        </div>

        {/* Expanded section */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-5 pt-5 border-t border-border/50 grid md:grid-cols-2 gap-5">
                {lawyer.bio && (
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">About</h4>
                    <p className="text-sm text-foreground leading-relaxed">{lawyer.bio}</p>
                  </div>
                )}
                {lawyer.review_summary && (
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Client Reviews</h4>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">"{lawyer.review_summary}"</p>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Jurisdictions</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(lawyer.jurisdictions || []).map((j) => (
                      <Badge key={j} variant="outline" className="text-[11px] px-2.5 py-0.5 rounded-lg">{j}</Badge>
                    ))}
                  </div>
                </div>
                {lawyer.match_score > 0 && Object.keys(lawyer.score_breakdown || {}).length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Match Breakdown</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(lawyer.score_breakdown).map(([key, val]) => (
                        <div key={key} className="text-center p-2 rounded-lg bg-muted/40 border border-border/50">
                          <div className="text-sm font-bold text-foreground">{Math.round(val as number)}</div>
                          <div className="text-[10px] text-muted-foreground capitalize">{key.replace(/_/g, " ")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expand toggle */}
      <button
        onClick={onToggle}
        className="w-full py-2.5 border-t border-border/50 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors flex items-center justify-center gap-1.5"
      >
        {expanded ? "Show less" : "View full profile"}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>
    </motion.div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function FindLawyers() {
  const [searchParams] = useSearchParams();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("best_match");
  const [practiceFilter, setPracticeFilter] = useState(searchParams.get("category") || "All");
  const [languageFilter, setLanguageFilter] = useState("All");
  const [experienceMin, setExperienceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(Infinity);
  const [ratingMin, setRatingMin] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 150);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const locationParam = searchParams.get("location") || "";

  const fetchLawyers = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, any> = {};
      if (practiceFilter !== "All") filters.practice_area = practiceFilter;
      if (languageFilter !== "All") filters.language = languageFilter;

      const { data, error } = await supabase.functions.invoke("match-lawyers", {
        body: {
          criteria: {
            location: locationParam,
            legal_category: practiceFilter !== "All" ? practiceFilter : undefined,
            language_preference: languageFilter !== "All" ? languageFilter : undefined,
          },
          sort_by: sortBy,
          filters,
        },
      });
      if (error) throw error;
      setLawyers(data?.lawyers || []);
    } catch (err) {
      console.error("Failed to fetch:", err);
      try {
        const { data } = await supabase.from("lawyers").select("*");
        if (data) setLawyers((data as any[]).map((l) => ({ ...l, match_score: 75, score_breakdown: {}, practice_areas: l.practice_areas || [], languages: l.languages || [], consultation_types: l.consultation_types || [], jurisdictions: l.jurisdictions || [], specialization_tags: l.specialization_tags || [], complexity_levels: l.complexity_levels || [], budget_ranges: l.budget_ranges || [] })));
      } catch {
        setLawyers([]);
      }
    } finally {
      setLoading(false);
    }
  }, [sortBy, practiceFilter, languageFilter, locationParam]);

  useEffect(() => { fetchLawyers(); }, [fetchLawyers]);

  const filtered = useMemo(() => {
    let result = lawyers;

    // Client-side filters
    if (experienceMin > 0) result = result.filter((l) => l.experience_years >= experienceMin);
    if (priceMax < Infinity) {
      if (priceMax === 0) result = result.filter((l) => !l.consultation_fee || l.consultation_fee === 0);
      else result = result.filter((l) => !l.consultation_fee || l.consultation_fee <= priceMax);
    }
    if (ratingMin > 0) result = result.filter((l) => l.rating >= ratingMin);

    // Text search (debounced)
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.firm.toLowerCase().includes(q) ||
          l.practice_areas.some((pa) => pa.toLowerCase().includes(q)) ||
          (l.city && l.city.toLowerCase().includes(q))
      );
    }

    return result;
  }, [lawyers, debouncedSearch, experienceMin, priceMax, ratingMin]);

  const activeFilterCount = [
    practiceFilter !== "All",
    languageFilter !== "All",
    experienceMin > 0,
    priceMax < Infinity,
    ratingMin > 0,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setPracticeFilter("All");
    setLanguageFilter("All");
    setExperienceMin(0);
    setPriceMax(Infinity);
    setRatingMin(0);
    setSearchQuery("");
  };

  // ─── Filter bar (shared between desktop inline and mobile sheet) ───
  const filterControls = (
    <div className="flex flex-wrap gap-2">
      <FilterDropdown label="Practice Area" icon={Briefcase} value={practiceFilter} options={PRACTICE_AREAS} onChange={setPracticeFilter} />
      <FilterDropdown label="Language" icon={Globe} value={languageFilter} options={LANGUAGES} onChange={setLanguageFilter} />
      <FilterDropdown
        label="Experience"
        icon={Award}
        value={EXPERIENCE_RANGES.find((r) => r.min === experienceMin)?.label || "Any"}
        options={EXPERIENCE_RANGES.map((r) => r.label)}
        onChange={(v) => setExperienceMin(EXPERIENCE_RANGES.find((r) => r.label === v)?.min || 0)}
      />
      <FilterDropdown
        label="Price"
        icon={DollarSign}
        value={PRICE_RANGES.find((r) => r.max === priceMax)?.label || "Any"}
        options={PRICE_RANGES.map((r) => r.label)}
        onChange={(v) => setPriceMax(PRICE_RANGES.find((r) => r.label === v)?.max ?? Infinity)}
      />
      <FilterDropdown
        label="Rating"
        icon={Star}
        value={RATING_OPTIONS.find((r) => r.min === ratingMin)?.label || "Any"}
        options={RATING_OPTIONS.map((r) => r.label)}
        onChange={(v) => setRatingMin(RATING_OPTIONS.find((r) => r.label === v)?.min || 0)}
      />
      {activeFilterCount > 0 && (
        <button onClick={clearAllFilters} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors">
          <X className="h-3.5 w-3.5" /> Clear all
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 glass-nav border-b border-border/50">
        <div className="container flex items-center gap-3 h-16">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Scale className="h-5 w-5 text-accent" />
            <span className="font-serif text-base text-foreground hidden sm:inline">LegalBridge</span>
          </Link>

          <div className="flex-1 flex items-center gap-2 bg-card border border-border/60 rounded-xl px-4 py-2.5 focus-within:border-accent/30 focus-within:ring-2 focus-within:ring-accent/10 transition-all">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, firm, specialty, or city..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 min-w-0"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden shrink-0 relative"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      <div className="container py-6">
        {/* ─── Page title area ─── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h1 className="text-2xl md:text-3xl font-serif text-foreground">Find a Lawyer</h1>
            {locationParam && (
              <Badge variant="secondary" className="text-xs gap-1 font-medium">
                <MapPin className="h-3 w-3" /> {locationParam}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {loading ? "Searching for the best matches..." : `${filtered.length} lawyers found`}
            {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active`}
          </p>
        </div>

        {/* ─── Desktop filters ─── */}
        <div className="hidden md:block mb-5">
          {filterControls}
        </div>

        {/* ─── Mobile filters ─── */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden mb-5"
            >
              <div className="p-4 bg-card border rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-foreground">Filters</span>
                  <button onClick={() => setShowMobileFilters(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {filterControls}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Sort bar ─── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6">
          <span className="text-xs text-muted-foreground font-medium shrink-0 flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5" /> Sort by:
          </span>
          {SORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  sortBy === opt.value
                    ? "bg-accent text-accent-foreground shadow-gold"
                    : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-accent/20"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {opt.label}
              </button>
            );
          })}
        </div>

        {/* ─── Results ─── */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-card border shadow-card p-6 animate-pulse">
                <div className="flex gap-5">
                  <div className="h-20 w-20 rounded-2xl bg-muted" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-48 bg-muted rounded-lg" />
                    <div className="h-4 w-32 bg-muted rounded-lg" />
                    <div className="flex gap-2">
                      <div className="h-8 w-24 bg-muted rounded-lg" />
                      <div className="h-8 w-24 bg-muted rounded-lg" />
                      <div className="h-8 w-24 bg-muted rounded-lg" />
                    </div>
                    <div className="h-4 w-64 bg-muted rounded-lg" />
                  </div>
                  <div className="hidden md:block space-y-2">
                    <div className="h-8 w-20 bg-muted rounded-lg ml-auto" />
                    <div className="h-10 w-36 bg-muted rounded-xl" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            filtered.map((lawyer, index) => (
              <LawyerCard
                key={lawyer.id}
                lawyer={lawyer}
                index={index}
                expanded={expandedId === lawyer.id}
                onToggle={() => setExpandedId(expandedId === lawyer.id ? null : lawyer.id)}
              />
            ))
          )}
        </div>

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Search className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <h3 className="font-serif text-xl text-foreground mb-2">No lawyers available yet in this location</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Try adjusting your filters, broadening your search criteria, or check back soon as new lawyers join our platform.
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2.5 mt-8 p-4 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/60" />
          <span>Match scores are AI-generated estimates based on lawyer profile data and your search criteria. They do not guarantee outcomes. Always verify fit during your consultation.</span>
        </div>
      </div>
    </div>
  );
}
