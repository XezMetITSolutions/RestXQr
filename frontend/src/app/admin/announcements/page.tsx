'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaEnvelope, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaPaperPlane,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaFilter,
  FaSearch,
  FaFileAlt,
  FaImage,
  FaVideo,
  FaLink,
  FaGlobe,
  FaMobile,
  FaDesktop,
  FaChartBar,
  FaEyeSlash,
  FaPause,
  FaPlay
} from 'react-icons/fa';

export default function AnnouncementsManagement() {
  const [activeTab, setActiveTab] = useState('announcements');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const announcements = [
    {
      id: 1,
      title: 'Yeni QR Kod Özelliği Duyurusu',
      content: 'Sistemimize yeni QR kod oluşturma ve yönetim özelliği eklendi. Artık menülerinizi daha kolay paylaşabilirsiniz.',
      type: 'feature',
      status: 'published',
      priority: 'high',
      publishDate: '2024-03-15',
      publishTime: '14:30',
      expiryDate: '2024-04-15',
      targetAudience: 'all_restaurants',
      recipients: 1247,
      views: 892,
      clicks: 234,
      media: {
        type: 'image',
        url: '/images/qr-feature.jpg',
        alt: 'QR Kod Özelliği'
      },
      tags: ['yeni-özellik', 'qr-kod', 'menü'],
      author: 'Ahmet Yılmaz',
      createdAt: '2024-03-15 10:00',
      updatedAt: '2024-03-15 14:30'
    },
    {
      id: 2,
      title: 'Sistem Bakım Bildirimi',
      content: 'Sistem bakımı 23 Mart 2024 tarihinde 02:00-04:00 saatleri arasında yapılacaktır. Bu süre zarfında hizmet kesintisi yaşanabilir.',
      type: 'maintenance',
      status: 'scheduled',
      priority: 'critical',
      publishDate: '2024-03-23',
      publishTime: '02:00',
      expiryDate: '2024-03-24',
      targetAudience: 'all_restaurants',
      recipients: 1247,
      views: 0,
      clicks: 0,
      media: {
        type: 'none',
        url: null,
        alt: null
      },
      tags: ['bakım', 'sistem', 'kesinti'],
      author: 'Mehmet Demir',
      createdAt: '2024-03-20 16:00',
      updatedAt: '2024-03-20 16:00'
    },
    {
      id: 3,
      title: 'Komisyon Oranı Güncellendi',
      content: 'Premium üyeler için komisyon oranı %5\'e düşürüldü. Bu değişiklik 1 Nisan 2024 tarihinden itibaren geçerli olacaktır.',
      type: 'update',
      status: 'published',
      priority: 'medium',
      publishDate: '2024-03-10',
      publishTime: '10:15',
      expiryDate: '2024-04-10',
      targetAudience: 'premium_restaurants',
      recipients: 450,
      views: 320,
      clicks: 89,
      media: {
        type: 'none',
        url: null,
        alt: null
      },
      tags: ['komisyon', 'güncelleme', 'premium'],
      author: 'Ayşe Kaya',
      createdAt: '2024-03-10 09:00',
      updatedAt: '2024-03-10 10:15'
    },
    {
      id: 4,
      title: 'Yeni Restoran Hoş Geldin Paketi',
      content: 'Sisteme yeni katılan restoranlar için özel hoş geldin paketi hazırladık. İlk ay ücretsiz premium özellikler!',
      type: 'promotion',
      status: 'published',
      priority: 'low',
      publishDate: '2024-03-12',
      publishTime: '16:45',
      expiryDate: '2024-06-12',
      targetAudience: 'new_restaurants',
      recipients: 23,
      views: 18,
      clicks: 15,
      media: {
        type: 'video',
        url: '/videos/welcome-package.mp4',
        alt: 'Hoş Geldin Paketi'
      },
      tags: ['hoş-geldin', 'promosyon', 'yeni-restoran'],
      author: 'Fatma Özkan',
      createdAt: '2024-03-12 14:00',
      updatedAt: '2024-03-12 16:45'
    },
    {
      id: 5,
      title: 'Güvenlik Güncellemesi',
      content: 'Sistem güvenliğini artırmak için önemli güncellemeler yapıldı. Lütfen şifrenizi güncelleyin.',
      type: 'security',
      status: 'draft',
      priority: 'high',
      publishDate: null,
      publishTime: null,
      expiryDate: null,
      targetAudience: 'all_restaurants',
      recipients: 0,
      views: 0,
      clicks: 0,
      media: {
        type: 'none',
        url: null,
        alt: null
      },
      tags: ['güvenlik', 'güncelleme', 'şifre'],
      author: 'Ali Veli',
      createdAt: '2024-03-18 11:30',
      updatedAt: '2024-03-18 11:30'
    }
  ];

  const getTypeClass = (type: string) => {
    switch(type) {
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'update': return 'bg-green-100 text-green-800';
      case 'promotion': return 'bg-purple-100 text-purple-800';
      case 'security': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch(type) {
      case 'feature': return 'Özellik';
      case 'maintenance': return 'Bakım';
      case 'update': return 'Güncelleme';
      case 'promotion': return 'Promosyon';
      case 'security': return 'Güvenlik';
      default: return type;
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'published': return 'Yayınlandı';
      case 'scheduled': return 'Zamanlandı';
      case 'draft': return 'Taslak';
      case 'archived': return 'Arşivlendi';
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

  const getMediaIcon = (type: string) => {
    switch(type) {
      case 'image': return <FaImage className="text-blue-600" />;
      case 'video': return <FaVideo className="text-purple-600" />;
      case 'link': return <FaLink className="text-green-600" />;
      default: return <FaFileAlt className="text-gray-600" />;
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || announcement.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="Bildirim Yönetimi" description="Sistem bildirimlerini yönetin">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Duyuru Yönetimi</h1>
              <p className="text-gray-600 mt-1">Sistem duyurularını oluştur ve yönet</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
              <FaPlus className="mr-2" />
              Yeni Duyuru
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 py-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('announcements')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'announcements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaEnvelope className="inline mr-2" />
              Duyurular
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaFileAlt className="inline mr-2" />
              Şablonlar
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaChartBar className="inline mr-2" />
              Analitik
            </button>
          </nav>
        </div>
      </div>

      {/* Announcements List */}
      {activeTab === 'announcements' && (
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
                    placeholder="Duyuru ara..."
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
                  <option value="published">Yayınlandı</option>
                  <option value="scheduled">Zamanlandı</option>
                  <option value="draft">Taslak</option>
                  <option value="archived">Arşivlendi</option>
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

          {/* Announcements List */}
          <div className="space-y-6">
            {filteredAnnouncements.map((announcement) => (
              <div key={announcement.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getMediaIcon(announcement.media.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                      <p className="text-gray-600 mb-3">{announcement.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {announcement.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getTypeClass(announcement.type)}`}>
                      {getTypeText(announcement.type)}
                    </span>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusClass(announcement.status)}`}>
                      {getStatusText(announcement.status)}
                    </span>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityClass(announcement.priority)}`}>
                      {getPriorityText(announcement.priority)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaCalendarAlt className="mr-2" />
                    <span>
                      {announcement.publishDate ? `${announcement.publishDate} ${announcement.publishTime}` : 'Henüz yayınlanmadı'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaUsers className="mr-2" />
                    <span>{announcement.recipients} alıcı</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaEye className="mr-2" />
                    <span>{announcement.views} görüntüleme</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaCheckCircle className="mr-2" />
                    <span>{announcement.clicks} tıklama</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <span>Yazar: {announcement.author}</span>
                      <span className="mx-2">•</span>
                      <span>Oluşturulma: {announcement.createdAt}</span>
                      {announcement.updatedAt !== announcement.createdAt && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Güncellenme: {announcement.updatedAt}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800" title="Görüntüle">
                        <FaEye className="text-sm" />
                      </button>
                      <button className="text-green-600 hover:text-green-800" title="Düzenle">
                        <FaEdit className="text-sm" />
                      </button>
                      {announcement.status === 'published' ? (
                        <button className="text-yellow-600 hover:text-yellow-800" title="Duraklat">
                          <FaPause className="text-sm" />
                        </button>
                      ) : (
                        <button className="text-green-600 hover:text-green-800" title="Yayınla">
                          <FaPlay className="text-sm" />
                        </button>
                      )}
                      <button className="text-red-600 hover:text-red-800" title="Sil">
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Duyuru Şablonları</h2>
            <p className="text-gray-600">Şablon yönetimi özelliği yakında eklenecek.</p>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Duyuru Analitikleri</h2>
            <p className="text-gray-600">Detaylı analitik raporları yakında eklenecek.</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
