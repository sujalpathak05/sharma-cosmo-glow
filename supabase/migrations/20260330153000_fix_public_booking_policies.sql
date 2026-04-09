ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'appointments'
      AND policyname = 'Anyone can submit an appointment'
  ) THEN
    CREATE POLICY "Anyone can submit an appointment"
    ON public.appointments
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'appointments'
      AND policyname = 'Authenticated users can view appointments'
  ) THEN
    CREATE POLICY "Authenticated users can view appointments"
    ON public.appointments
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reviews'
      AND policyname = 'Anyone can submit a review'
  ) THEN
    CREATE POLICY "Anyone can submit a review"
    ON public.reviews
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reviews'
      AND policyname = 'Public can view approved reviews'
  ) THEN
    CREATE POLICY "Public can view approved reviews"
    ON public.reviews
    FOR SELECT
    TO anon
    USING (is_approved = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reviews'
      AND policyname = 'Admin can view all reviews'
  ) THEN
    CREATE POLICY "Admin can view all reviews"
    ON public.reviews
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reviews'
      AND policyname = 'Admin can update reviews'
  ) THEN
    CREATE POLICY "Admin can update reviews"
    ON public.reviews
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reviews'
      AND policyname = 'Admin can delete reviews'
  ) THEN
    CREATE POLICY "Admin can delete reviews"
    ON public.reviews
    FOR DELETE
    TO authenticated
    USING (true);
  END IF;
END $$;
