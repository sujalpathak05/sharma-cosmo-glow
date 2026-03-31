import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import ClinicInvoicePreview from "@/components/admin/ClinicInvoicePreview";
import {
  addPharmacyMedicine,
  clinicAdminEventName,
  createPatientId,
  createPharmacySaleInvoice,
  readClinicAdminData,
  type ClinicAdminData,
} from "@/lib/clinicAdminStore";
import type { AppointmentRecord } from "@/lib/appointmentStore";
import { clinicBrand } from "@/lib/clinicBrand";
import { cn } from "@/lib/utils";

type PharmacyPanelProps = {
  appointments: AppointmentRecord[];
};

type PharmacyView = "dashboard" | "masters" | "stock" | "sales" | "purchase" | "reports";

const formatMoney = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const formatDate = (value: string) =>
  new Date(`${value}T10:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const createSaleRow = () => ({ key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, medicineId: "", qty: "1" });

const PharmacyPanel = ({ appointments }: PharmacyPanelProps) => {
  const [view, setView] = useState<PharmacyView>("dashboard");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<ClinicAdminData>(readClinicAdminData());
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(readClinicAdminData().pharmacySales[0]?.id ?? null);
  const [medicineForm, setMedicineForm] = useState({
    name: "",
    generic: "",
    group: "",
    manufacturer: "",
    batch: "",
    expiryDate: "",
    stock: "",
    location: "",
    unitPrice: "",
  });
  const [saleForm, setSaleForm] = useState({
    patientName: "",
    contactNo: "",
    type: "OTC" as "OPD" | "OTC",
    items: [createSaleRow()],
  });

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

  const filteredMedicines = data.pharmacyMedicines.filter((medicine) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return medicine.name.toLowerCase().includes(term) || medicine.generic.toLowerCase().includes(term) || medicine.batch.toLowerCase().includes(term);
  });

  const filteredSales = data.pharmacySales.filter((invoice) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return invoice.patientName.toLowerCase().includes(term) || invoice.contactNo.includes(term) || invoice.invoiceNo.includes(term);
  });

  const expiringSoon = useMemo(() => {
    return [...data.pharmacyMedicines]
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
      .slice(0, 8);
  }, [data.pharmacyMedicines]);

  const selectedSale = data.pharmacySales.find((invoice) => invoice.id === selectedSaleId) ?? data.pharmacySales[0] ?? null;
  const totalStock = data.pharmacyMedicines.reduce((sum, item) => sum + item.stock, 0);
  const dueSales = data.pharmacySales.filter((item) => item.paymentStatus === "due").length;
  const linkedPatients = new Set(appointments.map((item) => item.phone)).size;
  const salePreviewItems = saleForm.items
    .map((row) => {
      const medicine = data.pharmacyMedicines.find((item) => item.id === row.medicineId);
      const qty = Math.max(1, Number(row.qty) || 1);
      return medicine
        ? {
            key: row.key,
            medicineId: medicine.id,
            name: medicine.name,
            qty,
            price: medicine.unitPrice,
            stock: medicine.stock,
            total: qty * medicine.unitPrice,
          }
        : null;
    })
    .filter((item): item is { key: string; medicineId: string; name: string; qty: number; price: number; stock: number; total: number } => Boolean(item));
  const saleDraftTotal = salePreviewItems.reduce((sum, item) => sum + item.total, 0);

  const resetMedicineForm = () => setMedicineForm({ name: "", generic: "", group: "", manufacturer: "", batch: "", expiryDate: "", stock: "", location: "", unitPrice: "" });
  const resetSaleForm = () => setSaleForm({ patientName: "", contactNo: "", type: "OTC", items: [createSaleRow()] });

  const addMedicine = () => {
    if (!medicineForm.name.trim() || !medicineForm.expiryDate || !medicineForm.stock || !medicineForm.unitPrice) {
      toast.error("Fill medicine name, expiry, stock and price.");
      return;
    }
    addPharmacyMedicine({
      name: medicineForm.name.trim(),
      generic: medicineForm.generic.trim() || "-",
      group: medicineForm.group.trim() || "-",
      manufacturer: medicineForm.manufacturer.trim() || "-",
      batch: medicineForm.batch.trim() || "-",
      expiryDate: medicineForm.expiryDate,
      stock: Number(medicineForm.stock),
      location: medicineForm.location.trim() || "Main Rack",
      unitPrice: Number(medicineForm.unitPrice),
    });
    setData(readClinicAdminData());
    setShowMedicineForm(false);
    resetMedicineForm();
    toast.success("Medicine added to pharmacy master.");
  };

  const updateSaleItem = (key: string, patch: Partial<(typeof saleForm.items)[number]>) => {
    setSaleForm((current) => ({
      ...current,
      items: current.items.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    }));
  };

  const addSaleItemRow = () => {
    setSaleForm((current) => ({
      ...current,
      items: [...current.items, createSaleRow()],
    }));
  };

  const removeSaleItemRow = (key: string) => {
    setSaleForm((current) => ({
      ...current,
      items: current.items.length > 1 ? current.items.filter((item) => item.key !== key) : [createSaleRow()],
    }));
  };

  const createSale = () => {
    if (!saleForm.patientName.trim() || !saleForm.contactNo.trim()) {
      toast.error("Enter patient details first.");
      return;
    }
    if (salePreviewItems.length === 0) {
      toast.error("Add at least one medicine.");
      return;
    }

    const invalidItem = salePreviewItems.find((item) => item.qty > item.stock);
    if (invalidItem) {
      toast.error(`${invalidItem.name} has only ${invalidItem.stock} units available.`);
      return;
    }

    try {
      const invoice = createPharmacySaleInvoice({
        patientId: createPatientId(saleForm.contactNo),
        patientName: saleForm.patientName.trim(),
        contactNo: saleForm.contactNo.trim(),
        date: new Date().toISOString().slice(0, 10),
        paymentStatus: saleForm.type === "OPD" ? "due" : "paid",
        type: saleForm.type,
        items: salePreviewItems.map((item) => ({
          medicineId: item.medicineId,
          name: item.name,
          qty: item.qty,
          price: item.price,
        })),
      });
      setData(readClinicAdminData());
      setSelectedSaleId(invoice.id);
      setShowSaleForm(false);
      resetSaleForm();
      toast.success(`Pharmacy invoice ${invoice.invoiceNo} created.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create pharmacy invoice.");
    }
  };

  const navigation = [
    ["dashboard", "Dashboard"],
    ["masters", "Masters"],
    ["stock", "Stock"],
    ["sales", "Sales"],
    ["purchase", "Purchase"],
    ["reports", "Reports"],
  ] as const;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-[#cdb8ff] bg-[linear-gradient(90deg,rgba(73,81,214,0.96),rgba(158,52,255,0.94))] p-5 text-white shadow-[0_24px_60px_-40px_rgba(66,43,133,0.45)] sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-white/80">Pharmacy panel</p>
            <h2 className="mt-2 font-display text-4xl">Pharmacy Dashboard</h2>
            <p className="mt-2 text-sm text-white/80">Masters, stock, sales, purchase and expiry reports aligned to your Tatva references.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-4 xl:w-[640px]">
            <div className="rounded-[22px] bg-white/12 px-4 py-4"><p className="text-xs uppercase tracking-[0.16em] text-white/70">Purchase Invoice</p><p className="mt-2 font-display text-3xl">{data.pharmacyPurchases.length}</p></div>
            <div className="rounded-[22px] bg-white/12 px-4 py-4"><p className="text-xs uppercase tracking-[0.16em] text-white/70">Sale Invoice</p><p className="mt-2 font-display text-3xl">{data.pharmacySales.length}</p></div>
            <div className="rounded-[22px] bg-white/12 px-4 py-4"><p className="text-xs uppercase tracking-[0.16em] text-white/70">Stock Qty</p><p className="mt-2 font-display text-3xl">{totalStock}</p></div>
            <div className="rounded-[22px] bg-white/12 px-4 py-4"><p className="text-xs uppercase tracking-[0.16em] text-white/70">Due Sales</p><p className="mt-2 font-display text-3xl">{dueSales}</p><p className="mt-1 text-xs text-white/70">{linkedPatients} live clinic patients linked</p></div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {navigation.map(([key, label]) => (
          <button key={key} onClick={() => setView(key)} className={cn("rounded-full px-4 py-2 text-sm font-medium transition", view === key ? "bg-[#5a49d6] text-white" : "bg-white/70 text-muted-foreground hover:text-foreground")}>{label}</button>
        ))}
      </div>

      {view === "dashboard" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="glass-panel rounded-[30px] border border-[#f0ddb8] p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">
            <h3 className="font-display text-2xl text-foreground">Pharmacy movement</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{navigation.slice(1).map(([key, label]) => <button key={key} onClick={() => setView(key)} className="rounded-[24px] border border-[#eadfc8] bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"><p className="font-semibold text-foreground">{label}</p><p className="mt-2 text-sm text-muted-foreground">Open {label.toLowerCase()} workflow</p></button>)}</div>
          </section>
          <section className="glass-panel rounded-[30px] border border-[#f0ddb8] p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">
            <h3 className="font-display text-2xl text-foreground">Expiring soon</h3>
            <div className="mt-4 space-y-3">{expiringSoon.map((item) => <div key={item.id} className="flex items-center justify-between rounded-[20px] border border-[#eadfc8] bg-white/80 px-4 py-3"><div><p className="font-medium text-foreground">{item.name}</p><p className="text-sm text-muted-foreground">Batch {item.batch}</p></div><div className="text-right"><p className="text-sm font-medium text-foreground">{item.expiryDate}</p><p className="text-xs text-muted-foreground">Stock {item.stock}</p></div></div>)}</div>
          </section>
        </div>
      ) : null}

      {view === "masters" ? (
        <section className="glass-panel rounded-[30px] border border-[#f0ddb8] p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <h3 className="font-display text-2xl text-foreground">Medicine Master</h3>
            <div className="flex flex-col gap-3 sm:flex-row"><div className="flex items-center gap-2 rounded-full border border-[#dfd4bb] bg-white px-4 py-2 text-sm text-muted-foreground"><Search className="h-4 w-4" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search medicine" className="w-full bg-transparent outline-none" /></div><button onClick={() => setShowMedicineForm((current) => !current)} className="inline-flex items-center gap-2 rounded-full bg-[#5a49d6] px-4 py-2.5 text-sm font-medium text-white"><Plus className="h-4 w-4" />Add New Medicine</button></div>
          </div>
          {showMedicineForm ? <div className="mt-5 grid gap-4 rounded-[24px] border border-[#eadfc8] bg-white/80 p-5 md:grid-cols-2 xl:grid-cols-4">{Object.entries(medicineForm).map(([key, value]) => <label key={key} className="text-sm font-medium text-foreground capitalize">{key}<input type={key === "expiryDate" ? "date" : key === "stock" || key === "unitPrice" ? "number" : "text"} value={value} onChange={(event) => setMedicineForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" /></label>)}<div className="xl:col-span-4 flex gap-3"><button onClick={addMedicine} className="rounded-full bg-[#5a49d6] px-5 py-2.5 text-sm font-medium text-white">Save Medicine</button><button onClick={() => { setShowMedicineForm(false); resetMedicineForm(); }} className="rounded-full border border-[#d8ccff] bg-white px-5 py-2.5 text-sm font-medium text-[#5a49d6]">Cancel</button></div></div> : null}
          <div className="mt-5 overflow-hidden rounded-[24px] border border-[#eadfc8] bg-white/70"><div className="grid grid-cols-[1.1fr,0.9fr,0.8fr,0.8fr,0.8fr,0.6fr] gap-4 border-b border-[#eadfc8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"><span>Medicine Name</span><span>Generic</span><span>Group</span><span>MFG</span><span>Batch</span><span>Action</span></div>{filteredMedicines.map((item) => <div key={item.id} className="grid grid-cols-[1.1fr,0.9fr,0.8fr,0.8fr,0.8fr,0.6fr] gap-4 border-b border-[#f3ead8] px-4 py-4 text-sm last:border-b-0"><span className="font-medium text-foreground">{item.name}</span><span>{item.generic}</span><span>{item.group}</span><span>{item.manufacturer}</span><span>{item.batch}</span><span className="text-[#5a49d6]">Active</span></div>)}</div>
        </section>
      ) : null}

      {view === "stock" ? (
        <section className="glass-panel rounded-[30px] border border-[#f0ddb8] p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><h3 className="font-display text-2xl text-foreground">Stock Details</h3><p className="mt-1 text-sm text-muted-foreground">Total Qty : {totalStock}</p></div><div className="flex items-center gap-2 rounded-full border border-[#dfd4bb] bg-white px-4 py-2 text-sm text-muted-foreground"><Search className="h-4 w-4" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search stock" className="w-full bg-transparent outline-none" /></div></div>
          <div className="mt-5 overflow-hidden rounded-[24px] border border-[#eadfc8] bg-white/70"><div className="grid grid-cols-[1.1fr,0.7fr,0.7fr,0.7fr,0.7fr,0.8fr,0.6fr] gap-4 border-b border-[#eadfc8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"><span>Medicine Name</span><span>Generic</span><span>Group</span><span>MFG</span><span>Location</span><span>Available Stock</span><span>Action</span></div>{filteredMedicines.map((item) => <div key={item.id} className="grid grid-cols-[1.1fr,0.7fr,0.7fr,0.7fr,0.7fr,0.8fr,0.6fr] gap-4 border-b border-[#f3ead8] px-4 py-4 text-sm last:border-b-0"><span className="font-medium text-foreground">{item.name}</span><span>{item.generic}</span><span>{item.group}</span><span>{item.manufacturer}</span><span>{item.location}</span><span>{item.stock}</span><span className="text-[#5a49d6]">View</span></div>)}</div>
        </section>
      ) : null}

      {view === "sales" ? (
        <div className="space-y-6">
          <section className="glass-panel rounded-[30px] border border-[#f0ddb8] p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><h3 className="font-display text-2xl text-foreground">Sales Invoice</h3><div className="flex flex-col gap-3 sm:flex-row"><div className="flex items-center gap-2 rounded-full border border-[#dfd4bb] bg-white px-4 py-2 text-sm text-muted-foreground"><Search className="h-4 w-4" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or mobile number" className="w-full bg-transparent outline-none" /></div><button onClick={() => setShowSaleForm((current) => !current)} className="inline-flex items-center gap-2 rounded-full bg-[#5a49d6] px-4 py-2.5 text-sm font-medium text-white"><Plus className="h-4 w-4" />Add New Sales Invoice</button></div></div>
            {showSaleForm ? (
              <div className="mt-5 space-y-4 rounded-[24px] border border-[#eadfc8] bg-white/80 p-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <label className="text-sm font-medium text-foreground">
                    Patient name
                    <input
                      value={saleForm.patientName}
                      onChange={(event) => setSaleForm((current) => ({ ...current, patientName: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                    />
                  </label>
                  <label className="text-sm font-medium text-foreground">
                    Contact no
                    <input
                      value={saleForm.contactNo}
                      onChange={(event) => setSaleForm((current) => ({ ...current, contactNo: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                    />
                  </label>
                  <label className="text-sm font-medium text-foreground">
                    Type
                    <select
                      value={saleForm.type}
                      onChange={(event) => setSaleForm((current) => ({ ...current, type: event.target.value as "OPD" | "OTC" }))}
                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                    >
                      <option value="OTC">OTC</option>
                      <option value="OPD">OPD</option>
                    </select>
                  </label>
                </div>

                <div className="space-y-3">
                  {saleForm.items.map((row, index) => {
                    const selectedMedicine = data.pharmacyMedicines.find((item) => item.id === row.medicineId);
                    const qty = Math.max(1, Number(row.qty) || 1);
                    const lineTotal = selectedMedicine ? qty * selectedMedicine.unitPrice : 0;

                    return (
                      <div key={row.key} className="grid gap-4 rounded-[20px] border border-[#eadfc8] bg-[#fffaf1] p-4 md:grid-cols-[1.3fr,0.55fr,0.7fr,auto]">
                        <label className="text-sm font-medium text-foreground">
                          Medicine {index + 1}
                          <select
                            value={row.medicineId}
                            onChange={(event) => updateSaleItem(row.key, { medicineId: event.target.value })}
                            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                          >
                            <option value="">Select medicine</option>
                            {data.pharmacyMedicines.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({item.stock} in stock)
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-sm font-medium text-foreground">
                          Qty
                          <input
                            type="number"
                            min="1"
                            value={row.qty}
                            onChange={(event) => updateSaleItem(row.key, { qty: event.target.value })}
                            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                          />
                        </label>
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium text-foreground">Line total</p>
                          <p className="mt-2">{selectedMedicine ? formatMoney(lineTotal) : "-"}</p>
                          <p className="mt-1 text-xs">{selectedMedicine ? `Stock left: ${selectedMedicine.stock}` : "Choose medicine"}</p>
                        </div>
                        <div className="flex items-end gap-2">
                          <button
                            onClick={addSaleItemRow}
                            type="button"
                            className="rounded-full border border-[#d8ccff] bg-white px-3 py-2 text-xs font-medium text-[#5a49d6]"
                          >
                            Add row
                          </button>
                          <button
                            onClick={() => removeSaleItemRow(row.key)}
                            type="button"
                            className="rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-4 rounded-[20px] bg-[#f5f1ff] px-4 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Invoice summary</p>
                    <p className="mt-1 text-sm text-muted-foreground">{salePreviewItems.length} medicines selected</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-muted-foreground">Estimated total</p>
                    <p className="font-display text-3xl text-[#5a49d6]">{formatMoney(saleDraftTotal)}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={createSale} className="rounded-full bg-[#5a49d6] px-5 py-2.5 text-sm font-medium text-white">Generate Pharmacy Bill</button>
                  <button onClick={() => { setShowSaleForm(false); resetSaleForm(); }} className="rounded-full border border-[#d8ccff] bg-white px-5 py-2.5 text-sm font-medium text-[#5a49d6]">Cancel</button>
                </div>
              </div>
            ) : null}
            <div className="mt-5 overflow-hidden rounded-[24px] border border-[#eadfc8] bg-white/70"><div className="grid grid-cols-[1fr,0.6fr,0.8fr,1fr,0.8fr,0.9fr,0.6fr] gap-4 border-b border-[#eadfc8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"><span>Sales Invoice Id</span><span>Type</span><span>Patient Id</span><span>Patient Name</span><span>Contact No</span><span>Total Amount</span><span>Action</span></div>{filteredSales.map((invoice) => <div key={invoice.id} className="grid grid-cols-[1fr,0.6fr,0.8fr,1fr,0.8fr,0.9fr,0.6fr] gap-4 border-b border-[#f3ead8] px-4 py-4 text-sm last:border-b-0"><span className="font-medium text-[#5a49d6]">{invoice.invoiceNo}</span><span>{invoice.type}</span><span>{invoice.patientId}</span><span>{invoice.patientName}</span><span>{invoice.contactNo}</span><span>{formatMoney(invoice.totalAmount)}</span><button onClick={() => setSelectedSaleId(invoice.id)} className="rounded-full border border-[#d8ccff] bg-white px-3 py-1.5 text-xs font-medium text-[#5a49d6]">View</button></div>)}</div>
          </section>

          {selectedSale ? (
            <ClinicInvoicePreview
              badge="Pharmacy Invoice Preview"
              title="Sales Bill"
              invoiceNo={selectedSale.invoiceNo}
              invoiceDate={formatDate(selectedSale.date)}
              status={selectedSale.paymentStatus}
              patientRows={[
                { label: "Patient Name", value: selectedSale.patientName },
                { label: "Patient ID", value: selectedSale.patientId },
                { label: "Phone", value: selectedSale.contactNo },
                { label: "Sale Type", value: selectedSale.type },
              ]}
              billingRows={[
                { label: "Clinic", value: clinicBrand.name },
                { label: "Department", value: "Pharmacy / Sales Desk" },
                { label: "Address", value: clinicBrand.address },
                { label: "Doctor", value: clinicBrand.doctorName },
              ]}
              items={selectedSale.items.map((item) => ({
                id: `${selectedSale.id}-${item.medicineId}`,
                label: item.name,
                meta: "Medicine / pharmacy dispensed item",
                qty: item.qty,
                rate: formatMoney(item.price),
                total: formatMoney(item.qty * item.price),
              }))}
              summaryRows={[
                { label: "Subtotal", value: formatMoney(selectedSale.totalAmount) },
                {
                  label: selectedSale.paymentStatus === "due" ? "Outstanding" : "Paid Amount",
                  value: formatMoney(selectedSale.totalAmount),
                  tone: selectedSale.paymentStatus === "due" ? "warning" : "success",
                },
                { label: "Grand Total", value: formatMoney(selectedSale.totalAmount) },
              ]}
              note="This pharmacy bill is issued by Sharma Cosmo Clinic. Medicines once dispensed should be checked immediately at the counter."
              onPrint={() => window.print()}
            />
          ) : null}
        </div>
      ) : null}

      {view === "purchase" ? (
        <section className="glass-panel rounded-[30px] border border-[#f0ddb8] p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">
          <h3 className="font-display text-2xl text-foreground">Purchase Invoice Master</h3>
          <div className="mt-5 overflow-hidden rounded-[24px] border border-[#eadfc8] bg-white/70"><div className="grid grid-cols-[1fr,0.9fr,1fr,0.8fr,0.8fr,0.7fr] gap-4 border-b border-[#eadfc8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"><span>Invoice ID</span><span>Supplier ID</span><span>Supplier Name</span><span>Date</span><span>Amount</span><span>Payment</span></div>{data.pharmacyPurchases.map((invoice) => <div key={invoice.id} className="grid grid-cols-[1fr,0.9fr,1fr,0.8fr,0.8fr,0.7fr] gap-4 border-b border-[#f3ead8] px-4 py-4 text-sm last:border-b-0"><span className="font-medium text-[#5a49d6]">{invoice.invoiceNo}</span><span>{invoice.supplierId}</span><span>{invoice.supplierName}</span><span>{invoice.date}</span><span>{formatMoney(invoice.amount)}</span><span className="capitalize">{invoice.paymentStatus}</span></div>)}</div>
        </section>
      ) : null}

      {view === "reports" ? (
        <section className="glass-panel rounded-[30px] border border-[#f0ddb8] p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">
          <h3 className="font-display text-2xl text-foreground">Medicine Expiring Soon</h3>
          <div className="mt-5 overflow-hidden rounded-[24px] border border-[#eadfc8] bg-white/70"><div className="grid grid-cols-[1.2fr,0.8fr,0.8fr,0.8fr,0.7fr] gap-4 border-b border-[#eadfc8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"><span>Medicine Name</span><span>Batch</span><span>Expire Date</span><span>Remaining Days</span><span>Available Stock</span></div>{expiringSoon.map((item) => <div key={item.id} className="grid grid-cols-[1.2fr,0.8fr,0.8fr,0.8fr,0.7fr] gap-4 border-b border-[#f3ead8] px-4 py-4 text-sm last:border-b-0"><span className="font-medium text-foreground">{item.name}</span><span>{item.batch}</span><span>{item.expiryDate}</span><span>{Math.max(0, Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} Days</span><span>{item.stock}</span></div>)}</div>
        </section>
      ) : null}
    </div>
  );
};

export default PharmacyPanel;




