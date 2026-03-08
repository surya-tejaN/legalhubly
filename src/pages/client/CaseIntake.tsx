import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Bot, ArrowRight, ArrowLeft, Upload, CheckCircle2, FileText, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const caseTypes = [
  { id: "employment", label: "Employment Law", icon: "👔" },
  { id: "family", label: "Family Law", icon: "👨‍👩‍👧" },
  { id: "business", label: "Business Law", icon: "🏢" },
  { id: "realestate", label: "Real Estate", icon: "🏠" },
  { id: "immigration", label: "Immigration", icon: "✈️" },
  { id: "criminal", label: "Criminal Defense", icon: "⚖️" },
  { id: "ip", label: "Intellectual Property", icon: "💡" },
  { id: "personal", label: "Personal Injury", icon: "🩹" },
];

const steps = ["Case Type", "Details", "Documents", "Review"];

export default function CaseIntake() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState("");
  const [description, setDescription] = useState("");

  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName="Alex Johnson" userRole="Client">
      <SectionHeader
        title="AI Legal Intake"
        subtitle="Our AI agent will guide you through describing your legal matter"
      />

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              i === currentStep ? "bg-accent text-accent-foreground" :
              i < currentStep ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
            }`}>
              {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-4 w-4 flex items-center justify-center text-xs">{i + 1}</span>}
              <span className="hidden sm:inline">{step}</span>
            </div>
            {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* AI Assistant Badge */}
      <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-accent/5 border border-accent/15">
        <Bot className="h-5 w-5 text-accent shrink-0" />
        <span className="text-sm text-foreground">
          {currentStep === 0 && "Let's start by identifying your legal matter. Select the category that best fits."}
          {currentStep === 1 && "Great choice. Now describe your situation in your own words — our AI will analyze and classify it."}
          {currentStep === 2 && "Upload any relevant documents. This helps lawyers understand your case faster."}
          {currentStep === 3 && "Review your submission. Our AI will match you with the best available lawyers."}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Step 0: Case Type */}
          {currentStep === 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {caseTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-card-hover ${
                    selectedType === type.id ? "border-accent bg-accent/5 shadow-gold" : "border-border bg-card hover:border-accent/30"
                  }`}
                >
                  <span className="text-2xl block mb-2">{type.icon}</span>
                  <span className="text-sm font-medium text-foreground">{type.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Details */}
          {currentStep === 1 && (
            <div className="max-w-2xl">
              <div className="rounded-xl bg-card border shadow-card p-6">
                <label className="block text-sm font-medium text-foreground mb-2">Describe your legal issue</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us what happened, when it started, and what outcome you're looking for..."
                  className="w-full h-40 p-4 rounded-lg bg-muted/50 border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                />
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Urgency Level</label>
                    <select className="w-full p-2.5 rounded-lg bg-muted/50 border text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/50">
                      <option>Standard</option>
                      <option>Urgent</option>
                      <option>Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Preferred Budget</label>
                    <select className="w-full p-2.5 rounded-lg bg-muted/50 border text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/50">
                      <option>Under $1,000</option>
                      <option>$1,000 - $5,000</option>
                      <option>$5,000 - $10,000</option>
                      <option>$10,000+</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {currentStep === 2 && (
            <div className="max-w-2xl">
              <div className="rounded-xl border-2 border-dashed border-border bg-card p-10 text-center hover:border-accent/40 transition-colors cursor-pointer">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">Drag & drop files here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse. Supports PDF, DOC, JPG, PNG up to 10MB</p>
                <Button variant="outline" size="sm">Browse Files</Button>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-muted/30 border">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-accent" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">employment_contract.pdf</div>
                    <div className="text-xs text-muted-foreground">245 KB · Uploaded</div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="max-w-2xl">
              <div className="rounded-xl bg-card border shadow-card p-6 space-y-4">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Case Type</div>
                  <div className="text-foreground font-medium">{caseTypes.find(t => t.id === selectedType)?.label || "Employment Law"}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</div>
                  <div className="text-sm text-foreground">{description || "Employment dispute regarding wrongful termination..."}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Documents</div>
                  <div className="text-sm text-foreground">1 file uploaded</div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-accent">
                    <Bot className="h-4 w-4" />
                    <span className="font-medium">AI Analysis: High match potential with 3 lawyers in your area</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          variant="gold"
          onClick={() => {
            if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
          }}
        >
          {currentStep === steps.length - 1 ? "Submit & Find Lawyers" : "Continue"} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </DashboardLayout>
  );
}
