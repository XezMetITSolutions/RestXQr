'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaCog, 
  FaSave, 
  FaUndo, 
  FaShieldAlt, 
  FaServer, 
  FaDatabase, 
  FaGlobe, 
  FaBell, 
  FaCreditCard, 
  FaPlus
} from 'react-icons/fa';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // Genel Ayarlar
    siteName: 'MASAPP',
    siteDescription: 'Restoran Yönetim Sistemi',
    defaultLanguage: 'tr',
    timezone: 'Europe/Istanbul',
    currency: 'TRY',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    
    // Güvenlik Ayarları
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorAuth: true,
    ipWhitelist: false,
    
    // API Ayarları
    apiRateLimit: 1000,
    apiTimeout: 30,
    apiVersion: 'v1',
    corsEnabled: true,
    apiKeyRequired: true,
    
    // Bildirim Ayarları
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationEmail: 'noreply@masapp.com',
    smsProvider: 'twilio',
    
    // Ödeme Ayarları
    paymentProvider: 'stripe',
    commissionRate: 5.0,
    taxRate: 18.0,
    currencySymbol: '₺',
    paymentTimeout: 15,
    
    // Sistem Ayarları
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
    backupFrequency: 'daily',
    maxBackupFiles: 30,
    cacheEnabled: true,
    cacheTimeout: 3600
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Ayarlar kaydediliyor:', settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setHasChanges(false);
  };

  const tabs = [
    { id: 'general', name: 'Genel', icon: FaCog },
    { id: 'security', name: 'Güvenlik', icon: FaShieldAlt },
    { id: 'api', name: 'API', icon: FaServer },
    { id: 'notifications', name: 'Bildirimler', icon: FaBell },
    { id: 'payments', name: 'Ödemeler', icon: FaCreditCard },
    { id: 'system', name: 'Sistem', icon: FaDatabase },
    { id: 'domains', name: 'Domain Yönetimi', icon: FaGlobe }
  ];

  return (
    <AdminLayout title="Sistem Ayarları" description="Sistem genel ayarları">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistem Ayarları</h1>
              <p className="text-gray-600 mt-1">Sistem konfigürasyonunu yönet</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center"
              >
                <FaUndo className="mr-2" />
                Sıfırla
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  hasChanges
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FaSave className="mr-2" />
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 py-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Domain Management */}
      {activeTab === 'domains' && (
        <div className="px-8 py-6">
          <div className="space-y-6">
            {/* Domain Configuration */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Domain Konfigürasyonu</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ana Domain</label>
                  <input
                    type="text"
                    value="guzellestir.com"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Tüm subdomainler bu domain üzerinden çalışır</p>
                </div>
                
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Base URL</label>
                  <input
                    type="text"
                    value="https://api.guzellestir.com"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Backend API adresi (Vercel)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frontend Base URL</label>
                  <input
                    type="text"
                    value="https://guzellestir.com"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Frontend adresi (Netlify)</p>
                </div>
              </div>
            </div>

            {/* Subdomain Management */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Subdomain Yönetimi</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
                  <FaPlus className="mr-2" />
                  Yeni Subdomain
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Demo subdomains */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900">kardesler.guzellestir.com</h3>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Aktif</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Kardeşler Restoran - İstanbul</p>
                      <p className="text-sm text-gray-500 mt-1">Oluşturulma: 15 Mart 2024</p>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900">pizza-palace.guzellestir.com</h3>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Beklemede</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Pizza Palace - İzmir</p>
                      <p className="text-sm text-gray-500 mt-1">Oluşturulma: 20 Mart 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DNS Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">DNS Ayarları</h2>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div>
                      <h3 className="font-medium text-blue-900">Otomatik DNS Yönetimi</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Yeni subdomainler otomatik olarak DNS kayıtlarına eklenir. 
                        DNS propagasyonu genellikle 5-15 dakika sürer.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">DNS Sağlayıcı</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="cloudflare">Cloudflare</option>
                      <option value="route53">AWS Route 53</option>
                      <option value="godaddy">GoDaddy</option>
                      <option value="namecheap">Namecheap</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">TTL (Time To Live)</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="300">5 dakika</option>
                      <option value="1800">30 dakika</option>
                      <option value="3600">1 saat</option>
                      <option value="86400">24 saat</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other tabs content would go here */}
      {activeTab !== 'domains' && (
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {tabs.find(tab => tab.id === activeTab)?.name} Ayarları
            </h2>
            <p className="text-gray-600">Bu sekme henüz geliştirilme aşamasında.</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}