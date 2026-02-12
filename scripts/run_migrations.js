import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse DATABASE_URL manually to handle special characters in password
const dbUrl = process.env.DATABASE_URL;
let config;

try {
    const url = new URL(dbUrl);
    config = {
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    };
} catch (e) {
    // If URL parsing fails (likely due to special chars in password), try manual parsing
    console.log('Standard URL parsing failed, attempting manual parsing...');
    const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
        config = {
            user: match[1],
            password: match[2],
            host: match[3],
            port: match[4],
            database: match[5],
            ssl: { rejectUnauthorized: false }
        };
    } else {
        throw new Error('Could not parse DATABASE_URL');
    }
}

const pool = new pg.Pool(config);

async function runMigration(filePath) {
    const sql = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    console.log(`Running migration: ${fileName}...`);
    try {
        await pool.query(sql);
        console.log(`✅ Successfully ran ${fileName}`);
    } catch (err) {
        console.error(`❌ Error running ${fileName}:`, err.message);
    }
}

async function main() {
    try {
        // Run v2 (discrete columns)
        await runMigration(path.join(__dirname, 'update_schema_v2.sql'));

        // Run v3 (sort order)
        await runMigration(path.join(__dirname, 'update_schema_v3_sort_order.sql'));

        console.log('All migrations completed.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

main();
