import { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star, MapPin, Clock, Shield, Filter, Search, Calendar,
  BookmarkPlus, BookmarkCheck, ArrowUpDown, Globe, Briefcase,
  ChevronDown, X, Zap, Heart, Scale, DollarSign, Timer,
  Award, Languages, Video, Phone, Building2, CheckCircle2,
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
}

const SORT_OPTIONS = [
  { value: "best_match", label: "Best Match", icon: <Zap className="h-3.5 w-3.5" /> },
  { value: "fastest_response", label: "Fastest Response", icon: <Timer className="h-3.5 w-3.5" /> },
  { value: "lowest_fee", label: "Lowest Fee", icon: <DollarSign className="h-3.5 w-3.5" /> },
  { value: "highest_experience", label: "Most Experienced", icon: <Award className="h-3.5 w-3.5" /> },
  { value: "highest_rated", label: "Highest Rated", icon: <Star className="h-3.5 w-3.5" /> },
];

const PRACTICE_AREAS = [
  "All", "Employment Law", "Business Law", "Real Estate Law", "Criminal Defense",
  "Family Law", "Immigration Law", "Intellectual Property", "Estate Planning", "Civil Litigation", "Personal Injury",
];

const STATES = ["All", "CA", "NY", "TX", "FL", "IL", "GA", "WA", "AZ"];

function formatResponseTime(hours: number): string {
  if (hours < 1) return "< 1 hour";
  if (hours <= 2) return `~${hours}h`;
  if (hours <= 24) return `~${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

function getAvailabilityColor(status: string) {
  if (status === "available") return "bg-success";
  if (status === "busy") return "bg-warning";
  return "bg-muted-foreground";
}

function getScoreColor(score: number) {
  if (score >= 90) return "text-success";
  if (score >= 75) return "text-accent";
  if (score >= 50) return "text-warning";
  return "text-muted-foreground";
}

function getScoreBg(score: number) {
  if (score >= 90) return "bg-success/10 border-success/20";
  if (score >= 75) return "bg-accent/10 border-accent/20";
  if (score >= 50) return "bg-warning/10 border-warning/20";
  return "bg-muted border-border";
}

export default function FindLawyers() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("best_match");
  const [practiceFilter, setPracticeFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sessionId = useMemo(() => {
    let id = sessionStorage.getItem("lawyer_search_session");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("lawyer_search_session", id);
    }
    return id;
  }, []);

  const fetchLawyers = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, any> = {};
      if (practiceFilter !== "All") filters.practice_area = practiceFilter;
      if (stateFilter !== "All") filters.state = stateFilter;
      if (verifiedOnly) filters.verified = true;

      const { data, error } = await supabase.functions.invoke("match-lawyers", {
        body: { criteria: {}, sort_by: sortBy, filters },
      });

      if (error) throw error;
      setLawyers(data.lawyers || []);
    } catch (err) {
      console.error("Failed to fetch lawyers:", err);
      // Fallback: fetch directly
      const { data } = await supabase.from("lawyers" as any).select("*");
      if (data) {
        setLawyers((data as any[]).map((l) => ({ ...l, match_score: 75, score_breakdown: {} })));
      }
    } finally {
      setLoading(false);
    }
  }, [sortBy, practiceFilter, stateFilter, verifiedOnly]);

  const loadSaved = useCallback(async () => {
    const { data } = await supabase
      .from("saved_lawyers" as any)
      .select("lawyer_id")
      .eq("session_id", sessionId);
    if (data) setSavedIds(new Set((data as any[]).map((d) => d.lawyer_id)));
  }, [sessionId]);

  useEffect(() => { fetchLawyers(); }, [fetchLawyers]);
  useEffect(() => { loadSaved(); }, [loadSaved]);

  const toggleSave = async (lawyerId: string) => {
    const isSaved = savedIds.has(lawyerId);
    if (isSaved) {
      await supabase.from("saved_lawyers" as any).delete().eq("session_id", sessionId).eq("lawyer_id", lawyerId);
      setSavedIds((prev) => { const n = new Set(prev); n.delete(lawyerId); return n; });
    } else {
      await supabase.from("saved_lawyers" as any).insert({ session_id: sessionId, lawyer_id: lawyerId } as any);
      setSavedIds((prev) => new Set(prev).add(lawyerId));
    }
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else if (n.size < 3) n.add(id);
      return n;
    });
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return lawyers;
    const q = searchQuery.toLowerCase();
    return lawyers.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.firm.toLowerCase().includes(q) ||
        l.practice_areas.some((pa) => pa.toLowerCase().includes(q)) ||
        (l.city && l.city.toLowerCase().includes(q)) ||
        (l.state && l.state.toLowerCase().includes(q))
    );
  }, [lawyers, searchQuery]);

  const compareLawyers = useMemo(
    () => lawyers.filter((l) => compareIds.has(l.id)),
    [lawyers, compareIds]
  );

  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName="Alex Johnson" userRole="Client">
      <SectionHeader
        title="Find Lawyers"
        subtitle="AI-matched lawyers ranked by your case profile"
        action={
          compareIds.size > 0 ? (
            <Button variant="gold" size="sm" onClick={() => setShowCompare(!showCompare)}>
              <Scale className="mr-2 h-4 w-4" /> Compare ({compareIds.size})
            </Button>
          ) : undefined
        }
      />

      {/* Compare Panel */}
      <AnimatePresence>
        {showCompare && compareLawyers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg text-foreground">Comparison</h3>
                <Button variant="ghost" size="sm" onClick={() => { setShowCompare(false); setCompareIds(new Set()); }}>
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Attribute</th>
                      {compareLawyers.map((l) => (
                        <th key={l.id} className="text-left py-2 px-3 font-semibold text-foreground min-w-[180px]">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">{l.avatar_initials}</div>
                            {l.name}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { label: "Match Score", render: (l: Lawyer) => <span className={`font-bold ${getScoreColor(l.match_score)}`}>{l.match_score}%</span> },
                      { label: "Practice Areas", render: (l: Lawyer) => l.practice_areas.join(", ") },
                      { label: "Experience", render: (l: Lawyer) => `${l.experience_years} years` },
                      { label: "Rating", render: (l: Lawyer) => `${l.rating} ★ (${l.review_count})` },
                      { label: "Consultation Fee", render: (l: Lawyer) => l.consultation_fee ? `$${l.consultation_fee}` : "Contingency" },
                      { label: "Response Time", render: (l: Lawyer) => formatResponseTime(l.avg_response_hours) },
                      { label: "Location", render: (l: Lawyer) => `${l.city || ""}, ${l.state || ""}` },
                      { label: "Languages", render: (l: Lawyer) => l.languages.join(", ") },
                      { label: "Jurisdictions", render: (l: Lawyer) => l.jurisdictions.join(", ") },
                    ].map((row) => (
                      <tr key={row.label}>
                        <td className="py-2.5 pr-4 text-muted-foreground font-medium">{row.label}</td>
                        {compareLawyers.map((l) => (
                          <td key={l.id} className="py-2.5 px-3 text-foreground">{row.render(l)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Controls */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-card border rounded-xl px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, firm, specialty, or location..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="hidden sm:flex">
            <Filter className="mr-2 h-4 w-4" /> Filters
            {(practiceFilter !== "All" || stateFilter !== "All" || verifiedOnly) && (
              <span className="ml-1.5 h-5 w-5 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold">
                {[practiceFilter !== "All", stateFilter !== "All", verifiedOnly].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Sort Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-card border rounded-xl">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Practice Area</label>
                  <select
                    value={practiceFilter}
                    onChange={(e) => setPracticeFilter(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  >
                    {PRACTICE_AREAS.map((pa) => <option key={pa} value={pa}>{pa}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">State</label>
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  >
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      verifiedOnly ? "bg-accent/10 border-accent text-accent" : "bg-background text-muted-foreground"
                    }`}
                  >
                    <Shield className="h-4 w-4" /> Verified Only
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {loading ? "Matching lawyers..." : `${filtered.length} lawyers found`}
        </p>
        {savedIds.size > 0 && (
          <span className="text-xs text-accent font-medium flex items-center gap-1">
            <Heart className="h-3 w-3 fill-accent" /> {savedIds.size} saved
          </span>
        )}
      </div>

      {/* Lawyer Cards */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-card border shadow-card p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="h-14 w-14 rounded-full bg-muted" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-48 bg-muted rounded" />
                  <div className="h-4 w-64 bg-muted rounded" />
                  <div className="h-3 w-40 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))
        ) : (
          filtered.map((lawyer, index) => (
            <motion.div
              key={lawyer.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="rounded-xl bg-card border shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Left: Avatar + Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Avatar with score ring */}
                    <div className="relative shrink-0">
                      <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">
                        {lawyer.avatar_initials}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card ${getAvailabilityColor(lawyer.availability_status)}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-base">{lawyer.name}</h3>
                        {lawyer.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-success/10 text-success px-2 py-0.5 rounded-full">
                            <Shield className="h-3 w-3" /> Verified
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getScoreBg(lawyer.match_score)}`}>
                          <Zap className="h-3 w-3" />
                          <span className={getScoreColor(lawyer.match_score)}>{lawyer.match_score}% Match</span>
                        </span>
                      </div>

                      {/* Firm */}
                      <div className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {lawyer.firm}
                        <span className="text-border">·</span>
                        <Briefcase className="h-3.5 w-3.5" />
                        {lawyer.experience_years}yr exp
                      </div>

                      {/* Practice areas */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {lawyer.practice_areas.slice(0, 3).map((pa) => (
                          <Badge key={pa} variant="secondary" className="text-[10px] px-2 py-0 font-medium">
                            {pa}
                          </Badge>
                        ))}
                        {lawyer.practice_areas.length > 3 && (
                          <Badge variant="outline" className="text-[10px] px-2 py-0">
                            +{lawyer.practice_areas.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-4 mt-2.5 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                          {lawyer.rating} ({lawyer.review_count})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {lawyer.city}, {lawyer.state}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatResponseTime(lawyer.avg_response_hours)} response
                        </span>
                        <span className="flex items-center gap-1">
                          <Languages className="h-3.5 w-3.5" />
                          {lawyer.languages.join(", ")}
                        </span>
                        <span className="flex items-center gap-1">
                          {lawyer.consultation_types.includes("video") && <Video className="h-3.5 w-3.5" />}
                          {lawyer.consultation_types.includes("phone") && <Phone className="h-3.5 w-3.5" />}
                          {lawyer.consultation_types.includes("in-person") && <Building2 className="h-3.5 w-3.5" />}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Fee + Actions */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xl font-semibold text-foreground">
                        {lawyer.consultation_fee ? `$${lawyer.consultation_fee}` : "Free"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {lawyer.consultation_fee ? "consultation" : "contingency"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="gold" size="sm">
                        <Calendar className="mr-1.5 h-3.5 w-3.5" /> Book
                      </Button>
                      <button
                        onClick={() => toggleCompare(lawyer.id)}
                        className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors ${
                          compareIds.has(lawyer.id)
                            ? "bg-accent/10 border-accent text-accent"
                            : "text-muted-foreground hover:border-accent hover:text-accent"
                        }`}
                        title="Compare"
                      >
                        <Scale className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleSave(lawyer.id)}
                        className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors ${
                          savedIds.has(lawyer.id)
                            ? "bg-accent/10 border-accent text-accent"
                            : "text-muted-foreground hover:border-accent hover:text-accent"
                        }`}
                        title="Save"
                      >
                        {savedIds.has(lawyer.id) ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable bio + review */}
                {expandedId === lawyer.id ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t space-y-3"
                  >
                    {lawyer.bio && (
                      <div>
                        <h4 className="text-xs font-semibold text-foreground mb-1">About</h4>
                        <p className="text-sm text-muted-foreground">{lawyer.bio}</p>
                      </div>
                    )}
                    {lawyer.review_summary && (
                      <div>
                        <h4 className="text-xs font-semibold text-foreground mb-1">Client Reviews</h4>
                        <p className="text-sm text-muted-foreground italic">"{lawyer.review_summary}"</p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-semibold text-foreground mb-1.5">Jurisdictions</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {lawyer.jurisdictions.map((j) => (
                          <Badge key={j} variant="outline" className="text-[10px] px-2 py-0">{j}</Badge>
                        ))}
                      </div>
                    </div>
                    {lawyer.match_score > 0 && Object.keys(lawyer.score_breakdown || {}).length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-foreground mb-1.5">Match Breakdown</h4>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {Object.entries(lawyer.score_breakdown).map(([key, val]) => (
                            <div key={key} className="text-center p-2 rounded-lg bg-muted/50">
                              <div className="text-xs font-bold text-foreground">{Math.round(val as number)}</div>
                              <div className="text-[10px] text-muted-foreground capitalize">{key.replace(/_/g, " ")}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : null}
              </div>

              {/* Expand toggle */}
              <button
                onClick={() => setExpandedId(expandedId === lawyer.id ? null : lawyer.id)}
                className="w-full py-2 border-t text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors flex items-center justify-center gap-1"
              >
                {expandedId === lawyer.id ? "Show less" : "View details"}
                <ChevronDown className={`h-3 w-3 transition-transform ${expandedId === lawyer.id ? "rotate-180" : ""}`} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-serif text-lg text-foreground mb-1">No lawyers found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
        </div>
      )}
    </DashboardLayout>
  );
}
