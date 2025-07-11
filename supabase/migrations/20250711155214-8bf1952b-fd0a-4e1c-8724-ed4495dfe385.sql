
-- First, check if the user_role enum exists and create it if it doesn't
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('farmer', 'broker', 'mnc', 'retailer', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure the profiles table exists with the correct structure
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    role user_role NOT NULL,
    district TEXT,
    state TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Add foreign key constraint if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
    ON public.profiles 
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Create or replace function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, district, state)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'customer'),
        COALESCE(NEW.raw_user_meta_data ->> 'district', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'state', '')
    );
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
