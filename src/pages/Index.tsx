import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Scale, Shield, ArrowRight, Sparkles, MapPin, Briefcase,
  Menu, X, Star, Clock, BadgeCheck, ChevronDown, Search,
} from "lucide-react";

const LOCATIONS = [
  "California", "New York", "Texas", "Florida", "Illinois",
  "Georgia", "Washington", "Arizona", "Massachusetts", "Colorado",
];

const CATEGORIES = [
  { label: "Personal Injury", icon: "🩹" },
  { label: "Family Law", icon: "👨‍👩‍👧" },
  { label: "Criminal Defense", icon: "⚖️" },
  { label: "Immigration", icon: "🌍" },
  { label: "Employment Law", icon: "💼" },
  { label: "Business Law", icon: "🏢" },
  { label: "Real Estate", icon: "🏠" },
  { label: "Estate Planning", icon: "📜" },
  { label: "Intellectual Property", icon: "💡" },
  { label: "Civil Litigation", icon: "📋" },
];

const testimonials = [
  { name: "Jessica P.", role: "Business Owner", quote: "Found the right attorney in under 10 minutes. Incredibly easy.", rating: 5 },
  { name: "David C.", role: "Employment Attorney", quote: "Quality leads delivered straight to my inbox. Game changer.", rating: 5 },
  { name: "Maria S.", role: "Immigration Client", quote: "The guided process made everything clear before I even called a lawyer.", rating: 5 },
];

const metrics = [
  { value: "500+", label: "Verified Lawyers" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "< 2hr", label: "Avg Response" },
  { value: "Free", label: "To Get Started" },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5 },
};

export default function Index() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedLocation) params.set("location", selectedLocation);
    if (selectedCategory) params.set("category", selectedCategory);
    navigate(`/client/find-lawyers?${params.toString()}`);
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

      {/* HERO — Search Funnel */}
      <section className="pt-28 pb-16 md:pt-40 md:pb-24">
        <div className="container">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-serif leading-[1.1] tracking-tight text-foreground mb-4">
              Find the right lawyer,{" "}
              <span className="text-gradient-gold">fast.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Tell us where you are and what you need. We'll match you with verified attorneys in minutes.
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-card rounded-2xl border shadow-card p-3 md:p-4">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Location select */}
                <div className="relative flex-1">
                  <button
                    onClick={() => setLocationOpen(!locationOpen)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-background border text-left transition-colors hover:border-accent/30"
                  >
                    <MapPin className="h-4 w-4 text-accent shrink-0" />
                    <span className={`text-sm flex-1 ${selectedLocation ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {selectedLocation || "Select location"}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${locationOpen ? "rotate-180" : ""}`} />
                  </button>
                  {locationOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-xl shadow-elevated z-20 py-1 max-h-52 overflow-y-auto">
                      {LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => { setSelectedLocation(loc); setLocationOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted ${selectedLocation === loc ? "text-accent font-medium bg-accent/5" : "text-foreground"}`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category select */}
                <div className="relative flex-1">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-background border text-sm appearance-none cursor-pointer transition-colors hover:border-accent/30 focus:outline-none focus:border-accent/40"
                  >
                    <option value="">Legal category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.label} value={cat.label}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Search button */}
                <Button variant="gold" size="lg" onClick={handleSearch} className="md:px-8 shrink-0">
                  <Search className="h-4 w-4 mr-2 md:mr-0 md:hidden" />
                  <span className="md:hidden">Search</span>
                  <span className="hidden md:inline">Find Lawyers</span>
                  <ArrowRight className="hidden md:inline ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick category chips */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => { setSelectedCategory(cat.label); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedCategory === cat.label
                      ? "bg-accent/10 border-accent/30 text-accent"
                      : "bg-card border-border text-muted-foreground hover:border-accent/20 hover:text-foreground"
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST METRICS */}
      <section className="py-6 border-y bg-card/50">
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
            <p className="text-muted-foreground">Three simple steps to legal help.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: "1", icon: MapPin, title: "Tell us your location", desc: "Select your state so we can match you with locally licensed attorneys." },
              { step: "2", icon: Briefcase, title: "Choose your legal need", desc: "Pick a category — from family law to business disputes — and we'll narrow the field." },
              { step: "3", icon: Sparkles, title: "Get matched instantly", desc: "View ranked lawyers with ratings, availability, and free consultation options." },
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

      {/* WHY TRUST US */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-14 max-w-lg mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-3">Why LegalBridge</h2>
            <p className="text-muted-foreground">Built for trust, speed, and transparency.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {[
              { icon: BadgeCheck, title: "Verified Attorneys", desc: "Every lawyer is credentialed and background-checked." },
              { icon: Clock, title: "Fast Responses", desc: "Average response time under 2 hours." },
              { icon: Shield, title: "Secure & Private", desc: "Bank-level encryption for all your data." },
              { icon: Star, title: "Highly Rated", desc: "98% client satisfaction across the platform." },
            ].map((item, i) => (
              <motion.div key={item.title} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-6 rounded-2xl bg-card border shadow-card"
              >
                <div className="h-11 w-11 rounded-xl bg-accent/8 flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1 font-sans">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="reviews" className="py-20 md:py-28">
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

      {/* FINAL CTA */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center p-10 md:p-16 rounded-3xl hero-gradient relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, hsl(43 56% 54%), transparent 50%)" }} />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-serif text-primary-foreground mb-4">
                Ready to find your lawyer?
              </h2>
              <p className="text-primary-foreground/60 text-lg mb-8 max-w-md mx-auto">
                It's free to search and get matched. Book a consultation in minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button variant="gold" size="lg" asChild>
                  <Link to="/client/find-lawyers">Get Started Free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
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
