import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Crown, Building2, Zap, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const tierMeta: Record<string, { icon: React.ReactNode; gradient: string; popular?: boolean }> = {
  free: { icon: <Zap className="h-5 w-5" />, gradient: "from-muted to-muted/50" },
  professional: { icon: <Crown className="h-5 w-5" />, gradient: "from-accent/20 to-accent/5", popular: true },
  enterprise: { icon: <Building2 className="h-5 w-5" />, gradient: "from-primary/20 to-primary/5" },
};

export default function PricingPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    supabase.from("subscription_plans" as any).select("*").eq("is_active", true).order("price_monthly").then(({ data }) => {
      setPlans((data as any[]) || []);
    });
  }, []);

  return (
    <DashboardLayout sidebarItems={adminNavItems} portalLabel="Platform Admin" userName="Platform Admin" userRole="Super Admin">
      <SectionHeader title="Subscription Plans" subtitle="Monetization tiers for the platform (MVP — all features free)" />

      {/* MVP Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-4 rounded-xl bg-accent/5 border border-accent/20 flex items-center gap-3"
      >
        <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-foreground">🚀 MVP Mode Active</div>
          <div className="text-xs text-muted-foreground">All features are currently free. Payment processing will be enabled with Stripe integration.</div>
        </div>
        <span className="text-[10px] font-bold bg-accent/10 text-accent px-3 py-1 rounded-full">FREE BETA</span>
      </motion.div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() => setBilling("monthly")}
          className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", billing === "monthly" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling("yearly")}
          className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", billing === "yearly" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}
        >
          Yearly <span className="text-[10px] ml-1 opacity-75">Save 17%</span>
        </button>
      </div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {plans.map((plan, i) => {
          const meta = tierMeta[plan.tier] || tierMeta.free;
          const price = billing === "monthly" ? Number(plan.price_monthly) : Number(plan.price_yearly);
          const features = Array.isArray(plan.features) ? plan.features : [];

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative rounded-2xl border bg-card shadow-card overflow-hidden",
                meta.popular && "ring-2 ring-accent shadow-card-hover"
              )}
            >
              {meta.popular && (
                <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                  MOST POPULAR
                </div>
              )}

              <div className={cn("p-6 bg-gradient-to-br", meta.gradient)}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-background/80 flex items-center justify-center text-accent">
                    {meta.icon}
                  </div>
                  <h3 className="font-serif text-xl text-foreground">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-3xl font-bold text-foreground">${price}</span>
                  {price > 0 && <span className="text-sm text-muted-foreground">/{billing === "monthly" ? "mo" : "yr"}</span>}
                  {price === 0 && <span className="text-sm text-muted-foreground">forever</span>}
                </div>
                {Number(plan.lead_fee) > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">+ ${plan.lead_fee}/lead · {plan.commission_rate}% commission</div>
                )}
              </div>

              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {features.map((f: string, fi: number) => (
                    <li key={fi} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                  {plan.ai_credits_monthly > 0 && (
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span className="text-foreground">{plan.ai_credits_monthly === 0 ? "Unlimited" : plan.ai_credits_monthly} AI credits/mo</span>
                    </li>
                  )}
                </ul>

                <Button
                  variant={meta.popular ? "gold" : "outline"}
                  className="w-full relative"
                  disabled
                >
                  <Lock className="mr-2 h-3.5 w-3.5" />
                  {price === 0 ? "Current Plan (Free)" : "Coming Soon"}
                </Button>
                {price > 0 && (
                  <p className="text-[10px] text-center text-muted-foreground mt-2">Payment processing not yet enabled</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue model breakdown */}
      <div className="rounded-xl bg-card border shadow-card p-6">
        <h3 className="font-semibold text-foreground mb-4">Revenue Model Overview</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Lead Fee", desc: "$15–$25 per qualified lead", status: "Planned" },
            { label: "Subscriptions", desc: "$149–$399/mo lawyer tiers", status: "Planned" },
            { label: "Booking Fee", desc: "Platform fee on consultations", status: "Planned" },
            { label: "Commission", desc: "5–10% on paid consultations", status: "Planned" },
            { label: "Premium AI", desc: "Advanced AI tools for lawyers", status: "Planned" },
          ].map((m) => (
            <div key={m.label} className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="text-sm font-medium text-foreground mb-1">{m.label}</div>
              <div className="text-xs text-muted-foreground mb-2">{m.desc}</div>
              <span className="text-[10px] font-bold bg-warning/10 text-warning px-2 py-0.5 rounded-full">{m.status}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
