import { useCallback, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Eye, EyeOff, Loader2, Lock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!email.trim() || !password.trim()) {
        return;
      }

      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Login successful!");
        navigate("/admin");
      }

      setLoading(false);
    },
    [email, password, navigate],
  );

  return (
    <>
      <Helmet>
        <title>Admin Login - Sharma Cosmo Clinic</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite_1s]" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8 animate-fade-up" style={{ animationDuration: "0.5s" }}>
            <div className="inline-flex items-center justify-center w-18 h-18 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-5 shadow-lg shadow-primary/10 animate-[scale-in_0.4s_ease-out]">
              <Shield className="text-primary" size={32} />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Admin <span className="text-primary">Panel</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2 font-body">
              Admin password can only be created or changed manually by the owner.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl shadow-foreground/5 animate-fade-up"
            style={{ animationDelay: "0.15s", animationDuration: "0.5s", animationFillMode: "both" }}
          >
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground font-body">Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 font-body transition-all duration-200"
                  placeholder="admin@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground font-body">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 font-body transition-all duration-200"
                  placeholder="********"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full btn-primary flex items-center justify-center gap-2 !py-3 !rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 disabled:hover:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p
            className="text-center text-xs text-muted-foreground mt-6 font-body animate-fade-up"
            style={{ animationDelay: "0.3s", animationDuration: "0.5s", animationFillMode: "both" }}
          >
            <a href="/" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
              Back to website
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
