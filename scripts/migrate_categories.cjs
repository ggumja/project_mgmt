
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function migrate() {
    console.log("Starting migration of categories...");

    // 1. Fetch all specs
    const { data: specs, error } = await supabase.from('functional_specs').select('*');
    if (error) {
        console.error("Error fetching specs:", error);
        return;
    }

    console.log(`Found ${specs.length} specs to assume.`);

    let updatedCount = 0;

    for (const spec of specs) {
        if (!spec.category) continue;

        // Skip if already migrated (optional, but good for idempotency if we trust the columns)
        // But since we want to fix nulls, we process if any target column is missing
        if (spec.large_category && spec.medium_category && spec.spec_code) continue;

        const segments = spec.category.split('|');
        let updateData = {};

        // Logic mirrored from SpecEditor.tsx
        if (segments.length >= 8) {
            // Format: Code|Large|Medium|Small|Desc|Scope|Imp|Notes
            updateData = {
                spec_code: segments[0] || null,
                large_category: segments[1] || null,
                medium_category: segments[2] || null,
                small_category: segments[3] || null,
                description: segments[4] || spec.description || null,
                dev_scope: segments[5] || spec.dev_scope || '1차',
                importance: segments[6] || spec.importance || null,
                notes: segments[7] || spec.notes || null,
            };
        } else if (segments.length >= 5) {
            // Old Format: Large|Medium|Small|Desc|Scope
            updateData = {
                large_category: segments[0] || null,
                medium_category: segments[1] || null,
                small_category: segments[2] || null,
                description: segments[3] || spec.description || null,
                dev_scope: segments[4] || spec.dev_scope || '1차',
            };
        } else {
            // Fallback or skip
            continue;
        }

        // Clean up empty strings to nulls or keep them? 
        // DB allows nulls. Empty string might be better for UI if it expects strings.
        // The previous checkData showed nulls.

        // Perform update
        const { error: updateError } = await supabase
            .from('functional_specs')
            .update(updateData)
            .eq('id', spec.id);

        if (updateError) {
            console.error(`Failed to update spec ${spec.id}:`, updateError);
        } else {
            updatedCount++;
        }
    }

    console.log(`Migration complete. Updated ${updatedCount} specs.`);
}

migrate();
