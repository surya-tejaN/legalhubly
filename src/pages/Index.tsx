import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Gavel,
  Menu,
  X,
  ChevronRight,
  Star,
  Zap,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Legal Intake",
    description: "Our AI agent collects your information, classifies your case, and matches you with the right lawyer instantly.",
  },
  {
    icon: Users,
    title: "Smart Matching",
    description: "Get matched with lawyers based on expertise, location, availability, and client reviews.",
  },
  {
    icon: Calendar,
    title: "Easy Scheduling",
    description: "Book consultations directly with your matched lawyer through integrated calendar scheduling.",
  },
  {
    icon: FileText,
    title: "AI Document Drafting",
    description: "Generate contracts, notices, and legal letters with AI-powered document templates.",
  },
  {
    icon: MessageSquare,
    title: "Secure Messaging",
    description: "Communicate directly with your lawyer through encrypted, confidential messaging.",
  },
  {
    icon: Shield,
    title: "Case Tracking",
    description: "Monitor every stage of your legal matter with real-time updates and milestone tracking.",
  },
];

const aiAgents = [
  { icon: Bot, name: "Legal Intake Agent", desc: "Collects client information and classifies case type" },
  { icon: FileText, name: "Case Summary Agent", desc: "Summarizes client issues for lawyers" },
  { icon: Sparkles, name: "Document Drafting Agent", desc: "Generates legal templates and documents" },
  { icon: MessageSquare, name: "Client Support Agent", desc: "Answers common legal questions 24/7" },
  { icon: Shield, name: "Lead Qualification Agent", desc: "Filters serious clients from spam" },
  { icon: Zap, name: "Lawyer Productivity Agent", desc: "Helps lawyers draft responses faster" },
];

const stats = [
  { value: "10,000+", label: "Cases Handled" },
  { value: "500+", label: "Verified Lawyers" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "< 2hr", label: "Avg. Response Time" },
];

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="h-7 w-7 text-accent" />
            <span className="font-serif text-xl text-foreground">LegalBridge</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#ai-agents" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI Agents</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild><Link to="/client/dashboard">Client Portal</Link></Button>
            <Button variant="nav-gold" asChild><Link to="/lawyer/dashboard">Lawyer Portal</Link></Button>
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t bg-background"
            >
              <div className="container py-4 flex flex-col gap-3">
                <a href="#features" className="py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#ai-agents" className="py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>AI Agents</a>
                <a href="#how-it-works" className="py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" asChild className="flex-1"><Link to="/client/dashboard">Client Portal</Link></Button>
                  <Button variant="gold" asChild className="flex-1"><Link to="/lawyer/dashboard">Lawyer Portal</Link></Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-[0.03]" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Legal Services
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif leading-tight tracking-tight text-foreground mb-6">
              Legal Help,{" "}
              <span className="text-gradient-gold">Simplified</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect with expert lawyers, get AI-powered case analysis, and manage your legal matters — all in one intelligent platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/client/dashboard">
                  Get Legal Help <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/lawyer/dashboard">
                  Join as Lawyer <Briefcase className="ml-1 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-serif text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From initial consultation to case resolution, our platform handles it all.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-xl bg-card border shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-sans text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents */}
      <section id="ai-agents" className="py-20 md:py-28 hero-gradient">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-primary-foreground mb-4">6 AI Agents Working For You</h2>
            <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
              Automated assistants that streamline every part of the legal process.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {aiAgents.map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-xl bg-navy-light/50 border border-navy-lighter/30 backdrop-blur-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                    <agent.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-primary-foreground mb-1">{agent.name}</h3>
                    <p className="text-sm text-primary-foreground/60">{agent.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Get legal help in three simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Describe Your Issue", desc: "Our AI intake agent guides you through describing your legal matter and collects relevant details.", icon: MessageSquare },
              { step: "2", title: "Get Matched", desc: "Our matching algorithm finds the best lawyer for your specific case type and requirements.", icon: Users },
              { step: "3", title: "Resolve Your Case", desc: "Work with your lawyer through consultations, document management, and real-time case tracking.", icon: CheckCircle2 },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="h-7 w-7 text-accent" />
                </div>
                <div className="text-sm font-semibold text-accent mb-2">Step {item.step}</div>
                <h3 className="font-sans text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center p-10 md:p-16 rounded-2xl hero-gradient relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(43 56% 54%), transparent 50%)" }} />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-serif text-primary-foreground mb-4">Ready to Get Started?</h2>
              <p className="text-primary-foreground/70 text-lg mb-8 max-w-lg mx-auto">
                Whether you need legal help or want to grow your practice, LegalBridge has you covered.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="gold" size="lg" asChild>
                  <Link to="/client/dashboard">Find a Lawyer <ArrowRight className="ml-1" /></Link>
                </Button>
                <Button variant="hero-outline" size="lg" asChild>
                  <Link to="/lawyer/dashboard">Join Our Network</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-accent" />
            <span className="font-serif text-foreground">LegalBridge</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 LegalBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
