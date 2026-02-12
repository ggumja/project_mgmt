import * as React from 'react'
import { useState, useMemo, useEffect } from 'react'
import { FunctionalSpec, Priority, DevScope, Status } from '@/types'
import { specService } from '@/services/specService'
import {
    Save,
    X,
    AlertCircle,
    Loader2,
    ChevronLeft,
    Trash2,
    CheckCircle2,
    Plus,
    Info
} from 'lucide-react'
import { useCategories } from '@/contexts/CategoryContext';

const ADMIN_ID = '00000000-0000-0000-0000-000000000001';

interface SpecEditorProps {
    projectId: string;
    initialData?: FunctionalSpec;
    onSave: (savedSpec: FunctionalSpec) => void;
    onCancel: () => void;
}

export function SpecEditor({ projectId, initialData, onSave, onCancel }: SpecEditorProps) {
    const { largeCategories: LARGE_CATEGORIES, mediumCategories: MEDIUM_CATEGORIES } = useCategories();

    // Helper to parse the 8-segment category format
    const parseCategory = (rawCategory: string = '') => {
        const segments = rawCategory.split('|');

        // Default values
        let data = {
            specCode: '',
            large: LARGE_CATEGORIES[0] || '',
            medium: '',
            small: '',
            description: '',
            scope: '1차' as DevScope,
            importance: '',
            notes: ''
        };

        if (segments.length >= 8) {
            data.specCode = segments[0] || '';
            data.large = segments[1] || LARGE_CATEGORIES[0] || '';
            data.medium = segments[2] || '';
            data.small = segments[3] || '';
            data.description = segments[4] || '';
            data.scope = (segments[5] as DevScope) || '1차';
            data.importance = segments[6] || '';
            data.notes = segments[7] || '';
        } else if (segments.length >= 5) {
            data.large = segments[0] || LARGE_CATEGORIES[0] || '';
            data.medium = segments[1] || '';
            data.small = segments[2] || '';
            data.description = segments[3] || '';
            data.scope = (segments[4] as DevScope) || '1차';
        }

        // Apply first medium if currently empty but large is selected
        if (!data.medium && data.large && MEDIUM_CATEGORIES[data.large]) {
            data.medium = MEDIUM_CATEGORIES[data.large][0] || '';
        }

        return data;
    };

    const initialParsed = useMemo(() => parseCategory(initialData?.category), [initialData]);

    const [specCode, setSpecCode] = useState(initialParsed.specCode)
    const [title, setTitle] = useState(initialData?.title || '')
    const [largeCat, setLargeCat] = useState(initialParsed.large)
    const [mediumCat, setMediumCat] = useState(initialParsed.medium)
    const [smallCat, setSmallCat] = useState(initialParsed.small)
    const [description, setDescription] = useState(initialParsed.description)
    const [devScope, setDevScope] = useState<DevScope>(initialParsed.scope)
    const [importance, setImportance] = useState(initialParsed.importance)
    const [notes, setNotes] = useState(initialParsed.notes)

    const [priority, setPriority] = useState<Priority>(initialData?.priority || 'medium')
    const [status, setStatus] = useState<Status>(initialData?.status || 'todo')
    const [version, setVersion] = useState(initialData?.version || '1.0')
    const [content, setContent] = useState(initialData?.content || '# 새로운 기능 정의\n\n상세한 기능 정의와 작업 내용을 Markdown 형식으로 자유롭게 기록하세요.')

    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Sync state when initialData changes (if component recycled)
    useEffect(() => {
        const parsed = parseCategory(initialData?.category);
        setSpecCode(parsed.specCode);
        setTitle(initialData?.title || '');
        setLargeCat(parsed.large);
        setMediumCat(parsed.medium);
        setSmallCat(parsed.small);
        setDescription(parsed.description);
        setDevScope(parsed.scope);
        setImportance(parsed.importance);
        setNotes(parsed.notes);
        setPriority(initialData?.priority || 'medium');
        setStatus(initialData?.status || 'todo');
        setVersion(initialData?.version || '1.0');
        setContent(initialData?.content || (initialData?.id ? '' : '# 새로운 기능 정의\n\n상세한 기능 정의와 작업 내용을 Markdown 형식으로 자유롭게 기록하세요.'));
    }, [initialData]);

    const handleSave = async () => {
        if (!title.trim()) {
            setError('기능 명칭을 입력해주세요.')
            return
        }

        try {
            setIsSaving(true)
            setError(null)

            // Pack all fields into the 8-segment category string
            const finalCategory = `${specCode}|${largeCat}|${mediumCat}|${smallCat}|${description}|${devScope}|${importance}|${notes}`;

            // IMPORTANT: We only send columns that we are sure exist in the database.
            // Other fields are packed into 'category' for UI parsing.
            const specData: any = {
                ...(initialData?.id ? { id: initialData.id } : {}),
                project_id: projectId,
                title,
                category: finalCategory,
                priority,
                status,
                version,
                content,
                ...(initialData?.id ? {} : { created_by: ADMIN_ID })
            }

            const saved = await specService.upsertSpec(specData)
            setSuccess(true)
            setTimeout(() => onSave(saved), 1000)
        } catch (err: any) {
            console.error('Save failed:', err)
            setError(err.message || '정보를 저장하는 중에 문제가 발생했습니다.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!initialData?.id || !confirm('이 기능 정의를 완전히 삭제하시겠습니까?')) return
        try {
            setIsDeleting(true)
            await specService.deleteSpec(initialData.id)
            onCancel()
        } catch (err) {
            setError('데이터 삭제에 실패했습니다.')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="h-full flex flex-col bg-white rounded-[32px] border border-gray-200 shadow-2xl overflow-hidden">
            {/* Smooth Top Header */}
            <div className="px-10 py-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onCancel}
                        className="p-3 hover:bg-gray-100 rounded-2xl transition-all active:scale-95 text-gray-400 hover:text-gray-600"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                {initialData?.id ? '기능 정보 수정' : '새로운 기능 정의'}
                            </h2>
                            {initialData?.id && (
                                <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {specCode || 'Draft'}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-400 text-xs font-bold mt-0.5 uppercase tracking-widest">Jeisys B2B Specification Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {initialData?.id && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                        >
                            <Trash2 className="w-6 h-6" />
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || success}
                        className={`flex items-center gap-2.5 px-10 py-4 rounded-2xl font-black shadow-xl transition-all active:scale-95 ${success ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                            }`}
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> :
                            success ? <CheckCircle2 className="w-5 h-5" /> :
                                <Save className="w-5 h-5" />}
                        <span>{success ? '저정 완료' : '정보 업데이트'}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                {error && (
                    <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-3 text-rose-600 font-bold">
                        <AlertCircle className="w-6 h-6" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {/* Primary Meta Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                    <div className="lg:col-span-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">기능 코드 (ID)</label>
                        <input
                            type="text"
                            value={specCode}
                            onChange={(e) => setSpecCode(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-[20px] focus:ring-4 focus:ring-blue-100 transition-all font-mono font-bold text-slate-700 placeholder:text-slate-300"
                            placeholder="예: FM-0001"
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">중요도 (Importance)</label>
                        <select
                            value={importance}
                            onChange={(e) => {
                                setImportance(e.target.value);
                                setPriority(e.target.value === '상' ? 'high' : 'medium');
                            }}
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-[20px] focus:ring-4 focus:ring-blue-100 transition-all font-black text-slate-700 appearance-none"
                        >
                            <option value="">선택 안함</option>
                            <option value="상">🔥 상 (High)</option>
                            <option value="중">⚡ 중 (Medium)</option>
                            <option value="하">💧 하 (Low)</option>
                        </select>
                    </div>
                    <div className="lg:col-span-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">개발 단계 (Scope)</label>
                        <select
                            value={devScope}
                            onChange={(e) => setDevScope(e.target.value as DevScope)}
                            className="w-full px-5 py-4 bg-indigo-50/50 border-none rounded-[20px] focus:ring-4 focus:ring-blue-100 transition-all font-black text-indigo-700 appearance-none"
                        >
                            <option value="1차">🚀 1차 개발</option>
                            <option value="2차">🛠 2차 개발</option>
                            <option value="추가논의">💬 추가 논의</option>
                        </select>
                    </div>
                    <div className="lg:col-span-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">데이터 버전</label>
                        <input
                            type="text"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-[20px] focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-500"
                            placeholder="1.0"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-10">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">기능 명칭 (Functional Title)</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-7 py-5 bg-white border-2 border-slate-100 rounded-[28px] focus:ring-8 focus:ring-blue-50 focus:border-blue-500 transition-all text-xl font-black text-slate-900 placeholder:text-slate-200"
                                placeholder="기능의 이름을 명확하게 입력하세요"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-8 bg-slate-50 rounded-[32px] border border-slate-100/50">
                            <div className="sm:col-span-2 flex items-center gap-2 mb-2">
                                <Info className="w-4 h-4 text-blue-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">기능 분류 체계</span>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">대분류</label>
                                <select
                                    value={largeCat}
                                    onChange={(e) => {
                                        setLargeCat(e.target.value);
                                        setMediumCat(MEDIUM_CATEGORIES[e.target.value]?.[0] || '');
                                    }}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm text-slate-700"
                                >
                                    {/* Robustness: Add current category if missing from options */}
                                    {largeCat && !LARGE_CATEGORIES.includes(largeCat) && (
                                        <option value={largeCat}>{largeCat} (정의됨)</option>
                                    )}
                                    {LARGE_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">중분류</label>
                                <select
                                    value={mediumCat}
                                    onChange={(e) => setMediumCat(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm text-slate-700"
                                >
                                    {/* Robustness: Add current category if missing from options */}
                                    {mediumCat && !(MEDIUM_CATEGORIES[largeCat] || []).includes(mediumCat) && (
                                        <option value={mediumCat}>{mediumCat} (정의됨)</option>
                                    )}
                                    {(MEDIUM_CATEGORIES[largeCat] || []).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">소분류 (Optional Tag)</label>
                                <input
                                    type="text"
                                    value={smallCat}
                                    onChange={(e) => setSmallCat(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm text-slate-700 placeholder:text-slate-300"
                                    placeholder="추가 분류 키워드"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">관리자 비고 (Notes)</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-[20px] focus:ring-4 focus:ring-emerald-50 transition-all text-sm font-medium text-emerald-800"
                                    placeholder="참착 사항이나 미팅 논의 사항을 기록하세요"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                    <Plus className="w-5 h-5 text-emerald-300" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="flex-1 flex flex-col min-h-[400px]">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">상세 기능 내역 (Summary / Accepted Criteria)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="flex-1 w-full px-8 py-7 bg-white border-2 border-slate-100 rounded-[32px] focus:ring-8 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 leading-relaxed resize-none shadow-sm"
                                placeholder="기능에 대한 구체적인 비즈니스 로직이나 요구 사양을 입력하세요."
                            />
                        </div>
                    </div>
                </div>

                {/* Content Section (Markdown) */}
                <div className="mt-12 pt-12 border-t border-slate-100">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 ml-1">기능 상세 정의 문서 (Rich Markdown)</label>
                    <div className="rounded-[40px] overflow-hidden border border-slate-200 shadow-sm">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={15}
                            className="w-full px-10 py-10 bg-slate-900 text-slate-100 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-0"
                            placeholder="# 기능 기본 정의서..."
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
