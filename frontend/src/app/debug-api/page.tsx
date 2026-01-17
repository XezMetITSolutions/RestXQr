'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaBug,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaPlay,
  FaKey,
  FaServer,
  FaDatabase,
  FaSync,
  FaCode,
  FaInfoCircle,
  FaLink,
  FaGlobe,
  FaUser
} from 'react-icons/fa';

interface ApiResponse {
  success?: boolean;
  data?: any;
  message?: string;
  status: number;
  headers: Record<string, string>;
  responseText: string;
  error?: string;
  duration: number;
}

interface ApiTest {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  response?: ApiResponse;
  status: 'pending' | 'running' | 'success' | 'error';
}

export default function DebugApiPage() {
  const { isAuthenticated, authenticatedRestaurant, logout } = useAuthStore();
  const router = useRouter();
  
  const [hostname, setHostname] = useState<string>('');
  const [subdomain, setSubdomain] = useState<string>('');
  const [staffToken, setStaffToken] = useState<string>('');
  const [restaurantId, setRestaurantId] = useState<string>('');
  
  const [apiUrl, setApiUrl] = useState<string>('https://masapp-backend.onrender.com/api');
  const [apiTests, setApiTests] = useState<ApiTest[]>([]);
  const [customEndpoint, setCustomEndpoint] = useState<string>('');
  const [customMethod, setCustomMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [customBody, setCustomBody] = useState<string>('{}');
  const [customHeaders, setCustomHeaders] = useState<string>('{}');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Initialize environment data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      setHostname(host);
      setSubdomain(host.split('.')[0] || '');
      
      const token = localStorage.getItem('staff_token') || '';
      setStaffToken(token);
      
      const apiUrlFromEnv = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      setApiUrl(apiUrlFromEnv);
    }
  }, []);
  
  // Set restaurant ID when authenticated
  useEffect(() => {
    if (authenticatedRestaurant?.id) {
      setRestaurantId(authenticatedRestaurant.id);
    }
  }, [authenticatedRestaurant]);
  
  // Initialize common API tests
  useEffect(() => {
    if (restaurantId) {
      setApiTests([
        {
          id: 'staff',
          name: 'Staff API',
          endpoint: `/staff/restaurant/${restaurantId}`,
          method: 'GET',
          status: 'pending'
        },
        {
          id: 'permissions',
          name: 'Permissions API',
          endpoint: `/permissions/${restaurantId}`,
          method: 'GET',
          status: 'pending'
        },
        {
          id: 'auth-me',
          name: 'Auth Me API',
          endpoint: '/auth/me',
          method: 'GET',
          status: 'pending'
        },
        {
          id: 'restaurant',
          name: 'Restaurant API',
          endpoint: `/restaurants/${restaurantId}`,
          method: 'GET',
          status: 'pending'
        }
      ]);
    }
  }, [restaurantId]);
  
  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);
  
  // Run API test
  const runApiTest = async (testId: string) => {
    const test = apiTests.find(t => t.id === testId);
    if (!test) return;
    
    setApiTests(prev => prev.map(t => 
      t.id === testId ? { ...t, status: 'running', response: undefined } : t
    ));
    
    try {
      const startTime = performance.now();
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Subdomain': subdomain || 'kroren'
      };
      
      // Add authorization if token exists
      if (staffToken) {
        headers['Authorization'] = `Bearer ${staffToken}`;
      }
      
      // Add custom headers if provided
      if (test.headers) {
        Object.assign(headers, test.headers);
      }
      
      // Prepare request options
      const options: RequestInit = {
        method: test.method,
        headers
      };
      
      // Add body for non-GET requests
      if (test.method !== 'GET' && test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      // Make the request
      const response = await fetch(`${apiUrl}${test.endpoint}`, options);
      const responseText = await response.text();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Parse response as JSON if possible
      let data;
      let success = false;
      let message = '';
      try {
        data = JSON.parse(responseText);
        success = data.success;
        message = data.message || '';
      } catch (e) {
        // Response is not JSON
      }
      
      // Get response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      // Update test with response
      setApiTests(prev => prev.map(t => 
        t.id === testId ? { 
          ...t, 
          status: response.ok ? 'success' : 'error',
          response: {
            success,
            data,
            message,
            status: response.status,
            headers: responseHeaders,
            responseText,
            duration
          }
        } : t
      ));
    } catch (error: any) {
      // Handle fetch error
      setApiTests(prev => prev.map(t => 
        t.id === testId ? { 
          ...t, 
          status: 'error',
          response: {
            status: 0,
            headers: {},
            responseText: '',
            error: error.message || 'Unknown error',
            duration: 0
          }
        } : t
      ));
    }
  };
  
  // Run all API tests
  const runAllTests = () => {
    apiTests.forEach(test => {
      runApiTest(test.id);
    });
  };
  
  // Run custom API test
  const runCustomTest = async () => {
    if (!customEndpoint) return;
    
    setLoading(true);
    
    try {
      // Prepare headers
      let customHeadersObj = {};
      try {
        customHeadersObj = JSON.parse(customHeaders);
      } catch (e) {
        alert('Invalid JSON in custom headers');
        setLoading(false);
        return;
      }
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Subdomain': subdomain || 'kroren',
        ...customHeadersObj
      };
      
      // Add authorization if token exists
      if (staffToken) {
        headers['Authorization'] = `Bearer ${staffToken}`;
      }
      
      // Prepare request options
      const options: RequestInit = {
        method: customMethod,
        headers
      };
      
      // Add body for non-GET requests
      if (customMethod !== 'GET' && customBody) {
        try {
          const bodyObj = JSON.parse(customBody);
          options.body = JSON.stringify(bodyObj);
        } catch (e) {
          alert('Invalid JSON in request body');
          setLoading(false);
          return;
        }
      }
      
      const startTime = performance.now();
      
      // Make the request
      const endpoint = customEndpoint.startsWith('/') ? customEndpoint : `/${customEndpoint}`;
      const response = await fetch(`${apiUrl}${endpoint}`, options);
      const responseText = await response.text();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Parse response as JSON if possible
      let data;
      let success = false;
      let message = '';
      try {
        data = JSON.parse(responseText);
        success = data.success;
        message = data.message || '';
      } catch (e) {
        // Response is not JSON
      }
      
      // Get response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      // Add custom test to list
      const newTest: ApiTest = {
        id: `custom-${Date.now()}`,
        name: `Custom: ${endpoint}`,
        endpoint,
        method: customMethod,
        body: customBody !== '{}' ? JSON.parse(customBody) : undefined,
        headers: customHeadersObj,
        status: response.ok ? 'success' : 'error',
        response: {
          success,
          data,
          message,
          status: response.status,
          headers: responseHeaders,
          responseText,
          duration
        }
      };
      
      setApiTests(prev => [newTest, ...prev]);
      
      // Reset custom inputs
      setCustomEndpoint('');
      setCustomMethod('GET');
      setCustomBody('{}');
      setCustomHeaders('{}');
    } catch (error: any) {
      alert(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Format JSON for display
  const formatJson = (json: any): string => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return String(json);
    }
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-200 text-gray-800';
      case 'running': return 'bg-blue-200 text-blue-800';
      case 'success': return 'bg-green-200 text-green-800';
      case 'error': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };
  
  // Get HTTP status code color
  const getHttpStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-yellow-600';
    if (status >= 400 && status < 500) return 'text-orange-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <FaBug className="h-8 w-8 text-red-500" />
                <span className="ml-2 text-xl font-bold">API Debug</span>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/business" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <button
                onClick={() => { logout(); router.push('/login'); }}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Environment Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaInfoCircle className="mr-2" />
            Environment Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500 mb-1 flex items-center">
                <FaGlobe className="mr-1" /> Hostname
              </div>
              <div className="font-medium break-all">{hostname}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500 mb-1 flex items-center">
                <FaLink className="mr-1" /> Subdomain
              </div>
              <div className="font-medium">{subdomain || '(none)'}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500 mb-1 flex items-center">
                <FaServer className="mr-1" /> API URL
              </div>
              <div className="font-medium break-all">{apiUrl}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500 mb-1 flex items-center">
                <FaDatabase className="mr-1" /> Restaurant ID
              </div>
              <div className="font-medium break-all">{restaurantId || '(not set)'}</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500 mb-1 flex items-center">
                <FaKey className="mr-1" /> Staff Token
              </div>
              <div className="font-medium break-all">
                {staffToken ? (
                  <div className="flex items-center">
                    <span className="mr-2">{staffToken.substring(0, 20)}...</span>
                    <span className="text-green-600 text-xs bg-green-100 px-2 py-0.5 rounded">
                      <FaCheck className="inline mr-1" /> Token Present
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="mr-2">No token found</span>
                    <span className="text-red-600 text-xs bg-red-100 px-2 py-0.5 rounded">
                      <FaTimes className="inline mr-1" /> Missing Token
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Custom API Request */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaCode className="mr-2" />
            Custom API Request
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select
                value={customMethod}
                onChange={(e) => setCustomMethod(e.target.value as any)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  {apiUrl}
                </span>
                <input
                  type="text"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  placeholder="/endpoint/path"
                  className="flex-1 border border-gray-300 rounded-r-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Request Body (JSON)</label>
              <textarea
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                rows={5}
                className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Headers (JSON)</label>
              <textarea
                value={customHeaders}
                onChange={(e) => setCustomHeaders(e.target.value)}
                rows={5}
                className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={runCustomTest}
              disabled={loading || !customEndpoint}
              className={`flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading || !customEndpoint ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <FaSync className="animate-spin mr-2" />
                  Running...
                </>
              ) : (
                <>
                  <FaPlay className="mr-2" />
                  Send Request
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Common API Tests */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FaServer className="mr-2" />
              Common API Tests
            </h2>
            
            <button
              onClick={runAllTests}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <FaPlay className="mr-2" />
              Run All Tests
            </button>
          </div>
          
          <div className="space-y-4">
            {apiTests.map(test => (
              <div key={test.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="font-medium">{test.name}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getStatusColor(test.status)}`}>
                      {test.status === 'pending' && 'Pending'}
                      {test.status === 'running' && 'Running...'}
                      {test.status === 'success' && 'Success'}
                      {test.status === 'error' && 'Error'}
                    </span>
                    {test.response && (
                      <span className={`ml-2 text-xs font-medium ${getHttpStatusColor(test.response.status)}`}>
                        HTTP {test.response.status}
                      </span>
                    )}
                    {test.response && (
                      <span className="ml-2 text-xs text-gray-500">
                        {Math.round(test.response.duration)}ms
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">
                      {test.method} {test.endpoint}
                    </span>
                    <button
                      onClick={() => runApiTest(test.id)}
                      className="flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FaPlay className="mr-1" />
                      Run
                    </button>
                  </div>
                </div>
                
                {test.response && (
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">Response:</span>
                    </div>
                    <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-auto text-xs max-h-64">
                      {formatJson(test.response.data || test.response.responseText)}
                    </pre>
                    
                    {test.response.error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                        <FaExclamationTriangle className="inline-block mr-1" />
                        Error: {test.response.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
