'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaArrowLeft,
  FaBuilding, 
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCreditCard,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaBan,
  FaMoneyBillWave,
  FaChartLine,
  FaDownload,
  FaEdit,
  FaPause,
  FaPlay,
  FaTimes,
  FaSync,
  FaFileAlt,
  FaHistory
} from 'react-icons/fa';

interface SubscriptionDetail {
  id: string;
  restaurantId: string;
  restaurantName: string;
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  plan: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    billingCycle: string;
    features: string[];
  };
  status: 'active' | 'expired' | 'cancelled' | 'suspended' | 'pending';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  paymentMethod: {
    type: string;
    last4?: string;
    brand?: string;
  };
  lastPayment: {
    date: string;
    amount: number;
    status: string;
    transactionId: string;
  };
  failedPayments: number;
  totalRevenue: number;
  notes?: string;
  paymentHistory: Array<{
    id: string;
    date: string;
    amount: number;
    status: string;
    method: string;
    transactionId: string;
  }>;
}

export default function SubscriptionDetail({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  
  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [action, setAction] = useState<string | null>(null);

  useEffect(() => {
    // Demo: Abonelik detay verilerini yükle
    const loadSubscription = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo veri
      const demoSubscription: SubscriptionDetail = {
        id: subscriptionId,
        restaurantId: 'rest-1',
        restaurantName: 'Pizza Palace',
        owner: {
          name: 'Ahmet Yılmaz',
          email: 'ahmet@pizzapalace.com',
          phone: '+90 532 123 4567'
        },
        plan: {
          id: 'premium',
          name: 'Premium Paket',
          amount: 4980,
          currency: 'TRY',
          billingCycle: 'monthly',
          features: [
            'Sınırsız menü kategorisi',
            'Gelişmiş raporlar',
            'Öncelikli indeksleme',
            'Çoklu şube yönetimi',
            'Çok dilli menü',
            'Gelişmiş özelleştirme'
          ]
        },
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2025-01-15',
        nextBillingDate: '2024-04-15',
        paymentMethod: {
          type: 'card',
          last4: '4242',
          brand: 'Visa'
        },
        lastPayment: {
          date: '2024-03-15',
          amount: 4980,
          status: 'completed',
          transactionId: 'txn_1234567890'
        },
        failedPayments: 0,
        totalRevenue: 14940,
        notes: 'Mükemmel müşteri, hiç sorun yaşamadık. Ödemeleri zamanında yapıyor.',
        paymentHistory: [
          {
            id: 'pay-1',
            date: '2024-03-15',
            amount: 4980,
            status: 'completed',
            method: 'card',
            transactionId: 'txn_1234567890'
          },
          {
            id: 'pay-2',
            date: '2024-02-15',
            amount: 4980,
            status: 'completed',
            method: 'card',
            transactionId: 'txn_0987654321'
          },
          {
            id: 'pay-3',
            date: '2024-01-15',
            amount: 4980,
            status: 'completed',
            method: 'card',
            transactionId: 'txn_1122334455'
          }
        ]
      };
      
      setSubscription(demoSubscription);
      setIsLoading(false);
    };

    if (subscriptionId) {
      loadSubscription();
    }
  }, [subscriptionId]);

  const handleAction = async (actionType: string) => {
    if (!subscription) return;
    
    setIsProcessing(true);
    setAction(actionType);
    
    try {
      // Demo: Abonelik işlemi simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let newStatus = subscription.status;
      switch (actionType) {
        case 'activate':
          newStatus = 'active';
          break;
        case 'suspend':
          newStatus = 'suspended';
          break;
        case 'cancel':
          newStatus = 'cancelled';
          break;
        case 'refresh':
          // Token yenileme işlemi
          break;
      }
      
      setSubscription(prev => prev ? { ...prev, status: newStatus } : null);
      
      alert(`${actionType} işlemi başarıyla tamamlandı`);
    } catch (error) {
      console.error('Action error:', error);
      alert('İşlem sırasında bir hata oluştu');
    } finally {
      setIsProcessing(false);
      setAction(null);
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'active': return 'Aktif';
      case 'expired': return 'Süresi Dolmuş';
      case 'cancelled': return 'İptal Edilmiş';
      case 'suspended': return 'Askıya Alınmış';
      case 'pending': return 'Beklemede';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active': return <FaCheckCircle className="text-green-600" />;
      case 'expired': return <FaExclamationTriangle className="text-red-600" />;
      case 'cancelled': return <FaTimes className="text-gray-600" />;
      case 'suspended': return <FaPause className="text-yellow-600" />;
      case 'pending': return <FaClock className="text-blue-600" />;
      default: return <FaExclamationTriangle className="text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Abonelik yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Abonelik Bulunamadı</h1>
          <p className="text-gray-600 mb-4">Aradığınız abonelik bulunamadı.</p>
          <Link href="/admin/subscriptions" className="text-blue-600 hover:underline">
            Abonelikler listesine dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href="/admin/subscriptions"
                className="mr-4 text-gray-600 hover:text-gray-800"
              >
                <FaArrowLeft className="text-xl" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Abonelik Detayları</h1>
                <p className="text-gray-600 mt-1">{subscription.restaurantName} - {subscription.plan.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-sm rounded-full font-medium flex items-center ${getStatusClass(subscription.status)}`}>
                {getStatusIcon(subscription.status)}
                <span className="ml-1">{getStatusText(subscription.status)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Kolon - Abonelik Bilgileri */}
          <div className="lg:col-span-2 space-y-6">
            {/* İşletme Bilgileri */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaBuilding className="mr-2" />
                İşletme Bilgileri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">İşletme Adı</label>
                  <p className="mt-1 text-sm text-gray-900">{subscription.restaurantName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">İşletme ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{subscription.restaurantId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sahip</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <FaUser className="mr-2 text-gray-400" />
                    {subscription.owner.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <FaEnvelope className="mr-2 text-gray-400" />
                    {subscription.owner.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefon</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <FaPhone className="mr-2 text-gray-400" />
                    {subscription.owner.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Plan Bilgileri */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaCreditCard className="mr-2" />
                Plan Bilgileri
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plan Adı</label>
                    <p className="mt-1 text-sm text-gray-900">{subscription.plan.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Aylık Tutar</label>
                    <p className="mt-1 text-sm text-gray-900">₺{subscription.plan.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Faturalandırma Dönemi</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{subscription.plan.billingCycle}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Para Birimi</label>
                    <p className="mt-1 text-sm text-gray-900">{subscription.plan.currency}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plan Özellikleri</label>
                  <ul className="space-y-1">
                    {subscription.plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <FaCheckCircle className="mr-2 text-green-500 text-xs" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Ödeme Geçmişi */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaHistory className="mr-2" />
                Ödeme Geçmişi
              </h2>
              <div className="space-y-3">
                {subscription.paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {payment.status === 'completed' ? (
                          <FaCheckCircle className="text-green-500" />
                        ) : (
                          <FaExclamationTriangle className="text-red-500" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(payment.date).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.transactionId} • {payment.method}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ₺{payment.amount.toLocaleString()}
                      </div>
                      <div className={`text-xs ${
                        payment.status === 'completed' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {payment.status === 'completed' ? 'Tamamlandı' : 'Başarısız'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ Kolon - İşlemler ve Bilgiler */}
          <div className="space-y-6">
            {/* Hızlı İşlemler */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
              
              <div className="space-y-3">
                {subscription.status === 'active' ? (
                  <button
                    onClick={() => handleAction('suspend')}
                    disabled={isProcessing}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
                  >
                    {isProcessing && action === 'suspend' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <FaPause className="mr-2" />
                        Askıya Al
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction('activate')}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
                  >
                    {isProcessing && action === 'activate' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <FaPlay className="mr-2" />
                        Aktifleştir
                      </>
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => handleAction('cancel')}
                  disabled={isProcessing}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
                >
                  {isProcessing && action === 'cancel' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FaTimes className="mr-2" />
                      İptal Et
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleAction('refresh')}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
                >
                  {isProcessing && action === 'refresh' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FaSync className="mr-2" />
                      Token Yenile
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Abonelik Durumu */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Abonelik Durumu</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Başlangıç Tarihi</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(subscription.startDate).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bitiş Tarihi</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(subscription.endDate).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sonraki Ödeme</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(subscription.nextBillingDate).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ödeme Yöntemi</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {subscription.paymentMethod.type}
                    {subscription.paymentMethod.last4 && ` •••• ${subscription.paymentMethod.last4}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Başarısız Ödeme</span>
                  <span className={`text-sm font-medium ${subscription.failedPayments > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {subscription.failedPayments}
                  </span>
                </div>
              </div>
            </div>

            {/* Gelir Bilgileri */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaMoneyBillWave className="mr-2" />
                Gelir Bilgileri
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Toplam Gelir</span>
                  <span className="text-lg font-bold text-gray-900">
                    ₺{subscription.totalRevenue.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Aylık Gelir</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₺{subscription.plan.amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Son Ödeme</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₺{subscription.lastPayment.amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Son Ödeme Tarihi</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(subscription.lastPayment.date).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Notlar */}
            {subscription.notes && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notlar</h2>
                <p className="text-sm text-gray-700">{subscription.notes}</p>
              </div>
            )}

            {/* Hızlı Erişim */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Erişim</h2>
              
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center">
                  <FaFileAlt className="mr-2" />
                  Fatura İndir
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center">
                  <FaDownload className="mr-2" />
                  Rapor Oluştur
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center">
                  <FaEdit className="mr-2" />
                  Düzenle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
