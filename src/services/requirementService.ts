import { supabase } from '@/lib/supabase'
import { Requirement } from '@/types'

export const requirementService = {
    /**
     * 프로젝트의 모든 요구사항 목록을 가져옵니다.
     */
    async getRequirementsByProject(projectId: string): Promise<Requirement[]> {
        const { data, error } = await supabase
            .from('requirements')
            .select('*')
            .eq('project_id', projectId)
            .order('req_code', { ascending: true })

        if (error) {
            console.error('Error fetching requirements:', error)
            throw error
        }

        return data as Requirement[]
    },

    /**
     * 요구사항을 생성하거나 업데이트합니다.
     */
    async upsertRequirement(requirement: Partial<Requirement>): Promise<Requirement> {
        const { data, error } = await supabase
            .from('requirements')
            .upsert(requirement)
            .select()
            .single()

        if (error) {
            console.error('Error upserting requirement:', error)
            throw error
        }

        return data as Requirement
    },

    /**
     * 특정 기능정의서에 연결된 요구사항 목록을 가져옵니다.
     */
    async getRequirementsBySpec(specId: string): Promise<Requirement[]> {
        const { data, error } = await supabase
            .from('requirements')
            .select('*')
            .eq('functional_spec_id', specId)

        if (error) {
            console.error('Error fetching requirements for spec:', error)
            throw error
        }

        return data as Requirement[]
    },

    /**
     * 요구사항을 특정 기능정의서에 연결하거나 해제합니다.
     */
    async updateMapping(requirementId: string, specId: string | null): Promise<Requirement> {
        const { data, error } = await supabase
            .from('requirements')
            .update({ functional_spec_id: specId })
            .eq('id', requirementId)
            .select()
            .single()

        if (error) {
            console.error('Error updating mapping:', error)
            throw error
        }

        return data as Requirement
    }
}
