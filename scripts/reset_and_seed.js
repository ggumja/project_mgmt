import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const projectId = '00000000-0000-0000-0000-000000000002';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetAndSeed() {
    try {
        console.log('📖 Reading data from data/specs.json...');
        const specsJsonPath = path.join(__dirname, '../data/specs.json');
        const specsData = JSON.parse(fs.readFileSync(specsJsonPath, 'utf8'));

        console.log('🗑️  Deleting all existing functional spec data...');
        const { error: deleteError } = await supabase
            .from('functional_specs')
            .delete()
            .eq('project_id', projectId);

        if (deleteError && deleteError.code !== 'PGRST116') throw deleteError;

        console.log(`🌱 Inserting ${specsData.length} records...`);
        const specsToInsert = specsData.map(item => ({
            project_id: projectId,
            title: item.title,
            // 8 segments: spec_code|large|medium|small|description|dev_scope|importance|notes
            // This packed format is used as the source of truth by the UI parsing logic
            category: `${item.spec_code || ''}|${item.large_category || ''}|${item.medium_category || ''}|${item.small_category || ''}|${item.description || ''}|${item.dev_scope || '1차'}|${item.importance || ''}|${item.notes || ''}`,
            priority: (item.importance === '상') ? 'high' : 'medium',
            status: 'draft',
            version: '1.0',
            content: `### ${item.title}\n\n${item.description || '상세 정보가 없습니다.'}`
        }));

        const { error: insertError } = await supabase
            .from('functional_specs')
            .insert(specsToInsert);

        if (insertError) throw insertError;

        console.log('\n✨ Database reset and seeding completed successfully!');
        console.log('Successfully organized DB records based on individual columns and category string.');
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

resetAndSeed();
