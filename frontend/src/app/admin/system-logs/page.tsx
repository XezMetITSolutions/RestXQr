'use client';

import { useState } from 'react';
import { 
  FaFileAlt, 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaTrash, 
  FaEye,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaTimes,
  FaClock,
  FaCalendarAlt,
  FaServer,
  FaDatabase,
  FaUser,
  FaCog,
  FaBug,
  FaShieldAlt,
  FaChartLine,
  FaSync,
  FaPlay,
  FaPause,
  FaStop
} from 'react-icons/fa';

export default function SystemLogsManagement() {
  const [activeTab, setActiveTab] = useState('logs');
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [isLiveMode, setIsLiveMode] = useState(false);

  const logs = [
    {
      id: 1,
      timestamp: '2024-03-15 14:30:25',
      level: 'error',
      message: 'Database connection failed',
      source: 'database',
      userId: 'user_123',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      requestId: 'req_abc123',
      duration: 0,
      statusCode: 500,
      stackTrace: 'Error: Connection timeout\n    at Database.connect()\n    at UserService.getUser()',
      tags: ['database', 'connection', 'timeout']
    },
    {
      id: 2,
      timestamp: '2024-03-15 14:29:15',
      level: 'warning',
      message: 'High memory usage detected',
      source: 'system',
      userId: null,
      ip: null,
      userAgent: null,
      requestId: null,
      duration: 0,
      statusCode: null,
      stackTrace: null,
      tags: ['memory', 'performance', 'monitoring']
    },
    {
      id: 3,
      timestamp: '2024-03-15 14:28:45',
      level: 'info',
      message: 'User login successful',
      source: 'auth',
      userId: 'user_456',
      ip: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      requestId: 'req_def456',
      duration: 150,
      statusCode: 200,
      stackTrace: null,
      tags: ['authentication', 'login', 'success']
    },
    {
      id: 4,
      timestamp: '2024-03-15 14:27:30',
      level: 'debug',
      message: 'API request processed',
      source: 'api',
      userId: 'user_789',
      ip: '192.168.1.102',
      userAgent: 'PostmanRuntime/7.28.4',
      requestId: 'req_ghi789',
      duration: 75,
      statusCode: 200,
      stackTrace: null,
      tags: ['api', 'request', 'processing']
    },
    {
      id: 5,
      timestamp: '2024-03-15 14:26:20',
      level: 'error',
      message: 'Payment processing failed',
      source: 'payment',
      userId: 'user_321',
      ip: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      requestId: 'req_jkl321',
      duration: 0,
      statusCode: 400,
      stackTrace: 'Error: Invalid payment method\n    at PaymentService.process()\n    at OrderController.create()',
      tags: ['payment', 'error', 'processing']
    },
    {
      id: 6,
      timestamp: '2024-03-15 14:25:10',
      level: 'info',
      message: 'System backup completed',
      source: 'backup',
      userId: 'system',
      ip: null,
      userAgent: null,
      requestId: null,
      duration: 300000,
      statusCode: null,
      stackTrace: null,
      tags: ['backup', 'system', 'completed']
    },
    {
      id: 7,
      timestamp: '2024-03-15 14:24:05',
      level: 'warning',
      message: 'Slow query detected',
      source: 'database',
      userId: 'user_654',
      ip: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      requestId: 'req_mno654',
      duration: 5000,
      statusCode: 200,
      stackTrace: null,
      tags: ['database', 'query', 'performance']
    },
    {
      id: 8,
      timestamp: '2024-03-15 14:23:00',
      level: 'info',
      message: 'New restaurant registered',
      source: 'registration',
      userId: 'user_987',
      ip: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      requestId: 'req_pqr987',
      duration: 200,
      statusCode: 201,
      stackTrace: null,
      tags: ['registration', 'restaurant', 'new']
    }
  ];

  const getLevelClass = (level: string) => {
    switch(level) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'debug': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: string) => {
    switch(level) {
      case 'error': return 'Hata';
      case 'warning': return 'Uyarı';
      case 'info': return 'Bilgi';
      case 'debug': return 'Debug';
      default: return level;
    }
  };

  const getLevelIcon = (level: string) => {
    switch(level) {
      case 'error': return <FaTimes className="text-red-600" />;
      case 'warning': return <FaExclamationTriangle className="text-yellow-600" />;
      case 'info': return <FaInfoCircle className="text-blue-600" />;
      case 'debug': return <FaBug className="text-gray-600" />;
      default: return <FaInfoCircle className="text-gray-600" />;
    }
  };

  const getSourceClass = (source: string) => {
    switch(source) {
      case 'database': return 'bg-purple-100 text-purple-800';
      case 'system': return 'bg-orange-100 text-orange-800';
      case 'auth': return 'bg-green-100 text-green-800';
      case 'api': return 'bg-blue-100 text-blue-800';
      case 'payment': return 'bg-yellow-100 text-yellow-800';
      case 'backup': return 'bg-gray-100 text-gray-800';
      case 'registration': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceText = (source: string) => {
    switch(source) {
      case 'database': return 'Veritabanı';
      case 'system': return 'Sistem';
      case 'auth': return 'Kimlik Doğrulama';
      case 'api': return 'API';
      case 'payment': return 'Ödeme';
      case 'backup': return 'Yedekleme';
      case 'registration': return 'Kayıt';
      default: return source;
    }
  };

  const getSourceIcon = (source: string) => {
    switch(source) {
      case 'database': return <FaDatabase className="text-purple-600" />;
      case 'system': return <FaServer className="text-orange-600" />;
      case 'auth': return <FaShieldAlt className="text-green-600" />;
      case 'api': return <FaCog className="text-blue-600" />;
      case 'payment': return <FaUser className="text-yellow-600" />;
      case 'backup': return <FaFileAlt className="text-gray-600" />;
      case 'registration': return <FaUser className="text-pink-600" />;
      default: return <FaCog className="text-gray-600" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (log.userId && log.userId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const logStats = {
    total: logs.length,
    errors: logs.filter(l => l.level === 'error').length,
    warnings: logs.filter(l => l.level === 'warning').length,
    info: logs.filter(l => l.level === 'info').length,
    debug: logs.filter(l => l.level === 'debug').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistem Logları</h1>
              <p className="text-gray-600 mt-1">Sistem aktivitelerini izle ve analiz et</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  isLiveMode
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isLiveMode ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
                {isLiveMode ? 'Duraklat' : 'Canlı İzle'}
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center">
                <FaDownload className="mr-2" />
                İndir
              </button>
              <button className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center">
                <FaTrash className="mr-2" />
                Temizle
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
              onClick={() => setActiveTab('logs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaFileAlt className="inline mr-2" />
              Loglar
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
              onClick={() => setActiveTab('monitoring')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'monitoring'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaServer className="inline mr-2" />
              İzleme
            </button>
          </nav>
        </div>
      </div>

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="px-8 py-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <FaFileAlt className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Toplam</p>
                  <p className="text-xl font-bold text-gray-900">{logStats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <FaTimes className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hata</p>
                  <p className="text-xl font-bold text-red-600">{logStats.errors}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  <FaExclamationTriangle className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Uyarı</p>
                  <p className="text-xl font-bold text-yellow-600">{logStats.warnings}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <FaInfoCircle className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bilgi</p>
                  <p className="text-xl font-bold text-blue-600">{logStats.info}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <FaBug className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Debug</p>
                  <p className="text-xl font-bold text-gray-600">{logStats.debug}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Log mesajı ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seviye</label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tüm Seviyeler</option>
                  <option value="error">Hata</option>
                  <option value="warning">Uyarı</option>
                  <option value="info">Bilgi</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="today">Bugün</option>
                  <option value="yesterday">Dün</option>
                  <option value="week">Bu Hafta</option>
                  <option value="month">Bu Ay</option>
                  <option value="all">Tümü</option>
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

          {/* Logs List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zaman</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seviye</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kaynak</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesaj</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Süre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{log.timestamp}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium flex items-center ${getLevelClass(log.level)}`}>
                            {getLevelIcon(log.level)}
                            <span className="ml-1">{getLevelText(log.level)}</span>
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium flex items-center ${getSourceClass(log.source)}`}>
                            {getSourceIcon(log.source)}
                            <span className="ml-1">{getSourceText(log.source)}</span>
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{log.message}</div>
                        {log.tags && log.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {log.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {log.userId ? (
                            <div>
                              <div className="text-gray-900">{log.userId}</div>
                              <div className="text-gray-500">{log.ip}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {log.duration > 0 ? `${log.duration}ms` : '-'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800" title="Detayları Görüntüle">
                            <FaEye className="text-sm" />
                          </button>
                          {log.stackTrace && (
                            <button className="text-red-600 hover:text-red-800" title="Stack Trace">
                              <FaBug className="text-sm" />
                            </button>
                          )}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Log Analitikleri</h2>
            <p className="text-gray-600">Detaylı analitik raporları yakında eklenecek.</p>
          </div>
        </div>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Sistem İzleme</h2>
            <p className="text-gray-600">Gerçek zamanlı sistem izleme özelliği yakında eklenecek.</p>
          </div>
        </div>
      )}
    </div>
  );
}
