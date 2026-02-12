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

async function checkSpec() {
    const { data, error } = await supabase
        .from('functional_specs')
        .select('title, category')
        .eq('title', '회원가입')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Spec Data for "회원가입":');
        console.log(JSON.stringify(data, null, 2));
    }
}

checkSpec();
