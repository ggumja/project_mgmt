import * as React from 'react'
import { useEffect, useState, useMemo } from 'react'
import { specService } from '@/services/specService'
import { FunctionalSpec, DevScope } from '@/types'
import {
    Plus,
    Loader2,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight,
    Download,
    GripVertical,
    MoreVertical,
    CheckCircle2,
    CircleDashed,
    LayoutGrid,
    ListTree,
    Settings2,
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
    const { largeCategories, mediumCategories } = useCategories()
    const [searchTerm, setSearchTerm] = useState('')

    // Pagination state (mock)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        async function loadSpecs() {
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
        loadSpecs()
    }, [projectId])

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
        if (!searchTerm) return specs;
        return specs.filter(spec =>
            spec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            spec.spec_code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [specs, searchTerm]);

    const paginatedSpecs = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredSpecs.slice(start, start + rowsPerPage);
    }, [filteredSpecs, currentPage, rowsPerPage]);

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
            <div className="flex flex-col items-center justify-center min-h-[500px]">
                <Loader2 className="w-10 h-10 text-slate-300 animate-spin mb-4" />
                <p className="text-slate-400 font-medium tracking-tight">기능 명세 목록 로딩 중...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] border border-red-100 rounded-2xl bg-white p-12">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-slate-800 font-bold text-lg">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all font-bold"
                >
                    새로고침
                </button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-4">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100/50 rounded-xl border border-slate-200/60">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Outline
                    </button>
                    <button
                        onClick={() => setViewMode('hierarchical')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'hierarchical' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Hierarchical
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search spec..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none w-48 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold shadow-sm"
                    >
                        <Settings2 className="w-4 h-4" />
                        <span>Customize Columns</span>
                    </button>

                    <button
                        onClick={onCreateNew}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-sm font-bold shadow-sm active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Section</span>
                    </button>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                {viewMode === 'table' ? (
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/30">
                                    <th className="w-12 px-4 py-4"></th>
                                    <th className="w-48 px-4 py-4 text-xs font-bold text-slate-600">Header</th>
                                    <th className="w-40 px-4 py-4 text-xs font-bold text-slate-600">Section Type</th>
                                    <th className="w-40 px-4 py-4 text-xs font-bold text-slate-600">Status</th>
                                    <th className="w-24 px-4 py-4 text-xs font-bold text-slate-600">Target</th>
                                    <th className="w-24 px-4 py-4 text-xs font-bold text-slate-600">Limit</th>
                                    <th className="flex-1 px-4 py-4 text-xs font-bold text-slate-600">Reviewer</th>
                                    <th className="w-12 px-4 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedSpecs.map((spec) => {
                                    const { specCode, large, medium, scope, importance, notes } = parseSpec(spec);
                                    return (
                                        <tr key={spec.id} onClick={() => onEdit(spec)} className="hover:bg-slate-50/80 transition-all cursor-pointer group">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <GripVertical className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
                                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer" onClick={(e) => e.stopPropagation()} />
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-slate-600 transition-colors">{spec.title}</span>
                                                    <span className="text-[10px] font-mono text-slate-400">{specCode}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 text-slate-500 border border-slate-200/50">
                                                    {large}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    {importance === '상' ? (
                                                        <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-[11px] font-bold text-slate-700">Done</span></>
                                                    ) : (
                                                        <><CircleDashed className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> <span className="text-[11px] font-bold text-slate-700">In Process</span></>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-medium text-slate-800">29</td>
                                            <td className="px-4 py-4 text-sm font-medium text-slate-800">
                                                <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">24</span>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-bold text-slate-600">
                                                {medium || 'Assign reviewer'}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <button className="p-1 hover:bg-slate-100 rounded transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex-1 p-8 bg-slate-50/30 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(groupedSpecs).map(([largeCat, mediums]: [string, any]) => (
                                <div key={largeCat} className="space-y-4">
                                    <div className="flex items-center gap-2 px-2">
                                        <LayoutGrid className="w-4 h-4 text-slate-400" />
                                        <h3 className="font-bold text-slate-800">{largeCat}</h3>
                                        <span className="text-[10px] text-slate-400 ml-auto bg-white px-2 py-0.5 rounded-full border border-slate-200">{Object.keys(mediums).length} Sections</span>
                                    </div>
                                    <div className="space-y-2">
                                        {Object.entries(mediums).map(([mediumCat, items]: [string, any]) => (
                                            <div key={mediumCat} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all cursor-pointer group" onClick={() => { }}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[11px] font-black text-slate-400 tracking-tighter uppercase">{mediumCat}</span>
                                                    <span className="w-5 h-5 flex items-center justify-center bg-slate-50 rounded-full text-[10px] font-bold text-slate-400">{items.length}</span>
                                                </div>
                                                <div className="space-y-3">
                                                    {items.slice(0, 3).map((item: FunctionalSpec) => (
                                                        <div key={item.id} className="flex flex-col gap-0.5" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                                                            <span className="text-[13px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-1">{item.title}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-mono text-slate-300">{item.spec_code}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {items.length > 3 && <button className="w-full mt-2 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors border-t border-slate-50">View {items.length - 3} more items...</button>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pagination Footer */}
                <div className="border-t border-slate-100 bg-white px-6 py-4 flex items-center justify-between">
                    <div className="text-xs text-slate-400 font-medium">
                        0 of {filteredSpecs.length} row(s) selected.
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-600">Rows per page</span>
                            <select
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value))
                                    setCurrentPage(1)
                                }}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-600">Page {currentPage} of {Math.ceil(filteredSpecs.length / rowsPerPage)}</span>
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(1)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all"
                                >
                                    <ChevronsLeft className="w-4 h-4 text-slate-600" />
                                </button>
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                                </button>
                                <button
                                    disabled={currentPage === Math.ceil(filteredSpecs.length / rowsPerPage)}
                                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredSpecs.length / rowsPerPage), prev + 1))}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all"
                                >
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                </button>
                                <button
                                    disabled={currentPage === Math.ceil(filteredSpecs.length / rowsPerPage)}
                                    onClick={() => setCurrentPage(Math.ceil(filteredSpecs.length / rowsPerPage))}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all"
                                >
                                    <ChevronsRight className="w-4 h-4 text-slate-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isCategoryModalOpen && (
                <CategoryModal
                    isOpen={isCategoryModalOpen}
                    onClose={() => setIsCategoryModalOpen(false)}
                    initialLargeCategories={largeCategories}
                    initialMediumCategories={mediumCategories}
                    onSave={updateCategories}
                />
            )}

            {/* Context menu mock or real would go here */}
        </div>
    )
}
