import { useState } from "react";
import { MessageSquare, X, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AiChatPlaceholder() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute bottom-16 right-0 w-80 rounded-2xl border bg-card shadow-elevated overflow-hidden"
          >
            <div className="hero-gradient p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-foreground">AI Legal Assistant</p>
                  <p className="text-xs text-primary-foreground/60">Powered by Legalhubly</p>
                </div>
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-7 w-7 text-accent" />
              </div>
              <p className="font-serif text-lg text-foreground mb-2">Coming Soon</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI legal assistant coming soon. Get instant guidance on legal questions, case assessment, and lawyer recommendations.
              </p>
            </div>
            <div className="px-5 pb-5">
              <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3 border border-border/60">
                <MessageSquare className="h-4 w-4 text-muted-foreground/40" />
                <span className="text-sm text-muted-foreground/50">Ask a legal question...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "h-14 w-14 rounded-full flex items-center justify-center shadow-gold transition-all duration-200 active:scale-95",
          open
            ? "bg-card border border-border text-foreground hover:bg-muted"
            : "bg-accent text-accent-foreground hover:bg-accent/90 animate-pulse-gold"
        )}
      >
        {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </button>
    </div>
  );
}
