'use client';

import { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit,
  FaTrash,
  FaEye, 
  FaGlobe, 
  FaServer,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

interface Subdomain {
  id: string;
  name: string;
  restaurantName: string;
  ownerName: string;
  ownerEmail: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  dnsStatus: 'configured' | 'pending' | 'error';
  menuItems: number;
  orders: number;
}

export default function SubdomainManagement() {
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubdomain, setSelectedSubdomain] = useState<Subdomain | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data - gerçek uygulamada API'den gelecek
  useEffect(() => {
    const mockSubdomains: Subdomain[] = [
      {
        id: '1',
        name: 'lezzet-duragi',
        restaurantName: 'Lezzet Durağı',
        ownerName: 'Ahmet Kaya',
        ownerEmail: 'ahmet@lezzetduragi.com',
        plan: 'premium',
        status: 'active',
        createdAt: '2024-01-15',
        dnsStatus: 'configured',
        menuItems: 45,
        orders: 1250
      },
      {
        id: '2',
        name: 'cafe-corner',
        restaurantName: 'Cafe Corner',
        ownerName: 'Mehmet Özkan',
        ownerEmail: 'mehmet@cafecorner.com',
        plan: 'basic',
        status: 'active',
        createdAt: '2024-01-20',
        dnsStatus: 'configured',
        menuItems: 32,
        orders: 890
      },
      {
        id: '3',
        name: 'bistro-34',
        restaurantName: 'Bistro 34',
        ownerName: 'Selin Yılmaz',
        ownerEmail: 'selin@bistro34.com',
        plan: 'enterprise',
        status: 'active',
        createdAt: '2024-02-01',
        dnsStatus: 'configured',
        menuItems: 67,
        orders: 2100
      }
    ];
    
    setSubdomains(mockSubdomains);
    setLoading(false);
  }, []);

  const filteredSubdomains = subdomains.filter(subdomain => {
    const matchesSearch = subdomain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subdomain.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subdomain.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || subdomain.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="text-green-500" />;
      case 'inactive':
        return <FaTimesCircle className="text-red-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'bg-gray-100 text-gray-800';
      case 'premium':
        return 'bg-blue-100 text-blue-800';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
        default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateSubdomain = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditSubdomain = (subdomain: Subdomain) => {
    setSelectedSubdomain(subdomain);
    setIsEditModalOpen(true);
  };

  const handleDeleteSubdomain = (id: string) => {
    if (confirm('Bu subdomain\'i silmek istediğinizden emin misiniz?')) {
      setSubdomains(prev => prev.filter(sub => sub.id !== id));
    }
  };

  const handleViewSubdomain = (subdomain: Subdomain) => {
    window.open(`https://${subdomain.name}.guzellestir.com`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subdomain Yönetimi</h1>
              <p className="text-gray-600 mt-1">Restoran subdomain'lerini yönet</p>
            </div>
            <button
              onClick={handleCreateSubdomain}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FaPlus className="mr-2" />
              Yeni Subdomain
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-8 py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Subdomain, restoran adı veya sahip adı ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <FaFilter className="mr-2 text-gray-400" />
            <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
              <option value="pending">Beklemede</option>
            </select>
          </div>
        </div>
      </div>
        </div>
                  </div>
                  
      {/* Subdomains Table */}
      <div className="px-8 pb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Yükleniyor...</p>
                    </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subdomain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restoran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sahip
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DNS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İstatistikler
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubdomains.map((subdomain) => (
                    <tr key={subdomain.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaGlobe className="mr-2 text-blue-500" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {subdomain.name}.guzellestir.com
                    </div>
                            <div className="text-sm text-gray-500">
                              {subdomain.createdAt}
                    </div>
                  </div>
                </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {subdomain.restaurantName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{subdomain.ownerName}</div>
                        <div className="text-sm text-gray-500">{subdomain.ownerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanBadgeColor(subdomain.plan)}`}>
                          {subdomain.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(subdomain.status)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">
                            {subdomain.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaServer className="mr-1 text-gray-400" />
                          <span className="text-sm text-gray-900 capitalize">
                            {subdomain.dnsStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{subdomain.menuItems} menü</div>
                        <div>{subdomain.orders} sipariş</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                            onClick={() => handleViewSubdomain(subdomain)}
                            className="text-blue-600 hover:text-blue-900"
                      title="Görüntüle"
                    >
                      <FaEye />
                    </button>
                    <button
                            onClick={() => handleEditSubdomain(subdomain)}
                            className="text-indigo-600 hover:text-indigo-900"
                      title="Düzenle"
                    >
                      <FaEdit />
                    </button>
                    <button
                            onClick={() => handleDeleteSubdomain(subdomain.id)}
                            className="text-red-600 hover:text-red-900"
                      title="Sil"
                    >
                      <FaTrash />
                    </button>
                  </div>
                      </td>
                    </tr>
          ))}
                </tbody>
              </table>
        
        {filteredSubdomains.length === 0 && (
                <div className="text-center py-8">
                  <FaGlobe className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Subdomain bulunamadı</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Arama kriterlerinize uygun subdomain bulunamadı.'
                      : 'Henüz hiç subdomain oluşturulmamış.'
                    }
                  </p>
                  {(!searchTerm && filterStatus === 'all') && (
                    <div className="mt-6">
                      <button
                        onClick={handleCreateSubdomain}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
                      >
                        <FaPlus className="mr-2" />
                        İlk Subdomain'i Oluştur
                      </button>
                    </div>
                  )}
                </div>
              )}
          </div>
        )}
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreateSubdomainModal
          onClose={() => setIsCreateModalOpen(false)}
          onSave={(newSubdomain) => {
            setSubdomains(prev => [...prev, newSubdomain]);
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedSubdomain && (
        <EditSubdomainModal
          subdomain={selectedSubdomain}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSubdomain(null);
          }}
          onSave={(updatedSubdomain) => {
            setSubdomains(prev => prev.map(sub => 
              sub.id === updatedSubdomain.id ? updatedSubdomain : sub
            ));
            setIsEditModalOpen(false);
            setSelectedSubdomain(null);
          }}
        />
      )}
    </div>
  );
}

// Create Subdomain Modal Component
function CreateSubdomainModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (subdomain: Subdomain) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    restaurantName: '',
    ownerName: '',
    ownerEmail: '',
    plan: 'basic' as 'basic' | 'premium' | 'enterprise'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSubdomain: Subdomain = {
      id: Date.now().toString(),
      name: formData.name,
      restaurantName: formData.restaurantName,
      ownerName: formData.ownerName,
      ownerEmail: formData.ownerEmail,
      plan: formData.plan,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      dnsStatus: 'pending',
      menuItems: 0,
      orders: 0
    };

    onSave(newSubdomain);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Yeni Subdomain Oluştur</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subdomain Adı
            </label>
            <div className="flex">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="restoran-adi"
                required
              />
              <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500">
                .guzellestir.com
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restoran Adı
            </label>
            <input
              type="text"
              value={formData.restaurantName}
              onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Restoran Adı"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sahip Adı
            </label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ad Soyad"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta
            </label>
            <input
              type="email"
              value={formData.ownerEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, ownerEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan
            </label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Subdomain Modal Component
function EditSubdomainModal({ subdomain, onClose, onSave }: {
  subdomain: Subdomain;
  onClose: () => void;
  onSave: (subdomain: Subdomain) => void;
}) {
  const [formData, setFormData] = useState({
    name: subdomain.name,
    restaurantName: subdomain.restaurantName,
    ownerName: subdomain.ownerName,
    ownerEmail: subdomain.ownerEmail,
    plan: subdomain.plan,
    status: subdomain.status
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedSubdomain: Subdomain = {
      ...subdomain,
      ...formData
    };

    onSave(updatedSubdomain);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Subdomain Düzenle</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subdomain Adı
            </label>
            <div className="flex">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500">
                .guzellestir.com
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restoran Adı
            </label>
            <input
              type="text"
              value={formData.restaurantName}
              onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sahip Adı
            </label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta
            </label>
            <input
              type="email"
              value={formData.ownerEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, ownerEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan
            </label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durum
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
              <option value="pending">Beklemede</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}