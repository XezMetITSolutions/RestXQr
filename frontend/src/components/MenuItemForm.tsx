'use client';

import { useMemo, useState } from 'react';
import { FaPlus, FaTrash, FaTimes, FaVideo, FaLock, FaGlobe, FaMagic } from 'react-icons/fa';
import ImageUpload from './ImageUpload';
import { useFeature } from '@/hooks/useFeature';
import { translateWithDeepL } from '@/lib/deepl';

interface MenuItemFormProps {
  formData: any;
  setFormData: (data: any) => void;
  categories: any[];
  subcategories: any[];
  getSubcategoriesByParent: (parentId: string) => any[];
  languages: string[];
}

export default function MenuItemForm({
  formData,
  setFormData,
  categories,
  subcategories,
  getSubcategoriesByParent,
  languages
}: MenuItemFormProps) {
  const [newIngredient, setNewIngredient] = useState('');
  const [newAllergen, setNewAllergen] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const hasVideoMenu = useFeature('video_menu');
  const activeLanguages = useMemo(() => (languages?.length ? languages : ['tr']), [languages]);
  console.log('📝 MenuItemForm Rendered', {
    formDataAllergens: formData.allergens,
    isArray: Array.isArray(formData.allergens),
    formDataIngredients: formData.ingredients
  });

  const translationLanguages = useMemo(
    () => activeLanguages.filter((lang) => lang !== 'tr'),
    [activeLanguages]
  );

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setFormData({
        ...formData,
        ingredients: [...(formData.ingredients || []), newIngredient.trim()]
      });
      setNewIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_: any, i: number) => i !== index)
    });
  };

  const addAllergen = () => {
    if (newAllergen.trim()) {
      setFormData({
        ...formData,
        allergens: [...(formData.allergens || []), newAllergen.trim()]
      });
      setNewAllergen('');
    }
  };

  const removeAllergen = (index: number) => {
    setFormData({
      ...formData,
      allergens: formData.allergens.filter((_: any, i: number) => i !== index)
    });
  };

  const ensureTranslationBucket = (lang: string) => {
    return formData.translations?.[lang] || {};
  };

  const handleAutoTranslate = async () => {
    if (!formData.name && !formData.description) {
      setTranslationError('Çevirmek için önce ürün adı veya açıklama girin.');
      return;
    }
    if (!translationLanguages.length) return;
    setTranslationError(null);
    setIsTranslating(true);
    const updatedTranslations = { ...(formData.translations || {}) };
    try {
      for (const lang of translationLanguages) {
        if (formData.name) {
          const translatedName = await translateWithDeepL({
            text: formData.name,
            targetLanguage: lang
          });
          updatedTranslations[lang] = {
            ...ensureTranslationBucket(lang),
            name: translatedName
          };
        }
        if (formData.description) {
          const translatedDesc = await translateWithDeepL({
            text: formData.description,
            targetLanguage: lang
          });
          updatedTranslations[lang] = {
            ...ensureTranslationBucket(lang),
            description: translatedDesc
          };
        }
      }
      setFormData({
        ...formData,
        translations: updatedTranslations
      });
    } catch (error) {
      console.error('Translation error:', error);
      setTranslationError('Çeviri sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslationChange = (lang: string, field: 'name' | 'description', value: string) => {
    setFormData({
      ...formData,
      translations: {
        ...(formData.translations || {}),
        [lang]: {
          ...ensureTranslationBucket(lang),
          [field]: value
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Temel Bilgiler */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Temel Bilgiler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ürün Adı *
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

          <div className="md:col-span-2">
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

          {translationLanguages.length > 0 && (
            <div className="md:col-span-2">
              <div className="bg-white border rounded-lg p-4 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <FaGlobe className="text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-800">Çeviriler</p>
                      <p className="text-xs text-gray-500">
                        Seçili diller için ürün adını ve açıklamasını düzenleyin.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoTranslate}
                    disabled={isTranslating}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-60"
                  >
                    <FaMagic />
                    {isTranslating ? 'Çevriliyor...' : 'Otomatik Çevir'}
                  </button>
                </div>
                {translationError && (
                  <p className="text-xs text-red-600">{translationError}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {translationLanguages.map((lang) => (
                    <div key={lang} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Ürün Adı ({lang.toUpperCase()})
                        </label>
                        <input
                          type="text"
                          value={formData.translations?.[lang]?.name || ''}
                          onChange={(e) => handleTranslationChange(lang, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Açıklama ({lang.toUpperCase()})
                        </label>
                        <textarea
                          rows={2}
                          value={formData.translations?.[lang]?.description || ''}
                          onChange={(e) => handleTranslationChange(lang, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fiyat (₺) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({
                ...formData,
                price: parseFloat(e.target.value) || 0
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({
                ...formData,
                category: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">Kategori Seçin</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Görsel Yönetimi */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Görsel Yönetimi</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ana Görsel
            </label>
            <ImageUpload
              currentImage={formData.image}
              onImageSelect={(file, preview) => setFormData({
                ...formData,
                image: preview
              })}
              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ek Görseller
            </label>
            <div className="space-y-2">
              {formData.images?.map((image: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <img src={image} alt={`Görsel ${index + 1}`} className="w-16 h-16 object-cover rounded" />
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => {
                      const newImages = [...formData.images];
                      newImages[index] = e.target.value;
                      setFormData({ ...formData, images: newImages });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => {
                      const newImages = formData.images.filter((_: any, i: number) => i !== index);
                      setFormData({ ...formData, images: newImages });
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setFormData({
                  ...formData,
                  images: [...(formData.images || []), '']
                })}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 flex items-center justify-center gap-2"
              >
                <FaPlus />
                Yeni Görsel Ekle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Yönetimi */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FaVideo className="text-purple-600" />
            Video Menü
          </h3>
          {!hasVideoMenu && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center gap-1">
              <FaLock className="text-xs" />
              Premium Özellik
            </span>
          )}
        </div>

        {hasVideoMenu ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="url"
                value={formData.videoUrl || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  videoUrl: e.target.value
                })}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">YouTube, Vimeo veya doğrudan video linki</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Önizleme Resmi
              </label>
              <input
                type="url"
                value={formData.videoThumbnail || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  videoThumbnail: e.target.value
                })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Süresi
              </label>
              <input
                type="text"
                value={formData.videoDuration || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  videoDuration: e.target.value
                })}
                placeholder="0:45"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Örnek: 0:45, 1:30, 2:15</p>
            </div>

            {formData.videoUrl && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <FaVideo />
                  Video eklendi - Müşteriler ürününüzü video ile görebilecek
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-dashed border-purple-200">
            <FaVideo className="text-4xl text-purple-300 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Video Menü Özelliği</h4>
            <p className="text-sm text-gray-600 mb-4">
              Ürünlerinize video ekleyerek müşterilerinize daha iyi bir deneyim sunun.
              Yemeklerin hazırlanışını, sunumunu ve detaylarını videolarla gösterin.
            </p>
            <button
              type="button"
              onClick={() => window.open('/business/settings', '_blank')}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md flex items-center gap-2 mx-auto"
            >
              <FaLock />
              Premium'a Yükselt
            </button>
          </div>
        )}
      </div>

      {/* Beslenme Bilgileri */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Beslenme Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kalori
            </label>
            <input
              type="number"
              value={formData.calories || ''}
              onChange={(e) => setFormData({
                ...formData,
                calories: parseInt(e.target.value) || 0
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hazırlık Süresi (dakika)
            </label>
            <input
              type="number"
              value={formData.preparationTime || ''}
              onChange={(e) => setFormData({
                ...formData,
                preparationTime: parseInt(e.target.value) || 0
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Malzemeler */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Malzemeler</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              placeholder="Malzeme adı girin"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
            />
            <button
              onClick={addIngredient}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <FaPlus />
              Ekle
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.ingredients?.map((ingredient: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {ingredient}
                <button
                  onClick={() => removeIngredient(index)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <FaTimes size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Alerjenler */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Alerjenler</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newAllergen}
              onChange={(e) => setNewAllergen(e.target.value)}
              placeholder="Alerjen adı girin"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addAllergen()}
            />
            <button
              onClick={addAllergen}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <FaPlus />
              Ekle
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {Array.isArray(formData.allergens) && formData.allergens.map((allergen: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {allergen}
                <button
                  onClick={() => removeAllergen(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTimes size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Servis Bilgileri */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Servis Bilgileri</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Servis Bilgisi
          </label>
          <input
            type="text"
            value={formData.servingInfo || ''}
            onChange={(e) => setFormData({
              ...formData,
              servingInfo: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Örn: 1 kişilik, 250g"
          />
        </div>
      </div>

      {/* Durum Ayarları */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Durum Ayarları</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.popular}
                onChange={(e) => setFormData({
                  ...formData,
                  popular: e.target.checked
                })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Popüler Ürün</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({
                  ...formData,
                  isAvailable: e.target.checked
                })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Mevcut</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
