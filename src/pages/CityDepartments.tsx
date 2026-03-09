import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Scale, MapPin, ArrowLeft, Globe, Heart, Gavel, Stethoscope, Briefcase, Building, Home, FileText, Users, Receipt, Brain, Car, KeyRound, GraduationCap, Leaf, Swords, Earth, ShieldCheck, Scale as ScaleIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SeoHead from "@/components/SeoHead";
import { SEO_CITIES, SEO_PRACTICE_AREAS } from "@/lib/seo-data";

const ICONS: Record<string, any> = {
  "immigration-lawyers": Globe,
  "divorce-lawyers": Heart,
  "criminal-defense-lawyers": Gavel,
  "personal-injury-lawyers": Stethoscope,
  "employment-lawyers": Briefcase,
  "business-lawyers": Building,
  "real-estate-lawyers": Home,
  "estate-planning-lawyers": FileText,
  "civil-litigation-lawyers": ScaleIcon,
  "bankruptcy-lawyers": Receipt,
  "tax-lawyers": Receipt,
  "intellectual-property-lawyers": Brain,
  "medical-malpractice-lawyers": Stethoscope,
  "consumer-protection-lawyers": ShieldCheck,
  "traffic-lawyers": Car,
  "landlord-tenant-lawyers": KeyRound,
  "education-lawyers": GraduationCap,
  "environmental-lawyers": Leaf,
  "military-lawyers": Swords,
  "international-lawyers": Earth,
};

// Safe access to data arrays
const safeCities = Array.isArray(SEO_CITIES) && SEO_CITIES.length > 0 ? SEO_CITIES : [];
const safePracticeAreas = Array.isArray(SEO_PRACTICE_AREAS) && SEO_PRACTICE_AREAS.length > 0 ? SEO_PRACTICE_AREAS : [];

export default function CityDepartments() {
  const { citySlug } = useParams<{ citySlug: string }>();
  
  const city = safeCities.find((c) => c?.slug === citySlug);
  
  if (!city) {
    return <Navigate to="/cities" replace />;
  }

  const hasPracticeAreas = safePracticeAreas.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={`Find Lawyers in ${city.name}, ${city.state} | LegalBridge`}
        description={`Browse lawyers by practice area in ${city.name}, ${city.state}. Find immigration, divorce, criminal defense, and more legal services.`}
        canonical={`https://legalbridge.app/cities/${city.slug}`}
      />

      <nav className="sticky top-0 z-50 glass-nav border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-accent" />
            <span className="font-serif text-lg text-foreground">LegalBridge</span>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link to="/cities"><ArrowLeft className="mr-1 h-3.5 w-3.5" /> All Cities</Link>
          </Button>
        </div>
      </nav>

      <section className="hero-gradient text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 text-accent mb-3">
              <MapPin className="h-5 w-5" />
              <span className="font-medium">{city.name}, {city.state}</span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl leading-tight mb-4">
              Choose a <span className="text-accent">Legal Department</span>
            </h1>
            <p className="text-primary-foreground/70 text-base md:text-lg max-w-2xl">
              Select a practice area to find qualified attorneys in {city.name}.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        {!hasPracticeAreas ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <h3 className="font-serif text-xl text-foreground mb-2">No practice areas available yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Practice area data is loading. Please check back soon or search for lawyers directly.
            </p>
            <Button variant="outline" asChild>
              <Link to="/client/find-lawyers">Search All Lawyers</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {safePracticeAreas.map((area, index) => {
              const Icon = ICONS[area?.slug || ""] || Briefcase;
              return (
                <motion.div
                  key={area?.slug || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                >
                  <Link to={`/lawyers/${area?.slug || ""}/${city.slug}`}>
                    <Card className="h-full hover:border-accent/40 hover:shadow-md transition-all duration-200 group cursor-pointer">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                            <Icon className="h-5 w-5 text-accent" />
                          </div>
                          <h2 className="font-semibold text-foreground group-hover:text-accent transition-colors text-sm">
                            {area?.name || "Unknown"}
                          </h2>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {(area?.description || "").slice(0, 80)}...
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="border-t bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} LegalBridge. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
