import { beforeEach, describe, expect, it } from "vitest";
import {
  buildStoredAppointmentMessage,
  isLocalAppointmentId,
  mergeAppointments,
  normalizeAppointmentDateKey,
  normalizeCloudAppointments,
  readLocalAppointments,
  saveLocalAppointment,
  updateLocalAppointmentStatus,
} from "@/lib/appointmentStore";

describe("appointment local backup store", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves and reads local appointments", () => {
    const record = saveLocalAppointment({
      name: "Test User",
      phone: "9999999999",
      email: "test@example.com",
      gender: "Female",
      service: "Skin Treatment",
      location: "Noida",
      preferred_date: "2026-03-31",
      preferred_time: "11:00:00",
      message: "Need consultation",
      consultation_mode: "offline",
    });

    expect(isLocalAppointmentId(record.id)).toBe(true);
    expect(readLocalAppointments()).toHaveLength(1);
    expect(readLocalAppointments()[0]?.name).toBe("Test User");
    expect(readLocalAppointments()[0]?.gender).toBe("Female");
  });

  it("updates local appointment status", () => {
    const record = saveLocalAppointment({
      name: "Test User",
      phone: "9999999999",
      email: null,
      gender: "Male",
      service: "Skin Treatment",
      location: "Noida",
      preferred_date: null,
      preferred_time: null,
      message: null,
      consultation_mode: "online",
    });

    const updated = updateLocalAppointmentStatus(record.id, "confirmed", "2026-04-01");
    expect(updated[0]?.status).toBe("confirmed");
    expect(readLocalAppointments()[0]?.confirmed_at).toBe("2026-04-01");
  });

  it("extracts gender, consultation mode and confirmation date from stored cloud message tokens", () => {
    const normalized = normalizeCloudAppointments([
      {
        id: "cloud-1",
        name: "Cloud User",
        phone: "1111111111",
        email: null,
        service: "Laser Treatment",
        location: "Noida",
        preferred_date: null,
        preferred_time: null,
        message: buildStoredAppointmentMessage("Need call back", "online", "Others", "2026-04-01"),
        consultation_mode: null,
        status: "pending",
        created_at: "2026-03-30T09:00:00.000Z",
      },
    ]);

    expect(normalized[0]?.gender).toBe("Others");
    expect(normalized[0]?.consultation_mode).toBe("online");
    expect(normalized[0]?.confirmed_at).toBe("2026-04-01");
    expect(normalized[0]?.message).toBe("Need call back");
  });

  it("normalizes date keys from ISO timestamps", () => {
    expect(normalizeAppointmentDateKey("2026-04-01T09:00:00.000Z")).toBe("2026-04-01");
    expect(normalizeAppointmentDateKey("bad date")).toBeNull();
  });

  it("merges local records before cloud records and sorts by created_at", () => {
    const merged = mergeAppointments(
      [
        {
          id: "cloud-1",
          name: "Cloud User",
          phone: "1111111111",
          email: null,
          gender: "Female",
          service: "Laser Treatment",
          location: "Noida",
          preferred_date: null,
          preferred_time: null,
          message: null,
          consultation_mode: "offline",
          status: "pending",
          created_at: "2026-03-30T09:00:00.000Z",
          source: "cloud",
        },
      ],
      [
        {
          id: "local-1",
          name: "Local User",
          phone: "2222222222",
          email: null,
          gender: "Male",
          service: "Skin Treatment",
          location: "Noida",
          preferred_date: null,
          preferred_time: null,
          message: null,
          consultation_mode: "offline",
          status: "pending",
          created_at: "2026-03-30T10:00:00.000Z",
          source: "local",
        },
      ]
    );

    expect(merged[0]?.id).toBe("local-1");
    expect(merged[1]?.id).toBe("cloud-1");
  });
});
