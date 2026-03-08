import { useState, useRef, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import {
  FileText, Upload, Download, Eye, Search, Filter, FolderOpen,
  Lock, Shield, Image, File, Plus, X, Loader2, CheckCircle2, Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ClientSupportChat from "@/components/ClientSupportChat";

interface VaultFile {
  name: string;
  type: string;
  size: string;
  case: string;
  folder: string;
  uploaded: string;
  by: string;
  secure: boolean;
}

const folders = [
  { name: "All Files", icon: <FolderOpen className="h-4 w-4" />, count: 8 },
  { name: "Employment Dispute", icon: <FolderOpen className="h-4 w-4" />, count: 4 },
  { name: "Lease Review", icon: <FolderOpen className="h-4 w-4" />, count: 2 },
  { name: "Business Formation", icon: <FolderOpen className="h-4 w-4" />, count: 1 },
  { name: "Shared with Me", icon: <Shield className="h-4 w-4" />, count: 3 },
];

const documents: VaultFile[] = [
  { name: "Employment Contract", type: "PDF", size: "245 KB", case: "Employment Dispute", folder: "Employment Dispute", uploaded: "Mar 5, 2026", by: "You", secure: true },
  { name: "Termination Letter", type: "PDF", size: "120 KB", case: "Employment Dispute", folder: "Employment Dispute", uploaded: "Mar 4, 2026", by: "You", secure: true },
  { name: "Response Draft v2", type: "DOCX", size: "85 KB", case: "Employment Dispute", folder: "Employment Dispute", uploaded: "Mar 6, 2026", by: "Sarah Chen", secure: true },
  { name: "Pay Stubs Q4 2025", type: "PDF", size: "1.2 MB", case: "Employment Dispute", folder: "Employment Dispute", uploaded: "Mar 7, 2026", by: "You", secure: true },
  { name: "Lease Agreement", type: "PDF", size: "512 KB", case: "Lease Review", folder: "Lease Review", uploaded: "Mar 1, 2026", by: "You", secure: true },
  { name: "Property Photos", type: "JPG", size: "3.4 MB", case: "Lease Review", folder: "Lease Review", uploaded: "Mar 2, 2026", by: "You", secure: false },
  { name: "LLC Operating Agreement", type: "PDF", size: "340 KB", case: "Business Formation", folder: "Business Formation", uploaded: "Feb 28, 2026", by: "Lisa Wong", secure: true },
  { name: "Engagement Letter — Chen", type: "PDF", size: "180 KB", case: "Employment Dispute", folder: "Shared with Me", uploaded: "Mar 3, 2026", by: "Sarah Chen", secure: true },
];

const fileTypeStyles: Record<string, string> = {
  PDF: "bg-destructive/10 text-destructive",
  DOCX: "bg-info/10 text-info",
  JPG: "bg-success/10 text-success",
  PNG: "bg-success/10 text-success",
};

export default function ClientDocuments() {
  const [activeFolder, setActiveFolder] = useState("All Files");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = documents.filter((d) => {
    const folderMatch = activeFolder === "All Files" || d.folder === activeFolder;
    const searchMatch = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.case.toLowerCase().includes(searchQuery.toLowerCase());
    return folderMatch && searchMatch;
  });

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    for (const file of Array.from(files)) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 20MB limit`);
        continue;
      }
      const path = `client_vault/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("intake-documents").upload(path, file);
      if (error) {
        toast.error(`Failed to upload ${file.name}`);
      } else {
        toast.success(`${file.name} uploaded securely`);
      }
    }
    setIsUploading(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  }, [handleUpload]);

  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName="Alex Johnson" userRole="Client">
      <SectionHeader
        title="Secure File Vault"
        subtitle="Your documents are encrypted and only shared with your assigned lawyers"
        action={
          <Button variant="gold" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-2 h-3.5 w-3.5" />}
            Upload
          </Button>
        }
      />
      <input ref={fileInputRef} type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xls,.xlsx" onChange={(e) => handleUpload(e.target.files)} />

      {/* Security banner */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-success/5 border border-success/20 mb-6">
        <Lock className="h-5 w-5 text-success shrink-0" />
        <div>
          <div className="text-sm font-medium text-foreground">End-to-end encrypted storage</div>
          <div className="text-xs text-muted-foreground">All files are securely stored and only accessible by you and your assigned lawyers.</div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Folder sidebar */}
        <div className="hidden md:block w-56 shrink-0">
          <div className="rounded-xl bg-card border shadow-card p-2 space-y-0.5 sticky top-20">
            {folders.map((f) => (
              <button
                key={f.name}
                onClick={() => setActiveFolder(f.name)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  activeFolder === f.name
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <span className="shrink-0">{f.icon}</span>
                <span className="flex-1 text-left truncate">{f.name}</span>
                <span className="text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded-full">{f.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Files area */}
        <div className="flex-1 min-w-0">
          {/* Search */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 flex items-center gap-2 bg-card border rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {/* Mobile folder selector */}
            <select
              value={activeFolder}
              onChange={(e) => setActiveFolder(e.target.value)}
              className="md:hidden rounded-lg border bg-card px-3 py-2 text-sm"
            >
              {folders.map((f) => <option key={f.name}>{f.name}</option>)}
            </select>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "rounded-xl border-2 border-dashed transition-colors mb-4",
              dragOver ? "border-accent bg-accent/5" : "border-transparent"
            )}
          >
            {dragOver && (
              <div className="flex items-center justify-center gap-3 p-8 text-accent">
                <Upload className="h-6 w-6" />
                <span className="font-medium">Drop files to upload securely</span>
              </div>
            )}
          </div>

          {/* Files table */}
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
                  {filtered.map((doc, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", fileTypeStyles[doc.type] || "bg-muted text-muted-foreground")}>
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-foreground">{doc.name}</span>
                              {doc.secure && <Lock className="h-3 w-3 text-success" />}
                            </div>
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No files found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ClientSupportChat />
    </DashboardLayout>
  );
}
