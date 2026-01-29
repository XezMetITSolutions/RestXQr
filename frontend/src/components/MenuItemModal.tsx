'use client';

import { useState, useCallback, useEffect } from 'react';
import { FaTimes, FaPlus, FaMinus, FaStar } from 'react-icons/fa';
import { useCartStore } from '@/store';
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
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<{ name: string, price: number } | null>(null);

  useEffect(() => {
    if (item.variations?.length > 0) {
      setSelectedVariant(item.variations[0]);
    } else if (item.variants?.length > 0) {
      setSelectedVariant(item.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [item]);

  const currentPrice = selectedVariant ? selectedVariant.price : item.price;

  const handleAddToCart = useCallback(() => {
    addItem({
      itemId: item.id,
      name: typeof item.name === 'string' ? { en: item.name, tr: item.name } : item.name,
      price: currentPrice,
      variant: selectedVariant || undefined,
      quantity,
      image: item.image,
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
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--brand-subtle)' }}>
          <h2 className="text-lg font-semibold">{getName()}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Image */}
        <div
          className="relative h-48 w-full cursor-pointer"
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
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-food.jpg';
                }}
              />
            );
          })()}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center">
            <div className="bg-white bg-opacity-80 rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
          {item.popular && (
            <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full flex items-center" style={{ backgroundColor: 'var(--brand-strong)', color: 'var(--on-primary)' }}>
              <FaStar className="mr-1" size={10} />
              Popüler
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-600 mb-4">{getDescription()}</p>

          <div className="text-2xl font-bold mb-4" style={{ color: 'var(--brand-strong)' }}>
            {currentPrice} ₺
          </div>

          {/* Variations (was Variants) */}
          {(item.variations?.length > 0 || item.variants?.length > 0) && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Varyasyonlar</h3>
              <div className="flex flex-col gap-2">
                {(item.variations || item.variants).map((v: any, i: number) => (
                  <label
                    key={i}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${selectedVariant?.name === v.name
                      ? 'border-[var(--brand-strong)] bg-opacity-5'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                    style={{
                      backgroundColor: selectedVariant?.name === v.name ? 'rgba(211, 84, 0, 0.05)' : 'transparent'
                    }}
                    onClick={() => setSelectedVariant(v)}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${selectedVariant?.name === v.name
                        ? 'border-[var(--brand-strong)]'
                        : 'border-gray-400'
                        }`}>
                        {selectedVariant?.name === v.name && (
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--brand-strong)' }} />
                        )}
                      </div>
                      <span className={selectedVariant?.name === v.name ? 'font-medium' : ''}>{v.name}</span>
                    </div>
                    <span className="font-semibold">{v.price} ₺</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          {item.options && item.options.length > 0 && (
            <div className="mb-4">
              {item.options.map((opt: any, idx: number) => (
                <div key={idx} className="mb-3">
                  <h3 className="font-semibold mb-2">{opt.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val: string, vIdx: number) => (
                      <label key={vIdx} className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-100">
                        <input
                          type="checkbox"
                          name={`option-${idx}`}
                          value={val}
                          className="rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                          onChange={(e) => {
                            // Handle option selection logic (simple array append for now? or single select?)
                            // Since we don't have advanced validation, let's just create a note string.
                            setNotes(prev => {
                              if (e.target.checked) return prev ? `${prev}, ${val}` : val;
                              return prev.replace(new RegExp(`(, )?${val}(, )?`), '').trim(); // simplistic remove
                            })
                          }}
                        />
                        <span className="text-sm">{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Allergens */}
          {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Alerjenler</h3>
              <div className="flex flex-wrap gap-1">
                {item.allergens.map((allergen, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--tone2-bg)', color: 'var(--tone2-text)', border: '1px solid var(--tone2-border)' }}
                  >
                    {typeof allergen === 'string' ? allergen : (allergen?.tr || '')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">Adet</label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="rounded-full p-2"
                style={{ backgroundColor: 'var(--brand-surface)' }}
              >
                <FaMinus size={12} />
              </button>
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="rounded-full p-2"
                style={{ backgroundColor: 'var(--brand-surface)' }}
              >
                <FaPlus size={12} />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Özel Notlar</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Özel istekleriniz var mı?"
              className="w-full p-3 border rounded-lg resize-none"
              rows={3}
            />
          </div>

          {/* Total */}
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">Toplam</span>
            <span className="text-xl font-bold" style={{ color: 'var(--brand-strong)' }}>
              {(currentPrice * quantity).toFixed(2)} ₺
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full btn btn-primary font-semibold py-3 rounded-lg"
          >
            Sepete Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
