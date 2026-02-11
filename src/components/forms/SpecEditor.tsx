import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FunctionalSpec, Category, Priority, Status } from '@/types'
import { specService } from '@/services/specService'
import {
    Save,
    X,
    Eye,
    Edit3,
    AlertCircle,
    Loader2,
    ChevronLeft
} from 'lucide-react'

interface SpecEditorProps {
    projectId: string;
    initialData?: FunctionalSpec;
    onSave: (savedSpec: FunctionalSpec) => void;
    onCancel: () => void;
}

export function SpecEditor({ projectId, initialData, onSave, onCancel }: SpecEditorProps) {
    const [title, setTitle] = useState(initialData?.title || '')
    const [category, setCategory] = useState<Category>(initialData?.category || 'product')
    const [priority, setPriority] = useState<Priority>(initialData?.priority || 'medium')
    const [content, setContent] = useState(initialData?.content || '# 새로운 기능 정의\n\n여기에 상세 내용을 입력하세요.')
    const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split')

    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSave = async () => {
        if (!title.trim()) {
            setError('제목을 입력해주세요.')
            return
        }

        try {
            setIsSaving(true)
            const specData: Partial<FunctionalSpec> = {
                ...(initialData?.id ? { id: initialData.id } : {}),
                project_id: projectId,
                title,
                category,
                priority,
                status: initialData?.status || 'draft',
                version: initialData?.version || '1.0',
                content,
            }

            const savedData = await specService.upsertSpec(specData)
            onSave(savedData)
        } catch (err) {
            console.error(err)
            setError('저장 중 오류가 발생했습니다.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Tool Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">
                        {initialData ? '기능정의서 수정' : '새 기능정의서 작성'}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-200 p-1 rounded-lg mr-4">
                        <button
                            onClick={() => setViewMode('edit')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'edit' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <Edit3 className="w-4 h-4" />
                            <span className="hidden sm:inline">에디터</span>
                        </button>
                        <button
                            onClick={() => setViewMode('split')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'split' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <div className="flex gap-0.5"><div className="w-1.5 h-3 bg-current opacity-40"></div><div className="w-1.5 h-3 bg-current"></div></div>
                            <span className="hidden sm:inline">나란히 보기</span>
                        </button>
                        <button
                            onClick={() => setViewMode('preview')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'preview' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">미리보기</span>
                        </button>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200 active:scale-95"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>저장하기</span>
                    </button>
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Basic Info Fields */}
                <div className="px-8 py-6 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-bold text-slate-700 mb-2">제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="예: 상품 대량 등록 기능"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">카테고리</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as Category)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none bg-white"
                        >
                            <option value="product">상품 관리</option>
                            <option value="order">주문 관리</option>
                            <option value="member">회원 관리</option>
                            <option value="B2B_special">B2B 특화</option>
                            <option value="settlement">정산 관리</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">우선순위</label>
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                            {(['low', 'medium', 'high', 'critical'] as Priority[]).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPriority(p)}
                                    className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${priority === p
                                            ? p === 'critical' ? 'bg-red-600 text-white shadow-sm' :
                                                p === 'high' ? 'bg-orange-500 text-white shadow-sm' :
                                                    p === 'medium' ? 'bg-blue-600 text-white shadow-sm' :
                                                        'bg-slate-600 text-white shadow-sm'
                                            : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                >
                                    {p.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Markdown Textarea */}
                    {(viewMode === 'edit' || viewMode === 'split') && (
                        <div className={`flex flex-col border-r border-slate-100 ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="flex-1 p-8 outline-none resize-none font-mono text-sm text-slate-800 leading-relaxed bg-slate-50/50"
                                placeholder="마크다운 형식으로 내용을 입력하세요..."
                            />
                        </div>
                    )}

                    {/* Markdown Preview */}
                    {(viewMode === 'preview' || viewMode === 'split') && (
                        <div className={`flex flex-col bg-white overflow-y-auto ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                            <div className="prose prose-slate max-w-none p-8 prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-blue-600">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="absolute bottom-6 right-6 flex items-center gap-3 px-6 py-3 bg-red-600 text-white rounded-xl shadow-2xl animate-bounce">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{error}</span>
                    <button onClick={() => setError(null)} className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    )
}
