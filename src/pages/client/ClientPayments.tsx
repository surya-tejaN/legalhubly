import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { SectionHeader, StatCard, StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { CreditCard, DollarSign, Clock, CheckCircle2, Download, FileText, Eye, ArrowRight, Shield, Calendar, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ClientSupportChat from "@/components/ClientSupportChat";

interface Invoice {
  id: string;
  invoice_number: string;
  description: string | null;
  client_name: string;
  amount: number;
  total_amount: number;
  status: string;
  created_at: string;
  due_date: string | null;
  paid_at: string | null;
}

export default function ClientPayments() {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });
      setInvoices((data as Invoice[]) || []);
      setLoading(false);
    })();
  }, []);

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.total_amount), 0);
  const totalPending = invoices.filter(i => i.status !== "paid").reduce((s, i) => s + Number(i.total_amount), 0);
  const paidCount = invoices.filter(i => i.status === "paid").length;
  const pendingCount = invoices.filter(i => i.status !== "paid").length;

  const statusVariant = (s: string) => s === "paid" ? "success" as const : s === "overdue" ? "destructive" as const : "warning" as const;

  const handlePayNow = (inv: Invoice) => {
    toast.info("Payment processing will be available once Stripe is configured.");
  };

  const handleUpdateCard = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast.error("Could not open payment settings.");
      }
    } catch {
      toast.error("Failed to open payment settings. Please try again.");
    }
  };

  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName={profile?.full_name || "Client"} userRole="Client">
      <SectionHeader title="Payments & Invoices" subtitle="Track your billing and payment history" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <StatCard icon={<DollarSign className="h-5 w-5 text-accent" />} label="Total Paid" value={`$${totalPaid.toLocaleString()}`} change={`${paidCount} invoices`} changeType="positive" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatCard icon={<Clock className="h-5 w-5 text-accent" />} label="Pending" value={`$${totalPending.toLocaleString()}`} change={`${pendingCount} invoices`} changeType="neutral" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard icon={<CheckCircle2 className="h-5 w-5 text-accent" />} label="Invoices" value={String(invoices.length)} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatCard icon={<CreditCard className="h-5 w-5 text-accent" />} label="Payment Method" value="Not set" />
        </motion.div>
      </div>

      {/* Payment method */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 rounded-xl bg-card border shadow-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-medium text-sm text-foreground">Payment Method</div>
                <div className="text-xs text-muted-foreground">Add a card to enable payments</div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleUpdateCard}>Set Up</Button>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-success/5 border border-success/20 p-4">
          <Shield className="h-5 w-5 text-success shrink-0" />
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground block">Secure payments</span>
            All transactions are encrypted and PCI compliant
          </div>
        </div>
      </div>

      {/* Invoice detail modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setSelectedInvoice(null)} />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative bg-card rounded-2xl border shadow-card-hover max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-xl text-foreground">{selectedInvoice.invoice_number}</h3>
                <StatusBadge status={selectedInvoice.status} variant={statusVariant(selectedInvoice.status)} />
              </div>
              <div className="space-y-3 mb-6">
                {selectedInvoice.description && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Description</span>
                    <span className="text-foreground font-medium text-right max-w-[200px]">{selectedInvoice.description}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-foreground">{new Date(selectedInvoice.created_at).toLocaleDateString()}</span>
                </div>
                {selectedInvoice.due_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due Date</span>
                    <span className="text-foreground">{new Date(selectedInvoice.due_date).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-3 border-t">
                  <span className="font-semibold text-foreground">Amount</span>
                  <span className="font-bold text-xl text-accent">${Number(selectedInvoice.total_amount).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedInvoice.status === "paid" ? (
                  <Button variant="outline" className="flex-1"><Download className="mr-2 h-4 w-4" /> Download Receipt</Button>
                ) : (
                  <Button variant="gold" className="flex-1" onClick={() => handlePayNow(selectedInvoice)}>Pay Now</Button>
                )}
                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoices */}
      <div className="rounded-xl bg-card border shadow-card overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-foreground">Invoice History</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No invoices yet. They will appear here when your lawyers bill you.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Invoice</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Date</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.map((inv, i) => (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-medium text-foreground">{inv.invoice_number}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{inv.description || inv.client_name}</div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground hidden sm:table-cell">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-foreground">${Number(inv.total_amount).toFixed(2)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={inv.status} variant={statusVariant(inv.status)} /></td>
                    <td className="px-5 py-3.5 text-right">
                      {inv.status !== "paid" ? (
                        <Button variant="gold" size="sm" onClick={(e) => { e.stopPropagation(); handlePayNow(inv); }}>Pay Now</Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); }}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ClientSupportChat />
    </DashboardLayout>
  );
}
