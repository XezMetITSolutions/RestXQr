'use client';

import { useState } from 'react';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import ImageUpload from './ImageUpload';

interface CategoryFormProps {
  formData: any;
  setFormData: (data: any) => void;
  isEditing?: boolean;
}

export default function CategoryForm({
  formData,
  setFormData,
  isEditing = false
}: CategoryFormProps) {
  const [newSubcategory, setNewSubcategory] = useState('');

  const addSubcategory = () => {
    if (newSubcategory.trim()) {
      const subcategory = {
        id: `sub_${Date.now()}`,
        name: newSubcategory,
        parentId: formData.id || 'temp'
      };
      
      setFormData({
        ...formData,
        subcategories: [...(formData.subcategories || []), subcategory]
      });
      setNewSubcategory('');
    }
  };

  const removeSubcategory = (index: number) => {
    setFormData({
      ...formData,
      subcategories: formData.subcategories.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* Temel Bilgiler */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Temel Bilgiler</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori Adı *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({
                ...formData,
                name: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({
                ...formData,
                description: e.target.value
              })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Görsel Yönetimi */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Görsel Yönetimi</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori Görseli
          </label>
          <ImageUpload
            currentImage={formData.image || ''}
            onImageSelect={(file, preview) => setFormData({
              ...formData,
              image: preview
            })}
            className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Alt Kategoriler */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Alt Kategoriler</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubcategory}
              onChange={(e) => setNewSubcategory(e.target.value)}
              placeholder="Alt kategori adı"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addSubcategory()}
            />
            <button
              onClick={addSubcategory}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <FaPlus />
              Alt Kategori Ekle
            </button>
          </div>

          <div className="space-y-2">
            {formData.subcategories?.map((subcategory: any, index: number) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                <div className="flex-1">
                  <div className="font-medium">{subcategory.name}</div>
                </div>
                <button
                  onClick={() => removeSubcategory(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sıralama ve Durum */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Sıralama ve Durum</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sıralama
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({
                ...formData,
                order: parseInt(e.target.value) || 0
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Düşük sayılar önce görünür
            </p>
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({
                  ...formData,
                  isActive: e.target.checked
                })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Aktif Kategori</span>
            </label>
          </div>
        </div>
      </div>

      {/* İstatistikler (sadece düzenleme modunda) */}
      {isEditing && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">İstatistikler</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formData.itemCount || 0}
              </div>
              <div className="text-sm text-gray-600">Toplam Ürün</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formData.activeItemCount || 0}
              </div>
              <div className="text-sm text-gray-600">Aktif Ürün</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formData.subcategories?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Alt Kategori</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
