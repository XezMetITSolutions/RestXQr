'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
  FaBug,
  FaServer,
  FaUsers,
  FaKey,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSync,
  FaClipboard,
  FaLock,
  FaUnlock,
  FaDatabase,
  FaNetworkWired,
  FaTerminal
} from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

const DebugApiContent = () => {
  const router = useRouter();
  const { isAuthenticated, authenticatedRestaurant, logout } = useAuthStore();
  
  // State for API testing
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [staffToken, setStaffToken] = useState<string>('');
  const [subdomain, setSubdomain] = useState<string>('');
  const [hostname, setHostname] = useState<string>('');
  
  // Test results
  const [staffApiResult, setStaffApiResult] = useState<any>(null);
  const [staffApiError, setStaffApiError] = useState<string | null>(null);
  const [staffApiStatus, setStaffApiStatus] = useState<number | null>(null);
  
  const [permissionsApiResult, setPermissionsApiResult] = useState<any>(null);
  const [permissionsApiError, setPermissionsApiError] = useState<string | null>(null);
  const [permissionsApiStatus, setPermissionsApiStatus] = useState<number | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [customHeaders, setCustomHeaders] = useState<{[key: string]: string}>({});
  const [customEndpoint, setCustomEndpoint] = useState<string>('');
  const [customMethod, setCustomMethod] = useState<string>('GET');
  const [customBody, setCustomBody] = useState<string>('');
  const [customResult, setCustomResult] = useState<any>(null);
  const [customError, setCustomError] = useState<string | null>(null);
  const [customStatus, setCustomStatus] = useState<number | null>(null);

  // Initialize data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      setHostname(hostname);
      setSubdomain(hostname.split('.')[0] || 'kroren');
      
      const token = localStorage.getItem('staff_token');
      if (token) {
        setStaffToken(token);
      }
      
      if (authenticatedRestaurant?.id) {
        setRestaurantId(authenticatedRestaurant.id);
      }
    }
  }, [authenticatedRestaurant]);

  // Test Staff API
  const testStaffApi = async () => {
    if (!restaurantId) {
      setStaffApiError('Restaurant ID is required');
      return;
    }
    
    setLoading(true);
    setStaffApiResult(null);
    setStaffApiError(null);
    setStaffApiStatus(null);
    
    try {
      console.log(`Testing Staff API for restaurant: ${restaurantId}`);
      console.log(`Using token: ${staffToken ? 'Present' : 'Missing'}`);
      console.log(`Using subdomain: ${subdomain}`);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Subdomain': subdomain
      };
      
      if (staffToken) {
        headers['Authorization'] = `Bearer ${staffToken}`;
      }
      
      const response = await fetch(`${API_URL}/staff/restaurant/${restaurantId}`, {
        method: 'GET',
        headers
      });
      
      setStaffApiStatus(response.status);
      
      const data = await response.json();
      console.log('Staff API Response:', data);
      
      setStaffApiResult(data);
      
      if (!response.ok) {
        setStaffApiError(`API Error: ${response.status} - ${data.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Staff API Error:', error);
      setStaffApiError(error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  // Test Permissions API
  const testPermissionsApi = async () => {
    if (!restaurantId) {
      setPermissionsApiError('Restaurant ID is required');
      return;
    }
    
    setLoading(true);
    setPermissionsApiResult(null);
    setPermissionsApiError(null);
    setPermissionsApiStatus(null);
    
    try {
      console.log(`Testing Permissions API for restaurant: ${restaurantId}`);
      console.log(`Using token: ${staffToken ? 'Present' : 'Missing'}`);
      console.log(`Using subdomain: ${subdomain}`);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Subdomain': subdomain
      };
      
      if (staffToken) {
        headers['Authorization'] = `Bearer ${staffToken}`;
      }
      
      const response = await fetch(`${API_URL}/permissions/${restaurantId}`, {
        method: 'GET',
        headers
      });
      
      setPermissionsApiStatus(response.status);
      
      const data = await response.json();
      console.log('Permissions API Response:', data);
      
      setPermissionsApiResult(data);
      
      if (!response.ok) {
        setPermissionsApiError(`API Error: ${response.status} - ${data.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Permissions API Error:', error);
      setPermissionsApiError(error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  // Test Custom API
  const testCustomApi = async () => {
    if (!customEndpoint) {
      setCustomError('Endpoint is required');
      return;
    }
    
    setLoading(true);
    setCustomResult(null);
    setCustomError(null);
    setCustomStatus(null);
    
    try {
      console.log(`Testing Custom API: ${customEndpoint}`);
      console.log(`Method: ${customMethod}`);
      console.log(`Headers:`, customHeaders);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Subdomain': subdomain
      };
      
      if (staffToken) {
        headers['Authorization'] = `Bearer ${staffToken}`;
      }
      
      // Add custom headers
      Object.keys(customHeaders).forEach(key => {
        headers[key] = customHeaders[key];
      });
      
      const options: RequestInit = {
        method: customMethod,
        headers
      };
      
      // Add body for non-GET requests
      if (customMethod !== 'GET' && customBody) {
        try {
          options.body = customBody;
        } catch (e) {
          setCustomError('Invalid JSON in body');
          setLoading(false);
          return;
        }
      }
      
      const fullUrl = customEndpoint.startsWith('http') 
        ? customEndpoint 
        : `${API_URL}${customEndpoint.startsWith('/') ? customEndpoint : '/' + customEndpoint}`;
      
      const response = await fetch(fullUrl, options);
      
      setCustomStatus(response.status);
      
      const data = await response.json();
      console.log('Custom API Response:', data);
      
      setCustomResult(data);
      
      if (!response.ok) {
        setCustomError(`API Error: ${response.status} - ${data.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Custom API Error:', error);
      setCustomError(error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  // Add custom header
  const addCustomHeader = () => {
    setCustomHeaders({
      ...customHeaders,
      '': ''
    });
  };
  
  // Update custom header
  const updateCustomHeader = (oldKey: string, newKey: string, value: string) => {
    const newHeaders = { ...customHeaders };
    if (oldKey !== newKey) {
      delete newHeaders[oldKey];
    }
    newHeaders[newKey] = value;
    setCustomHeaders(newHeaders);
  };
  
  // Remove custom header
  const removeCustomHeader = (key: string) => {
    const newHeaders = { ...customHeaders };
    delete newHeaders[key];
    setCustomHeaders(newHeaders);
  };
  
  // Format JSON for display
  const formatJson = (json: any) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return 'Invalid JSON';
    }
  };
  
  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white p-6 rounded-xl shadow-md mb-6">
          <div className="flex items-center gap-3">
            <FaBug className="text-3xl text-red-500" />
            <h1 className="text-3xl font-bold text-gray-800">API Debug Sayfası</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Bu sayfa, API isteklerini test etmek ve hata ayıklamak için kullanılır.
          </p>
        </header>
        
        {/* Environment Info */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaServer className="text-blue-500" />
            Ortam Bilgileri
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">API URL:</div>
              <div className="font-medium">{API_URL}</div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Hostname:</div>
              <div className="font-medium">{hostname}</div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Subdomain:</div>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  className="flex-1 border rounded px-3 py-1"
                />
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Restaurant ID:</div>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                  className="flex-1 border rounded px-3 py-1"
                  placeholder="Restaurant ID"
                />
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg col-span-1 md:col-span-2">
              <div className="text-sm text-gray-500">Staff Token:</div>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={staffToken}
                  onChange={(e) => setStaffToken(e.target.value)}
                  className="flex-1 border rounded px-3 py-1"
                  placeholder="Bearer Token"
                />
                <button 
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const token = localStorage.getItem('staff_token');
                      if (token) setStaffToken(token);
                    }
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Load from Storage
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Staff API Test */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaUsers className="text-green-500" />
            Staff API Test
          </h2>
          
          <div className="mb-4">
            <button 
              onClick={testStaffApi}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
            >
              {loading ? <FaSync className="animate-spin" /> : <FaServer />}
              Test Staff API
            </button>
          </div>
          
          {staffApiStatus !== null && (
            <div className={`p-4 rounded-lg mb-4 ${
              staffApiStatus >= 200 && staffApiStatus < 300 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">Status:</div>
                <div className={`px-2 py-1 rounded text-white ${
                  staffApiStatus >= 200 && staffApiStatus < 300 ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {staffApiStatus}
                </div>
                <div className="text-sm">
                  {staffApiStatus >= 200 && staffApiStatus < 300 ? 'Success' : 'Error'}
                </div>
              </div>
            </div>
          )}
          
          {staffApiError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="flex items-start gap-2">
                <FaExclamationTriangle className="text-red-500 mt-1" />
                <div className="text-red-700">{staffApiError}</div>
              </div>
            </div>
          )}
          
          {staffApiResult && (
            <div className="relative">
              <div className="absolute top-2 right-2">
                <button 
                  onClick={() => copyToClipboard(formatJson(staffApiResult))}
                  className="bg-gray-200 p-2 rounded hover:bg-gray-300"
                  title="Copy to clipboard"
                >
                  <FaClipboard />
                </button>
              </div>
              <pre className="p-4 bg-gray-800 text-green-400 rounded-lg overflow-auto max-h-96 text-sm">
                {formatJson(staffApiResult)}
              </pre>
            </div>
          )}
        </div>
        
        {/* Permissions API Test */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaKey className="text-purple-500" />
            Permissions API Test
          </h2>
          
          <div className="mb-4">
            <button 
              onClick={testPermissionsApi}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center gap-2"
            >
              {loading ? <FaSync className="animate-spin" /> : <FaServer />}
              Test Permissions API
            </button>
          </div>
          
          {permissionsApiStatus !== null && (
            <div className={`p-4 rounded-lg mb-4 ${
              permissionsApiStatus >= 200 && permissionsApiStatus < 300 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">Status:</div>
                <div className={`px-2 py-1 rounded text-white ${
                  permissionsApiStatus >= 200 && permissionsApiStatus < 300 ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {permissionsApiStatus}
                </div>
                <div className="text-sm">
                  {permissionsApiStatus >= 200 && permissionsApiStatus < 300 ? 'Success' : 'Error'}
                </div>
              </div>
            </div>
          )}
          
          {permissionsApiError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="flex items-start gap-2">
                <FaExclamationTriangle className="text-red-500 mt-1" />
                <div className="text-red-700">{permissionsApiError}</div>
              </div>
            </div>
          )}
          
          {permissionsApiResult && (
            <div className="relative">
              <div className="absolute top-2 right-2">
                <button 
                  onClick={() => copyToClipboard(formatJson(permissionsApiResult))}
                  className="bg-gray-200 p-2 rounded hover:bg-gray-300"
                  title="Copy to clipboard"
                >
                  <FaClipboard />
                </button>
              </div>
              <pre className="p-4 bg-gray-800 text-green-400 rounded-lg overflow-auto max-h-96 text-sm">
                {formatJson(permissionsApiResult)}
              </pre>
            </div>
          )}
        </div>
        
        {/* Custom API Test */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaTerminal className="text-gray-700" />
            Custom API Test
          </h2>
          
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint:</label>
                <input 
                  type="text" 
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="/endpoint or full URL"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Method:</label>
                <select
                  value={customMethod}
                  onChange={(e) => setCustomMethod(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Headers:</label>
              {Object.keys(customHeaders).map((key, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input 
                    type="text" 
                    value={key}
                    onChange={(e) => updateCustomHeader(key, e.target.value, customHeaders[key])}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Header name"
                  />
                  <input 
                    type="text" 
                    value={customHeaders[key]}
                    onChange={(e) => updateCustomHeader(key, key, e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Header value"
                  />
                  <button 
                    onClick={() => removeCustomHeader(key)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              <button 
                onClick={addCustomHeader}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm"
              >
                Add Header
              </button>
            </div>
            
            {customMethod !== 'GET' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Body:</label>
                <textarea 
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full border rounded px-3 py-2 font-mono"
                  rows={5}
                  placeholder="JSON body"
                />
              </div>
            )}
            
            <div>
              <button 
                onClick={testCustomApi}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
              >
                {loading ? <FaSync className="animate-spin" /> : <FaServer />}
                Send Request
              </button>
            </div>
          </div>
          
          {customStatus !== null && (
            <div className={`p-4 rounded-lg mb-4 ${
              customStatus >= 200 && customStatus < 300 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">Status:</div>
                <div className={`px-2 py-1 rounded text-white ${
                  customStatus >= 200 && customStatus < 300 ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {customStatus}
                </div>
                <div className="text-sm">
                  {customStatus >= 200 && customStatus < 300 ? 'Success' : 'Error'}
                </div>
              </div>
            </div>
          )}
          
          {customError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="flex items-start gap-2">
                <FaExclamationTriangle className="text-red-500 mt-1" />
                <div className="text-red-700">{customError}</div>
              </div>
            </div>
          )}
          
          {customResult && (
            <div className="relative">
              <div className="absolute top-2 right-2">
                <button 
                  onClick={() => copyToClipboard(formatJson(customResult))}
                  className="bg-gray-200 p-2 rounded hover:bg-gray-300"
                  title="Copy to clipboard"
                >
                  <FaClipboard />
                </button>
              </div>
              <pre className="p-4 bg-gray-800 text-green-400 rounded-lg overflow-auto max-h-96 text-sm">
                {formatJson(customResult)}
              </pre>
            </div>
          )}
        </div>
        
        {/* Authentication Debug */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaLock className="text-yellow-500" />
            Authentication Debug
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Token Status:</div>
              <div className="flex items-center gap-2 mt-1">
                {staffToken ? (
                  <>
                    <FaCheck className="text-green-500" />
                    <span className="font-medium">Token is present</span>
                  </>
                ) : (
                  <>
                    <FaTimes className="text-red-500" />
                    <span className="font-medium">No token found</span>
                  </>
                )}
              </div>
            </div>
            
            {staffToken && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Token Analysis:</div>
                <div className="mt-2">
                  <div className="font-medium">Token Format:</div>
                  <div className="text-sm mt-1">
                    {staffToken.startsWith('ey') ? (
                      <div className="flex items-center gap-2">
                        <FaCheck className="text-green-500" />
                        <span>Valid JWT format</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FaTimes className="text-red-500" />
                        <span>Not a valid JWT format</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="font-medium">Token Length:</div>
                  <div className="text-sm mt-1">
                    {staffToken.length} characters
                    {staffToken.length < 100 && (
                      <div className="flex items-center gap-2 mt-1">
                        <FaExclamationTriangle className="text-yellow-500" />
                        <span>Token seems too short</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Authentication Header:</div>
              <div className="font-mono text-sm mt-1 break-all">
                {`Authorization: Bearer ${staffToken || '[NO TOKEN]'}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugApiContent;
