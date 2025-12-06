'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BusinessSidebar from '@/components/BusinessSidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useFeature } from '@/hooks/useFeature';
import { 
  FaVideo, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaPlay,
  FaPause,
  FaEye,
  FaBars,
  FaUpload,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from 'react-icons/fa';

interface VideoMenuItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  category: string;
  status: 'active' | 'inactive' | 'processing';
  views: number;
  uploadedAt: string;
}

export default function VideoMenuPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const hasVideoMenu = useFeature('video_menu');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Demo data
  const [videoMenuItems, setVideoMenuItems] = useState<VideoMenuItem[]>([
    {
      id: '1',
      title: 'İmza Pizza Yapımı',
      description: 'Usta pizzacımızın özel tarifini keşfedin',
      videoUrl: '/videos/pizza.mp4',
      thumbnail: '/images/pizza-thumb.jpg',
      duration: '2:45',
      category: 'Ana Yemek',
      status: 'active',
      views: 1250,
      uploadedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Taze Salata Hazırlığı',
      description: 'Günlük taze malzemelerle hazırlanan salatalarımız',
      videoUrl: '/videos/salad.mp4',
      thumbnail: '/images/salad-thumb.jpg',
      duration: '1:30',
      category: 'Salata',
      status: 'active',
      views: 890,
      uploadedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      title: 'Özel Burger Menü',
      description: 'El yapımı köfteli burgerlerimiz',
      videoUrl: '/videos/burger.mp4',
      thumbnail: '/images/burger-thumb.jpg',
      duration: '3:15',
      category: 'Ana Yemek',
      status: 'processing',
      views: 0,
      uploadedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '4',
      title: 'Tatlı Çeşitleri',
      description: 'Ev yapımı tatlılarımızdan örnekler',
      videoUrl: '/videos/dessert.mp4',
      thumbnail: '/images/dessert-thumb.jpg',
      duration: '2:00',
      category: 'Tatlı',
      status: 'inactive',
      views: 450,
      uploadedAt: new Date(Date.now() - 172800000).toISOString()
    }
  ]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/isletme-giris');
    }
  }, [isAuthenticated, router]);

  // Özellik kontrolü
  if (!hasVideoMenu) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <FaVideo className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Video Menü</h2>
          <p className="text-gray-600 mb-4">
            Bu özellik planınızda bulunmuyor. Video menü özelliğini kullanmak için planınızı yükseltin.
          </p>
          <button
            onClick={() => router.push('/business/settings')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Planı Yükselt
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/isletme-giris');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <FaCheckCircle />;
      case 'inactive': return <FaTimesCircle />;
      case 'processing': return <FaClock />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Pasif';
      case 'processing': return 'İşleniyor';
      default: return status;
    }
  };

  const filteredVideos = videoMenuItems.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || video.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeVideos = videoMenuItems.filter(v => v.status === 'active').length;
  const totalViews = videoMenuItems.reduce((sum, v) => sum + v.views, 0);
  const avgViews = Math.round(totalViews / videoMenuItems.length);

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="ml-0 lg:ml-72">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FaBars className="text-xl text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaVideo className="text-red-600" />
                    Video Menü
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">Menünüzü videolarla tanıtın</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <FaUpload />
                <span className="hidden sm:inline">Video Yükle</span>
              </button>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Video</p>
                  <p className="text-2xl font-bold text-gray-900">{videoMenuItems.length}</p>
                </div>
                <FaVideo className="text-3xl text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktif Video</p>
                  <p className="text-2xl font-bold text-green-600">{activeVideos}</p>
                </div>
                <FaCheckCircle className="text-3xl text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam İzlenme</p>
                  <p className="text-2xl font-bold text-blue-600">{totalViews.toLocaleString()}</p>
                </div>
                <FaEye className="text-3xl text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ort. İzlenme</p>
                  <p className="text-2xl font-bold text-purple-600">{avgViews}</p>
                </div>
                <FaPlay className="text-3xl text-purple-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Video başlığı, açıklama veya kategori ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="processing">İşleniyor</option>
              </select>
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 cursor-pointer">
                      <FaPlay className="text-white text-2xl ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(video.status)}`}>
                      {getStatusIcon(video.status)}
                      {getStatusText(video.status)}
                    </span>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2">{video.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                      {video.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <FaEye />
                      <span>{video.views.toLocaleString()} izlenme</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    <button className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 text-sm font-medium">
                      <FaPlay />
                      Oynat
                    </button>
                    <button className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                      <FaEdit />
                    </button>
                    <button className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FaVideo className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Video bulunamadı</p>
            </div>
          )}

          {/* Video Info */}
          <div className="mt-6 bg-red-50 rounded-lg p-6 border border-red-200">
            <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
              <FaVideo />
              Video Menü Avantajları
            </h3>
            <p className="text-sm text-red-800 mb-4">
              Video menüler, müşterilerinizin yemekleri daha iyi anlamasını sağlar ve sipariş oranlarını %40'a kadar artırabilir.
            </p>
            <ul className="text-sm text-red-800 space-y-2">
              <li>✓ Yemekleri görsel olarak tanıtın</li>
              <li>✓ Hazırlık süreçlerini gösterin</li>
              <li>✓ Müşteri güvenini artırın</li>
              <li>✓ Sosyal medyada paylaşılabilir içerik</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

