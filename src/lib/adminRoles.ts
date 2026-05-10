import { supabase } from "@/integrations/supabase/client";

export type ClinicRole = "admin" | "doctor" | "staff";

export const clinicRoleLabels: Record<ClinicRole, string> = {
  admin: "Admin",
  doctor: "Doctor",
  staff: "Staff",
};

export const normalizeClinicRole = (value: unknown): ClinicRole => {
  return value === "doctor" || value === "staff" || value === "admin" ? value : "admin";
};

export const fetchClinicRole = async (userId: string): Promise<ClinicRole> => {
  const [roleResult, activeRoleCountResult] = await Promise.all([
    supabase
      .from("clinic_staff_roles")
      .select("role,is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("clinic_staff_roles")
      .select("user_id", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  if (roleResult.data) {
    return normalizeClinicRole(roleResult.data.role);
  }

  if (roleResult.error || activeRoleCountResult.error) {
    return "admin";
  }

  return activeRoleCountResult.count === 0 ? "admin" : "staff";
};
