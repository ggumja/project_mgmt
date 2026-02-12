const { Client } = require('pg');
const client = new Client({
    connectionString: 'postgresql://postgres.hkjrylzkxvfjnepcozvg:7kV22%2FgBKc_V!V3@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('Connected!');
        const res = await client.query(`
            ALTER TABLE public.functional_specs 
            ADD COLUMN IF NOT EXISTS large_category TEXT,
            ADD COLUMN IF NOT EXISTS medium_category TEXT,
            ADD COLUMN IF NOT EXISTS small_category TEXT,
            ADD COLUMN IF NOT EXISTS description TEXT,
            ADD COLUMN IF NOT EXISTS dev_scope TEXT;
        `);
        console.log('Migrated!');
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
run();
