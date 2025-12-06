'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BusinessSidebar from '@/components/BusinessSidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useFeature } from '@/hooks/useFeature';
import { apiService } from '@/services/api';
import { 
  FaCashRegister, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaBars,
  FaSync,
  FaChartLine,
  FaClock,
  FaReceipt
} from 'react-icons/fa';

interface POSDevice {
  id: string;
  name: string;
  deviceId: string;
  location: string;
  status: 'online' | 'offline' | 'syncing';
  lastSync: string;
  todayTransactions: number;
  todayRevenue: number;
  battery: number;
}

export default function POSPage() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuthStore();
  const hasPOSIntegration = useFeature('pos_integration');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);
  const [posDevices, setPosDevices] = useState<POSDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDevice, setEditingDevice] = useState<POSDevice | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    deviceId: '',
    location: '',
    battery: 100
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/isletme-giris');
    } else {
      fetchPOSDevices();
    }
  }, [isAuthenticated, router]);

  const fetchPOSDevices = async () => {
    try {
      setLoading(true);
      const restaurantId = user?.id;
      if (!restaurantId) return;
      
      const response = await apiService.getPOSDevices(restaurantId);
      if (response.success && response.data) {
        // Backend'den gelen veriyi frontend formatına çevir
        const transformedDevices = response.data.map((device: any) => ({
          id: device.id,
          name: device.name,
          deviceId: device.deviceId || device.device_id || '',
          location: device.location || '',
          status: device.status || 'offline',
          lastSync: device.lastSync || device.last_sync || new Date().toISOString(),
          todayTransactions: device.todayTransactions || device.today_transactions || 0,
          todayRevenue: parseFloat(device.todayRevenue || device.today_revenue || 0),
          battery: device.battery || 100
        }));
        setPosDevices(transformedDevices);
      }
    } catch (error) {
      console.error('POS cihazları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPOSDevice = async () => {
    if (!formData.name || !formData.deviceId || !formData.location) {
      alert('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    try {
      const restaurantId = user?.id;
      if (!restaurantId) return;

      const response = await apiService.createPOSDevice({
        restaurantId,
        name: formData.name,
        deviceId: formData.deviceId,
        location: formData.location,
        battery: formData.battery
      });
      
      if (response.success) {
        await fetchPOSDevices();
        setShowAddModal(false);
        resetForm();
      } else {
        alert('POS cihazı eklenirken hata oluştu.');
      }
    } catch (error) {
      console.error('POS cihazı eklenirken hata:', error);
      alert('POS cihazı eklenirken hata oluştu.');
    }
  };

  const handleEditClick = (device: POSDevice) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      deviceId: device.deviceId,
      location: device.location,
      battery: device.battery
    });
    setShowEditModal(true);
  };

  const handleUpdatePOSDevice = async () => {
    if (!formData.name || !formData.deviceId || !formData.location) {
      alert('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    if (!editingDevice) return;

    try {
      const response = await apiService.updatePOSDevice(editingDevice.id, {
        name: formData.name,
        deviceId: formData.deviceId,
        location: formData.location,
        battery: formData.battery
      });
      
      if (response.success) {
        await fetchPOSDevices();
        setShowEditModal(false);
        setEditingDevice(null);
        resetForm();
      } else {
        alert('POS cihazı güncellenirken hata oluştu.');
      }
    } catch (error) {
      console.error('POS cihazı güncellenirken hata:', error);
      alert('POS cihazı güncellenirken hata oluştu.');
    }
  };

  const handleDeleteClick = (deviceId: string) => {
    setDeviceToDelete(deviceId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deviceToDelete) return;

    try {
      const response = await apiService.deletePOSDevice(deviceToDelete);
      if (response.success) {
        await fetchPOSDevices();
        setShowDeleteConfirm(false);
        setDeviceToDelete(null);
      } else {
        alert('POS cihazı silinirken hata oluştu.');
      }
    } catch (error) {
      console.error('POS cihazı silinirken hata:', error);
      alert('POS cihazı silinirken hata oluştu.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      deviceId: '',
      location: '',
      battery: 100
    });
  };

  const handleSyncPOSDevice = async (id: string) => {
    try {
      const response = await apiService.syncPOSDevice(id);
      if (response.success) {
        await fetchPOSDevices();
      }
    } catch (error) {
      console.error('POS cihazı senkronize edilirken hata:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/isletme-giris');
    }
  }, [isAuthenticated, router]);

  // Özellik kontrolü
  if (!hasPOSIntegration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <FaCashRegister className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">POS Entegrasyonu</h2>
          <p className="text-gray-600 mb-4">
            Bu özellik planınızda bulunmuyor. POS entegrasyonu özelliğini kullanmak için planınızı yükseltin.
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
      case 'online': return 'bg-green-100 text-green-700';
      case 'offline': return 'bg-red-100 text-red-700';
      case 'syncing': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <FaCheckCircle />;
      case 'offline': return <FaTimesCircle />;
      case 'syncing': return <FaSync className="animate-spin" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Çevrimiçi';
      case 'offline': return 'Çevrimdışı';
      case 'syncing': return 'Senkronize Ediliyor';
      default: return status;
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return 'text-green-600';
    if (battery > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredDevices = posDevices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const onlineDevices = posDevices.filter(d => d.status === 'online').length;
  const totalTransactions = posDevices.reduce((sum, d) => sum + d.todayTransactions, 0);
  const totalRevenue = posDevices.reduce((sum, d) => sum + d.todayRevenue, 0);

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
                    <FaCashRegister className="text-teal-600" />
                    POS Entegrasyonu
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">POS cihazlarınızı yönetin ve izleyin</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
              >
                <FaPlus />
                <span className="hidden sm:inline">Yeni Cihaz</span>
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
                  <p className="text-sm text-gray-600">Toplam Cihaz</p>
                  <p className="text-2xl font-bold text-gray-900">{posDevices.length}</p>
                </div>
                <FaCashRegister className="text-3xl text-teal-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Çevrimiçi</p>
                  <p className="text-2xl font-bold text-green-600">{onlineDevices}</p>
                </div>
                <FaCheckCircle className="text-3xl text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bugünkü İşlem</p>
                  <p className="text-2xl font-bold text-blue-600">{totalTransactions}</p>
                </div>
                <FaReceipt className="text-3xl text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bugünkü Ciro</p>
                  <p className="text-2xl font-bold text-teal-600">₺{totalRevenue.toLocaleString()}</p>
                </div>
                <FaChartLine className="text-3xl text-teal-500" />
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
                  placeholder="Cihaz adı, ID veya lokasyon ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="online">Çevrimiçi</option>
                <option value="offline">Çevrimdışı</option>
                <option value="syncing">Senkronize Ediliyor</option>
              </select>
            </div>
          </div>

          {/* POS Devices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredDevices.map((device) => (
              <div key={device.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                        <FaCashRegister className="text-2xl text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{device.name}</h3>
                        <p className="text-sm text-gray-600">{device.deviceId}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(device.status)}`}>
                      {getStatusIcon(device.status)}
                      {getStatusText(device.status)}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Lokasyon:</span>
                      <span className="font-medium text-gray-900">{device.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Son Senkronizasyon:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(device.lastSync).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Batarya:</span>
                      <span className={`font-bold ${getBatteryColor(device.battery)}`}>
                        %{device.battery}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Bugünkü İşlem</p>
                      <p className="text-lg font-bold text-gray-900">{device.todayTransactions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Bugünkü Ciro</p>
                      <p className="text-lg font-bold text-green-600">₺{device.todayRevenue.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {device.status !== 'offline' && (
                      <button 
                        onClick={() => handleSyncPOSDevice(device.id)}
                        className="flex-1 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <FaSync />
                        Senkronize Et
                      </button>
                    )}
                    <button 
                      onClick={() => handleEditClick(device)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(device.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDevices.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FaCashRegister className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">POS cihazı bulunamadı</p>
            </div>
          )}

          {/* Integration Info */}
          <div className="mt-6 bg-teal-50 rounded-lg p-6 border border-teal-200">
            <h3 className="font-bold text-teal-900 mb-2 flex items-center gap-2">
              <FaCashRegister />
              Desteklenen POS Sistemleri
            </h3>
            <p className="text-sm text-teal-800 mb-4">
              Olivetti, Hugin, Datecs ve daha fazla POS sistemi ile entegre olun.
            </p>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              Entegrasyon Ayarları
            </button>
          </div>
        </div>
      </div>

      {/* Add POS Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Yeni POS Cihazı Ekle</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cihaz Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Örn: Kasa 1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cihaz ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.deviceId}
                    onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Örn: POS-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lokasyon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Örn: Ana Kasa"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batarya Seviyesi (%)
                </label>
                <input
                  type="number"
                  value={formData.battery}
                  onChange={(e) => setFormData({ ...formData, battery: parseInt(e.target.value) || 100 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                onClick={handleAddPOSDevice}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit POS Device Modal */}
      {showEditModal && editingDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">POS Cihazını Düzenle</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cihaz Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Örn: Kasa 1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cihaz ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.deviceId}
                    onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Örn: POS-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lokasyon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Örn: Ana Kasa"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batarya Seviyesi (%)
                </label>
                <input
                  type="number"
                  value={formData.battery}
                  onChange={(e) => setFormData({ ...formData, battery: parseInt(e.target.value) || 100 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDevice(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                onClick={handleUpdatePOSDevice}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaTrash className="text-red-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">POS Cihazını Sil</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Bu POS cihazını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeviceToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  İptal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

