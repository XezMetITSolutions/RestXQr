'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Reorder, useDragControls, AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { FaGripVertical, FaChevronDown, FaChevronRight, FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import BusinessSidebar from '@/components/BusinessSidebar';

interface MenuItem {
    id: string;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
    categoryId: string;
    displayOrder: number;
    isAvailable: boolean;
}

interface MenuCategory {
    id: string;
    name: string;
    description?: string;
    displayOrder: number;
    items: MenuItem[];
}

export default function MenuPreviewPage() {
    // Auth & State
    const { authenticatedRestaurant, initializeAuth } = useAuthStore();
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    // Initialize Auth
    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    // Fetch Menu Data
    const fetchData = useCallback(async () => {
        if (!authenticatedRestaurant?.id) return;

        try {
            setLoading(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const res = await fetch(`${API_URL}/restaurants/${authenticatedRestaurant.id}/menu`);

            if (!res.ok) throw new Error('Failed to fetch menu');

            const json = await res.json();
            if (json.success) {
                // Sort categories by displayOrder
                const sortedCategories = (json.data.categories || []).sort((a: MenuCategory, b: MenuCategory) =>
                    (a.displayOrder || 0) - (b.displayOrder || 0)
                );

                // Sort items within categories
                const categoriesWithSortedItems = sortedCategories.map((cat: MenuCategory) => ({
                    ...cat,
                    items: (cat.items || []).sort((a: MenuItem, b: MenuItem) =>
                        (a.displayOrder || 0) - (b.displayOrder || 0)
                    )
                }));

                setCategories(categoriesWithSortedItems);

                // Expand all by default for better visibility or maybe just the first one
                // setExpandedCategories(new Set(categoriesWithSortedItems.map((c: MenuCategory) => c.id)));
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
            alert('Menü yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, [authenticatedRestaurant?.id]);

    useEffect(() => {
        if (authenticatedRestaurant?.id) {
            fetchData();
        }
    }, [fetchData, authenticatedRestaurant?.id]);

    // Handle Save
    const handleSave = async () => {
        if (!authenticatedRestaurant?.id) return;

        try {
            setSaving(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            // Prepare payload
            // Categories with new displayOrder (index based)
            const categoryUpdates = categories.map((cat, index) => ({
                id: cat.id,
                displayOrder: index
            }));

            // Items with new displayOrder (index based within their category)
            const itemUpdates: { id: string, displayOrder: number }[] = [];
            categories.forEach(cat => {
                cat.items.forEach((item, index) => {
                    itemUpdates.push({
                        id: item.id,
                        displayOrder: index
                    });
                });
            });

            const res = await fetch(`${API_URL}/restaurants/${authenticatedRestaurant.id}/menu/reorder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    categories: categoryUpdates,
                    items: itemUpdates
                })
            });

            const json = await res.json();
            if (json.success) {
                alert('Sıralama başarıyla kaydedildi!');
            } else {
                throw new Error(json.message || 'Save failed');
            }

        } catch (error) {
            console.error('Error saving order:', error);
            alert('Kaydedilirken bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    // Toggle Accordion
    const toggleCategory = (categoryId: string) => {
        const newDocs = new Set(expandedCategories);
        if (newDocs.has(categoryId)) {
            newDocs.delete(categoryId);
        } else {
            newDocs.add(categoryId);
        }
        setExpandedCategories(newDocs);
    };

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <BusinessSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            <BusinessSidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Header */}
                <header className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/business/menu"
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        >
                            <FaArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Menü Önizleme & Sıralama</h1>
                            <p className="text-sm text-gray-500">Kategorileri ve ürünleri sürükleyip bırakarak sıralayın</p>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium transition-all shadow-md
              ${saving
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-emerald-500 hover:bg-emerald-600 active:scale-95'
                            }`}
                    >
                        {saving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                            <FaSave />
                        )}
                        {saving ? 'Kaydediliyor...' : 'Sıralamayı Kaydet'}
                    </button>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto pb-20">
                        <Reorder.Group
                            axis="y"
                            values={categories}
                            onReorder={setCategories}
                            className="space-y-4"
                        >
                            {categories.map((category) => (
                                <CategoryItem
                                    key={category.id}
                                    category={category}
                                    isExpanded={expandedCategories.has(category.id)}
                                    onToggle={() => toggleCategory(category.id)}
                                    onUpdateItems={(newItems) => {
                                        const newCategories = categories.map(c =>
                                            c.id === category.id ? { ...c, items: newItems } : c
                                        );
                                        setCategories(newCategories);
                                    }}
                                />
                            ))}
                        </Reorder.Group>

                        {categories.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500 text-lg">Menünüzde henüz hiç kategori yok.</p>
                                <Link href="/business/menu" className="text-blue-500 hover:underline mt-2 inline-block">
                                    Menü Yönetimine Git
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Category Item Component
function CategoryItem({
    category,
    isExpanded,
    onToggle,
    onUpdateItems
}: {
    category: MenuCategory;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdateItems: (items: MenuItem[]) => void;
}) {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={category}
            dragListener={false}
            dragControls={dragControls}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
            {/* Category Header */}
            <div className="flex items-center p-4 bg-white hover:bg-gray-50 transition-colors">
                <div
                    className="cursor-grab active:cursor-grabbing p-2 mr-2 text-gray-400 hover:text-gray-600 rounded"
                    onPointerDown={(e) => dragControls.start(e)}
                >
                    <FaGripVertical size={20} />
                </div>

                <button
                    onClick={onToggle}
                    className="flex-1 flex items-center justify-between text-left group"
                >
                    <div className="flex items-center gap-3">
                        <div className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                            {category.name}
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                            {category.items.length} ürün
                        </span>
                        {!category.displayOrder && category.displayOrder !== 0 && (
                            <span className="text-xs text-orange-500">(Sırasız)</span>
                        )}
                    </div>
                    <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                        {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                    </div>
                </button>
            </div>

            {/* Items List (Accordion Body) */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-100 bg-gray-50/50"
                    >
                        <div className="p-3 pl-12 pr-4 space-y-2">
                            {category.items.length > 0 ? (
                                <Reorder.Group
                                    axis="y"
                                    values={category.items}
                                    onReorder={onUpdateItems}
                                    className="space-y-2"
                                >
                                    {category.items.map((item) => (
                                        <ProductItem key={item.id} item={item} />
                                    ))}
                                </Reorder.Group>
                            ) : (
                                <div className="text-center py-4 text-sm text-gray-400 italic">
                                    Bu kategoride ürün bulunmuyor.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Reorder.Item>
    );
}

// Product Item Component
function ProductItem({ item }: { item: MenuItem }) {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={item}
            dragListener={false}
            dragControls={dragControls}
            className="flex items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
            <div
                className="cursor-grab active:cursor-grabbing p-2 mr-3 text-gray-400 hover:text-gray-600 rounded"
                onPointerDown={(e) => dragControls.start(e)}
            >
                <FaGripVertical size={16} />
            </div>

            {item.imageUrl && (
                <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 mr-3 flex-shrink-0">
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNlNTViNWIiLz48L3N2Zz4=';
                        }}
                    />
                </div>
            )}

            <div className="flex-1">
                <div className="font-medium text-gray-800">{item.name}</div>
                <div className="text-sm text-gray-500 flex gap-2">
                    <span>{item.price} TL</span>
                    {!item.isAvailable && <span className="text-red-500 font-xs bg-red-50 px-1 rounded">Tükendi</span>}
                </div>
            </div>
        </Reorder.Item>
    );
}
