export type Role = 'admin' | 'manager' | 'viewer';

export interface User {
    id: string;
    username: string; // login id (e.g., email or emp code)
    password?: string; // Simplistic for demo (in production: hash/salt)
    name: string;
    description?: string;
    role: Role;
    department?: string;
    email?: string;
    last_login?: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

export interface UserActivity {
    id: string;
    user_id: string;
    user_name: string;
    action: 'LOGIN' | 'LOGOUT' | 'create' | 'update' | 'delete' | 'view';
    target: string; // e.g., 'Spec: FM-001' or 'System'
    details?: string;
    timestamp: string;
    ip_address?: string;
}
