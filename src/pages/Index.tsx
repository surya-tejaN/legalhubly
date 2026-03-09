import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Scale, Shield, ArrowRight, Sparkles, MapPin, Briefcase,
  Menu, X, Star, Clock, BadgeCheck, Search, Locate,
  Users, Home, FileText, Gavel, Globe, Heart, Building2,
  Landmark, ScrollText,
} from "lucide-react";

const CATEGORIES = [
  { label: "Immigration", icon: Globe, color: "bg-info/10 text-info" },
  { label: "Divorce & Family", icon: Heart, color: "bg-destructive/10 text-destructive" },
  { label: "Criminal Defense", icon: Gavel, color: "bg-warning/10 text-warning" },
  { label: "Personal Injury", icon: Shield, color: "bg-success/10 text-success" },
  { label: "Employment Law", icon: Users, color: "bg-accent/10 text-accent" },
  { label: "Business Law", icon: Building2, color: "bg-info/10 text-info" },
  { label: "Real Estate", icon: Home, color: "bg-success/10 text-success" },
  { label: "Estate Planning", icon: ScrollText, color: "bg-accent/10 text-accent" },
  { label: "Civil Litigation", icon: Landmark, color: "bg-warning/10 text-warning" },
];

const POPULAR_LOCATIONS = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX",
  "Miami, FL", "Atlanta, GA", "Seattle, WA", "Phoenix, AZ",
];

const testimonials = [
  { name: "Jessica P.", role: "Business Owner", quote: "Found the right attorney in under 10 minutes.", rating: 5 },
  { name: "David C.", role: "Employment Attorney", quote: "Quality leads delivered straight to my inbox.", rating: 5 },
  { name: "Maria S.", role: "Immigration Client", quote: "The guided process made everything so clear.", rating: 5 },
];

const metrics = [
  { value: "500+", label: "Verified Lawyers" },
  { value: "98%", label: "Satisfaction" },
  { value: "< 2hr", label: "Avg Response" },
  { value: "Free", label: "To Start" },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5 },
};

type Step = "location" | "category";

export default function Index() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [step, setStep] = useState<Step>("location");
  const [locationInput, setLocationInput] = useState("");
  const [confirmedLocation, setConfirmedLocation] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter suggestions
  const suggestions = locationInput.trim().length > 0
    ? POPULAR_LOCATIONS.filter((l) => l.toLowerCase().includes(locationInput.toLowerCase()))
    : POPULAR_LOCATIONS;

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const confirmLocation = (loc: string) => {
    setConfirmedLocation(loc);
    setLocationInput(loc);
    setShowSuggestions(false);
    setStep("category");
  };

  const detectLocation = () => {
    setDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
            );
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.county || "";
            const state = data.address?.state || "";
            const loc = city && state ? `${city}, ${state}` : city || state || "Your Location";
            confirmLocation(loc);
          } catch {
            confirmLocation("Your Location");
          } finally {
            setDetecting(false);
          }
        },
        () => {
          setDetecting(false);
        },
        { timeout: 8000 }
      );
    } else {
      setDetecting(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    const params = new URLSearchParams();
    params.set("location", confirmedLocation);
    params.set("category", category);
    navigate(`/client/find-lawyers?${params.toString()}`);
  };

  const handleBack = () => {
    setStep("location");
    setConfirmedLocation("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-nav border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-accent" />
            <span className="font-serif text-lg tracking-tight text-foreground">LegalBridge</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="#reviews" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
            <Link to="/lawyer/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Lawyers</Link>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild><Link to="/client/dashboard">Sign In</Link></Button>
            <Button variant="gold" size="sm" asChild><Link to="/client/find-lawyers">Find a Lawyer</Link></Button>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-4 space-y-2">
            <a href="#how" className="block py-2 text-sm text-foreground" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            <a href="#reviews" className="block py-2 text-sm text-foreground" onClick={() => setMobileMenuOpen(false)}>Reviews</a>
            <Link to="/lawyer/dashboard" className="block py-2 text-sm text-foreground" onClick={() => setMobileMenuOpen(false)}>For Lawyers</Link>
            <div className="pt-3 border-t space-y-2">
              <Button variant="outline" className="w-full" asChild><Link to="/client/dashboard">Sign In</Link></Button>
              <Button variant="gold" className="w-full" asChild><Link to="/client/find-lawyers">Find a Lawyer</Link></Button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-28 pb-10 md:pt-40 md:pb-20">
        <div className="container">
          <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center">
            <AnimatePresence mode="wait">
              {step === "location" ? (
                <motion.div key="loc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  <h1 className="text-4xl md:text-[3.5rem] font-serif leading-[1.1] tracking-tight text-foreground mb-3">
                    Where do you need{" "}
                    <span className="text-gradient-gold">legal help?</span>
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    Enter your city, ZIP code, or detect your location.
                  </p>
                </motion.div>
              ) : (
                <motion.div key="cat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  <button onClick={handleBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Change location
                  </button>
                  <h1 className="text-4xl md:text-[3.5rem] font-serif leading-[1.1] tracking-tight text-foreground mb-2">
                    What do you need help with?
                  </h1>
                  <p className="text-lg text-muted-foreground mb-2">
                    Lawyers near <span className="text-foreground font-medium">{confirmedLocation}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* STEP 1: Location Input */}
          <AnimatePresence mode="wait">
            {step === "location" && (
              <motion.div
                key="location-input"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="max-w-xl mx-auto mt-6"
              >
                <div ref={wrapperRef} className="relative">
                  <div className="bg-card rounded-2xl border shadow-card p-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-background border">
                        <MapPin className="h-5 w-5 text-accent shrink-0" />
                        <input
                          ref={inputRef}
                          type="text"
                          value={locationInput}
                          onChange={(e) => { setLocationInput(e.target.value); setShowSuggestions(true); }}
                          onFocus={() => setShowSuggestions(true)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && locationInput.trim()) {
                              confirmLocation(locationInput.trim());
                            }
                          }}
                          placeholder="City or ZIP code..."
                          className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground min-w-0"
                          autoFocus
                        />
                        {locationInput && (
                          <button onClick={() => { setLocationInput(""); inputRef.current?.focus(); }} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <Button
                        variant="gold"
                        size="lg"
                        onClick={() => locationInput.trim() ? confirmLocation(locationInput.trim()) : inputRef.current?.focus()}
                        className="shrink-0"
                      >
                        <Search className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Search</span>
                      </Button>
                    </div>
                  </div>

                  {/* Suggestions dropdown */}
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-elevated z-30 overflow-hidden">
                      {/* Detect location button */}
                      <button
                        onClick={detectLocation}
                        disabled={detecting}
                        className="w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm font-medium text-accent hover:bg-accent/5 transition-colors border-b"
                      >
                        <Locate className={`h-4 w-4 ${detecting ? "animate-pulse" : ""}`} />
                        {detecting ? "Detecting your location..." : "Use my current location"}
                      </button>

                      {suggestions.length > 0 && (
                        <div className="py-1">
                          <div className="px-5 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Popular cities
                          </div>
                          {suggestions.map((loc) => (
                            <button
                              key={loc}
                              onClick={() => confirmLocation(loc)}
                              className="w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm text-foreground hover:bg-muted transition-colors"
                            >
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              {loc}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Category Grid */}
            {step === "category" && (
              <motion.div
                key="category-grid"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="max-w-3xl mx-auto mt-8"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat, i) => (
                    <motion.button
                      key={cat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.04 }}
                      onClick={() => handleCategorySelect(cat.label)}
                      className="group flex items-center gap-3 p-4 rounded-xl bg-card border shadow-card hover:shadow-card-hover hover:border-accent/25 transition-all duration-200 text-left"
                    >
                      <div className={`h-10 w-10 rounded-xl ${cat.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                        <cat.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground">{cat.label}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-accent transition-all inline-block ml-1.5 -translate-x-1 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* TRUST METRICS */}
      <section className="py-8 border-y bg-card/50 mt-6">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((m) => (
              <div key={m.label} className="text-center">
                <div className="text-xl md:text-2xl font-serif text-foreground">{m.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 md:py-28">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-14 max-w-lg mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-3">How it works</h2>
            <p className="text-muted-foreground">Three steps to the right lawyer.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: "1", icon: MapPin, title: "Enter your location", desc: "Type a city, ZIP code, or let us detect where you are." },
              { step: "2", icon: Briefcase, title: "Pick your legal need", desc: "Choose a category so we match you with the right specialists." },
              { step: "3", icon: Sparkles, title: "Get matched instantly", desc: "See ranked, verified lawyers with ratings, fees, and availability." },
            ].map((s, i) => (
              <motion.div key={s.step} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center p-8 rounded-2xl bg-card border shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="h-14 w-14 rounded-2xl bg-accent/8 flex items-center justify-center mx-auto mb-5">
                  <s.icon className="h-6 w-6 text-accent" />
                </div>
                <span className="text-[11px] font-bold text-accent/60 uppercase tracking-widest">Step {s.step}</span>
                <h3 className="text-lg font-semibold text-foreground mt-2 mb-2 font-sans">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="reviews" className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-3">What people say</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-card border shadow-card"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-5">"{t.quote}"</p>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center p-10 md:p-16 rounded-3xl hero-gradient relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, hsl(43 56% 54%), transparent 50%)" }} />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-serif text-primary-foreground mb-4">Ready to find your lawyer?</h2>
              <p className="text-primary-foreground/60 text-lg mb-8 max-w-md mx-auto">Free to search. Book a consultation in minutes.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button variant="gold" size="lg" onClick={() => { setStep("location"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                  Get Started Free <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
                <Button variant="hero-outline" size="lg" asChild>
                  <Link to="/lawyer/dashboard">I'm a Lawyer</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-card/50 py-10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-accent" />
              <span className="font-serif text-foreground">LegalBridge</span>
            </Link>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 LegalBridge</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
