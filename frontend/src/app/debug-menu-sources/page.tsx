'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useRestaurantStore from '@/store/useRestaurantStore';
import apiService from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function DebugMenuSources() {
  const router = useRouter();
  const { authenticatedRestaurant } = useAuthStore();
  const { currentRestaurant, menuItems, categories, fetchRestaurantByUsername, fetchRestaurantMenu } = useRestaurantStore();
  
  const [customerMenuData, setCustomerMenuData] = useState<any>(null);
  const [businessMenuData, setBusinessMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subdomain, setSubdomain] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const sub = hostname.split('.')[0];
      setSubdomain(sub);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // 1. Customer Menu Data (müşteri menüsü)
        if (subdomain) {
          // Restaurant bilgilerini al
          const restaurant = await fetchRestaurantByUsername(subdomain);
          
          if (restaurant) {
            // Menü verilerini al
            await fetchRestaurantMenu(restaurant.id);
            
            // Store'dan güncel verileri al
            const storeState = useRestaurantStore.getState();
            
            setCustomerMenuData({
              restaurant: {
                id: restaurant.id,
                name: restaurant.name,
                username: restaurant.username,
                subdomain: subdomain
              },
              menuItems: storeState.menuItems.map((item: any) => ({
                id: item.id,
                name: item.name,
                imageUrl: item.imageUrl || item.image,
                imageSource: item.imageUrl ? 'imageUrl field' : (item.image ? 'image field' : 'no image'),
                fullImageUrl: item.imageUrl 
                  ? (item.imageUrl.startsWith('http') 
                      ? item.imageUrl 
                      : `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}`)
                  : (item.image 
                      ? (item.image.startsWith('http') 
                          ? item.image 
                          : `${process.env.NEXT_PUBLIC_API_URL}${item.image}`)
                      : '/placeholder-food.jpg'),
                categoryId: item.categoryId,
                price: item.price
              })),
              categories: storeState.categories,
              apiUrl: process.env.NEXT_PUBLIC_API_URL,
              frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL
            });
          }
        }

        // 2. Business Menu Data (yönetim paneli)
        if (authenticatedRestaurant?.id) {
          try {
            const response = await apiService.getRestaurantMenu(authenticatedRestaurant.id);
            
            setBusinessMenuData({
              restaurant: {
                id: authenticatedRestaurant.id,
                name: authenticatedRestaurant.name,
                username: authenticatedRestaurant.username
              },
              rawApiResponse: response,
              menuItems: response.data?.categories?.flatMap((cat: any) => 
                (cat.items || []).map((item: any) => ({
                  id: item.id,
                  name: item.name,
                  imageUrl: item.imageUrl || item.image,
                  imageSource: item.imageUrl ? 'imageUrl field' : (item.image ? 'image field' : 'no image'),
                  fullImageUrl: item.imageUrl 
                    ? (item.imageUrl.startsWith('http') 
                        ? item.imageUrl 
                        : `https://masapp-backend.onrender.com${item.imageUrl}`)
                    : (item.image 
                        ? (item.image.startsWith('http') 
                            ? item.image 
                            : `https://masapp-backend.onrender.com${item.image}`)
                        : '/placeholder-food.jpg'),
                  categoryId: item.categoryId,
                  price: item.price,
                  rawItem: item
                }))
              ) || [],
              categories: response.data?.categories || [],
              apiUrl: process.env.NEXT_PUBLIC_API_URL,
              apiEndpoint: `/api/restaurants/${authenticatedRestaurant.id}/menu`
            });
          } catch (error) {
            console.error('Business menu fetch error:', error);
            setBusinessMenuData({
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      } catch (error) {
        console.error('Debug data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (subdomain || authenticatedRestaurant) {
      fetchData();
    }
  }, [subdomain, authenticatedRestaurant, fetchRestaurantByUsername, fetchRestaurantMenu]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Menü Veri Kaynakları Debug</h1>
          <p className="text-gray-600">Müşteri menüsü ve yönetim paneli menüsünün veri kaynaklarını gösterir</p>
        </div>

        {/* Customer Menu Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            📱 Müşteri Menüsü (/menu/)
          </h2>
          
          {customerMenuData ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Restoran Bilgileri</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>ID:</strong> {customerMenuData.restaurant.id}</p>
                  <p><strong>Ad:</strong> {customerMenuData.restaurant.name}</p>
                  <p><strong>Username:</strong> {customerMenuData.restaurant.username}</p>
                  <p><strong>Subdomain:</strong> {customerMenuData.restaurant.subdomain}</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Veri Kaynağı</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Store:</strong> useRestaurantStore</p>
                  <p><strong>Method:</strong> fetchRestaurantByUsername() → fetchRestaurantMenu()</p>
                  <p><strong>API Endpoint:</strong> /api/restaurants/:username veya /api/restaurants/:id/menu</p>
                  <p><strong>API URL:</strong> {customerMenuData.apiUrl || 'Not set'}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Ürün Sayısı</h3>
                <p className="text-2xl font-bold">{customerMenuData.menuItems.length} ürün</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Resim Kaynakları</h3>
                <div className="space-y-2 text-sm">
                  {customerMenuData.menuItems.slice(0, 5).map((item: any, index: number) => (
                    <div key={item.id || index} className="bg-white p-3 rounded border">
                      <p><strong>{item.name}</strong></p>
                      <p className="text-xs text-gray-600">Kaynak: {item.imageSource}</p>
                      <p className="text-xs text-gray-600 break-all">URL: {item.fullImageUrl}</p>
                      {item.imageUrl && (
                        <img 
                          src={item.fullImageUrl} 
                          alt={item.name}
                          className="mt-2 w-20 h-20 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-food.jpg';
                            e.currentTarget.alt = 'Image failed to load';
                          }}
                        />
                      )}
                    </div>
                  ))}
                  {customerMenuData.menuItems.length > 5 && (
                    <p className="text-xs text-gray-500">... ve {customerMenuData.menuItems.length - 5} ürün daha</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Resim URL Mantığı</h3>
                <pre className="text-xs bg-white p-3 rounded overflow-x-auto">
{`item.imageUrl 
  ? (item.imageUrl.startsWith('http') 
      ? item.imageUrl 
      : \`\${process.env.NEXT_PUBLIC_API_URL}\${item.imageUrl}\`)
  : (item.image 
      ? (item.image.startsWith('http') 
          ? item.image 
          : \`\${process.env.NEXT_PUBLIC_API_URL}\${item.image}\`)
      : '/placeholder-food.jpg')`}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Müşteri menü verisi yüklenemedi</p>
          )}
        </div>

        {/* Business Menu Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🏢 Yönetim Paneli Menüsü (/business/menu/)
          </h2>
          
          {businessMenuData ? (
            businessMenuData.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800"><strong>Hata:</strong> {businessMenuData.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Restoran Bilgileri</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>ID:</strong> {businessMenuData.restaurant.id}</p>
                    <p><strong>Ad:</strong> {businessMenuData.restaurant.name}</p>
                    <p><strong>Username:</strong> {businessMenuData.restaurant.username}</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Veri Kaynağı</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>API Service:</strong> apiService.getRestaurantMenu()</p>
                    <p><strong>API Endpoint:</strong> {businessMenuData.apiEndpoint}</p>
                    <p><strong>API URL:</strong> {businessMenuData.apiUrl || 'Not set'}</p>
                    <p><strong>Backend URL:</strong> https://masapp-backend.onrender.com</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">Ürün Sayısı</h3>
                  <p className="text-2xl font-bold">{businessMenuData.menuItems.length} ürün</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Resim Kaynakları</h3>
                  <div className="space-y-2 text-sm">
                    {businessMenuData.menuItems.slice(0, 5).map((item: any, index: number) => (
                      <div key={item.id || index} className="bg-white p-3 rounded border">
                        <p><strong>{item.name}</strong></p>
                        <p className="text-xs text-gray-600">Kaynak: {item.imageSource}</p>
                        <p className="text-xs text-gray-600 break-all">URL: {item.fullImageUrl}</p>
                        {item.imageUrl && (
                          <img 
                            src={item.fullImageUrl} 
                            alt={item.name}
                            className="mt-2 w-20 h-20 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-food.jpg';
                              e.currentTarget.alt = 'Image failed to load';
                            }}
                          />
                        )}
                      </div>
                    ))}
                    {businessMenuData.menuItems.length > 5 && (
                      <p className="text-xs text-gray-500">... ve {businessMenuData.menuItems.length - 5} ürün daha</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Resim URL Mantığı</h3>
                  <pre className="text-xs bg-white p-3 rounded overflow-x-auto">
{`(item.imageUrl || item.image)
  ? (item.imageUrl || item.image)?.startsWith('http')
    ? (item.imageUrl || item.image)
    : \`https://masapp-backend.onrender.com\${item.imageUrl || item.image}\`
  : '/placeholder-food.jpg'`}
                  </pre>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-900 mb-2">Ham API Yanıtı</h3>
                  <details>
                    <summary className="cursor-pointer text-sm font-medium">API Response'u göster/gizle</summary>
                    <pre className="text-xs bg-white p-3 rounded mt-2 overflow-x-auto max-h-96 overflow-y-auto">
                      {JSON.stringify(businessMenuData.rawApiResponse, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )
          ) : (
            <p className="text-gray-500">Yönetim paneli menü verisi yüklenemedi (Giriş yapmanız gerekebilir)</p>
          )}
        </div>

        {/* Comparison Section */}
        {customerMenuData && businessMenuData && !businessMenuData.error && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🔄 Karşılaştırma
            </h2>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Ürün Sayısı Karşılaştırması</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Müşteri Menüsü</p>
                    <p className="text-2xl font-bold">{customerMenuData.menuItems.length} ürün</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Yönetim Paneli</p>
                    <p className="text-2xl font-bold">{businessMenuData.menuItems.length} ürün</p>
                  </div>
                </div>
                {customerMenuData.menuItems.length !== businessMenuData.menuItems.length && (
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ Ürün sayıları eşleşmiyor!
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Resim URL Farkları</h3>
                <div className="space-y-2 text-sm">
                  {customerMenuData.menuItems.slice(0, 3).map((customerItem: any, index: number) => {
                    const businessItem = businessMenuData.menuItems.find((bi: any) => bi.id === customerItem.id);
                    if (businessItem) {
                      const urlsMatch = customerItem.fullImageUrl === businessItem.fullImageUrl;
                      return (
                        <div key={customerItem.id || index} className="bg-white p-3 rounded border">
                          <p><strong>{customerItem.name}</strong></p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <p className="text-xs text-gray-600">Müşteri:</p>
                              <p className="text-xs break-all">{customerItem.fullImageUrl}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Yönetim:</p>
                              <p className="text-xs break-all">{businessItem.fullImageUrl}</p>
                            </div>
                          </div>
                          {!urlsMatch && (
                            <p className="text-xs text-red-600 mt-1">⚠️ URL'ler farklı!</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    </div>
  );
}
