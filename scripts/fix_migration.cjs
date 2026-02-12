const { Client } = require('pg');

// Manually encoded password for the URL
const user = 'postgres';
const pass = encodeURIComponent('7kV22/gBKc_V!V3');
const host = 'db.hkjrylzkxvfjnepcozvg.supabase.co';
const port = '5432';
const db = 'postgres';

const connectionString = `postgresql://${user}:${pass}@${host}:${port}/${db}`;

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    try {
        await client.connect();
        console.log('Successfully connected to the database!');

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
        console.log('Migration completed successfully! Columns added.');
    } catch (err) {
        console.error('Migration failed:', err.message);
        if (err.code === 'ENOTFOUND') {
            console.log('Host not found. Trying alternative host...');
            // Sometimes it's direct to the project ref
            // postgresql://postgres:[password]@db.hkjrylzkxvfjnepcozvg.supabase.co:5432/postgres
        }
    } finally {
        await client.end();
    }
}

runMigration();
