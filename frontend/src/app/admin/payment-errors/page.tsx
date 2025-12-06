'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaExclamationTriangle, 
  FaSearch, 
  FaFilter, 
  FaEye,
  FaSync,
  FaDownload,
  FaCreditCard,
  FaCalendarAlt,
  FaBuilding,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMoneyBillWave,
  FaChartLine,
  FaCheckCircle,
  FaTimes,
  FaClock,
  FaBan,
  FaRedo,
  FaPaperPlane,
  FaFileAlt,
  FaHistory
} from 'react-icons/fa';

interface PaymentError {
  id: string;
  subscriptionId: string;
  restaurantId: string;
  restaurantName: string;
  owner: string;
  email: string;
  phone: string;
  plan: string;
  amount: number;
  currency: string;
  errorCode: string;
  errorMessage: string;
  errorType: 'card_declined' | 'insufficient_funds' | 'expired_card' | 'network_error' | 'fraud_detected' | 'other';
  paymentMethod: string;
  last4?: string;
  attemptCount: number;
  firstAttempt: string;
  lastAttempt: string;
  nextRetry?: string;
  status: 'pending' | 'resolved' | 'failed' | 'cancelled';
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

export default function PaymentErrorsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [errorTypeFilter, setErrorTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lastAttempt');
  const [selectedErrors, setSelectedErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const paymentErrors: PaymentError[] = [
    // Demo veriler temizlendi - boş başlangıç
  ];

  const getErrorTypeClass = (errorType: string) => {
    switch(errorType) {
      case 'card_declined': return 'bg-red-100 text-red-800';
      case 'insufficient_funds': return 'bg-orange-100 text-orange-800';
      case 'expired_card': return 'bg-yellow-100 text-yellow-800';
      case 'network_error': return 'bg-blue-100 text-blue-800';
      case 'fraud_detected': return 'bg-purple-100 text-purple-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getErrorTypeText = (errorType: string) => {
    switch(errorType) {
      case 'card_declined': return 'Kart Reddedildi';
      case 'insufficient_funds': return 'Yetersiz Bakiye';
      case 'expired_card': return 'Kart Süresi Dolmuş';
      case 'network_error': return 'Ağ Hatası';
      case 'fraud_detected': return 'Dolandırıcılık';
      case 'other': return 'Diğer';
      default: return errorType;
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return 'Beklemede';
      case 'resolved': return 'Çözüldü';
      case 'failed': return 'Başarısız';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <FaClock className="text-yellow-600" />;
      case 'resolved': return <FaCheckCircle className="text-green-600" />;
      case 'failed': return <FaTimes className="text-red-600" />;
      case 'cancelled': return <FaBan className="text-gray-600" />;
      default: return <FaExclamationTriangle className="text-gray-600" />;
    }
  };

  const filteredErrors = paymentErrors.filter(error => {
    const matchesSearch = error.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         error.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         error.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         error.errorMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || error.status === statusFilter;
    const matchesErrorType = errorTypeFilter === 'all' || error.errorType === errorTypeFilter;
    return matchesSearch && matchesStatus && matchesErrorType;
  });

  const handleBulkAction = async (action: string) => {
    if (selectedErrors.length === 0) {
      alert('Lütfen işlem yapmak istediğiniz hataları seçin');
      return;
    }

    setIsLoading(true);
    try {
      // Demo: Toplu işlem simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`${action} işlemi:`, selectedErrors);
      alert(`${selectedErrors.length} hata için ${action} işlemi tamamlandı`);
      setSelectedErrors([]);
    } catch (error) {
      console.error('Bulk action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleErrorAction = async (errorId: string, action: string) => {
    setIsLoading(true);
    try {
      // Demo: Tekil işlem simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`${action} işlemi:`, errorId);
      alert(`${action} işlemi tamamlandı`);
    } catch (error) {
      console.error('Error action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Ödeme Hataları" description="Ödeme hatalarını takip edin">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ödeme Hataları Takibi</h1>
              <p className="text-gray-600 mt-1">Başarısız ödemeleri görüntüle ve yönet</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => handleBulkAction('retry')}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg flex items-center"
              >
                <FaRedo className="mr-2" />
                Toplu Yeniden Dene
              </button>
              <button 
                onClick={() => handleBulkAction('export')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center"
              >
                <FaDownload className="mr-2" />
                Dışa Aktar
              </button>
              <button 
                onClick={() => handleBulkAction('refresh')}
                className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg flex items-center"
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
                  placeholder="İşletme, sahibi, email veya hata mesajı..."
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
                <option value="pending">Beklemede</option>
                <option value="resolved">Çözüldü</option>
                <option value="failed">Başarısız</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hata Türü</label>
              <select
                value={errorTypeFilter}
                onChange={(e) => setErrorTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Hata Türleri</option>
                <option value="card_declined">Kart Reddedildi</option>
                <option value="insufficient_funds">Yetersiz Bakiye</option>
                <option value="expired_card">Kart Süresi Dolmuş</option>
                <option value="network_error">Ağ Hatası</option>
                <option value="fraud_detected">Dolandırıcılık</option>
                <option value="other">Diğer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sıralama</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="lastAttempt">Son Deneme</option>
                <option value="restaurantName">İşletme Adı</option>
                <option value="amount">Tutar</option>
                <option value="attemptCount">Deneme Sayısı</option>
                <option value="errorType">Hata Türü</option>
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
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Toplam Hata</p>
                <p className="text-2xl font-bold text-gray-900">{paymentErrors.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Beklemede</p>
                <p className="text-2xl font-bold text-gray-900">{paymentErrors.filter(e => e.status === 'pending').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Çözüldü</p>
                <p className="text-2xl font-bold text-gray-900">{paymentErrors.filter(e => e.status === 'resolved').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <FaTimes className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Başarısız</p>
                <p className="text-2xl font-bold text-gray-900">{paymentErrors.filter(e => e.status === 'failed').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <FaMoneyBillWave className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Kayıp Gelir</p>
                <p className="text-2xl font-bold text-gray-900">₺{paymentErrors.filter(e => e.status === 'pending' || e.status === 'failed').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedErrors.length > 0 && (
        <div className="px-8 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-blue-700 font-medium">
                  {selectedErrors.length} hata seçildi
                </span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleBulkAction('retry')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Yeniden Dene
                </button>
                <button 
                  onClick={() => handleBulkAction('resolve')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  Çözüldü İşaretle
                </button>
                <button 
                  onClick={() => handleBulkAction('cancel')}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  İptal Et
                </button>
                <button 
                  onClick={() => setSelectedErrors([])}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                >
                  Temizle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Errors Table */}
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
                          setSelectedErrors(filteredErrors.map(e => e.id));
                        } else {
                          setSelectedErrors([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşletme</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hata Detayı</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deneme Bilgileri</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Deneme</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredErrors.map((error) => (
                  <tr key={error.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedErrors.includes(error.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedErrors([...selectedErrors, error.id]);
                          } else {
                            setSelectedErrors(selectedErrors.filter(id => id !== error.id));
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
                          <div className="text-sm font-medium text-gray-900">{error.restaurantName}</div>
                          <div className="text-sm text-gray-500">{error.owner}</div>
                          <div className="text-xs text-gray-400">{error.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getErrorTypeClass(error.errorType)}`}>
                          {getErrorTypeText(error.errorType)}
                        </span>
                        <div className="text-sm text-gray-900">{error.errorMessage}</div>
                        <div className="text-xs text-gray-500">Kod: {error.errorCode}</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium flex items-center ${getStatusClass(error.status)}`}>
                          {getStatusIcon(error.status)}
                          <span className="ml-1">{getStatusText(error.status)}</span>
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{error.attemptCount} deneme</div>
                        <div className="text-gray-500">{error.paymentMethod} •••• {error.last4}</div>
                        {error.nextRetry && (
                          <div className="text-xs text-blue-600">
                            Sonraki: {new Date(error.nextRetry).toLocaleDateString('tr-TR')}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">₺{error.amount.toLocaleString()}</div>
                        <div className="text-gray-500">{error.plan} Plan</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(error.lastAttempt).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(error.lastAttempt).toLocaleTimeString('tr-TR')}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/admin/payment-errors/${error.id}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="Detayları Görüntüle"
                        >
                          <FaEye className="text-sm" />
                        </Link>
                        {error.status === 'pending' && (
                          <button 
                            className="text-green-600 hover:text-green-800"
                            title="Yeniden Dene"
                            onClick={() => handleErrorAction(error.id, 'retry')}
                          >
                            <FaRedo className="text-sm" />
                          </button>
                        )}
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          title="Email Gönder"
                          onClick={() => handleErrorAction(error.id, 'email')}
                        >
                          <FaPaperPlane className="text-sm" />
                        </button>
                        <button 
                          className="text-gray-600 hover:text-gray-800"
                          title="Not Ekle"
                          onClick={() => handleErrorAction(error.id, 'note')}
                        >
                          <FaFileAlt className="text-sm" />
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
