import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import ClinicInvoicePreview from "@/components/admin/ClinicInvoicePreview";
import {
  clinicAdminEventName,
  type OpdBill,
  createOpdBillRecord,
  createPatientId,
  findOpdBillByAppointmentId,
  readClinicAdminData,
} from "@/lib/clinicAdminStore";
import type { AppointmentRecord } from "@/lib/appointmentStore";
import { sqlTimeToSlotLabel } from "@/lib/appointmentTime";
import { clinicBrand } from "@/lib/clinicBrand";

const formatMoney = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const estimateOpdAmount = (service: string) => {
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

type OpdBillingPanelProps = {
  appointments: AppointmentRecord[];
  initialAppointmentId: string | null;
  onConsumeInitial: () => void;
};

const OpdBillingPanel = ({ appointments, initialAppointmentId, onConsumeInitial }: OpdBillingPanelProps) => {
  const [data, setData] = useState(readClinicAdminData());
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(appointments[0]?.id ?? "");
  const [amount, setAmount] = useState(800);
  const [status, setStatus] = useState<OpdBill["status"]>("paid");
  const [selectedBillId, setSelectedBillId] = useState<string | null>(readClinicAdminData().opdBills[0]?.id ?? null);

  useEffect(() => {
    const syncData = () => setData(readClinicAdminData());

    syncData();
    window.addEventListener(clinicAdminEventName, syncData);
    window.addEventListener("storage", syncData);

    return () => {
      window.removeEventListener(clinicAdminEventName, syncData);
      window.removeEventListener("storage", syncData);
    };
  }, []);

  useEffect(() => {
    if (!selectedAppointmentId && appointments[0]?.id) {
      setSelectedAppointmentId(appointments[0].id);
      setAmount(estimateOpdAmount(appointments[0].service));
    }
  }, [appointments, selectedAppointmentId]);

  useEffect(() => {
    if (!initialAppointmentId) return;
    const appointment = appointments.find((item) => item.id === initialAppointmentId);
    const existingBill = findOpdBillByAppointmentId(initialAppointmentId);

    if (existingBill) {
      setSelectedBillId(existingBill.id);
    } else if (appointment) {
      setSelectedAppointmentId(appointment.id);
      setAmount(estimateOpdAmount(appointment.service));
    }
    onConsumeInitial();
  }, [appointments, initialAppointmentId, onConsumeInitial]);

  const selectedAppointment = appointments.find((item) => item.id === selectedAppointmentId);
  const createBill = () => {
    if (!selectedAppointment) {
      toast.error("Select an appointment first.");
      return;
    }

    const existingBill = findOpdBillByAppointmentId(selectedAppointment.id);
    if (existingBill) {
      setSelectedBillId(existingBill.id);
      toast.message(`Existing OPD bill ${existingBill.billNo} opened.`);
      return;
    }

    const bill = createOpdBillRecord({
      appointmentId: selectedAppointment.id,
      patientId: createPatientId(selectedAppointment.phone),
      patientName: selectedAppointment.name,
      phone: selectedAppointment.phone,
      age: "Adult",
      gender: "Patient",
      doctorName: clinicBrand.doctorName,
      doctorSpeciality: clinicBrand.doctorSpeciality,
      clinicName: clinicBrand.name,
      clinicAddress: clinicBrand.address,
      date: new Date().toISOString(),
      status,
      paidAmount: status === "paid" ? amount : 0,
      totalAmount: amount,
      items: [{ label: selectedAppointment.service || "Consultation", qty: 1, rate: amount, discount: 0, gst: 0, total: amount }],
    });

    setData(readClinicAdminData());
    setSelectedBillId(bill.id);
    toast.success(`OPD bill ${bill.billNo} created.`);
  };

  const selectedBill = data.opdBills.find((bill) => bill.id === selectedBillId) ?? data.opdBills[0];
  const paidTotal = data.opdBills.filter((bill) => bill.status === "paid").reduce((sum, bill) => sum + bill.paidAmount, 0);
  const dueTotal = data.opdBills.filter((bill) => bill.status === "due").reduce((sum, bill) => sum + bill.totalAmount, 0);
  const refundedTotal = data.opdBills.filter((bill) => bill.status === "refunded").reduce((sum, bill) => sum + bill.totalAmount, 0);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-[#f0ddb8] bg-[linear-gradient(180deg,rgba(248,203,96,0.95),rgba(255,241,201,0.96))] p-5 shadow-[0_24px_60px_-40px_rgba(109,70,11,0.35)] sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[#9a6a1e]">Single Page Billing</p>
            <h2 className="mt-2 font-display text-4xl text-[#3b2a16]">OPD Bill Generator</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#65441b]">
              Appointment select karo, amount set karo, aur bill isi page par Sharma Cosmo Clinic branding ke saath generate karke preview dekho.
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

      <div className="grid gap-6 xl:grid-cols-[420px,minmax(0,1fr)]">
        <section className="glass-panel rounded-[30px] border border-[#f0ddb8] p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-[#9a6a1e]">Bill Form</p>
              <h3 className="mt-2 font-display text-2xl text-foreground">Create OPD Bill</h3>
            </div>
            <button
              onClick={() => {
                if (appointments[0]?.id) {
                  setSelectedAppointmentId(appointments[0].id);
                  setAmount(estimateOpdAmount(appointments[0].service));
                }
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#5a49d6] px-4 py-2.5 text-sm font-medium text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Bill
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Appointment
              <select
                value={selectedAppointmentId}
                onChange={(event) => {
                  const appointment = appointments.find((item) => item.id === event.target.value);
                  setSelectedAppointmentId(event.target.value);
                  setAmount(appointment ? estimateOpdAmount(appointment.service) : 800);
                }}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
              >
                <option value="">Select appointment</option>
                {appointments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.service}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-foreground">
              Bill Amount
              <input
                type="number"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value) || 0)}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
              />
            </label>

            <label className="block text-sm font-medium text-foreground">
              Bill Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as OpdBill["status"])}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
              >
                <option value="paid">Paid</option>
                <option value="due">Due</option>
                <option value="refunded">Refunded</option>
              </select>
            </label>

            <div className="rounded-[22px] border border-[#eadfc8] bg-[#fff8ee] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#9a6a1e]">Selected Appointment</p>
              <p className="mt-3 font-semibold text-foreground">{selectedAppointment?.name || "No appointment selected"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedAppointment
                  ? `${selectedAppointment.service} • ${sqlTimeToSlotLabel(selectedAppointment.preferred_time) ?? "Time TBD"}`
                  : "Choose an appointment to auto-fill the bill details."}
              </p>
              {selectedAppointment ? (
                <p className="mt-1 text-sm text-muted-foreground">{selectedAppointment.phone}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={createBill} className="rounded-full bg-[#5a49d6] px-5 py-2.5 text-sm font-medium text-white">
                Generate Bill
              </button>
              <button
                onClick={() => {
                  setSelectedAppointmentId(appointments[0]?.id ?? "");
                  setAmount(appointments[0] ? estimateOpdAmount(appointments[0].service) : 800);
                  setStatus("paid");
                }}
                className="rounded-full border border-[#d8ccff] bg-white px-5 py-2.5 text-sm font-medium text-[#5a49d6]"
              >
                Reset Form
              </button>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          {selectedBill ? (
            <ClinicInvoicePreview
              badge="OPD Invoice Preview"
              title="Consultation Bill"
              invoiceNo={selectedBill.billNo}
              invoiceDate={formatDateTime(selectedBill.date)}
              status={selectedBill.status}
              patientRows={[
                { label: "Patient Name", value: selectedBill.patientName },
                { label: "Patient ID", value: selectedBill.patientId },
                { label: "Phone", value: selectedBill.phone },
                { label: "Age / Gender", value: `${selectedBill.age} • ${selectedBill.gender}` },
              ]}
              billingRows={[
                { label: "Clinic", value: selectedBill.clinicName || clinicBrand.name },
                { label: "Doctor", value: selectedBill.doctorName || clinicBrand.doctorName },
                { label: "Speciality", value: selectedBill.doctorSpeciality || clinicBrand.doctorSpeciality },
                { label: "Address", value: selectedBill.clinicAddress || clinicBrand.address },
              ]}
              items={selectedBill.items.map((item, index) => ({
                id: `${selectedBill.id}-${index}`,
                label: item.label,
                meta: "OPD consultation / service charge",
                qty: item.qty,
                rate: formatMoney(item.rate),
                total: formatMoney(item.total),
              }))}
              summaryRows={[
                { label: "Subtotal", value: formatMoney(selectedBill.totalAmount) },
                { label: "Paid Amount", value: formatMoney(selectedBill.paidAmount), tone: "success" },
                {
                  label: "Balance",
                  value: formatMoney(Math.max(0, selectedBill.totalAmount - selectedBill.paidAmount)),
                  tone: selectedBill.status === "due" ? "warning" : "default",
                },
                { label: "Total Bill", value: formatMoney(selectedBill.totalAmount) },
              ]}
              note="This invoice has been generated by Sharma Cosmo Clinic. Please keep it with you for consultations and follow-up support."
              onPrint={() => window.print()}
            />
          ) : (
            <section className="rounded-[30px] border border-dashed border-[#e4d2aa] bg-white/70 px-6 py-12 text-center text-sm text-muted-foreground">
              Bill generate karte hi professional preview yahin same page par dikh jayega.
            </section>
          )}

          {data.opdBills.length > 0 ? (
            <section className="glass-panel rounded-[30px] border border-[#f0ddb8] p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-[#9a6a1e]">Recent Bills</p>
                  <h3 className="mt-2 font-display text-2xl text-foreground">Quick Preview</h3>
                </div>
                <p className="text-sm text-muted-foreground">{data.opdBills.length} saved bills</p>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {data.opdBills.slice(0, 6).map((bill) => (
                  <button
                    key={bill.id}
                    onClick={() => setSelectedBillId(bill.id)}
                    className="rounded-[22px] border border-[#eadfc8] bg-white/80 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <p className="font-semibold text-[#5a49d6]">{bill.billNo}</p>
                    <p className="mt-1 text-sm text-foreground">{bill.patientName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(bill.date)}</p>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default OpdBillingPanel;

