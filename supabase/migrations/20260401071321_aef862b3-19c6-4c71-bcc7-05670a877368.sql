CREATE TABLE public.clinic_admin_state (
  id text NOT NULL PRIMARY KEY,
  payload jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.clinic_admin_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view clinic_admin_state" ON public.clinic_admin_state
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can insert clinic_admin_state" ON public.clinic_admin_state
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin can update clinic_admin_state" ON public.clinic_admin_state
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.clinic_admin_state;