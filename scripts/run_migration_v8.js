const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
}

// Manually fix strictly for this known issue if generic parsing fails
// But better, let's try to let pg parse it, or fix the specific password issue if we can identify it.
// The issue is likely the '!' or '/' in the password in the URL.
// We can try to use the connection string as is, but if it fails, we might need to URL encode the password.

console.log('Attempting migration...');

const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false } // Required for Supabase
});

async function run() {
    try {
        await client.connect();

        const sql = `
            ALTER TABLE public.requirements
            ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES public.user_profiles(id),
            ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
        `;

        await client.query(sql);
        console.log('Migration Successfully Applied: Reviewer columns added.');
    } catch (err) {
        console.error('Migration failed:', err);
        // If it was a URL error, we might log a hint
        if (err.code === 'ERR_INVALID_URL') {
            console.error('HINT: The DATABASE_URL in .env might contain unescaped characters in the password.');
        }
    } finally {
        await client.end();
    }
}

run();
