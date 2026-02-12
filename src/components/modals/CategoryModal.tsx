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

interface LargeCategory {
    id: string;
    name: string;
}

interface MediumCategory {
    id: string;
    largeCategoryId: string;
    name: string;
}

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">카테고리 관리</h2>
                            <p className="text-sm text-slate-500 font-medium">대분류 및 중분류 체계를 구성합니다.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Large Categories */}
                    <div className="w-1/2 border-r border-slate-100 flex flex-col bg-slate-50/30">
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <FolderOpen className="w-4 h-4 text-blue-500" />
                                    대분류 리스트
                                </h3>
                                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                    {largeCategories.length}
                                </span>
                            </div>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="새 대분류 추가..."
                                    className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm font-medium"
                                    value={!editMode ? newValue : ''}
                                    onChange={(e) => !editMode && setNewValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addLargeCategory()}
                                    disabled={!!editMode}
                                />
                                <button
                                    onClick={addLargeCategory}
                                    disabled={!!editMode}
                                    className="absolute right-2 top-1.5 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:bg-slate-300"
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
                                    className={`group relative flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${selectedLargeCat === cat
                                        ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100'
                                        : 'border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`w-2 h-2 rounded-full ${selectedLargeCat === cat ? 'bg-blue-500 shadow-sm animate-pulse' : 'bg-slate-300'}`} />
                                        {editMode?.type === 'large' && editMode.index === idx ? (
                                            <input
                                                autoFocus
                                                className="bg-slate-50 border-none outline-none font-bold text-slate-800 w-full rounded px-1"
                                                value={editMode.value}
                                                onChange={(e) => setEditMode({ ...editMode, value: e.target.value })}
                                                onBlur={saveEditLarge}
                                                onKeyDown={(e) => e.key === 'Enter' && saveEditLarge()}
                                            />
                                        ) : (
                                            <span className={`font-bold truncate ${selectedLargeCat === cat ? 'text-blue-700' : 'text-slate-700'}`}>
                                                {cat}
                                            </span>
                                        )}
                                    </div>
                                    <div className={`flex items-center gap-1 transition-opacity ${selectedLargeCat === cat ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); startEditLarge(idx, cat); }}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteLargeCategory(cat); }}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <ChevronRight className={`w-5 h-5 ml-1 transition-transform ${selectedLargeCat === cat ? 'translate-x-1 text-blue-500' : 'text-slate-300'}`} />
                                    </div>
                                </div>
                            ))}
                            {largeCategories.length === 0 && (
                                <div className="text-center py-20">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <FolderOpen className="w-8 h-8" />
                                    </div>
                                    <p className="text-slate-400 font-medium">대분류를 등록해주세요.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Medium Categories */}
                    <div className="w-1/2 flex flex-col bg-white">
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-purple-500" />
                                    중분류 리스트 {selectedLargeCat && <span className="text-slate-400 normal-case ml-1">({selectedLargeCat})</span>}
                                </h3>
                                {selectedLargeCat && (
                                    <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold">
                                        {(mediumCategories[selectedLargeCat] || []).length}
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={selectedLargeCat ? "새 중분류 추가..." : "대분류를 먼저 선택하세요"}
                                    disabled={!selectedLargeCat || !!editMode}
                                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-inner font-medium disabled:opacity-50"
                                    value={!editMode ? newValue : ''}
                                    onChange={(e) => !editMode && setNewValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addMediumCategory()}
                                />
                                <button
                                    onClick={addMediumCategory}
                                    disabled={!selectedLargeCat || !!editMode}
                                    className="absolute right-2 top-1.5 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:bg-slate-300 shadow-md shadow-purple-100"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {selectedLargeCat && (mediumCategories[selectedLargeCat] || []).map((cat, idx) => (
                                <div
                                    key={`${selectedLargeCat}-${cat}`}
                                    className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-purple-50/40 rounded-2xl transition-all border border-transparent hover:border-purple-100 hover:shadow-sm"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px] font-black text-purple-400 border border-slate-100 group-hover:border-purple-200">
                                            {idx + 1}
                                        </div>
                                        {editMode?.type === 'medium' && editMode.index === idx ? (
                                            <input
                                                autoFocus
                                                className="bg-white border border-purple-200 outline-none font-semibold text-slate-800 w-full rounded px-2 py-0.5"
                                                value={editMode.value}
                                                onChange={(e) => setEditMode({ ...editMode, value: e.target.value })}
                                                onBlur={saveEditMedium}
                                                onKeyDown={(e) => e.key === 'Enter' && saveEditMedium()}
                                            />
                                        ) : (
                                            <span className="font-semibold text-slate-700 truncate">{cat}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEditMedium(idx, cat)}
                                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteMediumCategory(idx)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {!selectedLargeCat && (
                                <div className="text-center py-20 h-full flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                                        <AlertCircle className="w-8 h-8" />
                                    </div>
                                    <p className="text-slate-400 font-medium">대분류를 먼저 선택해주세요.</p>
                                </div>
                            )}

                            {selectedLargeCat && (!mediumCategories[selectedLargeCat] || mediumCategories[selectedLargeCat].length === 0) && (
                                <div className="text-center py-20">
                                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-100">
                                        <Layers className="w-8 h-8" />
                                    </div>
                                    <p className="text-slate-400 font-medium">중분류를 등록해주세요.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        변경사항은 [설정 저장] 버튼을 눌러야 반영됩니다.
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-all active:scale-95"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSaveAll}
                            disabled={showConfirm}
                            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${showConfirm
                                ? 'bg-green-500 text-white shadow-green-100'
                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
                                }`}
                        >
                            {showConfirm ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    저장 완료
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    설정 저장
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
