import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { fetchClinicRole, type ClinicRole } from "@/lib/adminRoles";

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<ClinicRole>("admin");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const applySession = async (session: Session | null) => {
      setSession(session);
      if (session?.user?.id) {
        setRole(await fetchClinicRole(session.user.id));
      } else {
        setRole("admin");
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      void applySession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, role, loading, signOut };
};
