'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BusinessSidebar from '@/components/BusinessSidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useFeature } from '@/hooks/useFeature';
import { apiService } from '@/services/api';
import { 
  FaBrain, 
  FaLightbulb, 
  FaChartLine,
  FaUsers,
  FaUtensils,
  FaClock,
  FaBars,
  FaArrowUp,
  FaArrowDown,
  FaStar,
  FaExclamationTriangle
} from 'react-icons/fa';

interface AIRecommendation {
  id: string;
  type: 'menu' | 'pricing' | 'inventory' | 'marketing' | 'operations';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  potentialRevenue?: number;
  actionRequired: string;
}

export default function AIPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const hasAIRecommendations = useFeature('ai_recommendations');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([
    {
      id: '1',
      type: 'menu',
      title: 'Vegan Menü Seçenekleri Ekleyin',
      description: 'Bölgenizdeki vegan müşteri talebinde %45 artış görülüyor. Menünüze 3-4 vegan seçenek eklemek, haftalık cironuzu ₺8,500 artırabilir.',
      impact: 'high',
      confidence: 87,
      potentialRevenue: 8500,
      actionRequired: 'Menüye vegan ürünler ekleyin'
    },
    {
      id: '2',
      type: 'pricing',
      title: 'Öğle Menüsü Fiyat Optimizasyonu',
      description: 'Öğle menü fiyatlarınız rakiplerinizden %12 daha yüksek. Fiyatları ₺5-7 düşürmek, sipariş sayısını %30 artırabilir.',
      impact: 'high',
      confidence: 92,
      potentialRevenue: 12000,
      actionRequired: 'Öğle menü fiyatlarını gözden geçirin'
    },
    {
      id: '3',
      type: 'inventory',
      title: 'Stok Yönetimi İyileştirmesi',
      description: 'Bazı ürünlerde %15 fire oranı tespit edildi. Stok rotasyonunu optimize ederek aylık ₺3,200 tasarruf edebilirsiniz.',
      impact: 'medium',
      confidence: 78,
      potentialRevenue: 3200,
      actionRequired: 'Stok rotasyon sistemini güncelleyin'
    },
    {
      id: '4',
      type: 'marketing',
      title: 'Sosyal Medya Kampanyası',
      description: 'Rakipleriniz Instagram\'da aktif ancak siz pasifsiniz. Haftalık 3 gönderi ile müşteri sayınızı %25 artırabilirsiniz.',
      impact: 'high',
      confidence: 85,
      potentialRevenue: 15000,
      actionRequired: 'Sosyal medya stratejisi oluşturun'
    },
    {
      id: '5',
      type: 'operations',
      title: 'Personel Vardiya Optimizasyonu',
      description: 'Yoğun saatlerde personel eksikliği, sakin saatlerde fazlalık var. Vardiya planlamasını optimize ederek aylık ₺5,000 tasarruf edebilirsiniz.',
      impact: 'medium',
      confidence: 81,
      potentialRevenue: 5000,
      actionRequired: 'Vardiya planlamasını yeniden düzenleyin'
    },
    {
      id: '6',
      type: 'menu',
      title: 'Combo Menü Paketleri',
      description: 'Müşterilerinizin %60\'ı birden fazla ürün sipariş ediyor. Combo menüler oluşturarak ortalama sipariş tutarını ₺25 artırabilirsiniz.',
      impact: 'medium',
      confidence: 88,
      potentialRevenue: 9500,
      actionRequired: 'Combo menü paketleri oluşturun'
    },
    {
      id: '7',
      type: 'pricing',
      title: 'İçecek Fiyatlandırması',
      description: 'İçecek fiyatlarınız pazar ortalamasının altında. %8-10 fiyat artışı yaparak aylık ₺4,200 ek gelir elde edebilirsiniz.',
      impact: 'low',
      confidence: 75,
      potentialRevenue: 4200,
      actionRequired: 'İçecek fiyatlarını güncelleyin'
    },
    {
      id: '8',
      type: 'marketing',
      title: 'Sadakat Programı Başlatın',
      description: 'Müşterilerinizin %70\'i tek seferlik ziyaretçi. Sadakat programı ile tekrar ziyaret oranını %40 artırabilirsiniz.',
      impact: 'high',
      confidence: 90,
      potentialRevenue: 18000,
      actionRequired: 'Sadakat programı sistemi kurun'
    }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Demo için session kontrolü yok
  }, []);

  const handleDeleteRecommendation = async (id: string) => {
    try {
      setRecommendations(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Öneri silinirken hata:', error);
    }
  };

  useEffect(() => {
    // Demo için session kontrolü yok
  }, [isAuthenticated, router]);

  // Özellik kontrolü
  if (!hasAIRecommendations) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <FaBrain className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Önerileri</h2>
          <p className="text-gray-600 mb-4">
            Bu özellik planınızda bulunmuyor. Yapay zeka destekli öneriler özelliğini kullanmak için planınızı yükseltin.
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
    router.push('/');
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getImpactText = (impact: string) => {
    switch (impact) {
      case 'high': return 'Yüksek Etki';
      case 'medium': return 'Orta Etki';
      case 'low': return 'Düşük Etki';
      default: return impact;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'menu': return <FaUtensils className="text-orange-500" />;
      case 'pricing': return <FaChartLine className="text-green-500" />;
      case 'inventory': return <FaExclamationTriangle className="text-yellow-500" />;
      case 'marketing': return <FaStar className="text-purple-500" />;
      case 'operations': return <FaUsers className="text-blue-500" />;
      default: return <FaLightbulb className="text-gray-500" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'menu': return 'Menü';
      case 'pricing': return 'Fiyatlandırma';
      case 'inventory': return 'Stok';
      case 'marketing': return 'Pazarlama';
      case 'operations': return 'Operasyon';
      default: return type;
    }
  };

  const highImpactCount = recommendations.filter(r => r.impact === 'high').length;
  const totalPotentialRevenue = recommendations.reduce((sum, r) => sum + (r.potentialRevenue || 0), 0);
  const avgConfidence = Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length);

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
                    <FaBrain className="text-purple-600" />
                    AI Önerileri
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">Yapay zeka destekli iş önerileri</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Öneri</p>
                  <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
                </div>
                <FaLightbulb className="text-3xl text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Yüksek Öncelik</p>
                  <p className="text-2xl font-bold text-red-600">{highImpactCount}</p>
                </div>
                <FaExclamationTriangle className="text-3xl text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Potansiyel Gelir</p>
                  <p className="text-2xl font-bold text-green-600">₺{totalPotentialRevenue.toLocaleString()}</p>
                </div>
                <FaArrowUp className="text-3xl text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ort. Güven</p>
                  <p className="text-2xl font-bold text-purple-600">%{avgConfidence}</p>
                </div>
                <FaBrain className="text-3xl text-purple-500" />
              </div>
            </div>
          </div>

          {/* AI Info Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200 mb-6">
            <div className="flex items-start gap-4">
              <FaBrain className="text-3xl text-purple-600 mt-1" />
              <div>
                <h3 className="font-bold text-purple-900 mb-2">Yapay Zeka Analizi</h3>
                <p className="text-sm text-purple-800">
                  AI sistemimiz, işletme verilerinizi analiz ederek size özel öneriler sunuyor. 
                  Bu öneriler, benzer işletmelerin başarı verilerine ve pazar trendlerine dayanmaktadır.
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations List */}
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(rec.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900">{rec.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(rec.impact)}`}>
                            {getImpactText(rec.impact)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Kategori:</span>
                            <span className="font-medium text-gray-900">{getTypeText(rec.type)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Güven:</span>
                            <span className="font-bold text-purple-600">%{rec.confidence}</span>
                          </div>
                          {rec.potentialRevenue && (
                            <div className="flex items-center gap-2">
                              <FaArrowUp className="text-green-500" />
                              <span className="font-bold text-green-600">₺{rec.potentialRevenue.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaClock />
                      <span>Aksiyon: {rec.actionRequired}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                        Daha Sonra
                      </button>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
                        Uygula
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Learning Info */}
          <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <FaBrain />
              AI Öğreniyor
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              Yapay zeka sistemi, işletmenizi daha iyi anlamak için sürekli öğreniyor. 
              Önerileri uyguladıkça ve geri bildirim verdikçe öneriler daha kişiselleşecek.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <span className="text-sm font-medium text-blue-900">%65 Öğrenme</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




