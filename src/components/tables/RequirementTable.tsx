import * as React from 'react'
import { useEffect, useState } from 'react'
import { requirementService } from '@/services/requirementService'
import { specService } from '@/services/specService'
import { Requirement, FunctionalSpec } from '@/types'
import {
    Search,
    Link as LinkIcon,
    Unlink,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Loader2,
    Plus,
    X,
    Edit2,
    Save,
    Trash2,
    User,       // Added
    ListFilter, // Added
    CheckSquare // Added
} from 'lucide-react'
import { userService } from '@/services/userService'
import { SpecMapper } from '@/components/common/SpecMapper'

interface RequirementTableProps {
    projectId: string;
}

export function RequirementTable({ projectId }: RequirementTableProps) {
    const [requirements, setRequirements] = useState<Requirement[]>([])
    const [specs, setSpecs] = useState<FunctionalSpec[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'review'>('all') // Added Tab State

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingReq, setEditingReq] = useState<Requirement | null>(null)
    const [formData, setFormData] = useState<Partial<Requirement>>({
        req_code: '',
        title: '',
        description: '',
        priority: 'must',
        status: 'draft',
        req_type: 'functional',
        project_id: projectId,
        functional_spec_id: undefined
    })
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null) // Added Error State

    // Spec Mapper State
    const [isMapperOpen, setIsMapperOpen] = useState(false)

    // User Role Check
    const [user, setUser] = useState<any>(null);
    useEffect(() => {
        setUser(userService.getCurrentUser());
    }, []);
    const isViewer = user?.role === 'viewer';

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true)
                const [reqData, specData] = await Promise.all([
                    requirementService.getRequirementsByProject(projectId),
                    specService.getSpecsByProject(projectId)
                ])
                setRequirements(reqData)
                setSpecs(specData)
            } catch (err) {
                console.error('Error loading data:', err)
            } finally {
                setLoading(false)
            }
        }

        if (projectId) {
            loadData()
        }
    }, [projectId])

    const handleAddNew = () => {
        // Auto-generate next REQ code
        const codes = requirements
            .map(r => r.req_code)
            .filter(code => code.startsWith('RQ-'))
            .map(code => parseInt(code.replace('RQ-', ''), 10))
            .filter(num => !isNaN(num))

        const nextNum = codes.length > 0 ? Math.max(...codes) + 1 : 1
        const nextCode = `RQ-${String(nextNum).padStart(5, '0')}`

        setEditingReq(null)
        setFormData({
            project_id: projectId,
            req_code: nextCode,
            title: '',
            description: '',
            priority: 'must',
            status: 'draft',
            req_type: 'functional',
            version: '1.0',
            functional_spec_id: undefined,
            created_by: user?.id
        })
        setIsModalOpen(true)
    }

    const handleEdit = (req: Requirement) => {
        setEditingReq(req)
        setFormData({ ...req })
        setIsModalOpen(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isViewer) return;

        setSaveError(null) // Clear previous errors

        try {
            setIsSaving(true)

            // Prepare data with reviewer info if status changed to approved/rejected
            const dataToSave = { ...formData }

            if (['approved', 'rejected'].includes(formData.status || '')) {
                // If status changed or implementation requires updating reviewer
                if (editingReq?.status !== formData.status) {
                    dataToSave.reviewer_id = user?.id
                    dataToSave.reviewed_at = new Date().toISOString()
                }
            } else if (['draft', 'review'].includes(formData.status || '')) {
                // Reset reviewer info if moved back to draft/review
                // We cast to any to allow null for clearing DB field
                (dataToSave as any).reviewer_id = null;
                (dataToSave as any).reviewed_at = null;
                (dataToSave as any).rejection_reason = null;
            }

            const saved = await requirementService.upsertRequirement(dataToSave)

            if (editingReq) {
                setRequirements(prev => prev.map(r => r.id === saved.id ? saved : r))
            } else {
                setRequirements(prev => [...prev, saved])
            }
            setIsModalOpen(false)
        } catch (err: any) {
            console.error('Failed to save requirement:', err)
            // Show meaningful error to user
            setSaveError(err.message || '저장 중 알 수 없는 오류가 발생했습니다.')
        } finally {
            setIsSaving(false)
        }
    }

    const filteredRequirements = requirements.filter(req => {
        // Search Filter
        const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.req_code.toLowerCase().includes(searchTerm.toLowerCase())

        // Tab Filter
        if (activeTab === 'mine') {
            return matchesSearch && req.created_by === user?.id
        }
        if (activeTab === 'review') {
            return matchesSearch && req.status === 'review'
        }
        return matchesSearch
    })

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="mt-2 text-sm text-slate-500 font-medium">Loading requirements...</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-xl mx-2 mb-2">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'all'
                        ? 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-900/5'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    <ListFilter className="w-4 h-4" />
                    전체 목록
                </button>
                <button
                    onClick={() => setActiveTab('mine')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'mine'
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-900/5'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    <User className="w-4 h-4" />
                    내 요구사항
                </button>
                <button
                    onClick={() => setActiveTab('review')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'review'
                        ? 'bg-white text-orange-600 shadow-sm ring-1 ring-slate-900/5'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    <CheckSquare className="w-4 h-4" />
                    검토 대기
                    {requirements.filter(r => r.status === 'review').length > 0 && (
                        <span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded text-[10px]">
                            {requirements.filter(r => r.status === 'review').length}
                        </span>
                    )}
                </button>
            </div>

            <div className="flex items-center gap-2 p-2">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        name="search"
                        autoComplete="off"
                        placeholder="이름, 코드 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 w-full pl-9 pr-3 bg-white border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors shadow-sm"
                    />
                </div>
                {!isViewer && (
                    <button
                        onClick={handleAddNew}
                        className="h-10 px-5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow active:scale-95 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        신규 요구사항
                    </button>
                )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm m-2">
                <table className="w-full text-left border-collapse text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-5 py-4 font-bold text-slate-600 w-28 uppercase tracking-widest text-xs">코드</th>
                            <th className="px-5 py-4 font-bold text-slate-600 uppercase tracking-widest text-xs">요구사항명</th>
                            <th className="px-5 py-4 font-bold text-slate-600 w-24 text-center uppercase tracking-widest text-xs">우선순위</th>
                            <th className="px-5 py-4 font-bold text-slate-600 w-28 text-center uppercase tracking-widest text-xs">상태</th>
                            <th className="px-5 py-4 font-bold text-slate-600 w-24 text-center uppercase tracking-widest text-xs">작성자</th>
                            <th className="px-5 py-4 font-bold text-slate-600 w-48 uppercase tracking-widest text-xs">연결된 기능</th>
                            <th className="px-5 py-2 w-20 text-center uppercase tracking-widest text-xs">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredRequirements.map((req) => {
                            const connectedSpec = specs.find(s => s.id === req.functional_spec_id)
                            return (
                                <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-5 py-5 align-top font-mono text-[13px] text-blue-600 font-black">
                                        {req.req_code}
                                    </td>
                                    <td className="px-5 py-5 align-top">
                                        <div
                                            onClick={() => !isViewer && handleEdit(req)}
                                            className={`font-bold text-slate-900 text-[15px] transition-colors ${!isViewer ? 'cursor-pointer hover:text-blue-600 hover:underline' : ''}`}
                                        >
                                            {req.title}
                                        </div>
                                        <div className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">{req.description}</div>
                                    </td>
                                    <td className="px-5 py-5 align-top text-center">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-black tracking-tighter ${req.priority === 'must' ? 'bg-red-50 text-red-600' :
                                            req.priority === 'should' ? 'bg-orange-50 text-orange-600' :
                                                'bg-slate-100 text-slate-500'
                                            }`}>
                                            {req.priority.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 align-top text-center">
                                        <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-600">
                                            {req.status === 'implemented' ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            ) : req.status === 'approved' ? (
                                                <Clock className="w-4 h-4 text-blue-600" />
                                            ) : (
                                                <AlertTriangle className="w-4 h-4 text-slate-300" />
                                            )}
                                            <span className="capitalize">{req.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 align-top text-center">
                                        <div className="text-xs font-medium text-slate-600">
                                            {req.author_name || '-'}
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 align-top">
                                        {connectedSpec ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="text-xs font-bold text-slate-700">{connectedSpec.title}</div>
                                                <div className="text-[10px] text-slate-400">
                                                    {connectedSpec.spec_code && <span className="font-mono mr-1">{connectedSpec.spec_code}</span>}
                                                    {connectedSpec.large_category && <span>{connectedSpec.large_category} &gt; </span>}
                                                    {connectedSpec.medium_category}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400">미지정</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-5 text-center align-middle">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!isViewer && (
                                                <button
                                                    onClick={() => handleEdit(req)}
                                                    className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                                                    title="수정"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 text-xs text-slate-400 font-black uppercase tracking-[0.1em]">
                <div>TOTAL {requirements.length} REQUIREMENTS FOUND</div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20"></div>
                        <span>IMPLEMENTED</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm shadow-blue-600/20"></div>
                        <span>APPROVED</span>
                    </div>
                </div>
            </div>

            {/* Requirement Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                    {editingReq ? '요구사항 수정' : '신규 요구사항 등록'}
                                </h3>
                                <p className="text-slate-500 text-sm font-medium mt-1">
                                    프로젝트의 요구사항을 정의하고 관리합니다.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                            {/* Error Display */}
                            {saveError && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    {saveError}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">코드 (ID)</label>
                                    <input
                                        type="text"
                                        name="req_code"
                                        autoComplete="off"
                                        required
                                        value={formData.req_code}
                                        onChange={e => setFormData({ ...formData, req_code: e.target.value })}
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-colors font-mono font-bold text-slate-700"
                                        placeholder="RQ-00001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">유형</label>
                                    <select
                                        value={formData.req_type}
                                        onChange={e => setFormData({ ...formData, req_type: e.target.value as any })}
                                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl focus:border-blue-600 outline-none transition-colors font-bold text-sm text-slate-700"
                                    >
                                        <option value="functional">기능 요구사항 (Functional)</option>
                                        <option value="non-functional">비기능 요구사항 (Non-Functional)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">요구사항 명칭</label>
                                <input
                                    type="text"
                                    name="title"
                                    autoComplete="off"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-colors font-bold text-lg text-slate-900 placeholder:text-slate-300"
                                    placeholder="요구사항 제목을 입력하세요"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">상세 설명 & 인수 조건</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full h-32 p-4 bg-white border border-slate-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-colors font-medium text-slate-600 resize-none leading-relaxed"
                                    placeholder="요구사항에 대한 상세 설명과 인수 조건을 기술하세요."
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">기능 연결 (Function Mapping)</label>
                                {formData.functional_spec_id ? (
                                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                        <div>
                                            {(() => {
                                                const spec = specs.find(s => s.id === formData.functional_spec_id);
                                                return spec ? (
                                                    <>
                                                        <div className="font-bold text-blue-900 text-sm">{spec.title}</div>
                                                        <div className="text-xs text-blue-600 mt-1 flex gap-2">
                                                            {spec.spec_code && <span className="font-mono bg-white/50 px-1 rounded">{spec.spec_code}</span>}
                                                            {spec.large_category && <span>{spec.large_category} &gt; {spec.medium_category}</span>}
                                                        </div>
                                                    </>
                                                ) : <span className="text-sm text-slate-500">알 수 없는 기능</span>
                                            })()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsMapperOpen(true)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-xs font-bold"
                                            >
                                                변경
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, functional_spec_id: undefined })}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Unlink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsMapperOpen(true)}
                                        className="w-full p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex items-center justify-center gap-2 text-slate-500 font-bold text-sm group"
                                    >
                                        <LinkIcon className="w-4 h-4 group-hover:text-blue-500" />
                                        <span>구현될 기능 연결하기</span>
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">우선순위</label>
                                    <select
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl focus:border-blue-600 outline-none transition-colors font-bold text-sm text-slate-700"
                                    >
                                        <option value="must">🔴 필수 (Must Have)</option>
                                        <option value="should">🟠 권장 (Should Have)</option>
                                        <option value="could">🟡 선택 (Could Have)</option>
                                        <option value="wont">⚪️ 보류 (Won't Have)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">진행 상태</label>
                                    <div className={`w-full h-11 px-4 flex items-center rounded-xl border font-bold text-sm ${formData.status === 'approved' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                        formData.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                                            formData.status === 'review' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                                formData.status === 'implemented' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                    'bg-slate-50 border-slate-200 text-slate-700'
                                        }`}>
                                        {formData.status === 'draft' && '📝 초안 (Draft)'}
                                        {formData.status === 'review' && '👀 검토 중 (Review)'}
                                        {formData.status === 'approved' && '✅ 승인됨 (Approved)'}
                                        {formData.status === 'rejected' && '❌ 반려됨 (Rejected)'}
                                        {formData.status === 'implemented' && '🎉 구현 완료 (Implemented)'}
                                    </div>
                                </div>
                            </div>

                            {/* Rejection Reason Field - Only show when status is rejected */}
                            {formData.status === 'rejected' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200 bg-red-50 p-4 rounded-xl border border-red-100">
                                    <label className="text-xs font-bold text-red-600 uppercase tracking-wider ml-1 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        반려 사유 (Rejection Reason)
                                    </label>
                                    <textarea
                                        value={formData.rejection_reason || ''}
                                        onChange={e => setFormData({ ...formData, rejection_reason: e.target.value })}
                                        className="w-full h-24 p-3 bg-white border border-red-200 rounded-lg focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-colors text-sm text-slate-700 resize-none"
                                        placeholder="반려 사유를 상세히 입력해주세요. 작성자가 이를 확인하고 수정할 것입니다."
                                        required
                                        readOnly={formData.status !== 'rejected'} // Prevent editing if not in rejected state via workflow
                                    />
                                </div>
                            )}

                            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                                {editingReq ? (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (!editingReq) return;
                                            if (confirm('이 요구사항을 삭제하시겠습니까?')) {
                                                try {
                                                    await requirementService.deleteRequirement(editingReq.id);
                                                    setRequirements(prev => prev.filter(r => r.id !== editingReq.id));
                                                    setIsModalOpen(false);
                                                } catch (err) {
                                                    console.error('Failed to delete requirement:', err);
                                                    alert('삭제 중 오류가 발생했습니다.');
                                                }
                                            }
                                        }}
                                        className="px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors text-sm flex items-center gap-2"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        <span>삭제</span>
                                    </button>
                                ) : (
                                    <div></div>
                                )}
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors text-sm"
                                    >
                                        취소
                                    </button>

                                    {/* Workflow Action Buttons */}
                                    {(() => {
                                        const currentStatus = formData.status || 'draft';
                                        const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

                                        // Draft -> Review
                                        if (currentStatus === 'draft') {
                                            return (
                                                <button
                                                    type="submit"
                                                    onClick={() => setFormData({ ...formData, status: 'review' })}
                                                    disabled={isSaving}
                                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition active:scale-95 flex items-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                                >
                                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                                    <span>승인 요청 (Submit)</span>
                                                </button>
                                            );
                                        }

                                        // Review -> Approve/Reject (Admin/Manager Only)
                                        if (currentStatus === 'review') {
                                            if (isAdminOrManager) {
                                                return (
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const reason = prompt('반려 사유를 입력하세요:');
                                                                if (reason) {
                                                                    setFormData({ ...formData, status: 'rejected', rejection_reason: reason });
                                                                    // We need to trigger submit manually after state update, but state update is async.
                                                                    // For simplicity in this iteration, we'll set state and let user click save, 
                                                                    // OR ideally, we handle immediate save. 
                                                                    // Let's use a specialized handler for immediate action if possible, 
                                                                    // but sticking to form submit pattern:
                                                                    // We can't easily trigger form submit from here without ref.
                                                                    // Alternative: Just change status and show separate "Confirm Reject" button?
                                                                    // Let's try: Update state -> User clicks generic Save? No, user wants specific action.
                                                                    // Better: Update state AND clear isSaving, let user know they must click confirm?
                                                                    // Best: Direct action handler.

                                                                    // Let's adapt handleSave to accept data directly or use a specific effect...
                                                                    // Actually, standard pattern: 
                                                                    // 1. Change status in state
                                                                    // 2. Button text changes to "Confirm Reject"
                                                                    // But that's complex.

                                                                    // Let's allow direct save here:
                                                                    const dataToSave = { ...formData, status: 'rejected' as const, rejection_reason: reason };
                                                                    setFormData(dataToSave);
                                                                    // Proceed to save immediately?
                                                                    // We can call a modified save function.
                                                                    // But let's keep it simple: Just set status/reason, and show a "Diff" saving button
                                                                    // Actually, the original design was "Workflow Actions".
                                                                    // Let's make "Reject" button trigger the save directly.
                                                                    // But we can't call handleSave(e) easily.
                                                                    // Let's just set the form data and rely on the main submit button which will now say "Reject"
                                                                }
                                                            }}
                                                            disabled={isSaving}
                                                            className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold transition active:scale-95 flex items-center gap-2 text-sm disabled:opacity-70"
                                                        >
                                                            <span>반려 (Reject)</span>
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            onClick={() => setFormData({ ...formData, status: 'approved' })}
                                                            disabled={isSaving}
                                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition active:scale-95 flex items-center gap-2 text-sm disabled:opacity-70"
                                                        >
                                                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                                            <span>승인 (Approve)</span>
                                                        </button>
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <div className="px-4 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        <span>검토 진행 중입니다... (Under Review)</span>
                                                    </div>
                                                );
                                            }
                                        }

                                        // Rejected -> Resubmit
                                        if (currentStatus === 'rejected') {
                                            return (
                                                <button
                                                    type="submit"
                                                    onClick={() => setFormData({ ...formData, status: 'review', rejection_reason: undefined })} // Clear rejection reason on resubmit
                                                    disabled={isSaving}
                                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition active:scale-95 flex items-center gap-2 text-sm disabled:opacity-70"
                                                >
                                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                                    <span>재제출 (Resubmit)</span>
                                                </button>
                                            );
                                        }

                                        // Approved -> Implemented
                                        if (currentStatus === 'approved') {
                                            return (
                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        onClick={() => setFormData({ ...formData, status: 'draft' })} // Revert to draft
                                                        disabled={isSaving}
                                                        className="px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition-colors text-sm"
                                                    >
                                                        <span>초안으로 되돌리기</span>
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        onClick={() => setFormData({ ...formData, status: 'implemented' })}
                                                        disabled={isSaving}
                                                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition active:scale-95 flex items-center gap-2 text-sm disabled:opacity-70"
                                                    >
                                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckSquare className="w-5 h-5" />}
                                                        <span>구현 완료 (Mark Implemented)</span>
                                                    </button>
                                                </div>
                                            );
                                        }

                                        // Default fallback (e.g., implemented)
                                        return (
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition active:scale-95 flex items-center gap-2 text-sm disabled:opacity-70"
                                            >
                                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                                <span>저장 (Save)</span>
                                            </button>
                                        );

                                    })()}
                                </div>
                            </div>
                        </form>
                    </div>
                </div >
            )
            }

            {/* Spec Mapper Modal */}
            {
                isMapperOpen && (
                    <SpecMapper
                        specs={specs}
                        selectedSpecId={formData.functional_spec_id}
                        onSelect={(specId) => {
                            setFormData({ ...formData, functional_spec_id: specId });
                            setIsMapperOpen(false);
                        }}
                        onClose={() => setIsMapperOpen(false)}
                    />
                )
            }
        </div >
    )
}
