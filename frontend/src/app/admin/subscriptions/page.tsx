'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaBuilding, 
  FaSearch, 
  FaFilter, 
  FaEye,
  FaEdit,
  FaCreditCard,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaBan,
  FaMoneyBillWave,
  FaChartLine,
  FaDownload,
  FaSync,
  FaPause,
  FaPlay,
  FaTimes
} from 'react-icons/fa';

interface Subscription {
  id: string;
  restaurantId: string;
  restaurantName: string;
  owner: string;
  email: string;
  phone: string;
  plan: 'basic' | 'pro' | 'premium';
  status: 'active' | 'expired' | 'cancelled' | 'suspended' | 'pending';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  paymentMethod: 'card' | 'bank_transfer' | 'other';
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  failedPayments: number;
  totalRevenue: number;
  notes?: string;
}

export default function SubscriptionsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortBy, setSortBy] = useState('restaurantName');
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const subscriptions: Subscription[] = [
    // Demo veriler temizlendi - boş başlangıç
  ];

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

  const getPlanClass = (plan: string) => {
    switch(plan) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanText = (plan: string) => {
    switch(plan) {
      case 'basic': return 'Temel';
      case 'pro': return 'Pro';
      case 'premium': return 'Premium';
      default: return plan;
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    const matchesPlan = planFilter === 'all' || subscription.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleBulkAction = async (action: string) => {
    if (selectedSubscriptions.length === 0) {
      alert('Lütfen işlem yapmak istediğiniz abonelikleri seçin');
      return;
    }

    setIsLoading(true);
    try {
      // Demo: Toplu işlem simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`${action} işlemi:`, selectedSubscriptions);
      alert(`${selectedSubscriptions.length} abonelik için ${action} işlemi tamamlandı`);
      setSelectedSubscriptions([]);
    } catch (error) {
      console.error('Bulk action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscriptionAction = async (subscriptionId: string, action: string) => {
    setIsLoading(true);
    try {
      // Demo: Tekil işlem simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`${action} işlemi:`, subscriptionId);
      alert(`${action} işlemi tamamlandı`);
    } catch (error) {
      console.error('Subscription action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Abonelik Yönetimi" description="Restoran aboneliklerini yönetin">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Abonelik Yönetimi</h1>
              <p className="text-gray-600 mt-1">Tüm abonelikleri görüntüle ve yönet</p>
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
                onClick={() => handleBulkAction('refresh')}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg flex items-center"
              >
                <FaSync className="mr-2" />
                Yenile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="İşletme adı, sahibi veya email..."
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
                <option value="active">Aktif</option>
                <option value="expired">Süresi Dolmuş</option>
                <option value="cancelled">İptal Edilmiş</option>
                <option value="suspended">Askıya Alınmış</option>
                <option value="pending">Beklemede</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Planlar</option>
                <option value="basic">Temel</option>
                <option value="pro">Pro</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sıralama</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="restaurantName">İşletme Adı</option>
                <option value="nextBillingDate">Sonraki Ödeme</option>
                <option value="amount">Tutar</option>
                <option value="status">Durum</option>
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
      </div>

      {/* Statistics */}
      <div className="px-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <FaCreditCard className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Toplam Abonelik</p>
                <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Aktif Abonelik</p>
                <p className="text-2xl font-bold text-gray-900">{subscriptions.filter(s => s.status === 'active').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sorunlu Abonelik</p>
                <p className="text-2xl font-bold text-gray-900">{subscriptions.filter(s => s.status === 'expired' || s.failedPayments > 0).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <FaMoneyBillWave className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Aylık Gelir</p>
                <p className="text-2xl font-bold text-gray-900">₺{subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <FaChartLine className="text-orange-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Toplam Gelir</p>
                <p className="text-2xl font-bold text-gray-900">₺{subscriptions.reduce((sum, s) => sum + s.totalRevenue, 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSubscriptions.length > 0 && (
        <div className="px-8 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-blue-700 font-medium">
                  {selectedSubscriptions.length} abonelik seçildi
                </span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleBulkAction('activate')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  Aktifleştir
                </button>
                <button 
                  onClick={() => handleBulkAction('suspend')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                >
                  Askıya Al
                </button>
                <button 
                  onClick={() => handleBulkAction('cancel')}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  İptal Et
                </button>
                <button 
                  onClick={() => setSelectedSubscriptions([])}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                >
                  Temizle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubscriptions(filteredSubscriptions.map(s => s.id));
                        } else {
                          setSelectedSubscriptions([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşletme</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödeme Bilgileri</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sonraki Ödeme</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gelir</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedSubscriptions.includes(subscription.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubscriptions([...selectedSubscriptions, subscription.id]);
                          } else {
                            setSelectedSubscriptions(selectedSubscriptions.filter(id => id !== subscription.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                          <FaBuilding className="text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{subscription.restaurantName}</div>
                          <div className="text-sm text-gray-500">{subscription.owner}</div>
                          <div className="text-xs text-gray-400">{subscription.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPlanClass(subscription.plan)}`}>
                        {getPlanText(subscription.plan)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">₺{subscription.amount}/ay</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium flex items-center ${getStatusClass(subscription.status)}`}>
                          {getStatusIcon(subscription.status)}
                          <span className="ml-1">{getStatusText(subscription.status)}</span>
                        </span>
                      </div>
                      {subscription.failedPayments > 0 && (
                        <div className="text-xs text-red-600 mt-1">{subscription.failedPayments} başarısız ödeme</div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 capitalize">{subscription.paymentMethod.replace('_', ' ')}</div>
                        <div className="text-gray-500">{subscription.billingCycle}</div>
                        {subscription.lastPaymentDate && (
                          <div className="text-xs text-gray-400">
                            Son: {new Date(subscription.lastPaymentDate).toLocaleDateString('tr-TR')}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(subscription.nextBillingDate).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.ceil((new Date(subscription.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} gün kaldı
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">₺{subscription.totalRevenue.toLocaleString()}</div>
                        <div className="text-gray-500">Toplam</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/admin/subscriptions/${subscription.id}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="Detayları Görüntüle"
                        >
                          <FaEye className="text-sm" />
                        </Link>
                        <button 
                          className="text-green-600 hover:text-green-800"
                          title="Düzenle"
                          onClick={() => handleSubscriptionAction(subscription.id, 'edit')}
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        {subscription.status === 'active' ? (
                          <button 
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Askıya Al"
                            onClick={() => handleSubscriptionAction(subscription.id, 'suspend')}
                          >
                            <FaPause className="text-sm" />
                          </button>
                        ) : (
                          <button 
                            className="text-green-600 hover:text-green-800"
                            title="Aktifleştir"
                            onClick={() => handleSubscriptionAction(subscription.id, 'activate')}
                          >
                            <FaPlay className="text-sm" />
                          </button>
                        )}
                        <button 
                          className="text-red-600 hover:text-red-800"
                          title="İptal Et"
                          onClick={() => handleSubscriptionAction(subscription.id, 'cancel')}
                        >
                          <FaTimes className="text-sm" />
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
    </AdminLayout>
  );
}
