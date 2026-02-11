import { useEffect, useState } from 'react'
import { specService } from '@/services/specService'
import { FunctionalSpec } from '@/types'
import { FileText, Plus, Loader2, AlertCircle, ChevronRight } from 'lucide-react'

interface SpecListProps {
    projectId: string;
    onCreateNew: () => void;
    onEdit: (spec: FunctionalSpec) => void;
}

export function SpecList({ projectId, onCreateNew, onEdit }: SpecListProps) {
    const [specs, setSpecs] = useState<FunctionalSpec[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadSpecs() {
            try {
                setLoading(true)
                const data = await specService.getSpecsByProject(projectId)
                setSpecs(data)
                setError(null)
            } catch (err) {
                setError('기능정의서를 불러오는 중 오류가 발생했습니다.')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        if (projectId) {
            loadSpecs()
        }
    }, [projectId])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="mt-4 text-gray-500 font-medium">로딩 중...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <p className="mt-4 text-red-600 font-medium">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    다시 시도
                </button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">기능정의서 목록</h2>
                    <p className="text-gray-500 mt-1">프로젝트의 핵심 기능을 관리합니다.</p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>새 기능 추가</span>
                </button>
            </div>

            {specs.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-800">등록된 기능이 없습니다.</h3>
                    <p className="text-gray-500 mt-2">첫 번째 기능정의서를 작성해보세요!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {specs.map((spec) => (
                        <div
                            key={spec.id}
                            onClick={() => onEdit(spec)}
                            className="group flex items-center justify-between p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${spec.priority === 'critical' ? 'bg-red-50 text-red-600' :
                                    spec.priority === 'high' ? 'bg-orange-50 text-orange-600' :
                                        'bg-blue-50 text-blue-600'
                                    }`}>
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {spec.title}
                                        </h4>
                                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                            v{spec.version}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            {spec.category}
                                        </span>
                                        <span>•</span>
                                        <span>상태: {spec.status}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
