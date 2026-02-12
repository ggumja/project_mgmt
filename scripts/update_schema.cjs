const { Client } = require('pg');

const client = new Client({
    user: 'postgres.hkjrylzkxvfjnepcozvg',
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    database: 'postgres',
    password: '7kV22/gBKc_V!V3',
    port: 6543,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('🚀 Connected to Supabase!');

        const query = `
            ALTER TABLE public.functional_specs 
            ADD COLUMN IF NOT EXISTS spec_code TEXT,
            ADD COLUMN IF NOT EXISTS large_category TEXT,
            ADD COLUMN IF NOT EXISTS medium_category TEXT,
            ADD COLUMN IF NOT EXISTS small_category TEXT,
            ADD COLUMN IF NOT EXISTS description TEXT,
            ADD COLUMN IF NOT EXISTS dev_scope TEXT,
            ADD COLUMN IF NOT EXISTS importance TEXT,
            ADD COLUMN IF NOT EXISTS notes TEXT;
            
            COMMENT ON COLUMN public.functional_specs.spec_code IS '기능 ID';
            COMMENT ON COLUMN public.functional_specs.large_category IS '대분류';
            COMMENT ON COLUMN public.functional_specs.medium_category IS '중분류';
            COMMENT ON COLUMN public.functional_specs.small_category IS '소분류';
            COMMENT ON COLUMN public.functional_specs.description IS '기능설명/기능내역';
            COMMENT ON COLUMN public.functional_specs.dev_scope IS '개발순차';
            COMMENT ON COLUMN public.functional_specs.importance IS '중요도';
            COMMENT ON COLUMN public.functional_specs.notes IS '비고';
        `;

        await client.query(query);
        console.log('✅ Schema updated successfully!');

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

run();
