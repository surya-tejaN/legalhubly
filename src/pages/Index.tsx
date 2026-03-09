import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Scale, Shield, ArrowRight, Sparkles, MapPin, Briefcase,
  Menu, X, Star, Clock, BadgeCheck, Search, Locate,
  Users, Home, Gavel, Globe, Heart, Building2,
  Landmark, ScrollText, ChevronRight,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Find Lawyer", href: "/client/find-lawyers" },
  { label: "Practice Areas", href: "#practice-areas" },
  { label: "How It Works", href: "#how" },
  { label: "For Lawyers", href: "/lawyer/dashboard", isRoute: true },
];

const CATEGORIES = [
  { label: "Immigration", icon: Globe, desc: "Visas, green cards, asylum" },
  { label: "Divorce & Family", icon: Heart, desc: "Custody, support, adoption" },
  { label: "Criminal Defense", icon: Gavel, desc: "DUI, felony, misdemeanor" },
  { label: "Personal Injury", icon: Shield, desc: "Accidents, malpractice" },
  { label: "Employment Law", icon: Users, desc: "Wrongful termination, discrimination" },
  { label: "Business Law", icon: Building2, desc: "Contracts, formation, disputes" },
  { label: "Real Estate", icon: Home, desc: "Purchase, lease, zoning" },
  { label: "Estate Planning", icon: ScrollText, desc: "Wills, trusts, probate" },
  { label: "Civil Litigation", icon: Landmark, desc: "Lawsuits, appeals, mediation" },
];

const POPULAR_LOCATIONS = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX",
  "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA",
  "Dallas, TX", "San Jose, CA", "Austin, TX", "Jacksonville, FL",
  "San Francisco, CA", "Columbus, OH", "Indianapolis, IN", "Charlotte, NC",
  "Seattle, WA", "Denver, CO", "Boston, MA", "Atlanta, GA",
];

const testimonials = [
  { name: "Jessica Park", role: "Business Owner", quote: "Found the right attorney in under 10 minutes. The whole experience felt effortless.", rating: 5, initials: "JP" },
  { name: "David Chen", role: "Employment Attorney", quote: "Quality leads delivered straight to my inbox. Cut my intake admin by 70%.", rating: 5, initials: "DC" },
  { name: "Maria Santos", role: "Immigration Client", quote: "The guided process made everything clear before I even spoke to a lawyer.", rating: 5, initials: "MS" },
];

const trustPoints = [
  { icon: BadgeCheck, value: "500+", label: "Verified Lawyers" },
  { icon: Star, value: "98%", label: "Client Satisfaction" },
  { icon: Clock, value: "< 2hr", label: "Avg Response Time" },
  { icon: Shield, value: "Free", label: "To Get Started" },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6 },
};

const staggerChild = (i: number) => ({
  transition: { duration: 0.5, delay: i * 0.06 },
});

type Step = "location" | "category";

// ─── Component ───────────────────────────────────────────────────────────────

export default function Index() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [step, setStep] = useState<Step>("location");
  const [locationInput, setLocationInput] = useState("");
  const [confirmedLocation, setConfirmedLocation] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions = locationInput.trim().length > 0
    ? POPULAR_LOCATIONS.filter((l) => l.toLowerCase().includes(locationInput.toLowerCase()))
    : POPULAR_LOCATIONS;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.county || "";
            const state = data.address?.state || "";
            confirmLocation(city && state ? `${city}, ${state}` : city || state || "Your Location");
          } catch { confirmLocation("Your Location"); }
          finally { setDetecting(false); }
        },
        () => setDetecting(false),
        { timeout: 8000 }
      );
    } else setDetecting(false);
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
    <div className="min-h-screen bg-background">

      {/* ═══ NAVIGATION ═══ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "glass-nav border-b border-border/50 shadow-card" : "bg-transparent"}`}>
        <div className="container flex items-center justify-between h-[72px]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/15 transition-colors">
              <Scale className="h-5 w-5 text-accent" />
            </div>
            <span className="font-serif text-xl tracking-tight text-foreground">LegalBridge</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) =>
              link.isRoute ? (
                <Link key={link.label} to={link.href} className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all duration-200">
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href} className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all duration-200">
                  {link.label}
                </a>
              )
            )}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/client/dashboard">Sign In</Link>
            </Button>
            <Button variant="gold" size="sm" asChild>
              <Link to="/client/find-lawyers">Find a Lawyer <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden border-t bg-background"
            >
              <div className="container py-4 space-y-1">
                {NAV_LINKS.map((link) =>
                  link.isRoute ? (
                    <Link key={link.label} to={link.href} className="block py-3 px-3 text-sm font-medium text-foreground rounded-lg hover:bg-muted/50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      {link.label}
                    </Link>
                  ) : (
                    <a key={link.label} href={link.href} className="block py-3 px-3 text-sm font-medium text-foreground rounded-lg hover:bg-muted/50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      {link.label}
                    </a>
                  )
                )}
                <div className="pt-4 border-t mt-3 space-y-2">
                  <Button variant="outline" className="w-full" asChild><Link to="/client/dashboard">Sign In</Link></Button>
                  <Button variant="gold" className="w-full" asChild><Link to="/client/find-lawyers">Find a Lawyer</Link></Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-12 md:pt-44 md:pb-20 overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, hsl(42 78% 55% / 0.05), transparent)" }} />

        <div className="container relative">
          <AnimatePresence mode="wait">
            {step === "location" ? (
              <motion.div key="loc-hero" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/6 border border-accent/12 text-accent text-[12px] font-semibold mb-6">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI-Powered Legal Matching
                </div>
                <h1 className="text-[2.5rem] md:text-[3.75rem] font-serif leading-[1.08] tracking-tight text-foreground mb-5">
                  Where do you need<br className="hidden sm:block" />{" "}
                  <span className="text-gradient-gold">legal help?</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  Enter your city or ZIP code. We'll match you with verified attorneys nearby.
                </p>
              </motion.div>
            ) : (
              <motion.div key="cat-hero" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="max-w-2xl mx-auto text-center">
                <button onClick={handleBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors group">
                  <ArrowRight className="h-3.5 w-3.5 rotate-180 group-hover:-translate-x-0.5 transition-transform" /> Change location
                </button>
                <h1 className="text-[2.5rem] md:text-[3.75rem] font-serif leading-[1.08] tracking-tight text-foreground mb-3">
                  What type of <span className="text-gradient-gold">legal help?</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Showing lawyers near <span className="text-foreground font-semibold">{confirmedLocation}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── STEP 1: Location ─── */}
          <AnimatePresence mode="wait">
            {step === "location" && (
              <motion.div
                key="loc-input"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="max-w-xl mx-auto mt-10"
              >
                <div ref={wrapperRef} className="relative">
                  <div className="bg-card rounded-2xl border shadow-elevated p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-background border border-border/60 focus-within:border-accent/30 focus-within:ring-2 focus-within:ring-accent/10 transition-all">
                        <MapPin className="h-5 w-5 text-accent shrink-0" />
                        <input
                          ref={inputRef}
                          type="text"
                          value={locationInput}
                          onChange={(e) => { setLocationInput(e.target.value); setShowSuggestions(true); }}
                          onFocus={() => setShowSuggestions(true)}
                          onKeyDown={(e) => { if (e.key === "Enter" && locationInput.trim()) confirmLocation(locationInput.trim()); }}
                          placeholder="Enter city or ZIP code..."
                          className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60 min-w-0"
                          autoFocus
                        />
                        {locationInput && (
                          <button onClick={() => { setLocationInput(""); inputRef.current?.focus(); }} className="text-muted-foreground hover:text-foreground transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <Button
                        variant="gold"
                        size="lg"
                        onClick={() => locationInput.trim() ? confirmLocation(locationInput.trim()) : inputRef.current?.focus()}
                        className="shrink-0 px-6"
                      >
                        <Search className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Search</span>
                      </Button>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <AnimatePresence>
                    {showSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-2xl shadow-elevated z-30 overflow-hidden"
                      >
                        <button
                          onClick={detectLocation}
                          disabled={detecting}
                          className="w-full flex items-center gap-3 px-5 py-4 text-left text-sm font-medium text-accent hover:bg-accent/5 transition-colors border-b"
                        >
                          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                            <Locate className={`h-4 w-4 ${detecting ? "animate-pulse" : ""}`} />
                          </div>
                          <div>
                            <div className="font-semibold">{detecting ? "Detecting..." : "Use my current location"}</div>
                            <div className="text-xs text-muted-foreground font-normal">Auto-detect city via GPS</div>
                          </div>
                        </button>

                        {suggestions.length > 0 && (
                          <div className="py-2 max-h-64 overflow-y-auto">
                            <div className="px-5 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                              Popular cities
                            </div>
                            {suggestions.map((loc) => (
                              <button
                                key={loc}
                                onClick={() => confirmLocation(loc)}
                                className="w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm text-foreground hover:bg-muted/60 transition-colors group"
                              >
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent transition-colors" />
                                <span>{loc}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground ml-auto transition-all" />
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 2: Categories ─── */}
            {step === "category" && (
              <motion.div
                key="cat-grid"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="max-w-3xl mx-auto mt-10"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat, i) => (
                    <motion.button
                      key={cat.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      {...staggerChild(i)}
                      onClick={() => handleCategorySelect(cat.label)}
                      className="group flex items-center gap-4 p-5 rounded-2xl bg-card border border-border/60 shadow-card hover:shadow-card-hover hover:border-accent/20 transition-all duration-300 text-left"
                    >
                      <div className="h-12 w-12 rounded-xl bg-accent/8 flex items-center justify-center shrink-0 group-hover:bg-accent/12 group-hover:scale-105 transition-all duration-300">
                        <cat.icon className="h-5.5 w-5.5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">{cat.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{cat.desc}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-accent shrink-0 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section className="py-10 border-y border-border/50 bg-muted/20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustPoints.map((t, i) => (
              <motion.div key={t.label} {...fadeUp} {...staggerChild(i)} className="flex items-center gap-3 justify-center md:justify-start">
                <div className="h-10 w-10 rounded-xl bg-accent/8 flex items-center justify-center shrink-0">
                  <t.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-xl font-serif text-foreground leading-none">{t.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRACTICE AREAS BROWSE ═══ */}
      <section id="practice-areas" className="py-24 md:py-32">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-16 max-w-lg mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-3 block">Practice Areas</span>
            <h2 className="text-3xl md:text-[2.75rem] font-serif text-foreground leading-tight mb-4">Browse by legal category</h2>
            <p className="text-muted-foreground text-lg">Select a practice area to find specialized attorneys in your area.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.label} {...fadeUp} {...staggerChild(i)}>
                <Link
                  to={`/client/find-lawyers?category=${encodeURIComponent(cat.label)}`}
                  className="group flex items-center gap-4 p-6 rounded-2xl bg-card border border-border/60 shadow-card hover:shadow-card-hover hover:border-accent/20 transition-all duration-300"
                >
                  <div className="h-12 w-12 rounded-xl bg-accent/8 flex items-center justify-center shrink-0 group-hover:bg-accent/12 group-hover:scale-105 transition-all duration-300">
                    <cat.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">{cat.label}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{cat.desc}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-accent shrink-0 transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" className="py-24 md:py-32 bg-muted/20">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-16 max-w-lg mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-3 block">How It Works</span>
            <h2 className="text-3xl md:text-[2.75rem] font-serif text-foreground leading-tight mb-4">Three steps to the right lawyer</h2>
            <p className="text-muted-foreground text-lg">Simple, fast, and completely free to start.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", icon: MapPin, title: "Enter your location", desc: "Type a city, ZIP code, or let us detect where you are automatically." },
              { step: "02", icon: Briefcase, title: "Choose your legal need", desc: "Select a practice area so we can match you with the right specialists." },
              { step: "03", icon: Sparkles, title: "Get matched instantly", desc: "View ranked, verified lawyers with ratings, fees, and availability." },
            ].map((s, i) => (
              <motion.div key={s.step} {...fadeUp} {...staggerChild(i)}
                className="relative text-center p-10 rounded-2xl bg-card border border-border/60 shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <span className="absolute top-5 right-6 text-[3rem] font-serif text-accent/8 leading-none">{s.step}</span>
                <div className="h-16 w-16 rounded-2xl bg-accent/8 flex items-center justify-center mx-auto mb-6">
                  <s.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 font-sans">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="reviews" className="py-24 md:py-32">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-16 max-w-lg mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-3 block">Testimonials</span>
            <h2 className="text-3xl md:text-[2.75rem] font-serif text-foreground leading-tight">Trusted by thousands</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} {...fadeUp} {...staggerChild(i)}
                className="p-8 rounded-2xl bg-card border border-border/60 shadow-card"
              >
                <div className="flex gap-0.5 mb-5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center p-12 md:p-20 rounded-3xl hero-gradient relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 25% 40%, hsl(42 78% 55%), transparent 50%), radial-gradient(circle at 75% 70%, hsl(42 78% 55%), transparent 40%)" }} />
            <div className="relative">
              <h2 className="text-3xl md:text-[2.75rem] font-serif text-primary-foreground leading-tight mb-5">
                Ready to find your lawyer?
              </h2>
              <p className="text-primary-foreground/60 text-lg mb-10 max-w-md mx-auto">
                It's free to search and get matched. Book a consultation in minutes.
              </p>
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

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t bg-card/30 pt-16 pb-8">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <Scale className="h-5 w-5 text-accent" />
                <span className="font-serif text-lg text-foreground">LegalBridge</span>
              </Link>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                AI-powered legal marketplace connecting clients with verified attorneys.
              </p>
            </div>
            {[
              { title: "Platform", links: [{ label: "Find a Lawyer", href: "/client/find-lawyers" }, { label: "Practice Areas", href: "#practice-areas" }, { label: "How It Works", href: "#how" }] },
              { title: "For Lawyers", links: [{ label: "Lawyer Dashboard", href: "/lawyer/dashboard" }, { label: "Pricing", href: "/admin/pricing" }] },
              { title: "Company", links: [{ label: "Privacy Policy", href: "#" }, { label: "Terms of Service", href: "#" }, { label: "Contact", href: "#" }] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© 2026 LegalBridge. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
