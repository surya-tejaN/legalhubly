import { useState, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Bot,
  Send,
  Upload,
  FileText,
  CheckCircle2,
  Sparkles,
  Clock,
  MapPin,
  DollarSign,
  Scale,
  ArrowRight,
  Loader2,
  X,
  Star,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import IntakeSummary from "@/components/intake/IntakeSummary";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

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

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/legal-intake`;

const legalCategories = [
  { id: "personal_injury", label: "Personal Injury", icon: "🩹" },
  { id: "immigration", label: "Immigration", icon: "✈️" },
  { id: "family", label: "Family Law", icon: "👨‍👩‍👧" },
  { id: "criminal", label: "Criminal Defense", icon: "⚖️" },
  { id: "employment", label: "Employment", icon: "👔" },
  { id: "business", label: "Business Law", icon: "🏢" },
  { id: "real_estate", label: "Real Estate", icon: "🏠" },
  { id: "estate_planning", label: "Estate Planning", icon: "📋" },
  { id: "civil_litigation", label: "Civil Litigation", icon: "🏛️" },
  { id: "other", label: "Other", icon: "❓" },
];

function generateSessionId() {
  return `intake_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function CaseIntake() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(generateSessionId);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [summary, setSummary] = useState<IntakeSummaryData | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; path: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Create or update intake case in DB
  const saveToDb = useCallback(
    async (msgs: Message[], summaryData?: IntakeSummaryData) => {
      const payload: Record<string, unknown> = {
        session_id: sessionId,
        conversation_history: msgs.map((m) => ({ role: m.role, content: m.content })),
        updated_at: new Date().toISOString(),
      };

      if (summaryData) {
        payload.status = "submitted";
        payload.legal_category = summaryData.legal_category;
        payload.matter_description = summaryData.matter_description;
        payload.urgency = summaryData.urgency || null;
        payload.location = summaryData.location || null;
        payload.budget_range = summaryData.budget_range || null;
        payload.consultation_preference = summaryData.consultation_preference || null;
        payload.timeline = summaryData.timeline || null;
        payload.language_preference = summaryData.language_preference || "English";
        payload.opposing_party_details = summaryData.opposing_party_details || null;
        payload.ai_case_summary = summaryData.case_summary;
        payload.ai_tags = summaryData.tags;
        payload.ai_lead_score = summaryData.lead_score;
        payload.ai_recommended_lawyers = summaryData.recommended_specialties || [];
        payload.intake_data = summaryData;
      }

      if (caseId) {
        await supabase.from("intake_cases").update(payload).eq("id", caseId);
      } else {
        const { data } = await supabase
          .from("intake_cases")
          .insert(payload as any)
          .select("id")
          .single();
        if (data) setCaseId(data.id);
      }
    },
    [caseId, sessionId]
  );

  // Stream chat
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMsg: Message = { id: `u_${Date.now()}`, role: "user", content: content.trim() };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);
      setShowCategoryPicker(false);

      let assistantContent = "";

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!resp.ok || !resp.body) {
          if (resp.status === 429) { toast.error("Rate limit reached. Please wait a moment."); }
          else if (resp.status === 402) { toast.error("AI usage limit reached."); }
          else { toast.error("Failed to get response. Please try again."); }
          setIsLoading(false);
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        const upsertAssistant = (text: string) => {
          assistantContent = text;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && last.id.startsWith("a_stream")) {
              return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: text } : m));
            }
            return [...prev, { id: "a_stream_" + Date.now(), role: "assistant", content: text }];
          });
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          let newlineIdx: number;
          while ((newlineIdx = buf.indexOf("\n")) !== -1) {
            let line = buf.slice(0, newlineIdx);
            buf = buf.slice(newlineIdx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                upsertAssistant(assistantContent);
              }
            } catch {
              buf = line + "\n" + buf;
              break;
            }
          }
        }

        // Save conversation
        const finalMessages = [
          ...newMessages,
          { id: `a_${Date.now()}`, role: "assistant" as const, content: assistantContent },
        ];
        await saveToDb(finalMessages);
      } catch (e) {
        console.error("Chat error:", e);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, saveToDb]
  );

  // File upload
  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setIsUploading(true);

      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          continue;
        }

        const path = `${sessionId}/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from("intake-documents").upload(path, file);

        if (error) {
          toast.error(`Failed to upload ${file.name}`);
          console.error(error);
        } else {
          setUploadedFiles((prev) => [...prev, { name: file.name, path }]);
          toast.success(`${file.name} uploaded`);
        }
      }

      setIsUploading(false);
    },
    [sessionId]
  );

  // Generate summary
  const handleGenerateSummary = useCallback(async () => {
    if (messages.length < 4) {
      toast.error("Please provide more details before generating a summary.");
      return;
    }

    setIsSummarizing(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          action: "generate_summary",
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) toast.error("Rate limit. Please wait.");
        else if (resp.status === 402) toast.error("AI usage limit reached.");
        else toast.error("Failed to generate summary.");
        setIsSummarizing(false);
        return;
      }

      const data = await resp.json();
      if (data.summary) {
        setSummary(data.summary);
        await saveToDb(messages, data.summary);
        toast.success("Case summary generated!");
      }
    } catch (e) {
      console.error("Summary error:", e);
      toast.error("Failed to generate summary.");
    } finally {
      setIsSummarizing(false);
    }
  }, [messages, saveToDb]);

  // Category selection
  const handleCategorySelect = (label: string) => {
    sendMessage(`I need help with a ${label} matter.`);
  };

  return (
    <DashboardLayout
      sidebarItems={clientNavItems}
      portalLabel="Client Portal"
      userName="New Client"
      userRole="Intake"
    >
      <SectionHeader
        title="AI Legal Intake"
        subtitle="Our AI assistant will guide you through describing your legal matter"
      />

      {summary ? (
        <IntakeSummary summary={summary} uploadedFiles={uploadedFiles} />
      ) : (
        <div className="flex flex-col" style={{ height: "calc(100vh - 220px)" }}>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto rounded-t-xl bg-card border border-b-0 shadow-card">
            <div className="p-4 md:p-6 space-y-4">
              {/* Welcome message */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <Bot className="h-5 w-5 text-accent" />
                    </div>
                    <div className="bg-muted/50 rounded-xl rounded-tl-sm p-4 max-w-[85%]">
                      <p className="text-sm text-foreground leading-relaxed">
                        Welcome to LegalBridge! I'm your AI legal intake assistant. I'll help you describe your legal matter and connect you with the right lawyer.
                      </p>
                      <p className="text-sm text-foreground leading-relaxed mt-2">
                        To get started, what type of legal issue are you facing? You can select a category below or describe your situation in your own words.
                      </p>
                    </div>
                  </div>

                  {/* Category picker */}
                  {showCategoryPicker && (
                    <div className="ml-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {legalCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat.label)}
                          className="p-3 rounded-xl border-2 border-border bg-card hover:border-accent/40 hover:bg-accent/5 transition-all text-left"
                        >
                          <span className="text-lg block">{cat.icon}</span>
                          <span className="text-xs font-medium text-foreground">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Message list */}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "items-start gap-3"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-5 w-5 text-accent" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3.5 rounded-xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted/50 text-foreground rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Bot className="h-5 w-5 text-accent" />
                  </div>
                  <div className="bg-muted/50 rounded-xl rounded-tl-sm p-3.5">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="bg-card border-x px-4 py-2 flex gap-2 overflow-x-auto">
              {uploadedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border text-xs shrink-0">
                  <FileText className="h-3.5 w-3.5 text-accent" />
                  <span className="text-foreground font-medium">{f.name}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                </div>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="rounded-b-xl bg-card border shadow-card p-3">
            {/* Action buttons */}
            <div className="flex items-center gap-2 mb-2">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                )}
                Upload Document
              </Button>

              {messages.length >= 4 && (
                <Button
                  variant="gold"
                  size="sm"
                  className="text-xs ml-auto"
                  onClick={handleGenerateSummary}
                  disabled={isSummarizing}
                >
                  {isSummarizing ? (
                    <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="mr-1.5 h-3.5 w-3.5" /> Generate Summary & Match</>
                  )}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Describe your legal matter..."
                className="flex-1 bg-muted/50 rounded-lg px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/30"
                disabled={isLoading}
              />
              <Button
                variant="gold"
                size="icon"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4 mt-2 px-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Scale className="h-3 w-3" /> Confidential & encrypted
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Progress auto-saved
              </span>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
