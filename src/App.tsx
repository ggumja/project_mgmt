import * as React from 'react'
import { useState, useEffect } from 'react'
import { SpecList } from '@/components/tables/SpecList'
import { SpecEditor } from '@/components/forms/SpecEditor'
import { RequirementTable } from '@/components/tables/RequirementTable'
import { LoginPage } from '@/components/auth/LoginPage'
import { UserManagement } from '@/components/admin/UserManagement'
import { userService } from '@/services/userService'
import { FunctionalSpec } from '@/types'
import { User as UserType } from '@/types/user'
import {
    LayoutDashboard,
    Settings,
    LogOut,
    ChevronLeft,
    ClipboardList,
    User
} from 'lucide-react'

function App() {
    const [currentProjectId] = useState('00000000-0000-0000-0000-000000000002')
    const [view, setView] = useState<'list' | 'editor' | 'requirements' | 'admin'>('list')
    const [selectedSpec, setSelectedSpec] = useState<FunctionalSpec | undefined>(undefined)
    const [user, setUser] = useState<UserType | null>(null)

    useEffect(() => {
        const currentUser = userService.getCurrentUser();
        setUser(currentUser);
    }, []);

    const handleLoginSuccess = () => {
        setUser(userService.getCurrentUser());
    };

    const handleLogout = () => {
        userService.logout();
        setUser(null);
        setView('list');
    };

    const handleCreateNew = () => {
        setSelectedSpec(undefined)
        setView('editor')
    }

    const handleEdit = (spec: FunctionalSpec) => {
        setSelectedSpec(spec)
        setView('editor')
    }

    const handleSave = () => {
        setView('list')
        setSelectedSpec(undefined)
    }

    const handleCancel = () => {
        setView('list')
        setSelectedSpec(undefined)
    }

    if (!user) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="flex min-h-screen bg-background font-sans antialiased text-foreground animate-in fade-in duration-500">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-border hidden md:flex flex-col h-screen sticky top-0 shadow-sm z-50">
                <div className="p-8 border-b border-border">
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-600/20">
                            J
                        </div>
                        <span className="font-extrabold text-lg tracking-tight text-slate-900">Jeisys B2B</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <div className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-[0.15em]">
                        업무 대시보드
                    </div>
                    <button
                        onClick={() => setView('list')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${view === 'list' && !selectedSpec ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>기능 정의서</span>
                    </button>
                    <button
                        onClick={() => {
                            setView('requirements')
                            setSelectedSpec(undefined)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${view === 'requirements' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                        <ClipboardList className="w-5 h-5" />
                        <span>요구사항추적</span>
                    </button>

                    {user.role === 'admin' && (
                        <>
                            <div className="pt-8 px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-[0.15em]">
                                Admin 및 설정
                            </div>
                            <button
                                onClick={() => {
                                    setView('admin')
                                    setSelectedSpec(undefined)
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${view === 'admin' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                            >
                                <Settings className="w-5 h-5" />
                                <span>시스템 설정</span>
                            </button>
                        </>
                    )}
                </nav>

                <div className="p-6 border-t border-border bg-slate-50/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>로그아웃</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-16 bg-white/90 backdrop-blur-md border-b border-border flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center gap-5">
                        <button className="md:hidden p-2 text-muted-foreground hover:bg-secondary rounded-md">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Project</span>
                            <span className="text-slate-300">/</span>
                            <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                                {view === 'editor' ? (selectedSpec ? '기능 편집' : '신규기능 정의') :
                                    view === 'requirements' ? '요구사항 추적' :
                                        view === 'admin' ? '시스템 관리' : '기능 목록'}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all cursor-pointer border border-border/50">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-xs">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-xs font-black text-slate-800 leading-none">{user.name}</span>
                                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{user.role}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-[#f8f9fb] p-8">
                    <div className="max-w-7xl mx-auto h-full space-y-6">
                        {view === 'list' && (
                            <SpecList
                                projectId={currentProjectId}
                                onCreateNew={handleCreateNew}
                                onEdit={handleEdit}
                            />
                        )}
                        {view === 'requirements' && (
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black tracking-tight text-slate-900">요구사항 추적 테이블</h2>
                                    <p className="text-base text-slate-500 font-medium">비즈니스 요구사항과 기능 상세 간의 연결고리를 관리합니다.</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-border p-1">
                                    <RequirementTable projectId={currentProjectId} />
                                </div>
                            </div>
                        )}
                        {view === 'editor' && (
                            <div className="h-full min-h-[800px]">
                                <SpecEditor
                                    projectId={currentProjectId}
                                    initialData={selectedSpec}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                />
                            </div>
                        )}
                        {view === 'admin' && user?.role === 'admin' && (
                            <UserManagement />
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default App
