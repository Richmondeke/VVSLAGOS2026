-- community_members table
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 16 AND age <= 120),
    email TEXT NOT NULL,
    occupation TEXT NOT NULL,
    city TEXT NOT NULL,
    gender TEXT NOT NULL,
    interests TEXT[] DEFAULT '{}',
    selfie_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for form submissions)
CREATE POLICY "Allow public inserts on community_members"
    ON public.community_members
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow authenticated reads (for admin dashboard)
CREATE POLICY "Allow authenticated reads on community_members"
    ON public.community_members
    FOR SELECT
    TO authenticated
    USING (true);

-- Create selfies storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('selfies', 'selfies', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to selfies bucket
CREATE POLICY "Allow public selfie uploads"
    ON storage.objects
    FOR INSERT
    TO anon
    WITH CHECK (bucket_id = 'selfies');

-- Allow public reads from selfies bucket
CREATE POLICY "Allow public selfie reads"
    ON storage.objects
    FOR SELECT
    TO anon
    USING (bucket_id = 'selfies');
