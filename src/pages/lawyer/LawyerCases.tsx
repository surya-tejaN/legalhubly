import DashboardLayout from "@/components/DashboardLayout";
import { lawyerNavItems } from "@/lib/navigation";
import { SectionHeader, StatusBadge } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Scale, ArrowRight, Filter, Plus, Users } from "lucide-react";
import { useState } from "react";

const cases = [
  { id: "C-2024-001", client: "Alex Johnson", title: "Wrongful Termination Claim", status: "Active", statusVariant: "success" as const, priority: "High", lastActivity: "2 hours ago", nextDeadline: "Mar 15, 2026", billable: "$2,450" },
  { id: "C-2024-005", client: "Robert Lee", title: "Commercial Real Estate Closing", status: "Active", statusVariant: "success" as const, priority: "Medium", lastActivity: "4 hours ago", nextDeadline: "Mar 20, 2026", billable: "$4,200" },
  { id: "C-2024-006", client: "Jennifer Lee", title: "Employment Discrimination", status: "Discovery", statusVariant: "info" as const, priority: "High", lastActivity: "1 day ago", nextDeadline: "Mar 25, 2026", billable: "$1,800" },
  { id: "C-2024-007", client: "Tom Wilson", title: "Non-Compete Negotiation", status: "Pending", statusVariant: "warning" as const, priority: "Low", lastActivity: "2 days ago", nextDeadline: "Apr 1, 2026", billable: "$350" },
  { id: "C-2024-003", client: "Susan Park", title: "Patent Application", status: "Under Review", statusVariant: "info" as const, priority: "Medium", lastActivity: "3 days ago", nextDeadline: "Apr 5, 2026", billable: "$3,100" },
];

const filters = ["All Cases", "Active", "Pending", "Under Review", "Closed"];

export default function LawyerCases() {
  const [activeFilter, setActiveFilter] = useState("All Cases");

  return (
    <DashboardLayout sidebarItems={lawyerNavItems} portalLabel="Lawyer Portal" userName="Sarah Chen" userRole="Attorney">
      <SectionHeader
        title="Case Management"
        subtitle="Manage and track all your active cases"
        action={<Button variant="gold" size="sm"><Plus className="mr-2 h-3.5 w-3.5" /> New Case</Button>}
      />

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === f ? "bg-accent text-accent-foreground" : "bg-card border text-muted-foreground hover:bg-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-card border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Case</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Client</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">Priority</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden xl:table-cell">Deadline</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Billed</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-foreground">{c.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{c.id} · Updated {c.lastActivity}</div>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">
                        {c.client.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="text-sm text-foreground">{c.client}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={c.status} variant={c.statusVariant} /></td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className={`text-xs font-semibold ${c.priority === "High" ? "text-destructive" : c.priority === "Medium" ? "text-warning" : "text-muted-foreground"}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground hidden xl:table-cell">{c.nextDeadline}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-foreground hidden lg:table-cell">{c.billable}</td>
                  <td className="px-5 py-4 text-right">
                    <Button variant="ghost" size="sm">Open <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
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
