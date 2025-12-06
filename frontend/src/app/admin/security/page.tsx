'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaShieldAlt, 
  FaLock, 
  FaKey, 
  FaUserShield, 
  FaEye, 
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaInfoCircle,
  FaClock,
  FaCalendarAlt,
  FaGlobe,
  FaServer,
  FaDatabase,
  FaCog,
  FaEdit,
  FaTrash,
  FaPlus,
  FaDownload,
  FaUpload,
  FaSync,
  FaBan,
  FaCheck,
  FaHistory,
  FaChartLine,
  FaFilter,
  FaSearch
} from 'react-icons/fa';

export default function SecurityManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const securityEvents = [
    {
      id: 1,
      type: 'login_attempt',
      severity: 'medium',
      status: 'blocked',
      description: 'Başarısız giriş denemesi',
      user: 'admin@masapp.com',
      ip: '192.168.1.100',
      location: 'İstanbul, Türkiye',
      timestamp: '2024-03-15 14:30:25',
      details: {
        attempts: 5,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        reason: 'Yanlış şifre'
      }
    },
    {
      id: 2,
      type: 'suspicious_activity',
      severity: 'high',
      status: 'investigating',
      description: 'Şüpheli API kullanımı',
      user: 'user_123',
      ip: '10.0.0.50',
      location: 'Ankara, Türkiye',
      timestamp: '2024-03-15 13:45:10',
      details: {
        requests: 1000,
        timeWindow: '5 dakika',
        endpoint: '/api/restaurants',
        reason: 'Anormal istek sıklığı'
      }
    },
    {
      id: 3,
      type: 'data_access',
      severity: 'low',
      status: 'allowed',
      description: 'Veri erişim isteği',
      user: 'manager@restaurant.com',
      ip: '192.168.1.200',
      location: 'İzmir, Türkiye',
      timestamp: '2024-03-15 12:20:15',
      details: {
        table: 'orders',
        action: 'SELECT',
        records: 50,
        reason: 'Normal işlem'
      }
    },
    {
      id: 4,
      type: 'password_change',
      severity: 'low',
      status: 'completed',
      description: 'Şifre değiştirildi',
      user: 'owner@restaurant.com',
      ip: '192.168.1.150',
      location: 'Bursa, Türkiye',
      timestamp: '2024-03-15 11:15:30',
      details: {
        method: 'self_service',
        strength: 'strong',
        reason: 'Kullanıcı isteği'
      }
    },
    {
      id: 5,
      type: 'system_breach',
      severity: 'critical',
      status: 'investigating',
      description: 'Sistem güvenlik ihlali',
      user: 'unknown',
      ip: '203.0.113.1',
      location: 'Bilinmeyen',
      timestamp: '2024-03-15 10:30:45',
      details: {
        attackType: 'SQL Injection',
        target: 'login.php',
        impact: 'Veri sızıntısı riski',
        reason: 'Güvenlik açığı'
      }
    }
  ];

  const securitySettings = {
    twoFactorAuth: true,
    passwordPolicy: {
      minLength: 8,
      requireSpecial: true,
      requireNumbers: true,
      requireUppercase: true,
      maxAge: 90
    },
    sessionSettings: {
      timeout: 30,
      maxConcurrent: 3,
      rememberMe: true
    },
    ipWhitelist: [
      '192.168.1.0/24',
      '10.0.0.0/8',
      '172.16.0.0/12'
    ],
    rateLimiting: {
      enabled: true,
      maxRequests: 100,
      timeWindow: 15
    },
    encryption: {
      dataAtRest: true,
      dataInTransit: true,
      algorithm: 'AES-256'
    },
    monitoring: {
      enabled: true,
      logLevel: 'high',
      alertThreshold: 5
    }
  };

  const getSeverityClass = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityText = (severity: string) => {
    switch(severity) {
      case 'critical': return 'Kritik';
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return severity;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <FaTimes className="text-red-600" />;
      case 'high': return <FaExclamationTriangle className="text-orange-600" />;
      case 'medium': return <FaInfoCircle className="text-yellow-600" />;
      case 'low': return <FaCheckCircle className="text-green-600" />;
      default: return <FaInfoCircle className="text-gray-600" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'allowed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'blocked': return 'Engellendi';
      case 'investigating': return 'İnceleniyor';
      case 'allowed': return 'İzin Verildi';
      case 'completed': return 'Tamamlandı';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'login_attempt': return <FaKey className="text-blue-600" />;
      case 'suspicious_activity': return <FaExclamationTriangle className="text-orange-600" />;
      case 'data_access': return <FaDatabase className="text-green-600" />;
      case 'password_change': return <FaLock className="text-purple-600" />;
      case 'system_breach': return <FaShieldAlt className="text-red-600" />;
      default: return <FaInfoCircle className="text-gray-600" />;
    }
  };

  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.ip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const securityStats = {
    totalEvents: securityEvents.length,
    criticalEvents: securityEvents.filter(e => e.severity === 'critical').length,
    blockedAttempts: securityEvents.filter(e => e.status === 'blocked').length,
    activeThreats: securityEvents.filter(e => e.status === 'investigating').length,
    lastScan: '2024-03-15 14:30:00',
    securityScore: 85
  };

  return (
    <AdminLayout title="Güvenlik Ayarları" description="Sistem güvenlik ayarları">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Güvenlik Yönetimi</h1>
              <p className="text-gray-600 mt-1">Sistem güvenliğini izle ve yönet</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
                <FaSync className="mr-2" />
                Tarama Başlat
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
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaShieldAlt className="inline mr-2" />
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'events'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaHistory className="inline mr-2" />
              Güvenlik Olayları
            </button>
            <button
              onClick={() => setActiveTab('threats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'threats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaExclamationTriangle className="inline mr-2" />
              Tehditler
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaCog className="inline mr-2" />
              Güvenlik Ayarları
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="px-8 py-6">
          {/* Security Score */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Güvenlik Skoru</h2>
              <span className="text-2xl font-bold text-green-600">{securityStats.securityScore}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full" 
                style={{ width: `${securityStats.securityScore}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Sistem güvenlik durumu iyi seviyede</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <FaHistory className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Toplam Olay</p>
                  <p className="text-2xl font-bold text-gray-900">{securityStats.totalEvents}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <FaTimes className="text-red-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kritik Olay</p>
                  <p className="text-2xl font-bold text-red-600">{securityStats.criticalEvents}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <FaBan className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Engellenen</p>
                  <p className="text-2xl font-bold text-green-600">{securityStats.blockedAttempts}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <FaExclamationTriangle className="text-yellow-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Aktif Tehdit</p>
                  <p className="text-2xl font-bold text-yellow-600">{securityStats.activeThreats}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Güvenlik Durumu</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">İki Faktörlü Kimlik Doğrulama</span>
                  <span className="flex items-center text-green-600">
                    <FaCheckCircle className="mr-1" />
                    Aktif
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">IP Beyaz Liste</span>
                  <span className="flex items-center text-green-600">
                    <FaCheckCircle className="mr-1" />
                    Aktif
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rate Limiting</span>
                  <span className="flex items-center text-green-600">
                    <FaCheckCircle className="mr-1" />
                    Aktif
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Veri Şifreleme</span>
                  <span className="flex items-center text-green-600">
                    <FaCheckCircle className="mr-1" />
                    Aktif
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Tarama</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Son Tarama</span>
                  <span className="text-sm text-gray-900">{securityStats.lastScan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Durum</span>
                  <span className="flex items-center text-green-600">
                    <FaCheckCircle className="mr-1" />
                    Başarılı
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sonraki Tarama</span>
                  <span className="text-sm text-gray-900">2 saat sonra</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Otomatik Tarama</span>
                  <span className="flex items-center text-green-600">
                    <FaCheckCircle className="mr-1" />
                    Aktif
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="px-8 py-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Güvenlik olayı ara..."
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
                  <option value="blocked">Engellendi</option>
                  <option value="investigating">İnceleniyor</option>
                  <option value="allowed">İzin Verildi</option>
                  <option value="completed">Tamamlandı</option>
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

          {/* Events List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Olay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Önem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zaman</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                            {getTypeIcon(event.type)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{event.description}</div>
                            <div className="text-sm text-gray-500">{event.location}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium flex items-center ${getSeverityClass(event.severity)}`}>
                            {getSeverityIcon(event.severity)}
                            <span className="ml-1">{getSeverityText(event.severity)}</span>
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusClass(event.status)}`}>
                          {getStatusText(event.status)}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{event.user}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{event.ip}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaClock className="mr-2 text-gray-400" />
                            {event.timestamp}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800" title="Detayları Görüntüle">
                            <FaEye className="text-sm" />
                          </button>
                          <button className="text-green-600 hover:text-green-800" title="İzin Ver">
                            <FaCheck className="text-sm" />
                          </button>
                          <button className="text-red-600 hover:text-red-800" title="Engelle">
                            <FaBan className="text-sm" />
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

      {/* Threats Tab */}
      {activeTab === 'threats' && (
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Aktif Tehditler</h2>
            <p className="text-gray-600">Tehdit analizi özelliği yakında eklenecek.</p>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Güvenlik Ayarları</h2>
            <p className="text-gray-600">Güvenlik ayarları özelliği yakında eklenecek.</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
