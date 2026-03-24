import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Briefcase, Trash2, Heart } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface SavedLawyerRow {
  id: string;
  lawyer_id: string;
  lawyers: {
    id: string;
    name: string;
    firm: string;
    city: string | null;
    state: string | null;
    practice_areas: string[];
    experience_years: number;
    rating: number;
    review_count: number;
    avatar_initials: string;
    verified: boolean;
  };
}

export default function SavedLawyers() {
  const { user, profile } = useAuth();
  const [saved, setSaved] = useState<SavedLawyerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_lawyers")
      .select("id, lawyer_id, lawyers(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSaved((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSaved();
  }, [user]);

  const handleRemove = async (id: string) => {
    await supabase.from("saved_lawyers").delete().eq("id", id);
    setSaved((prev) => prev.filter((s) => s.id !== id));
    toast.success("Lawyer removed from saved");
  };

  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client" userName={profile?.full_name || "User"} userRole="Client">
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-6 w-6 text-accent" />
          <h1 className="font-serif text-2xl text-foreground">Saved Lawyers</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
          </div>
        ) : saved.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-serif text-lg text-foreground mb-2">No saved lawyers yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Browse lawyers and save your favorites for quick access.</p>
            <Button variant="gold" asChild>
              <Link to="/client/find-lawyers">Find Lawyers</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {saved.map((item, i) => {
              const lawyer = item.lawyers;
              if (!lawyer) return null;
              const location = [lawyer.city, lawyer.state].filter(Boolean).join(", ");
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-5 rounded-xl border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-accent">{lawyer.avatar_initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/client/lawyer/${lawyer.id}`} className="font-semibold text-foreground hover:text-accent transition-colors">
                      {lawyer.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{lawyer.firm}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {location && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{location}</span>
                      )}
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-accent fill-accent" />{lawyer.rating}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{lawyer.experience_years}y</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {lawyer.practice_areas?.[0] && (
                      <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">{lawyer.practice_areas[0]}</Badge>
                    )}
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleRemove(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
