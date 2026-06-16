-- Table to manage off-dates (clinic closed days)
CREATE TABLE public.off_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.off_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view off_dates" ON public.off_dates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can insert off_dates" ON public.off_dates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can delete off_dates" ON public.off_dates FOR DELETE TO authenticated USING (true);
CREATE POLICY "Public can view off_dates" ON public.off_dates FOR SELECT TO anon USING (true);

-- Table to manage disabled time slots per date
CREATE TABLE public.disabled_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  time_slot text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(date, time_slot)
);

ALTER TABLE public.disabled_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view disabled_slots" ON public.disabled_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can insert disabled_slots" ON public.disabled_slots FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can delete disabled_slots" ON public.disabled_slots FOR DELETE TO authenticated USING (true);
CREATE POLICY "Public can view disabled_slots" ON public.disabled_slots FOR SELECT TO anon USING (true);