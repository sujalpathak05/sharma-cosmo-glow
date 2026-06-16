export const patientGenderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Others", label: "Others" },
] as const;

export type PatientGender = (typeof patientGenderOptions)[number]["value"];

export const normalizePatientGender = (value: unknown): PatientGender | null => {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;

  if (normalized === "male" || normalized === "m") return "Male";
  if (normalized === "female" || normalized === "f") return "Female";
  if (normalized === "other" || normalized === "others" || normalized === "o") return "Others";

  return null;
};

export const patientGenderTokenValue = (value: PatientGender | null | undefined) =>
  normalizePatientGender(value)?.toLowerCase() ?? null;
