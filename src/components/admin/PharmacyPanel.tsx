import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import ClinicInvoicePreview from "@/components/admin/ClinicInvoicePreview";
import {
  addPharmacyMedicine,
  addPharmacyPurchaseInvoice,
  createPatientId,
  createPharmacySaleInvoice,
  deletePharmacyMedicine,
  readClinicAdminData,
  subscribeClinicAdminData,
  updatePharmacyMedicine,
  type ClinicAdminData,
  type PharmacyMedicine,
} from "@/lib/clinicAdminStore";
import type { AppointmentRecord } from "@/lib/appointmentStore";
import { clinicBrand } from "@/lib/clinicBrand";
import { cn } from "@/lib/utils";

type PharmacyPanelProps = {
  appointments: AppointmentRecord[];
};

type PharmacyView = "dashboard" | "masters" | "stock" | "sales" | "purchase" | "reports";
type ItemRow = { key: string; medicineId: string; medicineSearch: string; medicineSearchApplied: string; qty: string; price: string };
type MedicineFormState = {
  name: string;
  generic: string;
  group: string;
  manufacturer: string;
  batch: string;
  expiryDate: string;
  stock: string;
  location: string;
  unitPrice: string;
};

const formatMoney = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const formatDate = (value: string) => new Date(`${value}T10:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const createItemRow = (): ItemRow => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  medicineId: "",
  medicineSearch: "",
  medicineSearchApplied: "",
  qty: "1",
  price: "",
});
const emptyMedicineForm = (): MedicineFormState => ({ name: "", generic: "", group: "", manufacturer: "", batch: "", expiryDate: "", stock: "", location: "", unitPrice: "" });
const mapMedicineToForm = (medicine: PharmacyMedicine): MedicineFormState => ({
  name: medicine.name,
  generic: medicine.generic,
  group: medicine.group,
  manufacturer: medicine.manufacturer,
  batch: medicine.batch,
  expiryDate: medicine.expiryDate,
  stock: String(medicine.stock),
  location: medicine.location,
  unitPrice: String(medicine.unitPrice),
});

const Surface = ({ children }: { children: ReactNode }) => (
  <section className="glass-panel rounded-[30px] border border-[#f0ddb8] bg-white/70 p-5 shadow-[0_24px_60px_-42px_rgba(79,51,8,0.34)] sm:p-6">{children}</section>
);

const SearchField = ({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) => (
  <div className="flex items-center gap-2 rounded-full border border-[#dfd4bb] bg-white px-4 py-2 text-sm text-muted-foreground">
    <Search className="h-4 w-4" />
    <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full bg-transparent outline-none" />
  </div>
);

const PharmacyPanel = ({ appointments }: PharmacyPanelProps) => {
  const [view, setView] = useState<PharmacyView>("dashboard");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<ClinicAdminData>(readClinicAdminData());
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(readClinicAdminData().pharmacySales[0]?.id ?? null);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(readClinicAdminData().pharmacyPurchases[0]?.id ?? null);
  const [editingMedicineId, setEditingMedicineId] = useState<string | null>(null);
  const [medicineForm, setMedicineForm] = useState<MedicineFormState>(emptyMedicineForm());
  const [saleForm, setSaleForm] = useState({ patientName: "", contactNo: "", type: "OTC" as "OPD" | "OTC", discount: 0, items: [createItemRow()] });
  const [purchaseForm, setPurchaseForm] = useState({ supplierId: "", supplierName: "", contactNo: "", date: new Date().toISOString().slice(0, 10), paymentStatus: "paid" as "paid" | "partial" | "due", items: [createItemRow()] });

  useEffect(() => {
    const syncData = () => setData(readClinicAdminData());
    syncData();
    return subscribeClinicAdminData(syncData);
  }, []);

  const term = search.trim().toLowerCase();
  const filteredMedicines = data.pharmacyMedicines.filter((medicine) => !term || [medicine.name, medicine.generic, medicine.batch].some((value) => value.toLowerCase().includes(term)));
  const filteredSales = data.pharmacySales.filter((invoice) => !term || [invoice.patientName, invoice.invoiceNo, invoice.contactNo].some((value) => value.toLowerCase().includes(term)));
  const filteredPurchases = data.pharmacyPurchases.filter((invoice) => !term || [invoice.supplierName, invoice.invoiceNo, invoice.contactNo].some((value) => value.toLowerCase().includes(term)));
  const expiringSoon = useMemo(() => [...data.pharmacyMedicines].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()).slice(0, 8), [data.pharmacyMedicines]);
  const selectedSale = data.pharmacySales.find((invoice) => invoice.id === selectedSaleId) ?? data.pharmacySales[0] ?? null;
  const selectedPurchase = data.pharmacyPurchases.find((invoice) => invoice.id === selectedPurchaseId) ?? data.pharmacyPurchases[0] ?? null;
  const totalStock = data.pharmacyMedicines.reduce((sum, item) => sum + item.stock, 0);
  const dueSales = data.pharmacySales.filter((item) => item.paymentStatus === "due").length;
  const linkedPatients = new Set(appointments.map((item) => item.phone)).size;

  const salePreviewItems = saleForm.items.map((row) => {
    const medicine = data.pharmacyMedicines.find((item) => item.id === row.medicineId);
    if (!medicine) return null;
    const qty = Math.max(1, Number(row.qty) || 1);
    return { key: row.key, medicineId: medicine.id, name: medicine.name, qty, price: medicine.unitPrice, stock: medicine.stock, total: qty * medicine.unitPrice };
  }).filter(Boolean) as Array<{ key: string; medicineId: string; name: string; qty: number; price: number; stock: number; total: number }>;

  const purchasePreviewItems = purchaseForm.items.map((row) => {
    const medicine = data.pharmacyMedicines.find((item) => item.id === row.medicineId);
    if (!medicine) return null;
    const qty = Math.max(1, Number(row.qty) || 1);
    const price = Math.max(0, Number(row.price) || 0);
    return { key: row.key, medicineId: medicine.id, name: medicine.name, qty, price, total: qty * price };
  }).filter(Boolean) as Array<{ key: string; medicineId: string; name: string; qty: number; price: number; total: number }>;

  const saleDraftTotal = Math.max(0, salePreviewItems.reduce((sum, item) => sum + item.total, 0) - saleForm.discount);
  const purchaseDraftTotal = purchasePreviewItems.reduce((sum, item) => sum + item.total, 0);

  const resetMedicineForm = () => {
    setEditingMedicineId(null);
    setMedicineForm(emptyMedicineForm());
  };
  const resetSaleForm = () => setSaleForm({ patientName: "", contactNo: "", type: "OTC", discount: 0, items: [createItemRow()] });
  const resetPurchaseForm = () => setPurchaseForm({ supplierId: "", supplierName: "", contactNo: "", date: new Date().toISOString().slice(0, 10), paymentStatus: "paid", items: [createItemRow()] });

  const updateRows = (type: "sale" | "purchase", key: string, patch: Partial<ItemRow>) => {
    if (type === "sale") {
      setSaleForm((current) => ({ ...current, items: current.items.map((item) => (item.key === key ? { ...item, ...patch } : item)) }));
      return;
    }
    setPurchaseForm((current) => ({ ...current, items: current.items.map((item) => (item.key === key ? { ...item, ...patch } : item)) }));
  };

  const addRow = (type: "sale" | "purchase") => {
    if (type === "sale") {
      setSaleForm((current) => ({ ...current, items: [...current.items, createItemRow()] }));
      return;
    }
    setPurchaseForm((current) => ({ ...current, items: [...current.items, createItemRow()] }));
  };

  const removeRow = (type: "sale" | "purchase", key: string) => {
    if (type === "sale") {
      setSaleForm((current) => ({ ...current, items: current.items.length > 1 ? current.items.filter((item) => item.key !== key) : [createItemRow()] }));
      return;
    }
    setPurchaseForm((current) => ({ ...current, items: current.items.length > 1 ? current.items.filter((item) => item.key !== key) : [createItemRow()] }));
  };

  const saveMedicine = async () => {
    if (!medicineForm.name.trim() || !medicineForm.expiryDate || !medicineForm.stock || !medicineForm.unitPrice) {
      toast.error("Fill medicine name, expiry, stock and price.");
      return;
    }
    const payload = {
      name: medicineForm.name.trim(),
      generic: medicineForm.generic.trim() || "-",
      group: medicineForm.group.trim() || "-",
      manufacturer: medicineForm.manufacturer.trim() || "-",
      batch: medicineForm.batch.trim() || "-",
      expiryDate: medicineForm.expiryDate,
      stock: Number(medicineForm.stock),
      location: medicineForm.location.trim() || "Main Rack",
      unitPrice: Number(medicineForm.unitPrice),
    };

    try {
      if (editingMedicineId) {
        await updatePharmacyMedicine(editingMedicineId, payload);
        toast.success("Medicine updated in pharmacy master.");
      } else {
        await addPharmacyMedicine(payload);
        toast.success("Medicine added to pharmacy master.");
      }
      setShowMedicineForm(false);
      resetMedicineForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save medicine.");
    }
  };

  const editMedicine = (medicine: PharmacyMedicine) => {
    setEditingMedicineId(medicine.id);
    setMedicineForm(mapMedicineToForm(medicine));
    setShowMedicineForm(true);
  };

  const removeMedicine = async (medicineId: string, medicineName: string) => {
    if (!window.confirm(`Delete ${medicineName} from pharmacy master? Existing bills will stay in records.`)) {
      return;
    }

    try {
      await deletePharmacyMedicine(medicineId);
      if (editingMedicineId === medicineId) {
        setShowMedicineForm(false);
        resetMedicineForm();
      }
      toast.success(`${medicineName} deleted from pharmacy master.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete medicine.");
    }
  };

  const createSale = async () => {
    if (!saleForm.patientName.trim() || !saleForm.contactNo.trim()) {
      toast.error("Enter patient details first.");
      return;
    }
    if (salePreviewItems.length === 0) {
      toast.error("Add at least one medicine.");
      return;
    }
    const invalid = salePreviewItems.find((item) => item.qty > item.stock);
    if (invalid) {
      toast.error(`${invalid.name} has only ${invalid.stock} units available.`);
      return;
    }
    try {
      const invoice = await createPharmacySaleInvoice({
        patientId: createPatientId(saleForm.contactNo),
        patientName: saleForm.patientName.trim(),
        contactNo: saleForm.contactNo.trim(),
        date: new Date().toISOString().slice(0, 10),
        paymentStatus: saleForm.type === "OPD" ? "due" : "paid",
        type: saleForm.type,
        discount: saleForm.discount,
        items: salePreviewItems.map((item) => ({ medicineId: item.medicineId, name: item.name, qty: item.qty, price: item.price })),
      });
      setSelectedSaleId(invoice.id);
      setShowSaleForm(false);
      resetSaleForm();
      toast.success(`Pharmacy invoice ${invoice.invoiceNo} created.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create pharmacy invoice.");
    }
  };

  const createPurchase = async () => {
    if (!purchaseForm.supplierName.trim() || !purchaseForm.contactNo.trim()) {
      toast.error("Enter supplier details first.");
      return;
    }
    if (purchasePreviewItems.length === 0) {
      toast.error("Add at least one medicine in purchase.");
      return;
    }
    const invalid = purchasePreviewItems.find((item) => item.price <= 0);
    if (invalid) {
      toast.error(`Enter a valid rate for ${invalid.name}.`);
      return;
    }
    try {
      const invoice = await addPharmacyPurchaseInvoice({
        supplierId: purchaseForm.supplierId.trim() || `SUP-${purchaseForm.contactNo.slice(-4).padStart(4, "0")}`,
        supplierName: purchaseForm.supplierName.trim(),
        contactNo: purchaseForm.contactNo.trim(),
        date: purchaseForm.date,
        paymentStatus: purchaseForm.paymentStatus,
        items: purchasePreviewItems.map((item) => ({ medicineId: item.medicineId, name: item.name, qty: item.qty, price: item.price })),
      });
      setSelectedPurchaseId(invoice.id);
      setShowPurchaseForm(false);
      resetPurchaseForm();
      toast.success(`Purchase invoice ${invoice.invoiceNo} created and stock updated.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create purchase invoice.");
    }
  };

  const renderItemEditor = (type: "sale" | "purchase", rows: ItemRow[]) => (
    <div className="space-y-3">
      {rows.map((row, index) => {
        const selectedMedicine = data.pharmacyMedicines.find((item) => item.id === row.medicineId);
        const medicineSearchTerm = row.medicineSearchApplied.trim().toLowerCase();
        const medicineOptions = data.pharmacyMedicines.filter((item) => !medicineSearchTerm || [item.name, item.generic, item.batch].some((value) => value.toLowerCase().includes(medicineSearchTerm)));
        const qty = Math.max(1, Number(row.qty) || 1);
        const price = type === "sale" ? selectedMedicine?.unitPrice || 0 : Math.max(0, Number(row.price) || 0);
        const lineTotal = qty * price;

        return (
          <div key={row.key} className={cn("grid gap-4 rounded-[20px] border border-[#eadfc8] bg-[#fffaf1] p-4", type === "sale" ? "md:grid-cols-[1.3fr,0.55fr,0.7fr,auto]" : "md:grid-cols-[1.15fr,0.5fr,0.6fr,auto]")}>
            <label className="text-sm font-medium text-foreground">
              Medicine {index + 1}
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={row.medicineSearch}
                  onChange={(event) => updateRows(type, row.key, { medicineSearch: event.target.value })}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      updateRows(type, row.key, { medicineSearchApplied: row.medicineSearch });
                    }
                  }}
                  placeholder="Search by name, generic or batch"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => updateRows(type, row.key, { medicineSearchApplied: row.medicineSearch })}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#d8ccff] bg-white px-3 text-xs font-medium text-[#5a49d6] transition hover:bg-[#f5f1ff]"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search
                </button>
              </div>
              <select
                value={row.medicineId}
                onChange={(event) => {
                  const medicine = data.pharmacyMedicines.find((item) => item.id === event.target.value);
                  updateRows(type, row.key, {
                    medicineId: event.target.value,
                    medicineSearch: medicine ? medicine.name : "",
                    medicineSearchApplied: medicine ? medicine.name : "",
                    ...(type === "purchase" ? { price: medicine ? String(medicine.unitPrice) : row.price } : {}),
                  });
                }}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
              >
                <option value="">Select medicine</option>
                {medicineOptions.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.stock} in stock)</option>)}
              </select>
              {medicineOptions.length === 0 && medicineSearchTerm ? <p className="mt-1 text-xs text-muted-foreground">No medicine found for this search.</p> : null}
            </label>
            <label className="text-sm font-medium text-foreground">
              Qty
              <input type="number" min="1" value={row.qty} onChange={(event) => updateRows(type, row.key, { qty: event.target.value })} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" />
            </label>
            {type === "purchase" ? (
              <label className="text-sm font-medium text-foreground">
                Rate
                <input type="number" min="0" value={row.price} onChange={(event) => updateRows(type, row.key, { price: event.target.value })} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" />
              </label>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Line total</p>
                <p className="mt-2">{selectedMedicine ? formatMoney(lineTotal) : "-"}</p>
                <p className="mt-1 text-xs">{selectedMedicine ? `Stock left: ${selectedMedicine.stock}` : "Choose medicine"}</p>
              </div>
            )}
            <div className="flex items-end gap-2">
              {type === "purchase" ? <div className="min-w-[92px] rounded-[18px] bg-white px-3 py-3 text-sm"><p className="font-medium text-foreground">Total</p><p className="mt-1">{selectedMedicine ? formatMoney(lineTotal) : "-"}</p></div> : null}
              <button type="button" onClick={() => addRow(type)} className="rounded-full border border-[#d8ccff] bg-white px-3 py-2 text-xs font-medium text-[#5a49d6]">Add row</button>
              <button type="button" onClick={() => removeRow(type, row.key)} className="rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-700">Remove</button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-[#cdb8ff] bg-[linear-gradient(90deg,rgba(73,81,214,0.96),rgba(158,52,255,0.94))] p-5 text-white shadow-[0_24px_60px_-40px_rgba(66,43,133,0.45)] sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div><p className="text-sm uppercase tracking-[0.18em] text-white/80">Pharmacy panel</p><h2 className="mt-2 font-display text-4xl">Pharmacy Dashboard</h2><p className="mt-2 text-sm text-white/80">Masters, stock, sales, purchase and expiry reports aligned to Sharma Cosmo Clinic workflows.</p></div>
          <div className="grid gap-3 sm:grid-cols-4 xl:w-[640px]">
            <div className="rounded-[22px] bg-white/12 px-4 py-4"><p className="text-xs uppercase tracking-[0.16em] text-white/70">Purchase</p><p className="mt-2 font-display text-3xl">{data.pharmacyPurchases.length}</p></div>
            <div className="rounded-[22px] bg-white/12 px-4 py-4"><p className="text-xs uppercase tracking-[0.16em] text-white/70">Sales</p><p className="mt-2 font-display text-3xl">{data.pharmacySales.length}</p></div>
            <div className="rounded-[22px] bg-white/12 px-4 py-4"><p className="text-xs uppercase tracking-[0.16em] text-white/70">Stock Qty</p><p className="mt-2 font-display text-3xl">{totalStock}</p></div>
            <div className="rounded-[22px] bg-white/12 px-4 py-4"><p className="text-xs uppercase tracking-[0.16em] text-white/70">Due Sales</p><p className="mt-2 font-display text-3xl">{dueSales}</p><p className="mt-1 text-xs text-white/70">{linkedPatients} linked patients</p></div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {(["dashboard", "masters", "stock", "sales", "purchase", "reports"] as const).map((key) => (
          <button key={key} onClick={() => setView(key)} className={cn("rounded-full border px-4 py-2 text-sm font-medium transition", view === key ? "border-[#5a49d6] bg-[#5a49d6] text-white" : "border-[#eadfc8] bg-[#fffaf1] text-muted-foreground hover:text-foreground")}>{key[0].toUpperCase() + key.slice(1)}</button>
        ))}
      </div>

      {view === "dashboard" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Surface>
            <h3 className="font-display text-2xl text-foreground">Quick modules</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{(["masters", "stock", "sales", "purchase"] as const).map((key) => <button key={key} onClick={() => setView(key)} className="rounded-[24px] border border-[#eadfc8] bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"><p className="font-semibold text-foreground">{key[0].toUpperCase() + key.slice(1)}</p><p className="mt-2 text-sm text-muted-foreground">Open {key} workflow</p></button>)}</div>
          </Surface>
          <Surface>
            <h3 className="font-display text-2xl text-foreground">Expiring soon</h3>
            <div className="mt-4 space-y-3">{expiringSoon.map((item) => <div key={item.id} className="flex items-center justify-between rounded-[20px] border border-[#eadfc8] bg-white/80 px-4 py-3"><div><p className="font-medium text-foreground">{item.name}</p><p className="text-sm text-muted-foreground">Batch {item.batch}</p></div><div className="text-right"><p className="text-sm font-medium text-foreground">{item.expiryDate}</p><p className="text-xs text-muted-foreground">Stock {item.stock}</p></div></div>)}</div>
          </Surface>
        </div>
      ) : null}

      {view === "masters" ? (
        <Surface>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><h3 className="font-display text-2xl text-foreground">Medicine Master</h3><div className="flex flex-col gap-3 sm:flex-row"><SearchField value={search} onChange={setSearch} placeholder="Search medicine" /><button onClick={() => { if (showMedicineForm && !editingMedicineId) { setShowMedicineForm(false); resetMedicineForm(); return; } resetMedicineForm(); setShowMedicineForm(true); }} className="inline-flex items-center gap-2 rounded-full bg-[#5a49d6] px-4 py-2.5 text-sm font-medium text-white"><Plus className="h-4 w-4" />Add New Medicine</button></div></div>
          {showMedicineForm ? <div className="mt-5 rounded-[24px] border border-[#eadfc8] bg-white/80 p-5"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{editingMedicineId ? "Edit medicine" : "Add medicine"}</p><p className="mt-1 text-sm text-muted-foreground">{editingMedicineId ? "Update medicine details and save changes." : "Create a new medicine entry for pharmacy master."}</p></div>{editingMedicineId ? <button type="button" onClick={() => resetMedicineForm()} className="rounded-full border border-[#d8ccff] bg-white px-4 py-2 text-xs font-medium text-[#5a49d6]">Switch to Add New</button> : null}</div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Object.entries(medicineForm).map(([key, value]) => <label key={key} className="text-sm font-medium text-foreground capitalize">{key}<input type={key === "expiryDate" ? "date" : key === "stock" || key === "unitPrice" ? "number" : "text"} value={value} onChange={(event) => setMedicineForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" /></label>)}</div><div className="mt-5 flex gap-3"><button onClick={saveMedicine} className="rounded-full bg-[#5a49d6] px-5 py-2.5 text-sm font-medium text-white">{editingMedicineId ? "Update Medicine" : "Save Medicine"}</button><button onClick={() => { setShowMedicineForm(false); resetMedicineForm(); }} className="rounded-full border border-[#d8ccff] bg-white px-5 py-2.5 text-sm font-medium text-[#5a49d6]">Cancel</button></div></div> : null}
          <div className="mt-5 overflow-hidden rounded-[24px] border border-[#eadfc8] bg-white/70">
            <div className="grid grid-cols-[1.1fr,0.9fr,0.8fr,0.8fr,0.8fr,1fr] gap-4 border-b border-[#eadfc8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <span>Medicine</span>
              <span>Generic</span>
              <span>Group</span>
              <span>MFG</span>
              <span>Batch</span>
              <span>Action</span>
            </div>
            {filteredMedicines.length > 0 ? filteredMedicines.map((item) => (
              <div key={item.id} className="grid grid-cols-[1.1fr,0.9fr,0.8fr,0.8fr,0.8fr,1fr] gap-4 border-b border-[#f3ead8] px-4 py-4 text-sm last:border-b-0">
                <span className="font-medium text-foreground">{item.name}</span>
                <span>{item.generic}</span>
                <span>{item.group}</span>
                <span>{item.manufacturer}</span>
                <span>{item.batch}</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => editMedicine(item)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d8ccff] bg-white px-3 py-1.5 text-xs font-medium text-[#5a49d6] transition hover:bg-[#f5f1ff]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMedicine(item.id, item.name)}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            )) : (
              <div className="px-4 py-8 text-sm text-muted-foreground">No medicine records found.</div>
            )}
          </div>
        </Surface>
      ) : null}

      {view === "stock" ? (
        <Surface>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><h3 className="font-display text-2xl text-foreground">Stock Details</h3><p className="mt-1 text-sm text-muted-foreground">Total Qty : {totalStock}</p></div><SearchField value={search} onChange={setSearch} placeholder="Search stock" /></div>
          <div className="mt-5 overflow-hidden rounded-[24px] border border-[#eadfc8] bg-white/70"><div className="grid grid-cols-[1.1fr,0.7fr,0.7fr,0.7fr,0.7fr,0.8fr] gap-4 border-b border-[#eadfc8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"><span>Medicine</span><span>Generic</span><span>Group</span><span>MFG</span><span>Location</span><span>Stock</span></div>{filteredMedicines.map((item) => <div key={item.id} className="grid grid-cols-[1.1fr,0.7fr,0.7fr,0.7fr,0.7fr,0.8fr] gap-4 border-b border-[#f3ead8] px-4 py-4 text-sm last:border-b-0"><span className="font-medium text-foreground">{item.name}</span><span>{item.generic}</span><span>{item.group}</span><span>{item.manufacturer}</span><span>{item.location}</span><span>{item.stock}</span></div>)}</div>
        </Surface>
      ) : null}

      {view === "sales" ? (
        <div className="space-y-6">
          <Surface>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><h3 className="font-display text-2xl text-foreground">Sales Invoice</h3><div className="flex flex-col gap-3 sm:flex-row"><SearchField value={search} onChange={setSearch} placeholder="Search patient or invoice" /><button onClick={() => setShowSaleForm((current) => !current)} className="inline-flex items-center gap-2 rounded-full bg-[#5a49d6] px-4 py-2.5 text-sm font-medium text-white"><Plus className="h-4 w-4" />Add New Sales Invoice</button></div></div>
            {showSaleForm ? <div className="mt-5 space-y-4 rounded-[24px] border border-[#eadfc8] bg-white/80 p-5"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><label className="text-sm font-medium text-foreground">Patient name<input value={saleForm.patientName} onChange={(event) => setSaleForm((current) => ({ ...current, patientName: event.target.value }))} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" /></label><label className="text-sm font-medium text-foreground">Contact no<input value={saleForm.contactNo} onChange={(event) => setSaleForm((current) => ({ ...current, contactNo: event.target.value }))} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" /></label><label className="text-sm font-medium text-foreground">Type<select value={saleForm.type} onChange={(event) => setSaleForm((current) => ({ ...current, type: event.target.value as "OPD" | "OTC" }))} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"><option value="OTC">OTC</option><option value="OPD">OPD</option></select></label><label className="text-sm font-medium text-foreground">Discount (₹)<input type="number" min="0" value={saleForm.discount} onChange={(event) => setSaleForm((current) => ({ ...current, discount: Number(event.target.value) || 0 }))} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" /></label></div>{renderItemEditor("sale", saleForm.items)}<div className="flex flex-col gap-4 rounded-[20px] bg-[#f5f1ff] px-4 py-4 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-medium text-foreground">Invoice summary</p><p className="mt-1 text-sm text-muted-foreground">{salePreviewItems.length} medicines selected</p></div><div className="text-left md:text-right"><p className="text-sm text-muted-foreground">Subtotal: {formatMoney(salePreviewItems.reduce((sum, item) => sum + item.total, 0))}</p><p className="text-sm text-muted-foreground">Discount: {formatMoney(saleForm.discount)}</p><p className="text-sm text-muted-foreground">Estimated total</p><p className="font-display text-3xl text-[#5a49d6]">{formatMoney(saleDraftTotal)}</p></div></div><div className="flex gap-3"><button onClick={createSale} className="rounded-full bg-[#5a49d6] px-5 py-2.5 text-sm font-medium text-white">Generate Pharmacy Bill</button><button onClick={() => { setShowSaleForm(false); resetSaleForm(); }} className="rounded-full border border-[#d8ccff] bg-white px-5 py-2.5 text-sm font-medium text-[#5a49d6]">Cancel</button></div></div> : null}
            <div className="mt-5 overflow-hidden rounded-[24px] border border-[#eadfc8] bg-white/70"><div className="grid grid-cols-[1fr,0.6fr,0.8fr,1fr,0.8fr,0.9fr,0.6fr] gap-4 border-b border-[#eadfc8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"><span>Invoice Id</span><span>Type</span><span>Patient Id</span><span>Patient Name</span><span>Contact</span><span>Total</span><span>Action</span></div>{filteredSales.length > 0 ? filteredSales.map((invoice) => <div key={invoice.id} className="grid grid-cols-[1fr,0.6fr,0.8fr,1fr,0.8fr,0.9fr,0.6fr] gap-4 border-b border-[#f3ead8] px-4 py-4 text-sm last:border-b-0"><span className="font-medium text-[#5a49d6]">{invoice.invoiceNo}</span><span>{invoice.type}</span><span>{invoice.patientId}</span><span>{invoice.patientName}</span><span>{invoice.contactNo}</span><span>{formatMoney(invoice.totalAmount)}</span><button onClick={() => setSelectedSaleId(invoice.id)} className="rounded-full border border-[#d8ccff] bg-white px-3 py-1.5 text-xs font-medium text-[#5a49d6]">View</button></div>) : <div className="px-4 py-8 text-sm text-muted-foreground">No sales records yet. Start by creating the first pharmacy bill.</div>}</div>
          </Surface>

          {selectedSale ? <ClinicInvoicePreview badge="Pharmacy Invoice Preview" title="Sales Bill" invoiceNo={selectedSale.invoiceNo} invoiceDate={formatDate(selectedSale.date)} status={selectedSale.paymentStatus} patientRows={[{ label: "Patient Name", value: selectedSale.patientName }, { label: "Patient ID", value: selectedSale.patientId }, { label: "Phone", value: selectedSale.contactNo }, { label: "Sale Type", value: selectedSale.type }]} billingRows={[{ label: "Clinic", value: clinicBrand.name }, { label: "Department", value: "Pharmacy / Sales Desk" }, { label: "Address", value: clinicBrand.address }, { label: "Doctor", value: clinicBrand.doctorName }]} items={selectedSale.items.map((item) => ({ id: `${selectedSale.id}-${item.medicineId}`, label: item.name, meta: "Medicine / pharmacy dispensed item", qty: item.qty, rate: formatMoney(item.price), total: formatMoney(item.qty * item.price) }))} summaryRows={[{ label: "Subtotal", value: formatMoney(selectedSale.items.reduce((sum, item) => sum + item.qty * item.price, 0)) }, { label: "Discount", value: formatMoney(selectedSale.discount) }, { label: selectedSale.paymentStatus === "due" ? "Outstanding" : "Paid Amount", value: formatMoney(selectedSale.totalAmount), tone: selectedSale.paymentStatus === "due" ? "warning" : "success" }, { label: "Grand Total", value: formatMoney(selectedSale.totalAmount) }]} note="This pharmacy bill is issued by Sharma Cosmo Clinic. Medicines once dispensed should be checked immediately at the counter." onPrint={() => window.print()} /> : null}
        </div>
      ) : null}

      {view === "purchase" ? (
        <div className="space-y-6">
          <Surface>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><h3 className="font-display text-2xl text-foreground">Purchase Invoice Master</h3><div className="flex flex-col gap-3 sm:flex-row"><SearchField value={search} onChange={setSearch} placeholder="Search supplier or invoice" /><button onClick={() => setShowPurchaseForm((current) => !current)} className="inline-flex items-center gap-2 rounded-full bg-[#5a49d6] px-4 py-2.5 text-sm font-medium text-white"><Plus className="h-4 w-4" />Add Purchase Invoice</button></div></div>
            {showPurchaseForm ? <div className="mt-5 space-y-4 rounded-[24px] border border-[#eadfc8] bg-white/80 p-5"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><label className="text-sm font-medium text-foreground">Supplier ID<input value={purchaseForm.supplierId} onChange={(event) => setPurchaseForm((current) => ({ ...current, supplierId: event.target.value }))} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" /></label><label className="text-sm font-medium text-foreground">Supplier Name<input value={purchaseForm.supplierName} onChange={(event) => setPurchaseForm((current) => ({ ...current, supplierName: event.target.value }))} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" /></label><label className="text-sm font-medium text-foreground">Contact No<input value={purchaseForm.contactNo} onChange={(event) => setPurchaseForm((current) => ({ ...current, contactNo: event.target.value }))} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" /></label><label className="text-sm font-medium text-foreground">Purchase Date<input type="date" value={purchaseForm.date} onChange={(event) => setPurchaseForm((current) => ({ ...current, date: event.target.value }))} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" /></label></div><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium text-foreground">Payment Status<select value={purchaseForm.paymentStatus} onChange={(event) => setPurchaseForm((current) => ({ ...current, paymentStatus: event.target.value as "paid" | "partial" | "due" }))} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"><option value="paid">Paid</option><option value="partial">Partial</option><option value="due">Due</option></select></label><div className="rounded-[20px] border border-[#eadfc8] bg-[#fffaf1] px-4 py-4"><p className="text-xs uppercase tracking-[0.18em] text-[#9a6a1e]">Purchase Total</p><p className="mt-2 font-display text-3xl text-foreground">{formatMoney(purchaseDraftTotal)}</p><p className="mt-1 text-sm text-muted-foreground">{purchasePreviewItems.length} medicine rows ready</p></div></div>{renderItemEditor("purchase", purchaseForm.items)}<div className="flex gap-3"><button onClick={createPurchase} className="rounded-full bg-[#5a49d6] px-5 py-2.5 text-sm font-medium text-white">Save Purchase Invoice</button><button onClick={() => { setShowPurchaseForm(false); resetPurchaseForm(); }} className="rounded-full border border-[#d8ccff] bg-white px-5 py-2.5 text-sm font-medium text-[#5a49d6]">Cancel</button></div></div> : null}
            <div className="mt-5 overflow-hidden rounded-[24px] border border-[#eadfc8] bg-white/70"><div className="grid grid-cols-[1fr,0.9fr,1fr,0.8fr,0.8fr,0.7fr,0.6fr] gap-4 border-b border-[#eadfc8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"><span>Invoice ID</span><span>Supplier ID</span><span>Supplier Name</span><span>Date</span><span>Amount</span><span>Payment</span><span>Action</span></div>{filteredPurchases.length > 0 ? filteredPurchases.map((invoice) => <div key={invoice.id} className="grid grid-cols-[1fr,0.9fr,1fr,0.8fr,0.8fr,0.7fr,0.6fr] gap-4 border-b border-[#f3ead8] px-4 py-4 text-sm last:border-b-0"><span className="font-medium text-[#5a49d6]">{invoice.invoiceNo}</span><span>{invoice.supplierId}</span><span>{invoice.supplierName}</span><span>{invoice.date}</span><span>{formatMoney(invoice.amount)}</span><span className="capitalize">{invoice.paymentStatus}</span><button onClick={() => setSelectedPurchaseId(invoice.id)} className="rounded-full border border-[#d8ccff] bg-white px-3 py-1.5 text-xs font-medium text-[#5a49d6]">View</button></div>) : <div className="px-4 py-8 text-sm text-muted-foreground">No purchase records yet. Add your first stock purchase when ready.</div>}</div>
          </Surface>

          {selectedPurchase ? <Surface><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><p className="text-sm uppercase tracking-[0.18em] text-[#9a6a1e]">Selected Purchase</p><h3 className="mt-2 font-display text-2xl text-foreground">{selectedPurchase.invoiceNo}</h3><p className="mt-1 text-sm text-muted-foreground">{selectedPurchase.supplierName} • {selectedPurchase.contactNo}</p></div><div className="text-left md:text-right"><p className="text-sm text-muted-foreground">{formatDate(selectedPurchase.date)}</p><p className="mt-2 font-display text-3xl text-foreground">{formatMoney(selectedPurchase.amount)}</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{selectedPurchase.items.map((item) => <div key={`${selectedPurchase.id}-${item.medicineId}`} className="rounded-[22px] border border-[#eadfc8] bg-white/80 px-4 py-4"><p className="font-medium text-foreground">{item.name}</p><p className="mt-1 text-sm text-muted-foreground">Qty {item.qty}</p><p className="mt-1 text-sm text-muted-foreground">Rate {formatMoney(item.price)}</p><p className="mt-2 font-semibold text-[#5a49d6]">{formatMoney(item.qty * item.price)}</p></div>)}</div></Surface> : null}
        </div>
      ) : null}

      {view === "reports" ? (
        <Surface>
          <h3 className="font-display text-2xl text-foreground">Medicine Expiring Soon</h3>
          <div className="mt-5 overflow-hidden rounded-[24px] border border-[#eadfc8] bg-white/70"><div className="grid grid-cols-[1.2fr,0.8fr,0.8fr,0.8fr,0.7fr] gap-4 border-b border-[#eadfc8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"><span>Medicine Name</span><span>Batch</span><span>Expire Date</span><span>Remaining Days</span><span>Stock</span></div>{expiringSoon.map((item) => <div key={item.id} className="grid grid-cols-[1.2fr,0.8fr,0.8fr,0.8fr,0.7fr] gap-4 border-b border-[#f3ead8] px-4 py-4 text-sm last:border-b-0"><span className="font-medium text-foreground">{item.name}</span><span>{item.batch}</span><span>{item.expiryDate}</span><span>{Math.max(0, Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} Days</span><span>{item.stock}</span></div>)}</div>
        </Surface>
      ) : null}
    </div>
  );
};

export default PharmacyPanel;
