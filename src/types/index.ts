export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'todo' | 'in_progress' | 'done';
export type Category = 'product' | 'order' | 'member' | 'B2B_special' | 'settlement';
export type DevScope = '1차' | '2차' | '추가논의';

export interface Project {
    id: string;
    name: string;
    description?: string;
    status: 'active' | 'archived' | 'completed';
    created_at: string;
    updated_at: string;
}

export interface FunctionalSpec {
    id: string;
    project_id: string;
    spec_code?: string; // 추가: 기능 ID (예: FM-0001)
    title: string;
    description?: string;
    category: string;
    large_category?: string;
    medium_category?: string;
    small_category?: string;
    importance?: string; // 추가: 중요도
    notes?: string;      // 추가: 비고
    priority: Priority;
    status: Status;
    dev_scope?: DevScope;
    sort_order?: number; // Manual ordering field
    version: string;
    content?: string;
    created_at: string;
    updated_at: string;
}

export interface Requirement {
    id: string;
    project_id: string;
    functional_spec_id?: string;
    req_code: string;
    req_type: 'functional' | 'non-functional';
    title: string;
    description?: string;
    acceptance_criteria?: string;
    priority: 'must' | 'should' | 'could' | 'wont';
    status: 'draft' | 'review' | 'approved' | 'rejected' | 'implemented';
    version: string;
    created_at: string;
    updated_at: string;
    created_by?: string;
    author_name?: string;
    reviewer_id?: string;
    reviewed_at?: string;
    rejection_reason?: string;
}

export interface SpecHistory {
    id: string;
    spec_id: string;
    previous_version: string;
    new_version: string;
    changed_at: string;
    changed_by?: string;
    change_summary: string;
}
