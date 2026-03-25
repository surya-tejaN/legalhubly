import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Scale, CheckCircle2, XCircle, Loader2 } from "lucide-react";

type Status = "loading" | "valid" | "already" | "invalid" | "success" | "error";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    (async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`;
        const res = await fetch(url, { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } });
        const data = await res.json();
        if (!res.ok) { setStatus("invalid"); return; }
        if (data.valid === false && data.reason === "already_unsubscribed") { setStatus("already"); return; }
        setStatus("valid");
      } catch { setStatus("invalid"); }
    })();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
      if (error) throw error;
      if (data?.success) setStatus("success");
      else if (data?.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch { setStatus("error"); }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <Scale className="h-10 w-10 text-accent mx-auto" />
        <h1 className="font-serif text-2xl font-bold text-foreground">Email Preferences</h1>

        {status === "loading" && <Loader2 className="h-6 w-6 animate-spin text-accent mx-auto" />}

        {status === "valid" && (
          <div className="space-y-4">
            <p className="text-muted-foreground">Would you like to unsubscribe from Legalhubly emails?</p>
            <Button onClick={handleUnsubscribe} disabled={submitting} className="w-full">
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : "Confirm Unsubscribe"}
            </Button>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-3">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <p className="text-foreground font-medium">You've been unsubscribed.</p>
            <p className="text-sm text-muted-foreground">You will no longer receive app emails from Legalhubly.</p>
          </div>
        )}

        {status === "already" && (
          <div className="space-y-3">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-foreground font-medium">Already unsubscribed.</p>
            <p className="text-sm text-muted-foreground">You're not receiving app emails from Legalhubly.</p>
          </div>
        )}

        {status === "invalid" && (
          <div className="space-y-3">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-foreground font-medium">Invalid or expired link.</p>
            <p className="text-sm text-muted-foreground">This unsubscribe link is no longer valid.</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-3">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-foreground font-medium">Something went wrong.</p>
            <p className="text-sm text-muted-foreground">Please try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
