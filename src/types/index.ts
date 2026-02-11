export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'draft' | 'review' | 'approved';
export type Category = 'product' | 'order' | 'member' | 'B2B_special' | 'settlement';

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
    title: string;
    description?: string;
    category: Category;
    priority: Priority;
    status: Status;
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
}
