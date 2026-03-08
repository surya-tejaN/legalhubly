import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Scale,
  Shield,
  Users,
  Bot,
  FileText,
  Calendar,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Menu,
  X,
  Star,
  Zap,
  Clock,
  DollarSign,
  Eye,
  Upload,
  BarChart3,
  ChevronDown,
  CreditCard,
  Lock,
  Timer,
  BadgeCheck,
  Play,
  Quote,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const trustItems = [
  { icon: BadgeCheck, label: "Verified Attorneys", desc: "Every lawyer is credentialed and background-checked" },
  { icon: Lock, label: "Secure Documents", desc: "Bank-level encryption for all uploads & communications" },
  { icon: DollarSign, label: "Transparent Pricing", desc: "No hidden fees — see costs before you commit" },
  { icon: Timer, label: "Fast Response", desc: "Average lawyer response time under 2 hours" },
];

const platformModules = [
  { icon: Bot, title: "Smart Intake", desc: "AI-guided intake classifies your legal issue in minutes and prepares a case brief for lawyers." },
  { icon: Sparkles, title: "AI Matching", desc: "Our algorithm scores lawyers by expertise, availability, reviews, and proximity to match you perfectly." },
  { icon: Eye, title: "Client Portal", desc: "A single dashboard to track cases, upload documents, message your lawyer, and manage payments." },
  { icon: Briefcase, title: "Lawyer Workspace", desc: "CRM, lead pipeline, calendar, AI document drafting, and billing — all in one practice hub." },
  { icon: CreditCard, title: "Payments", desc: "Secure invoicing and payments with transparent fee breakdowns and automatic receipt generation." },
  { icon: Zap, title: "AI Agents", desc: "Six specialized agents handle intake, summarization, drafting, support, qualification, and productivity." },
];

const clientSteps = [
  { num: "01", title: "Describe Your Issue", desc: "Answer a few guided questions. Our AI classifies your matter and prepares a case summary.", icon: MessageSquare },
  { num: "02", title: "Get Matched", desc: "Receive a ranked list of verified lawyers matched to your case type, location, and budget.", icon: Users },
  { num: "03", title: "Book Consultation", desc: "Schedule a video, phone, or in-person consultation directly on your matched lawyer's calendar.", icon: Calendar },
  { num: "04", title: "Upload Documents", desc: "Securely share contracts, letters, and evidence through encrypted document storage.", icon: Upload },
  { num: "05", title: "Track Progress", desc: "Monitor every milestone, deadline, and communication in your personal case dashboard.", icon: BarChart3 },
];

const lawyerSteps = [
  { num: "01", title: "Receive Qualified Leads", desc: "AI pre-screens clients and scores lead quality so you only see serious inquiries.", icon: Users },
  { num: "02", title: "Auto-Summarized Cases", desc: "Every lead arrives with an AI-generated case brief — no more back-and-forth for basic details.", icon: FileText },
  { num: "03", title: "Draft Documents Faster", desc: "Generate contracts, demand letters, and motions with AI templates pre-filled from case data.", icon: Sparkles },
  { num: "04", title: "Manage Everything in One Place", desc: "Clients, cases, calendar, billing, and messaging — unified in a single workspace.", icon: Briefcase },
];

const testimonials = [
  { name: "Jessica Park", role: "Business Owner", quote: "I described my lease dispute and had a matched lawyer reviewing my case within 90 minutes. The whole experience felt effortless.", rating: 5, avatar: "JP" },
  { name: "David Chen", role: "Employment Attorney", quote: "LegalBridge cut my intake admin by 70%. The AI case summaries are incredibly accurate — I can evaluate leads in seconds.", rating: 5, avatar: "DC" },
  { name: "Maria Santos", role: "Immigration Client", quote: "The AI intake walked me through everything step by step. I finally understood my options before even speaking to a lawyer.", rating: 5, avatar: "MS" },
];

const metrics = [
  { value: "10,000+", label: "Cases Handled" },
  { value: "500+", label: "Verified Lawyers" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "< 2hr", label: "Avg. Response Time" },
  { value: "70%", label: "Less Admin for Lawyers" },
  { value: "45,000+", label: "AI Agent Actions" },
];

const faqs = [
  { q: "How does AI matching work?", a: "Our algorithm analyzes your legal issue, budget, location, and urgency to score and rank lawyers. Factors include specialty match, client reviews, response time history, and availability." },
  { q: "Is my information secure?", a: "Absolutely. All documents and messages are encrypted with AES-256 encryption. We're SOC 2 compliant and follow attorney-client privilege standards." },
  { q: "What does it cost?", a: "Creating an account and getting matched is free. You only pay when you book a consultation or engage a lawyer. All fees are shown upfront before you commit." },
  { q: "How are lawyers verified?", a: "Every lawyer undergoes bar verification, background checks, and credential validation. We also monitor client reviews and satisfaction scores continuously." },
  { q: "Can lawyers try the platform before committing?", a: "Yes. Lawyers can create a free profile, explore the workspace, and receive a limited number of leads before choosing a subscription plan." },
  { q: "What types of legal issues are supported?", a: "We cover employment, business, real estate, family, immigration, IP, criminal defense, personal injury, and more. Our AI intake can classify virtually any legal matter." },
];

const footerLinks = {
  Product: ["Features", "AI Agents", "Pricing", "Security"],
  Company: ["About", "Careers", "Press", "Contact"],
  Resources: ["Blog", "Help Center", "API Docs", "Status"],
  Legal: ["Privacy", "Terms", "Cookie Policy"],
};

// ─── Animation helpers ───────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

const stagger = (delay: number) => ({ transition: { duration: 0.5, delay } });

// ─── Component ───────────────────────────────────────────────────────────────

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ═══════════════════ NAV ═══════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
        <div className="container flex items-center justify-between h-[72px]">
          <Link to="/" className="flex items-center gap-2.5">
            <Scale className="h-7 w-7 text-accent" />
            <span className="font-serif text-xl tracking-tight text-foreground">LegalBridge</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <a href="#platform" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">Platform</a>
            <a href="#how-clients" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">For Clients</a>
            <a href="#how-lawyers" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">For Lawyers</a>
            <a href="#testimonials" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            <a href="#faq" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild><Link to="/client/dashboard">Client Portal</Link></Button>
            <Button variant="ghost" size="sm" asChild><Link to="/lawyer/dashboard">Lawyer Portal</Link></Button>
            <Button variant="gold" size="sm">Book a Demo</Button>
          </div>

          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden overflow-hidden border-t bg-background">
              <div className="container py-5 flex flex-col gap-1">
                {["Platform", "For Clients", "For Lawyers", "Testimonials", "FAQ"].map(l => (
                  <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="py-3 text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>{l}</a>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t mt-2">
                  <Button variant="outline" asChild><Link to="/client/dashboard">Client Portal</Link></Button>
                  <Button variant="outline" asChild><Link to="/lawyer/dashboard">Lawyer Portal</Link></Button>
                  <Button variant="gold">Book a Demo</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-36 overflow-hidden">
        {/* Subtle radial bg */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, hsl(43 56% 54% / 0.06), transparent)" }} />

        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/8 border border-accent/15 text-accent text-[13px] font-semibold mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Legal Platform
            </div>

            <h1 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4.25rem] font-serif leading-[1.1] tracking-tight text-foreground mb-6">
              Legal help, redesigned for<br className="hidden md:block" />{" "}
              <span className="text-gradient-gold">speed, trust, and clarity.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Clients get matched faster. Lawyers automate intake, documents, and follow-up with AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/client/dashboard">Find Legal Help <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/lawyer/dashboard">Join as Lawyer <Briefcase className="ml-1.5 h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" size="lg" className="border-border">
                <Play className="mr-1.5 h-4 w-4" /> Book a Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ TRUST BAR ═══════════════════ */}
      <section className="py-6 border-y bg-card/50">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustItems.map((item, i) => (
              <motion.div key={item.label} {...fadeUp} {...stagger(i * 0.08)} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent/8 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground leading-snug">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PLATFORM OVERVIEW ═══════════════════ */}
      <section id="platform" className="py-24 md:py-32">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-3 block">Platform</span>
            <h2 className="text-3xl md:text-[2.75rem] font-serif text-foreground leading-tight mb-4">One platform. Every legal workflow.</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              From first consultation to final resolution — intake, matching, communication, documents, payments, and AI agents — unified.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {platformModules.map((mod, i) => (
              <motion.div key={mod.title} {...fadeUp} {...stagger(i * 0.08)}
                className="group relative p-7 rounded-2xl bg-card border border-border/80 shadow-card hover:shadow-card-hover hover:border-accent/20 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-accent/8 flex items-center justify-center mb-5 group-hover:bg-accent/15 transition-colors">
                  <mod.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{mod.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{mod.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS — CLIENTS ═══════════════════ */}
      <section id="how-clients" className="py-24 md:py-32 bg-muted/30">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-3 block">For Clients</span>
            <h2 className="text-3xl md:text-[2.75rem] font-serif text-foreground leading-tight mb-4">Get legal help in 5 steps</h2>
            <p className="text-muted-foreground text-lg">From describing your issue to tracking resolution — guided by AI every step of the way.</p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {clientSteps.map((step, i) => (
              <motion.div key={step.num} {...fadeUp} {...stagger(i * 0.08)}
                className="flex items-start gap-5 p-6 rounded-2xl bg-card border shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-2xl font-serif text-accent/40 font-bold">{step.num}</span>
                </div>
                <div className="h-11 w-11 rounded-xl bg-accent/8 flex items-center justify-center shrink-0 mt-0.5">
                  <step.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} {...stagger(0.4)} className="text-center mt-10">
            <Button variant="gold" size="lg" asChild>
              <Link to="/client/intake">Start Your Case <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS — LAWYERS ═══════════════════ */}
      <section id="how-lawyers" className="py-24 md:py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-3 block">For Lawyers</span>
              <h2 className="text-3xl md:text-[2.75rem] font-serif text-foreground leading-tight mb-4">Grow your practice with AI</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Stop wasting time on unqualified leads and manual paperwork. LegalBridge gives you AI-powered tools to convert more clients and deliver better outcomes.
              </p>
              <Button variant="gold" size="lg" asChild>
                <Link to="/lawyer/dashboard">Explore Lawyer Workspace <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
            </motion.div>

            <div className="space-y-4">
              {lawyerSteps.map((step, i) => (
                <motion.div key={step.num} {...fadeUp} {...stagger(i * 0.1)}
                  className="flex items-start gap-4 p-5 rounded-xl bg-card border shadow-card"
                >
                  <div className="h-10 w-10 rounded-lg bg-accent/8 flex items-center justify-center shrink-0">
                    <step.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-accent/50 uppercase tracking-wider">Step {step.num}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-0.5">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ PRODUCT SHOWCASE ═══════════════════ */}
      <section className="py-24 md:py-32 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, hsl(43 56% 54%), transparent 40%), radial-gradient(circle at 70% 80%, hsl(43 56% 54%), transparent 40%)" }} />
        <div className="container relative">
          <motion.div {...fadeUp} className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-3 block">Product Preview</span>
            <h2 className="text-3xl md:text-[2.75rem] font-serif text-primary-foreground leading-tight mb-4">
              A workspace designed for modern legal work
            </h2>
            <p className="text-primary-foreground/60 text-lg">Premium dashboards for clients and lawyers — clean, fast, and intelligent.</p>
          </motion.div>

          {/* Mock dashboard cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <motion.div {...fadeUp} {...stagger(0)}
              className="rounded-2xl bg-navy-light/60 border border-navy-lighter/30 backdrop-blur-sm p-6 md:p-8"
            >
              <div className="flex items-center gap-2 mb-5">
                <Eye className="h-5 w-5 text-accent" />
                <span className="text-sm font-semibold text-primary-foreground">Client Dashboard</span>
              </div>
              <div className="space-y-3">
                {["Active Cases: 3", "Unread Messages: 2", "Upcoming Consultation: Mar 12", "Documents: 12 files"].map(item => (
                  <div key={item} className="flex items-center gap-3 p-3 rounded-lg bg-navy-lighter/20 border border-navy-lighter/20">
                    <CheckCircle2 className="h-4 w-4 text-accent/70 shrink-0" />
                    <span className="text-sm text-primary-foreground/80">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <Button variant="gold" size="sm" asChild>
                  <Link to="/client/dashboard">Open Client Portal <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </motion.div>

            <motion.div {...fadeUp} {...stagger(0.1)}
              className="rounded-2xl bg-navy-light/60 border border-navy-lighter/30 backdrop-blur-sm p-6 md:p-8"
            >
              <div className="flex items-center gap-2 mb-5">
                <Briefcase className="h-5 w-5 text-accent" />
                <span className="text-sm font-semibold text-primary-foreground">Lawyer Workspace</span>
              </div>
              <div className="space-y-3">
                {["New Leads: 5 (AI-qualified)", "Active Cases: 12", "Revenue MTD: $14,250", "Today's Meetings: 3"].map(item => (
                  <div key={item} className="flex items-center gap-3 p-3 rounded-lg bg-navy-lighter/20 border border-navy-lighter/20">
                    <BarChart3 className="h-4 w-4 text-accent/70 shrink-0" />
                    <span className="text-sm text-primary-foreground/80">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <Button variant="gold" size="sm" asChild>
                  <Link to="/lawyer/dashboard">Open Lawyer Portal <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* AI Agents mini showcase */}
          <motion.div {...fadeUp} {...stagger(0.2)} className="mt-10 max-w-5xl mx-auto">
            <div className="rounded-2xl bg-navy-light/40 border border-navy-lighter/20 backdrop-blur-sm p-6 md:p-8">
              <div className="flex items-center gap-2 mb-5">
                <Bot className="h-5 w-5 text-accent" />
                <span className="text-sm font-semibold text-primary-foreground">6 AI Agents — Always Active</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: "Legal Intake", icon: Bot },
                  { name: "Case Summary", icon: FileText },
                  { name: "Doc Drafting", icon: Sparkles },
                  { name: "Client Support", icon: MessageSquare },
                  { name: "Lead Qualifier", icon: Shield },
                  { name: "Productivity", icon: Zap },
                ].map(a => (
                  <div key={a.name} className="flex items-center gap-2.5 p-3 rounded-lg bg-navy-lighter/20 border border-navy-lighter/20">
                    <a.icon className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-xs font-medium text-primary-foreground/70">{a.name} Agent</span>
                    <span className="ml-auto h-2 w-2 rounded-full bg-success animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS & METRICS ═══════════════════ */}
      <section id="testimonials" className="py-24 md:py-32">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-3 block">Testimonials</span>
            <h2 className="text-3xl md:text-[2.75rem] font-serif text-foreground leading-tight mb-4">Trusted by clients and lawyers</h2>
          </motion.div>

          {/* Testimonial cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} {...fadeUp} {...stagger(i * 0.1)}
                className="p-7 rounded-2xl bg-card border shadow-card"
              >
                <Quote className="h-8 w-8 text-accent/20 mb-4" />
                <p className="text-sm text-foreground leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 text-accent fill-accent" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Metrics */}
          <motion.div {...fadeUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {metrics.map((m) => (
              <div key={m.label} className="text-center p-5 rounded-xl bg-muted/40 border">
                <div className="text-2xl md:text-3xl font-serif text-foreground">{m.value}</div>
                <div className="text-xs text-muted-foreground mt-1.5">{m.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section id="faq" className="py-24 md:py-32 bg-muted/30">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-3 block">FAQ</span>
            <h2 className="text-3xl md:text-[2.75rem] font-serif text-foreground leading-tight mb-4">Common questions</h2>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} {...fadeUp} {...stagger(i * 0.05)}
                className="rounded-xl bg-card border shadow-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-sm font-semibold text-foreground pr-4">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center p-12 md:p-20 rounded-3xl hero-gradient relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(43 56% 54%), transparent 50%), radial-gradient(circle at 80% 80%, hsl(43 60% 70%), transparent 40%)" }} />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-primary-foreground mb-5 leading-tight">
                Ready to modernize your<br className="hidden md:block" /> legal experience?
              </h2>
              <p className="text-primary-foreground/60 text-lg mb-10 max-w-xl mx-auto">
                Join thousands of clients and lawyers who trust LegalBridge for faster, smarter, and more transparent legal services.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button variant="gold" size="lg" asChild>
                  <Link to="/client/dashboard">Find Legal Help <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                </Button>
                <Button variant="hero-outline" size="lg" asChild>
                  <Link to="/lawyer/dashboard">Join as Lawyer</Link>
                </Button>
                <Button variant="hero-outline" size="lg">
                  Book a Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="border-t bg-card/50 pt-16 pb-8">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <Scale className="h-6 w-6 text-accent" />
                <span className="font-serif text-lg text-foreground">LegalBridge</span>
              </Link>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI-powered legal services platform connecting clients with verified lawyers.
              </p>
            </div>

            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">{category}</h4>
                <ul className="space-y-2.5">
                  {links.map(link => (
                    <li key={link}><a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© 2026 LegalBridge. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
