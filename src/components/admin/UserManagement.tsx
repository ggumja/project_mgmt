import React, { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { User, UserActivity } from '@/types/user';
import {
    Users,
    Shield,
    Activity,
    Plus,
    Search,
    Trash2,
    Eye,
    Edit2,
    CheckCircle2,
    XCircle,
    MoreHorizontal
} from 'lucide-react';

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<UserActivity[]>([]);
    const [view, setView] = useState<'users' | 'logs'>('users');
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        password: '',
        role: 'viewer' as 'admin' | 'manager' | 'viewer',
        email: '',
        department: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setUsers(userService.getUsers());
        setLogs(userService.getHistory());
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            userService.addUser({
                ...formData,
                status: 'active'
            });
            setShowAddModal(false);
            setFormData({
                username: '',
                name: '',
                password: '',
                role: 'viewer',
                email: '',
                department: ''
            });
            loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeleteUser = (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                userService.deleteUser(id);
                loadData();
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Administration</h2>
                    <p className="text-slate-500 font-medium">Manage users and view system activity logs.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setView('users')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${view === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setView('logs')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${view === 'logs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        Activity Logs
                    </button>
                </div>
            </div>

            {view === 'users' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-bold shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add User
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Last Login</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{user.name}</div>
                                                    <div className="text-xs text-slate-500">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                    user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-slate-100 text-slate-800'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                            {user.last_login ? new Date(user.last_login).toLocaleString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'logs' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Target</th>
                                <th className="px-6 py-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-700">
                                        {log.user_name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${log.action === 'LOGIN' ? 'bg-emerald-50 text-emerald-600' :
                                                log.action === 'LOGOUT' ? 'bg-slate-100 text-slate-500' :
                                                    log.action === 'delete' ? 'bg-red-50 text-red-600' :
                                                        'bg-blue-50 text-blue-600'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                        {log.target}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        {log.details}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-lg text-slate-900">Add New User</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none font-bold text-slate-700"
                                    >
                                        <option value="viewer">Viewer</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none font-bold text-slate-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none font-bold text-slate-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Email (Optional)</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none font-bold text-slate-700"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
