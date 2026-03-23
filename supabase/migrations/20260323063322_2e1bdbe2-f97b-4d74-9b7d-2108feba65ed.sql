-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Noida',
  preferred_date DATE,
  preferred_time TIME,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public booking form, no auth required)
CREATE POLICY "Anyone can submit an appointment"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated users (admin) can view appointments
CREATE POLICY "Authenticated users can view appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (true);