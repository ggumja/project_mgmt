import * as React from 'react'
import { useState } from 'react'
import {
    X,
    Plus,
    Trash2,
    Edit2,
    ChevronRight,
    FolderOpen,
    Layers,
    Save,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialLargeCategories?: string[];
    initialMediumCategories?: Record<string, string[]>;
    onSave: (largeCats: string[], mediumCats: Record<string, string[]>) => void;
}

export default function CategoryModal({
    isOpen,
    onClose,
    initialLargeCategories = [],
    initialMediumCategories = {},
    onSave
}: CategoryModalProps) {
    // Local state for management
    const [largeCategories, setLargeCategories] = useState<string[]>(initialLargeCategories);
    const [mediumCategories, setMediumCategories] = useState<Record<string, string[]>>(initialMediumCategories);

    const [selectedLargeCat, setSelectedLargeCat] = useState<string | null>(
        initialLargeCategories.length > 0 ? initialLargeCategories[0] : null
    );

    const [editMode, setEditMode] = useState<{ type: 'large' | 'medium', index: number, value: string } | null>(null);
    const [newValue, setNewValue] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    if (!isOpen) return null;

    // Handlers for Large Categories
    const addLargeCategory = () => {
        if (!newValue.trim()) return;
        if (largeCategories.includes(newValue.trim())) {
            alert('이미 존재하는 대분류입니다.');
            return;
        }
        const updated = [...largeCategories, newValue.trim()];
        setLargeCategories(updated);
        if (!selectedLargeCat) setSelectedLargeCat(newValue.trim());
        setNewValue('');
    };

    const deleteLargeCategory = (cat: string) => {
        if (!confirm(`'${cat}' 대분류와 하위 모든 중분류가 삭제됩니다. 계속하시겠습니까?`)) return;

        const updatedLarge = largeCategories.filter(c => c !== cat);
        setLargeCategories(updatedLarge);

        const updatedMedium = { ...mediumCategories };
        delete updatedMedium[cat];
        setMediumCategories(updatedMedium);

        if (selectedLargeCat === cat) {
            setSelectedLargeCat(updatedLarge.length > 0 ? updatedLarge[0] : null);
        }
    };

    const startEditLarge = (index: number, value: string) => {
        setEditMode({ type: 'large', index, value });
    };

    const saveEditLarge = () => {
        if (!editMode || editMode.type !== 'large') return;
        const newName = editMode.value.trim();
        if (!newName) return;

        const oldName = largeCategories[editMode.index];
        const updatedLarge = [...largeCategories];
        updatedLarge[editMode.index] = newName;
        setLargeCategories(updatedLarge);

        // Update medium categories key
        const updatedMedium = { ...mediumCategories };
        if (updatedMedium[oldName]) {
            updatedMedium[newName] = updatedMedium[oldName];
            delete updatedMedium[oldName];
        }
        setMediumCategories(updatedMedium);

        if (selectedLargeCat === oldName) setSelectedLargeCat(newName);
        setEditMode(null);
    };

    // Handlers for Medium Categories
    const addMediumCategory = () => {
        if (!selectedLargeCat || !newValue.trim()) return;

        const currentMediums = mediumCategories[selectedLargeCat] || [];
        if (currentMediums.includes(newValue.trim())) {
            alert('이미 존재하는 중분류입니다.');
            return;
        }

        const updated = {
            ...mediumCategories,
            [selectedLargeCat]: [...currentMediums, newValue.trim()]
        };
        setMediumCategories(updated);
        setNewValue('');
    };

    const deleteMediumCategory = (index: number) => {
        if (!selectedLargeCat) return;

        const currentMediums = mediumCategories[selectedLargeCat] || [];
        const updatedMediums = currentMediums.filter((_, i) => i !== index);

        setMediumCategories({
            ...mediumCategories,
            [selectedLargeCat]: updatedMediums
        });
    };

    const startEditMedium = (index: number, value: string) => {
        setEditMode({ type: 'medium', index, value });
    };

    const saveEditMedium = () => {
        if (!editMode || editMode.type !== 'medium' || !selectedLargeCat) return;
        const newName = editMode.value.trim();
        if (!newName) return;

        const updatedMediums = [...(mediumCategories[selectedLargeCat] || [])];
        updatedMediums[editMode.index] = newName;

        setMediumCategories({
            ...mediumCategories,
            [selectedLargeCat]: updatedMediums
        });
        setEditMode(null);
    };

    const handleSaveAll = () => {
        onSave(largeCategories, mediumCategories);
        setShowConfirm(true);
        setTimeout(() => {
            setShowConfirm(false);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-5 border-b border-border flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center text-blue-600">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground tracking-tight">카테고리 관리</h2>
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Configure project terminology</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-md transition-all text-muted-foreground"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Large Categories */}
                    <div className="w-1/2 border-r border-border flex flex-col bg-slate-50/50">
                        <div className="p-6 border-b border-border space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <FolderOpen className="w-4 h-4" />
                                    대분류
                                </h3>
                                <span className="text-xs font-mono font-black text-primary px-2 py-1 bg-primary/10 rounded-full">
                                    {largeCategories.length}
                                </span>
                            </div>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="새 대분류..."
                                    className="h-10 w-full pl-4 pr-12 bg-white border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                    value={!editMode ? newValue : ''}
                                    onChange={(e) => !editMode && setNewValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addLargeCategory()}
                                    disabled={!!editMode}
                                />
                                <button
                                    onClick={addLargeCategory}
                                    disabled={!!editMode}
                                    className="absolute right-1.5 top-1.5 p-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-all disabled:opacity-50"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {largeCategories.map((cat, idx) => (
                                <div
                                    key={cat}
                                    onClick={() => !editMode && setSelectedLargeCat(cat)}
                                    className={`group flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all border text-sm ${selectedLargeCat === cat
                                        ? 'bg-white border-primary/30 shadow-md scale-[1.02]'
                                        : 'border-transparent hover:bg-white hover:border-border'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                                        <div className={`w-2 h-2 rounded-full ${selectedLargeCat === cat ? 'bg-primary' : 'bg-slate-300'}`} />
                                        {editMode?.type === 'large' && editMode.index === idx ? (
                                            <input
                                                autoFocus
                                                className="bg-slate-100 border-none outline-none font-bold text-foreground w-full rounded px-2 py-0.5"
                                                value={editMode.value}
                                                onChange={(e) => setEditMode({ ...editMode, value: e.target.value })}
                                                onBlur={saveEditLarge}
                                                onKeyDown={(e) => e.key === 'Enter' && saveEditLarge()}
                                            />
                                        ) : (
                                            <span className={`font-bold truncate ${selectedLargeCat === cat ? 'text-primary' : 'text-slate-700'}`}>
                                                {cat}
                                            </span>
                                        )}
                                    </div>
                                    <div className={`flex items-center gap-2 transition-opacity ${selectedLargeCat === cat ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); startEditLarge(idx, cat); }}
                                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteLargeCategory(cat); }}
                                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <ChevronRight className={`w-5 h-5 transition-transform ${selectedLargeCat === cat ? 'translate-x-1 text-primary' : 'text-slate-200'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Medium Categories */}
                    <div className="w-1/2 flex flex-col bg-white">
                        <div className="p-6 border-b border-border space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-blue-500" />
                                    중분류 {selectedLargeCat && <span className="text-slate-400 lowercase ml-1">({selectedLargeCat})</span>}
                                </h3>
                                {selectedLargeCat && (
                                    <span className="text-xs font-mono font-black text-primary px-2 py-1 bg-primary/10 rounded-full">
                                        {(mediumCategories[selectedLargeCat] || []).length}
                                    </span>
                                )}
                            </div>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder={selectedLargeCat ? "새 중분류..." : "대분류를 먼저 선택하세요"}
                                    disabled={!selectedLargeCat || !!editMode}
                                    className="h-10 w-full pl-4 pr-12 bg-white border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm disabled:bg-slate-50"
                                    value={!editMode ? newValue : ''}
                                    onChange={(e) => !editMode && setNewValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addMediumCategory()}
                                />
                                <button
                                    onClick={addMediumCategory}
                                    disabled={!selectedLargeCat || !!editMode}
                                    className="absolute right-1.5 top-1.5 p-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-all disabled:opacity-50"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {selectedLargeCat && (mediumCategories[selectedLargeCat] || []).map((cat, idx) => (
                                <div
                                    key={`${selectedLargeCat}-${cat}`}
                                    className="group flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-100 rounded-lg transition-all border border-transparent hover:border-slate-200 text-sm"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                                        <span className="text-xs font-black text-slate-300 w-5">{idx + 1}</span>
                                        {editMode?.type === 'medium' && editMode.index === idx ? (
                                            <input
                                                autoFocus
                                                className="bg-white border border-primary/30 outline-none font-bold text-foreground w-full rounded px-2 py-0.5"
                                                value={editMode.value}
                                                onChange={(e) => setEditMode({ ...editMode, value: e.target.value })}
                                                onBlur={saveEditMedium}
                                                onKeyDown={(e) => e.key === 'Enter' && saveEditMedium()}
                                            />
                                        ) : (
                                            <span className="font-bold text-slate-700 truncate">{cat}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEditMedium(idx, cat)}
                                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteMediumCategory(idx)}
                                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 bg-slate-100/50 border-t border-border flex items-center justify-between sticky bottom-0 z-10">
                    <p className="text-xs text-slate-500 font-bold flex items-center gap-2 uppercase tracking-widest">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        저장 버튼을 눌러야 최종 반영됩니다.
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="h-10 px-6 text-sm font-bold hover:bg-slate-200 rounded-md transition-all text-slate-600"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSaveAll}
                            disabled={showConfirm}
                            className={`h-10 px-8 rounded-md font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center gap-2 ${showConfirm
                                ? 'bg-emerald-500 text-white'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                }`}
                        >
                            {showConfirm ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    저장됨
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    카테고리 저장
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
