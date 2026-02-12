import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function tryInsert() {
    const dummyId = '00000000-0000-0000-0000-000000000001';
    const { data, error } = await supabase.from('user_profiles').insert({
        id: dummyId,
        email: 'admin@example.com',
        name: 'Admin',
        role: 'admin'
    }).select();

    console.log('Insert Result:', data, 'Error:', error);
}
tryInsert();
