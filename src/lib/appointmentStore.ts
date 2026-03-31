import { normalizeConsultationMode, type ConsultationMode } from "@/lib/consultationMode";

export type AppointmentRecord = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string;
  location: string;
  preferred_date: string | null;
  preferred_time: string | null;
  message: string | null;
  consultation_mode: ConsultationMode | null;
  status: string;
  created_at: string;
  source: "cloud" | "local";
};

export type AppointmentDraft = Omit<AppointmentRecord, "id" | "status" | "created_at" | "source">;

const LOCAL_APPOINTMENTS_KEY = "sharma-cosmo-local-appointments";
const LOCAL_APPOINTMENTS_EVENT = "appointments:local-updated";
const CONSULTATION_MODE_TOKEN = /^\[\[consultation:(online|offline)\]\]\s*/i;

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const emitLocalAppointmentsUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(LOCAL_APPOINTMENTS_EVENT));
  }
};

const createLocalAppointmentId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `local-${crypto.randomUUID()}`;
  }

  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const unpackAppointmentMessage = (value: unknown) => {
  if (typeof value !== "string") {
    return {
      message: null,
      consultation_mode: null as ConsultationMode | null,
    };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return {
      message: null,
      consultation_mode: null as ConsultationMode | null,
    };
  }

  const match = trimmed.match(CONSULTATION_MODE_TOKEN);
  const consultationMode = normalizeConsultationMode(match?.[1] ?? null);
  const message = consultationMode ? trimmed.replace(CONSULTATION_MODE_TOKEN, "").trim() : trimmed;

  return {
    message: message || null,
    consultation_mode: consultationMode,
  };
};

export const buildStoredAppointmentMessage = (
  message: string | null | undefined,
  consultationMode: ConsultationMode | null | undefined,
) => {
  const normalizedMode = normalizeConsultationMode(consultationMode);
  const trimmedMessage = message?.trim() || "";

  if (!normalizedMode) return trimmedMessage || null;
  return [`[[consultation:${normalizedMode}]]`, trimmedMessage].filter(Boolean).join(" ").trim();
};

const sanitizeLocalAppointments = (value: unknown): AppointmentRecord[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Partial<AppointmentRecord> => typeof item === "object" && item !== null)
    .map((item) => {
      const unpacked = unpackAppointmentMessage(item.message);

      return {
        id: typeof item.id === "string" ? item.id : createLocalAppointmentId(),
        name: typeof item.name === "string" ? item.name : "",
        phone: typeof item.phone === "string" ? item.phone : "",
        email: typeof item.email === "string" ? item.email : null,
        service: typeof item.service === "string" ? item.service : "",
        location: typeof item.location === "string" ? item.location : "",
        preferred_date: typeof item.preferred_date === "string" ? item.preferred_date : null,
        preferred_time: typeof item.preferred_time === "string" ? item.preferred_time : null,
        message: unpacked.message,
        consultation_mode: normalizeConsultationMode(item.consultation_mode) ?? unpacked.consultation_mode,
        status: typeof item.status === "string" ? item.status : "pending",
        created_at: typeof item.created_at === "string" ? item.created_at : new Date().toISOString(),
        source: "local" as const,
      };
    })
    .filter((item) => item.name && item.phone && item.service && item.location);
};

const writeLocalAppointments = (appointments: AppointmentRecord[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LOCAL_APPOINTMENTS_KEY, JSON.stringify(appointments));
  emitLocalAppointmentsUpdated();
};

export const readLocalAppointments = () => {
  if (!canUseStorage()) return [] as AppointmentRecord[];

  try {
    const raw = window.localStorage.getItem(LOCAL_APPOINTMENTS_KEY);
    if (!raw) return [];
    return sanitizeLocalAppointments(JSON.parse(raw));
  } catch {
    return [];
  }
};

export const saveLocalAppointment = (draft: AppointmentDraft) => {
  const nextRecord: AppointmentRecord = {
    ...draft,
    consultation_mode: normalizeConsultationMode(draft.consultation_mode),
    id: createLocalAppointmentId(),
    status: "pending",
    created_at: new Date().toISOString(),
    source: "local",
  };

  const existing = readLocalAppointments();
  writeLocalAppointments([nextRecord, ...existing]);
  return nextRecord;
};

export const removeLocalAppointment = (id: string) => {
  const existing = readLocalAppointments();
  const updated = existing.filter((appointment) => appointment.id !== id);
  writeLocalAppointments(updated);
  return updated;
};

export const updateLocalAppointmentStatus = (id: string, status: string) => {
  const existing = readLocalAppointments();
  const updated = existing.map((appointment) =>
    appointment.id === id ? { ...appointment, status } : appointment,
  );
  writeLocalAppointments(updated);
  return updated;
};

export const normalizeCloudAppointments = (appointments: Array<Omit<AppointmentRecord, "source">>) =>
  appointments.map((appointment) => {
    const unpacked = unpackAppointmentMessage(appointment.message);

    return {
      ...appointment,
      message: unpacked.message,
      consultation_mode: normalizeConsultationMode(appointment.consultation_mode) ?? unpacked.consultation_mode,
      source: "cloud" as const,
    };
  });

export const mergeAppointments = (cloudAppointments: AppointmentRecord[], localAppointments: AppointmentRecord[]) =>
  [...localAppointments, ...cloudAppointments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

export const isLocalAppointmentId = (id: string) => id.startsWith("local-");

export const localAppointmentsEventName = LOCAL_APPOINTMENTS_EVENT;
