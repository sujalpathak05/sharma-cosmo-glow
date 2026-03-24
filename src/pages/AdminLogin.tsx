import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Login successful!");
      navigate("/admin");
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Admin Login – Sharma Cosmo Clinic</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Lock className="text-primary" size={28} />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Admin <span className="text-primary">Login</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2 font-body">
              Sign in to manage appointments
            </p>
          </div>

          <form onSubmit={handleLogin} className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 font-body">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-body"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 font-body">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-body"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 !py-3"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6 font-body">
            <a href="/" className="hover:text-foreground transition-colors">← Back to website</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
