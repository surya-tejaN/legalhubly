import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Scale, MapPin, ArrowRight, Briefcase, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/SeoHead";
import { SEO_CITIES, SEO_PRACTICE_AREAS } from "@/lib/seo-data";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5 },
};

// Safe access to data arrays with fallbacks
const safeCities = Array.isArray(SEO_CITIES) && SEO_CITIES.length > 0 ? SEO_CITIES : [];
const safePracticeAreas = Array.isArray(SEO_PRACTICE_AREAS) && SEO_PRACTICE_AREAS.length > 0 ? SEO_PRACTICE_AREAS : [];

export default function SeoDirectory() {
  const hasData = safeCities.length > 0 && safePracticeAreas.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Find Lawyers by City & Practice Area | Legalhubly"
        description="Browse lawyers by city and practice area. Find immigration lawyers, divorce lawyers, criminal defense attorneys, and more in cities across the US."
        canonical="https://legalhubly.com/lawyers"
      />

      <nav className="sticky top-0 z-50 glass-nav border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-accent" />
            <span className="font-serif text-lg text-foreground">Legalhubly</span>
          </Link>
          <Button variant="gold" size="sm" asChild>
            <Link to="/client/find-lawyers">Search Lawyers <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      </nav>

      <section className="hero-gradient text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <motion.div {...fadeUp}>
            <h1 className="font-serif text-3xl md:text-5xl leading-tight mb-4">
              Find Lawyers by <span className="text-accent">City & Specialty</span>
            </h1>
            <p className="text-primary-foreground/70 text-base md:text-lg max-w-2xl">
              Browse our directory of verified attorneys organized by location and practice area.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        {!hasData ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <h3 className="font-serif text-xl text-foreground mb-2">Directory loading</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Practice area and city data is being loaded. Please check back soon or search directly.
            </p>
            <Button variant="outline" asChild>
              <Link to="/client/find-lawyers">Search All Lawyers</Link>
            </Button>
          </div>
        ) : (
          safePracticeAreas.map((pa) => (
            <motion.section key={pa?.slug || "unknown"} {...fadeUp} className="mb-12">
              <div className="flex items-center gap-2 mb-5">
                <Briefcase className="h-5 w-5 text-accent" />
                <h2 className="font-serif text-xl text-foreground">{pa?.title || "Lawyers"}s</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {safeCities.map((city) => (
                  <Link
                    key={city?.slug || "unknown"}
                    to={`/lawyers/${pa?.slug || ""}/${city?.slug || ""}`}
                    className="flex items-center gap-2.5 p-3.5 rounded-xl border bg-card hover:border-accent/30 hover:shadow-sm transition-all duration-200 group"
                  >
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                    <span className="text-sm text-foreground group-hover:text-accent transition-colors truncate">
                      {city?.name || "Unknown"}, {city?.state || ""}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.section>
          ))
        )}
      </div>

      <footer className="border-t bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Legalhubly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
