'use client';

import { useState } from 'react';
import { 
  FaRocket, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaDownload,
  FaUpload,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaCalendarAlt,
  FaUsers,
  FaCode,
  FaBug,
  FaStar,
  FaFilter,
  FaSearch,
  FaPlay,
  FaPause,
  FaStop,
  FaHistory,
  FaFileAlt,
  FaCog
} from 'react-icons/fa';

export default function SystemUpdatesManagement() {
  const [activeTab, setActiveTab] = useState('updates');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const updates = [
    {
      id: 1,
      version: 'v2.1.0',
      title: 'Yeni QR Kod Özelliği',
      description: 'QR kod oluşturma ve yönetim özellikleri eklendi. Menü özelleştirme seçenekleri genişletildi.',
      type: 'feature',
      status: 'released',
      releaseDate: '2024-03-15',
      releaseTime: '14:30',
      affectedUsers: 1247,
      downloadCount: 892,
      rating: 4.8,
      priority: 'high',
      size: '15.2 MB',
      changelog: [
        'QR kod oluşturma sistemi eklendi',
        'Menü özelleştirme seçenekleri genişletildi',
        'Performans iyileştirmeleri yapıldı',
        'Güvenlik güncellemeleri eklendi'
      ],
      requirements: {
        minVersion: 'v2.0.0',
        os: 'iOS 12+, Android 8+',
        storage: '50 MB'
      },
      rollbackAvailable: true
    },
    {
      id: 2,
      version: 'v2.0.5',
      title: 'Hata Düzeltmeleri',
      description: 'Sipariş takip sistemindeki hatalar düzeltildi ve performans iyileştirmeleri yapıldı.',
      type: 'bugfix',
      status: 'released',
      releaseDate: '2024-03-10',
      releaseTime: '10:15',
      affectedUsers: 1247,
      downloadCount: 1156,
      rating: 4.6,
      priority: 'medium',
      size: '8.7 MB',
      changelog: [
        'Sipariş takip hatası düzeltildi',
        'Ödeme sistemi iyileştirildi',
        'Bildirim gecikmesi sorunu çözüldü',
        'UI/UX iyileştirmeleri yapıldı'
      ],
      requirements: {
        minVersion: 'v2.0.0',
        os: 'iOS 12+, Android 8+',
        storage: '30 MB'
      },
      rollbackAvailable: true
    },
    {
      id: 3,
      version: 'v2.2.0',
      title: 'AI Destekli Menü Önerileri',
      description: 'Yapay zeka destekli menü önerileri ve müşteri analizi özellikleri eklendi.',
      type: 'feature',
      status: 'beta',
      releaseDate: '2024-03-25',
      releaseTime: '16:00',
      affectedUsers: 50,
      downloadCount: 45,
      rating: 4.9,
      priority: 'high',
      size: '25.8 MB',
      changelog: [
        'AI destekli menü önerileri eklendi',
        'Müşteri analizi dashboard\'u eklendi',
        'Otomatik fiyat önerileri sistemi',
        'Gelişmiş raporlama özellikleri'
      ],
      requirements: {
        minVersion: 'v2.1.0',
        os: 'iOS 13+, Android 9+',
        storage: '100 MB'
      },
      rollbackAvailable: false
    },
    {
      id: 4,
      version: 'v2.0.3',
      title: 'Güvenlik Güncellemesi',
      description: 'Kritik güvenlik açıkları kapatıldı ve veri şifreleme sistemi güçlendirildi.',
      type: 'security',
      status: 'released',
      releaseDate: '2024-02-28',
      releaseTime: '09:00',
      affectedUsers: 1247,
      downloadCount: 1200,
      rating: 4.7,
      priority: 'critical',
      size: '12.3 MB',
      changelog: [
        'Kritik güvenlik açıkları kapatıldı',
        'Veri şifreleme sistemi güçlendirildi',
        'API güvenliği iyileştirildi',
        'Kullanıcı doğrulama sistemi güncellendi'
      ],
      requirements: {
        minVersion: 'v2.0.0',
        os: 'iOS 12+, Android 8+',
        storage: '40 MB'
      },
      rollbackAvailable: true
    },
    {
      id: 5,
      version: 'v2.1.1',
      title: 'Performans İyileştirmeleri',
      description: 'Uygulama performansı optimize edildi ve bellek kullanımı azaltıldı.',
      type: 'performance',
      status: 'scheduled',
      releaseDate: '2024-03-20',
      releaseTime: '02:00',
      affectedUsers: 0,
      downloadCount: 0,
      rating: 0,
      priority: 'medium',
      size: '6.5 MB',
      changelog: [
        'Uygulama performansı optimize edildi',
        'Bellek kullanımı %30 azaltıldı',
        'Yükleme süreleri iyileştirildi',
        'Arka plan işlemleri optimize edildi'
      ],
      requirements: {
        minVersion: 'v2.1.0',
        os: 'iOS 12+, Android 8+',
        storage: '20 MB'
      },
      rollbackAvailable: true
    }
  ];

  const getTypeClass = (type: string) => {
    switch(type) {
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'bugfix': return 'bg-green-100 text-green-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'performance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch(type) {
      case 'feature': return 'Özellik';
      case 'bugfix': return 'Hata Düzeltme';
      case 'security': return 'Güvenlik';
      case 'performance': return 'Performans';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'feature': return <FaStar className="text-blue-600" />;
      case 'bugfix': return <FaBug className="text-green-600" />;
      case 'security': return <FaExclamationTriangle className="text-red-600" />;
      case 'performance': return <FaRocket className="text-purple-600" />;
      default: return <FaCode className="text-gray-600" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'released': return 'bg-green-100 text-green-800';
      case 'beta': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'released': return 'Yayınlandı';
      case 'beta': return 'Beta';
      case 'scheduled': return 'Zamanlandı';
      case 'draft': return 'Taslak';
      default: return status;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch(priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch(priority) {
      case 'critical': return 'Kritik';
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return priority;
    }
  };

  const filteredUpdates = updates.filter(update => {
    const matchesSearch = update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         update.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         update.version.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || update.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistem Güncellemeleri</h1>
              <p className="text-gray-600 mt-1">Uygulama güncellemelerini yönet ve dağıt</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
              <FaPlus className="mr-2" />
              Yeni Güncelleme
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 py-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('updates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'updates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaRocket className="inline mr-2" />
              Güncellemeler
            </button>
            <button
              onClick={() => setActiveTab('deploy')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'deploy'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUpload className="inline mr-2" />
              Dağıtım
            </button>
            <button
              onClick={() => setActiveTab('rollback')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rollback'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaHistory className="inline mr-2" />
              Geri Alma
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaFileAlt className="inline mr-2" />
              Analitik
            </button>
          </nav>
        </div>
      </div>

      {/* Updates List */}
      {activeTab === 'updates' && (
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
                    placeholder="Güncelleme ara..."
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
                  <option value="released">Yayınlandı</option>
                  <option value="beta">Beta</option>
                  <option value="scheduled">Zamanlandı</option>
                  <option value="draft">Taslak</option>
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

          {/* Updates List */}
          <div className="space-y-6">
            {filteredUpdates.map((update) => (
              <div key={update.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getTypeIcon(update.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{update.title}</h3>
                      <p className="text-sm text-gray-500">Versiyon: {update.version}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getTypeClass(update.type)}`}>
                      {getTypeText(update.type)}
                    </span>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusClass(update.status)}`}>
                      {getStatusText(update.status)}
                    </span>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityClass(update.priority)}`}>
                      {getPriorityText(update.priority)}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{update.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaCalendarAlt className="mr-2" />
                    <span>{update.releaseDate} {update.releaseTime}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaUsers className="mr-2" />
                    <span>{update.affectedUsers} kullanıcı</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaDownload className="mr-2" />
                    <span>{update.downloadCount} indirme</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaStar className="mr-2" />
                    <span>{update.rating}/5.0</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Değişiklikler:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {update.changelog.map((change, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Boyut: {update.size}</span>
                    <span>Min. Versiyon: {update.requirements.minVersion}</span>
                    {update.rollbackAvailable && (
                      <span className="text-green-600">Geri alma mevcut</span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <FaEye className="text-sm" />
                    </button>
                    <button className="text-green-600 hover:text-green-800">
                      <FaEdit className="text-sm" />
                    </button>
                    <button className="text-purple-600 hover:text-purple-800">
                      <FaPlay className="text-sm" />
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

      {/* Deploy Tab */}
      {activeTab === 'deploy' && (
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Güncelleme Dağıtımı</h2>
            <p className="text-gray-600">Güncelleme dağıtım özelliği yakında eklenecek.</p>
          </div>
        </div>
      )}

      {/* Rollback Tab */}
      {activeTab === 'rollback' && (
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Geri Alma İşlemleri</h2>
            <p className="text-gray-600">Geri alma özelliği yakında eklenecek.</p>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Güncelleme Analitikleri</h2>
            <p className="text-gray-600">Detaylı analitik raporları yakında eklenecek.</p>
          </div>
        </div>
      )}
    </div>
  );
}
