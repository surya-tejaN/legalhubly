import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import {
  FileText, Upload, Download, Trash2, Search, FolderOpen,
  Lock, File, X, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import ClientSupportChat from "@/components/ClientSupportChat";

interface Doc {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  bucket: string;
  path: string;
  created_at: string;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const fileTypeStyles: Record<string, string> = {
  "application/pdf": "bg-destructive/10 text-destructive",
  "application/msword": "bg-info/10 text-info",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "bg-info/10 text-info",
  "image/jpeg": "bg-success/10 text-success",
  "image/png": "bg-success/10 text-success",
  "image/webp": "bg-success/10 text-success",
  "application/vnd.ms-excel": "bg-warning/10 text-warning",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "bg-warning/10 text-warning",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTypeLabel(ct: string): string {
  if (ct.includes("pdf")) return "PDF";
  if (ct.includes("msword")) return "DOC";
  if (ct.includes("wordprocessingml")) return "DOCX";
  if (ct.includes("jpeg")) return "JPG";
  if (ct.includes("png")) return "PNG";
  if (ct.includes("webp")) return "WEBP";
  if (ct.includes("ms-excel")) return "XLS";
  if (ct.includes("spreadsheetml")) return "XLSX";
  return "FILE";
}

export default function ClientDocuments() {
  const { user, profile } = useAuth();
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    setDocuments((data as Doc[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Only PDF, DOCX, JPG, PNG allowed`);
        continue;
      }
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`${file.name}: Max 25MB`);
        continue;
      }

      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file);
      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        console.error(uploadError);
        continue;
      }

      const { error: dbError } = await supabase.from("documents").insert({
        owner_user_id: user.id,
        bucket: "documents",
        path: filePath,
        filename: file.name,
        content_type: file.type,
        size_bytes: file.size,
      });
      if (dbError) {
        toast.error(`Failed to save ${file.name} metadata`);
        console.error(dbError);
        continue;
      }

      toast.success(`${file.name} uploaded`);
    }

    await loadDocuments();
    setUploading(false);
  };

  const downloadDoc = async (doc: Doc) => {
    const { data, error } = await supabase.storage.from(doc.bucket).createSignedUrl(doc.path, 600);
    if (error || !data) {
      toast.error("Failed to generate download link");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const deleteDoc = async (doc: Doc) => {
    if (!confirm("Delete this document permanently?")) return;
    await supabase.storage.from(doc.bucket).remove([doc.path]);
    const { error } = await supabase.from("documents").delete().eq("id", doc.id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    toast.success("Document deleted");
  };

  const filtered = documents.filter((d) =>
    !searchQuery || d.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName={profile?.full_name || "User"} userRole="Client">
      <SectionHeader
        title="Secure File Vault"
        subtitle="Your documents are encrypted and only accessible by you"
        action={
          <Button variant="gold" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-2 h-3.5 w-3.5" />}
            Upload
          </Button>
        }
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.xls,.xlsx"
        onChange={(e) => { handleUpload(e.target.files); e.target.value = ""; }}
      />

      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-success/5 border border-success/20 mb-6">
        <Lock className="h-5 w-5 text-success shrink-0" />
        <div>
          <div className="text-sm font-medium text-foreground">Secure storage</div>
          <div className="text-xs text-muted-foreground">Files are encrypted in transit and at rest, accessible only by you and your assigned lawyers.</div>
        </div>
      </div>

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
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
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

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-card border">
          <FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          <h3 className="font-serif text-lg text-foreground mb-2">
            {documents.length === 0 ? "No documents yet" : "No files match your search"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Upload PDF, DOC, DOCX, JPG, PNG, WEBP, XLS, or XLSX files (max 25MB each)</p>
          {documents.length === 0 && (
            <Button variant="gold" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-3.5 w-3.5" /> Upload First Document
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-card border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Document</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Uploaded</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((doc, i) => (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", fileTypeStyles[doc.content_type] || "bg-muted text-muted-foreground")}>
                          {doc.content_type.includes("pdf") ? <FileText className="h-4 w-4" /> : <File className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-foreground">{doc.filename}</span>
                            <Lock className="h-3 w-3 text-success" />
                          </div>
                          <div className="text-xs text-muted-foreground">{getTypeLabel(doc.content_type)} · {formatBytes(doc.size_bytes)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground hidden sm:table-cell">
                      {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadDoc(doc)} title="Download">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteDoc(doc)} title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ClientSupportChat />
    </DashboardLayout>
  );
}
