import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FileSpreadsheet } from "lucide-react";

import DateRangeFilter from "@/components/admin/DateRangeFilter";
import type { AppointmentRecord } from "@/lib/appointmentStore";
import { sqlTimeToSlotLabel } from "@/lib/appointmentTime";
import type { OpdBill } from "@/lib/clinicAdminStore";
import { countDays, downloadCsv, formatDateKey, formatDayName, isInRange, listDaysInRange, normalizeDateKey, rangeForAllDays, shiftDateKey, toDateKey, type DateRange } from "@/lib/reportDates";
import { cn } from "@/lib/utils";

type OpdDailyReportProps = {
  appointments: AppointmentRecord[];
  bills: OpdBill[];
  onOpenBill: (bill: OpdBill) => void;
};

type DayRow = {
  date: string;
  appointments: AppointmentRecord[];
  completed: number;
  cancelled: number;
  bills: OpdBill[];
  collected: number;
  due: number;
  billed: number;
};

const formatMoney = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

/** Appointment day = the date the patient asked for, else the day it was booked. */
const appointmentDateKey = (appointment: AppointmentRecord) => normalizeDateKey(appointment.preferred_date) || normalizeDateKey(appointment.created_at);

const statusClasses: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-800",
  confirmed: "bg-sky-100 text-sky-800",
  cancelled: "bg-rose-100 text-rose-800",
  pending: "bg-amber-100 text-amber-900",
};

const StatCard = ({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) => (
  <div className="rounded-[22px] border border-[#eadfc8] bg-white/80 px-4 py-4">
    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
    <p className={cn("mt-2 break-words font-display text-2xl sm:text-3xl", accent ? "text-[#5a49d6]" : "text-foreground")}>{value}</p>
    {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
  </div>
);

const OpdDailyReport = ({ appointments, bills, onOpenBill }: OpdDailyReportProps) => {
  const today = toDateKey();
  const [range, setRange] = useState<DateRange>({ from: shiftDateKey(today, -6), to: today });
  const [showEmptyDays, setShowEmptyDays] = useState(false);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const allDaysRange = useMemo(
    () => rangeForAllDays([...appointments.map(appointmentDateKey), ...bills.map((bill) => normalizeDateKey(bill.date))]),
    [appointments, bills],
  );

  const dayRows = useMemo(() => {
    const byDate = new Map<string, DayRow>();
    const ensure = (date: string) => {
      const row = byDate.get(date) ?? { date, appointments: [], completed: 0, cancelled: 0, bills: [], collected: 0, due: 0, billed: 0 };
      byDate.set(date, row);
      return row;
    };

    if (showEmptyDays) listDaysInRange(range).forEach(ensure);

    appointments.forEach((appointment) => {
      const date = appointmentDateKey(appointment);
      if (!isInRange(date, range)) return;
      const row = ensure(date);
      row.appointments.push(appointment);
      if (appointment.status === "completed") row.completed += 1;
      if (appointment.status === "cancelled") row.cancelled += 1;
    });

    bills.forEach((bill) => {
      const date = normalizeDateKey(bill.date);
      if (!isInRange(date, range)) return;
      const row = ensure(date);
      row.bills.push(bill);
      if (bill.status === "refunded") return;
      row.billed += bill.totalAmount;
      row.collected += bill.status === "paid" ? bill.paidAmount : 0;
      row.due += bill.status === "due" ? Math.max(0, bill.totalAmount - bill.paidAmount) : 0;
    });

    byDate.forEach((row) => row.appointments.sort((left, right) => (left.preferred_time ?? "").localeCompare(right.preferred_time ?? "")));
    return [...byDate.values()].sort((left, right) => right.date.localeCompare(left.date));
  }, [appointments, bills, range, showEmptyDays]);

  const totals = useMemo(
    () =>
      dayRows.reduce(
        (sum, row) => ({
          appointments: sum.appointments + row.appointments.length,
          completed: sum.completed + row.completed,
          cancelled: sum.cancelled + row.cancelled,
          bills: sum.bills + row.bills.length,
          collected: sum.collected + row.collected,
          due: sum.due + row.due,
          billed: sum.billed + row.billed,
        }),
        { appointments: 0, completed: 0, cancelled: 0, bills: 0, collected: 0, due: 0, billed: 0 },
      ),
    [dayRows],
  );

  const days = countDays(range);
  const busiestDay = dayRows.reduce<DayRow | null>((best, row) => (row.appointments.length > (best?.appointments.length ?? 0) ? row : best), null);

  const exportCsv = () => {
    downloadCsv(`opd-report-${range.from}-to-${range.to}.csv`, [
      ["Date", "Day", "Appointments", "Completed", "Cancelled", "OPD Bills", "Billed", "Collected", "Due"],
      ...dayRows.map((row) => [row.date, formatDayName(row.date), row.appointments.length, row.completed, row.cancelled, row.bills.length, row.billed, row.collected, row.due]),
      ["Total", "", totals.appointments, totals.completed, totals.cancelled, totals.bills, totals.billed, totals.collected, totals.due],
    ]);
  };

  return (
    <section className="glass-panel rounded-[30px] border border-[#f0ddb8] bg-white/70 p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[#9a6a1e]">OPD Report</p>
          <h3 className="mt-2 font-display text-2xl text-foreground">Day-by-day appointments &amp; billing</h3>
          <p className="mt-1 text-sm text-muted-foreground">Har din kitne appointment the aur kitni billing hui — calendar se koi bhi range ya &ldquo;All Days&rdquo; select karein.</p>
        </div>
        <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 self-start rounded-full border border-[#d8ccff] bg-white px-4 py-2 text-sm font-medium text-[#5a49d6]">
          <FileSpreadsheet className="h-4 w-4" />
          Download Excel (CSV)
        </button>
      </div>

      <div className="mt-5">
        <DateRangeFilter range={range} onChange={(next) => { setRange(next); setExpandedDate(null); }} allDaysRange={allDaysRange} allowFuture />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Appointments" value={String(totals.appointments)} hint={`${days} ${days === 1 ? "day" : "days"}`} accent />
        <StatCard label="Completed" value={String(totals.completed)} hint={`${totals.cancelled} cancelled`} />
        <StatCard label="Avg / Day" value={(days > 0 ? totals.appointments / days : 0).toFixed(1)} hint={busiestDay ? `Busiest: ${formatDateKey(busiestDay.date)}` : undefined} />
        <StatCard label="OPD Bills" value={String(totals.bills)} />
        <StatCard label="Collected" value={formatMoney(totals.collected)} />
        <StatCard label="Due" value={formatMoney(totals.due)} />
      </div>

      <div className="mt-5 flex justify-end">
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={showEmptyDays} onChange={(event) => setShowEmptyDays(event.target.checked)} className="h-4 w-4 accent-[#5a49d6]" />
          Khaali din bhi dikhayein
        </label>
      </div>

      <div className="mt-3 overflow-x-auto rounded-[24px] border border-[#eadfc8] bg-white/70">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-[#eadfc8] text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Appointments</th>
              <th className="px-4 py-3 text-right">Completed</th>
              <th className="px-4 py-3 text-right">Cancelled</th>
              <th className="px-4 py-3 text-right">OPD Bills</th>
              <th className="px-4 py-3 text-right">Collected</th>
              <th className="px-4 py-3 text-right">Due</th>
            </tr>
          </thead>
          <tbody>
            {dayRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Is date range me koi appointment ya bill nahi hai.</td>
              </tr>
            ) : (
              dayRows.map((row) => {
                const expanded = expandedDate === row.date;
                const empty = row.appointments.length === 0 && row.bills.length === 0;
                return (
                  <Fragment key={row.date}>
                    <tr
                      onClick={() => !empty && setExpandedDate(expanded ? null : row.date)}
                      className={cn("border-b border-[#f3ead8] tabular-nums", empty ? "text-muted-foreground" : "cursor-pointer hover:bg-[#fbf9ff]", expanded && "bg-[#f5f1ff]")}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {empty ? <span className="w-4" /> : expanded ? <ChevronDown className="h-4 w-4 text-[#5a49d6]" /> : <ChevronRight className="h-4 w-4 text-[#5a49d6]" />}
                          <span className="font-medium text-foreground">{formatDateKey(row.date)}</span>
                          <span className="text-xs text-muted-foreground">{formatDayName(row.date)}</span>
                          {row.date === today ? <span className="rounded-full bg-[#5a49d6] px-2 py-0.5 text-[10px] font-semibold uppercase text-white">Today</span> : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#5a49d6]">{row.appointments.length}</td>
                      <td className="px-4 py-3 text-right">{row.completed}</td>
                      <td className="px-4 py-3 text-right">{row.cancelled}</td>
                      <td className="px-4 py-3 text-right">{row.bills.length}</td>
                      <td className="px-4 py-3 text-right text-emerald-700">{formatMoney(row.collected)}</td>
                      <td className={cn("px-4 py-3 text-right", row.due > 0 ? "text-amber-700" : "")}>{formatMoney(row.due)}</td>
                    </tr>
                    {expanded ? (
                      <tr className="border-b border-[#f3ead8] bg-[#fbf9ff]">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="grid gap-4 lg:grid-cols-2">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Appointments ({row.appointments.length})</p>
                              <div className="mt-2 space-y-2">
                                {row.appointments.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">Koi appointment nahi.</p>
                                ) : (
                                  row.appointments.map((appointment) => (
                                    <div key={appointment.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#e7defc] bg-white px-4 py-2.5">
                                      <div className="min-w-0">
                                        <p className="truncate font-medium text-foreground">{appointment.name}</p>
                                        <p className="truncate text-xs text-muted-foreground">
                                          {sqlTimeToSlotLabel(appointment.preferred_time) ?? "Time TBD"} • {appointment.service || "Consultation"} • {appointment.phone}
                                        </p>
                                      </div>
                                      <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize", statusClasses[appointment.status] ?? "bg-slate-100 text-slate-700")}>{appointment.status}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">OPD Bills ({row.bills.length})</p>
                              <div className="mt-2 space-y-2">
                                {row.bills.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">Koi bill nahi.</p>
                                ) : (
                                  row.bills.map((bill) => (
                                    <div key={bill.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#e7defc] bg-white px-4 py-2.5">
                                      <div className="min-w-0">
                                        <p className="font-medium text-[#5a49d6]">{bill.billNo}</p>
                                        <p className="truncate text-xs text-muted-foreground">{bill.patientName} • {bill.visitType}</p>
                                      </div>
                                      <div className="flex shrink-0 items-center gap-2">
                                        <span className={cn("text-xs font-medium capitalize", bill.status === "paid" ? "text-emerald-700" : bill.status === "due" ? "text-amber-700" : "text-rose-700")}>{bill.status}</span>
                                        <span className="font-semibold tabular-nums">{formatMoney(bill.totalAmount)}</span>
                                        <button type="button" onClick={() => onOpenBill(bill)} className="rounded-full border border-[#d8ccff] bg-white px-3 py-1 text-xs font-medium text-[#5a49d6]">Open</button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}
          </tbody>
          {dayRows.length > 0 ? (
            <tfoot>
              <tr className="bg-[#f9f2e0] font-semibold tabular-nums">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right text-[#5a49d6]">{totals.appointments}</td>
                <td className="px-4 py-3 text-right">{totals.completed}</td>
                <td className="px-4 py-3 text-right">{totals.cancelled}</td>
                <td className="px-4 py-3 text-right">{totals.bills}</td>
                <td className="px-4 py-3 text-right text-emerald-700">{formatMoney(totals.collected)}</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatMoney(totals.due)}</td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </section>
  );
};

export default OpdDailyReport;
