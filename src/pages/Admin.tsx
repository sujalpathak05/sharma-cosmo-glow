import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  LogOut,
  Settings,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SlotManagement from "@/components/admin/SlotManagement";
import ReviewManagement from "@/components/admin/ReviewManagement";
import { sqlTimeToSlotLabel } from "@/lib/appointmentTime";
import {
  AppointmentRecord,
  isLocalAppointmentId,
  localAppointmentsEventName,
  mergeAppointments,
  normalizeCloudAppointments,
  readLocalAppointments,
  updateLocalAppointmentStatus,
} from "@/lib/appointmentStore";

type Appointment = AppointmentRecord;

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
  const [hasLocalBackups, setHasLocalBackups] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    const localAppointments = readLocalAppointments();
    setHasLocalBackups(localAppointments.length > 0);

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch cloud appointments:", error);
      setAppointments(mergeAppointments([], localAppointments));

      if (localAppointments.length > 0) {
        toast.error("Cloud appointments unavailable. Showing local backup queue.");
      } else {
        toast.error("Failed to fetch appointments");
      }
    } else {
      setAppointments(
        mergeAppointments(
          normalizeCloudAppointments((data || []) as Array<Omit<AppointmentRecord, "source">>),
          localAppointments
        )
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!session) return;

    void fetchAppointments();

    const syncAppointments = () => {
      void fetchAppointments();
    };

    window.addEventListener("storage", syncAppointments);
    window.addEventListener(localAppointmentsEventName, syncAppointments);

    return () => {
      window.removeEventListener("storage", syncAppointments);
      window.removeEventListener(localAppointmentsEventName, syncAppointments);
    };
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

    if (isLocalAppointmentId(id)) {
      updateLocalAppointmentStatus(id, newStatus);
      setAppointments((prev) => prev.map((appointment) => (
        appointment.id === id ? { ...appointment, status: newStatus } : appointment
      )));
      toast.success(`Backup appointment marked as ${newStatus}`);
      setUpdating(null);
      return;
    }

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

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatTime = (time: string | null) => {
    return sqlTimeToSlotLabel(time) ?? "-";
  };

  return (
    <>
      <Helmet>
        <title>Admin Panel - Sharma Cosmo Clinic</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0 motion-grid opacity-20 pointer-events-none" />
        <div className="absolute left-[-7rem] top-24 h-64 w-64 motion-orb opacity-50 pointer-events-none" />
        <div className="absolute right-[-6rem] bottom-16 h-72 w-72 motion-orb opacity-40 pointer-events-none" />

        <header className="bg-card/90 backdrop-blur-xl border-b border-border sticky top-0 z-40">
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
              <button
                onClick={fetchAppointments}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/30 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </header>

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
          {activeTab === "reviews" ? (
            <ReviewManagement />
          ) : activeTab === "slots" ? (
            <SlotManagement />
          ) : (
            <>
              {hasLocalBackups && (
                <div className="glass-panel border border-amber-300/50 bg-amber-50/80 rounded-2xl px-5 py-4 mb-6 shadow-lg shadow-amber-200/40">
                  <p className="font-body text-sm text-amber-900">
                    Local backup queue is active. Some bookings were saved on this browser because live Supabase insert is blocked by row-level security.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total", count: appointments.length, color: "bg-muted" },
                  { label: "Pending", count: appointments.filter((a) => a.status === "pending").length, color: "bg-yellow-50" },
                  { label: "Confirmed", count: appointments.filter((a) => a.status === "confirmed").length, color: "bg-green-50" },
                  { label: "Completed", count: appointments.filter((a) => a.status === "completed").length, color: "bg-blue-50" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`${stat.color} glass-panel rounded-2xl p-4 sm:p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl`}
                  >
                    <p className="font-body text-sm text-muted-foreground">{stat.label}</p>
                    <p className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">{stat.count}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <Filter size={16} className="text-muted-foreground" />
                {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                      filterStatus === status ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

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
                  {filtered.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="glass-panel spotlight-card border border-border/70 rounded-[1.75rem] p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-display text-lg font-semibold text-foreground">{appointment.name}</h3>
                            <span
                              className={`px-3 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] ${
                                appointment.source === "local"
                                  ? "bg-amber-100 text-amber-900"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {appointment.source === "local" ? "Local Backup" : "Cloud"}
                            </span>
                            <span
                              className={`px-3 py-0.5 rounded-full text-xs font-medium capitalize ${
                                statusColors[appointment.status] || "bg-muted text-muted-foreground"
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                          <p className="font-body text-sm font-medium text-primary mb-3">{appointment.service}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground font-body">
                            <span className="flex items-center gap-2"><Phone size={14} /> {appointment.phone}</span>
                            {appointment.email && <span className="flex items-center gap-2"><Mail size={14} /> {appointment.email}</span>}
                            <span className="flex items-center gap-2"><MapPin size={14} /> {appointment.location}</span>
                            <span className="flex items-center gap-2"><Calendar size={14} /> {formatDate(appointment.preferred_date)}</span>
                            <span className="flex items-center gap-2"><Clock size={14} /> {formatTime(appointment.preferred_time)}</span>
                          </div>
                          {appointment.message && (
                            <p className="mt-3 text-sm text-muted-foreground font-body bg-muted rounded-lg p-3 italic">"{appointment.message}"</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-3 font-body">
                            Submitted: {new Date(appointment.created_at).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="flex sm:flex-col gap-2 flex-shrink-0">
                          {appointment.status !== "confirmed" && (
                            <button
                              onClick={() => updateStatus(appointment.id, "confirmed")}
                              disabled={updating === appointment.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 size={14} /> Confirm
                            </button>
                          )}
                          {appointment.status !== "completed" && (
                            <button
                              onClick={() => updateStatus(appointment.id, "completed")}
                              disabled={updating === appointment.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 size={14} /> Complete
                            </button>
                          )}
                          {appointment.status !== "cancelled" && (
                            <button
                              onClick={() => updateStatus(appointment.id, "cancelled")}
                              disabled={updating === appointment.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
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
