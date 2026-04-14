import { useEffect, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Navigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Filter,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Settings,
  Star,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import SlotManagement from "@/components/admin/SlotManagement";
import ReviewManagement from "@/components/admin/ReviewManagement";
import DoctorPanel from "@/components/admin/DoctorPanel";
import OpdBillingPanel from "@/components/admin/OpdBillingPanel";
import PharmacyPanel from "@/components/admin/PharmacyPanel";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { slotLabelToSqlTime, sqlTimeToSlotLabel } from "@/lib/appointmentTime";
import {
  type AppointmentRecord,
  isLocalAppointmentId,
  localAppointmentsEventName,
  mergeAppointments,
  normalizeCloudAppointments,
  readLocalAppointments,
  updateLocalAppointmentStatus,
} from "@/lib/appointmentStore";
import { getConsultationFee, getConsultationModeLabel } from "@/lib/consultationMode";
import { getServicePrice, formatServicePrice } from "@/lib/servicePricing";
import { cn } from "@/lib/utils";

type Appointment = AppointmentRecord;
type AdminSection =
  | "overview"
  | "doctor"
  | "appointments"
  | "messages"
  | "billing"
  | "pharmacy"
  | "patients"
  | "followups"
  | "schedule"
  | "reviews"
  | "analytics";

type SectionItem = {
  id: AdminSection;
  label: string;
  caption: string;
  icon: LucideIcon;
};

type PatientProfile = {
  key: string;
  name: string;
  phone: string;
  email: string | null;
  appointments: number;
  completed: number;
  upcoming: number;
  services: string[];
  lastSeen: string;
  nextVisit: string | null;
  estimatedValue: number;
};

const sections: SectionItem[] = [
  { id: "overview", label: "Overview", caption: "Command center", icon: LayoutDashboard },
  { id: "doctor", label: "Doctor Panel", caption: "Doctor desk", icon: Activity },
  { id: "appointments", label: "Appointments", caption: "Booking desk", icon: Calendar },
  { id: "messages", label: "Messages", caption: "Patient outreach", icon: MessageSquare },
  { id: "billing", label: "OPD Billing", caption: "Revenue desk", icon: Wallet },
  { id: "pharmacy", label: "Pharmacy", caption: "Inventory and sales", icon: Wallet },
  { id: "patients", label: "Patients", caption: "Patient base", icon: Users },
  { id: "followups", label: "Follow Up", caption: "Care continuity", icon: Bell },
  { id: "schedule", label: "Schedule", caption: "Slot control", icon: Settings },
  { id: "reviews", label: "Reviews", caption: "Reputation desk", icon: Star },
  { id: "analytics", label: "Analytics", caption: "Performance", icon: BarChart3 },
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
  completed: "bg-sky-100 text-sky-800",
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const pad2 = (value: number) => String(value).padStart(2, "0");
const toDateKey = (date: Date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
};

const normalizeTime = (value: string | null | undefined) => {
  if (!value) return "12:00:00";
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  return slotLabelToSqlTime(value) ?? "12:00:00";
};

const appointmentMs = (appointment: Appointment) => {
  if (appointment.preferred_date) {
    const date = new Date(`${appointment.preferred_date}T${normalizeTime(appointment.preferred_time)}`);
    if (!Number.isNaN(date.getTime())) return date.getTime();
  }
  return new Date(appointment.created_at).getTime();
};

const estimateValue = (service: string, consultationMode?: string | null) => {
  if (consultationMode) return getConsultationFee(consultationMode);
  const value = service.toLowerCase();
  if (value.includes("full body")) return 60000;
  if (value.includes("bikini")) return 30000;
  if (value.includes("under arm") || value.includes("underarm")) return 15000;
  if (value.includes("both arm")) return 20000;
  if (value.includes("both leg")) return 30000;
  if (value.includes("laser") && value.includes("face")) return 30000;
  if (value.includes("laser") && value.includes("trial")) return 30000;
  if (value.includes("mizo")) return 5500;
  if (value.includes("gfc")) return 4500;
  if (value.includes("prp")) return 3000;
  if (value.includes("filler")) return 18000;
  if (value.includes("botox")) return 12000;
  if (value.includes("laser")) return 4500;
  if (value.includes("hair")) return 3500;
  if (value.includes("facial") || value.includes("hydra")) return 2500;
  if (value.includes("peel")) return 2200;
  if (value.includes("consult")) return 800;
  if (value.includes("acne") || value.includes("pigmentation")) return 2000;
  return 1500;
};

const Panel = ({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) => (
  <section className="glass-panel rounded-[30px] border border-[#f0ddb8] p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="font-display text-2xl text-foreground">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const Metric = ({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string | number; detail: string }) => (
  <div className="rounded-[24px] border border-[#edd4a1] bg-white/75 p-4 shadow-[0_16px_36px_-28px_rgba(78,51,10,0.24)]">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className="mt-3 font-display text-3xl text-foreground">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
      </div>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff2d1] text-[#bf7e22]">
        <Icon className="h-5 w-5" />
      </span>
    </div>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-[22px] border border-dashed border-[#e8d7b4] bg-white/55 px-5 py-10 text-center text-sm text-muted-foreground">
    {message}
  </div>
);

const Admin = () => {
  const { session, loading: authLoading, signOut } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [opdDraftAppointmentId, setOpdDraftAppointmentId] = useState<string | null>(null);
  const [hasLocalBackups, setHasLocalBackups] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    const localAppointments = readLocalAppointments();
    setHasLocalBackups(localAppointments.length > 0);
    const { data, error } = await supabase.from("appointments").select("*").order("created_at", { ascending: false });

    if (error) {
      setAppointments(mergeAppointments([], localAppointments));
      toast.error(localAppointments.length > 0 ? "Cloud unavailable. Showing local backup queue." : "Failed to fetch appointments.");
    } else {
      setAppointments(
        mergeAppointments(
          normalizeCloudAppointments((data || []) as Array<Omit<AppointmentRecord, "source">>),
          localAppointments,
        ),
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    document.body.classList.remove("bill-print-mode");
  }, []);

  useEffect(() => {
    if (!session) return;
    void fetchAppointments();
    const sync = () => void fetchAppointments();
    const appointmentsChannel = supabase
      .channel("admin-appointments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
        },
        () => {
          void fetchAppointments();
        },
      )
      .subscribe();
    window.addEventListener("storage", sync);
    window.addEventListener(localAppointmentsEventName, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(localAppointmentsEventName, sync);
      void supabase.removeChannel(appointmentsChannel);
    };
  }, [session]);

  const updateStatus = async (id: string, nextStatus: string) => {
    setUpdating(id);
    if (isLocalAppointmentId(id)) {
      updateLocalAppointmentStatus(id, nextStatus);
      setAppointments((current) => current.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)));
      setUpdating(null);
      return;
    }

    const { error } = await supabase.from("appointments").update({ status: nextStatus }).eq("id", id);
    if (error) {
      toast.error("Failed to update appointment status.");
    } else {
      toast.success(`Appointment marked as ${nextStatus}.`);
      setAppointments((current) => current.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)));
    }
    setUpdating(null);
  };

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!session) return <Navigate to="/admin/login" replace />;

  const todayKey = toDateKey(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = toDateKey(tomorrow);

  const uniquePatients = new Set(appointments.map((item) => item.phone || item.id)).size;
  const todayAppointments = appointments.filter((item) => item.preferred_date === todayKey && item.status !== "cancelled");
  const pendingCount = appointments.filter((item) => item.status === "pending").length;
  const confirmedCount = appointments.filter((item) => item.status === "confirmed").length;
  const completedCount = appointments.filter((item) => item.status === "completed").length;
  const cancelledCount = appointments.filter((item) => item.status === "cancelled").length;
  const appointmentSearchTerm = appointmentSearch.trim().toLowerCase();
  const filteredAppointments = appointments.filter((item) => {
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    if (!matchesStatus) return false;
    if (!appointmentSearchTerm) return true;
    return item.name.toLowerCase().includes(appointmentSearchTerm) || item.phone.includes(appointmentSearchTerm);
  });
  const upcomingAppointments = [...appointments]
    .filter((item) => item.preferred_date && item.preferred_date >= todayKey && item.status !== "cancelled")
    .sort((left, right) => appointmentMs(left) - appointmentMs(right));
  const callbackQueue = [...appointments].filter((item) => item.status === "pending").sort((left, right) => appointmentMs(right) - appointmentMs(left)).slice(0, 6);
  const feedbackQueue = [...appointments].filter((item) => item.status === "completed").sort((left, right) => appointmentMs(right) - appointmentMs(left)).slice(0, 6);
  const rescueQueue = [...appointments].filter((item) => item.status === "cancelled").sort((left, right) => appointmentMs(right) - appointmentMs(left)).slice(0, 6);

  const messageRows = [
    {
      title: "Tomorrow Visit Reminder",
      audience: upcomingAppointments.filter((item) => item.preferred_date === tomorrowKey).length,
      schedule: `${formatDate(tomorrowKey)} • 7:30 PM`,
      channel: "WhatsApp + SMS",
      status: upcomingAppointments.some((item) => item.preferred_date === tomorrowKey) ? "Ready" : "Idle",
    },
    {
      title: "Confirmation Follow-up",
      audience: pendingCount,
      schedule: `${formatDate(todayKey)} • Rolling queue`,
      channel: "WhatsApp",
      status: pendingCount > 0 ? "Running" : "Paused",
    },
    {
      title: "Review Request Flow",
      audience: completedCount,
      schedule: "2 days after treatment",
      channel: "WhatsApp",
      status: completedCount > 0 ? "Queued" : "Idle",
    },
    {
      title: "Cancelled Lead Recovery",
      audience: cancelledCount,
      schedule: "6:30 PM daily",
      channel: "SMS",
      status: cancelledCount > 0 ? "Attention" : "Paused",
    },
  ];

  const billingRows = [...appointments]
    .filter((item) => item.status === "completed")
    .sort((left, right) => appointmentMs(right) - appointmentMs(left))
    .slice(0, 6)
    .map((item) => ({ ...item, amount: estimateValue(item.service, item.consultation_mode) }));
  const estimatedCollected = billingRows.reduce((sum, item) => sum + item.amount, 0);
  const estimatedPipeline = appointments
    .filter((item) => item.status === "pending" || item.status === "confirmed")
    .reduce((sum, item) => sum + estimateValue(item.service, item.consultation_mode), 0);
  const estimatedRisk = appointments
    .filter((item) => item.status === "cancelled")
    .reduce((sum, item) => sum + estimateValue(item.service, item.consultation_mode), 0);

  const patientMap = appointments.reduce<Map<string, PatientProfile>>((map, item) => {
    const key = item.phone || item.email || item.id;
    const existing = map.get(key);
    if (existing) {
      existing.appointments += 1;
      existing.completed += item.status === "completed" ? 1 : 0;
      existing.upcoming += item.preferred_date && item.preferred_date >= todayKey && item.status !== "cancelled" ? 1 : 0;
      if (!existing.services.includes(item.service)) existing.services.push(item.service);
      existing.estimatedValue += estimateValue(item.service, item.consultation_mode);
      if (!existing.nextVisit && item.preferred_date && item.preferred_date >= todayKey && item.status !== "cancelled") {
        existing.nextVisit = `${formatDate(item.preferred_date)} • ${sqlTimeToSlotLabel(item.preferred_time) ?? "Time TBD"}`;
      }
      return map;
    }
    map.set(key, {
      key,
      name: item.name,
      phone: item.phone,
      email: item.email,
      appointments: 1,
      completed: item.status === "completed" ? 1 : 0,
      upcoming: item.preferred_date && item.preferred_date >= todayKey && item.status !== "cancelled" ? 1 : 0,
      services: [item.service],
      lastSeen: item.created_at,
      nextVisit: item.preferred_date && item.preferred_date >= todayKey && item.status !== "cancelled"
        ? `${formatDate(item.preferred_date)} • ${sqlTimeToSlotLabel(item.preferred_time) ?? "Time TBD"}`
        : null,
      estimatedValue: estimateValue(item.service, item.consultation_mode),
    });
    return map;
  }, new Map());

  const patients = [...patientMap.values()].sort((left, right) => right.appointments - left.appointments || right.estimatedValue - left.estimatedValue);
  const serviceStats = [...appointments.reduce<Map<string, number>>((map, item) => {
    map.set(item.service, (map.get(item.service) || 0) + 1);
    return map;
  }, new Map()).entries()].map(([label, count]) => ({ label, count })).sort((left, right) => right.count - left.count).slice(0, 6);
  const locationStats = [...appointments.reduce<Map<string, number>>((map, item) => {
    map.set(item.location, (map.get(item.location) || 0) + 1);
    return map;
  }, new Map()).entries()].map(([label, count]) => ({ label, count })).sort((left, right) => right.count - left.count).slice(0, 5);

  const renderAppointmentQueue = () => {
    if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (filteredAppointments.length === 0) return <EmptyState message={appointmentSearchTerm ? "No appointments found for this name." : "No appointments match the current filter."} />;
    return (
      <div className="space-y-4">
        {filteredAppointments.map((item) => (
          <div key={item.id} className="spotlight-card rounded-[28px] border border-[#eddab8] bg-white/80 p-5 shadow-[0_22px_50px_-38px_rgba(76,47,10,0.38)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-2xl text-foreground">{item.name}</h3>
                  <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em]", item.source === "local" ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-700")}>{item.source === "local" ? "Local Backup" : "Cloud"}</span>
                  <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", statusColors[item.status] || "bg-muted text-muted-foreground")}>{item.status}</span>
                </div>
                <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-[#b67e34]">{item.service}</p>
                {getServicePrice(item.service) !== null && (
                  <p className="mt-1 text-sm font-semibold text-primary">{formatServicePrice(getServicePrice(item.service)!)}</p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">{getConsultationModeLabel(item.consultation_mode)}</p>
                <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-3">
                  <span className="flex items-center gap-2"><Phone className="h-4 w-4" />{item.phone}</span>
                  {item.email ? <span className="flex items-center gap-2"><Mail className="h-4 w-4" />{item.email}</span> : null}
                  <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{item.location}</span>
                  <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(item.preferred_date)}</span>
                  <span className="flex items-center gap-2"><Clock3 className="h-4 w-4" />{sqlTimeToSlotLabel(item.preferred_time) ?? "-"}</span>
                  <span className="flex items-center gap-2"><Activity className="h-4 w-4" />Submitted {formatDateTime(item.created_at)}</span>
                </div>
                {item.message ? <div className="mt-4 rounded-[20px] bg-[#fff7ea] px-4 py-3 text-sm italic text-muted-foreground">"{item.message}"</div> : null}
              </div>
              <div className="flex flex-wrap gap-2 xl:w-[180px] xl:flex-col">
                {item.status !== "confirmed" ? <button onClick={() => void updateStatus(item.id, "confirmed")} disabled={updating === item.id} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-200 disabled:opacity-60"><CheckCircle2 className="h-4 w-4" />Confirm</button> : null}
                {item.status !== "completed" ? <button onClick={() => void updateStatus(item.id, "completed")} disabled={updating === item.id} className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-800 transition hover:bg-sky-200 disabled:opacity-60"><CheckCircle2 className="h-4 w-4" />Complete</button> : null}
                {item.status !== "cancelled" ? <button onClick={() => void updateStatus(item.id, "cancelled")} disabled={updating === item.id} className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-medium text-rose-800 transition hover:bg-rose-200 disabled:opacity-60"><XCircle className="h-4 w-4" />Cancel</button> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (activeSection === "overview") {
      return (
        <div className="space-y-6">
          {hasLocalBackups ? <div className="rounded-[24px] border border-amber-300/60 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">Local browser backup is active for some bookings. This dashboard is also showing locally saved appointments.</div> : null}
          <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
            <Panel title="Today's agenda" subtitle="The next visits and queues that need immediate team attention.">
              {todayAppointments.length === 0 ? <EmptyState message="No appointments are scheduled for today yet." /> : <div className="space-y-3">{todayAppointments.slice(0, 6).map((item) => <button key={item.id} onClick={() => setActiveSection("appointments")} className="flex w-full items-center justify-between gap-4 rounded-[22px] border border-[#eddab7] bg-white/70 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"><div><p className="font-medium text-foreground">{item.name}</p><p className="mt-1 text-sm text-muted-foreground">{item.service}</p></div><div className="text-right"><p className="font-medium text-foreground">{sqlTimeToSlotLabel(item.preferred_time) ?? "Time TBD"}</p><p className="mt-1 text-xs text-muted-foreground">{item.phone}</p></div></button>)}</div>}
            </Panel>
            <Panel title="Quick modules" subtitle="Jump into Sharma Cosmo Clinic operations blocks.">
              <div className="grid gap-3 sm:grid-cols-2">{sections.filter((item) => item.id !== "overview").slice(0, 6).map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => setActiveSection(item.id)} className="rounded-[22px] border border-[#eddab7] bg-white/70 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1d3] text-[#c58223]"><Icon className="h-5 w-5" /></span><div><p className="font-semibold text-foreground">{item.label}</p><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.caption}</p></div></div></button>; })}</div>
            </Panel>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Metric icon={MessageSquare} label="Messages ready" value={messageRows[0]?.audience ?? 0} detail="Tomorrow reminder audience" />
            <Metric icon={Wallet} label="Pipeline" value={money.format(estimatedPipeline)} detail="Estimated OPD value in booking queue" />
            <Metric icon={Users} label="Repeat patients" value={patients.filter((item) => item.appointments > 1).length} detail="Profiles with more than one booking" />
          </div>
        </div>
      );
    }

    if (activeSection === "appointments") {
      return (
        <Panel title="Appointment queue" subtitle="Review every booking and keep the front desk moving." action={<button onClick={async () => { await fetchAppointments(); toast.success("Queue refreshed"); }} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-[#e8c98d] bg-white/75 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white disabled:opacity-60"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />Refresh queue</button>}>
          <div className="mb-5 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => <button key={status} onClick={() => setFilterStatus(status)} className={cn("rounded-full px-4 py-2 text-sm font-medium capitalize transition", filterStatus === status ? "bg-gradient-to-r from-[#f2aa34] to-[#eb8d45] text-white shadow-lg shadow-orange-200/60" : "bg-white/70 text-muted-foreground hover:text-foreground")}>{status}</button>)}
            </div>
            <div className="flex max-w-md items-center gap-2 rounded-full border border-[#dfd4bb] bg-white px-4 py-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <input value={appointmentSearch} onChange={(event) => setAppointmentSearch(event.target.value)} placeholder="Search by name or phone" className="w-full bg-transparent outline-none" />
            </div>
          </div>
          {renderAppointmentQueue()}
        </Panel>
      );
    }

    if (activeSection === "messages") {
      return (
        <Panel title="Patient messaging desk" subtitle="Campaigns derived from live appointment and follow-up queues.">
          <div className="overflow-hidden rounded-[24px] border border-[#eddab7] bg-white/70">
            <div className="grid grid-cols-[1.3fr,0.9fr,0.8fr,0.8fr] gap-4 border-b border-[#eddab7] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"><span>Template</span><span>Schedule</span><span>Audience</span><span>Status</span></div>
            {messageRows.map((item) => <div key={item.title} className="grid grid-cols-[1.3fr,0.9fr,0.8fr,0.8fr] gap-4 border-b border-[#f3e6ca] px-4 py-4 text-sm last:border-b-0"><div><p className="font-medium text-foreground">{item.title}</p><p className="mt-1 text-muted-foreground">{item.channel}</p></div><p className="text-muted-foreground">{item.schedule}</p><p className="font-medium text-foreground">{item.audience} patients</p><p className="font-medium text-foreground">{item.status}</p></div>)}
          </div>
        </Panel>
      );
    }
    if (activeSection === "doctor") {
      return (
        <DoctorPanel
          appointments={appointments}
          onConsult={(appointment) => {
            void updateStatus(appointment.id, "confirmed");
          }}
          onGenerateBill={(appointment) => {
            setOpdDraftAppointmentId(appointment.id);
            setActiveSection("billing");
          }}
        />
      );
    }

    if (activeSection === "billing") {
      return <OpdBillingPanel appointments={appointments} initialAppointmentId={opdDraftAppointmentId} onConsumeInitial={() => setOpdDraftAppointmentId(null)} />;
    }

    if (activeSection === "pharmacy") {
      return <PharmacyPanel appointments={appointments} />;
    }

    if (activeSection === "patients") {
      return (
        <Panel title="Patient base" subtitle="A quick roster of active patient profiles and their next milestones.">
          {patients.length === 0 ? <EmptyState message="Patient roster will populate when appointments are available." /> : <div className="space-y-3">{patients.slice(0, 8).map((item) => <div key={item.key} className="rounded-[24px] border border-[#eddab7] bg-white/70 px-4 py-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-medium text-foreground">{item.name}</p><p className="mt-1 text-sm text-muted-foreground">{item.phone}</p>{item.email ? <p className="text-sm text-muted-foreground">{item.email}</p> : null}</div><div className="text-left sm:text-right"><p className="font-display text-2xl text-foreground">{item.appointments}</p><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Appointments</p></div></div><div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2"><div><p className="font-medium text-foreground">Next visit</p><p className="mt-1">{item.nextVisit ?? "No upcoming visit"}</p></div><div><p className="font-medium text-foreground">Services</p><p className="mt-1">{item.services.join(", ")}</p></div></div></div>)}</div>}
        </Panel>
      );
    }

    if (activeSection === "followups") {
      return (
        <div className="grid gap-6 xl:grid-cols-3">
          <Panel title="Callback queue" subtitle="Pending confirmations needing response.">{callbackQueue.length === 0 ? <EmptyState message="No pending callback requests right now." /> : <div className="space-y-3">{callbackQueue.map((item) => <div key={item.id} className="rounded-[22px] border border-[#eddab7] bg-white/70 px-4 py-4"><p className="font-medium text-foreground">{item.name}</p><p className="mt-1 text-sm text-muted-foreground">{item.phone}</p><p className="mt-1 text-sm text-muted-foreground">{item.service}</p></div>)}</div>}</Panel>
          <Panel title="Feedback queue" subtitle="Completed visits ready for follow-up.">{feedbackQueue.length === 0 ? <EmptyState message="Completed appointments will appear here for follow-up." /> : <div className="space-y-3">{feedbackQueue.map((item) => <div key={item.id} className="rounded-[22px] border border-[#eddab7] bg-white/70 px-4 py-4"><p className="font-medium text-foreground">{item.name}</p><p className="mt-1 text-sm text-muted-foreground">{item.service}</p><p className="mt-1 text-sm text-muted-foreground">{item.phone}</p></div>)}</div>}</Panel>
          <Panel title="Rescue queue" subtitle="Cancelled leads available for reactivation.">{rescueQueue.length === 0 ? <EmptyState message="No cancelled leads currently need rescue." /> : <div className="space-y-3">{rescueQueue.map((item) => <div key={item.id} className="rounded-[22px] border border-[#eddab7] bg-white/70 px-4 py-4"><p className="font-medium text-foreground">{item.name}</p><p className="mt-1 text-sm text-muted-foreground">{item.service}</p><p className="mt-1 text-sm text-muted-foreground">{item.phone}</p></div>)}</div>}</Panel>
        </div>
      );
    }

    if (activeSection === "schedule") {
      return <Panel title="Schedule control" subtitle="Manage off dates and slot availability from the admin desk."><SlotManagement /></Panel>;
    }

    if (activeSection === "reviews") {
      return <Panel title="Reputation desk" subtitle="Approve, hide or delete testimonials shown on the website."><ReviewManagement /></Panel>;
    }

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Service demand" subtitle="Treatments leading the booking mix.">{serviceStats.length === 0 ? <EmptyState message="Service demand will appear after bookings arrive." /> : <div className="space-y-4">{serviceStats.map((item) => <div key={item.label}><div className="mb-2 flex items-center justify-between gap-3"><p className="font-medium text-foreground">{item.label}</p><p className="text-sm text-muted-foreground">{item.count} bookings</p></div><div className="h-2 rounded-full bg-[#f5ead1]"><div className="h-2 rounded-full bg-gradient-to-r from-[#f2aa34] to-[#dd6d45]" style={{ width: `${Math.max(14, (item.count / Math.max(serviceStats[0]?.count || 1, 1)) * 100)}%` }} /></div></div>)}</div>}</Panel>
        <Panel title="Location mix" subtitle="Clinic demand split by location.">{locationStats.length === 0 ? <EmptyState message="Location demand will appear after bookings arrive." /> : <div className="space-y-4">{locationStats.map((item) => <div key={item.label}><div className="mb-2 flex items-center justify-between gap-3"><p className="font-medium text-foreground">{item.label}</p><p className="text-sm text-muted-foreground">{item.count} bookings</p></div><div className="h-2 rounded-full bg-[#f5ead1]"><div className="h-2 rounded-full bg-gradient-to-r from-[#ed9c36] to-[#d7673f]" style={{ width: `${Math.max(16, (item.count / Math.max(locationStats[0]?.count || 1, 1)) * 100)}%` }} /></div></div>)}</div>}</Panel>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Sharma Cosmo Clinic</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-[#fff9ef]">
        <div className="bg-[#ec930d] px-4 py-3 text-sm font-medium text-white">
          {hasLocalBackups ? "Local booking backup is active while cloud syncing is recovering." : "Clinic dashboard is live for appointments, messages, billing and patient operations."}
        </div>
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 motion-grid opacity-20" />
          <div className="pointer-events-none absolute left-[-8rem] top-24 h-72 w-72 motion-orb opacity-55" />
          <div className="pointer-events-none absolute right-[-6rem] top-64 h-80 w-80 motion-orb-gold opacity-55" />
          <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
            {sidebarOpen ? <button aria-label="Close menu" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/35 lg:hidden" /> : null}
            <div className="lg:grid lg:grid-cols-[280px,minmax(0,1fr)] lg:gap-6">
              <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-[300px] max-w-[86vw] flex-col border-r border-[#eedab4] bg-white/92 px-4 py-5 shadow-2xl backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-auto lg:max-w-none lg:translate-x-0 lg:rounded-[30px] lg:border", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
                <p className="text-xs uppercase tracking-[0.2em] text-[#b67e34]">Clinic OS</p>
                <h1 className="mt-1 font-display text-3xl text-foreground">Sharma Cosmo</h1>
                <p className="mt-2 text-sm text-muted-foreground">Sharma Cosmo Clinic admin desk for appointments, patients and operations.</p>
                <div className="mt-6 min-h-0 flex-1 rounded-[30px] border border-[#f1dfb9] bg-[linear-gradient(180deg,rgba(255,252,246,0.98),rgba(255,244,219,0.92))] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_18px_40px_-34px_rgba(124,82,17,0.35)]">
                  <div className="h-full space-y-2 overflow-y-auto pr-1">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return <button key={section.id} onClick={() => { setActiveSection(section.id); setSidebarOpen(false); }} className={cn("flex w-full items-center gap-3 rounded-[22px] px-3 py-3 text-left transition", activeSection === section.id ? "bg-gradient-to-r from-[#f5bd5b] via-[#ffd986] to-[#fff2c7] text-foreground shadow-lg shadow-orange-200/50" : "text-muted-foreground hover:bg-[#fff5de] hover:text-foreground")}><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff5de] text-[#c2872a]"><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block font-medium">{section.label}</span><span className="block text-xs uppercase tracking-[0.16em] opacity-80">{section.caption}</span></span><ChevronRight className="h-4 w-4" /></button>;
                    })}
                  </div>
                </div>
              </aside>
              <main className="space-y-6">
                <header className="rounded-[34px] border border-[#f0dcac] bg-[linear-gradient(90deg,rgba(246,182,84,0.95),rgba(255,222,140,0.93),rgba(255,247,214,0.96))] p-5 shadow-[0_28px_60px_-36px_rgba(125,77,13,0.45)] sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-[#a8691c] shadow-sm lg:hidden"><Menu className="h-5 w-5" /></button>
                        <Link to="/" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-[#a8691c] shadow-sm"><ArrowLeft className="h-5 w-5" /></Link>
                        <span className="rounded-full bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9b651b]">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                      </div>
                      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#a76d22]">Sharma Cosmo Clinic admin dashboard</p>
                      <h2 className="mt-2 font-display text-4xl text-[#3d2b17] sm:text-5xl">{sections.find((item) => item.id === activeSection)?.label}</h2>
                      <p className="mt-3 max-w-3xl text-sm text-[#65441b] sm:text-base">Manage doctor workflow, clinic bookings, OPD billing, pharmacy invoices, patient flow and follow-ups from a single dashboard.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={async () => { await fetchAppointments(); toast.success("Dashboard refreshed successfully"); }} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-foreground shadow-sm disabled:opacity-60"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />Refresh</button>
                      <button onClick={() => void signOut()} className="inline-flex items-center gap-2 rounded-full bg-[#5a3b1c] px-4 py-2.5 text-sm font-medium text-white shadow-sm"><LogOut className="h-4 w-4" />Logout</button>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-4">
                    <Metric icon={Calendar} label="Bookings" value={appointments.length} detail={`${todayAppointments.length} scheduled today`} />
                    <Metric icon={Bell} label="Pending" value={pendingCount} detail="Need confirmation" />
                    <Metric icon={CheckCircle2} label="Completed" value={completedCount} detail="Closed treatments" />
                    <Metric icon={Users} label="Patients" value={uniquePatients} detail={`${confirmedCount} confirmed, ${cancelledCount} cancelled`} />
                  </div>
                </header>
                {renderContent()}
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
