'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaQrcode, 
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaCopy,
  FaDownload,
  FaPrint,
  FaSync,
  FaClock,
  FaSignOutAlt
} from 'react-icons/fa';
import { 
  createTableQRCode, 
  createGeneralQRCode, 
  createBulkTableQRCodes, 
  getRestaurantSlug,
  generateToken,
  type QRCodeData 
} from '@/utils/qrCodeGenerator';
import { useAuthStore } from '@/store/useAuthStore';
import BusinessSidebar from '@/components/BusinessSidebar';
import apiService from '@/services/api';

export default function QRCodesPage() {
  const router = useRouter();
  const { authenticatedRestaurant, authenticatedStaff, isAuthenticated, logout } = useAuthStore();
  
  // States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([
    {
      id: '1',
      name: 'Masa 1 - QR Menü',
      tableNumber: 1,
      token: 'demo-token-1',
      qrCode: 'https://quickchart.io/qr?text=https://restxqr.com/menu/demo/1&size=300',
      url: 'https://restxqr.com/menu/demo/1',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      theme: 'default',
      type: 'table',
      restaurantId: 'demo-restaurant',
      description: 'Demo QR kod',
      isActive: true,
      scanCount: 45
    },
    {
      id: '2',
      name: 'Masa 2 - QR Menü',
      tableNumber: 2,
      token: 'demo-token-2',
      qrCode: 'https://quickchart.io/qr?text=https://restxqr.com/menu/demo/2&size=300',
      url: 'https://restxqr.com/menu/demo/2',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      theme: 'default',
      type: 'table',
      restaurantId: 'demo-restaurant',
      description: 'Demo QR kod',
      isActive: true,
      scanCount: 38
    },
    {
      id: '3',
      name: 'Masa 3 - QR Menü',
      tableNumber: 3,
      token: 'demo-token-3',
      qrCode: 'https://quickchart.io/qr?text=https://restxqr.com/menu/demo/3&size=300',
      url: 'https://restxqr.com/menu/demo/3',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      theme: 'default',
      type: 'table',
      restaurantId: 'demo-restaurant',
      description: 'Demo QR kod',
      isActive: true,
      scanCount: 52
    },
    {
      id: '4',
      name: 'Masa 4 - QR Menü',
      tableNumber: 4,
      token: 'demo-token-4',
      qrCode: 'https://quickchart.io/qr?text=https://restxqr.com/menu/demo/4&size=300',
      url: 'https://restxqr.com/menu/demo/4',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      theme: 'default',
      type: 'table',
      restaurantId: 'demo-restaurant',
      description: 'Demo QR kod',
      isActive: true,
      scanCount: 41
    },
    {
      id: '5',
      name: 'Masa 5 - QR Menü',
      tableNumber: 5,
      token: 'demo-token-5',
      qrCode: 'https://quickchart.io/qr?text=https://restxqr.com/menu/demo/5&size=300',
      url: 'https://restxqr.com/menu/demo/5',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      theme: 'default',
      type: 'table',
      restaurantId: 'demo-restaurant',
      description: 'Demo QR kod',
      isActive: true,
      scanCount: 29
    }
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [bulkCount, setBulkCount] = useState(5);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [qrType, setQrType] = useState<'token'>('token');
  const [toast, setToast] = useState({ message: '', visible: false });

  // Demo için session kontrolü yok
  useEffect(() => {
    console.log('Demo panel sayfası - QR kodlar yüklendi');
  }, []);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  // Helper: reload from backend - Demo modda kullanılmıyor
  const reloadQRCodes = async () => {
    // Demo modda backend'e gitme
    console.log('Demo mod - QR kodlar zaten yüklü');
  };

  // Load existing QR codes from backend on mount/login - Demo modda devre dışı
  useEffect(() => {
    // Demo modda backend çağrısı yapma
  }, []);

  // Toplu QR kod oluşturma - Sabit QR kodları (basılabilir)
  const handleCreateBulkQRCodes = async () => {
    if (!authenticatedRestaurant) {
      showToast('Restoran bilgisi bulunamadı!');
      return;
    }

    try {
      const tokens: string[] = [];
      
      // Her masa için token oluştur
      for (let i = 1; i <= bulkCount; i++) {
        try {
          const response = await apiService.generateQRToken({
            restaurantId: authenticatedRestaurant.id,
            tableNumber: i,
            duration: 24 // 24 saat geçerli
          });
          if (response.success && response.data?.token) {
            tokens.push(response.data.token);
          } else {
            throw new Error('Token oluşturulamadı');
          }
        } catch (error) {
          console.error('Token oluşturma hatası:', error);
          showToast('Token oluşturulurken hata oluştu!');
          return;
        }
      }

      const newQRCodes = createBulkTableQRCodes(
        1, // Masa 1'den başla
        bulkCount,
        authenticatedRestaurant.id,
        selectedTheme,
        authenticatedRestaurant,
        tokens
      );

      setQrCodes(prev => [...prev, ...newQRCodes]);
      setShowCreateModal(false);
      
      showToast(`${bulkCount} adet token'lı QR kod oluşturuldu! (Ödeme sonrası yeniden scan gerekli)`);
    } catch (error) {
      console.error('QR kod oluşturma hatası:', error);
      showToast('QR kod oluşturulurken hata oluştu!');
    }
  };

  // Tek QR kod oluşturma - Token'lı
  const handleCreateSingleQRCode = async (tableNumber: number) => {
    if (!authenticatedRestaurant) {
      showToast('Restoran bilgisi bulunamadı!');
      return;
    }

    try {
      // Backend'den token oluştur
      const response = await apiService.generateQRToken({
        restaurantId: authenticatedRestaurant.id,
        tableNumber: tableNumber,
        duration: 24 // 24 saat geçerli
      });

      if (response.success && response.data?.token) {
        const newQRCode = createTableQRCode(
          tableNumber,
          authenticatedRestaurant.id,
          selectedTheme,
          authenticatedRestaurant,
          response.data.token
        );

        setQrCodes(prev => [...prev, newQRCode]);
        showToast(`Masa ${tableNumber} için token'lı QR kod oluşturuldu!`);
      } else {
        throw new Error('Token oluşturulamadı');
      }
    } catch (error) {
      console.error('QR kod oluşturma hatası:', error);
      showToast('QR kod oluşturulurken hata oluştu!');
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
    showToast('QR kod silindi.');
  };

  // URL kopyalama - backend'in ürettiği qrUrl varsa onu kullan
  const handleCopyURL = (fallbackUrl: string, tableNumber?: number) => {
    try {
      const sub = authenticatedRestaurant?.username || 'aksaray';
      const base = `https://${sub}.restxqr.com`;
      // fallbackUrl öncelik, yoksa subdomain + table paramı ile kur
      const url = fallbackUrl || `${base}/menu/?table=${tableNumber || ''}`;
      navigator.clipboard.writeText(url);
      showToast('URL kopyalandı!');
    } catch {
      showToast('URL kopyalanamadı');
    }
  };

  // QR kod indirme
  const handleDownloadQR = (qrCode: QRCodeData) => {
    const link = document.createElement('a');
    link.href = qrCode.qrCode;
    link.download = `${qrCode.name}.png`;
    link.click();
  };

  const onLogout = () => {
    logout();
    router.push('/');
  };

  // Demo modda authentication kontrolü yapma
  const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo-paneller/');
  if (!isDemo && !authenticatedRestaurant && !authenticatedStaff) {
    return <div>Yükleniyor...</div>;
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
                  <h1 className="text-2xl font-bold text-gray-900">QR Kod Yönetimi</h1>
                  <p className="text-sm text-gray-600">Masa QR kodlarınızı oluşturun ve yönetin</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FaPlus />
                QR Kod Oluştur
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
                  <p className="text-sm font-medium text-gray-600">Toplam QR Kod</p>
                  <p className="text-2xl font-bold text-gray-900">{qrCodes.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FaEye className="text-3xl text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aktif Kodlar</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {qrCodes.filter(qr => qr.isActive).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FaClock className="text-3xl text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Tarama</p>
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
              <h2 className="text-lg font-semibold text-gray-900">QR Kodlarım</h2>
            </div>
            <div className="p-6">
              {qrCodes.length === 0 ? (
                <div className="text-center py-12">
                  <FaQrcode className="mx-auto text-6xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz QR kod yok</h3>
                  <p className="text-gray-600 mb-4">İlk QR kodunuzu oluşturmak için başlayın</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    QR Kod Oluştur
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {qrCodes.map((qrCode) => (
                    <div key={qrCode.id} className="border rounded-lg p-4">
                      <div className="text-center mb-4">
                        <img 
                          src={qrCode.qrCode} 
                          alt={qrCode.name}
                          className="w-32 h-32 mx-auto mb-2"
                        />
                        <h3 className="font-semibold text-gray-900">{qrCode.name}</h3>
                        <p className="text-sm text-gray-600">{qrCode.description}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <button
                          onClick={() => handleCopyURL(qrCode.url)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          <FaCopy />
                          URL Kopyala
                        </button>
                        <button
                          onClick={() => handleDownloadQR(qrCode)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100"
                        >
                          <FaDownload />
                          QR Kodunu İndir
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100"
                        >
                          <FaPrint />
                          Yazdır
                        </button>
                        <button
                          onClick={() => handleDeleteQRCode(qrCode.id, qrCode.token)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                        >
                          <FaTrash />
                          Listeden Kaldır
                        </button>
                      </div>
                    </div>
                  ))}
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">QR Kod Oluştur</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Masa Sayısı
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Token'lı QR kodlar oluşturulacak (Ödeme sonrası yeniden scan gerekli)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema
                </label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="default">Varsayılan</option>
                  <option value="modern">Modern</option>
                  <option value="classic">Klasik</option>
                  <option value="minimal">Minimal</option>
                  <option value="romantic">Romantik</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleCreateBulkQRCodes}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.visible && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {toast.message}
        </div>
      )}
    </div>
  );
}




