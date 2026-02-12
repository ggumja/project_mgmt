import * as React from 'react'
import { useState, useMemo, useEffect } from 'react'
import { FunctionalSpec, Priority, DevScope, Status } from '@/types'
import { specService } from '@/services/specService'
import {
    Save,
    X,
    AlertCircle,
    Loader2,
    Trash2,
    CheckCircle2,
    Info,
    ArrowLeft
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
    const [content, setContent] = useState(initialData?.content || '# 기능 명세 상세\n\n기능에 대한 상세 정의를 기록하세요.')

    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Sync state when initialData changes
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
        setContent(initialData?.content || (initialData?.id ? '' : '# 기능 명세 상세\n\n기능에 대한 상세 정의를 기록하세요.'));
    }, [initialData]);

    const handleSave = async () => {
        if (!title.trim()) {
            setError('기능 명칭을 입력해주세요.')
            return
        }

        try {
            setIsSaving(true)
            setError(null)

            const finalCategory = `${specCode}|${largeCat}|${mediumCat}|${smallCat}|${description}|${devScope}|${importance}|${notes}`;

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
            setError(err.message || '저장 중 오류가 발생했습니다.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!initialData?.id || !confirm('삭제하시겠습니까?')) return
        try {
            setIsDeleting(true)
            await specService.deleteSpec(initialData.id)
            onCancel()
        } catch (err) {
            setError('삭제에 실패했습니다.')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="h-full flex flex-col bg-white rounded-lg border border-border shadow-sm overflow-hidden select-none">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-secondary rounded-md text-muted-foreground transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-foreground tracking-tight">
                            {initialData?.id ? '기능 편집' : '신규 기능 정의'}
                        </h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Specification Editor</span>
                            {specCode && (
                                <span className="text-xs bg-secondary px-1.5 py-0.5 rounded font-mono text-blue-600 font-bold">{specCode}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {initialData?.id && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="h-10 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all text-sm font-medium"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={onCancel}
                        className="h-10 px-6 text-sm font-bold hover:bg-secondary rounded-md transition-all"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || success}
                        className={`h-10 px-8 rounded-md font-bold text-sm shadow transition-all active:scale-95 flex items-center gap-2 ${success ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> :
                            success ? <CheckCircle2 className="w-4 h-4" /> :
                                <Save className="w-4 h-4" />}
                        <span>{success ? '저장됨' : '저장하기'}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12 bg-[#fafbfc]">
                {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Row 1: Primary Meta Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">기능 코드 (ID)</label>
                        <input
                            type="text"
                            value={specCode}
                            onChange={(e) => setSpecCode(e.target.value)}
                            className="w-full h-11 px-4 bg-white border border-input rounded-md focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-mono font-bold text-[15px] text-slate-700 placeholder:text-slate-300 shadow-sm"
                            placeholder="예: FM-0001"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">중요도 (Importance)</label>
                        <select
                            value={importance}
                            onChange={(e) => {
                                setImportance(e.target.value);
                                setPriority(e.target.value === '상' ? 'high' : 'medium');
                            }}
                            className="w-full h-11 px-4 bg-white border border-input rounded-md focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-bold text-[15px] text-slate-700 shadow-sm"
                        >
                            <option value="">선택 안함</option>
                            <option value="상">🔥 상 (High)</option>
                            <option value="중">⚡ 중 (Medium)</option>
                            <option value="하">💧 하 (Low)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">개발 단계 (Scope)</label>
                        <select
                            value={devScope}
                            onChange={(e) => setDevScope(e.target.value as DevScope)}
                            className="w-full h-11 px-4 bg-blue-50/50 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-bold text-[15px] text-blue-700 shadow-sm"
                        >
                            <option value="1차">🚀 1차 개발</option>
                            <option value="2차">🛠 2차 개발</option>
                            <option value="추가논의">💬 추가 논의</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">데이터 버전</label>
                        <input
                            type="text"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            className="w-full h-11 px-4 bg-white border border-input rounded-md focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-bold text-[15px] text-slate-500 shadow-sm"
                            placeholder="1.0"
                        />
                    </div>
                </div>

                {/* Row 2: 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column: Title, Category, Notes */}
                    <div className="space-y-10">
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">기능 명칭 (Functional Title)</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-lg focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all text-2xl font-bold text-slate-900 placeholder:text-slate-200"
                                placeholder="기능 이름을 입력하세요"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-white rounded-xl border border-border shadow-sm">
                            <div className="sm:col-span-2 flex items-center gap-2 mb-2">
                                <Info className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">기능 분류 체계</span>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">대분류</label>
                                <select
                                    value={largeCat}
                                    onChange={(e) => {
                                        setLargeCat(e.target.value);
                                        setMediumCat(MEDIUM_CATEGORIES[e.target.value]?.[0] || '');
                                    }}
                                    className="w-full h-10 px-3 bg-slate-50 border border-input rounded-md focus:border-blue-600 outline-none transition-all font-bold text-sm text-slate-700 hover:bg-slate-100"
                                >
                                    {LARGE_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">중분류</label>
                                <select
                                    value={mediumCat}
                                    onChange={(e) => setMediumCat(e.target.value)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-input rounded-md focus:border-blue-600 outline-none transition-all font-bold text-sm text-slate-700 hover:bg-slate-100"
                                >
                                    {(MEDIUM_CATEGORIES[largeCat] || []).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">소분류 (Tag)</label>
                                <input
                                    type="text"
                                    value={smallCat}
                                    onChange={(e) => setSmallCat(e.target.value)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-input rounded-md focus:border-blue-600 outline-none transition-all font-bold text-sm text-slate-700 placeholder:text-slate-300"
                                    placeholder="추가 분류 키워드"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">관리자 비고 (Notes)</label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full h-12 px-5 bg-white border border-input rounded-md focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all text-[15px] font-medium text-slate-700 shadow-sm"
                                placeholder="참조 사항이나 미팅 논의 사항을 기록하세요"
                            />
                        </div>
                    </div>

                    {/* Right Column: Description */}
                    <div className="flex flex-col h-full space-y-3">
                        <label className="block text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">기능 상세 내역 (Summary / AC)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="flex-1 w-full min-h-[400px] px-6 py-6 bg-white border-2 border-slate-100 rounded-lg focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all text-[15px] font-medium text-slate-700 leading-relaxed resize-none shadow-sm"
                            placeholder="기능에 대한 구체적인 비즈니스 로직이나 요구 사양을 요약해서 입력하세요."
                        />
                    </div>
                </div>

                {/* Bottom Section: Markdown Doc */}
                <div className="pt-12 border-t border-slate-200 space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-black text-slate-600 uppercase tracking-widest ml-1">기능 상세 정의 문서 (Rich Markdown)</label>
                        <span className="text-xs font-mono text-muted-foreground bg-white border border-border px-3 py-1 rounded-full shadow-sm">Markdown Mode</span>
                    </div>
                    <div className="rounded-xl border border-slate-300 overflow-hidden ring-4 ring-slate-100 shadow-2xl">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={20}
                            className="w-full px-10 py-10 bg-slate-900 text-white font-mono text-sm leading-relaxed resize-none focus:outline-none ring-0 border-none block"
                            style={{ color: '#ffffff', backgroundColor: '#0f172a' }}
                            placeholder="# 기능 상세 정의..."
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
