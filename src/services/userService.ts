import { supabase } from '@/lib/supabase';
import { User, UserActivity } from '@/types/user';

export const userService = {
    // --- Auth ---
    getCurrentUser: (): User | null => {
        // Session management is still done via localStorage for simplicity in this demo,
        // but can be upgraded to Supabase Auth.
        // For now, we trust the local storage session which is set after login.
        const session = localStorage.getItem('jeisys_session');
        return session ? JSON.parse(session) : null;
    },

    login: async (username: string, password: string): Promise<User | null> => {
        // Simulate API delay needed? Not really with Supabase call.

        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('username', username)
            .eq('password', password) // In production, never query password directly. Use Supabase Auth or hash comparison.
            .single();

        if (error || !data) {
            console.error('Login failed:', error);
            return null;
        }

        const user = data as User;

        if (user.status === 'active') {
            // Update last login
            const updatedUser = { ...user, last_login: new Date().toISOString() };
            await userService.updateUser(updatedUser);

            // Set session
            localStorage.setItem('jeisys_session', JSON.stringify(updatedUser));

            // Log activity
            await userService.logActivity({
                user_id: user.id,
                user_name: user.name,
                action: 'LOGIN',
                target: 'System',
                details: 'User logged in successfully'
            });

            return updatedUser;
        }
        return null;
    },

    logout: async () => {
        const user = userService.getCurrentUser();
        if (user) {
            await userService.logActivity({
                user_id: user.id,
                user_name: user.name,
                action: 'LOGOUT',
                target: 'System',
                details: 'User logged out'
            });
        }
        localStorage.removeItem('jeisys_session');
    },

    // --- User Management ---
    getUsers: async (): Promise<User[]> => {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
        return data as User[];
    },

    addUser: async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
        // Check if username exists
        const { data: existing } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('username', user.username)
            .single();

        if (existing) {
            throw new Error('Username already exists');
        }

        const newUser = {
            ...user,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('user_profiles')
            .insert(newUser)
            .select()
            .single();

        if (error) {
            console.error('Error creating user:', error);
            throw error;
        }

        // Log creation
        const currentUser = userService.getCurrentUser();
        if (currentUser) {
            await userService.logActivity({
                user_id: currentUser.id,
                user_name: currentUser.name,
                action: 'create',
                target: `User: ${data.username}`,
                details: `Created new user ${data.name} with role ${data.role}`
            });
        }

        return data as User;
    },

    updateUser: async (user: User): Promise<User> => {
        const updatedUser = {
            ...user,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('user_profiles')
            .update(updatedUser)
            .eq('id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating user:', error);
            throw error;
        }

        // Update session if self-update
        const currentUser = userService.getCurrentUser();
        if (currentUser && currentUser.id === user.id) {
            localStorage.setItem('jeisys_session', JSON.stringify(data));
        }

        // Log update
        if (currentUser && currentUser.id !== user.id) {
            await userService.logActivity({
                user_id: currentUser.id,
                user_name: currentUser.name,
                action: 'update',
                target: `User: ${user.username}`,
                details: `Updated user profile`
            });
        }

        return data as User;
    },

    deleteUser: async (id: string): Promise<void> => {
        // Check if admin
        const { data: userToDelete } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (userToDelete?.username === 'admin') {
            throw new Error('Cannot delete system admin');
        }

        const { error } = await supabase
            .from('user_profiles')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting user:', error);
            throw error;
        }

        const currentUser = userService.getCurrentUser();
        if (currentUser) {
            await userService.logActivity({
                user_id: currentUser.id,
                user_name: currentUser.name,
                action: 'delete',
                target: `User: ${userToDelete?.username || id}`,
                details: 'Deleted user account'
            });
        }
    },

    // --- History / Audit Logs ---
    getHistory: async (): Promise<UserActivity[]> => {
        const { data, error } = await supabase
            .from('user_activity_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100); // Limit to last 100 logs

        if (error) {
            console.error('Error fetching logs:', error);
            return [];
        }
        return data as UserActivity[];
    },

    logActivity: async (activity: Omit<UserActivity, 'id' | 'timestamp'>) => {
        const newLog = {
            ...activity,
            timestamp: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('user_activity_logs')
            .insert(newLog);

        if (error) {
            console.error('Error logging activity:', error);
        }
    }
};
