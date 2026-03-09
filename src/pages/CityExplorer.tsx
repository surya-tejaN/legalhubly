import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Scale, MapPin, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SeoHead from "@/components/SeoHead";
import { SEO_CITIES } from "@/lib/seo-data";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5 },
};

const CITY_DATA = SEO_CITIES.map((city, index) => ({
  ...city,
  lawyerCount: 150 + Math.floor(Math.random() * 350),
  popularAreas: [
    ["Immigration", "Family Law", "Criminal Defense"],
    ["Personal Injury", "Business Law", "Real Estate"],
    ["Employment", "Estate Planning", "Civil Litigation"],
    ["Bankruptcy", "Tax Law", "IP Law"],
  ][index % 4],
}));

export default function CityExplorer() {
  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Find Lawyers by City | LegalBridge"
        description="Browse lawyers in major US cities. Find top-rated attorneys in New York, Los Angeles, Chicago, Houston, and more."
        canonical="https://legalbridge.app/cities"
      />

      <nav className="sticky top-0 z-50 glass-nav border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-accent" />
            <span className="font-serif text-lg text-foreground">LegalBridge</span>
          </Link>
          <Button variant="gold" size="sm" asChild>
            <Link to="/client/find-lawyers">Search All <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      </nav>

      <section className="hero-gradient text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <motion.div {...fadeUp}>
            <h1 className="font-serif text-3xl md:text-5xl leading-tight mb-4">
              Find Lawyers in <span className="text-accent">Your City</span>
            </h1>
            <p className="text-primary-foreground/70 text-base md:text-lg max-w-2xl">
              Browse attorneys across 20 major US cities. Select your location to explore available legal services.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CITY_DATA.map((city, index) => (
            <motion.div
              key={city.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.03 }}
            >
              <Link to={`/cities/${city.slug}`}>
                <Card className="h-full hover:border-accent/40 hover:shadow-md transition-all duration-200 group cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-accent shrink-0" />
                        <h2 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                          {city.name}
                        </h2>
                      </div>
                      <span className="text-xs text-muted-foreground">{city.state}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                      <Users className="h-3.5 w-3.5" />
                      <span>{city.lawyerCount}+ lawyers</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {city.popularAreas.map((area) => (
                        <Badge 
                          key={area} 
                          variant="secondary" 
                          className="text-[10px] px-2 py-0.5 font-medium"
                        >
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <footer className="border-t bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} LegalBridge. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
