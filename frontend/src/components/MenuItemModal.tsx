'use client';

import { useState, useCallback } from 'react';
import { FaTimes, FaPlus, FaMinus, FaStar } from 'react-icons/fa';
import { useCartStore } from '@/store';
import { MenuItem } from '@/store/useMenuStore';

interface MenuItemModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuItemModal({ item, isOpen, onClose }: MenuItemModalProps) {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const handleAddToCart = useCallback(() => {
    addItem({
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      image: item.image,
      notes: notes.trim() || undefined
    });
    onClose();
  }, [addItem, item, quantity, notes, onClose]);

  if (!isOpen) return null;

  // Helper function to get Turkish text
  const getName = () => typeof item.name === 'string' ? item.name : (item.name?.tr || '');
  const getDescription = () => typeof item.description === 'string' ? item.description : (item.description?.tr || '');

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
        <div className="relative h-48 w-full cursor-pointer" onClick={() => window.open(item.image, '_blank')}>
          <img
            src={item.image}
            alt={getName()}
            className="w-full h-full object-cover hover:opacity-90 transition-opacity"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-food.jpg';
            }}
          />
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
            {item.price} ₺
          </div>

          {/* Allergens */}
          {item.allergens && item.allergens.length > 0 && (
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
              {(item.price * quantity).toFixed(2)} ₺
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
