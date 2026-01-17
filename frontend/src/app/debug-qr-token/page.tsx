'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaQrcode, FaCheck, FaTimes, FaRedo, FaShoppingCart, FaCreditCard, FaHistory } from 'react-icons/fa';
import QRCode from 'qrcode.react';

type TokenStatus = 'active' | 'completed' | 'expired';

interface TokenInfo {
  id: string;
  token: string;
  tableNumber: number;
  restaurantId: string;
  createdAt: string;
  status: TokenStatus;
  isActive: boolean;
  renewed: boolean;
}

export default function DebugQRTokenPage() {
  // State variables
  const [hostname, setHostname] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [token, setToken] = useState<string>('');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false);
  const [orderCompleted, setOrderCompleted] = useState<boolean>(false);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  const [tokenHistory, setTokenHistory] = useState<TokenInfo[]>([]);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';
    return base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;
  }, []);

  // Initialize component
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const sd = host.split('.')[0] || '';
      setHostname(host);
      setSubdomain(sd);
      
      // Get stored token if exists
      try {
        const storedToken = sessionStorage.getItem('qr_token') || sessionStorage.getItem('qr-session-token') || '';
        if (storedToken) {
          setToken(storedToken);
          verifyToken(storedToken);
        }
      } catch (e) {
        console.error('Error retrieving stored token:', e);
      }
      
      // Get restaurant ID
      fetchRestaurantId(sd).then(id => {
        if (id) setRestaurantId(id);
      });
    }
  }, []);

  // Generate QR code URL
  useEffect(() => {
    if (token && hostname) {
      const url = `https://${hostname}/menu/?t=${token}&table=${tableNumber}`;
      setQrUrl(url);
    }
  }, [token, tableNumber, hostname]);

  // Verify token
  const verifyToken = async (tokenToVerify: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!tokenToVerify) {
        setError('Token boş olamaz');
        setLoading(false);
        return;
      }
      
      console.log(`Verifying token: ${tokenToVerify}`);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      
      const res = await fetch(`${API_URL}/qr/verify/${tokenToVerify}`, {
        headers: { 
          'X-Subdomain': subdomain || 'hazal'
        }
      });
      
      const data = await safeJson(res);
      console.log('Token verification response:', data);
      
      if (res.ok) {
        if (data.success && data.data?.isActive) {
          // Token is valid and active
          const tokenData = data.data;
          setTokenInfo({
            id: tokenData.id || '',
            token: tokenToVerify,
            tableNumber: tokenData.tableNumber || tableNumber,
            restaurantId: tokenData.restaurantId || restaurantId,
            createdAt: tokenData.createdAt || new Date().toISOString(),
            status: tokenData.status || 'active',
            isActive: true,
            renewed: tokenData.renewed || false
          });
          
          setAccessDenied(false);
          
          // Update token history
          setTokenHistory(prev => {
            // Check if token already exists in history
            const exists = prev.some(t => t.token === tokenToVerify);
            if (!exists) {
              return [...prev, {
                id: tokenData.id || '',
                token: tokenToVerify,
                tableNumber: tokenData.tableNumber || tableNumber,
                restaurantId: tokenData.restaurantId || restaurantId,
                createdAt: tokenData.createdAt || new Date().toISOString(),
                status: tokenData.status || 'active',
                isActive: true,
                renewed: tokenData.renewed || false
              }];
            }
            return prev;
          });
        } else {
          // Token exists but is not active (completed or expired)
          const tokenData = data.data || {};
          const status = tokenData.status || 'expired';
          
          setTokenInfo({
            id: tokenData.id || '',
            token: tokenToVerify,
            tableNumber: tokenData.tableNumber || tableNumber,
            restaurantId: tokenData.restaurantId || restaurantId,
            createdAt: tokenData.createdAt || new Date().toISOString(),
            status: status,
            isActive: false,
            renewed: tokenData.renewed || false
          });
          
          setAccessDenied(true);
          setError(`Bu token artık geçerli değil. Durum: ${status === 'completed' ? 'Tamamlandı' : 'Süresi doldu'}`);
          
          // Update token history if it exists
          setTokenHistory(prev => {
            return prev.map(t => {
              if (t.token === tokenToVerify) {
                return {
                  ...t,
                  status: status,
                  isActive: false
                };
              }
              return t;
            });
          });
        }
      } else {
        // API error
        setError(data.message || 'Token doğrulanamadı');
        setAccessDenied(true);
        setTokenInfo(null);
      }
    } catch (e: any) {
      console.error('Token verification error:', e);
      setError(e?.message || 'Token doğrulama hatası');
      setAccessDenied(true);
      setTokenInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // Generate new token
  const generateToken = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!restaurantId) {
        const id = await fetchRestaurantId(subdomain);
        if (!id) {
          setError('Restaurant bulunamadı');
          setLoading(false);
          return;
        }
        setRestaurantId(id);
      }
      
      const res = await fetch(`${API_URL}/qr/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'X-Subdomain': subdomain || 'hazal' 
        },
        body: JSON.stringify({ 
          restaurantId, 
          tableNumber, 
          duration: 24 
        })
      });
      
      const data = await safeJson(res);
      
      if (res.ok && data.success && data.data?.token) {
        const newToken = data.data.token;
        setToken(newToken);
        sessionStorage.setItem('qr-session-token', newToken);
        
        // Verify the new token to get its info
        await verifyToken(newToken);
        
        // Reset order status
        setOrderPlaced(false);
        setOrderCompleted(false);
        setAccessDenied(false);
      } else {
        setError(data.message || 'Token oluşturulamadı');
      }
    } catch (e: any) {
      setError(e?.message || 'Token oluşturma hatası');
    } finally {
      setLoading(false);
    }
  };

  // Simulate placing an order
  const placeOrder = () => {
    if (!tokenInfo || !tokenInfo.isActive) {
      setError('Aktif token olmadan sipariş verilemez');
      return;
    }
    
    setOrderPlaced(true);
    setError(null);
    
    // Update token info
    setTokenInfo(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'active'
      };
    });
  };

  // Complete an order and deactivate the token
  const completeOrder = async () => {
    if (!tokenInfo) {
      setError('Token bilgisi bulunamadı');
      return;
    }
    
    if (!orderPlaced) {
      setError('Önce sipariş verilmelidir');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call the API to deactivate the token
      console.log(`Deactivating token: ${token}`);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      
      // First, deactivate the token on the backend
      const deactivateResponse = await fetch(`${API_URL}/qr/deactivate/${token}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'X-Subdomain': subdomain || 'hazal'
        }
      });
      
      const deactivateData = await safeJson(deactivateResponse);
      console.log('Token deactivation response:', deactivateData);
      
      if (!deactivateResponse.ok) {
        throw new Error(`Token deaktif edilemedi: ${deactivateData.message || 'API hatası'}`);
      }
      
      // Verify the token is now invalid
      const verifyResponse = await fetch(`${API_URL}/qr/verify/${token}`);
      const verifyData = await safeJson(verifyResponse);
      console.log('Token verification after deactivation:', verifyData);
      
      // Update token info based on verification response
      const isStillActive = verifyData.success && verifyData.data?.isActive;
      
      setTokenInfo(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'completed',
          isActive: isStillActive // Should be false if deactivation worked
        };
      });
      
      setOrderCompleted(true);
      setAccessDenied(!isStillActive);
      
      if (isStillActive) {
        console.warn('Token is still active after deactivation attempt!');
        setError('Token deaktif edildi ancak hala aktif görünüyor. Lütfen tekrar deneyin.');
      }
      
      // Update token history
      setTokenHistory(prev => {
        return prev.map(t => {
          if (t.token === token) {
            return {
              ...t,
              status: 'completed',
              isActive: isStillActive
            };
          }
          return t;
        });
      });
    } catch (e: any) {
      setError(e?.message || 'Ödeme işlemi hatası');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('tr-TR')} ${date.toLocaleTimeString('tr-TR')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-3xl font-bold text-gray-800">🧪 QR Token Debug Sayfası</h1>
          <p className="text-gray-600 mt-2">
            Bu sayfa, QR tabanlı masa sipariş sisteminin token yönetimini test etmek için kullanılır.
          </p>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="font-semibold">Hostname:</span> {hostname || '-'}
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="font-semibold">Subdomain:</span> {subdomain || '-'}
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="font-semibold">Restaurant ID:</span> {restaurantId || '-'}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - QR and Token Generation */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Masa QR Kodu</h2>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Masa No:</label>
                  <input 
                    type="number" 
                    value={tableNumber} 
                    onChange={e => setTableNumber(parseInt(e.target.value) || 1)}
                    className="w-full border rounded-md px-3 py-2"
                    min="1"
                  />
                </div>
                
                <button 
                  onClick={generateToken}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  <FaQrcode />
                  <span>QR Kod Oluştur</span>
                </button>
              </div>
              
              {qrUrl && (
                <div className="flex flex-col items-center p-4 border rounded-lg bg-gray-50">
                  <QRCode value={qrUrl} size={200} />
                  <div className="mt-4 text-sm text-gray-600 break-all">
                    <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {qrUrl}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Token Doğrulama</h2>
              
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={token} 
                  onChange={e => setToken(e.target.value)}
                  placeholder="Token değeri"
                  className="flex-1 border rounded-md px-3 py-2"
                />
                
                <button 
                  onClick={() => verifyToken(token)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  disabled={loading || !token}
                >
                  Doğrula
                </button>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Token Info and Actions */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Token Bilgileri</h2>
              
              {tokenInfo ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="block text-xs text-gray-500">Masa ID:</span>
                      <span className="font-medium">masa_{tokenInfo.tableNumber}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="block text-xs text-gray-500">Token:</span>
                      <span className="font-medium text-sm break-all">{tokenInfo.token.substring(0, 16)}...</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="block text-xs text-gray-500">Oluşturulma Zamanı:</span>
                      <span className="font-medium">{formatDate(tokenInfo.createdAt)}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="block text-xs text-gray-500">Token Durumu:</span>
                      <span className={`font-medium ${
                        tokenInfo.status === 'active' ? 'text-green-600' : 
                        tokenInfo.status === 'completed' ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {tokenInfo.status === 'active' ? 'Aktif' : 
                         tokenInfo.status === 'completed' ? 'Tamamlandı' : 'Süresi Doldu'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="block text-xs text-gray-500">Erişim Durumu:</span>
                      <div className="flex items-center gap-1">
                        {tokenInfo.isActive ? (
                          <>
                            <FaCheck className="text-green-500" />
                            <span className="font-medium text-green-600">Erişim İzni Var</span>
                          </>
                        ) : (
                          <>
                            <FaTimes className="text-red-500" />
                            <span className="font-medium text-red-600">Erişim Engellendi</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="block text-xs text-gray-500">Token Yenilendi Mi?</span>
                      <div className="flex items-center gap-1">
                        {tokenInfo.renewed ? (
                          <>
                            <FaCheck className="text-green-500" />
                            <span className="font-medium text-green-600">Evet</span>
                          </>
                        ) : (
                          <>
                            <FaTimes className="text-red-500" />
                            <span className="font-medium text-red-600">Hayır</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="block text-xs text-gray-500">Sipariş Durumu:</span>
                    <div className="flex items-center gap-1">
                      {orderCompleted ? (
                        <>
                          <FaCheck className="text-blue-500" />
                          <span className="font-medium text-blue-600">Tamamlandı</span>
                        </>
                      ) : orderPlaced ? (
                        <>
                          <FaShoppingCart className="text-orange-500" />
                          <span className="font-medium text-orange-600">Sipariş Verildi</span>
                        </>
                      ) : (
                        <>
                          <FaTimes className="text-gray-500" />
                          <span className="font-medium text-gray-600">Sipariş Yok</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                  Token bilgisi yok. Lütfen bir token oluşturun veya doğrulayın.
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sipariş İşlemleri</h2>
              
              {accessDenied ? (
                <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
                  <FaTimes className="text-red-500 text-4xl mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-red-700">Bu oturum sona ermiştir</h3>
                  <p className="text-red-600 mt-2">
                    Bu token ile artık işlem yapamazsınız. Yeni bir QR kodu oluşturun.
                  </p>
                  <button 
                    onClick={generateToken}
                    className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <FaRedo />
                    <span>Yeni QR Kod Oluştur</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={placeOrder}
                    disabled={loading || !tokenInfo || !tokenInfo.isActive || orderPlaced}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md text-white ${
                      !tokenInfo || !tokenInfo.isActive || orderPlaced 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    <FaShoppingCart />
                    <span>Sipariş Ver</span>
                  </button>
                  
                  <button 
                    onClick={completeOrder}
                    disabled={loading || !tokenInfo || !tokenInfo.isActive || !orderPlaced || orderCompleted}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md text-white ${
                      !tokenInfo || !tokenInfo.isActive || !orderPlaced || orderCompleted
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <FaCreditCard />
                    <span>Ödeme Yap / Siparişi Tamamla</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Token History */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaHistory />
            <span>Token Geçmişi</span>
          </h2>
          
          {tokenHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Masa</th>
                    <th className="px-4 py-2 text-left">Token</th>
                    <th className="px-4 py-2 text-left">Oluşturulma Zamanı</th>
                    <th className="px-4 py-2 text-left">Durum</th>
                    <th className="px-4 py-2 text-left">Aktif</th>
                    <th className="px-4 py-2 text-left">Yenilendi</th>
                  </tr>
                </thead>
                <tbody>
                  {tokenHistory.map((t, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-2">masa_{t.tableNumber}</td>
                      <td className="px-4 py-2 font-mono text-xs">{t.token.substring(0, 8)}...</td>
                      <td className="px-4 py-2">{formatDate(t.createdAt)}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          t.status === 'active' ? 'bg-green-100 text-green-800' : 
                          t.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {t.status === 'active' ? 'Aktif' : 
                           t.status === 'completed' ? 'Tamamlandı' : 'Süresi Doldu'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {t.isActive ? (
                          <FaCheck className="text-green-500" />
                        ) : (
                          <FaTimes className="text-red-500" />
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {t.renewed ? (
                          <FaCheck className="text-green-500" />
                        ) : (
                          <FaTimes className="text-red-500" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
              Henüz token geçmişi yok.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

async function safeJson(res: Response) {
  try { 
    return await res.json(); 
  } catch { 
    return { note: 'non-json response', status: res.status }; 
  }
}

async function fetchRestaurantId(subdomain: string): Promise<string | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';
    const API = base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;
    const res = await fetch(`${API}/staff/restaurants`);
    const data = await res.json();
    const r = data?.data?.find((x: any) => x.username === subdomain);
    return r?.id || null;
  } catch { 
    return null; 
  }
}
