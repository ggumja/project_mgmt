import pkg from 'pg';
const { Client } = pkg;

const config = {
    user: 'postgres.hkjrylzkxvfjnepcozvg',
    password: '7kV22/gBKc_V!V3',
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: {
        rejectUnauthorized: false
    }
};

const client = new Client(config);

async function migrate() {
    try {
        await client.connect();
        console.log('🚀 Starting comprehensive migration...');

        const query = `
            ALTER TABLE public.functional_specs 
            ADD COLUMN IF NOT EXISTS large_category TEXT,
            ADD COLUMN IF NOT EXISTS medium_category TEXT,
            ADD COLUMN IF NOT EXISTS small_category TEXT,
            ADD COLUMN IF NOT EXISTS description TEXT,
            ADD COLUMN IF NOT EXISTS dev_scope TEXT;
        `;

        await client.query(query);
        console.log('✅ All category and detail columns ensured successfully!');

        // Data backfill from 'category' string to new columns
        console.log('🔄 Backfilling data from legacy "category" string...');
        const backfillQuery = `
            UPDATE public.functional_specs
            SET 
                large_category = COALESCE(large_category, split_part(category, '|', 1)),
                medium_category = COALESCE(medium_category, split_part(category, '|', 2)),
                small_category = COALESCE(small_category, split_part(category, '|', 3)),
                description = COALESCE(description, split_part(category, '|', 4)),
                dev_scope = COALESCE(dev_scope, split_part(category, '|', 5))
            WHERE (category IS NOT NULL AND category != '') AND (
                large_category IS NULL OR 
                medium_category IS NULL OR 
                small_category IS NULL OR 
                description IS NULL OR 
                dev_scope IS NULL
            );
        `;
        const res = await client.query(backfillQuery);
        console.log(`✅ Backfilled ${res.rowCount} rows.`);

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

migrate();
