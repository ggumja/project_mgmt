import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

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

async function run() {
    try {
        await client.connect();
        console.log('Adding description column via pooler...');
        await client.query(`
      ALTER TABLE public.functional_specs 
      ADD COLUMN IF NOT EXISTS description TEXT;
    `);
        console.log('✅ Description column added successfully!');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
