import { clinicBrand } from "@/lib/clinicBrand";

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
  paymentStatus: "paid" | "due";
  type: "OPD" | "OTC";
  items: PharmacySaleItem[];
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
};

export type ClinicAdminData = {
  opdBills: OpdBill[];
  pharmacyMedicines: PharmacyMedicine[];
  pharmacySales: PharmacySaleInvoice[];
  pharmacyPurchases: PharmacyPurchaseInvoice[];
};

const STORAGE_KEY = "sharma-cosmo-clinic-admin";
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
  pharmacySales: [
    { id: "sale-seed-1", invoiceNo: "20260330022", patientId: "PP1946", patientName: "Mubasir", contactNo: "9716433461", date: "2026-03-30", totalAmount: 7861, paymentStatus: "paid", type: "OPD", items: [{ medicineId: "med-1", name: "KOJIVIT ULTRA", qty: 5, price: 685 }] },
    { id: "sale-seed-2", invoiceNo: "20260330021", patientId: "PP1945", patientName: "Priya", contactNo: "8700374260", date: "2026-03-30", totalAmount: 2335, paymentStatus: "paid", type: "OPD", items: [{ medicineId: "med-2", name: "TRANXMA GT", qty: 3, price: 525 }] },
    { id: "sale-seed-3", invoiceNo: "20260330020", patientId: "PP1944", patientName: "Vikrant", contactNo: "9643588131", date: "2026-03-30", totalAmount: 3524, paymentStatus: "due", type: "OPD", items: [{ medicineId: "med-6", name: "SKINCAP SUNSCREEN 50", qty: 2, price: 799 }] },
  ],
  pharmacyPurchases: [
    { id: "purchase-seed-1", invoiceNo: "20260330002", supplierId: "SP-202503001", supplierName: "Sharma Pharmacy", contactNo: "8556263132", date: "2026-03-30", amount: 325000, paymentStatus: "partial" },
    { id: "purchase-seed-2", invoiceNo: "20260330001", supplierId: "SP-202503001", supplierName: "Sharma Pharmacy", contactNo: "8556263132", date: "2026-03-30", amount: 180000, paymentStatus: "partial" },
    { id: "purchase-seed-3", invoiceNo: "20260329001", supplierId: "SP-202503001", supplierName: "Sharma Pharmacy", contactNo: "8556263132", date: "2026-03-29", amount: 6000, paymentStatus: "paid" },
  ],
};

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const normalizeClinicAdminData = (value?: Partial<ClinicAdminData> | null): ClinicAdminData => ({
  opdBills: Array.isArray(value?.opdBills) ? value!.opdBills : seedData.opdBills,
  pharmacyMedicines: Array.isArray(value?.pharmacyMedicines) ? value!.pharmacyMedicines : seedData.pharmacyMedicines,
  pharmacySales: Array.isArray(value?.pharmacySales) ? value!.pharmacySales : seedData.pharmacySales,
  pharmacyPurchases: Array.isArray(value?.pharmacyPurchases) ? value!.pharmacyPurchases : seedData.pharmacyPurchases,
});

export const readClinicAdminData = () => {
  if (!canUseStorage()) return seedData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
      return seedData;
    }
    return normalizeClinicAdminData(JSON.parse(raw) as Partial<ClinicAdminData>);
  } catch {
    return seedData;
  }
};

export const saveClinicAdminData = (data: ClinicAdminData) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(clinicAdminEventName));
};

export const createPatientId = (phone: string) => `PAT${phone.slice(-4).padStart(4, "0")}`;

export const findOpdBillByAppointmentId = (appointmentId: string) =>
  readClinicAdminData().opdBills.find((bill) => bill.appointmentId === appointmentId) ?? null;

export const createOpdBillRecord = (bill: Omit<OpdBill, "id" | "billNo">) => {
  const data = readClinicAdminData();
  const existingBill = bill.appointmentId ? data.opdBills.find((item) => item.appointmentId === bill.appointmentId) : null;
  if (existingBill) return existingBill;
  const nextBill: OpdBill = {
    ...bill,
    id: createId(),
    billNo: `INV_${String(data.opdBills.length + 55).padStart(4, "0")}`,
  };
  const nextData = { ...data, opdBills: [nextBill, ...data.opdBills] };
  saveClinicAdminData(nextData);
  return nextBill;
};

export const addPharmacyMedicine = (medicine: Omit<PharmacyMedicine, "id">) => {
  const data = readClinicAdminData();
  const nextMedicine = { ...medicine, id: createId() };
  const nextData = { ...data, pharmacyMedicines: [nextMedicine, ...data.pharmacyMedicines] };
  saveClinicAdminData(nextData);
  return nextMedicine;
};

export const createPharmacySaleInvoice = (invoice: Omit<PharmacySaleInvoice, "id" | "invoiceNo" | "totalAmount">) => {
  const data = readClinicAdminData();
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

  const totalAmount = normalizedItems.reduce((sum, item) => sum + item.qty * item.price, 0);
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

  const nextData = {
    ...data,
    pharmacyMedicines: updatedMedicines,
    pharmacySales: [nextInvoice, ...data.pharmacySales],
  };
  saveClinicAdminData(nextData);
  return nextInvoice;
};

export const addPharmacyPurchaseInvoice = (invoice: Omit<PharmacyPurchaseInvoice, "id" | "invoiceNo">) => {
  const data = readClinicAdminData();
  const nextInvoice = {
    ...invoice,
    id: createId(),
    invoiceNo: `${new Date().getFullYear()}${String(data.pharmacyPurchases.length + 3001).padStart(6, "0")}`,
  };
  const nextData = { ...data, pharmacyPurchases: [nextInvoice, ...data.pharmacyPurchases] };
  saveClinicAdminData(nextData);
  return nextInvoice;
};
