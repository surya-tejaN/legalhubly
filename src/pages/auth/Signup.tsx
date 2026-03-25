import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth, useDashboardPath, type AppRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Scale, Mail, Lock, User, MapPin, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import PasswordStrengthMeter, { validatePassword } from "@/components/PasswordStrengthMeter";

const ROLES: { value: AppRole; label: string; desc: string }[] = [
  { value: "client", label: "I need a lawyer", desc: "Find and hire legal help" },
  { value: "lawyer", label: "I am a lawyer", desc: "Manage clients and cases" },
];

const BLOCKED_EMAILS = [
  "test@test.com", "test@example.com", "user@example.com",
  "admin@admin.com", "fake@fake.com", "a@a.com",
];

const BLOCKED_DOMAINS = [
  "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
  "fakeinbox.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
  "dispostable.com", "yopmail.com",
];

function isValidEmailDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  if (BLOCKED_DOMAINS.includes(domain)) return false;
  if (BLOCKED_EMAILS.includes(email.toLowerCase())) return false;
  if (!domain.includes(".")) return false;
  return true;
}

export default function Signup() {
  const { user, profile, loading } = useAuth();
  const dashboardPath = useDashboardPath(profile?.role);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState("");
  const [role, setRole] = useState<AppRole>("client");
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");

  if (!loading && user) return <Navigate to={dashboardPath} replace />;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      toast.error("Password does not meet all requirements.");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();
    if (!trimmedName) { toast.error("Please enter your full name."); return; }
    if (trimmedName.length > 100) { toast.error("Name must be less than 100 characters."); return; }
    if (!isValidEmailDomain(trimmedEmail)) {
      toast.error("Please use a valid email address from a real email provider.");
      return;
    }

    setSubmitting(true);
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email-success`,
        data: { full_name: trimmedName, role, city: city.trim() },
      },
    });

    if (error) {
      if (error.message.includes("already registered") || error.message.includes("already been registered")) {
        toast.error("This email is already registered. Please login instead.");
      } else if (error.message.includes("rate")) {
        toast.error("Too many signup attempts. Please try again in a few minutes.");
      } else {
        toast.error(error.message);
      }
      setSubmitting(false);
      return;
    }

    if (signUpData.user) {
      if (signUpData.user.identities && signUpData.user.identities.length === 0) {
        toast.error("This email is already registered. Please login or reset your password.");
        setSubmitting(false);
        return;
      }
      setSentToEmail(trimmedEmail);
      setEmailSent(true);
      toast.success("Verification email sent! Check your inbox.");
    }
    setSubmitting(false);
  };

  const handleGoogleSignup = async () => {
    setSubmitting(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast.error(error.message || "Google sign-in failed");
      setSubmitting(false);
    }
  };

  const handleAppleSignup = async () => {
    setSubmitting(true);
    const { error } = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast.error(error.message || "Apple sign-in failed");
      setSubmitting(false);
    }
  };

  // ── EMAIL SENT CONFIRMATION SCREEN ──
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-accent" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Check Your Email</h1>
            <p className="text-muted-foreground">We sent a verification link to:</p>
            <p className="text-foreground font-semibold mt-1">{sentToEmail}</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground space-y-2">
            <p>Click the link in the email to verify your account and get started.</p>
            <p>The link will expire in 24 hours.</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Didn't receive it? Check your spam folder or{" "}
            <button
              type="button"
              onClick={() => { setEmailSent(false); setSentToEmail(""); }}
              className="text-accent hover:underline font-medium"
            >
              try again
            </button>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Already verified?{" "}
            <Link to="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── SIGNUP FORM ──
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Scale className="h-8 w-8 text-accent" />
            <span className="font-serif text-2xl font-bold text-foreground">Legalhubly</span>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-foreground">Create your account</h1>
          <p className="mt-2 text-muted-foreground">Get started in minutes</p>
        </div>

        <div className="space-y-3">
          <Button variant="outline" className="w-full h-12 text-base font-medium" onClick={handleGoogleSignup} disabled={submitting}>
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>
          <Button variant="outline" className="w-full h-12 text-base font-medium" onClick={handleAppleSignup} disabled={submitting}>
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or sign up with email</span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label>I am a…</Label>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <button key={r.value} type="button" onClick={() => setRole(r.value)}
                  className={`rounded-xl border px-4 py-3 text-left transition-all ${role === r.value ? "border-accent bg-accent/10 ring-1 ring-accent" : "border-border bg-card hover:bg-muted"}`}>
                  <div className={`text-sm font-medium ${role === r.value ? "text-accent-foreground" : "text-foreground"}`}>{r.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="name" placeholder="Jane Doe" className="pl-10" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="city" placeholder="New York, NY" className="pl-10" value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrengthMeter password={password} />
          </div>

          <Button type="submit" className="w-full h-11" disabled={submitting || !validatePassword(password)}>
            {submitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…</>
            ) : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
