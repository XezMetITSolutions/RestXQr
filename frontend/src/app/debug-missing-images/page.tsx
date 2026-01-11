'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaDownload, FaExternalLinkAlt, FaImage, FaSpinner, FaCheckCircle, FaTimesCircle, FaSync, FaCloudDownloadAlt } from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import apiService from '@/services/api';

export default function DebugMissingImages() {
  const { authenticatedRestaurant } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [missingImages, setMissingImages] = useState<any[]>([]);
  const [foundImages, setFoundImages] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [restoreProgress, setRestoreProgress] = useState<{ [key: string]: number }>({});

  const fetchMissingImages = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      const restaurantId = authenticatedRestaurant?.id;
      const url = restaurantId 
        ? `${apiUrl}/debug/missing-images?restaurantId=${restaurantId}`
        : `${apiUrl}/debug/missing-images`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setMissingImages(data.data.missingImages || []);
        setFoundImages(data.data.foundImages || []);
        setTotal(data.data.total || 0);
      } else {
        alert('Hata: ' + (data.message || 'Bilinmeyen hata'));
      }
    } catch (error: any) {
      console.error('Kayıp resim arama hatası:', error);
      alert('Hata: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissingImages();
  }, [authenticatedRestaurant?.id]);

  const restoreImageFromUnsplash = async (item: any) => {
    if (!authenticatedRestaurant) {
      alert('Önce giriş yapmalısınız');
      return;
    }

    setRestoring(item.itemId);
    setRestoreProgress({ ...restoreProgress, [item.itemId]: 0 });

    try {
      // Ürün adına göre Unsplash'tan resim ara
      const searchTerm = item.name.toLowerCase();
      const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=1&client_id=YOUR_UNSPLASH_ACCESS_KEY`;
      
      // Not: Unsplash API key gerekiyor, bu yüzden alternatif olarak placeholder veya başka bir yöntem kullanabiliriz
      // Şimdilik kullanıcıya manuel olarak resim yükleme seçeneği sunalım
      
      alert(`"${item.name}" için resim geri getirme özelliği yakında eklenecek.\n\nŞimdilik:\n1. /business/menu sayfasına gidin\n2. Ürünü düzenleyin\n3. Yeni resim yükleyin`);
      
    } catch (error: any) {
      console.error('Resim geri getirme hatası:', error);
      alert('Hata: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setRestoring(null);
      setRestoreProgress({ ...restoreProgress, [item.itemId]: 100 });
    }
  };

  const restoreImageFromPlaceholder = async (item: any) => {
    if (!authenticatedRestaurant) {
      alert('Önce giriş yapmalısınız');
      return;
    }

    setRestoring(item.itemId);
    
    try {
      // Placeholder resim URL'i
      const placeholderUrl = '/placeholder-food.jpg';
      
      // Menu item'ı güncelle
      const response = await apiService.updateMenuItem(
        authenticatedRestaurant.id,
        item.itemId,
        { imageUrl: placeholderUrl }
      );

      if (response.success) {
        alert(`"${item.name}" için placeholder resim ayarlandı.`);
        // Listeyi yenile
        await fetchMissingImages();
      } else {
        alert('Hata: ' + (response.message || 'Güncelleme başarısız'));
      }
    } catch (error: any) {
      console.error('Placeholder ayarlama hatası:', error);
      alert('Hata: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setRestoring(null);
    }
  };

  const openMenuItemEditor = (item: any) => {
    if (!authenticatedRestaurant) {
      alert('Önce giriş yapmalısınız');
      return;
    }
    
    // Menu düzenleme sayfasına yönlendir
    window.open(`/business/menu?edit=${item.itemId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🔍 Kayıp Resimleri Bul ve Geri Getir
              </h1>
              <p className="text-gray-600">
                Database'de kayıtlı ama backend'de fiziksel olarak bulunmayan resimleri tespit edin ve geri getirin.
              </p>
            </div>
            <button
              onClick={fetchMissingImages}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSync />}
              {loading ? 'Aranıyor...' : 'Yenile'}
            </button>
          </div>

          {authenticatedRestaurant && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Restoran:</strong> {authenticatedRestaurant.name} ({authenticatedRestaurant.username})
              </p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Kayıp resimler aranıyor...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <FaImage className="text-3xl text-gray-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{total}</p>
                      <p className="text-sm text-gray-600">Toplam Ürün</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-3xl text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-800">{foundImages.length}</p>
                      <p className="text-sm text-green-600">Resim Bulundu</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center gap-3">
                    <FaTimesCircle className="text-3xl text-red-600" />
                    <div>
                      <p className="text-2xl font-bold text-red-800">{missingImages.length}</p>
                      <p className="text-sm text-red-600">Kayıp Resim</p>
                    </div>
                  </div>
                </div>
              </div>

              {missingImages.length > 0 ? (
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    ❌ Kayıp Resimler ({missingImages.length})
                  </h2>
                  <div className="space-y-3">
                    {missingImages.map((item, index) => (
                      <div key={item.itemId || index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-red-900 text-lg mb-2">{item.name}</h3>
                            <div className="space-y-1 text-sm">
                              <p className="text-red-700">
                                <strong>Ürün ID:</strong> {item.itemId}
                              </p>
                              <p className="text-red-700">
                                <strong>Kayıp URL:</strong> <span className="break-all font-mono text-xs">{item.imageUrl || 'Yok'}</span>
                              </p>
                              {item.fileName && (
                                <p className="text-red-700">
                                  <strong>Dosya Adı:</strong> {item.fileName}
                                </p>
                              )}
                              <p className="text-red-700">
                                <strong>Sebep:</strong> {item.reason}
                              </p>
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col gap-2">
                            <button
                              onClick={() => openMenuItemEditor(item)}
                              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                            >
                              <FaExternalLinkAlt /> Düzenle
                            </button>
                            <button
                              onClick={() => restoreImageFromPlaceholder(item)}
                              disabled={restoring === item.itemId}
                              className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                              {restoring === item.itemId ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaImage />
                              )}
                              Placeholder
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <FaCheckCircle className="text-4xl text-green-600 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-green-800 mb-2">Tüm resimler bulundu!</p>
                  <p className="text-green-600">Kayıp resim yok.</p>
                </div>
              )}

              {foundImages.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    ✅ Bulunan Resimler (İlk 10)
                  </h2>
                  <div className="space-y-2">
                    {foundImages.map((item, index) => (
                      <div key={item.itemId || index} className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-900">{item.name}</p>
                          <p className="text-xs text-green-700 break-all">{item.imageUrl}</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {item.status === 'external' ? 'External URL' : 'Bulundu'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
