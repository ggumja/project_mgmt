const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'db.hkjrylzkxvfjnepcozvg.supabase.co',
    database: 'postgres',
    password: '7kV22/gBKc_V!V3',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('Connected');
        await client.query('ALTER TABLE public.functional_specs ADD COLUMN IF NOT EXISTS spec_code TEXT');
        await client.query('ALTER TABLE public.functional_specs ADD COLUMN IF NOT EXISTS importance TEXT');
        await client.query('ALTER TABLE public.functional_specs ADD COLUMN IF NOT EXISTS notes TEXT');
        await client.query('ALTER TABLE public.functional_specs ADD COLUMN IF NOT EXISTS large_category TEXT');
        await client.query('ALTER TABLE public.functional_specs ADD COLUMN IF NOT EXISTS medium_category TEXT');
        await client.query('ALTER TABLE public.functional_specs ADD COLUMN IF NOT EXISTS small_category TEXT');
        await client.query('ALTER TABLE public.functional_specs ADD COLUMN IF NOT EXISTS description TEXT');
        await client.query('ALTER TABLE public.functional_specs ADD COLUMN IF NOT EXISTS dev_scope TEXT');
        console.log('Done');
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
run();
