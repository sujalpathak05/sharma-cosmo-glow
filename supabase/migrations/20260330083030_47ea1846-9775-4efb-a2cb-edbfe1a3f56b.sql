
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  treatment text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text text NOT NULL,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a review
CREATE POLICY "Anyone can submit a review" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Public can see only approved reviews
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT TO anon USING (is_approved = true);

-- Admin can view all reviews
CREATE POLICY "Admin can view all reviews" ON public.reviews FOR SELECT TO authenticated USING (true);

-- Admin can update reviews (approve/reject)
CREATE POLICY "Admin can update reviews" ON public.reviews FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Admin can delete reviews
CREATE POLICY "Admin can delete reviews" ON public.reviews FOR DELETE TO authenticated USING (true);
