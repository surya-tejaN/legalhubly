import { Button } from "@/components/ui/button";
import {
  Scale,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Tag,
  FileText,
  CheckCircle2,
  ArrowRight,
  Bot,
  Shield,
  Calendar,
  Globe,
  Users,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

type IntakeSummaryData = {
  legal_category: string;
  matter_description: string;
  urgency?: string;
  location?: string;
  budget_range?: string;
  consultation_preference?: string;
  timeline?: string;
  language_preference?: string;
  opposing_party_details?: string;
  case_summary: string;
  tags: string[];
  lead_score: number;
  recommended_specialties?: string[];
};

interface IntakeSummaryProps {
  summary: IntakeSummaryData;
  uploadedFiles: { name: string; path: string }[];
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "bg-success/10 text-success" : score >= 50 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${color}`}>
      <Star className="h-3 w-3" /> {score}/100 Lead Score
    </span>
  );
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const styles: Record<string, string> = {
    emergency: "bg-destructive/10 text-destructive",
    urgent: "bg-warning/10 text-warning",
    standard: "bg-info/10 text-info",
    low: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${styles[urgency] || styles.standard}`}>
      <Clock className="h-3 w-3" /> {urgency}
    </span>
  );
}

export default function IntakeSummary({ summary, uploadedFiles }: IntakeSummaryProps) {
  const detailItems = [
    { icon: Scale, label: "Legal Category", value: summary.legal_category },
    summary.urgency && { icon: Clock, label: "Urgency", value: summary.urgency, capitalize: true },
    summary.location && { icon: MapPin, label: "Location", value: summary.location },
    summary.budget_range && { icon: DollarSign, label: "Budget", value: summary.budget_range },
    summary.consultation_preference && { icon: Calendar, label: "Consultation", value: summary.consultation_preference.replace("_", "-"), capitalize: true },
    summary.timeline && { icon: Clock, label: "Timeline", value: summary.timeline },
    summary.language_preference && { icon: Globe, label: "Language", value: summary.language_preference },
    summary.opposing_party_details && { icon: Users, label: "Opposing Party", value: summary.opposing_party_details },
  ].filter(Boolean) as { icon: typeof Scale; label: string; value: string; capitalize?: boolean }[];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Success header */}
      <div className="rounded-xl bg-success/5 border border-success/20 p-5 flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-6 w-6 text-success" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground text-lg">Intake Complete</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your case has been analyzed and summarized. We're matching you with the best lawyers now.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case summary */}
          <div className="rounded-xl bg-card border shadow-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-foreground">AI Case Summary</h3>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{summary.case_summary}</p>
          </div>

          {/* Details grid */}
          <div className="rounded-xl bg-card border shadow-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Case Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {detailItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-accent/8 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</div>
                    <div className={`text-sm font-medium text-foreground ${item.capitalize ? "capitalize" : ""}`}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matter description */}
          <div className="rounded-xl bg-card border shadow-card p-6">
            <h3 className="font-semibold text-foreground mb-3">Full Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{summary.matter_description}</p>
          </div>

          {/* Uploaded documents */}
          {uploadedFiles.length > 0 && (
            <div className="rounded-xl bg-card border shadow-card p-6">
              <h3 className="font-semibold text-foreground mb-3">Uploaded Documents</h3>
              <div className="space-y-2">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                    <FileText className="h-4 w-4 text-accent" />
                    <span className="text-sm text-foreground">{f.name}</span>
                    <CheckCircle2 className="h-4 w-4 text-success ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Score & badges */}
          <div className="rounded-xl bg-card border shadow-card p-5">
            <h3 className="font-semibold text-foreground mb-3">Assessment</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <ScoreBadge score={summary.lead_score} />
              {summary.urgency && <UrgencyBadge urgency={summary.urgency} />}
            </div>

            {/* Tags */}
            <div className="mb-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {summary.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/8 text-accent text-[10px] font-semibold">
                    <Tag className="h-2.5 w-2.5" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended specialties */}
            {summary.recommended_specialties && summary.recommended_specialties.length > 0 && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Recommended Specialties</div>
                <div className="space-y-1.5">
                  {summary.recommended_specialties.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-xs text-foreground">
                      <Shield className="h-3 w-3 text-accent" /> {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Next steps */}
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-foreground text-sm">Estimated Next Steps</h3>
            </div>
            <ol className="space-y-2.5">
              {[
                "AI matches you with top lawyers (< 2 hours)",
                "Receive lawyer profiles and availability",
                "Book a consultation at your convenience",
                "Lawyer reviews your case and documents",
                "Begin working on your legal matter",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                  <span className="h-5 w-5 rounded-full bg-accent/15 flex items-center justify-center shrink-0 text-[10px] font-bold text-accent">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="gold" className="w-full" asChild>
              <Link to="/client/find-lawyers">
                Browse Matched Lawyers <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/client/cases">View My Cases</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
