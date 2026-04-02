import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Download, Edit3, Plus, ReceiptText } from "lucide-react";
import { toast } from "sonner";

import ClinicInvoicePreview from "@/components/admin/ClinicInvoicePreview";
import {
  type OpdBill,
  createOpdBillRecord,
  createPatientId,
  findOpdBillByAppointmentId,
  readClinicAdminData,
  subscribeClinicAdminData,
  updateOpdBillRecord,
} from "@/lib/clinicAdminStore";
import type { AppointmentRecord } from "@/lib/appointmentStore";
import { sqlTimeToSlotLabel } from "@/lib/appointmentTime";
import { clinicBrand } from "@/lib/clinicBrand";
import { consultationModeOptions, getConsultationFee, getConsultationModeLabel, normalizeConsultationMode, type ConsultationMode } from "@/lib/consultationMode";
import { cn } from "@/lib/utils";

const formatMoney = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
const formatDateOnly = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const todayKey = () => new Date().toISOString().slice(0, 10);

const estimateOpdAmount = (service: string, consultationMode: string | null | undefined) => {
  const normalizedMode = normalizeConsultationMode(consultationMode);
  if (normalizedMode) return getConsultationFee(normalizedMode);

  const value = service.toLowerCase();
  if (value.includes("filler")) return 18000;
  if (value.includes("botox")) return 12000;
  if (value.includes("laser")) return 4500;
  if (value.includes("hair")) return 3500;
  if (value.includes("facial") || value.includes("hydra")) return 2500;
  if (value.includes("peel")) return 2200;
  if (value.includes("consult")) return 800;
  return 1500;
};

type BillingMode = "appointment" | "manual";

type BillDraft = {
  patientName: string;
  phone: string;
  age: string;
  gender: string;
  service: string;
  consultationMode: ConsultationMode;
  billDate: string;
  status: OpdBill["status"];
  amount: number;
};

type OpdBillingPanelProps = {
  appointments: AppointmentRecord[];
  initialAppointmentId: string | null;
  onConsumeInitial: () => void;
};

const createEmptyDraft = (): BillDraft => ({
  patientName: "",
  phone: "",
  age: "Adult",
  gender: "Patient",
  service: "Consultation",
  consultationMode: "offline",
  billDate: todayKey(),
  status: "paid",
  amount: getConsultationFee("offline"),
});

const OpdBillingPanel = ({ appointments, initialAppointmentId, onConsumeInitial }: OpdBillingPanelProps) => {
  const [data, setData] = useState(readClinicAdminData());
  const [billingMode, setBillingMode] = useState<BillingMode>("appointment");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [activeBillId, setActiveBillId] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [draft, setDraft] = useState<BillDraft>(createEmptyDraft());

  useEffect(() => {
    const syncData = () => setData(readClinicAdminData());

    syncData();
    return subscribeClinicAdminData(syncData);
  }, []);

  const applyAppointmentDraft = (appointment: AppointmentRecord, options?: { keepExistingDate?: boolean }) => {
    const consultationMode = normalizeConsultationMode(appointment.consultation_mode) ?? "offline";

    setBillingMode("appointment");
    setSelectedAppointmentId(appointment.id);
    setDraft((current) => ({
      ...current,
      patientName: appointment.name,
      phone: appointment.phone,
      service: appointment.service || "Consultation",
      consultationMode,
      billDate: options?.keepExistingDate ? current.billDate : appointment.preferred_date || current.billDate || todayKey(),
      amount: estimateOpdAmount(appointment.service || "Consultation", consultationMode),
    }));
  };

  const loadBillIntoDraft = (bill: OpdBill) => {
    setActiveBillId(bill.id);
    setBillingMode(bill.appointmentId ? "appointment" : "manual");
    setSelectedAppointmentId(bill.appointmentId ?? "");
    setDraft({
      patientName: bill.patientName,
      phone: bill.phone,
      age: bill.age,
      gender: bill.gender,
      service: bill.visitType || bill.items[0]?.label || "Consultation",
      consultationMode: normalizeConsultationMode(bill.consultationMode) ?? "offline",
      billDate: bill.date.slice(0, 10),
      status: bill.status,
      amount: bill.totalAmount,
    });
  };

  const resetDraft = (mode: BillingMode = billingMode) => {
    setActiveBillId(null);
    setBillingMode(mode);

    if (mode === "appointment" && appointments[0]) {
      applyAppointmentDraft(appointments[0]);
      return;
    }

    setSelectedAppointmentId("");
    setDraft(createEmptyDraft());
  };

  useEffect(() => {
    if (!selectedAppointmentId && appointments[0] && billingMode === "appointment" && !activeBillId) {
      applyAppointmentDraft(appointments[0]);
    }
  }, [activeBillId, appointments, billingMode, selectedAppointmentId]);

  useEffect(() => {
    if (!initialAppointmentId) return;

    const existingBill = findOpdBillByAppointmentId(initialAppointmentId);
    if (existingBill) {
      loadBillIntoDraft(existingBill);
      onConsumeInitial();
      return;
    }

    const appointment = appointments.find((item) => item.id === initialAppointmentId);
    if (appointment) {
      setActiveBillId(null);
      applyAppointmentDraft(appointment);
    }
    onConsumeInitial();
  }, [appointments, initialAppointmentId, onConsumeInitial]);

  const activeBill = activeBillId ? data.opdBills.find((bill) => bill.id === activeBillId) ?? null : null;

  const paidTotal = data.opdBills.filter((bill) => bill.status === "paid").reduce((sum, bill) => sum + bill.paidAmount, 0);
  const dueTotal = data.opdBills.filter((bill) => bill.status === "due").reduce((sum, bill) => sum + Math.max(0, bill.totalAmount - bill.paidAmount), 0);
  const refundedTotal = data.opdBills.filter((bill) => bill.status === "refunded").reduce((sum, bill) => sum + bill.totalAmount, 0);

  const filteredHistory = useMemo(() => {
    const term = historySearch.trim().toLowerCase();
    if (!term) return data.opdBills;

    return data.opdBills.filter((bill) =>
      bill.billNo.toLowerCase().includes(term) ||
      bill.patientName.toLowerCase().includes(term) ||
      bill.phone.includes(term),
    );
  }, [data.opdBills, historySearch]);

  const saveBill = async () => {
    if (!draft.patientName.trim() || !draft.phone.trim()) {
      toast.error("Patient name and phone are required.");
      return;
    }

    if (billingMode === "appointment" && !selectedAppointmentId) {
      toast.error("Select an appointment or switch to manual billing.");
      return;
    }

    const appointmentId = billingMode === "appointment" ? selectedAppointmentId : undefined;

    if (!activeBillId && appointmentId) {
      const existingBill = findOpdBillByAppointmentId(appointmentId);
      if (existingBill) {
        loadBillIntoDraft(existingBill);
        toast.message(`Existing OPD bill ${existingBill.billNo} opened for editing.`);
        return;
      }
    }

    const payload: Omit<OpdBill, "id" | "billNo"> = {
      appointmentId,
      patientId: createPatientId(draft.phone),
      patientName: draft.patientName.trim(),
      phone: draft.phone.trim(),
      age: draft.age.trim() || "Adult",
      gender: draft.gender.trim() || "Patient",
      doctorName: clinicBrand.doctorName,
      doctorSpeciality: clinicBrand.doctorSpeciality,
      clinicName: clinicBrand.name,
      clinicAddress: clinicBrand.address,
      date: new Date(`${draft.billDate}T10:00:00`).toISOString(),
      status: draft.status,
      paidAmount: draft.status === "paid" ? draft.amount : 0,
      totalAmount: draft.amount,
      consultationMode: draft.consultationMode,
      visitType: draft.service.trim() || "Consultation",
      items: [
        {
          label: draft.service.trim() || "Consultation",
          qty: 1,
          rate: draft.amount,
          discount: 0,
          gst: 0,
          total: draft.amount,
        },
      ],
    };

    try {
      const bill = activeBillId ? await updateOpdBillRecord(activeBillId, payload) : await createOpdBillRecord(payload);
      setActiveBillId(bill.id);
      setSelectedAppointmentId(bill.appointmentId ?? "");
      toast.success(activeBillId ? `OPD bill ${bill.billNo} updated.` : `OPD bill ${bill.billNo} created.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save OPD bill.");
    }
  };

  const previewInvoiceNo = activeBill?.billNo || "DRAFT_PREVIEW";
  const previewDate = new Date(`${draft.billDate}T10:00:00`).toISOString();

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-[#f0ddb8] bg-[linear-gradient(180deg,rgba(248,203,96,0.95),rgba(255,241,201,0.96))] p-5 shadow-[0_24px_60px_-40px_rgba(109,70,11,0.35)] sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[#9a6a1e]">Single Page Billing</p>
            <h2 className="mt-2 font-display text-4xl text-[#3b2a16]">OPD Bill Generator</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#65441b]">
              Appointment-linked aur manual billing dono available hain. Old date bill banao, existing OPD bill edit karo,
              aur same page par history ke saath preview dekho.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:w-[560px]">
            <div className="rounded-[22px] bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Bills Created</p>
              <p className="mt-2 font-display text-3xl text-foreground">{data.opdBills.length}</p>
            </div>
            <div className="rounded-[22px] bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Collected</p>
              <p className="mt-2 font-display text-3xl text-foreground">{formatMoney(paidTotal)}</p>
            </div>
            <div className="rounded-[22px] bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Pending / Refunded</p>
              <p className="mt-2 font-display text-3xl text-foreground">{formatMoney(dueTotal + refundedTotal)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[430px,minmax(0,1fr)]">
        <section className="glass-panel rounded-[30px] border border-[#f0ddb8] bg-white/70 p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-[#9a6a1e]">Bill Desk</p>
              <h3 className="mt-2 font-display text-2xl text-foreground">{activeBillId ? "Edit OPD Bill" : "Create OPD Bill"}</h3>
            </div>
            <button
              onClick={() => resetDraft("appointment")}
              className="inline-flex items-center gap-2 rounded-full bg-[#5a49d6] px-4 py-2.5 text-sm font-medium text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Bill
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {([
              ["appointment", "Appointment Linked"],
              ["manual", "Manual Billing"],
            ] as const).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => resetDraft(mode)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  billingMode === mode ? "border-[#5a49d6] bg-[#5a49d6] text-white" : "border-[#eadfc8] bg-[#fffaf1] text-muted-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            {billingMode === "appointment" ? (
              <label className="block text-sm font-medium text-foreground">
                Appointment
                <select
                  value={selectedAppointmentId}
                  onChange={(event) => {
                    const appointment = appointments.find((item) => item.id === event.target.value);
                    setActiveBillId(null);
                    setSelectedAppointmentId(event.target.value);
                    if (appointment) applyAppointmentDraft(appointment);
                  }}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                >
                  <option value="">Select appointment</option>
                  {appointments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {item.service} - {getConsultationModeLabel(item.consultation_mode)}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-foreground">
                Patient Name
                <input
                  value={draft.patientName}
                  onChange={(event) => setDraft((current) => ({ ...current, patientName: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Phone
                <input
                  value={draft.phone}
                  onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-foreground">
                Age
                <input
                  value={draft.age}
                  onChange={(event) => setDraft((current) => ({ ...current, age: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Gender
                <input
                  value={draft.gender}
                  onChange={(event) => setDraft((current) => ({ ...current, gender: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-foreground">
              Visit / Service
              <input
                value={draft.service}
                onChange={(event) => setDraft((current) => ({ ...current, service: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-foreground">
                Consultation Mode
                <select
                  value={draft.consultationMode}
                  onChange={(event) => {
                    const consultationMode = event.target.value as ConsultationMode;
                    setDraft((current) => ({
                      ...current,
                      consultationMode,
                      amount: getConsultationFee(consultationMode),
                    }));
                  }}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                >
                  {consultationModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-foreground">
                Bill Date
                <input
                  type="date"
                  value={draft.billDate}
                  onChange={(event) => setDraft((current) => ({ ...current, billDate: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-foreground">
                Bill Status
                <select
                  value={draft.status}
                  onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as OpdBill["status"] }))}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                >
                  <option value="paid">Paid</option>
                  <option value="due">Due</option>
                  <option value="refunded">Refunded</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-foreground">
                Bill Amount
                <input
                  type="number"
                  min="0"
                  value={draft.amount}
                  onChange={(event) => setDraft((current) => ({ ...current, amount: Number(event.target.value) || 0 }))}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
              </label>
            </div>

            <div className="rounded-[22px] border border-[#eadfc8] bg-[#fff8ee] px-4 py-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1d3] text-[#c58223]">
                  <CalendarClock className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#9a6a1e]">Live Billing Summary</p>
                  <p className="mt-2 font-semibold text-foreground">{draft.patientName || "Patient name pending"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {draft.service} • {getConsultationModeLabel(draft.consultationMode)} • {formatMoney(draft.amount)}
                  </p>
                  {billingMode === "appointment" && selectedAppointmentId ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Appointment slot: {sqlTimeToSlotLabel(appointments.find((item) => item.id === selectedAppointmentId)?.preferred_time) ?? "Time TBD"}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">Manual billing ready for any patient or previous date.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={saveBill} className="rounded-full bg-[#5a49d6] px-5 py-2.5 text-sm font-medium text-white">
                {activeBillId ? "Save Bill Changes" : "Generate Bill"}
              </button>
              <button
                onClick={() => resetDraft(billingMode)}
                className="rounded-full border border-[#d8ccff] bg-white px-5 py-2.5 text-sm font-medium text-[#5a49d6]"
              >
                Reset Form
              </button>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <ClinicInvoicePreview
            badge={activeBillId ? "OPD Invoice Preview" : "Draft Invoice Preview"}
            title={draft.service || "Consultation Bill"}
            invoiceNo={previewInvoiceNo}
            invoiceDate={activeBill ? formatDateTime(activeBill.date) : formatDateOnly(previewDate)}
            status={activeBill?.status || draft.status}
            patientRows={[
              { label: "Patient Name", value: draft.patientName || "Patient name pending" },
              { label: "Patient ID", value: draft.phone ? createPatientId(draft.phone) : "PAT0000" },
              { label: "Phone", value: draft.phone || "-" },
              { label: "Age / Gender", value: `${draft.age || "Adult"} • ${draft.gender || "Patient"}` },
            ]}
            billingRows={[
              { label: "Clinic", value: clinicBrand.name },
              { label: "Doctor", value: clinicBrand.doctorName },
              { label: "Speciality", value: clinicBrand.doctorSpeciality },
              { label: "Mode", value: getConsultationModeLabel(draft.consultationMode) },
              { label: "Address", value: clinicBrand.address },
            ]}
            items={[
              {
                id: `${activeBillId || "draft"}-item-1`,
                label: draft.service || "Consultation",
                meta: billingMode === "manual" ? "Manual OPD consultation / service charge" : "Appointment-linked OPD consultation / service charge",
                qty: 1,
                rate: formatMoney(draft.amount),
                total: formatMoney(draft.amount),
              },
            ]}
            summaryRows={[
              { label: "Subtotal", value: formatMoney(draft.amount) },
              { label: draft.status === "paid" ? "Paid Amount" : draft.status === "refunded" ? "Refunded" : "Outstanding", value: formatMoney(draft.status === "paid" ? draft.amount : 0), tone: draft.status === "paid" ? "success" : draft.status === "due" ? "warning" : "default" },
              { label: "Balance", value: formatMoney(draft.status === "paid" ? 0 : draft.amount), tone: draft.status === "due" ? "warning" : "default" },
              { label: "Total Bill", value: formatMoney(draft.amount) },
            ]}
            note="This invoice has been generated by Sharma Cosmo Clinic. Please keep it with you for consultations and follow-up support."
            onPrint={() => window.print()}
          />

          <section className="glass-panel rounded-[30px] border border-[#f0ddb8] bg-white/70 p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[#9a6a1e]">Bill History</p>
                <h3 className="mt-2 font-display text-2xl text-foreground">Previous OPD Bills</h3>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#dfd4bb] bg-white px-4 py-2 text-sm text-muted-foreground">
                <ReceiptText className="h-4 w-4" />
                <input value={historySearch} onChange={(event) => setHistorySearch(event.target.value)} placeholder="Search bill, patient or phone" className="w-full bg-transparent outline-none" />
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-[#eadfc8] bg-white/70">
              <div className="grid grid-cols-[0.95fr,1fr,0.9fr,0.8fr,0.8fr,0.7fr] gap-4 border-b border-[#eadfc8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <span>Bill No</span>
                <span>Patient</span>
                <span>Date</span>
                <span>Mode</span>
                <span>Amount</span>
                <span>Action</span>
              </div>
              {filteredHistory.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">No OPD bill history found for this search.</div>
              ) : (
                filteredHistory.map((bill) => (
                  <div key={bill.id} className={cn("grid grid-cols-[0.95fr,1fr,0.9fr,0.8fr,0.8fr,0.7fr] gap-4 border-b border-[#f3ead8] px-4 py-4 text-sm last:border-b-0", activeBillId === bill.id && "bg-[#fff7e5]")}>
                    <div>
                      <p className="font-medium text-[#5a49d6]">{bill.billNo}</p>
                      <p className="mt-1 text-xs text-muted-foreground capitalize">{bill.status}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{bill.patientName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{bill.phone}</p>
                    </div>
                    <span>{formatDateOnly(bill.date)}</span>
                    <span>{getConsultationModeLabel(bill.consultationMode)}</span>
                    <span>{formatMoney(bill.totalAmount)}</span>
                    <button
                      onClick={() => loadBillIntoDraft(bill)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#d8ccff] bg-white px-3 py-1.5 text-xs font-medium text-[#5a49d6]"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OpdBillingPanel;
