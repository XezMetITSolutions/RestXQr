'use client';

import { useState, useEffect } from 'react';
import { FaBug, FaUtensils, FaShoppingCart, FaPlay, FaCheckCircle, FaExclamationTriangle, FaClock, FaEye, FaCode } from 'react-icons/fa';
import { useCartStore } from '@/store';

interface DebugStep {
  id: string;
  title: string;
  status: 'pending' | 'success' | 'error' | 'warning' | 'info';
  message: string;
  data?: any;
  timestamp?: string;
}

export default function MenuDebugPage() {
  const [steps, setSteps] = useState<DebugStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [menuData, setMenuData] = useState<any>(null);
  const [cartData, setCartData] = useState<any>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // Cart store
  const { items: cartItems, addItem, clearCart } = useCartStore();

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

  // 1. Restoran bilgisini analiz et
  const analyzeRestaurant = async () => {
    const step = addStep({
      id: 'restaurant-analysis',
      title: '1. Restoran Bilgisi Analizi',
      status: 'pending',
      message: 'Restoran bilgileri kontrol ediliyor...'
    });

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      const response = await fetch(`${API_URL}/staff/restaurants`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const aksaray = data.data.find((r: any) => r.username === 'aksaray');
        
        if (aksaray) {
          setRestaurantData(aksaray);
          updateStep('restaurant-analysis', {
            status: 'success',
            message: `✅ Aksaray restoranı bulundu: ${aksaray.name} (ID: ${aksaray.id})`,
            data: {
              restaurant: aksaray,
              allRestaurants: data.data,
              apiEndpoint: `${API_URL}/staff/restaurants`
            }
          });
          return aksaray;
        } else {
          updateStep('restaurant-analysis', {
            status: 'error',
            message: '❌ Aksaray restoranı bulunamadı!',
            data: data.data
          });
        }
      }
    } catch (error: any) {
      updateStep('restaurant-analysis', {
        status: 'error',
        message: `❌ API hatası: ${error.message}`,
        data: error
      });
    }
    return null;
  };

  // 2. Menu verilerini analiz et
  const analyzeMenu = async (restaurantId: string) => {
    const step = addStep({
      id: 'menu-analysis',
      title: '2. Menu Verilerini Analizi',
      status: 'pending',
      message: 'Menu verileri kontrol ediliyor...'
    });

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      
      // Kategorileri çek
      const categoriesResponse = await fetch(`${API_URL}/restaurants/${restaurantId}/menu/categories`);
      const categoriesData = await categoriesResponse.json();
      
      // Menu itemları çek
      const itemsResponse = await fetch(`${API_URL}/restaurants/${restaurantId}/menu/items`);
      const itemsData = await itemsResponse.json();
      
      const menuInfo = {
        categories: categoriesData.data || [],
        items: itemsData.data || [],
        categoriesCount: categoriesData.data?.length || 0,
        itemsCount: itemsData.data?.length || 0,
        endpoints: {
          categories: `${API_URL}/restaurants/${restaurantId}/menu/categories`,
          items: `${API_URL}/restaurants/${restaurantId}/menu/items`
        }
      };
      
      setMenuData(menuInfo);
      
      updateStep('menu-analysis', {
        status: 'success',
        message: `✅ Menu verileri yüklendi: ${menuInfo.categoriesCount} kategori, ${menuInfo.itemsCount} ürün`,
        data: menuInfo
      });
      
      return menuInfo;
    } catch (error: any) {
      updateStep('menu-analysis', {
        status: 'error',
        message: `❌ Menu verileri alınamadı: ${error.message}`,
        data: error
      });
    }
    return null;
  };

  // 3. Cart store'u analiz et
  const analyzeCartStore = () => {
    const step = addStep({
      id: 'cart-analysis',
      title: '3. Cart Store Analizi',
      status: 'pending',
      message: 'Zustand cart store kontrol ediliyor...'
    });

    try {
      const cartInfo = {
        currentItems: cartItems,
        itemCount: cartItems.length,
        totalValue: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        storeAvailable: typeof addItem === 'function',
        localStorage: {
          cartData: localStorage.getItem('cart-store'),
          hasData: !!localStorage.getItem('cart-store')
        }
      };
      
      setCartData(cartInfo);
      
      updateStep('cart-analysis', {
        status: 'success',
        message: `✅ Cart store analizi tamamlandı: ${cartInfo.itemCount} ürün, ${cartInfo.totalValue}₺`,
        data: cartInfo
      });
      
      return cartInfo;
    } catch (error: any) {
      updateStep('cart-analysis', {
        status: 'error',
        message: `❌ Cart store hatası: ${error.message}`,
        data: error
      });
    }
    return null;
  };

  // 4. Sipariş simülasyonu yap
  const simulateOrder = async () => {
    const step = addStep({
      id: 'order-simulation',
      title: '4. Sipariş Simülasyonu',
      status: 'pending',
      message: 'Test siparişi oluşturuluyor...'
    });

    try {
      if (!menuData || !menuData.items || menuData.items.length === 0) {
        updateStep('order-simulation', {
          status: 'error',
          message: '❌ Menu verileri yok, simülasyon yapılamıyor'
        });
        return;
      }

      // İlk ürünü seç
      const testItem = menuData.items[0];
      
      // Sepete ekle
      const cartItem = {
        itemId: testItem.id,
        name: testItem.name,
        price: testItem.price,
        quantity: 1,
        image: testItem.image,
        preparationTime: testItem.preparationTime || 15
      };
      
      console.log('🛒 Test ürünü sepete ekleniyor:', cartItem);
      addItem(cartItem);
      
      // Sipariş verisi hazırla
      const orderData = {
        restaurantId: restaurantData.id,
        tableNumber: 5,
        items: [{
          menuItemId: testItem.id,
          name: testItem.name,
          quantity: 1,
          unitPrice: testItem.price,
          price: testItem.price,
          notes: 'Debug test siparişi'
        }],
        notes: 'Menu debug sayfasından test siparişi',
        orderType: 'dine_in'
      };
      
      console.log('📦 Test sipariş verisi:', orderData);
      
      // API'ye gönder
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      const result = await response.json();
      
      const simulationData = {
        testItem,
        cartItem,
        orderData,
        apiResponse: result,
        endpoint: `${API_URL}/orders`,
        success: result.success,
        orderId: result.data?.id
      };
      
      setSimulationResult(simulationData);
      
      if (result.success) {
        updateStep('order-simulation', {
          status: 'success',
          message: `✅ Test siparişi başarıyla oluşturuldu! Sipariş ID: ${result.data?.id}`,
          data: simulationData
        });
      } else {
        updateStep('order-simulation', {
          status: 'error',
          message: `❌ Sipariş oluşturulamadı: ${result.message}`,
          data: simulationData
        });
      }
      
    } catch (error: any) {
      updateStep('order-simulation', {
        status: 'error',
        message: `❌ Simülasyon hatası: ${error.message}`,
        data: error
      });
    }
  };

  // Tam analizi çalıştır
  const runFullAnalysis = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setSteps([]);
    
    try {
      // 1. Restoran analizi
      const restaurant = await analyzeRestaurant();
      
      if (restaurant) {
        // 2. Menu analizi
        await analyzeMenu(restaurant.id);
        
        // 3. Cart analizi
        analyzeCartStore();
        
        // 4. Sipariş simülasyonu
        await simulateOrder();
        
        // 5. Sonuç
        addStep({
          id: 'analysis-complete',
          title: '5. Analiz Tamamlandı',
          status: 'success',
          message: '🎉 Menu sipariş süreci analizi tamamlandı!'
        });
      }
    } catch (error: any) {
      addStep({
        id: 'analysis-error',
        title: 'Hata',
        status: 'error',
        message: `❌ Analiz sırasında hata: ${error.message}`,
        data: error
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: DebugStep['status']) => {
    switch (status) {
      case 'success': return <FaCheckCircle className="text-green-500" />;
      case 'error': return <FaExclamationTriangle className="text-red-500" />;
      case 'warning': return <FaExclamationTriangle className="text-yellow-500" />;
      case 'info': return <FaEye className="text-blue-500" />;
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
                <FaUtensils className="text-orange-500" />
                Menu Sipariş Süreci Analizi
              </h1>
              <p className="text-gray-600 mt-2">
                Menu sayfasından sipariş verme sürecini detaylı analiz edin
              </p>
            </div>
            <button
              onClick={runFullAnalysis}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                isRunning 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              <FaPlay className={isRunning ? 'animate-pulse' : ''} />
              {isRunning ? 'Analiz Ediliyor...' : 'Analizi Başlat'}
            </button>
          </div>
        </div>

        {/* Debug Steps */}
        {steps.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Analiz Adımları</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Restaurant */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaUtensils className="text-orange-500" />
              <h3 className="font-semibold">Restoran</h3>
            </div>
            {restaurantData ? (
              <div className="space-y-2 text-sm">
                <div><strong>Ad:</strong> {restaurantData.name}</div>
                <div><strong>ID:</strong> {restaurantData.id}</div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Henüz analiz edilmedi</p>
            )}
          </div>

          {/* Menu */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaCode className="text-blue-500" />
              <h3 className="font-semibold">Menu Verileri</h3>
            </div>
            {menuData ? (
              <div className="space-y-2 text-sm">
                <div><strong>Kategoriler:</strong> {menuData.categoriesCount}</div>
                <div><strong>Ürünler:</strong> {menuData.itemsCount}</div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Henüz analiz edilmedi</p>
            )}
          </div>

          {/* Cart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaShoppingCart className="text-green-500" />
              <h3 className="font-semibold">Sepet</h3>
            </div>
            {cartData ? (
              <div className="space-y-2 text-sm">
                <div><strong>Ürün:</strong> {cartData.itemCount}</div>
                <div><strong>Toplam:</strong> {cartData.totalValue}₺</div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Henüz analiz edilmedi</p>
            )}
          </div>

          {/* Simulation */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaCheckCircle className="text-purple-500" />
              <h3 className="font-semibold">Simülasyon</h3>
            </div>
            {simulationResult ? (
              <div className="space-y-2 text-sm">
                <div><strong>Durum:</strong> {simulationResult.success ? '✅ Başarılı' : '❌ Hatalı'}</div>
                {simulationResult.orderId && (
                  <div><strong>Sipariş ID:</strong> {simulationResult.orderId}</div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Henüz çalıştırılmadı</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="font-semibold text-orange-800 mb-3">🔍 Bu Analiz Ne Yapar?</h3>
          <div className="space-y-2 text-sm text-orange-700">
            <div><strong>1. Restoran Bilgisi:</strong> Aksaray restoranının API'den doğru çekilip çekilmediğini kontrol eder</div>
            <div><strong>2. Menu Verileri:</strong> Kategoriler ve ürünlerin API'den yüklenip yüklenmediğini test eder</div>
            <div><strong>3. Cart Store:</strong> Zustand sepet store'unun çalışıp çalışmadığını kontrol eder</div>
            <div><strong>4. Sipariş Simülasyonu:</strong> Gerçek bir test siparişi oluşturur ve API'ye gönderir</div>
            <div><strong>5. Detaylı Loglar:</strong> Her adımın JSON verilerini gösterir</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold mb-4">Hızlı İşlemler</h3>
          <div className="flex gap-3">
            <button
              onClick={() => window.open('https://aksaray.restxqr.com/menu/', '_blank')}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Menu Sayfası
            </button>
            <button
              onClick={() => window.open('https://aksaray.restxqr.com/cart/', '_blank')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Cart Sayfası
            </button>
            <button
              onClick={() => clearCart()}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sepeti Temizle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
