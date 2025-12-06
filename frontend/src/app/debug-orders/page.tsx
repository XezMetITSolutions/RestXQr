'use client';

import { useEffect, useState } from 'react';
import { FaBug, FaSync, FaCheckCircle, FaExclamationTriangle, FaUtensils, FaShoppingCart, FaClock, FaTrash } from 'react-icons/fa';

interface DebugStep {
  id: string;
  title: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  data?: any;
  timestamp?: string;
}

export default function OrderFlowDebugPage() {
  const [steps, setSteps] = useState<DebugStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [restaurantInfo, setRestaurantInfo] = useState<any>(null);
  const [cartOrders, setCartOrders] = useState<any[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

  const addStep = (step: Omit<DebugStep, 'timestamp'>) => {
    const newStep = {
      ...step,
      timestamp: new Date().toLocaleTimeString()
    };
    setSteps(prev => [...prev, newStep]);
    return newStep;
  };

  const updateStep = (id: string, updates: Partial<DebugStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  // Restoran bilgisini al
  const getRestaurantInfo = async () => {
    const step = addStep({
      id: 'restaurant-info',
      title: '1. Restoran Bilgisi',
      status: 'pending',
      message: 'Aksaray restoranı bilgileri alınıyor...'
    });

    try {
      const response = await fetch(`${API_URL}/staff/restaurants`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const aksaray = data.data.find((r: any) => r.username === 'aksaray');
        
        if (aksaray) {
          setRestaurantInfo(aksaray);
          updateStep('restaurant-info', {
            status: 'success',
            message: `✅ Aksaray restoranı bulundu: ${aksaray.name} (ID: ${aksaray.id})`,
            data: aksaray
          });
          return aksaray;
        } else {
          updateStep('restaurant-info', {
            status: 'error',
            message: '❌ Aksaray restoranı bulunamadı!',
            data: data.data
          });
        }
      } else {
        updateStep('restaurant-info', {
          status: 'error',
          message: '❌ Restoran listesi alınamadı',
          data
        });
      }
    } catch (error: any) {
      updateStep('restaurant-info', {
        status: 'error',
        message: `❌ API hatası: ${error.message}`,
        data: error
      });
    }
    return null;
  };

  // Backend'den siparişleri çek
  const getBackendOrders = async (restaurantId: string) => {
    const step = addStep({
      id: 'backend-orders',
      title: '2. Backend Siparişleri',
      status: 'pending',
      message: 'Backend\'den siparişler çekiliyor...'
    });

    try {
      const response = await fetch(`${API_URL}/orders?restaurantId=${restaurantId}&status=pending`);
      const data = await response.json();
      
      if (data.success) {
        setCartOrders(data.data || []);
        updateStep('backend-orders', {
          status: 'success',
          message: `✅ Backend'den ${data.data?.length || 0} sipariş bulundu`,
          data: data.data
        });
        return data.data || [];
      } else {
        updateStep('backend-orders', {
          status: 'error',
          message: '❌ Backend siparişleri alınamadı',
          data
        });
      }
    } catch (error: any) {
      updateStep('backend-orders', {
        status: 'error',
        message: `❌ API hatası: ${error.message}`,
        data: error
      });
    }
    return [];
  };

  // LocalStorage'dan siparişleri kontrol et
  const getLocalStorageOrders = () => {
    const step = addStep({
      id: 'localstorage-orders',
      title: '3. LocalStorage Siparişleri',
      status: 'pending',
      message: 'LocalStorage kontrol ediliyor...'
    });

    try {
      const stored = localStorage.getItem('central-orders');
      const orders = stored ? JSON.parse(stored) : [];
      
      setKitchenOrders(orders);
      updateStep('localstorage-orders', {
        status: orders.length > 0 ? 'success' : 'warning',
        message: `📦 LocalStorage'da ${orders.length} sipariş var`,
        data: orders
      });
      
      return orders;
    } catch (error: any) {
      updateStep('localstorage-orders', {
        status: 'error',
        message: `❌ LocalStorage hatası: ${error.message}`,
        data: error
      });
      return [];
    }
  };

  // Mutfak paneli store durumunu kontrol et
  const checkKitchenStore = () => {
    const step = addStep({
      id: 'kitchen-store',
      title: '4. Mutfak Store Durumu',
      status: 'pending',
      message: 'Zustand store kontrol ediliyor...'
    });

    try {
      // Store'a erişmeye çalış
      const storeData = {
        hasStore: typeof window !== 'undefined' && (window as any).useCentralOrderStore,
        timestamp: new Date().toISOString()
      };
      
      updateStep('kitchen-store', {
        status: 'success',
        message: '📊 Store durumu kontrol edildi',
        data: storeData
      });
      
      return storeData;
    } catch (error: any) {
      updateStep('kitchen-store', {
        status: 'error',
        message: `❌ Store hatası: ${error.message}`,
        data: error
      });
      return null;
    }
  };

  // Tam debug analizi çalıştır
  const runFullDebug = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setSteps([]);
    
    try {
      // 1. Restoran bilgisi al
      const restaurant = await getRestaurantInfo();
      
      if (restaurant) {
        // 2. Backend siparişleri çek
        await getBackendOrders(restaurant.id);
        
        // 3. LocalStorage kontrol et
        getLocalStorageOrders();
        
        // 4. Store durumunu kontrol et
        checkKitchenStore();
        
        // 5. Sonuç analizi
        addStep({
          id: 'analysis',
          title: '5. Analiz Sonucu',
          status: 'success',
          message: '🔍 Debug analizi tamamlandı. Sonuçları inceleyin.'
        });
      }
    } catch (error: any) {
      addStep({
        id: 'error',
        title: 'Hata',
        status: 'error',
        message: `❌ Debug sırasında hata: ${error.message}`,
        data: error
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Tüm siparişleri sil
  const deleteAllOrders = async () => {
    if (!restaurantInfo?.id) {
      alert('❌ Önce debug analizi çalıştırın!');
      return;
    }

    const confirmed = confirm(
      `⚠️ TÜM SİPARİŞLERİ SİLMEK İSTEDİĞİNİZDEN EMİN MİSİNİZ?\n\n` +
      `Restoran: ${restaurantInfo.name}\n` +
      `Backend'deki ${cartOrders.length} sipariş silinecek.\n` +
      `LocalStorage'daki ${kitchenOrders.length} sipariş temizlenecek.\n\n` +
      `Bu işlem GERİ ALINAMAZ!`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    
    const step = addStep({
      id: 'delete-orders',
      title: '🗑️ Siparişleri Silme',
      status: 'pending',
      message: 'Tüm siparişler siliniyor...'
    });

    try {
      // 1. Backend'den sil
      const response = await fetch(`${API_URL}/orders/bulk?restaurantId=${restaurantInfo.id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 2. LocalStorage'ı temizle
        localStorage.removeItem('central-orders');
        
        // 3. State'leri güncelle
        setCartOrders([]);
        setKitchenOrders([]);
        
        updateStep('delete-orders', {
          status: 'success',
          message: `✅ ${result.deletedCount} sipariş başarıyla silindi! LocalStorage temizlendi.`,
          data: result
        });
        
        alert(`✅ Başarılı!\n\n${result.deletedCount} sipariş silindi.\nLocalStorage temizlendi.`);
      } else {
        updateStep('delete-orders', {
          status: 'error',
          message: `❌ Silme işlemi başarısız: ${result.message}`,
          data: result
        });
        
        alert(`❌ Hata: ${result.message}`);
      }
    } catch (error: any) {
      updateStep('delete-orders', {
        status: 'error',
        message: `❌ API hatası: ${error.message}`,
        data: error
      });
      
      alert(`❌ Hata: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusIcon = (status: DebugStep['status']) => {
    switch (status) {
      case 'success': return <FaCheckCircle className="text-green-500" />;
      case 'error': return <FaExclamationTriangle className="text-red-500" />;
      case 'warning': return <FaExclamationTriangle className="text-yellow-500" />;
      case 'pending': return <FaClock className="text-blue-500 animate-spin" />;
      default: return <FaClock className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaBug className="text-blue-500" />
                Sipariş Akışı Debug
              </h1>
              <p className="text-gray-600 mt-2">
                Menu → Cart → Kitchen panel sipariş akışını adım adım takip edin
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={runFullDebug}
                disabled={isRunning}
                className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                  isRunning 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <FaSync className={isRunning ? 'animate-spin' : ''} />
                {isRunning ? 'Analiz Ediliyor...' : 'Debug Başlat'}
              </button>
              
              <button
                onClick={deleteAllOrders}
                disabled={isDeleting || !restaurantInfo}
                className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                  isDeleting || !restaurantInfo
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
                title={!restaurantInfo ? 'Önce debug analizi çalıştırın' : 'Tüm siparişleri sil'}
              >
                <FaTrash className={isDeleting ? 'animate-pulse' : ''} />
                {isDeleting ? 'Siliniyor...' : 'Siparişleri Sil'}
              </button>
            </div>
          </div>
        </div>

        {/* Debug Steps */}
        {steps.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Adımları</h2>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getStatusIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">{step.title}</h3>
                        <span className="text-sm text-gray-500">{step.timestamp}</span>
                      </div>
                      <p className="text-gray-600 mt-1">{step.message}</p>
                      {step.data && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                            Detayları Göster
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                            {JSON.stringify(step.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Restaurant Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaUtensils className="text-orange-500" />
              <h3 className="font-semibold">Restoran Bilgisi</h3>
            </div>
            {restaurantInfo ? (
              <div className="space-y-2 text-sm">
                <div><strong>Ad:</strong> {restaurantInfo.name}</div>
                <div><strong>Username:</strong> {restaurantInfo.username}</div>
                <div><strong>ID:</strong> {restaurantInfo.id}</div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Henüz yüklenmedi</p>
            )}
          </div>

          {/* Backend Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaShoppingCart className="text-green-500" />
              <h3 className="font-semibold">Backend Siparişleri</h3>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {cartOrders.length}
            </div>
            <p className="text-sm text-gray-500">Pending durumunda</p>
          </div>

          {/* Kitchen Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaClock className="text-blue-500" />
              <h3 className="font-semibold">LocalStorage</h3>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {kitchenOrders.length}
            </div>
            <p className="text-sm text-gray-500">Kaydedilmiş sipariş</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-3">🔍 Nasıl Kullanılır?</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <div><strong>1.</strong> "Debug Başlat" butonuna tıklayın</div>
            <div><strong>2.</strong> Sistem otomatik olarak tüm adımları kontrol edecek</div>
            <div><strong>3.</strong> Her adımın sonucunu inceleyin</div>
            <div><strong>4.</strong> Sorun varsa kırmızı uyarıları kontrol edin</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold mb-4">Hızlı İşlemler</h3>
          <div className="flex gap-3">
            <button
              onClick={() => window.open('https://aksaray.restxqr.com/menu/', '_blank')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Menu Sayfası
            </button>
            <button
              onClick={() => window.open('https://aksaray.restxqr.com/cart/', '_blank')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Cart Sayfası
            </button>
            <button
              onClick={() => window.open('https://aksaray.restxqr.com/kitchen/', '_blank')}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Kitchen Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


