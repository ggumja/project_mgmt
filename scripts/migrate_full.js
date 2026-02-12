import fs from 'fs';
import path from 'path';
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const config = {
    user: 'postgres.hkjrylzkxvfjnepcozvg',
    password: '7kV22/gBKc_V!V3',
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 6543, // Transaction mode
    database: 'postgres',
    ssl: {
        rejectUnauthorized: false
    }
};

const client = new Client(config);

async function initDbAndMigrate() {
    try {
        console.log('Connecting to Supabase Transaction Pooler (6543):', config.host);
        await client.connect();
        console.log('Connected to PostgreSQL successfully.');

        // Since we might not have the tables yet, let's create them!
        console.log('Creating tables...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.user_profiles (
        id UUID PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.projects (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_by UUID REFERENCES public.user_profiles(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.functional_specs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        category TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'draft',
        version TEXT DEFAULT '1.0',
        content TEXT,
        created_by UUID REFERENCES public.user_profiles(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

        let userId = uuidv4();
        console.log(`Using test user ID: ${userId}`);

        await client.query(`
      INSERT INTO public.user_profiles (id, email, name, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
    `, [userId, 'admin@example.com', 'Admin', 'admin']);

        const projectName = 'Jeisys B2B Shopping Mall';
        let projectId;
        const { rows: projects } = await client.query('SELECT id FROM public.projects WHERE name = $1', [projectName]);

        if (projects.length > 0) {
            projectId = projects[0].id;
        } else {
            const result = await client.query(`
        INSERT INTO public.projects (name, description, status, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [projectName, 'Imported from B2B Feature List', 'active', userId]);
            projectId = result.rows[0].id;
        }

        const filePath = path.resolve('docs/b2b_feature_list.md');
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        const specs = [];
        let currentCategory = 'common';
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.includes('## 📦 1.')) currentCategory = 'common';
            else if (line.includes('## 🏢 2.')) currentCategory = 'B2B_special';

            if (line.startsWith('###')) {
                const title = line.replace('###', '').trim();
                if (title && !title.includes('목차')) specs.push({ title, category: currentCategory });
            } else if (line.startsWith('- [ ] **')) {
                const title = line.match(/\*\*([^*]+)\*\*/)?.[1];
                if (title) specs.push({ title, category: currentCategory });
            }
        }

        console.log(`Importing ${specs.length} specs...`);
        for (const spec of specs) {
            await client.query(`
        INSERT INTO public.functional_specs (project_id, title, category, priority, status, created_by, content)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [projectId, spec.title, spec.category, 'medium', 'draft', userId, `### ${spec.title}\n\n자동 생성된 명세입니다.`]);
        }

        console.log('✅ Success: Tables created and features imported!');

    } catch (err) {
        console.error('❌ Final Error:', err);
    } finally {
        await client.end();
    }
}

initDbAndMigrate();
