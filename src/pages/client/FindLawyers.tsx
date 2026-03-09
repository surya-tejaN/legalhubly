import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star, MapPin, Clock, Shield, Filter, Search, Calendar,
  ArrowUpDown, Briefcase, ChevronDown, X, Zap, Scale,
  DollarSign, Timer, Award, Phone, Video, Building2, Info,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

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

const SORT_OPTIONS = [
  { value: "best_match", label: "Best Match", icon: <Zap className="h-3.5 w-3.5" /> },
  { value: "fastest_response", label: "Fastest", icon: <Timer className="h-3.5 w-3.5" /> },
  { value: "lowest_fee", label: "Lowest Fee", icon: <DollarSign className="h-3.5 w-3.5" /> },
  { value: "highest_rated", label: "Top Rated", icon: <Star className="h-3.5 w-3.5" /> },
  { value: "highest_experience", label: "Most Exp.", icon: <Award className="h-3.5 w-3.5" /> },
];

const PRACTICE_AREAS = [
  "All", "Personal Injury", "Family Law", "Criminal Defense", "Immigration Law",
  "Employment Law", "Business Law", "Real Estate Law", "Estate Planning", "Intellectual Property", "Civil Litigation",
];

function formatResponseTime(hours: number): string {
  if (hours < 1) return "< 1hr";
  if (hours <= 24) return `~${Math.round(hours)}hr`;
  return `${Math.round(hours / 24)}d`;
}

function getAvailabilityColor(status: string) {
  if (status === "available") return "bg-success";
  if (status === "busy") return "bg-warning";
  return "bg-muted-foreground";
}

export default function FindLawyers() {
  const [searchParams] = useSearchParams();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("best_match");
  const [practiceFilter, setPracticeFilter] = useState(searchParams.get("category") || "All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const locationParam = searchParams.get("location") || "";

  const fetchLawyers = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, any> = {};
      if (practiceFilter !== "All") filters.practice_area = practiceFilter;

      const { data, error } = await supabase.functions.invoke("match-lawyers", {
        body: {
          criteria: { location: locationParam, legal_category: practiceFilter !== "All" ? practiceFilter : undefined },
          sort_by: sortBy,
          filters,
        },
      });

      if (error) throw error;
      setLawyers(data.lawyers || []);
    } catch (err) {
      console.error("Failed to fetch lawyers:", err);
      const { data } = await supabase.from("lawyers" as any).select("*");
      if (data) {
        setLawyers((data as any[]).map((l) => ({ ...l, match_score: 75, score_breakdown: {} })));
      }
    } finally {
      setLoading(false);
    }
  }, [sortBy, practiceFilter, locationParam]);

  useEffect(() => { fetchLawyers(); }, [fetchLawyers]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return lawyers;
    const q = searchQuery.toLowerCase();
    return lawyers.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.firm.toLowerCase().includes(q) ||
        l.practice_areas.some((pa) => pa.toLowerCase().includes(q)) ||
        (l.city && l.city.toLowerCase().includes(q))
    );
  }, [lawyers, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 glass-nav border-b border-border/50">
        <div className="container flex items-center gap-4 h-14">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Scale className="h-5 w-5 text-accent" />
            <span className="font-serif text-base text-foreground hidden sm:inline">LegalBridge</span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 flex items-center gap-2 bg-card border rounded-xl px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lawyers..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="shrink-0">
            <Filter className="h-4 w-4 md:mr-1.5" />
            <span className="hidden md:inline">Filters</span>
          </Button>
        </div>
      </header>

      <div className="container py-6">
        {/* Context line */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {locationParam && (
            <Badge variant="secondary" className="text-xs gap-1">
              <MapPin className="h-3 w-3" /> {locationParam}
            </Badge>
          )}
          {practiceFilter !== "All" && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Briefcase className="h-3 w-3" /> {practiceFilter}
              <button onClick={() => setPracticeFilter("All")} className="ml-1 hover:text-foreground"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          <span className="text-sm text-muted-foreground ml-auto">
            {loading ? "Searching..." : `${filtered.length} lawyers found`}
          </span>
        </div>

        {/* Sort pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-4">
          <span className="text-xs text-muted-foreground font-medium shrink-0 flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" /> Sort:
          </span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                sortBy === opt.value
                  ? "bg-accent text-accent-foreground"
                  : "bg-card border text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="flex flex-wrap gap-2 p-4 bg-card border rounded-xl">
                <span className="text-xs font-medium text-muted-foreground w-full mb-1">Practice Area</span>
                {PRACTICE_AREAS.map((pa) => (
                  <button
                    key={pa}
                    onClick={() => setPracticeFilter(pa)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      practiceFilter === pa
                        ? "bg-accent/10 border-accent/30 text-accent"
                        : "text-muted-foreground hover:text-foreground hover:border-accent/20"
                    }`}
                  >
                    {pa}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lawyer Cards */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-card border shadow-card p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-muted rounded" />
                    <div className="h-3 w-56 bg-muted rounded" />
                    <div className="h-3 w-32 bg-muted rounded" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            filtered.map((lawyer, index) => (
              <motion.div
                key={lawyer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className="rounded-xl bg-card border shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                        {lawyer.avatar_initials}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${getAvailabilityColor(lawyer.availability_status)}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{lawyer.name}</h3>
                        {lawyer.verified && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-success/10 text-success px-1.5 py-0.5 rounded-full">
                            <Shield className="h-3 w-3" /> Verified
                          </span>
                        )}
                        {lawyer.match_score >= 80 && (
                          <span className="text-[10px] font-bold text-accent bg-accent/8 px-1.5 py-0.5 rounded-full">
                            {lawyer.match_score}% match
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground mt-0.5">
                        {lawyer.firm} · {lawyer.experience_years}yr exp
                      </div>

                      {/* Practice areas */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {lawyer.practice_areas.slice(0, 3).map((pa) => (
                          <Badge key={pa} variant="secondary" className="text-[10px] px-2 py-0 font-medium">
                            {pa}
                          </Badge>
                        ))}
                        {lawyer.practice_areas.length > 3 && (
                          <Badge variant="outline" className="text-[10px] px-2 py-0">+{lawyer.practice_areas.length - 3}</Badge>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                          {lawyer.rating} ({lawyer.review_count})
                        </span>
                        {lawyer.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {lawyer.city}, {lawyer.state}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatResponseTime(lawyer.avg_response_hours)}
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-foreground">
                          {lawyer.consultation_fee ? `$${lawyer.consultation_fee}` : "Free"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">consultation</div>
                      </div>
                      <Button variant="gold" size="sm">
                        <Calendar className="mr-1.5 h-3.5 w-3.5" /> Book
                      </Button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {expandedId === lawyer.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t space-y-3"
                      >
                        {lawyer.bio && (
                          <p className="text-sm text-muted-foreground">{lawyer.bio}</p>
                        )}
                        {lawyer.review_summary && (
                          <p className="text-sm text-muted-foreground italic">"{lawyer.review_summary}"</p>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {lawyer.jurisdictions.map((j) => (
                            <Badge key={j} variant="outline" className="text-[10px] px-2 py-0">{j}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">Languages: {lawyer.languages.join(", ")}</span>
                          <span className="text-border">·</span>
                          {lawyer.consultation_types.includes("video") && <Video className="h-3.5 w-3.5" />}
                          {lawyer.consultation_types.includes("phone") && <Phone className="h-3.5 w-3.5" />}
                          {lawyer.consultation_types.includes("in-person") && <Building2 className="h-3.5 w-3.5" />}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => setExpandedId(expandedId === lawyer.id ? null : lawyer.id)}
                  className="w-full py-2 border-t text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors flex items-center justify-center gap-1"
                >
                  {expandedId === lawyer.id ? "Less" : "Details"}
                  <ChevronDown className={`h-3 w-3 transition-transform ${expandedId === lawyer.id ? "rotate-180" : ""}`} />
                </button>
              </motion.div>
            ))
          )}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-serif text-lg text-foreground mb-1">No lawyers found</h3>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters</p>
            <Button variant="outline" size="sm" onClick={() => { setPracticeFilter("All"); setSearchQuery(""); }}>
              Clear filters
            </Button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 mt-6 p-3 rounded-lg bg-muted/50 border text-[11px] text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>Match scores are AI-generated estimates. Always verify fit during your consultation.</span>
        </div>
      </div>
    </div>
  );
}
