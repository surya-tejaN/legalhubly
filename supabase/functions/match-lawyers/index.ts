import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Maps legal categories to practice area keywords
const CATEGORY_TO_PRACTICE: Record<string, string[]> = {
  "Personal Injury": ["Personal Injury", "Civil Litigation", "Medical Malpractice"],
  "Immigration": ["Immigration Law", "Asylum", "Visa Services"],
  "Family": ["Family Law", "Divorce", "Child Custody"],
  "Criminal": ["Criminal Defense", "DUI", "White Collar Crime"],
  "Employment": ["Employment Law", "Labor Law", "Workplace Discrimination"],
  "Business": ["Business Law", "Corporate Law", "Contract Law"],
  "Real Estate": ["Real Estate Law", "Property Law", "Land Use"],
  "Estate Planning": ["Estate Planning", "Trusts", "Probate"],
  "Civil Litigation": ["Civil Litigation", "Personal Injury"],
  "IP": ["Intellectual Property", "Patent Law", "Trademark Law"],
};

function computeMatchScore(lawyer: any, criteria: any): { score: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};
  let total = 0;
  let maxScore = 0;

  // 1. Practice area fit (weight: 30)
  maxScore += 30;
  if (criteria.legal_category) {
    const relevantAreas = CATEGORY_TO_PRACTICE[criteria.legal_category] || [criteria.legal_category];
    const overlap = lawyer.practice_areas.filter((pa: string) =>
      relevantAreas.some((ra: string) => pa.toLowerCase().includes(ra.toLowerCase()) || ra.toLowerCase().includes(pa.toLowerCase()))
    );
    breakdown.practice_area = Math.min(30, (overlap.length / Math.max(relevantAreas.length, 1)) * 30);
  } else {
    breakdown.practice_area = 15; // neutral
  }
  total += breakdown.practice_area;

  // 2. Jurisdiction / location (weight: 20)
  maxScore += 20;
  if (criteria.location) {
    const loc = criteria.location.toLowerCase();
    const stateMatch = lawyer.state && loc.includes(lawyer.state.toLowerCase());
    const cityMatch = lawyer.city && loc.includes(lawyer.city.toLowerCase());
    const jurisdictionMatch = lawyer.jurisdictions?.some((j: string) => loc.includes(j.toLowerCase()));
    breakdown.location = cityMatch ? 20 : stateMatch || jurisdictionMatch ? 14 : 5;
  } else {
    breakdown.location = 10;
  }
  total += breakdown.location;

  // 3. Availability (weight: 12)
  maxScore += 12;
  breakdown.availability = lawyer.availability_status === "available" ? 12 : lawyer.availability_status === "busy" ? 4 : 0;
  total += breakdown.availability;

  // 4. Response speed (weight: 10)
  maxScore += 10;
  const hours = lawyer.avg_response_hours || 24;
  breakdown.response_speed = hours <= 2 ? 10 : hours <= 4 ? 8 : hours <= 8 ? 6 : hours <= 24 ? 3 : 1;
  total += breakdown.response_speed;

  // 5. Consultation type match (weight: 5)
  maxScore += 5;
  if (criteria.consultation_preference && criteria.consultation_preference !== "any") {
    const pref = criteria.consultation_preference.replace("_", "-");
    breakdown.consultation_type = lawyer.consultation_types?.includes(pref) ? 5 : 1;
  } else {
    breakdown.consultation_type = 5;
  }
  total += breakdown.consultation_type;

  // 6. Budget fit (weight: 8)
  maxScore += 8;
  if (criteria.budget_range) {
    const budgetMatch = lawyer.budget_ranges?.some((br: string) =>
      br.toLowerCase().includes(criteria.budget_range.toLowerCase()) || criteria.budget_range.toLowerCase().includes(br.toLowerCase())
    );
    breakdown.budget = budgetMatch ? 8 : lawyer.budget_ranges?.includes("contingency") ? 6 : 3;
  } else {
    breakdown.budget = 5;
  }
  total += breakdown.budget;

  // 7. Language match (weight: 5)
  maxScore += 5;
  if (criteria.language_preference) {
    breakdown.language = lawyer.languages?.some((l: string) =>
      l.toLowerCase() === criteria.language_preference.toLowerCase()
    ) ? 5 : 1;
  } else {
    breakdown.language = 5;
  }
  total += breakdown.language;

  // 8. Review quality (weight: 5)
  maxScore += 5;
  const rating = lawyer.rating || 0;
  breakdown.reviews = rating >= 4.8 ? 5 : rating >= 4.5 ? 4 : rating >= 4.0 ? 3 : rating >= 3.5 ? 2 : 1;
  total += breakdown.reviews;

  // 9. Complexity fit (weight: 5)
  maxScore += 5;
  if (criteria.urgency === "emergency" || criteria.urgency === "urgent") {
    breakdown.complexity = lawyer.complexity_levels?.includes("high-stakes") ? 5 : lawyer.complexity_levels?.includes("complex") ? 3 : 1;
  } else {
    breakdown.complexity = lawyer.complexity_levels?.includes("standard") ? 5 : 3;
  }
  total += breakdown.complexity;

  const score = Math.round((total / maxScore) * 100);
  return { score, breakdown };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { criteria, sort_by, filters } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all lawyers
    let query = supabase.from("lawyers").select("*");

    // Apply filters
    if (filters?.practice_area && filters.practice_area !== "All") {
      query = query.contains("practice_areas", [filters.practice_area]);
    }
    if (filters?.state) {
      query = query.eq("state", filters.state);
    }
    if (filters?.verified === true) {
      query = query.eq("verified", true);
    }
    if (filters?.max_consultation_fee) {
      query = query.lte("consultation_fee", filters.max_consultation_fee);
    }
    if (filters?.language) {
      query = query.contains("languages", [filters.language]);
    }
    if (filters?.availability === "available") {
      query = query.eq("availability_status", "available");
    }

    const { data: lawyers, error } = await query;
    if (error) throw error;

    // Score each lawyer
    const scored = (lawyers || []).map((lawyer) => {
      const { score, breakdown } = computeMatchScore(lawyer, criteria || {});
      return { ...lawyer, match_score: score, score_breakdown: breakdown };
    });

    // Sort
    const sortKey = sort_by || "best_match";
    scored.sort((a, b) => {
      switch (sortKey) {
        case "fastest_response":
          return (a.avg_response_hours || 99) - (b.avg_response_hours || 99);
        case "lowest_fee":
          return (a.consultation_fee || 999) - (b.consultation_fee || 999);
        case "highest_experience":
          return (b.experience_years || 0) - (a.experience_years || 0);
        case "highest_rated":
          return (b.rating || 0) - (a.rating || 0);
        default: // best_match
          return b.match_score - a.match_score;
      }
    });

    return new Response(JSON.stringify({ lawyers: scored }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("match-lawyers error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
