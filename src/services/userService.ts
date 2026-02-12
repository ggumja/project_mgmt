import { User, UserActivity } from '@/types/user';

const STORAGE_KEY_USERS = 'jeisys_users';
const STORAGE_KEY_LOGS = 'jeisys_user_logs';
const STORAGE_KEY_SESSION = 'jeisys_session';

// Initial admin user
const INITIAL_ADMIN: User = {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'admin',
    password: 'password123', // In a real app, this would be hashed
    name: 'Jeisys Admin',
    role: 'admin',
    department: 'IT Team',
    email: 'admin@jeisys.com',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

export const userService = {
    // --- Auth ---
    getCurrentUser: (): User | null => {
        const session = localStorage.getItem(STORAGE_KEY_SESSION);
        return session ? JSON.parse(session) : null;
    },

    login: async (username: string, password: string): Promise<User | null> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const users = userService.getUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user && user.status === 'active') {
            // Update last login
            const updatedUser = { ...user, last_login: new Date().toISOString() };
            userService.updateUser(updatedUser);

            // Set session
            localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(updatedUser));

            // Log activity
            userService.logActivity({
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

    logout: () => {
        const user = userService.getCurrentUser();
        if (user) {
            userService.logActivity({
                user_id: user.id,
                user_name: user.name,
                action: 'LOGOUT',
                target: 'System',
                details: 'User logged out'
            });
        }
        localStorage.removeItem(STORAGE_KEY_SESSION);
    },

    // --- User Management ---
    getUsers: (): User[] => {
        const stored = localStorage.getItem(STORAGE_KEY_USERS);
        if (!stored) {
            // Initialize with default admin if empty
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([INITIAL_ADMIN]));
            return [INITIAL_ADMIN];
        }
        return JSON.parse(stored);
    },

    addUser: (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): User => {
        const users = userService.getUsers();
        if (users.some(u => u.username === user.username)) {
            throw new Error('Username already exists');
        }

        const newUser: User = {
            ...user,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

        // Log creation
        const currentUser = userService.getCurrentUser();
        if (currentUser) {
            userService.logActivity({
                user_id: currentUser.id,
                user_name: currentUser.name,
                action: 'create',
                target: `User: ${newUser.username}`,
                details: `Created new user ${newUser.name} with role ${newUser.role}`
            });
        }

        return newUser;
    },

    updateUser: (user: User): User => {
        const users = userService.getUsers();
        const index = users.findIndex(u => u.id === user.id);

        if (index === -1) throw new Error('User not found');

        const updatedUser = {
            ...user,
            updated_at: new Date().toISOString()
        };

        users[index] = updatedUser;
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

        // Update session if self-update
        const currentUser = userService.getCurrentUser();
        if (currentUser && currentUser.id === user.id) {
            localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(updatedUser));
        }

        // Log update (skip login update logging to reduce noise if needed, but logging everything for audit is better)
        if (currentUser && currentUser.id !== user.id) { // Only log if admin updates another user
            userService.logActivity({
                user_id: currentUser.id,
                user_name: currentUser.name,
                action: 'update',
                target: `User: ${user.username}`,
                details: `Updated user profile`
            });
        }

        return updatedUser;
    },

    deleteUser: (id: string) => {
        const users = userService.getUsers();
        const userToDelete = users.find(u => u.id === id);

        // Prevent deleting the last admin or self (optional check, but good for safety)
        if (userToDelete?.username === 'admin') {
            throw new Error('Cannot delete system admin');
        }

        const newUsers = users.filter(u => u.id !== id);
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(newUsers));

        const currentUser = userService.getCurrentUser();
        if (currentUser) {
            userService.logActivity({
                user_id: currentUser.id,
                user_name: currentUser.name,
                action: 'delete',
                target: `User: ${userToDelete?.username || id}`,
                details: 'Deleted user account'
            });
        }
    },

    // --- History / Audit Logs ---
    getHistory: (): UserActivity[] => {
        const stored = localStorage.getItem(STORAGE_KEY_LOGS);
        return stored ? JSON.parse(stored) : [];
    },

    logActivity: (activity: Omit<UserActivity, 'id' | 'timestamp'>) => {
        const logs = userService.getHistory();
        const newLog: UserActivity = {
            ...activity,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
        };
        // Keep logs size manageable? For now, unlimited.
        logs.unshift(newLog); // Prepend for latest first
        localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    }
};
