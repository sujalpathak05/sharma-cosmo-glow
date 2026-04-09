import { describe, expect, it } from "vitest";
import { slotLabelToSqlTime, sqlTimeToSlotLabel } from "@/lib/appointmentTime";

describe("appointment time helpers", () => {
  it("converts slot labels to SQL time", () => {
    expect(slotLabelToSqlTime("11:00 AM - 11:15 AM")).toBe("11:00:00");
    expect(slotLabelToSqlTime("12:00 AM - 12:15 AM")).toBe("00:00:00");
    expect(slotLabelToSqlTime("5:30 PM - 5:45 PM")).toBe("17:30:00");
  });

  it("supports en dash slot labels from existing UI", () => {
    expect(slotLabelToSqlTime("11:00 AM \u2013 11:15 AM")).toBe("11:00:00");
  });

  it("supports mojibake dash labels if older content is still present", () => {
    expect(slotLabelToSqlTime("11:00 AM \u00E2\u20AC\u201C 11:15 AM")).toBe("11:00:00");
  });

  it("formats SQL time back into slot labels", () => {
    expect(sqlTimeToSlotLabel("11:00:00")).toBe("11:00 AM - 11:15 AM");
    expect(sqlTimeToSlotLabel("17:30:00")).toBe("5:30 PM - 5:45 PM");
  });

  it("normalizes existing slot labels for admin display", () => {
    expect(sqlTimeToSlotLabel("11:00 AM \u2013 11:15 AM")).toBe("11:00 AM - 11:15 AM");
  });
});
