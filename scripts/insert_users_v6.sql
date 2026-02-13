-- =============================================
-- [Schema Update] Ensure User Columns Exist
-- =============================================
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS password TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Ensure username is unique for ON CONFLICT to work
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_username_key') THEN
        ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- =============================================
-- [Data Insert] Register Requested Users
-- =============================================

-- 1. 관리자 (Admin)
INSERT INTO public.user_profiles (id, email, name, role, username, password, department, status)
VALUES (
    '00000000-0000-0000-0000-000000000001', -- Fixed ID for admin
    'daniel@letsoncloud.com',
    '관리자',
    'admin',
    'admin',
    'gkehdgus',
    'Management',
    'active'
)
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- 2. 제이시스IT (Manager)
INSERT INTO public.user_profiles (id, email, name, role, username, password, department, status)
VALUES (
    gen_random_uuid(),
    'jeisys@letsoncloud.com',
    '제이시스IT',
    'manager',
    'jeisys',
    'jeisyspass',
    'IT Team',
    'active'
)
ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    role = EXCLUDED.role;

-- 3. 레츠온클라우드 (Viewer)
INSERT INTO public.user_profiles (id, email, name, role, username, password, department, status)
VALUES (
    gen_random_uuid(),
    'letson@letsoncloud.com',
    '레츠온클라우드',
    'viewer',
    'letson',
    'letsonpass',
    'Partner',
    'active'
)
ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    role = EXCLUDED.role;

-- 4. 개발 (Manager)
INSERT INTO public.user_profiles (id, email, name, role, username, password, department, status)
VALUES (
    gen_random_uuid(),
    'dev@letsoncloud.com',
    '개발',
    'manager',
    'dev',
    'devpass',
    'Development',
    'active'
)
ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    role = EXCLUDED.role;

-- 5. 디자인 (Manager)
INSERT INTO public.user_profiles (id, email, name, role, username, password, department, status)
VALUES (
    gen_random_uuid(),
    'design@letsoncloud.com',
    '디자인',
    'manager',
    'design',
    'designpass',
    'Design',
    'active'
)
ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    role = EXCLUDED.role;
