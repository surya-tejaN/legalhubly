import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, Trash2, Eye, FolderOpen, Search, Filter } from "lucide-react";

const documents = [
  { name: "Employment Contract", type: "PDF", size: "245 KB", case: "Employment Dispute", uploaded: "Mar 5, 2026", by: "You" },
  { name: "Termination Letter", type: "PDF", size: "120 KB", case: "Employment Dispute", uploaded: "Mar 4, 2026", by: "You" },
  { name: "Response Draft v2", type: "DOCX", size: "85 KB", case: "Employment Dispute", uploaded: "Mar 6, 2026", by: "Sarah Chen" },
  { name: "Lease Agreement", type: "PDF", size: "512 KB", case: "Lease Review", uploaded: "Mar 1, 2026", by: "You" },
  { name: "LLC Operating Agreement", type: "PDF", size: "340 KB", case: "Business Formation", uploaded: "Feb 28, 2026", by: "Lisa Wong" },
  { name: "Trademark Application", type: "PDF", size: "180 KB", case: "Trademark Registration", uploaded: "Mar 7, 2026", by: "James Miller" },
];

const fileTypeColors: Record<string, string> = {
  PDF: "bg-destructive/10 text-destructive",
  DOCX: "bg-info/10 text-info",
  JPG: "bg-success/10 text-success",
};

export default function ClientDocuments() {
  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName="Alex Johnson" userRole="Client">
      <SectionHeader
        title="Documents"
        subtitle="Manage all your legal documents"
        action={<Button variant="gold" size="sm"><Upload className="mr-2 h-3.5 w-3.5" /> Upload</Button>}
      />

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-card border rounded-lg px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search documents..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
        <Button variant="outline" size="sm"><Filter className="mr-2 h-3.5 w-3.5" /> Filter</Button>
      </div>

      <div className="rounded-xl bg-card border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Document</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">Case</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Uploaded</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden lg:table-cell">By</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {documents.map((doc, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${fileTypeColors[doc.type] || "bg-muted text-muted-foreground"}`}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{doc.name}</div>
                        <div className="text-xs text-muted-foreground">{doc.type} · {doc.size}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground hidden md:table-cell">{doc.case}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground hidden sm:table-cell">{doc.uploaded}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground hidden lg:table-cell">{doc.by}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-3.5 w-3.5" /></Button>
                    </div>
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
