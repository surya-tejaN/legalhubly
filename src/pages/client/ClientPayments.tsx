import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { SectionHeader, StatCard, StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { CreditCard, DollarSign, Clock, CheckCircle2, Download, FileText, Eye, ArrowRight, Shield, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ClientSupportChat from "@/components/ClientSupportChat";

const invoices = [
  { id: "INV-001", description: "Employment Dispute - Initial Consultation", lawyer: "Sarah Chen", amount: "$350.00", date: "Mar 6, 2026", dueDate: "Mar 6, 2026", status: "Paid", statusVariant: "success" as const },
  { id: "INV-002", description: "Lease Review - Document Analysis", lawyer: "Michael Park", amount: "$275.00", date: "Mar 3, 2026", dueDate: "Mar 3, 2026", status: "Paid", statusVariant: "success" as const },
  { id: "INV-003", description: "Employment Dispute - Response Drafting", lawyer: "Sarah Chen", amount: "$700.00", date: "Mar 8, 2026", dueDate: "Mar 15, 2026", status: "Pending", statusVariant: "warning" as const },
  { id: "INV-004", description: "LLC Formation - Filing Fees", lawyer: "Lisa Wong", amount: "$500.00", date: "Feb 28, 2026", dueDate: "Feb 28, 2026", status: "Paid", statusVariant: "success" as const },
  { id: "INV-005", description: "Trademark Application Filing", lawyer: "James Miller", amount: "$450.00", date: "Mar 7, 2026", dueDate: "Mar 22, 2026", status: "Due Mar 22", statusVariant: "warning" as const },
];

type ViewMode = "list" | "detail";

export default function ClientPayments() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedInvoice, setSelectedInvoice] = useState<typeof invoices[0] | null>(null);

  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName="Alex Johnson" userRole="Client">
      <SectionHeader title="Payments & Invoices" subtitle="Track your billing and payment history" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <StatCard icon={<DollarSign className="h-5 w-5 text-accent" />} label="Total Spent" value="$2,275" change="This month" changeType="neutral" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatCard icon={<Clock className="h-5 w-5 text-accent" />} label="Pending" value="$1,150" change="2 invoices" changeType="neutral" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard icon={<CheckCircle2 className="h-5 w-5 text-accent" />} label="Paid" value="$1,125" change="3 invoices" changeType="positive" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatCard icon={<CreditCard className="h-5 w-5 text-accent" />} label="Payment Method" value="•••• 4242" />
        </motion.div>
      </div>

      {/* Security + payment method */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 rounded-xl bg-card border shadow-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-medium text-sm text-foreground">Visa ending in 4242</div>
                <div className="text-xs text-muted-foreground">Expires 12/2028</div>
              </div>
            </div>
            <Button variant="outline" size="sm">Update</Button>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setSelectedInvoice(null)} />
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative bg-card rounded-2xl border shadow-card-hover max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-xl text-foreground">{selectedInvoice.id}</h3>
                <StatusBadge status={selectedInvoice.status} variant={selectedInvoice.statusVariant} />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Description</span>
                  <span className="text-foreground font-medium text-right max-w-[200px]">{selectedInvoice.description}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lawyer</span>
                  <span className="text-foreground font-medium">{selectedInvoice.lawyer}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Issue Date</span>
                  <span className="text-foreground">{selectedInvoice.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="text-foreground">{selectedInvoice.dueDate}</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t">
                  <span className="font-semibold text-foreground">Amount</span>
                  <span className="font-bold text-xl text-accent">{selectedInvoice.amount}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {selectedInvoice.status === "Paid" ? (
                  <Button variant="outline" className="flex-1"><Download className="mr-2 h-4 w-4" /> Download Receipt</Button>
                ) : (
                  <Button variant="gold" className="flex-1">Pay Now</Button>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Invoice</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">Lawyer</th>
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
                    <div className="text-sm font-medium text-foreground">{inv.id}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{inv.description}</div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground hidden md:table-cell">{inv.lawyer}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground hidden sm:table-cell">{inv.date}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-foreground">{inv.amount}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={inv.status} variant={inv.statusVariant} /></td>
                  <td className="px-5 py-3.5 text-right">
                    {inv.status === "Pending" || inv.status.startsWith("Due") ? (
                      <Button variant="gold" size="sm" onClick={(e) => { e.stopPropagation(); }}>Pay Now</Button>
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
      </div>

      <ClientSupportChat />
    </DashboardLayout>
  );
}
