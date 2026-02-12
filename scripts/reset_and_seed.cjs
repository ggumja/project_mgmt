const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;
const projectId = '00000000-0000-0000-0000-000000000002'; // Default project ID from App.tsx

const client = new Client({
    user: 'postgres.hkjrylzkxvfjnepcozvg', // Supabase pooler requires this format
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    database: 'postgres',
    password: '7kV22/gBKc_V!V3',
    port: 6543,
    ssl: { rejectUnauthorized: false }
});

const dummyData = [
    {
        large: '🏢 01. 스마트 자산관리',
        medium: '자산 등록',
        small: '장비 QR 코드 생성',
        title: '신규 장비 입고시 QR 코드 자동 생성 기능',
        description: '병재 입고되는 의료 장비에 대해 고유 QR 코드를 생성하고 스티커 출력 인터페이스를 제공한다.',
        scope: '1차'
    },
    {
        large: '🏢 01. 스마트 자산관리',
        medium: '자산 등록',
        small: '자산 이력 관리',
        title: '장비 위치 변경 및 이력 추적 시스템',
        description: '장비의 이동 경로 및 현재 위치(병동/호실)를 실시간으로 업데이트하고 이력을 보관한다.',
        scope: '1차'
    },
    {
        large: '🏢 01. 스마트 자산관리',
        medium: '수리/유지보수',
        small: '정기 점검 알림',
        title: '의료기기 법정 정기점검 스케줄 알림',
        description: '법정 점검 주기에 맞춰 담당자에게 푸시 알림 및 이메일을 발송한다.',
        scope: '2차'
    },
    {
        large: '🛒 02. B2B 통합구매',
        medium: '상품 카탈로그',
        small: '파트너사별 단가표',
        title: '병원별 맞춤형 구매 단가 적용 엔진',
        description: '로그인한 병원(기관)의 계약 조건에 따라 실시간으로 상품 가격을 계산하여 표시한다.',
        scope: '1차'
    },
    {
        large: '🛒 02. B2B 통합구매',
        medium: '발주 프로세스',
        small: '다단계 승인',
        title: '발주 요청서 전자 결재 프로세스',
        description: '주문 요청 시 관리자 승인을 거쳐 최종 발주가 진행되는 워크플로우를 구현한다.',
        scope: '1차'
    },
    {
        large: '📊 03. 정산 및 통계',
        medium: '월간 정산',
        small: '전자 세금계산서',
        title: '국세청 연동 세금계산서 자동 발행',
        description: '정산 확정 시 파트너사에게 세금계산서를 자동으로 발행하고 결과를 리포팅한다.',
        scope: '추가논의'
    }
];

async function resetAndSeed() {
    try {
        console.log('🔄 Connecting to database...');
        await client.connect();

        console.log('🗑️  Deleting all existing functional spec data...');
        await client.query('DELETE FROM public.functional_specs');

        console.log('🌱 Inserting new dummy data...');
        for (const item of dummyData) {
            const category = `${item.large}|${item.medium}|${item.small}|${item.description}|${item.scope}`;
            const query = `
                INSERT INTO public.functional_specs 
                (id, project_id, title, description, category, large_category, medium_category, small_category, dev_scope, priority, status, version, created_at, updated_at)
                VALUES 
                (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, 'high', 'draft', '1.0', now(), now())
            `;
            const values = [
                projectId,
                item.title,
                item.description,
                category,
                item.large,
                item.medium,
                item.small,
                item.scope
            ];
            await client.query(query, values);
            console.log(`✅ Inserted: ${item.title}`);
        }

        console.log('\n✨ Database reset and seeding completed successfully!');
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await client.end();
    }
}

resetAndSeed();
