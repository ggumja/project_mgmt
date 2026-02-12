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
    MoreHorizontal
} from 'lucide-react'

interface RequirementTableProps {
    projectId: string;
}

export function RequirementTable({ projectId }: RequirementTableProps) {
    const [requirements, setRequirements] = useState<Requirement[]>([])
    const [specs, setSpecs] = useState<FunctionalSpec[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

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
        try {
            const updated = await requirementService.updateMapping(reqId, specId)
            setRequirements(prev => prev.map(r => r.id === reqId ? updated : r))
        } catch (err) {
            alert('매핑 업데이트 중 오류가 발생했습니다.')
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
                <button className="h-10 px-5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all text-sm font-bold shadow active:scale-95 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    신규 요구사항
                </button>
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
                            <th className="px-5 py-2 w-10"></th>
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
                                        onChange={(e) => handleMappingChange(req.id, e.target.value || null)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:border-blue-600 outline-none hover:bg-white transition-all cursor-pointer shadow-sm"
                                    >
                                        <option value="">미지정 (UNMAPPED)</option>
                                        {specs.map(spec => (
                                            <option key={spec.id} value={spec.id}>{spec.title}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-5 py-5 text-right align-middle">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {req.functional_spec_id ? (
                                            <button
                                                onClick={() => handleMappingChange(req.id, null)}
                                                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                title="연결 해제"
                                            >
                                                <Unlink className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <div className="p-2 text-slate-200">
                                                <LinkIcon className="w-4 h-4" />
                                            </div>
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
        </div>
    )
}
