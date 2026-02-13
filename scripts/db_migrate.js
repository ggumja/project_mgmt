
import pg from 'pg';
const { Client } = pg;

// Helper to run migration
async function migrate() {
    // Hardcoded escaped connection string to bypass parsing issues
    const connectionString = 'postgresql://postgres:7kV22%2FgBKc_V%21V3@db.hkjrylzkxvfjnepcozvg.supabase.co:5432/postgres';

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database...');

        // Add columns
        const sql = `
      ALTER TABLE public.requirements
      ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES public.user_profiles(id),
      ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    `;

        await client.query(sql);
        console.log('✅ Migration successful: Reviewer columns added.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
