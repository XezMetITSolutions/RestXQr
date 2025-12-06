'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaUserCheck, 
  FaSearch, 
  FaFilter, 
  FaEye,
  FaCheck,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaCalendarAlt,
  FaClock,
  FaExclamationTriangle,
  FaDownload,
  FaSync,
  FaFileAlt,
  FaPaperPlane,
  FaEdit,
  FaBan,
  FaUserPlus,
  FaUserMinus
} from 'react-icons/fa';

interface UserApproval {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'manager' | 'staff' | 'cashier' | 'waiter' | 'kitchen';
  position: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }>;
  experience: string;
  education: string;
  languages: string[];
  availability: string;
  expectedSalary?: number;
  references: Array<{
    name: string;
    position: string;
    company: string;
    phone: string;
    email: string;
  }>;
}

export default function UserApprovalsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('appliedAt');
  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const userApprovals: UserApproval[] = [
    // Demo veriler temizlendi - boş başlangıç
  ];

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return 'Beklemede';
      case 'approved': return 'Onaylandı';
      case 'rejected': return 'Reddedildi';
      case 'expired': return 'Süresi Doldu';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <FaClock className="text-yellow-600" />;
      case 'approved': return <FaCheck className="text-green-600" />;
      case 'rejected': return <FaTimes className="text-red-600" />;
      case 'expired': return <FaExclamationTriangle className="text-gray-600" />;
      default: return <FaExclamationTriangle className="text-gray-600" />;
    }
  };

  const getRoleClass = (role: string) => {
    switch(role) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      case 'cashier': return 'bg-green-100 text-green-800';
      case 'waiter': return 'bg-orange-100 text-orange-800';
      case 'kitchen': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch(role) {
      case 'manager': return 'Müdür';
      case 'staff': return 'Personel';
      case 'cashier': return 'Kasa';
      case 'waiter': return 'Garson';
      case 'kitchen': return 'Mutfak';
      default: return role;
    }
  };

  const filteredApprovals = userApprovals.filter(approval => {
    const matchesSearch = approval.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || approval.status === statusFilter;
    const matchesRole = roleFilter === 'all' || approval.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleBulkAction = async (action: string) => {
    if (selectedApprovals.length === 0) {
      alert('Lütfen işlem yapmak istediğiniz başvuruları seçin');
      return;
    }

    setIsLoading(true);
    try {
      // Demo: Toplu işlem simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`${action} işlemi:`, selectedApprovals);
      alert(`${selectedApprovals.length} başvuru için ${action} işlemi tamamlandı`);
      setSelectedApprovals([]);
    } catch (error) {
      console.error('Bulk action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalAction = async (approvalId: string, action: string) => {
    setIsLoading(true);
    try {
      // Demo: Tekil işlem simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`${action} işlemi:`, approvalId);
      alert(`${action} işlemi tamamlandı`);
    } catch (error) {
      console.error('Approval action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Kullanıcı Onayları" description="Kullanıcı onaylarını yönetin">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Onay Yönetimi</h1>
              <p className="text-gray-600 mt-1">Personel başvurularını görüntüle ve yönet</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => handleBulkAction('approve')}
                className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg flex items-center"
              >
                <FaCheck className="mr-2" />
                Toplu Onayla
              </button>
              <button 
                onClick={() => handleBulkAction('reject')}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center"
              >
                <FaTimes className="mr-2" />
                Toplu Reddet
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
                  placeholder="Ad, soyad, email, işletme veya pozisyon..."
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
                <option value="approved">Onaylandı</option>
                <option value="rejected">Reddedildi</option>
                <option value="expired">Süresi Doldu</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Roller</option>
                <option value="manager">Müdür</option>
                <option value="staff">Personel</option>
                <option value="cashier">Kasa</option>
                <option value="waiter">Garson</option>
                <option value="kitchen">Mutfak</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sıralama</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="appliedAt">Başvuru Tarihi</option>
                <option value="firstName">Ad</option>
                <option value="restaurantName">İşletme</option>
                <option value="status">Durum</option>
                <option value="role">Rol</option>
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
                <FaUserPlus className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Toplam Başvuru</p>
                <p className="text-2xl font-bold text-gray-900">{userApprovals.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{userApprovals.filter(a => a.status === 'pending').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <FaCheck className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Onaylandı</p>
                <p className="text-2xl font-bold text-gray-900">{userApprovals.filter(a => a.status === 'approved').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <FaTimes className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Reddedildi</p>
                <p className="text-2xl font-bold text-gray-900">{userApprovals.filter(a => a.status === 'rejected').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                <FaExclamationTriangle className="text-gray-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Süresi Doldu</p>
                <p className="text-2xl font-bold text-gray-900">{userApprovals.filter(a => a.status === 'expired').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedApprovals.length > 0 && (
        <div className="px-8 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-blue-700 font-medium">
                  {selectedApprovals.length} başvuru seçildi
                </span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleBulkAction('approve')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  Onayla
                </button>
                <button 
                  onClick={() => handleBulkAction('reject')}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Reddet
                </button>
                <button 
                  onClick={() => handleBulkAction('export')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                >
                  Dışa Aktar
                </button>
                <button 
                  onClick={() => setSelectedApprovals([])}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                >
                  Temizle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Approvals Table */}
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
                          setSelectedApprovals(filteredApprovals.map(a => a.id));
                        } else {
                          setSelectedApprovals([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başvuran</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşletme & Pozisyon</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başvuru Tarihi</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deneyim</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApprovals.map((approval) => (
                  <tr key={approval.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedApprovals.includes(approval.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedApprovals([...selectedApprovals, approval.id]);
                          } else {
                            setSelectedApprovals(selectedApprovals.filter(id => id !== approval.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                          <FaUser className="text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{approval.firstName} {approval.lastName}</div>
                          <div className="text-sm text-gray-500">{approval.email}</div>
                          <div className="text-xs text-gray-400">{approval.phone}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{approval.restaurantName}</div>
                        <div className="text-sm text-gray-500">{approval.position}</div>
                        {approval.expectedSalary && (
                          <div className="text-xs text-gray-400">₺{approval.expectedSalary.toLocaleString()}/ay</div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${getRoleClass(approval.role)}`}>
                        {getRoleText(approval.role)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium flex items-center ${getStatusClass(approval.status)}`}>
                          {getStatusIcon(approval.status)}
                          <span className="ml-1">{getStatusText(approval.status)}</span>
                        </span>
                      </div>
                      {approval.reviewedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(approval.reviewedAt).toLocaleDateString('tr-TR')}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(approval.appliedAt).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(approval.appliedAt).toLocaleTimeString('tr-TR')}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-900">{approval.experience}</div>
                        <div className="text-gray-500">{approval.education}</div>
                        <div className="text-xs text-gray-400">{approval.languages.join(', ')}</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/admin/user-approvals/${approval.id}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="Detayları Görüntüle"
                        >
                          <FaEye className="text-sm" />
                        </Link>
                        {approval.status === 'pending' && (
                          <>
                            <button 
                              className="text-green-600 hover:text-green-800"
                              title="Onayla"
                              onClick={() => handleApprovalAction(approval.id, 'approve')}
                            >
                              <FaCheck className="text-sm" />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800"
                              title="Reddet"
                              onClick={() => handleApprovalAction(approval.id, 'reject')}
                            >
                              <FaTimes className="text-sm" />
                            </button>
                          </>
                        )}
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          title="Email Gönder"
                          onClick={() => handleApprovalAction(approval.id, 'email')}
                        >
                          <FaPaperPlane className="text-sm" />
                        </button>
                        <button 
                          className="text-gray-600 hover:text-gray-800"
                          title="Belgeleri Görüntüle"
                          onClick={() => handleApprovalAction(approval.id, 'documents')}
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
