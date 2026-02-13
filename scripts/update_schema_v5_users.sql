-- Add missing columns to user_profiles table matches User interface
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS password TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Ensure username is unique
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_username_key') THEN
        ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- Update existing admin user with missing fields if needed
UPDATE public.user_profiles
SET 
  username = 'admin',
  password = 'password123',
  department = 'IT Team',
  status = 'active'
WHERE email = 'admin@example.com' AND (username IS NULL OR username = '');

-- If admin doesn't exist, insert it (using the same ID from setup_tables.sql)
INSERT INTO public.user_profiles (id, email, name, role, username, password, department, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@jeisys.com', 
  'Jeisys Admin', 
  'admin',
  'admin',
  'password123',
  'IT Team',
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  department = EXCLUDED.department,
  status = EXCLUDED.status;

-- Create user_activity_logs table
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_name TEXT,
  action TEXT,
  target TEXT,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT
);
