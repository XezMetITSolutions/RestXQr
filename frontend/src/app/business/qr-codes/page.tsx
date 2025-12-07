'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaQrcode,
  FaPlus,
  FaTrash,
  FaCopy,
  FaDownload,
  FaPrint,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaEye
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import { useQRStore, type QRCodeData } from '@/store/useQRStore';
import BusinessSidebar from '@/components/BusinessSidebar';
import apiService from '@/services/api';
import TranslatedText, { staticDictionary } from '@/components/TranslatedText';
import { useLanguage } from '@/context/LanguageContext';

export default function QRCodesPage() {
  const router = useRouter();
  const { translate: t, currentLanguage } = useLanguage();
  const { authenticatedRestaurant, isAuthenticated, logout, initializeAuth } = useAuthStore();
  const { qrCodes, setQRCodes, clearQRCodes } = useQRStore();

  const getStatic = (text: string) => {
    const langCode = currentLanguage === 'German' ? 'de' :
      (currentLanguage === 'English' ? 'en' :
        (currentLanguage === 'Turkish' ? 'tr' :
          (currentLanguage === 'Arabic' ? 'ar' :
            (currentLanguage === 'Russian' ? 'ru' :
              (currentLanguage === 'French' ? 'fr' :
                (currentLanguage === 'Spanish' ? 'es' :
                  (currentLanguage === 'Italian' ? 'it' : 'en')))))));

    if (staticDictionary[text] && staticDictionary[text][langCode]) {
      return staticDictionary[text][langCode];
    }
    return text;
  };

  // States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tableCount, setTableCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/isletme-giris');
      return;
    }
  }, [isAuthenticated, router]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper: reload from backend and persist to store
  const reloadQRCodes = async () => {
    try {
      if (!authenticatedRestaurant?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const res = await apiService.getRestaurantQRTokens(authenticatedRestaurant.id);
      console.log('Backend QR response:', res);

      if (res?.success && Array.isArray(res.data)) {
        const mapped: QRCodeData[] = res.data.map((t: any) => {
          // QR kod URL'i oluştur (backend'den gelen veya kendi oluşturduğumuz)
          const restaurantSlug = authenticatedRestaurant.username || 'aksaray';
          const backendQrUrl = t.qrUrl || `https://${restaurantSlug}.restxqr.com/menu/?t=${t.token}&table=${t.tableNumber}`;

          // QR kod resmi için URL'yi QR code generator API'ye gönder
          // QuickChart API kullanarak QR kod resmi oluştur
          const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(backendQrUrl)}`;

          console.log('QR Code generated:', {
            tableNumber: t.tableNumber,
            qrUrl: backendQrUrl,
            qrImageUrl,
            token: t.token
          });

          return {
            id: t.id,
            name: `Masa ${t.tableNumber} - QR Menü`,
            tableNumber: t.tableNumber,
            token: t.token,
            qrCode: qrImageUrl, // Her zaman QR kod resmi URL'i kullan
            url: backendQrUrl, // Menü URL'i
            createdAt: t.createdAt || new Date().toISOString(),
            theme: 'default',
            isActive: t.isActive !== false,
            scanCount: t.scanCount || 0,
            description: `Masa ${t.tableNumber} için QR kod`,
            type: 'table' as const,
            restaurantId: authenticatedRestaurant.id
          };
        });

        console.log('Mapped QR codes:', mapped);
        setQRCodes(mapped);
      } else {
        // Backend'de QR kod yoksa store'u temizle
        if (res?.success) {
          clearQRCodes();
        }
      }
    } catch (e) {
      console.error('Load QR tokens error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Load existing QR codes from backend on mount/login
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const loadWithRetry = async () => {
      // Wait for auth to initialize
      if (!authenticatedRestaurant?.id && retryCount < maxRetries) {
        retryCount++;
        setTimeout(() => {
          if (mounted) {
            const state = useAuthStore.getState();
            if (state.authenticatedRestaurant?.id) {
              reloadQRCodes();
            } else if (retryCount < maxRetries) {
              loadWithRetry();
            } else {
              setLoading(false);
            }
          }
        }, 500 * retryCount); // Exponential backoff
        return;
      }

      if (authenticatedRestaurant?.id && mounted) {
        await reloadQRCodes();
      } else {
        setLoading(false);
      }
    };

    loadWithRetry();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedRestaurant?.id]);

  // Toplu QR kod oluşturma - Sabit QR kodları (basılabilir)
  const handleCreateBulkQRCodes = async () => {
    if (!authenticatedRestaurant) {
      showToast(getStatic('Restoran bilgisi bulunamadı!'), 'error');
      return;
    }

    try {
      setCreating(true);
      const tokens: string[] = [];

      // Her masa için token oluştur
      for (let i = 1; i <= tableCount; i++) {
        try {
          const response = await apiService.generateQRToken({
            restaurantId: authenticatedRestaurant.id,
            tableNumber: i,
            duration: 24 // 24 saat geçerli
          });
          if (response.success && response.data?.token) {
            tokens.push(response.data.token);
          } else {
            throw new Error(getStatic('Token oluşturulamadı'));
          }
        } catch (error) {
          console.error('Token oluşturma hatası:', error);
          showToast(getStatic('Token oluşturulurken hata oluştu'), 'error');
          setCreating(false);
          return;
        }
      }

      // Backend'den QR kodları yeniden yükle (backend'de kaydedildi)
      await reloadQRCodes();
      setShowCreateModal(false);

      showToast(`${tableCount} ${getStatic('adet QR kod başarıyla oluşturuldu!')}`, 'success');
    } catch (error) {
      console.error('QR kod oluşturma hatası:', error);
      showToast(getStatic('QR kod oluşturulurken hata oluştu'), 'error');
    } finally {
      setCreating(false);
    }
  };

  // QR kod silme (backend deactivate + listeyi yenile)
  const handleDeleteQRCode = async (id: string, token?: string) => {
    try {
      if (token) {
        await apiService.deactivateQRToken(token);
      }
    } catch (e) {
      console.error('Deactivate QR error:', e);
    }
    await reloadQRCodes();
    showToast(getStatic('QR kod silindi.'), 'success');
  };

  // URL kopyalama - backend'in ürettiği qrUrl varsa onu kullan
  const handleCopyURL = (fallbackUrl: string, tableNumber?: number) => {
    try {
      const sub = authenticatedRestaurant?.username || 'aksaray';
      const base = `https://${sub}.restxqr.com`;
      // fallbackUrl öncelik, yoksa subdomain + table paramı ile kur
      const url = fallbackUrl || `${base}/menu/?table=${tableNumber || ''}`;
      navigator.clipboard.writeText(url);
      showToast(getStatic('URL kopyalandı!'), 'success');
    } catch {
      showToast(getStatic('URL kopyalanamadı'), 'error');
    }
  };

  // QR kod indirme
  const handleDownloadQR = (qrCode: QRCodeData) => {
    const link = document.createElement('a');
    link.href = qrCode.qrCode;
    link.download = `${qrCode.name}.png`;
    link.click();
  };

  // Print fonksiyonu
  const handlePrint = () => {
    window.print();
  };

  const onLogout = () => {
    logout();
    router.push('/isletme-giris');
  };

  if (!authenticatedRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600"><TranslatedText>Yükleniyor...</TranslatedText></p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BusinessSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={onLogout}
        />
        <div className="lg:pl-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600"><TranslatedText>QR kodlar yükleniyor...</TranslatedText></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={onLogout}
      />

      <div className="lg:pl-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900"><TranslatedText>QR Kod Yönetimi</TranslatedText></h1>
                  <p className="text-sm text-gray-600"><TranslatedText>Masa QR kodlarınızı oluşturun ve yönetin</TranslatedText></p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FaPlus />
                <TranslatedText>QR Kod Oluştur</TranslatedText>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FaQrcode className="text-3xl text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600"><TranslatedText>Toplam QR Kod</TranslatedText></p>
                  <p className="text-2xl font-bold text-gray-900">{qrCodes.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FaEye className="text-3xl text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600"><TranslatedText>Aktif Kodlar</TranslatedText></p>
                  <p className="text-2xl font-bold text-gray-900">
                    {qrCodes.filter(qr => qr.isActive).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FaCheck className="text-3xl text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600"><TranslatedText>Toplam Tarama</TranslatedText></p>
                  <p className="text-2xl font-bold text-gray-900">
                    {qrCodes.reduce((sum, qr) => sum + qr.scanCount, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Codes Grid */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900"><TranslatedText>QR Kodlarım</TranslatedText></h2>
            </div>
            <div className="p-6">
              {qrCodes.length === 0 ? (
                <div className="text-center py-12">
                  <FaQrcode className="mx-auto text-6xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2"><TranslatedText>Henüz QR kod yok</TranslatedText></h3>
                  <p className="text-gray-600 mb-4"><TranslatedText>İlk QR kodunuzu oluşturmak için başlayın</TranslatedText></p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <TranslatedText>QR Kod Oluştur</TranslatedText>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {qrCodes.map((qrCode) => {
                    console.log('Rendering QR Code:', qrCode);
                    return (
                      <div key={qrCode.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                        <div className="text-center mb-4">
                          {qrCode.qrCode ? (
                            <img
                              src={qrCode.qrCode}
                              alt={qrCode.name}
                              className="w-32 h-32 mx-auto mb-2 border border-gray-200 rounded"
                              onError={(e) => {
                                console.error('QR Image load error:', qrCode.qrCode);
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect fill="%23ddd" width="128" height="128"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3EQR%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          ) : (
                            <div className="w-32 h-32 mx-auto mb-2 bg-gray-200 flex items-center justify-center text-gray-500 rounded">
                              <FaQrcode className="text-4xl" />
                            </div>
                          )}
                          <h3 className="font-semibold text-gray-900"><TranslatedText>Masa</TranslatedText> {qrCode.tableNumber} <TranslatedText>- QR Menü</TranslatedText></h3>
                          <p className="text-sm text-gray-600"><TranslatedText>Masa</TranslatedText> {qrCode.tableNumber} <TranslatedText>için QR kod</TranslatedText></p>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={() => handleCopyURL(qrCode.url, qrCode.tableNumber)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                          >
                            <FaCopy />
                            <TranslatedText>URL Kopyala</TranslatedText>
                          </button>
                          <button
                            onClick={() => handleDownloadQR(qrCode)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                          >
                            <FaDownload />
                            <TranslatedText>QR Kodunu İndir</TranslatedText>
                          </button>
                          <button
                            onClick={handlePrint}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors"
                          >
                            <FaPrint />
                            <TranslatedText>Yazdır</TranslatedText>
                          </button>
                          <button
                            onClick={() => handleDeleteQRCode(qrCode.id, qrCode.token)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                          >
                            <FaTrash />
                            <TranslatedText>Sil</TranslatedText>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900"><TranslatedText>QR Kod Oluştur</TranslatedText></h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TranslatedText>Masa Sayısı</TranslatedText>
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={tableCount}
                  onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  <TranslatedText>1 ile 50 arasında masa sayısı seçebilirsiniz</TranslatedText>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={creating}
                >
                  <TranslatedText>İptal</TranslatedText>
                </button>
                <button
                  onClick={handleCreateBulkQRCodes}
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <TranslatedText>Oluşturuluyor...</TranslatedText>
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      <TranslatedText>Oluştur</TranslatedText>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}>
            {toast.type === 'success' ? <FaCheck /> : <FaTimes />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
