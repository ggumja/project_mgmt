import { supabase } from '@/lib/supabase'
import { FunctionalSpec } from '@/types'

export const specService = {
    /**
     * 모든 기능정의서 목록을 가져옵니다.
     */
    async getSpecsByProject(projectId: string): Promise<FunctionalSpec[]> {
        const { data, error } = await supabase
            .from('functional_specs')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching specs:', error)
            throw error
        }

        return data as FunctionalSpec[]
    },

    /**
     * 단일 기능정의서를 가져옵니다.
     */
    async getSpecById(id: string): Promise<FunctionalSpec> {
        const { data, error } = await supabase
            .from('functional_specs')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching spec:', error)
            throw error
        }

        return data as FunctionalSpec
    },

    /**
     * 기능정의서를 생성하거나 업데이트합니다.
     */
    async upsertSpec(spec: Partial<FunctionalSpec>): Promise<FunctionalSpec> {
        const { data, error } = await supabase
            .from('functional_specs')
            .upsert(spec)
            .select()
            .single()

        if (error) {
            console.error('Error upserting spec:', error)
            throw error
        }

        return data as FunctionalSpec
    }
}
