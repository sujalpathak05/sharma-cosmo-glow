import type { RealtimeChannel } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import { clinicBrand } from "@/lib/clinicBrand";
import { getConsultationFee, normalizeConsultationMode, type ConsultationMode } from "@/lib/consultationMode";

export type OpdBillItem = {
  label: string;
  qty: number;
  rate: number;
  discount: number;
  gst: number;
  total: number;
};

export type OpdBill = {
  id: string;
  billNo: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  phone: string;
  age: string;
  gender: string;
  doctorName: string;
  doctorSpeciality: string;
  clinicName: string;
  clinicAddress: string;
  date: string;
  status: "paid" | "due" | "refunded";
  paidAmount: number;
  totalAmount: number;
  consultationMode: ConsultationMode | null;
  visitType: string;
  items: OpdBillItem[];
};

export type PharmacyMedicine = {
  id: string;
  name: string;
  generic: string;
  group: string;
  manufacturer: string;
  batch: string;
  expiryDate: string;
  stock: number;
  location: string;
  unitPrice: number;
};

export type PharmacySaleItem = {
  medicineId: string;
  name: string;
  qty: number;
  price: number;
};

export type PharmacySaleInvoice = {
  id: string;
  invoiceNo: string;
  patientId: string;
  patientName: string;
  contactNo: string;
  date: string;
  totalAmount: number;
  discount: number;
  paymentStatus: "paid" | "due";
  type: "OPD" | "OTC";
  items: PharmacySaleItem[];
};

export type PharmacyPurchaseItem = {
  medicineId: string;
  name: string;
  qty: number;
  price: number;
};

export type PharmacyPurchaseInvoice = {
  id: string;
  invoiceNo: string;
  supplierId: string;
  supplierName: string;
  contactNo: string;
  date: string;
  amount: number;
  paymentStatus: "paid" | "partial" | "due";
  items: PharmacyPurchaseItem[];
};

export type ClinicAdminData = {
  opdBills: OpdBill[];
  pharmacyMedicines: PharmacyMedicine[];
  pharmacySales: PharmacySaleInvoice[];
  pharmacyPurchases: PharmacyPurchaseInvoice[];
};

const STORAGE_KEY = "sharma-cosmo-clinic-admin";
const STORAGE_VERSION_KEY = `${STORAGE_KEY}-version`;
const CURRENT_STORAGE_VERSION = 2;
export const clinicAdminEventName = "clinic-admin-data-updated";

const createId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const seedData: ClinicAdminData = {
  opdBills: [
    {
      id: "opd-seed-1",
      billNo: "INV_0054",
      appointmentId: "seed-appointment-1",
      patientId: "PAT6040",
      patientName: "Ms. Jay Mala",
      phone: "8826054256",
      age: "26y",
      gender: "Female",
      doctorName: clinicBrand.doctorName,
      doctorSpeciality: clinicBrand.doctorSpeciality,
      clinicName: clinicBrand.name,
      clinicAddress: clinicBrand.address,
      date: "2026-03-31T10:58:00.000Z",
      status: "paid",
      paidAmount: 800,
      totalAmount: 800,
      consultationMode: "offline",
      visitType: "Consultation",
      items: [{ label: "Consultation", qty: 1, rate: 800, discount: 0, gst: 0, total: 800 }],
    },
  ],
  pharmacyMedicines: [
    { id: "med-1", name: "KOJIVIT ULTRA", generic: "Glutathione", group: "Skin Care", manufacturer: "Sun Pharma", batch: "MKU251", expiryDate: "2026-09-09", stock: 10, location: "A-01", unitPrice: 685 },
    { id: "med-2", name: "TRANXMA GT", generic: "Tranexamic", group: "Derma", manufacturer: "Abbott", batch: "ST-242074", expiryDate: "2026-09-09", stock: 72, location: "A-02", unitPrice: 525 },
    { id: "med-3", name: "MONTAS L", generic: "Montelukast", group: "Tablet", manufacturer: "Cipla", batch: "K2402264", expiryDate: "2026-09-09", stock: 100, location: "B-04", unitPrice: 190 },
    { id: "med-4", name: "FOLVITE 5 MG", generic: "Folic Acid", group: "Tablet", manufacturer: "Pfizer", batch: "25008E", expiryDate: "2026-09-09", stock: 13283, location: "B-09", unitPrice: 65 },
    { id: "med-5", name: "AZIDERM PULS", generic: "Azelaic Acid", group: "Skin Care", manufacturer: "Micro Labs", batch: "040", expiryDate: "2026-09-01", stock: 98, location: "C-03", unitPrice: 410 },
    { id: "med-6", name: "SKINCAP SUNSCREEN 50", generic: "Sunscreen", group: "Cosmeceutical", manufacturer: "Canixa", batch: "10501", expiryDate: "2026-09-09", stock: 17, location: "C-10", unitPrice: 799 },
  ],
  pharmacySales: [],
  pharmacyPurchases: [],
};

type ClinicAdminStateRow = Tables<"clinic_admin_state">;
type ClinicAdminMutationPlan<T> = { result: T; nextData: ClinicAdminData } | { result: T; skip: true };

const CLINIC_ADMIN_STATE_ID = "primary";
const CLINIC_ADMIN_WRITE_RETRIES = 4;
const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

let clinicAdminCache = seedData;
let clinicAdminCacheHydrated = false;
let clinicAdminChannel: RealtimeChannel | null = null;
let clinicAdminSubscriberCount = 0;

const normalizeOpdBillItem = (item: Partial<OpdBillItem> | null | undefined): OpdBillItem => ({
  label: typeof item?.label === "string" && item.label.trim() ? item.label : "Consultation",
  qty: typeof item?.qty === "number" && item.qty > 0 ? item.qty : 1,
  rate: typeof item?.rate === "number" ? item.rate : getConsultationFee("offline"),
  discount: typeof item?.discount === "number" ? item.discount : 0,
  gst: typeof item?.gst === "number" ? item.gst : 0,
  total: typeof item?.total === "number" ? item.total : (typeof item?.rate === "number" ? item.rate : getConsultationFee("offline")),
});

const normalizeOpdBill = (bill: Partial<OpdBill> | null | undefined, index: number): OpdBill => {
  const consultationMode = normalizeConsultationMode(bill?.consultationMode);
  const totalAmount = typeof bill?.totalAmount === "number" ? bill.totalAmount : getConsultationFee(consultationMode);

  return {
    id: typeof bill?.id === "string" ? bill.id : `opd-seed-${index + 1}`,
    billNo: typeof bill?.billNo === "string" ? bill.billNo : `INV_${String(index + 55).padStart(4, "0")}`,
    appointmentId: typeof bill?.appointmentId === "string" ? bill.appointmentId : undefined,
    patientId: typeof bill?.patientId === "string" ? bill.patientId : "PAT0000",
    patientName: typeof bill?.patientName === "string" ? bill.patientName : "Patient",
    phone: typeof bill?.phone === "string" ? bill.phone : "",
    age: typeof bill?.age === "string" ? bill.age : "Adult",
    gender: typeof bill?.gender === "string" ? bill.gender : "Patient",
    doctorName: typeof bill?.doctorName === "string" ? bill.doctorName : clinicBrand.doctorName,
    doctorSpeciality: typeof bill?.doctorSpeciality === "string" ? bill.doctorSpeciality : clinicBrand.doctorSpeciality,
    clinicName: typeof bill?.clinicName === "string" ? bill.clinicName : clinicBrand.name,
    clinicAddress: typeof bill?.clinicAddress === "string" ? bill.clinicAddress : clinicBrand.address,
    date: typeof bill?.date === "string" ? bill.date : new Date().toISOString(),
    status: bill?.status === "due" || bill?.status === "refunded" ? bill.status : "paid",
    paidAmount: typeof bill?.paidAmount === "number" ? bill.paidAmount : totalAmount,
    totalAmount,
    consultationMode,
    visitType: typeof bill?.visitType === "string" && bill.visitType.trim()
      ? bill.visitType
      : normalizeOpdBillItem(bill?.items?.[0]).label,
    items: Array.isArray(bill?.items) && bill?.items.length > 0
      ? bill.items.map((item) => normalizeOpdBillItem(item))
      : [{ label: "Consultation", qty: 1, rate: totalAmount, discount: 0, gst: 0, total: totalAmount }],
  };
};

const normalizePharmacyMedicine = (medicine: Partial<PharmacyMedicine> | null | undefined, index: number): PharmacyMedicine => ({
  id: typeof medicine?.id === "string" ? medicine.id : `med-${index + 1}`,
  name: typeof medicine?.name === "string" ? medicine.name : "Medicine",
  generic: typeof medicine?.generic === "string" ? medicine.generic : "-",
  group: typeof medicine?.group === "string" ? medicine.group : "-",
  manufacturer: typeof medicine?.manufacturer === "string" ? medicine.manufacturer : "-",
  batch: typeof medicine?.batch === "string" ? medicine.batch : "-",
  expiryDate: typeof medicine?.expiryDate === "string" ? medicine.expiryDate : new Date().toISOString().slice(0, 10),
  stock: typeof medicine?.stock === "number" ? medicine.stock : 0,
  location: typeof medicine?.location === "string" ? medicine.location : "Main Rack",
  unitPrice: typeof medicine?.unitPrice === "number" ? medicine.unitPrice : 0,
});

const normalizePharmacySaleItem = (item: Partial<PharmacySaleItem> | null | undefined): PharmacySaleItem => ({
  medicineId: typeof item?.medicineId === "string" ? item.medicineId : "",
  name: typeof item?.name === "string" ? item.name : "Medicine",
  qty: typeof item?.qty === "number" && item.qty > 0 ? item.qty : 1,
  price: typeof item?.price === "number" ? item.price : 0,
});

const normalizePharmacySale = (invoice: Partial<PharmacySaleInvoice> | null | undefined, index: number): PharmacySaleInvoice => ({
  id: typeof invoice?.id === "string" ? invoice.id : `sale-${index + 1}`,
  invoiceNo: typeof invoice?.invoiceNo === "string" ? invoice.invoiceNo : `${new Date().getFullYear()}${String(index + 1).padStart(7, "0")}`,
  patientId: typeof invoice?.patientId === "string" ? invoice.patientId : "PAT0000",
  patientName: typeof invoice?.patientName === "string" ? invoice.patientName : "Patient",
  contactNo: typeof invoice?.contactNo === "string" ? invoice.contactNo : "",
  date: typeof invoice?.date === "string" ? invoice.date : new Date().toISOString().slice(0, 10),
  totalAmount: typeof invoice?.totalAmount === "number"
    ? invoice.totalAmount
    : (Array.isArray(invoice?.items) ? invoice.items.reduce((sum, item) => sum + (item?.qty || 0) * (item?.price || 0), 0) : 0),
  discount: typeof invoice?.discount === "number" ? invoice.discount : 0,
  paymentStatus: invoice?.paymentStatus === "due" ? "due" : "paid",
  type: invoice?.type === "OPD" ? "OPD" : "OTC",
  items: Array.isArray(invoice?.items) ? invoice.items.map((item) => normalizePharmacySaleItem(item)) : [],
});

const normalizePharmacyPurchaseItem = (item: Partial<PharmacyPurchaseItem> | null | undefined): PharmacyPurchaseItem => ({
  medicineId: typeof item?.medicineId === "string" ? item.medicineId : "",
  name: typeof item?.name === "string" ? item.name : "Medicine",
  qty: typeof item?.qty === "number" && item.qty > 0 ? item.qty : 1,
  price: typeof item?.price === "number" ? item.price : 0,
});

const normalizePharmacyPurchase = (invoice: Partial<PharmacyPurchaseInvoice> | null | undefined, index: number): PharmacyPurchaseInvoice => ({
  id: typeof invoice?.id === "string" ? invoice.id : `purchase-${index + 1}`,
  invoiceNo: typeof invoice?.invoiceNo === "string" ? invoice.invoiceNo : `${new Date().getFullYear()}${String(index + 1).padStart(6, "0")}`,
  supplierId: typeof invoice?.supplierId === "string" ? invoice.supplierId : "SUP-0001",
  supplierName: typeof invoice?.supplierName === "string" ? invoice.supplierName : "Supplier",
  contactNo: typeof invoice?.contactNo === "string" ? invoice.contactNo : "",
  date: typeof invoice?.date === "string" ? invoice.date : new Date().toISOString().slice(0, 10),
  amount: typeof invoice?.amount === "number"
    ? invoice.amount
    : (Array.isArray(invoice?.items) ? invoice.items.reduce((sum, item) => sum + (item?.qty || 0) * (item?.price || 0), 0) : 0),
  paymentStatus: invoice?.paymentStatus === "due" || invoice?.paymentStatus === "partial" ? invoice.paymentStatus : "paid",
  items: Array.isArray(invoice?.items) ? invoice.items.map((item) => normalizePharmacyPurchaseItem(item)) : [],
});

const normalizeClinicAdminData = (value?: Partial<ClinicAdminData> | null): ClinicAdminData => ({
  opdBills: Array.isArray(value?.opdBills) && value?.opdBills.length > 0
    ? value.opdBills.map((bill, index) => normalizeOpdBill(bill, index))
    : seedData.opdBills.map((bill, index) => normalizeOpdBill(bill, index)),
  pharmacyMedicines: Array.isArray(value?.pharmacyMedicines)
    ? value.pharmacyMedicines.map((medicine, index) => normalizePharmacyMedicine(medicine, index))
    : seedData.pharmacyMedicines.map((medicine, index) => normalizePharmacyMedicine(medicine, index)),
  pharmacySales: Array.isArray(value?.pharmacySales)
    ? value.pharmacySales.map((invoice, index) => normalizePharmacySale(invoice, index))
    : seedData.pharmacySales.map((invoice, index) => normalizePharmacySale(invoice, index)),
  pharmacyPurchases: Array.isArray(value?.pharmacyPurchases)
    ? value.pharmacyPurchases.map((invoice, index) => normalizePharmacyPurchase(invoice, index))
    : seedData.pharmacyPurchases.map((invoice, index) => normalizePharmacyPurchase(invoice, index)),
});

const readStoredClinicAdminData = () => {
  if (!canUseStorage()) return normalizeClinicAdminData(seedData);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
      window.localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_STORAGE_VERSION));
      return normalizeClinicAdminData(seedData);
    }
    const parsed = normalizeClinicAdminData(JSON.parse(raw) as Partial<ClinicAdminData>);
    const storedVersion = Number(window.localStorage.getItem(STORAGE_VERSION_KEY) ?? "1");

    if (storedVersion < CURRENT_STORAGE_VERSION) {
      const migratedData = normalizeClinicAdminData({
        ...parsed,
        pharmacySales: [],
        pharmacyPurchases: [],
      });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedData));
      window.localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_STORAGE_VERSION));
      return migratedData;
    }

    return parsed;
  } catch {
    return normalizeClinicAdminData(seedData);
  }
};

const writeClinicAdminCache = (data: ClinicAdminData, options?: { emit?: boolean }) => {
  const normalized = normalizeClinicAdminData(data);
  clinicAdminCache = normalized;
  clinicAdminCacheHydrated = true;

  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_STORAGE_VERSION));
  }

  if (options?.emit !== false && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(clinicAdminEventName));
  }

  return normalized;
};

const isSeedClinicAdminData = (data: ClinicAdminData) =>
  JSON.stringify(normalizeClinicAdminData(data)) === JSON.stringify(normalizeClinicAdminData(seedData));

const payloadToClinicAdminData = (payload: Json | null | undefined) =>
  normalizeClinicAdminData(isRecord(payload) ? payload as Partial<ClinicAdminData> : null);

const fetchClinicAdminStateRow = async () => {
  const { data, error } = await supabase
    .from("clinic_admin_state")
    .select("id, payload, updated_at")
    .eq("id", CLINIC_ADMIN_STATE_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) return data as ClinicAdminStateRow;

  const { data: inserted, error: insertError } = await supabase
    .from("clinic_admin_state")
    .upsert({
      id: CLINIC_ADMIN_STATE_ID,
      payload: {} as Json,
    })
    .select("id, payload, updated_at")
    .maybeSingle();

  if (insertError) {
    throw insertError;
  }

  if (!inserted) {
    throw new Error("Unable to initialize clinic admin state.");
  }

  return inserted as ClinicAdminStateRow;
};

const bootstrapCloudClinicAdminState = async (row: ClinicAdminStateRow) => {
  const localData = readStoredClinicAdminData();
  if (Object.keys(isRecord(row.payload) ? row.payload : {}).length > 0 || isSeedClinicAdminData(localData)) {
    return row;
  }

  const { data, error } = await supabase
    .from("clinic_admin_state")
    .update({ payload: normalizeClinicAdminData(localData) as unknown as Json })
    .eq("id", CLINIC_ADMIN_STATE_ID)
    .eq("updated_at", row.updated_at)
    .select("id, payload, updated_at")
    .maybeSingle();

  if (error || !data) {
    return row;
  }

  return data as ClinicAdminStateRow;
};

export const readClinicAdminData = () => {
  if (!clinicAdminCacheHydrated) {
    clinicAdminCache = readStoredClinicAdminData();
    clinicAdminCacheHydrated = true;
  }

  return clinicAdminCache;
};

export const loadClinicAdminDataFromCloud = async () => {
  try {
    const row = await bootstrapCloudClinicAdminState(await fetchClinicAdminStateRow());
    return writeClinicAdminCache(payloadToClinicAdminData(row.payload));
  } catch {
    return readClinicAdminData();
  }
};

export const subscribeClinicAdminData = (listener: () => void) => {
  if (typeof window !== "undefined") {
    window.addEventListener(clinicAdminEventName, listener);
    window.addEventListener("storage", listener);
  }

  clinicAdminSubscriberCount += 1;
  if (clinicAdminSubscriberCount === 1) {
    void loadClinicAdminDataFromCloud();
    clinicAdminChannel = supabase
      .channel("clinic-admin-state")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "clinic_admin_state",
          filter: `id=eq.${CLINIC_ADMIN_STATE_ID}`,
        },
        () => {
          void loadClinicAdminDataFromCloud();
        },
      )
      .subscribe();
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener(clinicAdminEventName, listener);
      window.removeEventListener("storage", listener);
    }

    clinicAdminSubscriberCount = Math.max(0, clinicAdminSubscriberCount - 1);
    if (clinicAdminSubscriberCount === 0 && clinicAdminChannel) {
      void supabase.removeChannel(clinicAdminChannel);
      clinicAdminChannel = null;
    }
  };
};

const mutateClinicAdminData = async <T>(mutator: (current: ClinicAdminData) => ClinicAdminMutationPlan<T>) => {
  for (let attempt = 0; attempt < CLINIC_ADMIN_WRITE_RETRIES; attempt += 1) {
    const row = await fetchClinicAdminStateRow();
    const current = payloadToClinicAdminData(row.payload);
    const plan = mutator(current);

    if ("skip" in plan) {
      writeClinicAdminCache(current, { emit: false });
      return plan.result;
    }

    const { data, error } = await supabase
      .from("clinic_admin_state")
      .update({ payload: normalizeClinicAdminData(plan.nextData) as unknown as Json })
      .eq("id", CLINIC_ADMIN_STATE_ID)
      .eq("updated_at", row.updated_at)
      .select("id, payload, updated_at")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      writeClinicAdminCache(payloadToClinicAdminData((data as ClinicAdminStateRow).payload));
      return plan.result;
    }
  }

  throw new Error("Clinic data changed in another tab. Please try again.");
};

export const createPatientId = (phone: string) => `PAT${phone.slice(-4).padStart(4, "0")}`;

export const findOpdBillByAppointmentId = (appointmentId: string) =>
  readClinicAdminData().opdBills.find((bill) => bill.appointmentId === appointmentId) ?? null;

export const findOpdBillById = (billId: string) =>
  readClinicAdminData().opdBills.find((bill) => bill.id === billId) ?? null;

export const createOpdBillRecord = async (bill: Omit<OpdBill, "id" | "billNo">) =>
  mutateClinicAdminData<OpdBill>((data) => {
    const existingBill = bill.appointmentId ? data.opdBills.find((item) => item.appointmentId === bill.appointmentId) : null;
    if (existingBill) return { result: existingBill, skip: true };

    const nextBill: OpdBill = normalizeOpdBill(
      {
        ...bill,
        id: createId(),
        billNo: `INV_${String(data.opdBills.length + 55).padStart(4, "0")}`,
      },
      data.opdBills.length,
    );

    return {
      result: nextBill,
      nextData: { ...data, opdBills: [nextBill, ...data.opdBills] },
    };
  });

export const updateOpdBillRecord = async (billId: string, patch: Partial<Omit<OpdBill, "id" | "billNo">>) =>
  mutateClinicAdminData<OpdBill>((data) => {
    const index = data.opdBills.findIndex((bill) => bill.id === billId);
    if (index === -1) {
      throw new Error("Bill not found.");
    }

    const current = data.opdBills[index];
    const nextBill = normalizeOpdBill(
      {
        ...current,
        ...patch,
        id: current.id,
        billNo: current.billNo,
      },
      index,
    );

    if (
      nextBill.appointmentId &&
      data.opdBills.some((bill) => bill.appointmentId === nextBill.appointmentId && bill.id !== billId)
    ) {
      throw new Error("This appointment already has another OPD bill.");
    }

    const nextBills = [...data.opdBills];
    nextBills[index] = nextBill;

    return {
      result: nextBill,
      nextData: { ...data, opdBills: nextBills },
    };
  });

export const addPharmacyMedicine = async (medicine: Omit<PharmacyMedicine, "id">) =>
  mutateClinicAdminData<PharmacyMedicine>((data) => {
    const nextMedicine = normalizePharmacyMedicine({ ...medicine, id: createId() }, data.pharmacyMedicines.length);
    return {
      result: nextMedicine,
      nextData: { ...data, pharmacyMedicines: [nextMedicine, ...data.pharmacyMedicines] },
    };
  });

export const updatePharmacyMedicine = async (medicineId: string, patch: Omit<PharmacyMedicine, "id">) =>
  mutateClinicAdminData<PharmacyMedicine>((data) => {
    const index = data.pharmacyMedicines.findIndex((medicine) => medicine.id === medicineId);

    if (index === -1) {
      throw new Error("Medicine not found.");
    }

    const current = data.pharmacyMedicines[index];
    const nextMedicine = normalizePharmacyMedicine(
      {
        ...current,
        ...patch,
        id: current.id,
      },
      index,
    );

    const nextMedicines = [...data.pharmacyMedicines];
    nextMedicines[index] = nextMedicine;

    return {
      result: nextMedicine,
      nextData: { ...data, pharmacyMedicines: nextMedicines },
    };
  });

export const deletePharmacyMedicine = async (medicineId: string) =>
  mutateClinicAdminData<PharmacyMedicine>((data) => {
    const medicine = data.pharmacyMedicines.find((entry) => entry.id === medicineId);

    if (!medicine) {
      throw new Error("Medicine not found.");
    }

    return {
      result: medicine,
      nextData: {
        ...data,
        pharmacyMedicines: data.pharmacyMedicines.filter((entry) => entry.id !== medicineId),
      },
    };
  });

export const createPharmacySaleInvoice = async (invoice: Omit<PharmacySaleInvoice, "id" | "invoiceNo" | "totalAmount">) =>
  mutateClinicAdminData<PharmacySaleInvoice>((data) => {
    const itemsMap = new Map<string, PharmacySaleItem>();

    invoice.items.forEach((item) => {
      if (!item.medicineId || item.qty <= 0) return;
      const existing = itemsMap.get(item.medicineId);
      if (existing) {
        itemsMap.set(item.medicineId, { ...existing, qty: existing.qty + item.qty });
        return;
      }
      itemsMap.set(item.medicineId, { ...item });
    });

    const normalizedItems = Array.from(itemsMap.values());
    if (normalizedItems.length === 0) {
      throw new Error("At least one medicine is required.");
    }

    normalizedItems.forEach((item) => {
      const medicine = data.pharmacyMedicines.find((entry) => entry.id === item.medicineId);
      if (!medicine) {
        throw new Error(`Medicine not found for ${item.name}.`);
      }
      if (item.qty > medicine.stock) {
        throw new Error(`${medicine.name} has only ${medicine.stock} units in stock.`);
      }
    });

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.qty * item.price, 0);
    const totalAmount = Math.max(0, subtotal - invoice.discount);
    const nextInvoice: PharmacySaleInvoice = {
      ...invoice,
      id: createId(),
      invoiceNo: `${new Date().getFullYear()}${String(data.pharmacySales.length + 30001).padStart(7, "0")}`,
      totalAmount,
      items: normalizedItems,
    };

    const updatedMedicines = data.pharmacyMedicines.map((medicine) => {
      const soldItem = normalizedItems.find((item) => item.medicineId === medicine.id);
      return soldItem ? { ...medicine, stock: Math.max(0, medicine.stock - soldItem.qty) } : medicine;
    });

    return {
      result: nextInvoice,
      nextData: {
        ...data,
        pharmacyMedicines: updatedMedicines,
        pharmacySales: [nextInvoice, ...data.pharmacySales],
      },
    };
  });

export const addPharmacyPurchaseInvoice = async (
  invoice: Omit<PharmacyPurchaseInvoice, "id" | "invoiceNo" | "amount">,
) =>
  mutateClinicAdminData<PharmacyPurchaseInvoice>((data) => {
    const itemsMap = new Map<string, PharmacyPurchaseItem>();

    invoice.items.forEach((item) => {
      if (!item.medicineId || item.qty <= 0) return;
      const existing = itemsMap.get(item.medicineId);
      if (existing) {
        itemsMap.set(item.medicineId, { ...existing, qty: existing.qty + item.qty });
        return;
      }
      itemsMap.set(item.medicineId, { ...item });
    });

    const normalizedItems = Array.from(itemsMap.values());
    if (normalizedItems.length === 0) {
      throw new Error("At least one medicine is required.");
    }

    normalizedItems.forEach((item) => {
      const medicine = data.pharmacyMedicines.find((entry) => entry.id === item.medicineId);
      if (!medicine) {
        throw new Error(`Medicine not found for ${item.name}. Add it in master first.`);
      }
    });

    const amount = normalizedItems.reduce((sum, item) => sum + item.qty * item.price, 0);
    const nextInvoice: PharmacyPurchaseInvoice = {
      ...invoice,
      id: createId(),
      invoiceNo: `${new Date().getFullYear()}${String(data.pharmacyPurchases.length + 3001).padStart(6, "0")}`,
      amount,
      items: normalizedItems,
    };

    const updatedMedicines = data.pharmacyMedicines.map((medicine) => {
      const purchasedItem = normalizedItems.find((item) => item.medicineId === medicine.id);
      return purchasedItem ? { ...medicine, stock: medicine.stock + purchasedItem.qty } : medicine;
    });

    return {
      result: nextInvoice,
      nextData: {
        ...data,
        pharmacyMedicines: updatedMedicines,
        pharmacyPurchases: [nextInvoice, ...data.pharmacyPurchases],
      },
    };
  });
