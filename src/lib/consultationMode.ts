export type ConsultationMode = "online" | "offline";

export const consultationModeOptions: Array<{ value: ConsultationMode; label: string }> = [
  { value: "offline", label: "Offline Consultation" },
  { value: "online", label: "Online Consultation" },
];

export const normalizeConsultationMode = (value: string | null | undefined): ConsultationMode | null => {
  if (value === "online" || value === "offline") return value;
  return null;
};

export const getConsultationFee = (mode: string | null | undefined) =>
  normalizeConsultationMode(mode) === "online" ? 1000 : 800;

export const getConsultationModeLabel = (mode: string | null | undefined) =>
  normalizeConsultationMode(mode) === "online" ? "Online Consultation" : "Offline Consultation";
