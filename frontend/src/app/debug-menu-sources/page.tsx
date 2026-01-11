'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useRestaurantStore from '@/store/useRestaurantStore';
import apiService from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { FaEye, FaEyeSlash, FaLock, FaUser, FaArrowRight } from 'react-icons/fa';

export default function DebugMenuSources() {
  const router = useRouter();
  const { authenticatedRestaurant, initializeAuth } = useAuthStore();
  const { currentRestaurant, menuItems, categories, fetchRestaurantByUsername, fetchRestaurantMenu } = useRestaurantStore();
  
  const [customerMenuData, setCustomerMenuData] = useState<any>(null);
  const [businessMenuData, setBusinessMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subdomain, setSubdomain] = useState<string>('');
  const [imageTests, setImageTests] = useState<Record<string, { loading: boolean; success: boolean; error?: string }>>({});
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loginRestaurant } = useAuthStore();

  // Auth state'i başlat
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

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
        // Önce auth state'i kontrol et
        const authState = useAuthStore.getState();
        const currentAuthRestaurant = authState.authenticatedRestaurant || authenticatedRestaurant;
        
        console.log('🔍 Auth check:', {
          authenticatedRestaurant,
          currentAuthRestaurant,
          authState: authState.authenticatedRestaurant
        });
        
        if (currentAuthRestaurant?.id) {
          try {
            const response = await apiService.getRestaurantMenu(currentAuthRestaurant.id);
            
            setBusinessMenuData({
              restaurant: {
                id: currentAuthRestaurant.id,
                name: currentAuthRestaurant.name,
                username: currentAuthRestaurant.username
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
              apiEndpoint: `/api/restaurants/${currentAuthRestaurant.id}/menu`
            });
          } catch (error) {
            console.error('Business menu fetch error:', error);
            setBusinessMenuData({
              error: error instanceof Error ? error.message : 'Unknown error',
              errorDetails: error
            });
          }
        } else {
          setBusinessMenuData({
            error: 'Giriş yapılmamış veya restoran bilgisi bulunamadı',
            needsAuth: true,
            debugInfo: {
              authenticatedRestaurant,
              currentAuthRestaurant,
              authState: authState.authenticatedRestaurant,
              localStorage: typeof window !== 'undefined' ? {
                restaurant: localStorage.getItem('restaurant'),
                auth: localStorage.getItem('auth')
              } : null
            }
          });
        }
      } catch (error) {
        console.error('Debug data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (subdomain || authenticatedRestaurant) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [subdomain, authenticatedRestaurant, fetchRestaurantByUsername, fetchRestaurantMenu]);

  // authenticatedRestaurant değiştiğinde verileri yeniden yükle
  useEffect(() => {
    const loadBusinessData = async () => {
      const authState = useAuthStore.getState();
      const currentAuthRestaurant = authState.authenticatedRestaurant || authenticatedRestaurant;
      
      if (currentAuthRestaurant?.id && (!businessMenuData || businessMenuData.error)) {
        try {
          const response = await apiService.getRestaurantMenu(currentAuthRestaurant.id);
          
          setBusinessMenuData({
            restaurant: {
              id: currentAuthRestaurant.id,
              name: currentAuthRestaurant.name,
              username: currentAuthRestaurant.username
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
            apiEndpoint: `/api/restaurants/${currentAuthRestaurant.id}/menu`
          });
        } catch (error) {
          console.error('Business menu fetch error:', error);
          setBusinessMenuData({
            error: error instanceof Error ? error.message : 'Unknown error',
            errorDetails: error
          });
        }
      }
    };
    
    loadBusinessData();
  }, [authenticatedRestaurant, businessMenuData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const response = await apiService.login({ username: loginUsername, password: loginPassword });

      if (response.success && response.data) {
        console.log('✅ Login başarılı:', response.data);
        loginRestaurant(response.data);
        setShowLoginForm(false);
        setLoginUsername('');
        setLoginPassword('');
        
        // Kısa bir gecikme sonrası verileri yükle (state güncellemesi için)
        setTimeout(() => {
          const authState = useAuthStore.getState();
          console.log('🔄 Auth state after login:', authState.authenticatedRestaurant);
          if (authState.authenticatedRestaurant?.id) {
            // Verileri manuel olarak yükle
            apiService.getRestaurantMenu(authState.authenticatedRestaurant.id)
              .then((menuResponse) => {
                setBusinessMenuData({
                  restaurant: {
                    id: authState.authenticatedRestaurant.id,
                    name: authState.authenticatedRestaurant.name,
                    username: authState.authenticatedRestaurant.username
                  },
                  rawApiResponse: menuResponse,
                  menuItems: menuResponse.data?.categories?.flatMap((cat: any) => 
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
                  categories: menuResponse.data?.categories || [],
                  apiUrl: process.env.NEXT_PUBLIC_API_URL,
                  apiEndpoint: `/api/restaurants/${authState.authenticatedRestaurant.id}/menu`
                }));
              })
              .catch((error) => {
                console.error('Menu fetch error after login:', error);
                setBusinessMenuData({
                  error: error instanceof Error ? error.message : 'Unknown error',
                  errorDetails: error
                });
              });
          }
        }, 500);
      } else {
        setLoginError('Kullanıcı adı veya şifre hatalı');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(error?.message || 'Giriş başarısız');
    } finally {
      setLoginLoading(false);
    }
  };

  // Resim URL'lerini test et
  useEffect(() => {
    if (customerMenuData?.menuItems) {
      const testImages: Record<string, { loading: boolean; success: boolean; error?: string }> = {};
      
      customerMenuData.menuItems.forEach((item: any) => {
        if (item.fullImageUrl && item.fullImageUrl !== '/placeholder-food.jpg') {
          testImages[item.id] = { loading: true, success: false };
          
          const img = new Image();
          img.onload = () => {
            setImageTests(prev => ({
              ...prev,
              [item.id]: { loading: false, success: true }
            }));
          };
          img.onerror = () => {
            setImageTests(prev => ({
              ...prev,
              [item.id]: { loading: false, success: false, error: 'Resim yüklenemedi' }
            }));
          };
          img.src = item.fullImageUrl;
        }
      });
      
      setImageTests(testImages);
    }
  }, [customerMenuData]);

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
                    {customerMenuData.menuItems.slice(0, 10).map((item: any, index: number) => {
                      const imageTest = imageTests[item.id];
                      const isBackendUrl = item.fullImageUrl?.includes('masapp-backend.onrender.com');
                      const isUnsplashUrl = item.fullImageUrl?.includes('unsplash.com');
                      
                      return (
                        <div key={item.id || index} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-start mb-2">
                            <p><strong>{item.name}</strong></p>
                            <div className="flex gap-2">
                              {isBackendUrl && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Backend URL</span>
                              )}
                              {isUnsplashUrl && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Unsplash</span>
                              )}
                              {imageTest && (
                                <span className={`text-xs px-2 py-1 rounded ${
                                  imageTest.loading 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : imageTest.success 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {imageTest.loading ? '⏳ Yükleniyor...' : imageTest.success ? '✅ Yüklendi' : '❌ Hata'}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">Kaynak: {item.imageSource}</p>
                          <p className="text-xs text-gray-600 break-all">URL: {item.fullImageUrl}</p>
                          {item.imageUrl && (
                            <div className="mt-2">
                              <img 
                                src={item.fullImageUrl} 
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded border"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-food.jpg';
                                  e.currentTarget.alt = 'Image failed to load';
                                }}
                              />
                              {isBackendUrl && (
                                <button
                                  onClick={() => window.open(item.fullImageUrl, '_blank')}
                                  className="mt-1 text-xs text-blue-600 hover:underline"
                                >
                                  URL'yi test et →
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {customerMenuData.menuItems.length > 10 && (
                      <p className="text-xs text-gray-500">... ve {customerMenuData.menuItems.length - 10} ürün daha</p>
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
                {businessMenuData.needsAuth && (
                  <div className="mt-3">
                    <p className="text-sm text-red-700 mb-2">Yönetim paneli menüsünü görmek için:</p>
                    {businessMenuData.debugInfo && (
                      <details className="mb-3">
                        <summary className="cursor-pointer text-xs text-gray-600">Debug Bilgileri</summary>
                        <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(businessMenuData.debugInfo, null, 2)}
                        </pre>
                      </details>
                    )}
                    {!showLoginForm ? (
                      <button
                        onClick={() => setShowLoginForm(true)}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        🔐 Burada Giriş Yap
                      </button>
                    ) : (
                      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Giriş Yap</h4>
                        <form onSubmit={handleLogin} className="space-y-3">
                          {loginError && (
                            <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-sm">
                              {loginError}
                            </div>
                          )}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Kullanıcı Adı
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaUser className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                value={loginUsername}
                                onChange={(e) => setLoginUsername(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Kullanıcı adınızı girin"
                                required
                                disabled={loginLoading}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Şifre
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaLock className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type={showPassword ? "text" : "password"}
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                                required
                                disabled={loginLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                              >
                                {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={loginLoading}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loginLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowLoginForm(false);
                                setLoginError('');
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              İptal
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                    <ol className="list-decimal list-inside text-sm text-red-700 space-y-1 mt-3">
                      <li>Yönetim paneline giriş yapın: <a href="/business/login" className="underline" target="_blank">/business/login</a></li>
                      <li>Veya bu sayfayı yönetim panelinden açın</li>
                    </ol>
                  </div>
                )}
                {businessMenuData.errorDetails && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-red-700">Hata detayları</summary>
                    <pre className="text-xs bg-white p-3 rounded mt-2 overflow-x-auto">
                      {JSON.stringify(businessMenuData.errorDetails, null, 2)}
                    </pre>
                  </details>
                )}
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
