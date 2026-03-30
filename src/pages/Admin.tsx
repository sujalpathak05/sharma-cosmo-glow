import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, Clock, MapPin, Phone, Mail, Filter, RefreshCw, CheckCircle2, XCircle, Loader2, LogOut, Settings, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SlotManagement from "@/components/admin/SlotManagement";
import ReviewManagement from "@/components/admin/ReviewManagement";

type Appointment = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string;
  location: string;
  preferred_date: string | null;
  preferred_time: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

const Admin = () => {
  const { session, loading: authLoading, signOut } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"appointments" | "slots" | "reviews">("appointments");

  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch appointments");
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session) fetchAppointments();
  }, [session]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!session) return <Navigate to="/admin/login" replace />;

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    const { error } = await supabase.from("appointments").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Appointment marked as ${newStatus}`);
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    }
    setUpdating(null);
  };

  const filtered = filterStatus === "all" ? appointments : appointments.filter((a) => a.status === filterStatus);

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatTime = (t: string | null) => {
    if (!t) return "—";
    // If it's a slot format like "11:00 AM – 11:15 AM", return as-is
    if (t.includes("AM") || t.includes("PM")) return t;
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  return (
    <>
      <Helmet>
        <title>Admin Panel – Sharma Cosmo Clinic</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="font-display text-xl font-bold text-foreground">
                Admin <span className="text-primary">Panel</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchAppointments} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
              <button onClick={signOut} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/30 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </header>

        {/* Tab navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex gap-2 border-b border-border pb-0">
            <button
              onClick={() => setActiveTab("appointments")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === "appointments"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar size={16} /> Appointments
            </button>
            <button
              onClick={() => setActiveTab("slots")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === "slots"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings size={16} /> Manage Slots & Dates
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === "reviews"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare size={16} /> Reviews
            </button>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "slots" ? (
            <SlotManagement />
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total", count: appointments.length, color: "bg-muted" },
                  { label: "Pending", count: appointments.filter((a) => a.status === "pending").length, color: "bg-yellow-50" },
                  { label: "Confirmed", count: appointments.filter((a) => a.status === "confirmed").length, color: "bg-green-50" },
                  { label: "Completed", count: appointments.filter((a) => a.status === "completed").length, color: "bg-blue-50" },
                ].map((s) => (
                  <div key={s.label} className={`${s.color} rounded-xl p-4 sm:p-6`}>
                    <p className="font-body text-sm text-muted-foreground">{s.label}</p>
                    <p className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">{s.count}</p>
                  </div>
                ))}
              </div>

              {/* Filter */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <Filter size={16} className="text-muted-foreground" />
                {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                      filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Appointments list */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-primary" size={32} />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground font-body">No appointments found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((apt) => (
                    <div key={apt.id} className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-display text-lg font-semibold text-foreground">{apt.name}</h3>
                            <span className={`px-3 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[apt.status] || "bg-muted text-muted-foreground"}`}>
                              {apt.status}
                            </span>
                          </div>
                          <p className="font-body text-sm font-medium text-primary mb-3">{apt.service}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground font-body">
                            <span className="flex items-center gap-2"><Phone size={14} /> {apt.phone}</span>
                            {apt.email && <span className="flex items-center gap-2"><Mail size={14} /> {apt.email}</span>}
                            <span className="flex items-center gap-2"><MapPin size={14} /> {apt.location}</span>
                            <span className="flex items-center gap-2"><Calendar size={14} /> {formatDate(apt.preferred_date)}</span>
                            <span className="flex items-center gap-2"><Clock size={14} /> {formatTime(apt.preferred_time)}</span>
                          </div>
                          {apt.message && (
                            <p className="mt-3 text-sm text-muted-foreground font-body bg-muted rounded-lg p-3 italic">"{apt.message}"</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-3 font-body">
                            Submitted: {new Date(apt.created_at).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="flex sm:flex-col gap-2 flex-shrink-0">
                          {apt.status !== "confirmed" && (
                            <button onClick={() => updateStatus(apt.id, "confirmed")} disabled={updating === apt.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50">
                              <CheckCircle2 size={14} /> Confirm
                            </button>
                          )}
                          {apt.status !== "completed" && (
                            <button onClick={() => updateStatus(apt.id, "completed")} disabled={updating === apt.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50">
                              <CheckCircle2 size={14} /> Complete
                            </button>
                          )}
                          {apt.status !== "cancelled" && (
                            <button onClick={() => updateStatus(apt.id, "cancelled")} disabled={updating === apt.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50">
                              <XCircle size={14} /> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default Admin;
