-- Create storage buckets for photos
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('product-photos', 'product-photos', true),
  ('weighing-photos', 'weighing-photos', true);

-- Create storage policies for photo uploads
CREATE POLICY "Anyone can view product photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-photos');

CREATE POLICY "Authenticated users can upload product photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view weighing photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'weighing-photos');

CREATE POLICY "Authenticated users can upload weighing photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'weighing-photos' AND auth.role() = 'authenticated');

-- Create batches table
CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id TEXT NOT NULL UNIQUE,
  batch_id TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  farmer_id UUID NOT NULL REFERENCES public.profiles(id),
  production_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location_state TEXT NOT NULL,
  location_district TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  quantity_unit TEXT NOT NULL DEFAULT 'kg',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create activities table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id TEXT NOT NULL REFERENCES public.batches(trace_id),
  actor_role user_role NOT NULL,
  actor_id UUID NOT NULL REFERENCES public.profiles(id),
  activity_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  extra_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create media table
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id TEXT NOT NULL REFERENCES public.batches(trace_id),
  type TEXT NOT NULL CHECK (type IN ('product_photo', 'weighing_photo')),
  photo_url TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  gps_latitude DECIMAL,
  gps_longitude DECIMAL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- RLS policies for batches
CREATE POLICY "Users can view all batches" ON public.batches
  FOR SELECT USING (true);

CREATE POLICY "Farmers can create batches" ON public.batches
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update their own batches" ON public.batches
  FOR UPDATE USING (auth.uid() = farmer_id);

-- RLS policies for activities
CREATE POLICY "Users can view all activities" ON public.activities
  FOR SELECT USING (true);

CREATE POLICY "Users can create activities" ON public.activities
  FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- RLS policies for media
CREATE POLICY "Users can view all media" ON public.media
  FOR SELECT USING (true);

CREATE POLICY "Users can create media" ON public.media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.batches 
      WHERE batches.trace_id = media.trace_id 
      AND batches.farmer_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_batches_trace_id ON public.batches(trace_id);
CREATE INDEX idx_batches_farmer_id ON public.batches(farmer_id);
CREATE INDEX idx_activities_trace_id ON public.activities(trace_id);
CREATE INDEX idx_activities_actor_id ON public.activities(actor_id);
CREATE INDEX idx_media_trace_id ON public.media(trace_id);

-- Create function to generate unique trace_id
CREATE OR REPLACE FUNCTION generate_trace_id() RETURNS TEXT AS $$
BEGIN
  RETURN 'TR' || EXTRACT(YEAR FROM NOW()) || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function to generate unique batch_id
CREATE OR REPLACE FUNCTION generate_batch_id() RETURNS TEXT AS $$
BEGIN
  RETURN 'BT' || EXTRACT(YEAR FROM NOW()) || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for batches updated_at
CREATE TRIGGER update_batches_updated_at
  BEFORE UPDATE ON public.batches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();