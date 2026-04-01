import { useEffect, useState } from "react";
import { CalendarDays, Search } from "lucide-react";

import { sqlTimeToSlotLabel } from "@/lib/appointmentTime";
import type { AppointmentRecord } from "@/lib/appointmentStore";
import { createPatientId, readClinicAdminData, subscribeClinicAdminData } from "@/lib/clinicAdminStore";
import { getConsultationModeLabel } from "@/lib/consultationMode";
import { cn } from "@/lib/utils";

type DoctorPanelProps = {
  appointments: AppointmentRecord[];
  onGenerateBill: (appointment: AppointmentRecord) => void;
  onConsult: (appointment: AppointmentRecord) => void;
};

type QueueMode = "queue" | "finished" | "cancelled";
type DoctorView = "mine" | "all" | "followup";

const statusClasses: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
  completed: "bg-sky-100 text-sky-800",
};

const DoctorPanel = ({ appointments, onGenerateBill, onConsult }: DoctorPanelProps) => {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<QueueMode>("queue");
  const [view, setView] = useState<DoctorView>("mine");
  const [billedIds, setBilledIds] = useState<string[]>([]);

  useEffect(() => {
    const syncBills = () => {
      const bills = readClinicAdminData().opdBills;
      setBilledIds(bills.map((bill) => bill.appointmentId).filter(Boolean) as string[]);
    };

    syncBills();
    return subscribeClinicAdminData(syncBills);
  }, [appointments]);

  const monthLabel = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const monthPrefix = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  let filtered = appointments;

  if (view === "followup") {
    filtered = filtered.filter((item) =>
      item.status === "completed" ||
      item.status === "cancelled" ||
      item.service.toLowerCase().includes("follow"),
    );

    if (mode === "finished") {
      filtered = filtered.filter((item) => item.status === "completed");
    } else if (mode === "cancelled") {
      filtered = filtered.filter((item) => item.status === "cancelled");
    } else {
      filtered = filtered.filter((item) =>
        item.status === "pending" ||
        item.status === "confirmed" ||
        item.status === "completed" ||
        item.status === "cancelled",
      );
    }
  } else {
    if (mode === "queue") filtered = filtered.filter((item) => item.status === "pending" || item.status === "confirmed");
    if (mode === "finished") filtered = filtered.filter((item) => item.status === "completed");
    if (mode === "cancelled") filtered = filtered.filter((item) => item.status === "cancelled");
  }

  if (search.trim()) {
    const term = search.trim().toLowerCase();
    filtered = filtered.filter((item) => item.name.toLowerCase().includes(term) || item.phone.includes(term));
  }

  const monthlyAppointments = appointments.filter((item) => (item.preferred_date || item.created_at).startsWith(monthPrefix));
  const topService = Object.entries(
    appointments.reduce<Record<string, number>>((acc, item) => {
      acc[item.service] = (acc[item.service] || 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1])[0]?.[0] || "Consultation";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-[#f0ddb8] bg-[linear-gradient(180deg,rgba(248,203,96,0.95),rgba(255,241,201,0.96))] p-5 shadow-[0_24px_60px_-40px_rgba(109,70,11,0.35)] sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[#9a6a1e]">Doctor panel</p>
            <h2 className="mt-2 font-display text-4xl text-[#3b2a16]">Welcome Dr. Vishikant Sharma</h2>
            <p className="mt-2 text-sm text-[#65441b]">General Practice workflow with appointment queue, follow-up desk and instant OPD billing handoff.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:w-[540px]">
            <div className="rounded-[22px] bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Consultations</p>
              <p className="mt-2 font-display text-3xl text-foreground">{monthlyAppointments.length}</p>
              <p className="text-sm text-muted-foreground">in {monthLabel}</p>
            </div>
            <div className="rounded-[22px] bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Follow-ups</p>
              <p className="mt-2 font-display text-3xl text-foreground">{appointments.filter((item) => item.status === "completed" || item.status === "cancelled").length}</p>
              <p className="text-sm text-muted-foreground">completed and cancelled recalls</p>
            </div>
            <div className="rounded-[22px] bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Top service</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{topService}</p>
              <p className="text-sm text-muted-foreground">highest current demand</p>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[30px] border border-[#f0ddb8] bg-white/70 p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {([
              ["mine", "My Appointments"],
              ["all", "All Appointments"],
              ["followup", "Follow Up"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  view === key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-[#eadfc8] bg-[#fffaf1] text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-full border border-[#dfd4bb] bg-white px-4 py-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or phone" className="w-full bg-transparent outline-none" />
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-[#dfd4bb] bg-white px-4 py-2 text-sm font-medium text-foreground">
              <CalendarDays className="h-4 w-4" />
              My Availability
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {([
            ["queue", "Queue"],
            ["finished", "Finished"],
            ["cancelled", "Cancelled"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                mode === key ? "bg-[#5749d6] text-white" : "bg-[#f5f1ff] text-[#5749d6] hover:bg-[#ece6ff]",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-[24px] border border-[#eadfc8] bg-white/70">
          <div className="grid grid-cols-[0.45fr,0.9fr,1fr,0.9fr,0.95fr,0.8fr,0.7fr,1fr] gap-4 border-b border-[#eadfc8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <span>No.</span>
            <span>Patient ID</span>
            <span>Patient Name</span>
            <span>Phone</span>
            <span>Visit Type</span>
            <span>Slot</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">No doctor queue items available in this filter.</div>
          ) : (
            filtered.slice(0, 12).map((item, index) => {
              const isBilled = billedIds.includes(item.id);
              const consultLabel =
                item.status === "completed"
                  ? "Completed"
                  : item.status === "cancelled"
                    ? "Cancelled"
                    : item.status === "confirmed"
                      ? "Confirmed"
                      : "Consult";

              return (
                <div key={item.id} className="grid grid-cols-[0.45fr,0.9fr,1fr,0.9fr,0.95fr,0.8fr,0.7fr,1fr] gap-4 border-b border-[#f3ead8] px-4 py-4 text-sm last:border-b-0">
                  <span>{index + 1}</span>
                  <span className="font-medium text-[#5a49d6]">{createPatientId(item.phone)}</span>
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.email || "No email"}</p>
                  </div>
                  <span>{item.phone}</span>
                  <div>
                    <p>{view === "followup" ? "Follow-up" : item.service}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{getConsultationModeLabel(item.consultation_mode)}</p>
                  </div>
                  <span>{sqlTimeToSlotLabel(item.preferred_time) ?? "Time TBD"}</span>
                  <span className={cn("inline-flex h-fit rounded-full px-3 py-1 text-xs font-semibold capitalize", statusClasses[item.status] || "bg-muted text-muted-foreground")}>{item.status}</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onConsult(item)}
                      disabled={item.status === "confirmed" || item.status === "completed" || item.status === "cancelled"}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium",
                        item.status === "confirmed" || item.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "cancelled"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-[#5a49d6] text-white",
                      )}
                    >
                      {consultLabel}
                    </button>
                    <button
                      onClick={() => onGenerateBill(item)}
                      className={cn("rounded-full px-3 py-1.5 text-xs font-medium", isBilled ? "bg-emerald-100 text-emerald-800" : "border border-[#d4c7ff] bg-white text-[#5a49d6]")}
                    >
                      {isBilled ? "Billed" : "Generate OPD Bill"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default DoctorPanel;
