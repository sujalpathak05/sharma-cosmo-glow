import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Download, FileSpreadsheet } from "lucide-react";

import DateRangeFilter from "@/components/admin/DateRangeFilter";
import type { PharmacySaleInvoice } from "@/lib/clinicAdminStore";
import { countDays, downloadCsv, formatDateKey, formatDayName, isInRange, listDaysInRange, normalizeDateKey, rangeForAllDays, shiftDateKey, toDateKey, type DateRange } from "@/lib/reportDates";
import { cn } from "@/lib/utils";

type PharmacySalesReportProps = {
  sales: PharmacySaleInvoice[];
  onViewInvoice: (invoice: PharmacySaleInvoice) => void;
  onDownloadInvoice: (invoice: PharmacySaleInvoice) => void;
};

type DayRow = { date: string; invoices: PharmacySaleInvoice[]; items: number; paid: number; due: number; total: number };

const formatMoney = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const countItems = (invoice: PharmacySaleInvoice) => invoice.items.reduce((sum, item) => sum + item.qty, 0);

const StatCard = ({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) => (
  <div className="rounded-[22px] border border-[#eadfc8] bg-white/80 px-4 py-4">
    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
    <p className={cn("mt-2 break-words font-display text-2xl sm:text-3xl", accent ? "text-[#5a49d6]" : "text-foreground")}>{value}</p>
    {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
  </div>
);

const PharmacySalesReport = ({ sales, onViewInvoice, onDownloadInvoice }: PharmacySalesReportProps) => {
  const today = toDateKey();
  const [range, setRange] = useState<DateRange>({ from: shiftDateKey(today, -6), to: today });
  const [showEmptyDays, setShowEmptyDays] = useState(false);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const allDaysRange = useMemo(() => rangeForAllDays(sales.map((invoice) => normalizeDateKey(invoice.date))), [sales]);

  const rangeSales = useMemo(() => sales.filter((invoice) => isInRange(normalizeDateKey(invoice.date), range)), [sales, range]);

  const dayRows = useMemo(() => {
    const byDate = new Map<string, DayRow>();
    const ensure = (date: string) => {
      const row = byDate.get(date) ?? { date, invoices: [], items: 0, paid: 0, due: 0, total: 0 };
      byDate.set(date, row);
      return row;
    };

    if (showEmptyDays) listDaysInRange(range).forEach(ensure);

    rangeSales.forEach((invoice) => {
      const row = ensure(normalizeDateKey(invoice.date));
      row.invoices.push(invoice);
      row.items += countItems(invoice);
      row.total += invoice.totalAmount;
      if (invoice.paymentStatus === "due") row.due += invoice.totalAmount;
      else row.paid += invoice.totalAmount;
    });

    return [...byDate.values()].sort((left, right) => right.date.localeCompare(left.date));
  }, [range, rangeSales, showEmptyDays]);

  const totals = useMemo(
    () => dayRows.reduce((sum, row) => ({ bills: sum.bills + row.invoices.length, items: sum.items + row.items, paid: sum.paid + row.paid, due: sum.due + row.due, total: sum.total + row.total }), { bills: 0, items: 0, paid: 0, due: 0, total: 0 }),
    [dayRows],
  );

  const topMedicines = useMemo(() => {
    const byName = new Map<string, { name: string; qty: number; amount: number }>();
    rangeSales.forEach((invoice) =>
      invoice.items.forEach((item) => {
        const current = byName.get(item.name) ?? { name: item.name, qty: 0, amount: 0 };
        current.qty += item.qty;
        current.amount += item.qty * item.price;
        byName.set(item.name, current);
      }),
    );
    return [...byName.values()].sort((left, right) => right.qty - left.qty).slice(0, 8);
  }, [rangeSales]);

  const days = countDays(range);
  const salesDays = dayRows.filter((row) => row.invoices.length > 0).length;
  const bestDay = dayRows.reduce<DayRow | null>((best, row) => (row.total > (best?.total ?? 0) ? row : best), null);

  const exportCsv = () => {
    downloadCsv(`pharmacy-sales-${range.from}-to-${range.to}.csv`, [
      ["Date", "Day", "Bills", "Items", "Paid", "Due", "Total"],
      ...dayRows.map((row) => [row.date, formatDayName(row.date), row.invoices.length, row.items, row.paid, row.due, row.total]),
      ["Total", "", totals.bills, totals.items, totals.paid, totals.due, totals.total],
    ]);
  };

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[30px] border border-[#f0ddb8] bg-white/70 p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="font-display text-2xl text-foreground">Sales Report</h3>
            <p className="mt-1 text-sm text-muted-foreground">Calendar se jitne din ki sale dekhni ho woh range select karein.</p>
          </div>
          <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 self-start rounded-full border border-[#d8ccff] bg-white px-4 py-2 text-sm font-medium text-[#5a49d6]">
            <FileSpreadsheet className="h-4 w-4" />
            Download Excel (CSV)
          </button>
        </div>
        <div className="mt-5">
          <DateRangeFilter range={range} onChange={(next) => { setRange(next); setExpandedDate(null); }} allDaysRange={allDaysRange} />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total Sale" value={formatMoney(totals.total)} hint={`${days} ${days === 1 ? "day" : "days"}`} accent />
          <StatCard label="Bills" value={String(totals.bills)} hint={`${salesDays} din me sale hui`} />
          <StatCard label="Items Sold" value={String(totals.items)} />
          <StatCard label="Paid" value={formatMoney(totals.paid)} />
          <StatCard label="Due" value={formatMoney(totals.due)} />
          <StatCard label="Avg / Day" value={formatMoney(days > 0 ? Math.round(totals.total / days) : 0)} hint={bestDay ? `Best: ${formatDateKey(bestDay.date)}` : undefined} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),340px]">
        <section className="glass-panel rounded-[30px] border border-[#f0ddb8] bg-white/70 p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-display text-2xl text-foreground">Day-by-day sale</h3>
            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={showEmptyDays} onChange={(event) => setShowEmptyDays(event.target.checked)} className="h-4 w-4 accent-[#5a49d6]" />
              Bina sale wale din bhi dikhayein
            </label>
          </div>
          <div className="mt-5 overflow-x-auto rounded-[24px] border border-[#eadfc8] bg-white/70">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-[#eadfc8] text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Bills</th>
                  <th className="px-4 py-3 text-right">Items</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Due</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {dayRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Is date range me koi sale nahi hai.</td>
                  </tr>
                ) : (
                  dayRows.map((row) => {
                    const expanded = expandedDate === row.date;
                    const empty = row.invoices.length === 0;
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
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">{row.invoices.length}</td>
                          <td className="px-4 py-3 text-right">{row.items}</td>
                          <td className="px-4 py-3 text-right text-emerald-700">{formatMoney(row.paid)}</td>
                          <td className={cn("px-4 py-3 text-right", row.due > 0 ? "text-amber-700" : "")}>{formatMoney(row.due)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-[#5a49d6]">{formatMoney(row.total)}</td>
                        </tr>
                        {expanded ? (
                          <tr className="border-b border-[#f3ead8] bg-[#fbf9ff]">
                            <td colSpan={6} className="px-4 py-3">
                              <div className="space-y-2">
                                {row.invoices.map((invoice) => (
                                  <div key={invoice.id} className="flex flex-col gap-2 rounded-2xl border border-[#e7defc] bg-white px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                      <p className="font-medium text-[#5a49d6]">{invoice.invoiceNo}</p>
                                      <p className="text-xs text-muted-foreground">{invoice.patientName} • {invoice.contactNo} • {countItems(invoice)} items</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={cn("text-xs font-medium capitalize", invoice.paymentStatus === "due" ? "text-amber-700" : "text-emerald-700")}>{invoice.paymentStatus}</span>
                                      <span className="font-semibold tabular-nums">{formatMoney(invoice.totalAmount)}</span>
                                      <button type="button" onClick={() => onViewInvoice(invoice)} className="rounded-full border border-[#d8ccff] bg-white px-3 py-1 text-xs font-medium text-[#5a49d6]">View</button>
                                      <button type="button" onClick={() => onDownloadInvoice(invoice)} className="inline-flex items-center gap-1 rounded-full bg-[#5a49d6] px-3 py-1 text-xs font-medium text-white">
                                        <Download className="h-3 w-3" />
                                        PDF
                                      </button>
                                    </div>
                                  </div>
                                ))}
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
                    <td className="px-4 py-3 text-right">{totals.bills}</td>
                    <td className="px-4 py-3 text-right">{totals.items}</td>
                    <td className="px-4 py-3 text-right text-emerald-700">{formatMoney(totals.paid)}</td>
                    <td className="px-4 py-3 text-right text-amber-700">{formatMoney(totals.due)}</td>
                    <td className="px-4 py-3 text-right text-[#5a49d6]">{formatMoney(totals.total)}</td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
        </section>

        <section className="glass-panel rounded-[30px] border border-[#f0ddb8] bg-white/70 p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">
          <h3 className="font-display text-2xl text-foreground">Top medicines</h3>
          <p className="mt-1 text-sm text-muted-foreground">Selected range me sabse zyada biki</p>
          <div className="mt-4 space-y-2">
            {topMedicines.length === 0 ? (
              <p className="rounded-[20px] border border-dashed border-[#eadfc8] px-4 py-6 text-center text-sm text-muted-foreground">No data</p>
            ) : (
              topMedicines.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-3 rounded-[18px] border border-[#eadfc8] bg-white/80 px-4 py-2.5 text-sm">
                  <p className="min-w-0 truncate font-medium text-foreground">{index + 1}. {item.name}</p>
                  <div className="shrink-0 text-right tabular-nums">
                    <p className="font-semibold text-foreground">{item.qty} qty</p>
                    <p className="text-xs text-muted-foreground">{formatMoney(item.amount)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PharmacySalesReport;
