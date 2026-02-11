import { useEffect, useState } from 'react'
import { requirementService } from '@/services/requirementService'
import { specService } from '@/services/specService'
import { Requirement, FunctionalSpec } from '@/types'
import {
    ClipboardList,
    Search,
    Link as LinkIcon,
    Unlink,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Loader2,
    Plus
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
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="mt-4 text-gray-500">데이터를 불러오는 중...</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">요구사항 정의 (Traceability)</h2>
                    <p className="text-sm text-slate-500">각 요구사항이 어떤 기능으로 설계되었는지 추적합니다.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="요구사항 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100">
                        <Plus className="w-4 h-4" />
                        <span>신규 요구사항</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">코드</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">요구사항명</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">우선순위</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">상태</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">연결된 기능</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">액션</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredRequirements.map((req) => (
                            <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        {req.req_code}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{req.title}</div>
                                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{req.description}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${req.priority === 'must' ? 'bg-red-100 text-red-700' :
                                            req.priority === 'should' ? 'bg-orange-100 text-orange-700' :
                                                'bg-slate-100 text-slate-600'
                                        }`}>
                                        {req.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex items-center gap-1.5 font-medium text-slate-600">
                                        {req.status === 'implemented' ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : req.status === 'approved' ? (
                                            <Clock className="w-4 h-4 text-blue-500" />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4 text-slate-300" />
                                        )}
                                        {req.status}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={req.functional_spec_id || ''}
                                        onChange={(e) => handleMappingChange(req.id, e.target.value || null)}
                                        className="w-48 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-blue-500 outline-none hover:border-slate-300 transition-all cursor-pointer"
                                    >
                                        <option value="">미지정</option>
                                        {specs.map(spec => (
                                            <option key={spec.id} value={spec.id}>{spec.title}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {req.functional_spec_id ? (
                                            <button
                                                onClick={() => handleMappingChange(req.id, null)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                title="연결 해제"
                                            >
                                                <Unlink className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <div className="w-7 h-7 flex items-center justify-center text-slate-300">
                                                <LinkIcon className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredRequirements.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                                    조건에 맞는 요구사항이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <div>총 {requirements.length}개의 요구사항 중 {filteredRequirements.length}개 표시</div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>구현 완료</span>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>설계 완료</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
