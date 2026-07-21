export type ConsultationMode = "online" | "offline";

export const PRP_SERVICE_LABEL = "PRP Treatment";
export const PRP_FEE = 3000;

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

/** Returns the correct appointment fee based on service + mode. PRP is fixed at ₹3,000. */
export const getAppointmentFee = (service: string | null | undefined, mode: string | null | undefined): number => {
  if (service === PRP_SERVICE_LABEL) return PRP_FEE;
  return getConsultationFee(mode);
};
