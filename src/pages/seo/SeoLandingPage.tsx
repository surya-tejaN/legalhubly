import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Star, Clock, Shield, ArrowRight, Scale, Search,
  ChevronDown, ChevronRight, Briefcase, Phone, Video, Building2,
  ArrowLeft, Users, Globe, Award,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import SeoHead from "@/components/SeoHead";
import { SEO_CITIES, SEO_PRACTICE_AREAS, type SeoCity, type SeoPracticeArea } from "@/lib/seo-data";

// ─── Types ──────────────────────────────────────────────────────────────────

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
  consultation_types: string[];
  avg_response_hours: number;
  availability_status: string;
  rating: number;
  review_count: number;
  bio: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5 },
};

function formatResponseTime(hours: number) {
  if (hours < 1) return "< 1 hour";
  if (hours <= 24) return `~${Math.round(hours)}hr`;
  return `${Math.round(hours / 24)} days`;
}

const typeIcons: Record<string, React.ReactNode> = {
  video: <Video className="h-3.5 w-3.5" />,
  phone: <Phone className="h-3.5 w-3.5" />,
  "in-person": <Building2 className="h-3.5 w-3.5" />,
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function SeoLandingPage() {
  const { city: citySlug, practiceArea: paSlug } = useParams();
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const cityData = SEO_CITIES.find((c) => c.slug === citySlug);
  const paData = SEO_PRACTICE_AREAS.find((p) => p.slug === paSlug);

  useEffect(() => {
    if (!cityData || !paData) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("lawyers")
        .select("*")
        .contains("practice_areas", [paData.name])
        .or(`city.ilike.%${cityData.name}%,state.ilike.%${cityData.state}%`)
        .order("rating", { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        setLawyers(data as Lawyer[]);
      } else {
        // Fallback: show all lawyers with matching practice area
        const { data: fallback } = await supabase
          .from("lawyers")
          .select("*")
          .contains("practice_areas", [paData.name])
          .order("rating", { ascending: false })
          .limit(20);
        setLawyers((fallback || []) as Lawyer[]);
      }
      setLoading(false);
    })();
  }, [cityData, paData]);

  // Related cities & practice areas for internal links
  const relatedCities = useMemo(
    () => SEO_CITIES.filter((c) => c.slug !== citySlug).slice(0, 6),
    [citySlug]
  );
  const relatedPAs = useMemo(
    () => SEO_PRACTICE_AREAS.filter((p) => p.slug !== paSlug).slice(0, 6),
    [paSlug]
  );

  if (!cityData || !paData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Page not found.</p>
        <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const pageTitle = `${paData.title} in ${cityData.name}, ${cityData.state} | LegalBridge`;
  const pageDesc = `Find the best ${paData.title.toLowerCase()}s in ${cityData.name}, ${cityData.stateFullName}. Compare ratings, experience, and book free consultations on LegalBridge.`;
  const canonicalUrl = `https://legalbridge.app/${citySlug}/${paSlug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: `${paData.title}s in ${cityData.name}`,
    description: pageDesc,
    areaServed: {
      "@type": "City",
      name: cityData.name,
      containedInPlace: { "@type": "State", name: cityData.stateFullName },
    },
    url: canonicalUrl,
    provider: {
      "@type": "Organization",
      name: "LegalBridge",
      url: "https://legalbridge.app",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: paData.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={pageTitle} description={pageDesc} canonical={canonicalUrl} jsonLd={jsonLd} />

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 glass-nav border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-accent" />
              <span className="font-serif text-lg text-foreground">LegalBridge</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <nav className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
              <Link to="/client/find-lawyers" className="hover:text-foreground transition-colors">Lawyers</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to={`/${citySlug}/${paSlug}`} className="text-foreground font-medium">
                {cityData.name}
              </Link>
            </nav>
          </div>
          <Button variant="gold" size="sm" asChild>
            <Link to={`/client/find-lawyers?location=${encodeURIComponent(cityData.name + ", " + cityData.state)}&category=${encodeURIComponent(paData.name)}`}>
              <Search className="h-3.5 w-3.5 mr-1.5" /> Search All
            </Link>
          </Button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="hero-gradient text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-accent/20 text-accent border-accent/30 gap-1 text-xs">
                <MapPin className="h-3 w-3" /> {cityData.name}, {cityData.state}
              </Badge>
              <Badge className="bg-primary-foreground/10 text-primary-foreground/80 border-primary-foreground/20 text-xs">
                {paData.shortName}
              </Badge>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl leading-tight mb-4 max-w-3xl">
              Top {paData.title}s in{" "}
              <span className="text-accent">{cityData.name}</span>, {cityData.stateFullName}
            </h1>
            <p className="text-primary-foreground/70 text-base md:text-lg max-w-2xl leading-relaxed mb-8">
              {paData.description} Compare {cityData.name}'s top-rated attorneys, read verified reviews, and book free consultations.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="gold" size="lg" asChild>
                <Link to={`/client/find-lawyers?location=${encodeURIComponent(cityData.name + ", " + cityData.state)}&category=${encodeURIComponent(paData.name)}`}>
                  Find {paData.title}s <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                <Link to="/client/intake">Free Case Assessment</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust Stats ────────────────────────────────────────────────── */}
      <section className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Users, value: `${lawyers.length || "10"}+`, label: `${paData.shortName} Lawyers` },
              { icon: Star, value: "4.8+", label: "Avg Rating" },
              { icon: Clock, value: "< 2hr", label: "Avg Response" },
              { icon: Shield, value: "Free", label: "Consultations (MVP)" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <s.icon className="h-5 w-5 text-accent mb-1" />
                <span className="text-lg font-bold text-foreground font-serif">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        {/* ── Intro Content ──────────────────────────────────────────── */}
        <motion.section {...fadeUp} className="mb-12">
          <article className="rounded-2xl border bg-card p-6 md:p-8 shadow-card">
            <h2 className="font-serif text-2xl text-foreground mb-4">
              Finding the Right {paData.title} in {cityData.name}
            </h2>
            <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
              <p>
                When facing {paData.shortName.toLowerCase()} legal matters in {cityData.name}, {cityData.stateFullName}, having the right attorney can make all the difference. 
                Whether you're dealing with a complex case or need straightforward legal guidance, LegalBridge connects you with verified, 
                experienced {paData.title.toLowerCase()}s who understand {cityData.stateFullName} law.
              </p>
              <p>
                Our platform makes it easy to compare attorneys based on experience, client reviews, response times, and consultation availability. 
                All consultations are currently free during our MVP period, so you can explore your options risk-free.
              </p>
              <p>
                Browse the {paData.shortName.toLowerCase()} lawyers below, or use our advanced search to filter by specific criteria 
                like language, years of experience, and budget range.
              </p>
            </div>
          </article>
        </motion.section>

        {/* ── Lawyer Listings ────────────────────────────────────────── */}
        <section className="mb-12" aria-labelledby="lawyers-heading">
          <div className="flex items-center justify-between mb-6">
            <h2 id="lawyers-heading" className="font-serif text-2xl text-foreground">
              {paData.title}s in {cityData.name}
            </h2>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/client/find-lawyers?location=${encodeURIComponent(cityData.name + ", " + cityData.state)}&category=${encodeURIComponent(paData.name)}`}>
                View All <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-card border p-6 animate-pulse">
                  <div className="flex gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-muted" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-48 bg-muted rounded-lg" />
                      <div className="h-4 w-32 bg-muted rounded-lg" />
                      <div className="h-4 w-64 bg-muted rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : lawyers.length > 0 ? (
            <div className="space-y-4">
              {lawyers.map((lawyer, i) => (
                <motion.article
                  key={lawyer.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="rounded-2xl border bg-card shadow-card hover:shadow-card-hover transition-all duration-200 p-5 md:p-6"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Avatar */}
                    <div className="shrink-0">
                      <div className="h-16 w-16 rounded-2xl bg-accent/10 border border-accent/10 flex items-center justify-center text-accent text-xl font-bold font-serif">
                        {lawyer.avatar_initials}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link
                          to={`/client/lawyer/${lawyer.id}`}
                          className="text-lg font-semibold text-foreground hover:text-accent transition-colors"
                        >
                          {lawyer.name}
                        </Link>
                        {lawyer.verified && (
                          <Badge className="bg-success/10 text-success border-success/20 text-[10px] gap-0.5">
                            <Shield className="h-3 w-3" /> Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{lawyer.firm}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                        {(lawyer.city || lawyer.state) && (
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {[lawyer.city, lawyer.state].filter(Boolean).join(", ")}</span>
                        )}
                        <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {lawyer.experience_years} years</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-accent text-accent" /> {lawyer.rating.toFixed(1)} ({lawyer.review_count})
                        </span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatResponseTime(lawyer.avg_response_hours)}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {lawyer.practice_areas.slice(0, 4).map((area) => (
                          <Badge key={area} variant="secondary" className="text-[11px] px-2 py-0.5">{area}</Badge>
                        ))}
                        {lawyer.languages.filter((l) => l !== "English").map((lang) => (
                          <Badge key={lang} className="bg-accent/10 text-accent border-accent/20 text-[11px] px-2 py-0.5">
                            <Globe className="h-2.5 w-2.5 mr-0.5" /> {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <div className="flex gap-1 text-muted-foreground mb-1">
                        {lawyer.consultation_types.map((t) => (
                          <span key={t} className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">{typeIcons[t]}</span>
                        ))}
                      </div>
                      <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px] mb-2">Free Consult (MVP)</Badge>
                      <Button variant="gold" size="sm" asChild>
                        <Link to={`/client/lawyer/${lawyer.id}`}>
                          View Profile <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl border bg-card">
              <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No {paData.shortName.toLowerCase()} lawyers found in {cityData.name} yet.</p>
              <Button variant="gold" asChild>
                <Link to={`/client/find-lawyers?category=${encodeURIComponent(paData.name)}`}>
                  Search Nationwide
                </Link>
              </Button>
            </div>
          )}
        </section>

        {/* ── FAQ Section ────────────────────────────────────────────── */}
        <motion.section {...fadeUp} className="mb-12" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="font-serif text-2xl text-foreground mb-6">
            Frequently Asked Questions About {paData.title}s in {cityData.name}
          </h2>
          {/* Inject FAQ JSON-LD */}
          <SeoHead
            title={pageTitle}
            description={pageDesc}
            jsonLd={faqJsonLd}
          />
          <div className="space-y-3">
            {paData.faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border bg-card shadow-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-sm font-semibold text-foreground pr-4">{faq.q}</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
                    openFaq === i && "rotate-180"
                  )} />
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-200",
                  openFaq === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}>
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Internal Links ─────────────────────────────────────────── */}
        <motion.section {...fadeUp} className="mb-12">
          <h2 className="font-serif text-2xl text-foreground mb-6">
            {paData.title}s in Other Cities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {relatedCities.map((c) => (
              <Link
                key={c.slug}
                to={`/lawyers/${c.slug}/${paSlug}`}
                className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:border-accent/30 hover:shadow-sm transition-all duration-200 group"
              >
                <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                    {paData.title} in {c.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.stateFullName}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        <motion.section {...fadeUp} className="mb-12">
          <h2 className="font-serif text-2xl text-foreground mb-6">
            Other Practice Areas in {cityData.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {relatedPAs.map((pa) => (
              <Link
                key={pa.slug}
                to={`/lawyers/${citySlug}/${pa.slug}`}
                className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:border-accent/30 hover:shadow-sm transition-all duration-200 group"
              >
                <Scale className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                    {pa.title} in {cityData.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{pa.shortName}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <motion.section {...fadeUp} className="rounded-2xl hero-gradient text-primary-foreground p-8 md:p-12 text-center">
          <h2 className="font-serif text-2xl md:text-3xl mb-3">
            Need a {paData.title} in {cityData.name}?
          </h2>
          <p className="text-primary-foreground/70 mb-6 max-w-lg mx-auto">
            Get matched with top-rated attorneys in minutes. Free consultations during MVP.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="gold" size="lg" asChild>
              <Link to={`/client/find-lawyers?location=${encodeURIComponent(cityData.name + ", " + cityData.state)}&category=${encodeURIComponent(paData.name)}`}>
                Find Lawyers <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
              <Link to="/client/intake">Free Case Review</Link>
            </Button>
          </div>
        </motion.section>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t bg-card mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <Link to="/" className="font-serif text-foreground text-base">
              Legal<span className="text-accent">Bridge</span>
            </Link>
            <p>© {new Date().getFullYear()} LegalBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
