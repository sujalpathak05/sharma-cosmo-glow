import { beforeEach, describe, expect, it } from "vitest";
import {
  isLocalAppointmentId,
  mergeAppointments,
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
      service: "Skin Treatment",
      location: "Noida",
      preferred_date: "2026-03-31",
      preferred_time: "11:00:00",
      message: "Need consultation",
    });

    expect(isLocalAppointmentId(record.id)).toBe(true);
    expect(readLocalAppointments()).toHaveLength(1);
    expect(readLocalAppointments()[0]?.name).toBe("Test User");
  });

  it("updates local appointment status", () => {
    const record = saveLocalAppointment({
      name: "Test User",
      phone: "9999999999",
      email: null,
      service: "Skin Treatment",
      location: "Noida",
      preferred_date: null,
      preferred_time: null,
      message: null,
    });

    const updated = updateLocalAppointmentStatus(record.id, "confirmed");
    expect(updated[0]?.status).toBe("confirmed");
  });

  it("merges local records before cloud records and sorts by created_at", () => {
    const merged = mergeAppointments(
      [
        {
          id: "cloud-1",
          name: "Cloud User",
          phone: "1111111111",
          email: null,
          service: "Laser Treatment",
          location: "Noida",
          preferred_date: null,
          preferred_time: null,
          message: null,
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
          service: "Skin Treatment",
          location: "Noida",
          preferred_date: null,
          preferred_time: null,
          message: null,
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
