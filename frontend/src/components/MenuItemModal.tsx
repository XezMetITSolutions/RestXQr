'use client';

import { useState, useCallback, useEffect } from 'react';
import { FaTimes, FaPlus, FaMinus, FaStar } from 'react-icons/fa';
import { useCartStore } from '@/store';
import useRestaurantStore from '@/store/useRestaurantStore';
import { MenuItem } from '@/store/useMenuStore';
import { useLanguage } from '@/context/LanguageContext';

interface MenuItemModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  imageCacheVersion?: number;
}

export default function MenuItemModal({ item, isOpen, onClose, imageCacheVersion }: MenuItemModalProps) {
  const { currentLanguage } = useLanguage();
  const { addItem } = useCartStore();
  const { categories } = useRestaurantStore(); // 2. Access categories for category-based discounts
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<{ name: string, price: number } | null>(null);

  useEffect(() => {
    let initialVariant = null;
    if (item.variations && item.variations.length > 0) {
      initialVariant = item.variations[0];
    } else if (item.variants && item.variants.length > 0) {
      initialVariant = item.variants[0];
    }

    setSelectedVariant(initialVariant);
  }, [item]);

  // 3. Helper: Calculate discounted price
  const getDiscountedPrice = useCallback(() => {
    const now = new Date();
    let priceToUse = selectedVariant ? parseFloat(selectedVariant.price.toString()) : parseFloat(item.price.toString());

    const itemAny = item as any;

    // 1. Check Item Discount
    if (itemAny.discountedPrice || itemAny.discountPercentage) {
      const start = itemAny.discountStartDate ? new Date(itemAny.discountStartDate) : null;
      const end = itemAny.discountEndDate ? new Date(itemAny.discountEndDate) : null;

      if ((!start || now >= start) && (!end || now <= end)) {
        // Percentage applies to everything
        if (itemAny.discountPercentage) {
          return priceToUse * (1 - itemAny.discountPercentage / 100);
        }

        // Fixed price: Only apply if no variant selected, or if selected variant price equals base item price
        // (Assuming fixed price is meant for the standard portion)
        if (itemAny.discountedPrice) {
          // Check if selectedVariant is null OR if its price is approximately equal to the item's base price
          // This handles cases where the default variant might have the same price as the item's base price.
          if (!selectedVariant || Math.abs(parseFloat(selectedVariant.price.toString()) - parseFloat(item.price.toString())) < 0.01) {
            return parseFloat(itemAny.discountedPrice.toString());
          }
          // If a different variant is selected (e.g., "Large" with a different price),
          // the fixed base item discount does not apply to this variant.
          // We proceed to check category discounts or return the variant's original price.
        }
      }
    }

    // 2. Check Category Discount (only if no item-level fixed price discount was applied, or if item percentage discount was not present)
    // If an item percentage discount was applied, it would have returned already.
    // If an item fixed price discount was applied, it would have returned already (if applicable to variant).
    // So, if we reach here, either no item discount applied, or item fixed discount didn't apply to the current variant.
    const category = categories.find((c: any) => c.id === item.categoryId) as any;

    if (category?.discountPercentage) {
      const start = category.discountStartDate ? new Date(category.discountStartDate) : null;
      const end = category.discountEndDate ? new Date(category.discountEndDate) : null;

      if ((!start || now >= start) && (!end || now <= end)) {
        return priceToUse * (1 - category.discountPercentage / 100);
      }
    }

    return priceToUse;
  }, [item, selectedVariant, categories]);

  // 4. Update currentPrice to use getDiscountedPrice
  const currentPrice = getDiscountedPrice();

  const handleAddToCart = useCallback(() => {
    // Resolve image URL
    let imageUrl = item.image;
    const finalImage = item.imageUrl || item.image;

    if (finalImage) {
      if (finalImage.startsWith('http')) {
        imageUrl = finalImage;
      } else if (finalImage.startsWith('/uploads/')) {
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api').replace('/api', '');
        imageUrl = `${baseUrl}${finalImage}`;
      } else {
        // Standard relative path (e.g. /images/...) - assume it needs backend base URL if not http
        // But wait, existing logic says: `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}` for standard cases in MenuPage
        // logic in Modal render: `${baseUrl}${finalImage}` ... wait, the Modal render logic seems to prefer baseUrl for everything relative?
        // Let's look at lines 96-102:
        // if http -> use as is.
        // else -> baseUrl + finalImage.
        // baseUrl is constructed by removing /api from API_URL.

        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api').replace('/api', '');
        imageUrl = `${baseUrl}${finalImage}`;
      }
    }

    addItem({
      itemId: item.id,
      name: typeof item.name === 'string' ? { en: item.name, tr: item.name } : item.name,
      price: currentPrice,
      variant: selectedVariant || undefined,
      quantity,
      image: imageUrl,
      notes: notes.trim() || undefined
    });
    onClose();
  }, [addItem, item, quantity, notes, onClose, currentPrice, selectedVariant]);

  if (!isOpen) return null;

  // Helper function to get correct localized text
  const language = currentLanguage === 'Turkish' ? 'tr' : (currentLanguage === 'German' ? 'de' : (currentLanguage === 'Chinese' ? 'zh' : (currentLanguage === 'English' ? 'en' : 'en')));

  const getName = () => {
    if (item.translations?.[language]?.name) return item.translations[language].name;
    return typeof item.name === 'string' ? item.name : (item.name?.tr || '');
  };

  const getDescription = () => {
    if (item.translations?.[language]?.description) return item.translations[language].description;
    return typeof item.description === 'string' ? item.description : (item.description?.tr || '');
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative shadow-2xl animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Overlay */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md text-gray-800 hover:text-gray-900 p-2 rounded-full shadow-lg transition-all active:scale-95"
          aria-label="Kapat"
        >
          <div className="hover:rotate-90 transition-transform duration-300">
            <FaTimes size={18} />
          </div>
        </button>

        {/* Hero Image Section */}
        <div
          className="relative h-64 sm:h-72 w-full cursor-pointer overflow-hidden group"
          onClick={() => {
            const finalImage = item.imageUrl || item.image;
            if (finalImage) {
              const url = finalImage.startsWith('http') ? finalImage : `${(process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api').replace('/api', '')}${finalImage}`;
              window.open(url, '_blank');
            }
          }}
        >
          {(() => {
            const finalImage = item.imageUrl || item.image;
            const src = finalImage ?
              (finalImage.startsWith('http') ?
                `${finalImage}${finalImage.includes('?') ? '&' : '?'}v=${imageCacheVersion || Date.now()}` :
                (() => {
                  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api').replace('/api', '');
                  return `${baseUrl}${finalImage}${finalImage.includes('?') ? '&' : '?'}v=${imageCacheVersion || Date.now()}`;
                })())
              : '/placeholder-food.jpg';

            return (
              <img
                src={src}
                alt={getName()}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-food.jpg';
                }}
              />
            );
          })()}

          {/* Image Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {item.popular && (
            <div className="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-md backdrop-blur-md z-10" style={{ backgroundColor: 'rgba(211, 84, 0, 0.9)', color: '#fff' }}>
              <FaStar className="mr-1 scale-110" size={10} />
              Popüler
            </div>
          )}

          <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-2 gap-4">
            <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">{getName()}</h2>
            <div className="text-2xl font-black whitespace-nowrap" style={{ color: 'var(--brand-strong)' }}>
              {currentPrice % 1 === 0 ? currentPrice : currentPrice.toFixed(2)} ₺
            </div>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-4">{getDescription() || (currentLanguage === 'Turkish' ? 'Bu ürün için henüz açıklama bulunmuyor.' : 'No description available for this item.')}</p>

          {/* Options Section */}
          {item.options && item.options.length > 0 && (
            <div className="mb-6 space-y-4">
              {item.options.map((opt: any, idx: number) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 ml-1">{opt.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val: string, vIdx: number) => (
                      <label key={vIdx} className="group relative flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          onChange={(e) => {
                            setNotes(prev => {
                              if (e.target.checked) return prev ? `${prev}, ${val}` : val;
                              // Match exactly 'val', possibly surrounded by ', '
                              const regex = new RegExp(`(^|,\\s*)${val}($|,\\s*)`);
                              return prev.replace(regex, (match, p1, p2) => {
                                // If it was middle of list, keep one comma
                                if (p1 && p2) return ', ';
                                return '';
                              }).trim();
                            })
                          }}
                        />
                        <div className="px-4 py-2 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-medium text-gray-700 transition-all peer-checked:bg-[var(--brand-surface)] peer-checked:border-[var(--brand-strong)] peer-checked:text-[var(--brand-strong)] peer-checked:font-bold hover:bg-gray-100">
                          {val}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Allergens Section */}
          {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 ml-1">Alerjenler</h3>
              <div className="flex flex-wrap gap-2">
                {item.allergens.map((allergen: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {typeof allergen === 'string' ? allergen : (allergen?.[language] || allergen?.tr || allergen?.en || '')}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="h-[1px] bg-gray-100 w-full mb-6" />

          {/* Variations Section */}
          {((item.variations && item.variations.length > 0) || (item.variants && item.variants.length > 0)) && (
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Varyasyonlar</h3>
              <div className="grid grid-cols-1 gap-2.5">
                {(item.variations || item.variants || []).map((v: any, i: number) => (
                  <label
                    key={i}
                    className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedVariant?.name === v.name
                      ? 'border-[var(--brand-strong)] bg-[var(--brand-surface)] scale-[1.02]'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${selectedVariant?.name === v.name
                        ? 'border-[var(--brand-strong)]'
                        : 'border-gray-300'
                        }`}>
                        {selectedVariant?.name === v.name && (
                          <div className="w-2.5 h-2.5 rounded-full animate-in fade-in zoom-in" style={{ backgroundColor: 'var(--brand-strong)' }} />
                        )}
                      </div>
                      <span className={`text-sm ${selectedVariant?.name === v.name ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{v.name}</span>
                    </div>
                    <span className={`text-sm font-bold ${selectedVariant?.name === v.name ? 'text-[var(--brand-strong)]' : 'text-gray-900'}`}>{v.price} ₺</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
              <span className="text-sm font-bold text-gray-700">Adet</span>
              <div className="flex items-center space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors active:scale-90"
                >
                  <FaMinus size={12} />
                </button>
                <span className="text-lg font-bold w-10 text-center text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors active:scale-90"
                >
                  <FaPlus size={12} />
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 ml-1">
                Özel Notlar
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Özel istekleriniz var mı? (Örn: Acısız olsun)"
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[var(--brand-strong)] focus:bg-white rounded-2xl resize-none transition-all outline-none text-sm min-h-[100px]"
              />
            </div>

            {/* Sticky/Bottom Total and Button */}
            <div className="pt-4 space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-gray-500 font-medium">Toplam</span>
                <span className="text-2xl font-black text-gray-900">
                  {(currentPrice * quantity).toFixed(2)} ₺
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full btn-gradient font-bold py-4 rounded-2xl shadow-xl shadow-brand/20 flex items-center justify-center gap-2 text-lg active:scale-[0.98]"
              >
                <span>Sepete Ekle</span>
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span>{(currentPrice * quantity).toFixed(2)} ₺</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
