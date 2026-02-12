import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_LARGE_CATEGORIES, INITIAL_MEDIUM_CATEGORIES } from '@/constants/categories';

interface CategoryContextType {
    largeCategories: string[];
    mediumCategories: Record<string, string[]>;
    updateCategories: (large: string[], medium: Record<string, string[]>) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [largeCategories, setLargeCategories] = useState<string[]>([]);
    const [mediumCategories, setMediumCategories] = useState<Record<string, string[]>>({});

    useEffect(() => {
        // Load from localStorage or use defaults
        const savedLarge = localStorage.getItem('largeCategories');
        const savedMedium = localStorage.getItem('mediumCategories');

        // Check if saved data is outdated (contains 'User Frontend' or '1. ')
        const isOutdated = savedLarge && (savedLarge.includes('User Frontend') || savedLarge.includes('1. '));

        if (savedLarge && savedMedium && !isOutdated) {
            setLargeCategories(JSON.parse(savedLarge));
            setMediumCategories(JSON.parse(savedMedium));
        } else {
            // Force reset to new defaults
            setLargeCategories(INITIAL_LARGE_CATEGORIES);
            setMediumCategories(INITIAL_MEDIUM_CATEGORIES);
            localStorage.setItem('largeCategories', JSON.stringify(INITIAL_LARGE_CATEGORIES));
            localStorage.setItem('mediumCategories', JSON.stringify(INITIAL_MEDIUM_CATEGORIES));
        }
    }, []);

    const updateCategories = (large: string[], medium: Record<string, string[]>) => {
        setLargeCategories(large);
        setMediumCategories(medium);
        localStorage.setItem('largeCategories', JSON.stringify(large));
        localStorage.setItem('mediumCategories', JSON.stringify(medium));
    };

    return (
        <CategoryContext.Provider value={{ largeCategories, mediumCategories, updateCategories }}>
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategories = () => {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error('useCategories must be used within a CategoryProvider');
    }
    return context;
};
