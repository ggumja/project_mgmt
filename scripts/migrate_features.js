import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const ADMIN_ID = '00000000-0000-0000-0000-000000000001';
const PROJECT_ID = '00000000-0000-0000-0000-000000000002';

function parseMarkdown(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const specs = [];
    let currentLarge = '';
    let currentMedium = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // 대분류 (H2)
        if (line.startsWith('## ')) {
            const h2Text = line.replace('## ', '').trim();
            if (!h2Text.includes('기능 리스트') && !h2Text.includes('고려사항') && !h2Text.includes('다음 단계') && !h2Text.includes('우선순위별')) {
                currentLarge = h2Text;
            }
            continue;
        }

        // 중분류 (H3)
        if (line.startsWith('###')) {
            const h3Text = line.replace('###', '').trim();
            if (h3Text.includes('목차')) continue;
            currentMedium = h3Text;
            continue;
        }

        // 소분류 (Checklist items)
        if (lines[i].trim().startsWith('- [ ] **')) {
            const titleLine = lines[i].trim();
            const title = titleLine.match(/\*\*([^*]+)\*\*/)?.[1];

            if (title) {
                // Collect description
                let description = '';
                let j = i + 1;
                while (j < lines.length && (lines[j].trim() === '' || lines[j].startsWith('  '))) {
                    const descLine = lines[j].trim();
                    if (descLine) {
                        description += (description ? ' ' : '') + descLine.replace('- ', '');
                    }
                    j++;
                }

                // Determine Scope based on current categories or title
                let devScope = '1차'; // Default

                // Logic based on section numbers in medium category
                if (currentMedium.startsWith('1.6') || currentMedium.startsWith('1.7') || currentMedium.startsWith('1.8') ||
                    currentMedium.includes('승인 워크플로우') || currentMedium.includes('대량 주문') ||
                    currentMedium.includes('정산 관리') || currentMedium.includes('고객 관리')) {
                    devScope = '2차';
                } else if (currentMedium.startsWith('2.5') || currentMedium.startsWith('2.7') ||
                    currentMedium.startsWith('2.8') || currentMedium.startsWith('2.9') ||
                    currentMedium.startsWith('2.10')) {
                    devScope = '추가논의';
                }

                // HACK: Store description and scope in category field as | separated value
                // FORMAT: large|medium|description|scope
                const finalCategory = `${currentLarge}|${currentMedium}|${description || '상세 정보가 없습니다.'}|${devScope}`;

                specs.push({
                    title,
                    category: finalCategory,
                    priority: 'medium',
                    status: 'draft',
                    version: '1.0',
                    content: `### ${title}\n\n${description || '상세 정보가 없습니다.'}`
                });

                i = j - 1;
            }
        }
    }

    return specs;
}

async function run() {
    console.log(`Starting migration (category hack v2 - with scope) to Project: ${PROJECT_ID}`);

    const filePath = path.resolve('docs/b2b_feature_list.md');
    const specs = parseMarkdown(filePath);

    console.log(`Parsed ${specs.length} features. Starting bulk upload...`);

    // Clear existing
    await supabase.from('functional_specs').delete().eq('project_id', PROJECT_ID);

    const payload = specs.map(spec => ({
        ...spec,
        project_id: PROJECT_ID,
        created_by: ADMIN_ID
    }));

    const { data, error } = await supabase
        .from('functional_specs')
        .insert(payload)
        .select();

    if (error) {
        console.error('Migration failed:', error.message);
    } else {
        console.log(`✅ Successfully imported ${data.length} features with description & scope hack!`);
    }
}

run();
