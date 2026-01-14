'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'request' | 'response';
  message: string;
  data?: any;
}

export default function GarsonCagirDebugPage() {
  const searchParams = useSearchParams();
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [specialMessage, setSpecialMessage] = useState('');
  const [testResults, setTestResults] = useState<{ [key: string]: 'pending' | 'success' | 'error' }>({});
  const [garsonCalls, setGarsonCalls] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

  useEffect(() => {
    setIsClient(true);
    
    // Get data from URL params or localStorage
    const tableFromUrl = searchParams.get('table');
    const restaurantFromUrl = searchParams.get('restaurant');
    
    if (tableFromUrl) {
      setTableNumber(parseInt(tableFromUrl));
    } else if (typeof window !== 'undefined') {
      const storedTable = localStorage.getItem('tableNumber');
      if (storedTable) setTableNumber(parseInt(storedTable));
    }
    
    if (restaurantFromUrl) {
      setRestaurantId(restaurantFromUrl);
    } else if (typeof window !== 'undefined') {
      const storedRestaurant = localStorage.getItem('currentRestaurant');
      if (storedRestaurant) {
        try {
          const parsed = JSON.parse(storedRestaurant);
          setRestaurantId(parsed.id || '');
          setRestaurantName(parsed.name || '');
        } catch (e) {
          console.error('Failed to parse restaurant data');
        }
      }
    }
    
    addLog('info', 'Debug sayfası yüklendi', {
      tableNumber: tableFromUrl || tableNumber,
      restaurantId: restaurantFromUrl || restaurantId,
      restaurantName,
      API_URL
    });
  }, [searchParams]);

  const addLog = (type: LogEntry['type'], message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
    setLogs(prev => [...prev, { timestamp, type, message, data }]);
  };

  const testQuickRequest = async (type: string, label: string) => {
    const testKey = `quick_${type}`;
    setTestResults(prev => ({ ...prev, [testKey]: 'pending' }));
    
    addLog('info', `🚀 Test başlatılıyor: ${label}`);

    if (!restaurantId || !tableNumber) {
      addLog('error', '❌ RestaurantId veya masa numarası eksik', { restaurantId, tableNumber });
      setTestResults(prev => ({ ...prev, [testKey]: 'error' }));
      return;
    }

    const newRequest = {
      restaurantId,
      tableNumber,
      type,
      message: `${label} - Test`,
      timestamp: new Date().toISOString()
    };

    addLog('request', '📤 API İsteği gönderiliyor', {
      url: `${API_URL}/waiter/call`,
      method: 'POST',
      payload: newRequest
    });

    try {
      const response = await fetch(`${API_URL}/waiter/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRequest)
      });

      addLog('response', `📡 Response alındı: ${response.status} ${response.statusText}`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      const data = await response.json();
      addLog('response', '📦 Response data:', data);

      if (data.success) {
        addLog('success', `✅ ${label} başarılı!`, data);
        setTestResults(prev => ({ ...prev, [testKey]: 'success' }));
      } else {
        addLog('error', `❌ API başarısız: ${data.message || 'Bilinmeyen hata'}`, data);
        setTestResults(prev => ({ ...prev, [testKey]: 'error' }));
      }
    } catch (error) {
      addLog('error', `💥 Network hatası: ${(error as Error).message}`, error);
      setTestResults(prev => ({ ...prev, [testKey]: 'error' }));
    }
  };

  const testSpecialMessage = async () => {
    if (!specialMessage.trim()) {
      addLog('error', '❌ Özel mesaj boş olamaz');
      return;
    }

    const testKey = 'special_message';
    setTestResults(prev => ({ ...prev, [testKey]: 'pending' }));
    
    addLog('info', `🚀 Özel mesaj testi başlatılıyor: "${specialMessage}"`);

    if (!restaurantId || !tableNumber) {
      addLog('error', '❌ RestaurantId veya masa numarası eksik', { restaurantId, tableNumber });
      setTestResults(prev => ({ ...prev, [testKey]: 'error' }));
      return;
    }

    const newRequest = {
      restaurantId,
      tableNumber,
      type: 'special',
      message: specialMessage,
      timestamp: new Date().toISOString()
    };

    addLog('request', '📤 Özel mesaj API isteği gönderiliyor', {
      url: `${API_URL}/waiter/call`,
      method: 'POST',
      payload: newRequest
    });

    try {
      const response = await fetch(`${API_URL}/waiter/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRequest)
      });

      addLog('response', `📡 Response alındı: ${response.status} ${response.statusText}`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      const data = await response.json();
      addLog('response', '📦 Response data:', data);

      if (data.success) {
        addLog('success', '✅ Özel mesaj başarılı!', data);
        setTestResults(prev => ({ ...prev, [testKey]: 'success' }));
        setSpecialMessage('');
      } else {
        addLog('error', `❌ API başarısız: ${data.message || 'Bilinmeyen hata'}`, data);
        setTestResults(prev => ({ ...prev, [testKey]: 'error' }));
      }
    } catch (error) {
      addLog('error', `💥 Network hatası: ${(error as Error).message}`, error);
      setTestResults(prev => ({ ...prev, [testKey]: 'error' }));
    }
  };

  const fetchGarsonCalls = async () => {
    addLog('info', '🔍 Garson paneli çağrıları kontrol ediliyor...');
    
    if (!restaurantId) {
      addLog('error', '❌ RestaurantId eksik');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/waiter/calls?restaurantId=${restaurantId}`);
      addLog('response', `📡 Garson calls response: ${response.status}`, {
        status: response.status,
        statusText: response.statusText
      });

      const data = await response.json();
      addLog('response', '📦 Garson calls data:', data);

      if (data.success) {
        setGarsonCalls(data.data || []);
        addLog('success', `✅ ${data.data?.length || 0} adet çağrı bulundu`, data.data);
      } else {
        addLog('error', '❌ Garson calls API başarısız', data);
      }
    } catch (error) {
      addLog('error', `💥 Garson calls fetch hatası: ${(error as Error).message}`, error);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResults({});
    addLog('info', '🧹 Loglar temizlendi');
  };

  const getStatusIcon = (status?: 'pending' | 'success' | 'error') => {
    if (!status) return '⚪';
    if (status === 'pending') return '🔄';
    if (status === 'success') return '✅';
    return '❌';
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'request': return 'text-blue-600 bg-blue-50';
      case 'response': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-red-600 rounded-lg p-6 mb-6 shadow-xl">
          <h1 className="text-3xl font-black mb-2">🔧 GARSON ÇAĞIR DEBUG SAYFASI</h1>
          <p className="text-red-100 text-sm">Tüm garson çağrı fonksiyonlarını test edin ve logları görün</p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-red-700 rounded p-3">
              <div className="text-red-200 text-xs">MASA</div>
              <div className="font-bold text-lg">{tableNumber || 'YOK'}</div>
            </div>
            <div className="bg-red-700 rounded p-3">
              <div className="text-red-200 text-xs">RESTAURANT ID</div>
              <div className="font-bold text-xs">{restaurantId || 'YOK'}</div>
            </div>
            <div className="bg-red-700 rounded p-3">
              <div className="text-red-200 text-xs">RESTAURANT</div>
              <div className="font-bold text-xs">{restaurantName || 'YOK'}</div>
            </div>
            <div className="bg-red-700 rounded p-3">
              <div className="text-red-200 text-xs">API URL</div>
              <div className="font-bold text-xs break-all">{API_URL}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Panel */}
          <div className="space-y-6">
            {/* Quick Requests */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                ⚡ HIZLI İSTEKLER
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => testQuickRequest('water', 'Su Getir')}
                  className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg font-bold transition-all flex items-center justify-between"
                >
                  <span>💧 Su Getir</span>
                  <span className="text-2xl">{getStatusIcon(testResults['quick_water'])}</span>
                </button>
                <button
                  onClick={() => testQuickRequest('bill', 'Hesap İste')}
                  className="bg-green-600 hover:bg-green-700 p-4 rounded-lg font-bold transition-all flex items-center justify-between"
                >
                  <span>💰 Hesap</span>
                  <span className="text-2xl">{getStatusIcon(testResults['quick_bill'])}</span>
                </button>
                <button
                  onClick={() => testQuickRequest('clean', 'Temizlik')}
                  className="bg-yellow-600 hover:bg-yellow-700 p-4 rounded-lg font-bold transition-all flex items-center justify-between"
                >
                  <span>🧹 Temizlik</span>
                  <span className="text-2xl">{getStatusIcon(testResults['quick_clean'])}</span>
                </button>
                <button
                  onClick={() => testQuickRequest('help', 'Yardım')}
                  className="bg-red-600 hover:bg-red-700 p-4 rounded-lg font-bold transition-all flex items-center justify-between"
                >
                  <span>🆘 Yardım</span>
                  <span className="text-2xl">{getStatusIcon(testResults['quick_help'])}</span>
                </button>
              </div>
            </div>

            {/* Special Message */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                💬 ÖZEL MESAJ
                <span className="text-2xl ml-auto">{getStatusIcon(testResults['special_message'])}</span>
              </h2>
              <textarea
                value={specialMessage}
                onChange={(e) => setSpecialMessage(e.target.value)}
                placeholder="Özel mesajınızı buraya yazın..."
                className="w-full p-4 bg-gray-700 text-white rounded-lg mb-3 outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
              <button
                onClick={testSpecialMessage}
                disabled={!specialMessage.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-4 rounded-lg font-bold transition-all"
              >
                📤 ÖZEL MESAJ GÖNDER
              </button>
            </div>

            {/* Garson Panel Check */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4">🎯 GARSON PANELİ DURUMU</h2>
              <button
                onClick={fetchGarsonCalls}
                className="w-full bg-orange-600 hover:bg-orange-700 p-4 rounded-lg font-bold transition-all mb-4"
              >
                🔍 GARSON PANELİNİ KONTROL ET
              </button>
              {garsonCalls.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-green-400 font-bold">✅ {garsonCalls.length} adet çağrı bulundu:</div>
                  {garsonCalls.map((call, idx) => (
                    <div key={idx} className="bg-gray-700 p-3 rounded text-sm">
                      <div><strong>Masa:</strong> {call.tableNumber}</div>
                      <div><strong>Tip:</strong> {call.type}</div>
                      <div><strong>Mesaj:</strong> {call.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-4">
                  Henüz çağrı kontrol edilmedi
                </div>
              )}
            </div>
          </div>

          {/* Logs Panel */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">📋 LOGLAR ({logs.length})</h2>
              <button
                onClick={clearLogs}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-bold text-sm transition-all"
              >
                🧹 TEMİZLE
              </button>
            </div>
            <div className="space-y-2 max-h-[800px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  Henüz log yok. Testlere başlayın!
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${getLogColor(log.type)}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-mono text-xs opacity-70">{log.timestamp}</span>
                      <span className="text-xs font-bold uppercase">{log.type}</span>
                    </div>
                    <div className="font-bold text-sm mb-1">{log.message}</div>
                    {log.data && (
                      <pre className="text-xs bg-black/20 p-2 rounded mt-2 overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-900 border-2 border-yellow-600 rounded-lg p-6 mt-6">
          <h3 className="text-xl font-bold mb-3 text-yellow-300">📖 NASIL KULLANILIR?</h3>
          <ol className="space-y-2 text-yellow-100">
            <li><strong>1.</strong> Hızlı istek butonlarına tıklayın (Su, Hesap, Temizlik, Yardım)</li>
            <li><strong>2.</strong> Özel mesaj yazıp gönderin</li>
            <li><strong>3.</strong> Sağ taraftaki loglarda API isteklerini ve cevaplarını görün</li>
            <li><strong>4.</strong> "Garson Panelini Kontrol Et" ile çağrıların garson paneline ulaşıp ulaşmadığını kontrol edin</li>
            <li><strong>5.</strong> Her butonun yanındaki emoji durumu gösterir: ⚪ Test edilmedi | 🔄 Gönderiliyor | ✅ Başarılı | ❌ Hata</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
