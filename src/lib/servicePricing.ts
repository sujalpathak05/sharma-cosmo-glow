/** Shared service ↔ price map used across booking form and admin panel */

export type ServiceOption = {
  label: string;
  price: number | null; // null = consultation-based pricing
  group: string;
};

export const serviceOptions: ServiceOption[] = [
  // General services (price depends on consultation mode)
  { label: "Acne and Skin Treatment", price: null, group: "General" },
  { label: "Chemical Peel Treatment", price: null, group: "General" },
  { label: "PRP Hair Treatment", price: null, group: "General" },
  { label: "Psoriasis Treatment", price: null, group: "General" },
  { label: "Alopecia Treatment", price: null, group: "General" },
  { label: "Vitiligo Treatment", price: null, group: "General" },
  { label: "Laser Hair Removal", price: null, group: "General" },
  { label: "Botox and Anti-Aging Treatment", price: null, group: "General" },
  { label: "Aesthetic Consultations", price: null, group: "General" },

  // Laser packages
  { label: "Laser - Full body", price: 60000, group: "Laser" },
  { label: "Laser - Face", price: 30000, group: "Laser" },
  { label: "Laser - Bikini area", price: 30000, group: "Laser" },
  { label: "Laser - Under arm", price: 15000, group: "Laser" },
  { label: "Laser - Both arm", price: 20000, group: "Laser" },
  { label: "Laser - Both leg", price: 30000, group: "Laser" },
  { label: "Laser - Trial", price: 30000, group: "Laser" },

  // Hair therapy
  { label: "PRP", price: 3000, group: "Hair Therapy" },
  { label: "GFC", price: 4500, group: "Hair Therapy" },
  { label: "Mizo", price: 5500, group: "Hair Therapy" },
];

const priceMap = new Map(serviceOptions.filter((s) => s.price !== null).map((s) => [s.label, s.price!]));

/** Get the fixed price for a service, or null if it's consultation-mode based */
export const getServicePrice = (serviceLabel: string): number | null => {
  return priceMap.get(serviceLabel) ?? null;
};

/** Format price for display */
export const formatServicePrice = (price: number): string => {
  return `₹${price.toLocaleString("en-IN")}`;
};

/** Pricing groups for display in appointment form */
export const pricingGroups = [
  {
    title: "Laser",
    rows: serviceOptions
      .filter((s) => s.group === "Laser")
      .map((s) => ({ label: s.label.replace("Laser - ", ""), price: s.price!.toLocaleString("en-IN") })),
  },
  {
    title: "Hair Therapy",
    rows: serviceOptions
      .filter((s) => s.group === "Hair Therapy")
      .map((s) => ({ label: s.label, price: s.price!.toLocaleString("en-IN") })),
  },
];
