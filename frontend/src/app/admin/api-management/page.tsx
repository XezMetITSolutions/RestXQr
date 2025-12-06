'use client';

import { useState } from 'react';
import { 
  FaCogs, 
  FaKey, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaCalendarAlt,
  FaServer,
  FaDatabase,
  FaGlobe,
  FaShieldAlt,
  FaChartLine,
  FaInfoCircle,
  FaFilter,
  FaSearch,
  FaDownload,
  FaUpload,
  FaSync,
  FaBan,
  FaCheck,
  FaHistory,
  FaCog,
  FaCopy,
  FaQrcode
} from 'react-icons/fa';

export default function APIManagement() {
  const [activeTab, setActiveTab] = useState('keys');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const apiKeys = [
    {
      id: 1,
      name: 'Production API Key',
      key: 'sk_live_51H...',
      status: 'active',
      permissions: ['read', 'write'],
      rateLimit: 1000,
      usedRequests: 45000,
      lastUsed: '2024-03-15 14:30:25',
      createdAt: '2024-01-15 10:00:00',
      expiresAt: '2024-12-31 23:59:59',
      ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
      description: 'Ana üretim API anahtarı',
      environment: 'production'
    },
    {
      id: 2,
      name: 'Development API Key',
      key: 'sk_test_52H...',
      status: 'active',
      permissions: ['read'],
      rateLimit: 100,
      usedRequests: 1250,
      lastUsed: '2024-03-15 12:15:30',
      createdAt: '2024-02-01 09:30:00',
      expiresAt: '2024-06-30 23:59:59',
      ipWhitelist: ['192.168.1.100'],
      description: 'Geliştirme ortamı API anahtarı',
      environment: 'development'
    },
    {
      id: 3,
      name: 'Mobile App Key',
      key: 'sk_mobile_53H...',
      status: 'suspended',
      permissions: ['read'],
      rateLimit: 500,
      usedRequests: 0,
      lastUsed: null,
      createdAt: '2024-02-15 14:20:00',
      expiresAt: '2024-08-15 23:59:59',
      ipWhitelist: [],
      description: 'Mobil uygulama API anahtarı',
      environment: 'production',
      reason: 'Güvenlik ihlali şüphesi'
    },
    {
      id: 4,
      name: 'Webhook Key',
      key: 'sk_webhook_54H...',
      status: 'active',
      permissions: ['webhook'],
      rateLimit: 50,
      usedRequests: 890,
      lastUsed: '2024-03-15 13:45:10',
      createdAt: '2024-03-01 11:00:00',
      expiresAt: '2024-09-01 23:59:59',
      ipWhitelist: ['203.0.113.0/24'],
      description: 'Webhook bildirimleri için API anahtarı',
      environment: 'production'
    }
  ];

  const apiEndpoints = [
    {
      id: 1,
      path: '/api/v1/restaurants',
      method: 'GET',
      status: 'active',
      rateLimit: 100,
      usedRequests: 15000,
      avgResponseTime: 120,
      lastUsed: '2024-03-15 14:30:25',
      description: 'Restoran listesini getir',
      parameters: ['page', 'limit', 'search'],
      authentication: 'required'
    },
    {
      id: 2,
      path: '/api/v1/restaurants/{id}',
      method: 'GET',
      status: 'active',
      rateLimit: 200,
      usedRequests: 8500,
      avgResponseTime: 95,
      lastUsed: '2024-03-15 14:25:10',
      description: 'Belirli restoran bilgilerini getir',
      parameters: ['id'],
      authentication: 'required'
    },
    {
      id: 3,
      path: '/api/v1/orders',
      method: 'POST',
      status: 'active',
      rateLimit: 50,
      usedRequests: 3200,
      avgResponseTime: 250,
      lastUsed: '2024-03-15 14:20:15',
      description: 'Yeni sipariş oluştur',
      parameters: ['restaurant_id', 'items', 'customer_info'],
      authentication: 'required'
    },
    {
      id: 4,
      path: '/api/v1/webhooks',
      method: 'POST',
      status: 'deprecated',
      rateLimit: 20,
      usedRequests: 150,
      avgResponseTime: 180,
      lastUsed: '2024-03-10 16:30:45',
      description: 'Webhook bildirimi gönder (deprecated)',
      parameters: ['event', 'data'],
      authentication: 'required'
    }
  ];

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'deprecated': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'active': return 'Aktif';
      case 'suspended': return 'Askıya Alındı';
      case 'expired': return 'Süresi Dolmuş';
      case 'deprecated': return 'Kullanımdan Kaldırıldı';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active': return <FaCheckCircle className="text-green-600" />;
      case 'suspended': return <FaBan className="text-red-600" />;
      case 'expired': return <FaClock className="text-gray-600" />;
      case 'deprecated': return <FaExclamationTriangle className="text-yellow-600" />;
      default: return <FaInfoCircle className="text-gray-600" />;
    }
  };

  const getMethodClass = (method: string) => {
    switch(method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEnvironmentClass = (environment: string) => {
    switch(environment) {
      case 'production': return 'bg-red-100 text-red-800';
      case 'development': return 'bg-blue-100 text-blue-800';
      case 'staging': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApiKeys = apiKeys.filter(key => {
    const matchesSearch = key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || key.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const apiStats = {
    totalKeys: apiKeys.length,
    activeKeys: apiKeys.filter(k => k.status === 'active').length,
    totalRequests: apiKeys.reduce((sum, key) => sum + key.usedRequests, 0),
    avgResponseTime: 150,
    uptime: 99.9
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">API Yönetimi</h1>
              <p className="text-gray-600 mt-1">API anahtarlarını ve endpoint'leri yönet</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
                <FaPlus className="mr-2" />
                Yeni API Anahtarı
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
                <FaCog className="mr-2" />
                Ayarlar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 py-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('keys')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'keys'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaKey className="inline mr-2" />
              API Anahtarları
            </button>
            <button
              onClick={() => setActiveTab('endpoints')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'endpoints'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaServer className="inline mr-2" />
              Endpoint'ler
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaChartLine className="inline mr-2" />
              Analitik
            </button>
            <button
              onClick={() => setActiveTab('documentation')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documentation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaGlobe className="inline mr-2" />
              Dokümantasyon
            </button>
          </nav>
        </div>
      </div>

      {/* API Keys Tab */}
      {activeTab === 'keys' && (
        <div className="px-8 py-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <FaKey className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Toplam Anahtar</p>
                  <p className="text-2xl font-bold text-gray-900">{apiStats.totalKeys}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <FaCheckCircle className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Aktif Anahtar</p>
                  <p className="text-2xl font-bold text-green-600">{apiStats.activeKeys}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <FaServer className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Toplam İstek</p>
                  <p className="text-2xl font-bold text-gray-900">{apiStats.totalRequests.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <FaClock className="text-orange-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ort. Yanıt Süresi</p>
                  <p className="text-2xl font-bold text-gray-900">{apiStats.avgResponseTime}ms</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="API anahtarı ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="suspended">Askıya Alındı</option>
                  <option value="expired">Süresi Dolmuş</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center">
                  <FaFilter className="mr-2" />
                  Filtrele
                </button>
              </div>
            </div>
          </div>

          {/* API Keys List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anahtar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ortam</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İzinler</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanım</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Kullanım</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                            <FaKey className="text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{key.name}</div>
                            <div className="text-sm text-gray-500 font-mono">{key.key}</div>
                            <div className="text-xs text-gray-400">{key.description}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium flex items-center ${getStatusClass(key.status)}`}>
                            {getStatusIcon(key.status)}
                            <span className="ml-1">{getStatusText(key.status)}</span>
                          </span>
                        </div>
                        {key.reason && (
                          <div className="text-xs text-red-600 mt-1">{key.reason}</div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${getEnvironmentClass(key.environment)}`}>
                          {key.environment}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {key.permissions.map((permission, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {permission}
                            </span>
                          ))}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-gray-900">{key.usedRequests.toLocaleString()}</div>
                          <div className="text-gray-500">Limit: {key.rateLimit}/saat</div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {key.lastUsed ? (
                            <div className="flex items-center">
                              <FaClock className="mr-2 text-gray-400" />
                              {key.lastUsed}
                            </div>
                          ) : (
                            <span className="text-gray-500">Hiç kullanılmadı</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800" title="Detayları Görüntüle">
                            <FaEye className="text-sm" />
                          </button>
                          <button className="text-green-600 hover:text-green-800" title="Düzenle">
                            <FaEdit className="text-sm" />
                          </button>
                          <button className="text-purple-600 hover:text-purple-800" title="Kopyala">
                            <FaCopy className="text-sm" />
                          </button>
                          <button className="text-red-600 hover:text-red-800" title="Sil">
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Endpoints Tab */}
      {activeTab === 'endpoints' && (
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">API Endpoint'leri</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate Limit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanım</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ort. Süre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {apiEndpoints.map((endpoint) => (
                    <tr key={endpoint.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 font-mono">{endpoint.path}</div>
                          <div className="text-sm text-gray-500">{endpoint.description}</div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${getMethodClass(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusClass(endpoint.status)}`}>
                          {getStatusText(endpoint.status)}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{endpoint.rateLimit}/saat</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{endpoint.usedRequests.toLocaleString()}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{endpoint.avgResponseTime}ms</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800" title="Detayları Görüntüle">
                            <FaEye className="text-sm" />
                          </button>
                          <button className="text-green-600 hover:text-green-800" title="Düzenle">
                            <FaEdit className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">API Analitikleri</h2>
            <p className="text-gray-600">Detaylı analitik raporları yakında eklenecek.</p>
          </div>
        </div>
      )}

      {/* Documentation Tab */}
      {activeTab === 'documentation' && (
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">API Dokümantasyonu</h2>
            <p className="text-gray-600">API dokümantasyonu yakında eklenecek.</p>
          </div>
        </div>
      )}
    </div>
  );
}
