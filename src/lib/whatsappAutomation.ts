import type { AppointmentRecord } from "@/lib/appointmentStore";
import { sqlTimeToSlotLabel } from "@/lib/appointmentTime";
import { clinicBrand } from "@/lib/clinicBrand";
import { clinicContact } from "@/lib/contactDetails";
import { supabase } from "@/integrations/supabase/client";

export type WhatsAppMessageType = "confirmation" | "reminder" | "followup" | "review_request";

const formatDate = (value: string | null | undefined) => {
  if (!value) return "your selected date";
  const date = new Date(`${value}T10:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const normalizeWhatsAppPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
};

export const createWhatsAppMessage = (appointment: AppointmentRecord, type: WhatsAppMessageType) => {
  const date = formatDate(appointment.preferred_date);
  const time = sqlTimeToSlotLabel(appointment.preferred_time) ?? "your selected time";
  const service = appointment.service || "consultation";
  const address = clinicContact.addressInline;

  if (type === "confirmation") {
    return `Namaste ${appointment.name}, your ${service} appointment at ${clinicBrand.name} is confirmed for ${date} at ${time}. Address: ${address}. For help call ${clinicContact.phoneDisplay}.`;
  }

  if (type === "reminder") {
    return `Reminder from ${clinicBrand.name}: your ${service} appointment is scheduled for ${date} at ${time}. Please reach 10 minutes early. Address: ${address}.`;
  }

  if (type === "followup") {
    return `Namaste ${appointment.name}, this is a follow-up message from ${clinicBrand.name} after your ${service} visit. Please reply here if you need support or want to book your next consultation.`;
  }

  return `Thank you for visiting ${clinicBrand.name}. We hope your ${service} experience was comfortable. Please share your review when convenient.`;
};

export const createWhatsAppHref = (phone: string, message: string) => {
  return `https://wa.me/${normalizeWhatsAppPhone(phone)}?text=${encodeURIComponent(message)}`;
};

export const logWhatsAppMessage = async (
  appointment: AppointmentRecord,
  type: WhatsAppMessageType,
  message: string,
  status: "queued" | "opened" | "sent" | "failed" = "opened",
) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("whatsapp_message_logs").insert({
      appointment_id: appointment.id,
      patient_name: appointment.name,
      phone: appointment.phone,
      message_type: type,
      message_body: message,
      delivery_mode: "wa_link",
      status,
      sent_by: userData.user?.id ?? null,
      sent_at: status === "opened" || status === "sent" ? new Date().toISOString() : null,
    });
  } catch {
    // Message delivery should not fail just because logging is unavailable.
  }
};
