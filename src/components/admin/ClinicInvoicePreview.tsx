import { Printer } from "lucide-react";

import { clinicBrand } from "@/lib/clinicBrand";
import { cn } from "@/lib/utils";

type InvoiceInfoRow = {
  label: string;
  value: string;
};

type InvoiceLineItem = {
  id: string;
  label: string;
  meta?: string;
  qty: number;
  rate: string;
  total: string;
};

type InvoiceSummaryRow = {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning";
};

type ClinicInvoicePreviewProps = {
  badge: string;
  title: string;
  invoiceNo: string;
  invoiceDate: string;
  status: string;
  patientRows: InvoiceInfoRow[];
  billingRows: InvoiceInfoRow[];
  items: InvoiceLineItem[];
  summaryRows: InvoiceSummaryRow[];
  note?: string;
  onPrint?: () => void;
};

const summaryToneClasses: Record<NonNullable<InvoiceSummaryRow["tone"]>, string> = {
  default: "text-foreground",
  success: "text-emerald-700",
  warning: "text-amber-700",
};

const statusClasses: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  due: "bg-amber-100 text-amber-900",
  refunded: "bg-rose-100 text-rose-800",
};

const ClinicInvoicePreview = ({
  badge,
  title,
  invoiceNo,
  invoiceDate,
  status,
  patientRows,
  billingRows,
  items,
  summaryRows,
  note,
  onPrint,
}: ClinicInvoicePreviewProps) => {
  const handlePrint = () => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      onPrint?.();
      return;
    }

    const invoiceElement = document.querySelector(".print-bill-area") as HTMLElement | null;
    if (!invoiceElement) {
      onPrint?.();
      return;
    }

    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((node) => node.outerHTML)
      .join("");

    const printWindow = window.open("", "_blank", "width=1100,height=800");
    if (!printWindow) {
      onPrint?.();
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${invoiceNo} - ${clinicBrand.name}</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 6mm;
            }

            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            body {
              padding: 0;
              zoom: 0.94;
            }

            .print-hidden {
              display: none !important;
            }

            .print-bill-area {
              width: 100%;
              max-width: 190mm;
              margin: 0 auto !important;
              box-shadow: none !important;
              border: none !important;
              background: #ffffff !important;
              padding: 0 !important;
              break-inside: auto !important;
              page-break-inside: auto !important;
            }

            .invoice-shell {
              padding: 14px !important;
              border-radius: 18px !important;
            }

            .invoice-header {
              gap: 10px !important;
              padding-bottom: 12px !important;
            }

            .invoice-title {
              margin-top: 8px !important;
              font-size: 28px !important;
              line-height: 1.05 !important;
            }

            .invoice-grid,
            .invoice-footer-grid {
              gap: 10px !important;
              margin-top: 10px !important;
              break-inside: auto !important;
              page-break-inside: auto !important;
            }

            .invoice-card,
            .invoice-note,
            .invoice-summary,
            .invoice-table-row {
              padding: 12px !important;
              border-radius: 16px !important;
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .invoice-table {
              margin-top: 10px !important;
              break-inside: auto !important;
              page-break-inside: auto !important;
            }

            .invoice-table-head,
            .invoice-table-row {
              gap: 10px !important;
              padding-left: 10px !important;
              padding-right: 10px !important;
            }

            .invoice-table-head {
              padding-top: 8px !important;
              padding-bottom: 8px !important;
            }

            .invoice-table-row {
              padding-top: 9px !important;
              padding-bottom: 9px !important;
            }

            .print-bill-area p,
            .print-bill-area span,
            .print-bill-area div {
              line-height: 1.25 !important;
            }
          </style>
        </head>
        <body>
          ${invoiceElement.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();

    window.setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      window.setTimeout(() => {
        printWindow.close();
      }, 300);
    }, 400);
  };

  return (
    <section className="print-bill-area rounded-[34px] border border-[#ead7b0] bg-white p-5 shadow-[0_28px_60px_-42px_rgba(77,53,14,0.35)] print:rounded-none print:border-none print:p-0 print:shadow-none sm:p-7">
      <div className="invoice-shell rounded-[28px] border border-[#f4e4c2] bg-[linear-gradient(180deg,#fffefb_0%,#fff7ea_100%)] p-5 print:border-none print:bg-white print:p-0 sm:p-7">
        <div className="invoice-header flex flex-col gap-5 border-b border-[#ead7b0] pb-5 print:pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b57a25]">{badge}</p>
            <h3 className="invoice-title mt-3 font-display text-3xl text-[#2f2215] sm:text-4xl">{clinicBrand.name}</h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{clinicBrand.address}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {clinicBrand.doctorName} - {clinicBrand.doctorSpeciality}
            </p>
          </div>
          <div className="space-y-3 sm:text-right">
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="rounded-full bg-[#f7eed8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#7b5622]">
                {title}
              </span>
              <span
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]",
                  statusClasses[status.toLowerCase()] || "bg-slate-100 text-slate-700",
                )}
              >
                {status}
              </span>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Invoice No:</span> {invoiceNo}
              </p>
              <p>
                <span className="font-semibold text-foreground">Invoice Date:</span> {invoiceDate}
              </p>
            </div>
            {onPrint ? (
              <button
                onClick={handlePrint}
                className="print-hidden inline-flex items-center gap-2 rounded-full border border-[#d8c9a4] bg-white px-4 py-2 text-sm font-medium text-[#5a49d6] print:hidden"
              >
                <Printer className="h-4 w-4" />
                Print Bill
              </button>
            ) : null}
          </div>
        </div>

        <div className="invoice-grid mt-5 grid gap-4 md:grid-cols-2">
          <div className="invoice-card rounded-[24px] border border-[#ead7b0] bg-white/90 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a16c23]">Patient Details</p>
            <div className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {patientRows.map((row) => (
                <p key={row.label}>
                  <span className="font-semibold text-foreground">{row.label}:</span> {row.value}
                </p>
              ))}
            </div>
          </div>
          <div className="invoice-card rounded-[24px] border border-[#ead7b0] bg-white/90 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a16c23]">Billing Summary</p>
            <div className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {billingRows.map((row) => (
                <p key={row.label}>
                  <span className="font-semibold text-foreground">{row.label}:</span> {row.value}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="invoice-table mt-5 overflow-hidden rounded-[24px] border border-[#ead7b0]">
          <div className="invoice-table-head grid grid-cols-[1.3fr,0.55fr,0.7fr,0.7fr] gap-4 bg-[#f9f2e0] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#7d5a27]">
            <span>Item / Service</span>
            <span>Qty</span>
            <span>Rate</span>
            <span>Total</span>
          </div>
          {items.map((item) => (
            <div key={item.id} className="invoice-table-row grid grid-cols-[1.3fr,0.55fr,0.7fr,0.7fr] gap-4 border-t border-[#f0e4ca] bg-white px-4 py-4 text-sm">
              <div>
                <p className="font-semibold text-foreground">{item.label}</p>
                {item.meta ? <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p> : null}
              </div>
              <span>{item.qty}</span>
              <span>{item.rate}</span>
              <span className="font-semibold text-foreground">{item.total}</span>
            </div>
          ))}
        </div>

        <div className="invoice-footer-grid mt-5 grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="invoice-note rounded-[24px] border border-dashed border-[#e6d4ad] bg-[#fffaf0] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a16c23]">Clinic Note</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {note || "Thank you for choosing Sharma Cosmo Clinic. Please keep this invoice for records and future follow-ups."}
            </p>
          </div>
          <div className="invoice-summary rounded-[24px] border border-[#ead7b0] bg-white/90 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a16c23]">Amount Summary</p>
            <div className="mt-4 space-y-3">
              {summaryRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={cn("font-semibold", summaryToneClasses[row.tone || "default"])}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClinicInvoicePreview;
