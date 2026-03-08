import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { SectionHeader, StatCard, StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { CreditCard, DollarSign, Clock, CheckCircle2, Download } from "lucide-react";

const invoices = [
  { id: "INV-001", description: "Employment Dispute - Consultation", amount: "$350.00", date: "Mar 6, 2026", status: "Paid", statusVariant: "success" as const },
  { id: "INV-002", description: "Lease Review - Document Analysis", amount: "$275.00", date: "Mar 3, 2026", status: "Paid", statusVariant: "success" as const },
  { id: "INV-003", description: "Employment Dispute - Response Drafting", amount: "$700.00", date: "Mar 8, 2026", status: "Pending", statusVariant: "warning" as const },
  { id: "INV-004", description: "LLC Formation - Filing Fees", amount: "$500.00", date: "Feb 28, 2026", status: "Paid", statusVariant: "success" as const },
  { id: "INV-005", description: "Trademark Application Filing", amount: "$450.00", date: "Mar 7, 2026", status: "Due Mar 15", statusVariant: "warning" as const },
];

export default function ClientPayments() {
  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName="Alex Johnson" userRole="Client">
      <SectionHeader title="Payments & Invoices" subtitle="Manage your billing and payment history" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<DollarSign className="h-5 w-5 text-accent" />} label="Total Spent" value="$2,275" change="This month" changeType="neutral" />
        <StatCard icon={<Clock className="h-5 w-5 text-accent" />} label="Pending" value="$1,150" change="2 invoices" changeType="neutral" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-accent" />} label="Paid" value="$1,125" change="3 invoices" changeType="positive" />
        <StatCard icon={<CreditCard className="h-5 w-5 text-accent" />} label="Payment Method" value="•••• 4242" />
      </div>

      {/* Payment method card */}
      <div className="rounded-xl bg-card border shadow-card p-5 mb-6">
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
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Date</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-medium text-foreground">{inv.id}</div>
                    <div className="text-xs text-muted-foreground">{inv.description}</div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground hidden sm:table-cell">{inv.date}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-foreground">{inv.amount}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={inv.status} variant={inv.statusVariant} /></td>
                  <td className="px-5 py-3.5 text-right">
                    {inv.status === "Pending" || inv.status.startsWith("Due") ? (
                      <Button variant="gold" size="sm">Pay Now</Button>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-3.5 w-3.5" /></Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
