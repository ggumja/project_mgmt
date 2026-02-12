import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
    // Try to select all from a single row to see what columns come back
    const { data, error } = await supabase
        .from('functional_specs')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Columns found in functional_specs (via API):');
        if (data && data.length > 0) {
            console.log(Object.keys(data[0]));
        } else {
            console.log('No data found to check columns.');
            // Try to select specific columns to see which ones fail
            const columns = ['id', 'title', 'category', 'spec_code', 'large_category', 'description'];
            for (const col of columns) {
                const { error: colError } = await supabase.from('functional_specs').select(col).limit(1);
                if (colError) {
                    console.log(`Column ${col}: MISSING (${colError.message})`);
                } else {
                    console.log(`Column ${col}: OK`);
                }
            }
        }
    }
}

checkColumns();
