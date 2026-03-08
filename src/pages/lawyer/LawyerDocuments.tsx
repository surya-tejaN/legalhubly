import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Bot, FileText, Sparkles, ArrowRight, Download, Copy, Wand2 } from "lucide-react";
import { motion } from "framer-motion";

const templates = [
  { id: "contract", name: "Service Contract", desc: "Standard client engagement agreement", icon: "📝" },
  { id: "nda", name: "Non-Disclosure Agreement", desc: "Confidentiality agreement template", icon: "🔒" },
  { id: "demand", name: "Demand Letter", desc: "Formal demand for action or payment", icon: "📨" },
  { id: "notice", name: "Legal Notice", desc: "Formal notification to opposing party", icon: "⚖️" },
  { id: "brief", name: "Legal Brief", desc: "Court filing brief template", icon: "📋" },
  { id: "settlement", name: "Settlement Agreement", desc: "Terms for dispute resolution", icon: "🤝" },
  { id: "motion", name: "Motion to Dismiss", desc: "Request for case dismissal", icon: "🏛️" },
  { id: "response", name: "Client Response", desc: "AI-drafted response to client", icon: "💬" },
];

const generatedDoc = `# Employment Termination Response Letter

**Date:** March 8, 2026  
**To:** HR Department, TechCorp Inc.  
**From:** Sarah Chen, Esq., on behalf of Alex Johnson  
**Re:** Wrongful Termination – Notice of Legal Representation

---

Dear Sir/Madam,

This letter serves as formal notice that our firm represents **Alex Johnson** in connection with the termination of employment effective February 15, 2026.

## Key Points of Contention

1. **Insufficient Cause**: The termination letter cites "performance issues" without documentation or prior warnings, violating the progressive discipline policy outlined in the Employee Handbook (Section 4.2).

2. **Non-Compete Clause**: The non-compete agreement (Section 8, Employment Contract) is overly broad in scope and duration, rendering it unenforceable under California Business and Professions Code § 16600.

3. **Severance Terms**: The proposed severance of two weeks' pay is inadequate given Mr. Johnson's tenure of 4.5 years and the circumstances of termination.

## Demanded Action

We request the following within **14 business days** of receipt of this letter:

- Full documentation supporting the termination decision
- Revised severance offer reflecting 6 months' compensation
- Immediate release from the non-compete agreement
- Written confirmation of COBRA benefits continuation

Failure to respond within the stated timeframe may result in formal legal proceedings.

Sincerely,  
**Sarah Chen, Esq.**  
Chen & Associates`;

export default function LawyerDocuments() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 1500);
  };

  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName="Sarah Chen" userRole="Attorney">
      <SectionHeader
        title="AI Document Studio"
        subtitle="Generate and draft legal documents with AI assistance"
      />

      {!generated ? (
        <>
          {/* AI Agent Banner */}
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-accent/5 border border-accent/15">
            <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-foreground">Document Drafting Agent</div>
              <div className="text-xs text-muted-foreground">Select a template and I'll generate a draft based on your case details</div>
            </div>
            <Sparkles className="h-5 w-5 text-accent animate-pulse" />
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedTemplate === t.id ? "border-accent bg-accent/5 shadow-gold" : "border-border bg-card hover:border-accent/30"
                }`}
              >
                <span className="text-2xl block mb-2">{t.icon}</span>
                <span className="text-sm font-medium text-foreground block">{t.name}</span>
                <span className="text-xs text-muted-foreground">{t.desc}</span>
              </button>
            ))}
          </div>

          {selectedTemplate && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rounded-xl bg-card border shadow-card p-6 max-w-2xl">
                <h3 className="font-semibold text-foreground mb-4">Configure Document</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Related Case</label>
                    <select className="w-full p-2.5 rounded-lg bg-muted/50 border text-sm outline-none focus:ring-2 focus:ring-accent/50">
                      <option>C-2024-001 - Alex Johnson - Wrongful Termination</option>
                      <option>C-2024-005 - Robert Lee - Real Estate Closing</option>
                      <option>C-2024-006 - Jennifer Lee - Employment Discrimination</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Additional Instructions (optional)</label>
                    <textarea
                      placeholder="Any specific points to include or tone preferences..."
                      className="w-full h-24 p-3 rounded-lg bg-muted/50 border text-sm outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                    />
                  </div>
                  <Button variant="gold" onClick={handleGenerate} disabled={generating}>
                    {generating ? (
                      <><span className="animate-spin mr-2">⏳</span> Generating...</>
                    ) : (
                      <><Wand2 className="mr-2 h-4 w-4" /> Generate with AI</>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Generated Document */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-success/10 text-success px-2 py-0.5 rounded-full">AI Generated</span>
              <span className="text-sm text-muted-foreground">Based on Case C-2024-001</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Copy className="mr-2 h-3.5 w-3.5" /> Copy</Button>
              <Button variant="outline" size="sm"><Download className="mr-2 h-3.5 w-3.5" /> Export</Button>
              <Button variant="gold" size="sm" onClick={() => setGenerated(false)}>
                <Wand2 className="mr-2 h-3.5 w-3.5" /> New Document
              </Button>
            </div>
          </div>
          <div className="rounded-xl bg-card border shadow-card p-8 max-w-4xl">
            <div className="prose prose-sm max-w-none text-foreground">
              {generatedDoc.split("\n").map((line, i) => {
                if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-serif text-foreground mb-4">{line.slice(2)}</h1>;
                if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold text-foreground mt-6 mb-2">{line.slice(3)}</h2>;
                if (line.startsWith("---")) return <hr key={i} className="my-4 border-border" />;
                if (line.startsWith("- ")) return <li key={i} className="text-sm text-foreground ml-4 mb-1">{line.slice(2)}</li>;
                if (line.trim() === "") return <br key={i} />;
                return <p key={i} className="text-sm text-foreground mb-2" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />;
              })}
            </div>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
