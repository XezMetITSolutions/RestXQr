'use client';

import { useState, useEffect } from 'react';
import { 
  FaStore, 
  FaUtensils, 
  FaUsers, 
  FaShoppingCart,
  FaChartLine,
  FaChartBar,
  FaQrcode,
  FaBug,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle
} from 'react-icons/fa';
import useRestaurantStore from '@/store/useRestaurantStore';
import useAuthStore from '@/store/useAuthStore';

export default function DebugStorePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const restaurantStore = useRestaurantStore();
  const authStore = useAuthStore();

  // Store'dan tüm değerleri al - güvenli şekilde
  const storeState = {
    restaurants: restaurantStore.restaurants,
    currentRestaurant: restaurantStore.currentRestaurant,
    categories: restaurantStore.categories,
    menuItems: restaurantStore.menuItems,
    orders: restaurantStore.orders,
    activeOrders: restaurantStore.activeOrders,
    serviceCalls: restaurantStore.serviceCalls,
    loading: restaurantStore.loading,
    error: restaurantStore.error,
  };

  // Güvenli array'ler
  const safeCategories = Array.isArray(storeState.categories) ? storeState.categories : [];
  const safeMenuItems = Array.isArray(storeState.menuItems) ? storeState.menuItems : [];
  const safeOrders = Array.isArray(storeState.orders) ? storeState.orders : [];
  const safeActiveOrders = Array.isArray(storeState.activeOrders) ? storeState.activeOrders : [];
  const safeRestaurants = Array.isArray(storeState.restaurants) ? storeState.restaurants : [];
  const safeServiceCalls = Array.isArray(storeState.serviceCalls) ? storeState.serviceCalls : [];

  // Array kontrolü
  const arrayChecks = {
    restaurants: {
      value: storeState.restaurants,
      isArray: Array.isArray(storeState.restaurants),
      length: safeRestaurants.length,
      isUndefined: storeState.restaurants === undefined,
      isNull: storeState.restaurants === null,
      type: typeof storeState.restaurants,
      status: Array.isArray(storeState.restaurants) ? 'ok' : storeState.restaurants === undefined ? 'undefined' : 'error'
    },
    categories: {
      value: storeState.categories,
      isArray: Array.isArray(storeState.categories),
      length: safeCategories.length,
      isUndefined: storeState.categories === undefined,
      isNull: storeState.categories === null,
      type: typeof storeState.categories,
      status: Array.isArray(storeState.categories) ? 'ok' : storeState.categories === undefined ? 'undefined' : 'error'
    },
    menuItems: {
      value: storeState.menuItems,
      isArray: Array.isArray(storeState.menuItems),
      length: safeMenuItems.length,
      isUndefined: storeState.menuItems === undefined,
      isNull: storeState.menuItems === null,
      type: typeof storeState.menuItems,
      status: Array.isArray(storeState.menuItems) ? 'ok' : storeState.menuItems === undefined ? 'undefined' : 'error'
    },
    orders: {
      value: storeState.orders,
      isArray: Array.isArray(storeState.orders),
      length: safeOrders.length,
      isUndefined: storeState.orders === undefined,
      isNull: storeState.orders === null,
      type: typeof storeState.orders,
      status: Array.isArray(storeState.orders) ? 'ok' : storeState.orders === undefined ? 'undefined' : 'error'
    },
    activeOrders: {
      value: storeState.activeOrders,
      isArray: Array.isArray(storeState.activeOrders),
      length: safeActiveOrders.length,
      isUndefined: storeState.activeOrders === undefined,
      isNull: storeState.activeOrders === null,
      type: typeof storeState.activeOrders,
      status: Array.isArray(storeState.activeOrders) ? 'ok' : storeState.activeOrders === undefined ? 'undefined' : 'error'
    },
    serviceCalls: {
      value: storeState.serviceCalls,
      isArray: Array.isArray(storeState.serviceCalls),
      length: safeServiceCalls.length,
      isUndefined: storeState.serviceCalls === undefined,
      isNull: storeState.serviceCalls === null,
      type: typeof storeState.serviceCalls,
      status: Array.isArray(storeState.serviceCalls) ? 'ok' : storeState.serviceCalls === undefined ? 'undefined' : 'error'
    },
  };

  // Hata tespiti
  const errors = Object.entries(arrayChecks)
    .filter(([_, check]) => check.isUndefined || (!check.isArray && check.value !== null))
    .map(([key, check]) => ({
      key,
      issue: check.isUndefined ? 'UNDEFINED' : check.isNull ? 'NULL' : 'NOT_ARRAY',
      check,
    }));

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleFixStore = () => {
    // Store'u düzelt
    if (!Array.isArray(restaurantStore.categories)) {
      restaurantStore.setCategories([]);
    }
    if (!Array.isArray(restaurantStore.menuItems)) {
      restaurantStore.setMenuItems([]);
    }
    if (!Array.isArray(restaurantStore.orders)) {
      restaurantStore.setOrders([]);
    }
    if (!Array.isArray(restaurantStore.restaurants)) {
      restaurantStore.setRestaurants([]);
    }
    setTimeout(() => handleRefresh(), 100);
  };

  useEffect(() => {
    // Her 2 saniyede bir kontrol et
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Demo istatistikler
  const stats = {
    totalArrays: Object.keys(arrayChecks).length,
    safeArrays: Object.values(arrayChecks).filter(c => c.isArray).length,
    errorArrays: errors.length,
    totalItems: safeCategories.length + safeMenuItems.length + safeOrders.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Main Content */}
      <div className="relative z-10 p-6 lg:p-8">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl shadow-2xl border-b border-white/20 rounded-2xl mb-6">
          <div className="px-6 lg:px-8 py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaBug className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Store Debug Paneli</h1>
                <p className="text-gray-600">Array undefined hatalarını tespit ve düzelt</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                🔄 Yenile
              </button>
              <button
                onClick={handleFixStore}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                🔧 Düzelt
              </button>
            </div>
          </div>
        </header>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaStore className="text-blue-600 text-xl" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.totalArrays}</span>
            </div>
            <div className="text-sm text-gray-600">Toplam Array</div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.safeArrays}</span>
            </div>
            <div className="text-sm text-gray-600">Güvenli Array</div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.errorArrays}</span>
            </div>
            <div className="text-sm text-gray-600">Hatalı Array</div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FaShoppingCart className="text-purple-600 text-xl" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.totalItems}</span>
            </div>
            <div className="text-sm text-gray-600">Toplam Öğe</div>
          </div>
        </div>

        {/* Hata Özeti */}
        {errors.length > 0 && (
          <div className="mb-6 p-6 bg-red-50 border-2 border-red-500 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-red-800 flex items-center gap-2">
              <FaTimesCircle className="text-red-600" />
              Tespit Edilen Hatalar ({errors.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {errors.map(({ key, issue, check }) => (
                <div key={key} className="bg-red-100 p-4 rounded-xl border border-red-300">
                  <div className="font-bold text-lg text-red-900 mb-2">{key.toUpperCase()}</div>
                  <div className="text-sm text-red-800 space-y-1">
                    <div>Durum: <span className="font-bold">{issue}</span></div>
                    <div>Tip: {check.type}</div>
                    <div>Array mi?: {check.isArray ? '✅ Evet' : '❌ Hayır'}</div>
                    <div>Undefined?: {check.isUndefined ? '⚠️ Evet' : '✅ Hayır'}</div>
                    <div>Null?: {check.isNull ? '⚠️ Evet' : '✅ Hayır'}</div>
                    <div>Length: {check.length}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {errors.length === 0 && (
          <div className="mb-6 p-6 bg-green-50 border-2 border-green-500 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
              <FaCheckCircle className="text-green-600" />
              ✅ Tüm Array'ler Güvenli
            </h2>
            <p className="text-green-700 mt-2">Hiçbir undefined veya null array tespit edilmedi.</p>
          </div>
        )}

        {/* Detaylı Array Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {Object.entries(arrayChecks).map(([key, check]) => {
            const statusColor = check.status === 'ok' ? 'green' : check.status === 'undefined' ? 'red' : 'yellow';
            const bgColor = check.status === 'ok' ? 'bg-green-50' : check.status === 'undefined' ? 'bg-red-50' : 'bg-yellow-50';
            const borderColor = check.status === 'ok' ? 'border-green-500' : check.status === 'undefined' ? 'border-red-500' : 'border-yellow-500';
            
            return (
              <div
                key={key}
                className={`${bgColor} p-6 rounded-2xl border-2 ${borderColor} shadow-xl`}
              >
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                  {check.status === 'ok' && <FaCheckCircle className="text-green-600" />}
                  {check.status === 'undefined' && <FaExclamationTriangle className="text-red-600" />}
                  {check.status === 'error' && <FaTimesCircle className="text-yellow-600" />}
                  {key.toUpperCase()}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between bg-white/50 p-2 rounded-lg">
                    <span className="font-medium">Array mi?:</span>
                    <span className={check.isArray ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      {check.isArray ? '✅ Evet' : '❌ Hayır'}
                    </span>
                  </div>
                  <div className="flex justify-between bg-white/50 p-2 rounded-lg">
                    <span className="font-medium">Undefined?:</span>
                    <span className={check.isUndefined ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                      {check.isUndefined ? '⚠️ Evet' : '✅ Hayır'}
                    </span>
                  </div>
                  <div className="flex justify-between bg-white/50 p-2 rounded-lg">
                    <span className="font-medium">Null?:</span>
                    <span className={check.isNull ? 'text-yellow-600 font-bold' : 'text-green-600 font-bold'}>
                      {check.isNull ? '⚠️ Evet' : '✅ Hayır'}
                    </span>
                  </div>
                  <div className="flex justify-between bg-white/50 p-2 rounded-lg">
                    <span className="font-medium">Tip:</span>
                    <span className="text-blue-600 font-bold">{check.type}</span>
                  </div>
                  <div className="flex justify-between bg-white/50 p-2 rounded-lg">
                    <span className="font-medium">Length:</span>
                    <span className="text-purple-600 font-bold text-lg">{check.length}</span>
                  </div>
                  {check.isArray && check.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <div className="text-xs text-gray-600 mb-2 font-medium">İlk Öğe:</div>
                      <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-auto max-h-32">
                        {JSON.stringify(check.value[0], null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Store State JSON */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">📦 Tam Store State</h2>
          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl border-2 border-gray-200 shadow-xl">
            <pre className="text-xs overflow-auto max-h-96 bg-gray-900 text-green-400 p-4 rounded-lg">
              {JSON.stringify(storeState, (key, value) => {
                if (key === 'restaurants' || key === 'categories' || key === 'menuItems' || 
                    key === 'orders' || key === 'activeOrders' || key === 'serviceCalls') {
                  return {
                    type: Array.isArray(value) ? 'array' : typeof value,
                    isArray: Array.isArray(value),
                    length: Array.isArray(value) ? value.length : 'N/A',
                    isUndefined: value === undefined,
                    isNull: value === null,
                    firstItem: Array.isArray(value) && value.length > 0 ? value[0] : null,
                  };
                }
                return value;
              }, 2)}
            </pre>
          </div>
        </div>

        {/* Store Actions */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">⚙️ Store Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => {
                restaurantStore.setCategories([]);
                setTimeout(() => handleRefresh(), 100);
              }}
              className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Categories Sıfırla
            </button>
            <button
              onClick={() => {
                restaurantStore.setMenuItems([]);
                setTimeout(() => handleRefresh(), 100);
              }}
              className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              MenuItems Sıfırla
            </button>
            <button
              onClick={() => {
                restaurantStore.setOrders([]);
                setTimeout(() => handleRefresh(), 100);
              }}
              className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Orders Sıfırla
            </button>
            <button
              onClick={() => {
                restaurantStore.setRestaurants([]);
                setTimeout(() => handleRefresh(), 100);
              }}
              className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Restaurants Sıfırla
            </button>
          </div>
        </div>

        {/* Auth Store */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">🔐 Auth Store</h2>
          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl border-2 border-gray-200 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">isAuthenticated</div>
                <div className="text-2xl font-bold">{authStore.isAuthenticated ? '✅' : '❌'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">authenticatedRestaurant</div>
                <div className="text-2xl font-bold">{authStore.authenticatedRestaurant ? '✅' : '❌'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">authenticatedStaff</div>
                <div className="text-2xl font-bold">{authStore.authenticatedStaff ? '✅' : '❌'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Son Güncelleme */}
        <div className="text-center text-gray-600 text-sm">
          Son Güncelleme: {new Date().toLocaleTimeString('tr-TR')} | 
          Key: {refreshKey} | 
          Sayfa yenileme ile düzeliyor mu? {errors.length > 0 ? '⚠️ Evet' : '✅ Hayır'}
        </div>
      </div>
    </div>
  );
}
