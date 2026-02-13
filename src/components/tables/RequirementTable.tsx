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
    Trash2
} from 'lucide-react'
import { userService } from '@/services/userService'

interface RequirementTableProps {
    projectId: string;
}

export function RequirementTable({ projectId }: RequirementTableProps) {
    const [requirements, setRequirements] = useState<Requirement[]>([])
    const [specs, setSpecs] = useState<FunctionalSpec[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

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
        project_id: projectId
    })
    const [isSaving, setIsSaving] = useState(false)

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

    const handleMappingChange = async (reqId: string, specId: string | null) => {
        if (isViewer) return;
        try {
            const updated = await requirementService.updateMapping(reqId, specId)
            setRequirements(prev => prev.map(r => r.id === reqId ? updated : r))
        } catch (err) {
            alert('매핑 업데이트 중 오류가 발생했습니다.')
        }
    }

    const handleAddNew = () => {
        setEditingReq(null)
        setFormData({
            project_id: projectId,
            req_code: '',
            title: '',
            description: '',
            priority: 'must',
            status: 'draft',
            req_type: 'functional',
            version: '1.0'
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

        try {
            setIsSaving(true)
            const saved = await requirementService.upsertRequirement(formData)

            if (editingReq) {
                setRequirements(prev => prev.map(r => r.id === saved.id ? saved : r))
            } else {
                setRequirements(prev => [...prev, saved])
            }
            setIsModalOpen(false)
        } catch (err) {
            console.error('Failed to save requirement:', err)
            alert('저장 중 오류가 발생했습니다.')
        } finally {
            setIsSaving(false)
        }
    }

    const filteredRequirements = requirements.filter(req =>
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.req_code.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
            <div className="flex items-center gap-2 p-2">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="이름, 코드 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 w-full pl-9 pr-3 bg-white border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-600/20 transition-all shadow-sm"
                    />
                </div>
                {!isViewer && (
                    <button
                        onClick={handleAddNew}
                        className="h-10 px-5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all text-sm font-bold shadow active:scale-95 flex items-center gap-2"
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
                            <th className="px-5 py-4 font-bold text-slate-600 w-48 uppercase tracking-widest text-xs">연결된 기능</th>
                            <th className="px-5 py-2 w-20 text-center uppercase tracking-widest text-xs">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredRequirements.map((req) => (
                            <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-5 py-5 align-top font-mono text-[13px] text-blue-600 font-black">
                                    {req.req_code}
                                </td>
                                <td className="px-5 py-5 align-top">
                                    <div className="font-bold text-slate-900 text-[15px]">{req.title}</div>
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
                                <td className="px-5 py-5 align-top">
                                    <select
                                        value={req.functional_spec_id || ''}
                                        disabled={isViewer}
                                        onChange={(e) => handleMappingChange(req.id, e.target.value || null)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:border-blue-600 outline-none hover:bg-white transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">미지정 (UNMAPPED)</option>
                                        {specs.map(spec => (
                                            <option key={spec.id} value={spec.id}>{spec.title}</option>
                                        ))}
                                    </select>
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
                                        {req.functional_spec_id && !isViewer && (
                                            <button
                                                onClick={() => handleMappingChange(req.id, null)}
                                                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                                title="연결 해제"
                                            >
                                                <Unlink className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
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

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">코드 (ID)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.req_code}
                                        onChange={e => setFormData({ ...formData, req_code: e.target.value })}
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-mono font-bold text-slate-700"
                                        placeholder="REQ-001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">유형</label>
                                    <select
                                        value={formData.req_type}
                                        onChange={e => setFormData({ ...formData, req_type: e.target.value as any })}
                                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl focus:border-blue-600 outline-none transition-all font-bold text-sm text-slate-700"
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
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-bold text-lg text-slate-900 placeholder:text-slate-300"
                                    placeholder="요구사항 제목을 입력하세요"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">상세 설명 & 인수 조건</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full h-40 p-4 bg-white border border-slate-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium text-slate-600 resize-none leading-relaxed"
                                    placeholder="요구사항에 대한 상세 설명과 인수 조건을 기술하세요."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">우선순위</label>
                                    <select
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl focus:border-blue-600 outline-none transition-all font-bold text-sm text-slate-700"
                                    >
                                        <option value="must">🔴 필수 (Must Have)</option>
                                        <option value="should">🟠 권장 (Should Have)</option>
                                        <option value="could">🟡 선택 (Could Have)</option>
                                        <option value="wont">⚪️ 보류 (Won't Have)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">진행 상태</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl focus:border-blue-600 outline-none transition-all font-bold text-sm text-slate-700"
                                    >
                                        <option value="draft">📝 초안 (Draft)</option>
                                        <option value="review">👀 검토 중 (Review)</option>
                                        <option value="approved">✅ 승인됨 (Approved)</option>
                                        <option value="rejected">❌ 반려됨 (Rejected)</option>
                                        <option value="implemented">🎉 구현 완료 (Implemented)</option>
                                    </select>
                                </div>
                            </div>

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
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Save className="w-5 h-5" />
                                        )}
                                        <span>{editingReq ? '변경사항 저장' : '요구사항 등록'}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
