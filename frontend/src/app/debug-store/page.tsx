'use client';

import { useState, useEffect } from 'react';
import useRestaurantStore from '@/store/useRestaurantStore';
import useAuthStore from '@/store/useAuthStore';

export default function DebugStorePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const restaurantStore = useRestaurantStore();
  const authStore = useAuthStore();

  // Store'dan tüm değerleri al
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

  // Array kontrolü
  const arrayChecks = {
    restaurants: {
      value: storeState.restaurants,
      isArray: Array.isArray(storeState.restaurants),
      length: Array.isArray(storeState.restaurants) ? storeState.restaurants.length : 'N/A',
      isUndefined: storeState.restaurants === undefined,
      isNull: storeState.restaurants === null,
      type: typeof storeState.restaurants,
    },
    categories: {
      value: storeState.categories,
      isArray: Array.isArray(storeState.categories),
      length: Array.isArray(storeState.categories) ? storeState.categories.length : 'N/A',
      isUndefined: storeState.categories === undefined,
      isNull: storeState.categories === null,
      type: typeof storeState.categories,
    },
    menuItems: {
      value: storeState.menuItems,
      isArray: Array.isArray(storeState.menuItems),
      length: Array.isArray(storeState.menuItems) ? storeState.menuItems.length : 'N/A',
      isUndefined: storeState.menuItems === undefined,
      isNull: storeState.menuItems === null,
      type: typeof storeState.menuItems,
    },
    orders: {
      value: storeState.orders,
      isArray: Array.isArray(storeState.orders),
      length: Array.isArray(storeState.orders) ? storeState.orders.length : 'N/A',
      isUndefined: storeState.orders === undefined,
      isNull: storeState.orders === null,
      type: typeof storeState.orders,
    },
    activeOrders: {
      value: storeState.activeOrders,
      isArray: Array.isArray(storeState.activeOrders),
      length: Array.isArray(storeState.activeOrders) ? storeState.activeOrders.length : 'N/A',
      isUndefined: storeState.activeOrders === undefined,
      isNull: storeState.activeOrders === null,
      type: typeof storeState.activeOrders,
    },
    serviceCalls: {
      value: storeState.serviceCalls,
      isArray: Array.isArray(storeState.serviceCalls),
      length: Array.isArray(storeState.serviceCalls) ? storeState.serviceCalls.length : 'N/A',
      isUndefined: storeState.serviceCalls === undefined,
      isNull: storeState.serviceCalls === null,
      type: typeof storeState.serviceCalls,
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
    handleRefresh();
  };

  useEffect(() => {
    // Her saniye kontrol et
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">🔍 Store Debug Sayfası</h1>
          <div className="flex gap-4">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
            >
              🔄 Yenile
            </button>
            <button
              onClick={handleFixStore}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
            >
              🔧 Store'u Düzelt
            </button>
            <div className="px-4 py-2 bg-gray-700 rounded-lg">
              Son Güncelleme: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Hata Özeti */}
        {errors.length > 0 && (
          <div className="mb-8 p-6 bg-red-900 border-2 border-red-500 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">❌ Tespit Edilen Hatalar ({errors.length})</h2>
            <div className="space-y-2">
              {errors.map(({ key, issue, check }) => (
                <div key={key} className="bg-red-800 p-4 rounded-lg">
                  <div className="font-bold text-lg">{key.toUpperCase()}</div>
                  <div className="text-sm">
                    <div>Durum: <span className="font-bold text-red-300">{issue}</span></div>
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
          <div className="mb-8 p-6 bg-green-900 border-2 border-green-500 rounded-xl">
            <h2 className="text-2xl font-bold">✅ Tüm Array'ler Güvenli</h2>
            <p className="text-green-200">Hiçbir undefined veya null array tespit edilmedi.</p>
          </div>
        )}

        {/* Detaylı Array Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(arrayChecks).map(([key, check]) => (
            <div
              key={key}
              className={`p-6 rounded-xl border-2 ${
                check.isUndefined || (!check.isArray && check.value !== null)
                  ? 'bg-red-900 border-red-500'
                  : 'bg-gray-800 border-gray-600'
              }`}
            >
              <h3 className="text-xl font-bold mb-4">{key.toUpperCase()}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Array mi?:</span>
                  <span className={check.isArray ? 'text-green-400' : 'text-red-400'}>
                    {check.isArray ? '✅ Evet' : '❌ Hayır'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Undefined?:</span>
                  <span className={check.isUndefined ? 'text-red-400' : 'text-green-400'}>
                    {check.isUndefined ? '⚠️ Evet' : '✅ Hayır'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Null?:</span>
                  <span className={check.isNull ? 'text-yellow-400' : 'text-green-400'}>
                    {check.isNull ? '⚠️ Evet' : '✅ Hayır'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tip:</span>
                  <span className="text-blue-400">{check.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Length:</span>
                  <span className="text-purple-400 font-bold">{check.length}</span>
                </div>
                {check.isArray && check.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <div className="text-xs text-gray-400">İlk Öğe:</div>
                    <pre className="text-xs bg-gray-900 p-2 rounded mt-2 overflow-auto max-h-32">
                      {JSON.stringify(check.value[0], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Store State JSON */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">📦 Tam Store State</h2>
          <div className="bg-gray-800 p-6 rounded-xl border-2 border-gray-600">
            <pre className="text-xs overflow-auto max-h-96 bg-gray-900 p-4 rounded">
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">⚙️ Store Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => {
                restaurantStore.setCategories([]);
                handleRefresh();
              }}
              className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
            >
              Categories'i Sıfırla
            </button>
            <button
              onClick={() => {
                restaurantStore.setMenuItems([]);
                handleRefresh();
              }}
              className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
            >
              MenuItems'i Sıfırla
            </button>
            <button
              onClick={() => {
                restaurantStore.setOrders([]);
                handleRefresh();
              }}
              className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
            >
              Orders'ı Sıfırla
            </button>
            <button
              onClick={() => {
                restaurantStore.setRestaurants([]);
                handleRefresh();
              }}
              className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
            >
              Restaurants'ı Sıfırla
            </button>
          </div>
        </div>

        {/* Auth Store */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🔐 Auth Store</h2>
          <div className="bg-gray-800 p-6 rounded-xl border-2 border-gray-600">
            <div className="space-y-2 text-sm">
              <div>isAuthenticated: {authStore.isAuthenticated ? '✅' : '❌'}</div>
              <div>authenticatedRestaurant: {authStore.authenticatedRestaurant ? '✅' : '❌'}</div>
              <div>authenticatedStaff: {authStore.authenticatedStaff ? '✅' : '❌'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

