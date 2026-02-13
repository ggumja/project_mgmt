import * as React from 'react';
import { FunctionalSpec } from '@/types';
import { Search, Link as LinkIcon, X } from 'lucide-react';

interface SpecMapperProps {
    specs: FunctionalSpec[];
    selectedSpecId: string | null | undefined;
    onSelect: (specId: string) => void;
    onClose: () => void;
}

export function SpecMapper({ specs, selectedSpecId, onSelect, onClose }: SpecMapperProps) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedLarge, setSelectedLarge] = React.useState<string>('');
    const [selectedMedium, setSelectedMedium] = React.useState<string>('');

    // Initialize selection if a spec is already selected
    React.useEffect(() => {
        if (selectedSpecId) {
            const spec = specs.find(s => s.id === selectedSpecId);
            if (spec) {
                setSelectedLarge(spec.large_category || '');
                setSelectedMedium(spec.medium_category || '');
            }
        }
    }, [selectedSpecId, specs]);

    const uniqueLargeCategories = React.useMemo(() => {
        const categories = new Set(specs.map(s => s.large_category).filter(Boolean));
        return Array.from(categories) as string[];
    }, [specs]);

    const uniqueMediumCategories = React.useMemo(() => {
        if (!selectedLarge) return [];
        const categories = new Set(
            specs
                .filter(s => s.large_category === selectedLarge)
                .map(s => s.medium_category)
                .filter(Boolean)
        );
        return Array.from(categories) as string[];
    }, [specs, selectedLarge]);

    const filteredSpecs = React.useMemo(() => {
        return specs.filter(s => {
            const matchLarge = selectedLarge ? s.large_category === selectedLarge : true;
            const matchMedium = selectedMedium ? s.medium_category === selectedMedium : true;
            const matchSearch = searchTerm
                ? (s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.spec_code?.toLowerCase().includes(searchTerm.toLowerCase()))
                : true;
            return matchLarge && matchMedium && matchSearch;
        });
    }, [specs, selectedLarge, selectedMedium, searchTerm]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <LinkIcon className="w-5 h-5 text-blue-600" />
                            기능 연결 선택
                        </h3>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                            요구사항을 구현할 기능을 선택해주세요.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col p-6 gap-6">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="기능 명칭 또는 코드 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full pl-9 pr-3 bg-white border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-600/20 transition-all shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4 h-full min-h-[400px] flex-1 overflow-hidden">
                        {/* Column 1: Large Category */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-xs text-slate-500 uppercase tracking-wider">
                                1. 대분류 (Large)
                            </div>
                            <div className="overflow-y-auto flex-1 p-2 space-y-1">
                                {uniqueLargeCategories.length === 0 && (
                                    <div className="p-4 text-center text-xs text-slate-400">대분류 없음</div>
                                )}
                                {uniqueLargeCategories.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => {
                                            setSelectedLarge(cat);
                                            setSelectedMedium('');
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedLarge === cat
                                                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                                : 'hover:bg-slate-50 text-slate-700'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Column 2: Medium Category */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-xs text-slate-500 uppercase tracking-wider">
                                2. 중분류 (Medium)
                            </div>
                            <div className="overflow-y-auto flex-1 p-2 space-y-1">
                                {!selectedLarge ? (
                                    <div className="p-4 text-center text-xs text-slate-400">대분류를 먼저 선택하세요</div>
                                ) : uniqueMediumCategories.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-slate-400">중분류 없음</div>
                                ) : (
                                    uniqueMediumCategories.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setSelectedMedium(cat)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedMedium === cat
                                                    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                                    : 'hover:bg-slate-50 text-slate-700'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Column 3: Features */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm ring-1 ring-slate-200">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-xs text-slate-500 uppercase tracking-wider">
                                3. 기능 선택 (Features)
                            </div>
                            <div className="overflow-y-auto flex-1 p-2 space-y-1 bg-slate-50/30">
                                {filteredSpecs.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-slate-400">
                                        {selectedLarge ? '해당하는 기능이 없습니다' : '카테고리를 선택하세요'}
                                    </div>
                                ) : (
                                    filteredSpecs.map(spec => (
                                        <button
                                            key={spec.id}
                                            type="button"
                                            onClick={() => onSelect(spec.id)}
                                            className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-all border ${selectedSpecId === spec.id
                                                    ? 'bg-blue-100 border-blue-300 text-blue-800 shadow-sm'
                                                    : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md text-slate-700'
                                                }`}
                                        >
                                            <div className="font-bold mb-0.5">{spec.title}</div>
                                            <div className="flex gap-2 text-[10px] text-slate-400 font-mono">
                                                {spec.spec_code && <span>{spec.spec_code}</span>}
                                                <span>{spec.dev_scope}</span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors text-sm"
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
}
