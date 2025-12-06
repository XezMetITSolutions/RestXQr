'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaCog, 
  FaSearch, 
  FaFilter, 
  FaEdit,
  FaSave,
  FaSync,
  FaDownload,
  FaUpload,
  FaTrash,
  FaPlus,
  FaUser,
  FaShieldAlt,
  FaDatabase,
  FaServer,
  FaGlobe,
  FaKey,
  FaBell,
  FaLock,
  FaUnlock,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaClock,
  FaChartBar,
  FaCogs,
  FaWrench,
  FaTools
} from 'react-icons/fa';

interface SystemSetting {
  id: string;
  category: 'general' | 'security' | 'email' | 'payment' | 'notification' | 'api';
  key: string;
  name: string;
  description: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'select' | 'password' | 'json';
  options?: Array<{ value: string; label: string }>;
  required: boolean;
  sensitive: boolean;
  lastModified: string;
  modifiedBy: string;
}

interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
  isActive: boolean;
}

export default function SystemManagement() {
  const [activeTab, setActiveTab] = useState('settings');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [settingValue, setSettingValue] = useState<string>('');

  const systemSettings: SystemSetting[] = [
    {
      id: 'site-name',
      category: 'general',
      key: 'SITE_NAME',
      name: 'Site Adı',
      description: 'Web sitesinin genel adı',
      value: 'MasApp Admin Panel',
      type: 'text',
      required: true,
      sensitive: false,
      lastModified: '2024-03-15T10:30:00Z',
      modifiedBy: 'Admin User'
    },
    {
      id: 'site-url',
      category: 'general',
      key: 'SITE_URL',
      name: 'Site URL',
      description: 'Web sitesinin ana URL adresi',
      value: 'https://admin.masapp.com',
      type: 'text',
      required: true,
      sensitive: false,
      lastModified: '2024-03-15T10:30:00Z',
      modifiedBy: 'Admin User'
    },
    {
      id: 'maintenance-mode',
      category: 'general',
      key: 'MAINTENANCE_MODE',
      name: 'Bakım Modu',
      description: 'Sistem bakım modunda mı?',
      value: false,
      type: 'boolean',
      required: false,
      sensitive: false,
      lastModified: '2024-03-15T10:30:00Z',
      modifiedBy: 'Admin User'
    },
    {
      id: 'session-timeout',
      category: 'security',
      key: 'SESSION_TIMEOUT',
      name: 'Oturum Zaman Aşımı',
      description: 'Kullanıcı oturumunun süresi (dakika)',
      value: 30,
      type: 'number',
      required: true,
      sensitive: false,
      lastModified: '2024-03-15T10:30:00Z',
      modifiedBy: 'Admin User'
    },
    {
      id: 'max-login-attempts',
      category: 'security',
      key: 'MAX_LOGIN_ATTEMPTS',
      name: 'Maksimum Giriş Denemesi',
      description: 'Hesap kilitleme öncesi maksimum deneme sayısı',
      value: 5,
      type: 'number',
      required: true,
      sensitive: false,
      lastModified: '2024-03-15T10:30:00Z',
      modifiedBy: 'Admin User'
    },
    {
      id: 'jwt-secret',
      category: 'security',
      key: 'JWT_SECRET',
      name: 'JWT Gizli Anahtarı',
      description: 'JWT token imzalama için kullanılan gizli anahtar',
      value: '••••••••••••••••',
      type: 'password',
      required: true,
      sensitive: true,
      lastModified: '2024-03-15T10:30:00Z',
      modifiedBy: 'Admin User'
    },
    {
      id: 'smtp-host',
      category: 'email',
      key: 'SMTP_HOST',
      name: 'SMTP Sunucu',
      description: 'Email gönderimi için SMTP sunucu adresi',
      value: 'smtp.gmail.com',
      type: 'text',
      required: true,
      sensitive: false,
      lastModified: '2024-03-15T10:30:00Z',
      modifiedBy: 'Admin User'
    },
    {
      id: 'smtp-port',
      category: 'email',
      key: 'SMTP_PORT',
      name: 'SMTP Port',
      description: 'SMTP sunucu port numarası',
      value: 587,
      type: 'number',
      required: true,
      sensitive: false,
      lastModified: '2024-03-15T10:30:00Z',
      modifiedBy: 'Admin User'
    },
    {
      id: 'stripe-secret-key',
      category: 'payment',
      key: 'STRIPE_SECRET_KEY',
      name: 'Stripe Gizli Anahtarı',
      description: 'Stripe ödeme sistemi gizli anahtarı',
      value: '••••••••••••••••',
      type: 'password',
      required: true,
      sensitive: true,
      lastModified: '2024-03-15T10:30:00Z',
      modifiedBy: 'Admin User'
    },
    {
      id: 'notification-enabled',
      category: 'notification',
      key: 'NOTIFICATION_ENABLED',
      name: 'Bildirim Sistemi',
      description: 'Sistem bildirimleri aktif mi?',
      value: true,
      type: 'boolean',
      required: false,
      sensitive: false,
      lastModified: '2024-03-15T10:30:00Z',
      modifiedBy: 'Admin User'
    }
  ];

  const userRoles: UserRole[] = [
    {
      id: 'super-admin',
      name: 'Süper Admin',
      description: 'Tüm sistem yetkilerine sahip kullanıcı',
      permissions: ['all'],
      userCount: 2,
      createdAt: '2024-01-01T00:00:00Z',
      isActive: true
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Sınırlı admin yetkilerine sahip kullanıcı',
      permissions: ['users.read', 'restaurants.read', 'analytics.read'],
      userCount: 5,
      createdAt: '2024-01-01T00:00:00Z',
      isActive: true
    },
    {
      id: 'moderator',
      name: 'Moderatör',
      description: 'İçerik moderasyon yetkilerine sahip kullanıcı',
      permissions: ['restaurants.approve', 'users.approve'],
      userCount: 8,
      createdAt: '2024-01-01T00:00:00Z',
      isActive: true
    },
    {
      id: 'support',
      name: 'Destek',
      description: 'Müşteri destek yetkilerine sahip kullanıcı',
      permissions: ['users.read', 'tickets.read', 'tickets.update'],
      userCount: 12,
      createdAt: '2024-01-01T00:00:00Z',
      isActive: true
    }
  ];

  const getCategoryClass = (category: string) => {
    switch(category) {
      case 'general': return 'bg-blue-100 text-blue-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'email': return 'bg-green-100 text-green-800';
      case 'payment': return 'bg-purple-100 text-purple-800';
      case 'notification': return 'bg-orange-100 text-orange-800';
      case 'api': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch(category) {
      case 'general': return 'Genel';
      case 'security': return 'Güvenlik';
      case 'email': return 'Email';
      case 'payment': return 'Ödeme';
      case 'notification': return 'Bildirim';
      case 'api': return 'API';
      default: return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'general': return <FaCog className="text-blue-600" />;
      case 'security': return <FaShieldAlt className="text-red-600" />;
      case 'email': return <FaGlobe className="text-green-600" />;
      case 'payment': return <FaKey className="text-purple-600" />;
      case 'notification': return <FaBell className="text-orange-600" />;
      case 'api': return <FaServer className="text-gray-600" />;
      default: return <FaCog className="text-gray-600" />;
    }
  };

  const filteredSettings = systemSettings.filter(setting => {
    const matchesSearch = setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || setting.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEditSetting = (setting: SystemSetting) => {
    setEditingSetting(setting.id);
    setSettingValue(setting.value.toString());
  };

  const handleSaveSetting = async (settingId: string) => {
    setIsLoading(true);
    try {
      // Demo: Ayar kaydetme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Setting saved:', settingId, settingValue);
      alert('Ayar başarıyla kaydedildi');
      setEditingSetting(null);
      setSettingValue('');
    } catch (error) {
      console.error('Save setting error:', error);
      alert('Ayar kaydedilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSetting(null);
    setSettingValue('');
  };

  const handleBulkAction = async (action: string) => {
    setIsLoading(true);
    try {
      // Demo: Toplu işlem simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`${action} işlemi başlatıldı`);
      alert(`${action} işlemi tamamlandı`);
    } catch (error) {
      console.error('Bulk action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Sistem Durumu" description="Sistem durumu ve performans metrikleri">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistem Yönetimi</h1>
              <p className="text-gray-600 mt-1">Sistem ayarlarını ve kullanıcı rollerini yönetin</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => handleBulkAction('export')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center"
              >
                <FaDownload className="mr-2" />
                Dışa Aktar
              </button>
              <button 
                onClick={() => handleBulkAction('import')}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg flex items-center"
              >
                <FaUpload className="mr-2" />
                İçe Aktar
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg flex items-center"
              >
                <FaSync className="mr-2" />
                Yenile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaCog className="mr-2" />
                Sistem Ayarları
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaUser className="mr-2" />
                Kullanıcı Rolleri
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'logs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaDatabase className="mr-2" />
                Sistem Logları
              </button>
              <button
                onClick={() => setActiveTab('monitoring')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'monitoring'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaChartBar className="mr-2" />
                Sistem İzleme
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'settings' && (
              <div>
                {/* Filters */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Ayar adı, açıklama veya anahtar..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Tüm Kategoriler</option>
                        <option value="general">Genel</option>
                        <option value="security">Güvenlik</option>
                        <option value="email">Email</option>
                        <option value="payment">Ödeme</option>
                        <option value="notification">Bildirim</option>
                        <option value="api">API</option>
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

                {/* Settings List */}
                <div className="space-y-4">
                  {filteredSettings.map((setting) => (
                    <div key={setting.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex items-center">
                              {getCategoryIcon(setting.category)}
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">{setting.name}</h3>
                              <p className="text-xs text-gray-500">{setting.key}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getCategoryClass(setting.category)}`}>
                              {getCategoryText(setting.category)}
                            </span>
                            {setting.required && (
                              <span className="px-2 py-1 text-xs rounded-full font-medium bg-red-100 text-red-800">
                                Gerekli
                              </span>
                            )}
                            {setting.sensitive && (
                              <span className="px-2 py-1 text-xs rounded-full font-medium bg-yellow-100 text-yellow-800">
                                Hassas
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
                          
                          {editingSetting === setting.id ? (
                            <div className="flex items-center space-x-2">
                              {setting.type === 'boolean' ? (
                                <select
                                  value={settingValue}
                                  onChange={(e) => setSettingValue(e.target.value)}
                                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                                >
                                  <option value="true">Aktif</option>
                                  <option value="false">Pasif</option>
                                </select>
                              ) : setting.type === 'password' ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="password"
                                    value={settingValue}
                                    onChange={(e) => setSettingValue(e.target.value)}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Yeni değer girin"
                                  />
                                  <button className="text-gray-400 hover:text-gray-600">
                                    <FaEye className="text-sm" />
                                  </button>
                                </div>
                              ) : (
                                <input
                                  type={setting.type === 'number' ? 'number' : 'text'}
                                  value={settingValue}
                                  onChange={(e) => setSettingValue(e.target.value)}
                                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="Yeni değer girin"
                                />
                              )}
                              <button
                                onClick={() => handleSaveSetting(setting.id)}
                                disabled={isLoading}
                                className="text-green-600 hover:text-green-800 disabled:opacity-50"
                              >
                                <FaSave className="text-sm" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTimes className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {setting.type === 'password' ? '••••••••••••••••' : setting.value.toString()}
                                </span>
                                {setting.type === 'boolean' && (
                                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                    setting.value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {setting.value ? 'Aktif' : 'Pasif'}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleEditSetting(setting)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <FaEdit className="text-sm" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Son değişiklik: {new Date(setting.lastModified).toLocaleDateString('tr-TR')} - {setting.modifiedBy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'roles' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Kullanıcı Rolleri</h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
                    <FaPlus className="mr-2" />
                    Yeni Rol
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userRoles.map((role) => (
                    <div key={role.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            role.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {role.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-2">Yetkiler:</div>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((permission, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {permission}
                            </span>
                          ))}
                          {role.permissions.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{role.permissions.length - 3} daha
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{role.userCount} kullanıcı</span>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <FaEdit className="text-sm" />
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Sistem Logları</h2>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <FaDatabase className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Sistem logları burada görüntülenecek</p>
                  <p className="text-sm text-gray-400">Log yönetim sistemi entegrasyonu gerekli</p>
                </div>
              </div>
            )}

            {activeTab === 'monitoring' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Sistem İzleme</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <FaServer className="text-green-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sistem Durumu</p>
                        <p className="text-2xl font-bold text-green-600">Çevrimiçi</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <FaDatabase className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Veritabanı</p>
                        <p className="text-2xl font-bold text-blue-600">Aktif</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                        <FaClock className="text-orange-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Yanıt Süresi</p>
                        <p className="text-2xl font-bold text-orange-600">45ms</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <FaChartBar className="text-purple-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">CPU Kullanımı</p>
                        <p className="text-2xl font-bold text-purple-600">23%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
