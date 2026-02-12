const { Client } = require('pg');

const projectRef = 'hkjrylzkxvfjnepcozvg';
const user = `postgres.${projectRef}`;
const pass = '7kV22/gBKc_V!V3';
// Try the common pooler host for Seoul region (likely for Korean user)
const host = 'aws-0-ap-northeast-2.pooler.supabase.com';
const port = '5432';
const db = 'postgres';

const client = new Client({
    user: user,
    password: pass,
    host: host,
    port: port,
    database: db,
    ssl: { rejectUnauthorized: false }
});

async function testConnection() {
    try {
        console.log(`Connecting to ${host}...`);
        await client.connect();
        console.log('Connected successfully!');
        const res = await client.query('SELECT current_user, current_database()');
        console.log('Result:', res.rows[0]);
    } catch (err) {
        console.error('Connection failed:', err.message);
    } finally {
        await client.end();
    }
}

testConnection();
