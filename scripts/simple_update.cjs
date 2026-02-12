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
        console.log('Connected');
        await client.query('ALTER TABLE public.functional_specs ADD COLUMN IF NOT EXISTS spec_code TEXT');
        await client.query('ALTER TABLE public.functional_specs ADD COLUMN IF NOT EXISTS importance TEXT');
        await client.query('ALTER TABLE public.functional_specs ADD COLUMN IF NOT EXISTS notes TEXT');
        console.log('Done');
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
run();
