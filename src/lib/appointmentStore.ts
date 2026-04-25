import { normalizeConsultationMode, type ConsultationMode } from "@/lib/consultationMode";
import { normalizePatientGender, patientGenderTokenValue, type PatientGender } from "@/lib/patientGender";

export type AppointmentRecord = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  gender: PatientGender | null;
  service: string;
  location: string;
  preferred_date: string | null;
  preferred_time: string | null;
  message: string | null;
  consultation_mode: ConsultationMode | null;
  confirmed_at?: string | null;
  status: string;
  created_at: string;
  source: "cloud" | "local";
};

export type AppointmentDraft = Omit<AppointmentRecord, "id" | "status" | "confirmed_at" | "created_at" | "source">;

const LOCAL_APPOINTMENTS_KEY = "sharma-cosmo-local-appointments";
const LOCAL_APPOINTMENTS_EVENT = "appointments:local-updated";
const APPOINTMENT_META_TOKEN = /^\[\[(consultation|gender|confirmed_at):([^\]]+)\]\]\s*/i;

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

export const normalizeAppointmentDateKey = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const unpackAppointmentMessage = (value: unknown) => {
  if (typeof value !== "string") {
    return {
      message: null,
      gender: null as PatientGender | null,
      consultation_mode: null as ConsultationMode | null,
      confirmed_at: null as string | null,
    };
  }

  let message = value.trim();
  if (!message) {
    return {
      message: null,
      gender: null as PatientGender | null,
      consultation_mode: null as ConsultationMode | null,
      confirmed_at: null as string | null,
    };
  }

  let consultationMode: ConsultationMode | null = null;
  let gender: PatientGender | null = null;
  let confirmedAt: string | null = null;

  while (message) {
    const match = message.match(APPOINTMENT_META_TOKEN);
    if (!match) break;

    const [, tokenName, tokenValue] = match;
    if (tokenName.toLowerCase() === "consultation") {
      consultationMode = normalizeConsultationMode(tokenValue);
    }

    if (tokenName.toLowerCase() === "gender") {
      gender = normalizePatientGender(tokenValue);
    }

    if (tokenName.toLowerCase() === "confirmed_at") {
      confirmedAt = normalizeAppointmentDateKey(tokenValue);
    }

    message = message.slice(match[0].length).trim();
  }

  return {
    message: message || null,
    gender,
    consultation_mode: consultationMode,
    confirmed_at: confirmedAt,
  };
};

export const buildStoredAppointmentMessage = (
  message: string | null | undefined,
  consultationMode: ConsultationMode | null | undefined,
  gender?: PatientGender | null,
  confirmedAt?: string | null,
) => {
  const normalizedMode = normalizeConsultationMode(consultationMode);
  const normalizedGender = patientGenderTokenValue(gender);
  const normalizedConfirmedAt = normalizeAppointmentDateKey(confirmedAt);
  const trimmedMessage = message?.trim() || "";

  const parts = [
    normalizedMode ? `[[consultation:${normalizedMode}]]` : null,
    normalizedGender ? `[[gender:${normalizedGender}]]` : null,
    normalizedConfirmedAt ? `[[confirmed_at:${normalizedConfirmedAt}]]` : null,
    trimmedMessage || null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : null;
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
        gender: normalizePatientGender(item.gender) ?? unpacked.gender,
        service: typeof item.service === "string" ? item.service : "",
        location: typeof item.location === "string" ? item.location : "",
        preferred_date: typeof item.preferred_date === "string" ? item.preferred_date : null,
        preferred_time: typeof item.preferred_time === "string" ? item.preferred_time : null,
        message: unpacked.message,
        consultation_mode: normalizeConsultationMode(item.consultation_mode) ?? unpacked.consultation_mode,
        confirmed_at: normalizeAppointmentDateKey(item.confirmed_at) ?? unpacked.confirmed_at,
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
    gender: normalizePatientGender(draft.gender),
    consultation_mode: normalizeConsultationMode(draft.consultation_mode),
    id: createLocalAppointmentId(),
    status: "pending",
    confirmed_at: null,
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

export const updateLocalAppointmentStatus = (id: string, status: string, confirmedAt?: string | null) => {
  const existing = readLocalAppointments();
  const updated = existing.map((appointment) =>
    appointment.id === id
      ? {
          ...appointment,
          status,
          confirmed_at: normalizeAppointmentDateKey(confirmedAt) ?? appointment.confirmed_at ?? null,
          message: buildStoredAppointmentMessage(
            appointment.message,
            appointment.consultation_mode,
            appointment.gender,
            normalizeAppointmentDateKey(confirmedAt) ?? appointment.confirmed_at ?? null,
          ),
        }
      : appointment,
  );
  writeLocalAppointments(updated);
  return updated;
};

export const normalizeCloudAppointments = (appointments: Array<Partial<Omit<AppointmentRecord, "source">>>) =>
  appointments.map((appointment) => {
    const unpacked = unpackAppointmentMessage(appointment.message);

    return {
      ...appointment,
      gender: normalizePatientGender(appointment.gender) ?? unpacked.gender,
      message: unpacked.message,
      consultation_mode: normalizeConsultationMode(appointment.consultation_mode) ?? unpacked.consultation_mode,
      confirmed_at: normalizeAppointmentDateKey(appointment.confirmed_at) ?? unpacked.confirmed_at,
      source: "cloud" as const,
    } as AppointmentRecord;
  });

export const mergeAppointments = (cloudAppointments: AppointmentRecord[], localAppointments: AppointmentRecord[]) =>
  [...localAppointments, ...cloudAppointments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

export const isLocalAppointmentId = (id: string) => id.startsWith("local-");

export const localAppointmentsEventName = LOCAL_APPOINTMENTS_EVENT;
