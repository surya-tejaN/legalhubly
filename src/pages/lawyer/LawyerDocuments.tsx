import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Bot, FileText, Sparkles, Download, Copy, Wand2, AlertTriangle, Info } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const templates = [
  { id: "engagement_letter", name: "Engagement Letter", desc: "Client engagement agreement", icon: "📝" },
  { id: "intake_summary", name: "Intake Summary", desc: "Structured case intake brief", icon: "📋" },
  { id: "demand_letter", name: "Demand Letter", desc: "Formal demand for action", icon: "📨" },
  { id: "nda", name: "Non-Disclosure Agreement", desc: "Confidentiality agreement", icon: "🔒" },
  { id: "settlement", name: "Settlement Agreement", desc: "Dispute resolution terms", icon: "🤝" },
  { id: "follow_up_email", name: "Follow-Up Email", desc: "Client follow-up communication", icon: "💬" },
  { id: "legal_notice", name: "Legal Notice", desc: "Formal notification letter", icon: "⚖️" },
  { id: "checklist", name: "Case Checklist", desc: "Action items and deadlines", icon: "✅" },
];

const caseOptions = [
  { id: "c1", label: "C-2024-001 - Alex Johnson - Wrongful Termination", context: { client_name: "Alex Johnson", title: "Wrongful Termination", category: "Employment", description: "Employee terminated without cause after 4.5 years. Non-compete clause in dispute. Seeking revised severance." } },
  { id: "c2", label: "C-2024-005 - Robert Lee - Real Estate Closing", context: { client_name: "Robert Lee", title: "Real Estate Closing", category: "Real Estate", description: "Commercial property closing with title issues. Environmental assessment pending." } },
  { id: "c3", label: "C-2024-006 - Jennifer Lee - Employment Discrimination", context: { client_name: "Jennifer Lee", title: "Employment Discrimination", category: "Employment", description: "Gender-based discrimination claim. Pattern of unequal treatment documented over 2 years." } },
];

export default function LawyerDocuments() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState(caseOptions[0].id);
  const [instructions, setInstructions] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState("");
  const docEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (generating) docEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [generatedDoc, generating]);

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setGenerating(true);
    setGeneratedDoc("");

    const caseCtx = caseOptions.find((c) => c.id === selectedCase)?.context;
    const templateName = templates.find((t) => t.id === selectedTemplate)?.name;

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/document-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          document_type: templateName,
          case_context: caseCtx,
          instructions: instructions || undefined,
          messages: [],
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast({ title: "Rate limited", description: "Please try again shortly.", variant: "destructive" });
        else if (resp.status === 402) toast({ title: "Usage limit", description: "AI credits exhausted.", variant: "destructive" });
        else toast({ title: "Error", description: "Document generation failed.", variant: "destructive" });
        setGenerating(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              content += delta;
              setGeneratedDoc(content);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to connect to AI.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDoc);
    toast({ title: "Copied", description: "Document copied to clipboard." });
  };

  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName="Sarah Chen" userRole="Attorney">
      <SectionHeader
        title="AI Document Studio"
        subtitle="Generate legal documents with AI — review required before use"
      />

      {!generatedDoc ? (
        <>
          {/* AI Agent Banner */}
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-accent/5 border border-accent/15">
            <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-foreground">Document Drafting Agent</div>
              <div className="text-xs text-muted-foreground">Select a template and case — I'll generate a draft for your review</div>
            </div>
            <Sparkles className="h-5 w-5 text-accent animate-pulse" />
          </div>

          {/* Compliance Notice */}
          <div className="flex items-start gap-2 mb-6 p-3 rounded-lg bg-muted/50 border text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span>AI-generated documents are drafts that require attorney review and editing before use. Source context is tagged throughout the document. This tool provides legal information assistance, not legal advice.</span>
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
                    <select
                      value={selectedCase}
                      onChange={(e) => setSelectedCase(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-muted/50 border text-sm outline-none focus:ring-2 focus:ring-accent/50"
                    >
                      {caseOptions.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Additional Instructions (optional)</label>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
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
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full flex items-center gap-1">
                <Bot className="h-3 w-3" /> AI Generated
              </span>
              <span className="text-sm text-muted-foreground">
                {templates.find((t) => t.id === selectedTemplate)?.name} · {caseOptions.find((c) => c.id === selectedCase)?.label.split(" - ")[1]}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}><Copy className="mr-2 h-3.5 w-3.5" /> Copy</Button>
              <Button variant="gold" size="sm" onClick={() => { setGeneratedDoc(""); setInstructions(""); }}>
                <Wand2 className="mr-2 h-3.5 w-3.5" /> New Document
              </Button>
            </div>
          </div>

          {/* AI Disclaimer */}
          <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-warning/5 border border-warning/20 text-xs text-warning">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span><strong>AI-Generated Draft</strong> — This document must be reviewed, edited, and approved by a licensed attorney before use. It does not constitute legal advice. Source context is tagged with [From intake], [From case file], or [Attorney input].</span>
          </div>

          {/* Document Content */}
          <div className="rounded-xl bg-card border shadow-card p-8 max-w-4xl">
            <div className="prose prose-sm max-w-none text-foreground">
              <ReactMarkdown>{generatedDoc}</ReactMarkdown>
            </div>
            {generating && (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 bg-accent rounded-full animate-pulse" />
                Generating...
              </div>
            )}
            <div ref={docEndRef} />
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
