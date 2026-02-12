import * as React from 'react'
import { useEffect, useState, useMemo } from 'react'
import { specService } from '@/services/specService'
import { FunctionalSpec, DevScope, Status } from '@/types'
import {
    Plus,
    Loader2,
    AlertCircle,
    ChevronRight,
    LayoutGrid,
    ListTree,
    Download,
    CheckCircle2,
    CircleDashed,
    Search,
    MoreHorizontal,
    GripVertical
} from 'lucide-react'
import CategoryModal from '@/components/modals/CategoryModal'
import { useCategories } from '@/contexts/CategoryContext'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SpecListProps {
    projectId: string;
    onCreateNew: () => void;
    onEdit: (spec: FunctionalSpec) => void;
}

interface SortableRowProps {
    spec: FunctionalSpec;
    onEdit: (spec: FunctionalSpec) => void;
    parseSpec: (spec: FunctionalSpec) => any;
    handleStatusToggle: (e: React.MouseEvent, spec: FunctionalSpec) => void;
    loadSpecs: () => Promise<void>;
}

function SortableRow({ spec, onEdit, parseSpec, handleStatusToggle, loadSpecs }: SortableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: spec.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
        position: isDragging ? 'relative' as const : undefined,
    };

    const { specCode, large, medium, description, scope, importance } = parseSpec(spec);

    return (
        <tr
            ref={setNodeRef}
            style={style}
            onClick={() => onEdit(spec)}
            className={`transition-colors cursor-pointer group ${isDragging ? 'bg-blue-50 shadow-md opacity-80' : 'hover:bg-accent/50'}`}
        >
            <td className="px-2 py-4 align-top text-center w-12" onClick={(e) => e.stopPropagation()}>
                <div
                    {...attributes}
                    {...listeners}
                    className="flex justify-center items-center h-full text-slate-400 hover:text-blue-600 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100"
                >
                    <GripVertical className="w-4 h-4" />
                </div>
            </td>
            <td className="px-4 py-4 align-top font-mono text-xs text-muted-foreground font-semibold">
                {specCode || '-'}
            </td>
            <td className="px-4 py-4 align-top">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-blue-600 inline-flex">{large}</span>
                    <span className="text-xs text-muted-foreground font-medium truncate max-w-[140px]">{medium}</span>
                </div>
            </td>
            <td className="px-4 py-4 align-top">
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-foreground group-hover:text-primary transition-colors text-[14px]">{spec.title}</span>
                    <p className="text-xs text-muted-foreground line-clamp-1 font-medium">{description}</p>
                </div>
            </td>
            <td className="px-4 py-4 align-top text-center">
                <div
                    onClick={(e) => handleStatusToggle(e, spec)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-xs font-bold"
                >
                    {spec.status === 'done' ? (
                        <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> <span>완료</span></>
                    ) : spec.status === 'in_progress' ? (
                        <><CircleDashed className="w-3.5 h-3.5 text-blue-600 animate-spin" /> <span>진행중</span></>
                    ) : (
                        <><CircleDashed className="w-3.5 h-3.5 text-muted-foreground" /> <span>대기</span></>
                    )}
                </div>
            </td>
            <td className="px-4 py-4 align-top text-center">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${scope === '1차' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                    {scope}
                </span>
            </td>
            <td className="px-4 py-4 align-top text-center text-xs font-black">
                {importance === '상' ? <span className="text-destructive">상</span> : importance === '중' ? <span className="text-orange-500">중</span> : <span className="text-muted-foreground">하</span>}
            </td>
            <td className="px-4 py-4 text-right align-middle">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </td>
        </tr>
    );
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

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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
        // When searching or filtering, we don't return drag/drop capability, or we just rely on base list
        // Drag and drop usually makes sense when seeing the FULL list or a specifically ordered list.
        // However, to keep it simple, we sort based on the specs state which is already ordered by sort_order.

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

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSpecs((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update sort_order for all affected items
                // This is a naive implementation; for production with pagination, it needs more care.
                // Since this list is relatively small, we update the order of everything or just the moved item + neighbors.
                // To remain robust, we update the backend with the new order.

                // We'll optimistically update the UI, then sync to server.
                // Re-assign sort_order based on new index * 10 or similar to allow spacing

                const updates = newItems.map((item, index) => ({
                    id: item.id,
                    sort_order: (index + 1) * 10
                }));

                // Fire and forget update (or show loading)
                // In a real app we would batch this.
                specService.updateSpecOrders(updates).catch(err => {
                    console.error("Failed to reorder", err);
                    loadSpecs(); // Revert on failure
                });

                return newItems;
            });
        }
    };

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
        const fileName = `Jeisys_B2B_Specs_${new Date().toISOString().slice(0, 10)}.csv`;
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
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground text-sm font-medium">Loading specifications...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-destructive/10 rounded-lg p-8 border border-destructive/20">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <p className="text-destructive font-bold">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-all text-sm font-bold"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-0.5">
                    <h2 className="text-2xl font-bold tracking-tight">기능 명세</h2>
                    <p className="text-sm text-muted-foreground">프로젝트의 모든 기능을 정의하고 상태를 관리합니다.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex border border-input bg-white rounded-md p-0.5 shadow-sm">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-sm transition-all ${viewMode === 'table' ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            title="Table View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('hierarchical')}
                            className={`p-1.5 rounded-sm transition-all ${viewMode === 'hierarchical' ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            title="Hierarchical View"
                        >
                            <ListTree className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="h-9 px-3 border border-input bg-white text-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-all text-xs font-semibold shadow-sm flex items-center gap-2"
                    >
                        <ListTree className="w-4 h-4" />
                        카테고리
                    </button>

                    <button
                        onClick={handleExportCSV}
                        className="h-9 px-3 border border-input bg-white text-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-all text-xs font-semibold shadow-sm flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        CSV
                    </button>

                    <button
                        onClick={onCreateNew}
                        className="h-9 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all text-sm font-bold shadow active:scale-95 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        신규 등록
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="이름, 설명, 코드 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9 w-full pl-9 pr-3 bg-white border border-input rounded-md text-sm outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground"
                    />
                </div>

                <select
                    value={selectedLarge}
                    onChange={(e) => {
                        setSelectedLarge(e.target.value);
                        setSelectedMedium('all');
                    }}
                    className="h-9 px-3 bg-white border border-input rounded-md text-xs font-bold outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                    <option value="all">대분류 전체</option>
                    {largeCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <select
                    value={selectedMedium}
                    onChange={(e) => setSelectedMedium(e.target.value)}
                    className="h-9 px-3 bg-white border border-input rounded-md text-xs font-bold outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                    <option value="all">중분류 전체</option>
                    {(selectedLarge !== 'all' ? (mediumCategories[selectedLarge] || []) : Object.values(mediumCategories).flat()).map((cat, idx) => (
                        <option key={`${cat}-${idx}`} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {viewMode === 'table' ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="rounded-md border border-border bg-white overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-[13px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-border">
                                        <th className="px-4 py-3 font-bold text-muted-foreground w-12 text-center"></th>
                                        <th className="px-4 py-3 font-bold text-muted-foreground w-24">ID</th>
                                        <th className="px-4 py-3 font-bold text-muted-foreground w-40">분류</th>
                                        <th className="px-4 py-3 font-bold text-muted-foreground">기능명</th>
                                        <th className="px-4 py-3 font-bold text-muted-foreground w-28 text-center">상태</th>
                                        <th className="px-4 py-3 font-bold text-muted-foreground w-24 text-center">차수</th>
                                        <th className="px-4 py-3 font-bold text-muted-foreground w-24 text-center">중요도</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    <SortableContext
                                        items={filteredSpecs.map(f => f.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {filteredSpecs.map((spec) => (
                                            <SortableRow
                                                key={spec.id}
                                                spec={spec}
                                                onEdit={onEdit}
                                                parseSpec={parseSpec}
                                                handleStatusToggle={handleStatusToggle}
                                                loadSpecs={loadSpecs}
                                            />
                                        ))}
                                    </SortableContext>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </DndContext>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(groupedSpecs).map(([largeCat, mediums]: [string, any]) => (
                        <div key={largeCat} className="space-y-4">
                            <h3 className="text-base font-bold text-slate-700 uppercase tracking-wider px-1">{largeCat}</h3>
                            <div className="space-y-3">
                                {Object.entries(mediums).map(([mediumCat, items]: [string, any]) => (
                                    <div key={mediumCat} className="bg-white rounded-lg border border-border p-5 shadow-sm space-y-4">
                                        <h4 className="text-sm font-bold text-foreground border-b border-border pb-2.5 flex items-center justify-between">
                                            {mediumCat}
                                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{items.length}</span>
                                        </h4>
                                        <div className="space-y-2.5">
                                            {items.map((item: FunctionalSpec) => {
                                                const { specCode, scope, importance } = parseSpec(item);
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => onEdit(item)}
                                                        className="group flex items-start justify-between gap-3 p-2.5 rounded-md hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100"
                                                    >
                                                        <div className="space-y-1">
                                                            <span className="text-sm font-bold block group-hover:text-blue-600 transition-colors">{item.title}</span>
                                                            <span className="text-[10px] font-mono text-muted-foreground font-bold">{specCode}</span>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                            <div className={`w-2 h-2 rounded-full ${item.status === 'done' ? 'bg-emerald-500' : item.status === 'in_progress' ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                                                            {importance === '상' && <span className="text-[10px] font-black text-destructive">상</span>}
                                                        </div>
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
