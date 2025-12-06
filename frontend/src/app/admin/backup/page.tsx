'use client';

import { useState } from 'react';
import { 
  FaDatabase, 
  FaDownload, 
  FaUpload, 
  FaTrash, 
  FaPlay, 
  FaPause, 
  FaStop,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaCalendarAlt,
  FaFileAlt,
  FaCog,
  FaSync,
  FaHistory,
  FaCloud,
  FaHdd,
  FaServer,
  FaShieldAlt,
  FaEye,
  FaEdit,
  FaPlus,
  FaFilter,
  FaSearch
} from 'react-icons/fa';

export default function BackupManagement() {
  const [activeTab, setActiveTab] = useState('backups');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const backups = [
    {
      id: 1,
      name: 'Full Backup 2024-03-15',
      type: 'full',
      status: 'completed',
      size: '2.5 GB',
      createdAt: '2024-03-15 02:00:00',
      completedAt: '2024-03-15 02:45:00',
      duration: '45 dakika',
      location: 'local',
      path: '/backups/full_2024_03_15.tar.gz',
      tables: 45,
      records: 1250000,
      compression: 'gzip',
      encryption: true,
      checksum: 'a1b2c3d4e5f6...',
      retention: '30 gün',
      nextBackup: '2024-03-16 02:00:00'
    },
    {
      id: 2,
      name: 'Incremental Backup 2024-03-14',
      type: 'incremental',
      status: 'completed',
      size: '150 MB',
      createdAt: '2024-03-14 02:00:00',
      completedAt: '2024-03-14 02:15:00',
      duration: '15 dakika',
      location: 'local',
      path: '/backups/inc_2024_03_14.tar.gz',
      tables: 12,
      records: 45000,
      compression: 'gzip',
      encryption: true,
      checksum: 'b2c3d4e5f6a1...',
      retention: '7 gün',
      nextBackup: '2024-03-15 02:00:00'
    },
    {
      id: 3,
      name: 'Database Schema Backup',
      type: 'schema',
      status: 'completed',
      size: '25 MB',
      createdAt: '2024-03-13 01:00:00',
      completedAt: '2024-03-13 01:05:00',
      duration: '5 dakika',
      location: 'cloud',
      path: 's3://masapp-backups/schema_2024_03_13.sql',
      tables: 45,
      records: 0,
      compression: 'none',
      encryption: false,
      checksum: 'c3d4e5f6a1b2...',
      retention: '90 gün',
      nextBackup: '2024-03-20 01:00:00'
    },
    {
      id: 4,
      name: 'Full Backup 2024-03-12',
      type: 'full',
      status: 'failed',
      size: '0 MB',
      createdAt: '2024-03-12 02:00:00',
      completedAt: null,
      duration: '0 dakika',
      location: 'local',
      path: null,
      tables: 0,
      records: 0,
      compression: 'gzip',
      encryption: true,
      checksum: null,
      retention: '30 gün',
      nextBackup: '2024-03-13 02:00:00',
      error: 'Disk alanı yetersiz'
    },
    {
      id: 5,
      name: 'Incremental Backup 2024-03-11',
      type: 'incremental',
      status: 'in_progress',
      size: '0 MB',
      createdAt: '2024-03-11 02:00:00',
      completedAt: null,
      duration: '0 dakika',
      location: 'local',
      path: null,
      tables: 0,
      records: 0,
      compression: 'gzip',
      encryption: true,
      checksum: null,
      retention: '7 gün',
      nextBackup: '2024-03-12 02:00:00',
      progress: 65
    }
  ];

  const getTypeClass = (type: string) => {
    switch(type) {
      case 'full': return 'bg-blue-100 text-blue-800';
      case 'incremental': return 'bg-green-100 text-green-800';
      case 'schema': return 'bg-purple-100 text-purple-800';
      case 'differential': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch(type) {
      case 'full': return 'Tam Yedek';
      case 'incremental': return 'Artımlı Yedek';
      case 'schema': return 'Şema Yedek';
      case 'differential': return 'Fark Yedek';
      default: return type;
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'completed': return 'Tamamlandı';
      case 'in_progress': return 'Devam Ediyor';
      case 'failed': return 'Başarısız';
      case 'scheduled': return 'Zamanlandı';
      case 'paused': return 'Duraklatıldı';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <FaCheckCircle className="text-green-600" />;
      case 'in_progress': return <FaClock className="text-yellow-600" />;
      case 'failed': return <FaExclamationTriangle className="text-red-600" />;
      case 'scheduled': return <FaCalendarAlt className="text-blue-600" />;
      case 'paused': return <FaPause className="text-gray-600" />;
      default: return <FaClock className="text-gray-600" />;
    }
  };

  const getLocationIcon = (location: string) => {
    switch(location) {
      case 'local': return <FaHdd className="text-blue-600" />;
      case 'cloud': return <FaCloud className="text-green-600" />;
      case 'server': return <FaServer className="text-purple-600" />;
      default: return <FaDatabase className="text-gray-600" />;
    }
  };

  const filteredBackups = backups.filter(backup => {
    const matchesSearch = backup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         backup.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || backup.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const backupStats = {
    total: backups.length,
    completed: backups.filter(b => b.status === 'completed').length,
    failed: backups.filter(b => b.status === 'failed').length,
    inProgress: backups.filter(b => b.status === 'in_progress').length,
    totalSize: '2.7 GB',
    lastBackup: '2024-03-15 02:45:00'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yedekleme Yönetimi</h1>
              <p className="text-gray-600 mt-1">Veritabanı yedeklerini yönet ve izle</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
                <FaPlay className="mr-2" />
                Yedek Başlat
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
              onClick={() => setActiveTab('backups')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'backups'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaDatabase className="inline mr-2" />
              Yedekler
            </button>
            <button
              onClick={() => setActiveTab('restore')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'restore'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUpload className="inline mr-2" />
              Geri Yükle
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaCalendarAlt className="inline mr-2" />
              Zamanlama
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
              Ayarlar
            </button>
          </nav>
        </div>
      </div>

      {/* Backups Tab */}
      {activeTab === 'backups' && (
        <div className="px-8 py-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <FaDatabase className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Toplam Yedek</p>
                  <p className="text-xl font-bold text-gray-900">{backupStats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <FaCheckCircle className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tamamlanan</p>
                  <p className="text-xl font-bold text-green-600">{backupStats.completed}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <FaExclamationTriangle className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Başarısız</p>
                  <p className="text-xl font-bold text-red-600">{backupStats.failed}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  <FaClock className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Devam Eden</p>
                  <p className="text-xl font-bold text-yellow-600">{backupStats.inProgress}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <FaHdd className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Toplam Boyut</p>
                  <p className="text-xl font-bold text-gray-900">{backupStats.totalSize}</p>
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
                    placeholder="Yedek ara..."
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
                  <option value="completed">Tamamlandı</option>
                  <option value="in_progress">Devam Ediyor</option>
                  <option value="failed">Başarısız</option>
                  <option value="scheduled">Zamanlandı</option>
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

          {/* Backups List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yedek</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Boyut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBackups.map((backup) => (
                    <tr key={backup.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                            <FaDatabase className="text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                            <div className="text-sm text-gray-500">
                              {backup.tables} tablo, {backup.records.toLocaleString()} kayıt
                            </div>
                            {backup.error && (
                              <div className="text-sm text-red-600 mt-1">{backup.error}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${getTypeClass(backup.type)}`}>
                          {getTypeText(backup.type)}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium flex items-center ${getStatusClass(backup.status)}`}>
                            {getStatusIcon(backup.status)}
                            <span className="ml-1">{getStatusText(backup.status)}</span>
                          </span>
                          {backup.status === 'in_progress' && backup.progress && (
                            <div className="ml-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-600 h-2 rounded-full" 
                                  style={{ width: `${backup.progress}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{backup.progress}%</div>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{backup.size}</div>
                        <div className="text-xs text-gray-500">
                          {backup.compression} {backup.encryption && '• Şifreli'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getLocationIcon(backup.location)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">{backup.location}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-2 text-gray-400" />
                            {backup.createdAt}
                          </div>
                          {backup.completedAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              Tamamlandı: {backup.completedAt}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Süre: {backup.duration}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800" title="Detayları Görüntüle">
                            <FaEye className="text-sm" />
                          </button>
                          {backup.status === 'completed' && (
                            <button className="text-green-600 hover:text-green-800" title="İndir">
                              <FaDownload className="text-sm" />
                            </button>
                          )}
                          {backup.status === 'in_progress' && (
                            <button className="text-yellow-600 hover:text-yellow-800" title="Duraklat">
                              <FaPause className="text-sm" />
                            </button>
                          )}
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

      {/* Restore Tab */}
      {activeTab === 'restore' && (
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Geri Yükleme</h2>
            <p className="text-gray-600">Geri yükleme özelliği yakında eklenecek.</p>
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Yedekleme Zamanlaması</h2>
            <p className="text-gray-600">Zamanlama özelliği yakında eklenecek.</p>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Yedekleme Ayarları</h2>
            <p className="text-gray-600">Ayarlar özelliği yakında eklenecek.</p>
          </div>
        </div>
      )}
    </div>
  );
}
