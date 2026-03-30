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
  status: string;
  created_at: string;
  source: "cloud" | "local";
};

export type AppointmentDraft = Omit<AppointmentRecord, "id" | "status" | "created_at" | "source">;

const LOCAL_APPOINTMENTS_KEY = "sharma-cosmo-local-appointments";
const LOCAL_APPOINTMENTS_EVENT = "appointments:local-updated";

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

const sanitizeLocalAppointments = (value: unknown): AppointmentRecord[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Partial<AppointmentRecord> => typeof item === "object" && item !== null)
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : createLocalAppointmentId(),
      name: typeof item.name === "string" ? item.name : "",
      phone: typeof item.phone === "string" ? item.phone : "",
      email: typeof item.email === "string" ? item.email : null,
      service: typeof item.service === "string" ? item.service : "",
      location: typeof item.location === "string" ? item.location : "",
      preferred_date: typeof item.preferred_date === "string" ? item.preferred_date : null,
      preferred_time: typeof item.preferred_time === "string" ? item.preferred_time : null,
      message: typeof item.message === "string" ? item.message : null,
      status: typeof item.status === "string" ? item.status : "pending",
      created_at: typeof item.created_at === "string" ? item.created_at : new Date().toISOString(),
      source: "local" as const,
    }))
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
    id: createLocalAppointmentId(),
    status: "pending",
    created_at: new Date().toISOString(),
    source: "local",
  };

  const existing = readLocalAppointments();
  writeLocalAppointments([nextRecord, ...existing]);
  return nextRecord;
};

export const updateLocalAppointmentStatus = (id: string, status: string) => {
  const existing = readLocalAppointments();
  const updated = existing.map((appointment) =>
    appointment.id === id ? { ...appointment, status } : appointment
  );
  writeLocalAppointments(updated);
  return updated;
};

export const normalizeCloudAppointments = (
  appointments: Array<Omit<AppointmentRecord, "source">>
) => appointments.map((appointment) => ({ ...appointment, source: "cloud" as const }));

export const mergeAppointments = (cloudAppointments: AppointmentRecord[], localAppointments: AppointmentRecord[]) =>
  [...localAppointments, ...cloudAppointments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

export const isLocalAppointmentId = (id: string) => id.startsWith("local-");

export const localAppointmentsEventName = LOCAL_APPOINTMENTS_EVENT;
