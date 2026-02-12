import * as React from 'react'
import { useEffect, useState, useMemo } from 'react'
import { specService } from '@/services/specService'
import { FunctionalSpec, DevScope, Status } from '@/types'
import {
    FileText,
    Plus,
    Loader2,
    AlertCircle,
    ChevronRight,
    LayoutGrid,
    ListTree,
    Download,
    CheckCircle2,
    CircleDashed,
    Search
} from 'lucide-react'
import CategoryModal from '@/components/modals/CategoryModal'
import { useCategories } from '@/contexts/CategoryContext'

interface SpecListProps {
    projectId: string;
    onCreateNew: () => void;
    onEdit: (spec: FunctionalSpec) => void;
}

export function SpecList({ projectId, onCreateNew, onEdit }: SpecListProps) {
    const [specs, setSpecs] = useState<FunctionalSpec[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'hierarchical' | 'table'>('table')
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedLarge, setSelectedLarge] = useState<string>('all')
    const [selectedMedium, setSelectedMedium] = useState<string>('all')
    const { largeCategories, mediumCategories, updateCategories: syncCategories } = useCategories()

    const loadSpecs = async () => {
        try {
            setLoading(true)
            const data = await specService.getSpecsByProject(projectId)
            setSpecs(data)
            setError(null)
        } catch (err) {
            console.error('Failed to load specs:', err)
            setError('기능 명세 목록을 불러오지 못했습니다.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSpecs()
    }, [projectId])

    const handleStatusToggle = async (e: React.MouseEvent, spec: FunctionalSpec) => {
        e.stopPropagation();
        const nextStatus: Status =
            spec.status === 'todo' ? 'in_progress' :
                spec.status === 'in_progress' ? 'done' : 'todo';

        try {
            await specService.upsertSpec({ ...spec, status: nextStatus });
            loadSpecs();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const parseSpec = (spec: FunctionalSpec) => {
        const segments = (spec.category || '').split('|');

        let specCode = spec.spec_code || '';
        let large = spec.large_category || '';
        let medium = spec.medium_category || '';
        let small = spec.small_category || '';
        let description = spec.description || '';
        let scope = spec.dev_scope || '1차';
        let importance = spec.importance || '';
        let notes = spec.notes || '';

        if (segments.length >= 8) {
            if (!specCode) specCode = segments[0] || '';
            if (!large) large = segments[1] || '';
            if (!medium) medium = segments[2] || '';
            if (!small) small = segments[3] || '';
            if (!description) description = segments[4] || '';
            if (!spec.dev_scope) scope = (segments[5] as DevScope) || '1차';
            if (!importance) importance = segments[6] || '';
            if (!notes) notes = segments[7] || '';
        } else if (segments.length >= 5) {
            if (!large) large = segments[0] || '';
            if (!medium) medium = segments[1] || '';
            if (!small) small = segments[2] || '';
            if (!description) description = segments[3] || '';
            if (!spec.dev_scope) scope = (segments[4] as DevScope) || '1차';
        }

        if (!large) large = largeCategories[0] || '';

        return { specCode, large, medium, small, description, scope: scope as DevScope, importance, notes };
    };

    const filteredSpecs = useMemo(() => {
        return specs.filter(spec => {
            const { large, medium, description, specCode } = parseSpec(spec);
            const matchesSearch =
                spec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (specCode || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesLarge = selectedLarge === 'all' || large === selectedLarge;
            const matchesMedium = selectedMedium === 'all' || medium === selectedMedium;

            return matchesSearch && matchesLarge && matchesMedium;
        });
    }, [specs, searchTerm, selectedLarge, selectedMedium]);

    const groupedSpecs = useMemo(() => {
        const groups: any = {}
        filteredSpecs.forEach(spec => {
            const { large, medium } = parseSpec(spec);
            if (!groups[large]) groups[large] = {}
            if (!groups[large][medium]) groups[large][medium] = []
            groups[large][medium].push(spec)
        })
        return groups
    }, [filteredSpecs])

    const handleExportCSV = () => {
        if (specs.length === 0) return;
        const headers = ['ID', '대분류', '중분류', '기능명', '기능설명/기능내역', '개발순차', '중요도', '비고', '버전', '상태'];
        const escapeCSVCell = (cell: string | number): string => {
            const cellStr = String(cell || '');
            return `"${cellStr.replace(/"/g, '""')}"`;
        };
        const rows = specs.map(spec => {
            const { specCode, large, medium, description, scope, importance, notes } = parseSpec(spec);
            return [
                escapeCSVCell(specCode),
                escapeCSVCell(large),
                escapeCSVCell(medium),
                escapeCSVCell(spec.title),
                escapeCSVCell(description),
                escapeCSVCell(scope),
                escapeCSVCell(importance),
                escapeCSVCell(notes),
                escapeCSVCell(spec.version),
                escapeCSVCell(spec.status)
            ].join(',');
        });
        const csvContent = [headers.join(','), ...rows].join('\r\n');
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const fileName = `Jeisys_B2B_기능정의서_${new Date().toISOString().slice(0, 10)}.csv`;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">기능 명세 목록을 불러오는 중...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-50 rounded-3xl p-8 border border-red-100">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <p className="text-red-700 font-bold text-xl">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-200"
                >
                    다시 시도
                </button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm">Jeisys B2B Mall</span>
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">기능정의서</h2>
                    <p className="text-gray-500 mt-3 text-lg font-medium">시스템의 전반적인 기능을 카테고리별로 관리합니다.</p>
                </div>
                <div className="flex items-center flex-wrap gap-3">
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 shadow-inner">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span>테이블형</span>
                        </button>
                        <button
                            onClick={() => setViewMode('hierarchical')}
                            className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'hierarchical' ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <ListTree className="w-4 h-4" />
                            <span>계층형</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all font-bold shadow-sm"
                    >
                        <ListTree className="w-4 h-4" />
                        <span>카테고리</span>
                    </button>

                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold shadow-lg shadow-emerald-100"
                    >
                        <Download className="w-4 h-4" />
                        <span>내보내기</span>
                    </button>

                    <button
                        onClick={onCreateNew}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>신규 등록</span>
                    </button>
                </div>
            </div>

            {/* Filters Area */}
            <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm mb-6 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="기능명, 설명, ID 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all font-medium text-sm outline-none"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={selectedLarge}
                            onChange={(e) => {
                                setSelectedLarge(e.target.value);
                                setSelectedMedium('all');
                            }}
                            className="px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all font-black text-[11px] text-gray-600 outline-none cursor-pointer appearance-none min-w-[140px] pr-8"
                        >
                            <option value="all">📁 대분류 전체</option>
                            {largeCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <ChevronRight className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            value={selectedMedium}
                            onChange={(e) => setSelectedMedium(e.target.value)}
                            className="px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all font-black text-[11px] text-gray-600 outline-none cursor-pointer appearance-none min-w-[140px] pr-8"
                        >
                            <option value="all">📂 중분류 전체</option>
                            {(selectedLarge !== 'all' ? (mediumCategories[selectedLarge] || []) : Object.values(mediumCategories).flat()).map((cat, idx) => (
                                <option key={`${cat}-${idx}`} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <ChevronRight className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                    </div>
                </div>

                <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-auto">
                    Total {filteredSpecs.length} Results
                </div>
            </div>

            {specs.length === 0 ? (
                <div className="text-center p-24 bg-white rounded-lg border-4 border-dashed border-gray-50 flex flex-col items-center">
                    <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-inner">
                        <FileText className="w-12 h-12 text-blue-200" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800">문서가 텅 비어있습니다.</h3>
                    <p className="text-gray-400 mt-3 max-w-sm text-lg font-medium">새로운 기능을 등록하여 프로젝트 구조를 설계하세요.</p>
                    <button
                        onClick={onCreateNew}
                        className="mt-10 px-8 py-4 bg-blue-600 text-white rounded-3xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                    >
                        첫 번째 기능 등록하기
                    </button>
                </div>
            ) : viewMode === 'table' ? (
                <div className="bg-white rounded-lg border border-gray-200 shadow-2xl shadow-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                    <th className="px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">분류</th>
                                    <th className="px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">기능명/설명</th>
                                    <th className="px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">상태</th>
                                    <th className="px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">개발순차</th>
                                    <th className="px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">중요도</th>
                                    <th className="px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">비고</th>
                                    <th className="px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredSpecs.map((spec) => {
                                    const { specCode, large, medium, description, scope, importance, notes } = parseSpec(spec);
                                    return (
                                        <tr key={spec.id} onClick={() => onEdit(spec)} className="hover:bg-blue-50/40 transition-all cursor-pointer group border-b border-gray-50 last:border-0">
                                            <td className="px-6 py-2.5 align-top">
                                                <span className="font-mono text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{specCode || '-'}</span>
                                            </td>
                                            <td className="px-6 py-2.5 align-top">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md w-fit uppercase">{large}</span>
                                                    <span className="text-xs font-bold text-gray-800 line-clamp-1">{medium}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2.5 align-top max-w-md">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 font-extrabold text-sm group-hover:text-blue-700 transition-colors">{spec.title}</span>
                                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{description || '상세 정보가 없습니다.'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2.5 align-top">
                                                <button
                                                    onClick={(e) => handleStatusToggle(e, spec)}
                                                    className="flex items-center gap-2 hover:bg-slate-100 p-1.5 -m-1.5 rounded-xl transition-all"
                                                >
                                                    {spec.status === 'done' ? (
                                                        <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <span className="text-[11px] font-black text-slate-800">Done</span></>
                                                    ) : spec.status === 'in_progress' ? (
                                                        <><CircleDashed className="w-4 h-4 text-blue-500 animate-spin-slow" /> <span className="text-[11px] font-black text-slate-800">In Progress</span></>
                                                    ) : (
                                                        <><CircleDashed className="w-4 h-4 text-slate-300" /> <span className="text-[11px] font-black text-slate-400">Todo</span></>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-2.5 align-top">
                                                <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg ${scope === '1차' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {scope}
                                                </span>
                                            </td>
                                            <td className="px-6 py-2.5 align-top">
                                                <span className={`text-[11px] font-black ${importance === '상' ? 'text-red-600' : 'text-orange-500'
                                                    }`}>{importance || '-'}</span>
                                            </td>
                                            <td className="px-6 py-2.5 align-top">
                                                <span className="text-[11px] text-gray-500 font-medium line-clamp-1">{notes || '-'}</span>
                                            </td>
                                            <td className="px-6 py-2.5 text-right">
                                                <button className="text-gray-300 group-hover:text-blue-600 transition-all transform group-hover:translate-x-1">
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-16">
                    {Object.entries(groupedSpecs).map(([largeCat, mediums]: [string, any]) => (
                        <div key={largeCat} className="relative">
                            <div className="flex items-center gap-6 mb-8 group">
                                <div className="h-10 w-2.5 bg-blue-600 rounded-full shadow-lg shadow-blue-100 transition-all group-hover:h-12"></div>
                                <h3 className="text-2xl font-black text-gray-900">{largeCat}</h3>
                                <div className="flex-1 h-px bg-gray-100"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {Object.entries(mediums).map(([mediumCat, items]: [string, any]) => (
                                    <div key={mediumCat} className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm p-8 hover:shadow-xl hover:bg-white transition-all">
                                        <div className="flex items-center justify-between mb-8">
                                            <h4 className="font-black text-gray-800 text-lg flex items-center gap-3">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                {mediumCat}
                                            </h4>
                                            <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-black rounded-lg">
                                                {items.length} UNITS
                                            </span>
                                        </div>
                                        <div className="space-y-6">
                                            {items.map((item: FunctionalSpec) => {
                                                const { specCode, description, importance } = parseSpec(item);
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => onEdit(item)}
                                                        className="group flex items-start gap-4 p-4 -mx-4 rounded-2xl hover:bg-blue-50/50 transition-all cursor-pointer"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{item.title}</span>
                                                                <div className="flex items-center gap-2 ml-auto">
                                                                    <div className={`w-2 h-2 rounded-full ${item.status === 'done' ? 'bg-emerald-500' :
                                                                        item.status === 'in_progress' ? 'bg-blue-500' :
                                                                            'bg-gray-300'
                                                                        }`}></div>
                                                                    {importance === '상' && <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-[9px] font-black text-gray-300">{specCode}</span>
                                                                <p className="text-[11px] text-gray-400 line-clamp-1 leading-relaxed">{description || '상세 정보 없음'}</p>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-gray-200 mt-1" />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isCategoryModalOpen && (
                <CategoryModal
                    isOpen={isCategoryModalOpen}
                    onClose={() => setIsCategoryModalOpen(false)}
                    initialLargeCategories={largeCategories}
                    initialMediumCategories={mediumCategories}
                    onSave={syncCategories}
                />
            )}
        </div>
    )
}
