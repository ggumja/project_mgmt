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
            .order('sort_order', { ascending: true })
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
    /**
     * 기능정의서를 생성하거나 업데이트합니다.
     * 업데이트 시 버전이 0.1 증가하고 이력이 저장됩니다.
     */
    async upsertSpec(spec: Partial<FunctionalSpec>, changeSummary?: string, userId?: string): Promise<FunctionalSpec> {
        let finalSpec = { ...spec };
        let historyEntry = null;

        // If updating an existing spec (has ID), handle versioning logic
        if (spec.id) {
            // First fetch the current spec to get the latest version
            const { data: currentSpec, error: fetchError } = await supabase
                .from('functional_specs')
                .select('version')
                .eq('id', spec.id)
                .single();

            if (!fetchError && currentSpec) {
                const oldVersion = currentSpec.version || '1.0';
                // Increment version by 0.1
                const newVersion = (parseFloat(oldVersion) + 0.1).toFixed(1);
                finalSpec.version = newVersion;

                // Prepare history entry
                historyEntry = {
                    spec_id: spec.id,
                    previous_version: oldVersion,
                    new_version: newVersion,
                    change_summary: changeSummary || '수정됨',
                    changed_by: userId
                };
            }
        }

        const { data, error } = await supabase
            .from('functional_specs')
            .upsert(finalSpec)
            .select()
            .single()

        if (error) {
            console.error('Error upserting spec:', error)
            throw error
        }

        // If update was successful and we have a history entry, save it
        if (historyEntry) {
            const { error: historyError } = await supabase.from('spec_histories').insert(historyEntry);
            if (historyError) {
                console.error('Failed to save spec history:', historyError);
            }
        }

        return data as FunctionalSpec
    },

    /**
     * 기능정의서의 변경 이력을 가져옵니다.
     */
    async getSpecHistory(specId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('spec_histories')
            .select('*')
            .eq('spec_id', specId)
            .order('changed_at', { ascending: false });

        if (error) {
            console.error('Error fetching spec history:', error);
            return [];
        }
        return data;
    },

    /**
     * 순서를 업데이트합니다.
     */
    async updateSpecOrder(id: string, newOrder: number): Promise<void> {
        const { error } = await supabase
            .from('functional_specs')
            .update({ sort_order: newOrder })
            .eq('id', id)

        if (error) {
            console.error('Error updating spec order:', error)
            throw error
        }
    },

    async updateSpecOrders(updates: { id: string, sort_order: number }[]): Promise<void> {
        // Supabase doesn't support bulk update easily in one query without RPC,
        // so we'll do it in a loop or Promise.all. For small datasets this is fine.
        // For larger ones, a stored procedure or unnesting in SQL is better.

        await Promise.all(updates.map(update =>
            supabase
                .from('functional_specs')
                .update({ sort_order: update.sort_order })
                .eq('id', update.id)
        ));
    },

    /**
     * 기능정의서를 삭제합니다.
     */
    async deleteSpec(id: string): Promise<void> {
        const { error } = await supabase
            .from('functional_specs')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting spec:', error)
            throw error
        }
    },
}
