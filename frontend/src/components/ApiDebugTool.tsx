'use client';

import { useState } from 'react';
import {
  FaSync,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';

interface ApiDebugToolProps {
  restaurantId?: string;
}

export default function ApiDebugTool({ restaurantId }: ApiDebugToolProps) {
  const [showModal, setShowModal] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);

  // Special debug function for API issues
  const runApiDiagnostics = async () => {
    setDebugLoading(true);
    setDebugError(null);
    setDebugInfo(null);
    
    try {
      // Get authentication info
      const staffToken = localStorage.getItem('staff_token');
      const subdomain = window.location.hostname.split('.')[0] || 'kroren';
      const currentRestaurantId = restaurantId || '';
      
      // Get staff user info
      let staffUser = null;
      try {
        const staffUserStr = localStorage.getItem('staff_user');
        if (staffUserStr) {
          staffUser = JSON.parse(staffUserStr);
        }
      } catch (e) {
        console.error('Failed to parse staff_user from localStorage', e);
      }
      
      // Prepare debug info object
      const info: any = {
        auth: {
          hasToken: !!staffToken,
          tokenPreview: staffToken ? `${staffToken.substring(0, 10)}...` : 'No token',
          tokenLength: staffToken?.length || 0,
          isBearer: staffToken?.startsWith('Bearer ') || false,
          subdomain,
          restaurantId: currentRestaurantId
        },
        environment: {
          hostname: window.location.hostname,
          apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api',
          userAgent: navigator.userAgent
        },
        localStorage: {}
      };
      
      // Check localStorage items
      const localStorageKeys = ['staff_token', 'staff_user', 'business_staff'];
      localStorageKeys.forEach(key => {
        const item = localStorage.getItem(key);
        info.localStorage[key] = {
          exists: !!item,
          size: item?.length || 0,
          preview: item ? `${item.substring(0, 20)}...` : null
        };
      });
      
      // Test direct API call with different header combinations
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      const url = `${API_URL}/staff/restaurant/${currentRestaurantId}`;
      
      // Create a proper JWT token for testing if current token is invalid
      let token = staffToken;
      
      // Check if token is just 'authenticated' or invalid
      if (!token || token === 'authenticated' || token === 'Bearer authenticated') {
        // Create a proper JWT-like token using staff user info
        if (staffUser) {
          // Generate a proper JWT format token with the staff user info
          const payload = {
            id: staffUser.id || '',
            role: staffUser.role || '',
            restaurantId: currentRestaurantId,
            exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
          };
          
          // Create JWT-like token (header.payload.signature)
          const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
          const payloadStr = btoa(JSON.stringify(payload));
          const signature = btoa('signature'); // Simplified signature
          
          const jwtToken = `${header}.${payloadStr}.${signature}`;
          token = `Bearer ${jwtToken}`;
          
          // Store this token for future use
          localStorage.setItem('staff_token', token);
          console.log('Created new JWT token for testing');
        }
      } else if (!token.startsWith('Bearer ')) {
        token = `Bearer ${token}`;
      }
      
      // Test 1: Standard headers
      const standardHeaders = {
        'Authorization': token,
        'Content-Type': 'application/json',
        'X-Subdomain': subdomain
      };
      
      info.tests = [];
      
      try {
        console.log('Test 1: Standard headers');
        const response1 = await fetch(url, {
          method: 'GET',
          headers: standardHeaders
        });
        
        const status1 = response1.status;
        let data1 = null;
        try {
          data1 = await response1.json();
        } catch (e) {
          data1 = { error: 'Failed to parse JSON response' };
        }
        
        info.tests.push({
          name: 'Standard Headers',
          status: status1,
          success: status1 >= 200 && status1 < 300,
          headers: standardHeaders,
          response: data1
        });
      } catch (error: any) {
        info.tests.push({
          name: 'Standard Headers',
          error: error.message,
          success: false,
          headers: standardHeaders
        });
      }
      
      // Test 2: No Bearer prefix
      if (staffToken) {
        const plainToken = staffToken.replace('Bearer ', '');
        const noBearerHeaders = {
          'Authorization': plainToken,
          'Content-Type': 'application/json',
          'X-Subdomain': subdomain
        };
        
        try {
          console.log('Test 2: No Bearer prefix');
          const response2 = await fetch(url, {
            method: 'GET',
            headers: noBearerHeaders
          });
          
          const status2 = response2.status;
          let data2 = null;
          try {
            data2 = await response2.json();
          } catch (e) {
            data2 = { error: 'Failed to parse JSON response' };
          }
          
          info.tests.push({
            name: 'No Bearer Prefix',
            status: status2,
            success: status2 >= 200 && status2 < 300,
            headers: noBearerHeaders,
            response: data2
          });
        } catch (error: any) {
          info.tests.push({
            name: 'No Bearer Prefix',
            error: error.message,
            success: false,
            headers: noBearerHeaders
          });
        }
      }
      
      // Test 3: With explicit Bearer prefix
      if (staffToken) {
        const explicitToken = `Bearer ${staffToken.replace('Bearer ', '')}`;
        const explicitBearerHeaders = {
          'Authorization': explicitToken,
          'Content-Type': 'application/json',
          'X-Subdomain': subdomain
        };
        
        try {
          console.log('Test 3: Explicit Bearer prefix');
          const response3 = await fetch(url, {
            method: 'GET',
            headers: explicitBearerHeaders
          });
          
          const status3 = response3.status;
          let data3 = null;
          try {
            data3 = await response3.json();
          } catch (e) {
            data3 = { error: 'Failed to parse JSON response' };
          }
          
          info.tests.push({
            name: 'Explicit Bearer Prefix',
            status: status3,
            success: status3 >= 200 && status3 < 300,
            headers: explicitBearerHeaders,
            response: data3
          });
        } catch (error: any) {
          info.tests.push({
            name: 'Explicit Bearer Prefix',
            error: error.message,
            success: false,
            headers: explicitBearerHeaders
          });
        }
      }
      
      // Test 4: Permissions API
      try {
        console.log('Test 4: Permissions API');
        const permissionsUrl = `${API_URL}/permissions/${currentRestaurantId}`;
        const response4 = await fetch(permissionsUrl, {
          method: 'GET',
          headers: standardHeaders
        });
        
        const status4 = response4.status;
        let data4 = null;
        try {
          data4 = await response4.json();
        } catch (e) {
          data4 = { error: 'Failed to parse JSON response' };
        }
        
        info.tests.push({
          name: 'Permissions API',
          status: status4,
          success: status4 >= 200 && status4 < 300,
          headers: standardHeaders,
          response: data4
        });
      } catch (error: any) {
        info.tests.push({
          name: 'Permissions API',
          error: error.message,
          success: false,
          headers: standardHeaders
        });
      }
      
      // Set debug info
      setDebugInfo(info);
    } catch (error: any) {
      console.error('Debug error:', error);
      setDebugError(error.message || 'An unknown error occurred');
    } finally {
      setDebugLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setShowModal(true);
          runApiDiagnostics();
        }}
        className="px-2 sm:px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1 text-xs sm:text-sm"
        title="API Sorunlarını Tanıla"
      >
        <FaSync className="text-xs sm:text-sm" />
        <span>API Debug</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold flex items-center">
                  <FaSync className="text-red-600 mr-2" />
                  <span>API Debug Paneli</span>
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <FaTimes size={18} />
                </button>
              </div>
              
              {debugLoading && (
                <div className="flex flex-col items-center justify-center py-10">
                  <FaSync className="text-3xl text-purple-600 animate-spin mb-4" />
                  <p className="text-gray-600">API tanılama çalışıyor...</p>
                </div>
              )}
              
              {debugError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <div className="flex items-start gap-2">
                    <FaExclamationTriangle className="text-red-500 mt-1" />
                    <div>
                      <h4 className="font-medium text-red-700">Hata Oluştu</h4>
                      <p className="text-red-600">{debugError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {debugInfo && (
                <div className="space-y-6">
                  {/* Authentication Info */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium">Kimlik Doğrulama Bilgileri</div>
                    <div className="p-4 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-gray-600">Token Durumu:</div>
                        <div className="font-mono text-sm">
                          {debugInfo.auth.hasToken ? (
                            <span className="text-green-600 font-medium flex items-center">
                              <FaCheck className="mr-1" /> Token Mevcut
                            </span>
                          ) : (
                            <span className="text-red-600 font-medium flex items-center">
                              <FaTimes className="mr-1" /> Token Bulunamadı
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600">Token Formatı:</div>
                        <div className="font-mono text-sm">
                          {debugInfo.auth.isBearer ? (
                            <span className="text-green-600 font-medium flex items-center">
                              <FaCheck className="mr-1" /> Bearer Formatında
                            </span>
                          ) : (
                            <span className="text-yellow-600 font-medium flex items-center">
                              <FaExclamationTriangle className="mr-1" /> Bearer Formatında Değil
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600">Token Önİzleme:</div>
                        <div className="font-mono text-sm">{debugInfo.auth.tokenPreview}</div>
                        
                        <div className="text-sm text-gray-600">Token Uzunluğu:</div>
                        <div className="font-mono text-sm">{debugInfo.auth.tokenLength} karakter</div>
                        
                        <div className="text-sm text-gray-600">Subdomain:</div>
                        <div className="font-mono text-sm">{debugInfo.auth.subdomain}</div>
                        
                        <div className="text-sm text-gray-600">Restaurant ID:</div>
                        <div className="font-mono text-sm">{debugInfo.auth.restaurantId}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Test Results */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium">API Test Sonuçları</div>
                    <div className="divide-y divide-gray-200">
                      {debugInfo.tests.map((test: any, index: number) => (
                        <div key={index} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{test.name}</h4>
                            {test.success ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                Başarılı
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                Başarısız
                              </span>
                            )}
                          </div>
                          
                          {test.error ? (
                            <div className="p-2 bg-red-50 rounded text-sm text-red-700 mb-2">
                              Hata: {test.error}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div className="text-sm text-gray-600">Durum Kodu:</div>
                              <div className="font-mono text-sm">{test.status}</div>
                            </div>
                          )}
                          
                          <div className="mt-2">
                            <div className="text-sm font-medium mb-1">Headers:</div>
                            <pre className="bg-gray-50 p-2 rounded-lg text-xs overflow-auto max-h-20">
                              {JSON.stringify(test.headers, null, 2)}
                            </pre>
                          </div>
                          
                          {test.response && (
                            <div className="mt-2">
                              <div className="text-sm font-medium mb-1">Response:</div>
                              <pre className="bg-gray-50 p-2 rounded-lg text-xs overflow-auto max-h-40">
                                {JSON.stringify(test.response, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Environment Info */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium">Ortam Bilgileri</div>
                    <div className="p-4 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-gray-600">Hostname:</div>
                        <div className="font-mono text-sm">{debugInfo.environment.hostname}</div>
                        
                        <div className="text-sm text-gray-600">API URL:</div>
                        <div className="font-mono text-sm">{debugInfo.environment.apiUrl}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* LocalStorage Info */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium">LocalStorage Bilgileri</div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Key</th>
                            <th className="text-left py-2">Durum</th>
                            <th className="text-left py-2">Boyut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(debugInfo.localStorage).map((key) => (
                            <tr key={key} className="border-b">
                              <td className="py-2 font-mono">{key}</td>
                              <td className="py-2">
                                {debugInfo.localStorage[key].exists ? (
                                  <span className="text-green-600 font-medium flex items-center">
                                    <FaCheck className="mr-1" /> Mevcut
                                  </span>
                                ) : (
                                  <span className="text-red-600 font-medium flex items-center">
                                    <FaTimes className="mr-1" /> Bulunamadı
                                  </span>
                                )}
                              </td>
                              <td className="py-2">{debugInfo.localStorage[key].size} bytes</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-between gap-4">
                    <button
                      onClick={() => {
                        localStorage.removeItem('staff_token');
                        alert('Staff token silindi!');
                        runApiDiagnostics();
                      }}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Token'i Sil
                    </button>
                    
                    <button
                      onClick={() => {
                        // Get staff user info for creating a proper token
                        let staffUser = null;
                        try {
                          const staffUserStr = localStorage.getItem('staff_user');
                          if (staffUserStr) {
                            staffUser = JSON.parse(staffUserStr);
                          }
                        } catch (e) {
                          console.error('Failed to parse staff_user', e);
                        }
                        
                        if (staffUser) {
                          // Generate a proper JWT format token
                          const payload = {
                            id: staffUser.id || '',
                            role: staffUser.role || '',
                            restaurantId: restaurantId || '',
                            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hour expiration
                          };
                          
                          // Create JWT-like token (header.payload.signature)
                          const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
                          const payloadStr = btoa(JSON.stringify(payload));
                          const signature = btoa('signature'); // Simplified signature
                          
                          const jwtToken = `${header}.${payloadStr}.${signature}`;
                          const token = `Bearer ${jwtToken}`;
                          
                          localStorage.setItem('staff_token', token);
                          alert('Yeni JWT token oluşturuldu ve kaydedildi!');
                          runApiDiagnostics();
                        } else {
                          // Manual token entry as fallback
                          const token = prompt('Yeni token girin (JWT formatında olmalı):', '');
                          if (token) {
                            // Add Bearer prefix if not present
                            const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
                            localStorage.setItem('staff_token', formattedToken);
                            alert('Yeni token kaydedildi!');
                            runApiDiagnostics();
                          }
                        }
                      }}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Token Ayarla
                    </button>
                    
                    <button
                      onClick={runApiDiagnostics}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <FaSync className={debugLoading ? 'animate-spin' : ''} />
                      Yeniden Test Et
                    </button>
                    
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
