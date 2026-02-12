import React, { useState } from 'react';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { userService } from '@/services/userService';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const success = await userService.login(username, password);
            if (success) {
                onLoginSuccess();
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            setError('An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-600/30 mb-4">
                        <span className="font-black text-2xl">J</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Jeisys Project Management</h1>
                    <p className="text-slate-500 text-sm font-medium">Please sign in to continue</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg flex items-center justify-center animate-in shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                        Default: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">admin</span> / <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">password123</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
