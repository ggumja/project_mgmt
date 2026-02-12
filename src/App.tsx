import { useState } from 'react'
import { SpecList } from '@/components/tables/SpecList'
import { SpecEditor } from '@/components/forms/SpecEditor'
import { RequirementTable } from '@/components/tables/RequirementTable'
import { FunctionalSpec } from '@/types'
import {
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    ChevronLeft,
    ClipboardList
} from 'lucide-react'

function App() {
    const [currentProjectId] = useState('00000000-0000-0000-0000-000000000002')
    const [view, setView] = useState<'list' | 'editor' | 'requirements'>('list')
    const [selectedSpec, setSelectedSpec] = useState<FunctionalSpec | undefined>(undefined)

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

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col h-screen sticky top-0">
                <div className="p-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            J
                        </div>
                        <span className="font-bold text-slate-800 text-lg tracking-tight">Jeisys B2B</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <button
                        onClick={() => setView('list')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${view === 'list' && !selectedSpec ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <LayoutDashboard className="w-5 h-5 group-hover:text-blue-600" />
                        <span className="font-medium">대시보드</span>
                    </button>
                    <button
                        onClick={() => {
                            setView('requirements')
                            setSelectedSpec(undefined)
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${view === 'requirements' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <ClipboardList className="w-5 h-5 group-hover:text-blue-600" />
                        <span className="font-medium">요구사항정의서</span>
                    </button>
                    <button
                        onClick={() => {
                            setView('list')
                            setSelectedSpec(undefined)
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${view === 'list' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <FileText className="w-5 h-5" />
                        <span className="font-medium">기능정의서</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors group">
                        <Settings className="w-5 h-5 group-hover:text-blue-600" />
                        <span className="font-medium">설정</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button className="flex items-center gap-3 px-3 py-2 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">로그아웃</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 text-slate-600">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-800">
                            {view === 'editor' ? (selectedSpec ? '기능 수정' : '기능 작성') :
                                view === 'requirements' ? '요구사항 관리' : '기능관리 시스템'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-700">관리자님</p>
                            <p className="text-xs text-slate-500">Project Manager</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
                    <div className="max-w-7xl mx-auto h-full">
                        {view === 'list' && (
                            <SpecList
                                projectId={currentProjectId}
                                onCreateNew={handleCreateNew}
                                onEdit={handleEdit}
                            />
                        )}
                        {view === 'requirements' && (
                            <RequirementTable projectId={currentProjectId} />
                        )}
                        {view === 'editor' && (
                            <div className="h-[calc(100vh-10rem)]">
                                <SpecEditor
                                    projectId={currentProjectId}
                                    initialData={selectedSpec}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default App
