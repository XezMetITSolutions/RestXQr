'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaChartLine,
  FaChartBar,
  FaSignOutAlt,
  FaCog,
  FaHeadset,
  FaUtensils,
  FaShoppingCart,
  FaQrcode,
  FaBell,
  FaUserPlus,
  FaUserEdit,
  FaUserTimes,
  FaUserCheck,
  FaUserClock,
  FaUserShield,
  FaEnvelope,
  FaPhone,
  FaClock,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaSort,
  FaDownload,
  FaPrint,
  FaCreditCard,
  FaCopy,
  FaEyeSlash,
  FaSync,
  FaBars,
  FaMoneyBillWave
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import useBusinessSettingsStore from '@/store/useBusinessSettingsStore';
import BusinessSidebar from '@/components/BusinessSidebar';
import { apiService } from '@/services/api';
import TranslatedText, { useTranslation } from '@/components/TranslatedText';
import LanguageSelector from '@/components/LanguageSelector';
import PermissionsPanel from './permissions-panel';

export default function StaffPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { authenticatedRestaurant, authenticatedStaff, isAuthenticated, logout, initializeAuth } = useAuthStore();
  const {
    settings,
    updateStaffCredentials,
    generateStaffCredentials
  } = useBusinessSettingsStore();
  // Feature flag: per-staff panel credentials (keep code but disable UI by default)
  const [individualStaffPanelsEnabled, setIndividualStaffPanelsEnabled] = useState(true);
  const [staff, setStaff] = useState<any[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPanelModal, setShowPanelModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [showPasswords, setShowPasswords] = useState({
    kitchen: false,
    waiter: false,
    cashier: false
  });
  const [newStaff, setNewStaff] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    role: 'waiter',
    department: 'service',
    notes: ''
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'permissions'>('list');

  useEffect(() => {
    // Auth'u initialize et
    initializeAuth();

    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router, initializeAuth]);

  // Personel listesini yükle (Optimistic Loading)
  useEffect(() => {
    const loadStaffData = async () => {
      // 1. Önce localStorage'daki veriyi göster (Hızlı açılış)
      if (typeof window !== 'undefined') {
        const savedStaff = localStorage.getItem('business_staff');
        if (savedStaff) {
          try {
            const parsedStaff = JSON.parse(savedStaff);
            if (Array.isArray(parsedStaff) && parsedStaff.length > 0) {
              console.log('⚡ Using cached staff data initially:', parsedStaff.length);
              setStaff(parsedStaff);
              setFilteredStaff(parsedStaff);
            }
          } catch (e) {
            console.error('Error parsing cached staff:', e);
          }
        }
      }

      // 2. Restaurant ID'yi bul (State'den veya localStorage'dan)
      let restaurantId = authenticatedRestaurant?.id;
      if (!restaurantId && typeof window !== 'undefined') {
        const savedRest = localStorage.getItem('currentRestaurant');
        if (savedRest) {
          try {
            const parsedRest = JSON.parse(savedRest);
            restaurantId = parsedRest.id;
          } catch (e) { }
        }
      }

      // 3. API'den güncel veriyi çek
      if (restaurantId) {
        try {
          console.log('📡 Fetching fresh staff data for:', restaurantId);
          const response = await apiService.getStaff(restaurantId);
          if (response?.data && Array.isArray(response.data)) {
            console.log('✅ Fresh staff data loaded:', response.data.length);
            // Adminleri filtrele
            const nonAdminStaff = response.data.filter((s: any) => s.role !== 'admin');
            setStaff(nonAdminStaff);
            setFilteredStaff(nonAdminStaff);
            // Cache'i güncelle
            localStorage.setItem('business_staff', JSON.stringify(nonAdminStaff));
          }
        } catch (error) {
          console.error('❌ Error loading staff from backend:', error);
          // Hata durumunda zaten cache gösterildiği için kullanıcı boş sayfa görmez
        }
      } else {
        console.warn('⚠️ Restaurant ID not found, cannot fetch staff');
      }
    };

    loadStaffData();
  }, [authenticatedRestaurant?.id]); // id değişince tekrar çalışsın

  // Filtreleme ve arama
  useEffect(() => {
    // Her zaman adminleri filtrele
    let filtered = staff.filter(member => member.role !== 'admin');

    // Rol filtresi
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    // Arama
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm)
      );
    }

    setFilteredStaff(filtered);
  }, [staff, roleFilter, statusFilter, searchTerm]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'chef': return 'bg-orange-100 text-orange-800';
      case 'waiter': return 'bg-blue-100 text-blue-800';
      case 'cashier': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'manager': return t('Yönetici');
      case 'chef': return t('Aşçı');
      case 'waiter': return t('Garson');
      case 'cashier': return t('Kasiyer');
      case 'admin': return t('Admin');
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return t('Aktif');
      case 'inactive': return t('Pasif');
      case 'on_leave': return t('İzinli');
      case 'terminated': return t('İşten Ayrıldı');
      default: return status;
    }
  };

  const getDepartmentText = (department: string) => {
    switch (department) {
      case 'management': return t('Yönetim');
      case 'service': return t('Servis');
      case 'kitchen': return t('Mutfak');
      case 'finance': return t('Mali İşler');
      case 'admin': return t('Yönetim');
      default: return department;
    }
  };

  // Tüm personeli dahil et (admin hariç)
  const operationalStaff = staff.filter(s => s.role !== 'admin');

  const stats = {
    total: operationalStaff.length,
    active: operationalStaff.filter(s => s.status === 'active').length,
    inactive: operationalStaff.filter(s => s.status === 'inactive').length,
    onLeave: operationalStaff.filter(s => s.status === 'on_leave').length,
    managers: operationalStaff.filter(s => s.role === 'manager').length,
    waiters: operationalStaff.filter(s => s.role === 'waiter').length,
    chefs: operationalStaff.filter(s => s.role === 'chef').length,
    avgRating: operationalStaff.length > 0 ? (operationalStaff.reduce((acc, s) => acc + (s.rating || 0), 0) / operationalStaff.length).toFixed(1) : 0
  };

  const handleAddStaff = async () => {
    const name = newStaff.name.trim();
    const email = newStaff.email.trim();
    if (!name) { alert(t('Ad Soyad zorunludur.')); return; }
    if (!email) { alert(t('E-posta zorunludur.')); return; }

    // Departmanı role göre otomatik ata
    const roleToDepartment: Record<string, string> = {
      waiter: 'service',
      chef: 'kitchen',
      cashier: 'finance',
      manager: 'management'
    };

    const now = new Date();
    const newMember: any = {
      id: Date.now(),
      name: name,
      email: email,
      phone: newStaff.phone.trim(),
      role: newStaff.role,
      department: roleToDepartment[newStaff.role] || 'service',
      startDate: now.toISOString().slice(0, 10),
      status: 'active',
      lastLogin: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      totalOrders: 0,
      rating: 0,
      notes: newStaff.notes,
      avatar: null
    };

    // Backend'e kaydet
    try {
      if (authenticatedRestaurant?.id) {
        const staffData = {
          name: newMember.name,
          email: newMember.email,
          phone: newMember.phone,
          role: newMember.role,
          department: newMember.department,
          notes: newMember.notes,
          username: newStaff.username,
          password: newStaff.password
        };

        const response = await apiService.createStaff(authenticatedRestaurant.id, staffData);
        console.log('✅ Staff created in backend:', response);

        // Backend'den dönen ID'yi kullan
        if (response?.data?.id) {
          newMember.id = response.data.id;
        }
      }
    } catch (error) {
      console.error('❌ Backend staff creation failed:', error);
      // Backend hatası olsa bile localStorage'a kaydet
    }

    const updatedStaff = [newMember, ...staff];
    setStaff(updatedStaff);
    setFilteredStaff(updatedStaff);

    // localStorage'a kaydet
    if (typeof window !== 'undefined') {
      localStorage.setItem('business_staff', JSON.stringify(updatedStaff));
    }

    setShowAddModal(false);
    setNewStaff({
      name: '',
      username: '',
      password: '',
      email: '',
      phone: '',
      role: 'waiter',
      department: 'service',
      notes: ''
    });

    // Rol bazlı yönlendirme bilgisi
    const rolePanelMap: { [key: string]: string } = {
      'waiter': t('Garson Paneli'),
      'cashier': t('Kasa Paneli'),
      'chef': t('Mutfak Paneli'),
      'manager': t('Yönetim Paneli'),
      'admin': t('Admin Paneli')
    };

    const panelName = rolePanelMap[newStaff.role] || 'Panel';
    alert(`${name} ${t('personeli başarıyla eklendi!')} ${panelName} ${t('için giriş yapabilir.')}`);
  };

  const handleEditStaff = (staffMember: any) => {
    setSelectedStaff(staffMember);
    setShowEditModal(true);
  };

  const handleUpdateStaff = async () => {
    if (!selectedStaff) { return; }
    const name = (selectedStaff.name || '').trim();
    const email = (selectedStaff.email || '').trim();
    if (!name) { alert(t('Ad Soyad zorunludur.')); return; }
    if (!email) { alert(t('E-posta zorunludur.')); return; }

    // Backend'e güncelleme gönder
    try {
      if (authenticatedRestaurant?.id) {
        const updateData: any = {
          name: selectedStaff.name,
          email: selectedStaff.email,
          phone: selectedStaff.phone,
          role: selectedStaff.role,
          department: roleToDepartment[selectedStaff.role] || 'service',
          notes: selectedStaff.notes,
          status: selectedStaff.status,
          username: selectedStaff.username
        };

        // Şifre sadece değiştirilmişse ekle
        if (selectedStaff.password && selectedStaff.password.trim() !== '') {
          updateData.password = selectedStaff.password;
        }

        const response = await apiService.updateStaff(selectedStaff.id, updateData);
        console.log('✅ Staff updated in backend:', response);

        // Başarı mesajı
        if (updateData.password) {
          alert(t('Personel bilgileri ve şifre başarıyla güncellendi!'));
        } else {
          alert(t('Personel bilgileri başarıyla güncellendi!'));
        }
      }
    } catch (error) {
      console.error('❌ Backend staff update failed:', error);
      alert(t('Güncelleme sırasında hata oluştu!'));
      return;
    }

    setStaff(prev => prev.map(s => s.id === selectedStaff.id ? selectedStaff : s));

    // localStorage'a kaydet
    if (typeof window !== 'undefined') {
      localStorage.setItem('business_staff', JSON.stringify(staff.map(s => s.id === selectedStaff.id ? selectedStaff : s)));
    }

    setShowEditModal(false);
    alert(t('Personel bilgileri başarıyla güncellendi!'));
  };

  const handleGoToPanel = (staffMember: any) => {
    if (!authenticatedRestaurant) return;

    const loginData = {
      id: staffMember.id,
      name: staffMember.name,
      role: staffMember.role,
      restaurantId: staffMember.restaurantId,
      restaurantName: authenticatedRestaurant.name,
      restaurantUsername: authenticatedRestaurant.username
    };

    // Staff session bilgilerini hazırla
    localStorage.setItem('staff_user', JSON.stringify(loginData));
    localStorage.setItem('staff_token', 'authenticated'); // Admin tarafından giriş yapıldığı için token simüle ediliyor

    // Role göre ilgili panele yönlendir
    let panelUrl = '/garson';
    if (staffMember.role === 'chef') panelUrl = '/mutfak';
    else if (staffMember.role === 'cashier') panelUrl = '/kasa';
    else if (staffMember.role === 'manager') panelUrl = '/mutfak'; // Menajerler genelde mutfak/sipariş görür

    window.open(panelUrl, '_blank');
  };

  const handleDeleteStaff = async (staffId: number) => {
    console.log('🗑️ Deleting staff:', staffId);
    if (confirm(t('Bu personeli silmek istediğinizden emin misiniz?'))) {
      try {
        console.log('📡 Calling backend delete API...');
        // Backend'den sil
        await apiService.deleteStaff(String(staffId));
        console.log('✅ Staff deleted from backend:', staffId);

        // Frontend state'den sil
        setStaff(staff.filter(s => s.id !== staffId));
        console.log('✅ Staff removed from frontend state');
        alert(t('Personel başarıyla silindi!'));
      } catch (error) {
        console.error('❌ Error deleting staff:', error);
        alert(t('Personel silinirken hata oluştu: ') + (error as Error).message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="ml-0 lg:ml-72 transition-all duration-300">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaBars className="text-lg text-gray-600" />
              </button>
              <div>
                <h2 className="text-lg sm:text-2xl font-semibold text-gray-800">
                  {activeTab === 'list' ? <TranslatedText>Personel Yönetimi</TranslatedText> : <TranslatedText>Yetkilendirme Ayarları</TranslatedText>}
                </h2>
                <div className="flex items-center gap-4 mt-1">
                  <button
                    onClick={() => setActiveTab('list')}
                    className={`text-xs sm:text-sm font-medium transition-colors ${activeTab === 'list' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <TranslatedText>Personel Listesi</TranslatedText>
                  </button>
                  <button
                    onClick={() => setActiveTab('permissions')}
                    className={`text-xs sm:text-sm font-medium transition-colors ${activeTab === 'permissions' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <TranslatedText>Yetki Ayarları</TranslatedText>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageSelector enabledLanguages={settings?.menuSettings?.language} />
              <button
                onClick={() => setShowAddModal(true)}
                className="px-2 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <FaUserPlus className="text-xs sm:text-sm" />
                <span className="hidden sm:inline"><TranslatedText>Personel Ekle</TranslatedText></span>
                <span className="sm:hidden"><TranslatedText>Ekle</TranslatedText></span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-3 sm:p-6 lg:p-8">
          {/* Panel Yönetimi Bölümü - Rol bazlı yetkilendirme */}


          {activeTab === 'permissions' ? (
            <PermissionsPanel isEmbedded={true} />
          ) : (
            <>
              {/* İstatistik Kartları */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                      <FaUsers className="text-lg sm:text-xl text-blue-600" />
                    </div>
                    <span className="text-xs sm:text-sm text-blue-600 font-medium"><TranslatedText>Toplam</TranslatedText></span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{stats.total}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1"><TranslatedText>Personel</TranslatedText></p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                      <FaUserCheck className="text-lg sm:text-xl text-green-600" />
                    </div>
                    <span className="text-xs sm:text-sm text-green-600 font-medium"><TranslatedText>Aktif</TranslatedText></span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{stats.active}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1"><TranslatedText>Personel</TranslatedText></p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                      <FaUserShield className="text-lg sm:text-xl text-purple-600" />
                    </div>
                    <span className="text-xs sm:text-sm text-purple-600 font-medium"><TranslatedText>Yönetici</TranslatedText></span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{stats.managers}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1"><TranslatedText>Kişi</TranslatedText></p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                      <FaUserClock className="text-lg sm:text-xl text-blue-600" />
                    </div>
                    <span className="text-xs sm:text-sm text-blue-600 font-medium"><TranslatedText>Garson</TranslatedText></span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{stats.waiters}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1"><TranslatedText>Kişi</TranslatedText></p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
                      <FaUtensils className="text-lg sm:text-xl text-orange-600" />
                    </div>
                    <span className="text-xs sm:text-sm text-orange-600 font-medium"><TranslatedText>Aşçı</TranslatedText></span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{stats.chefs}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1"><TranslatedText>Kişi</TranslatedText></p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                      <FaChartLine className="text-lg sm:text-xl text-yellow-600" />
                    </div>
                    <span className="text-xs sm:text-sm text-yellow-600 font-medium"><TranslatedText>Ortalama</TranslatedText></span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{stats.avgRating}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1"><TranslatedText>Puan</TranslatedText></p>
                </div>
              </div>


              {/* Filtreler ve Arama */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Arama */}
                  <div className="sm:col-span-2 lg:col-span-2 relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      placeholder={t('Personel ara...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>

                  {/* Rol Filtresi */}
                  <div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="all">{t('Tüm Roller')}</option>
                      <option value="manager">{t('Yönetici')}</option>
                      <option value="chef">{t('Aşçı')}</option>
                      <option value="waiter">{t('Garson')}</option>
                      <option value="cashier">{t('Kasiyer')}</option>
                      {/* Admin seçeneği kaldırıldı */}
                    </select>
                  </div>

                  {/* Durum Filtresi */}
                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="all">{t('Tüm Durumlar')}</option>
                      <option value="active">{t('Aktif')}</option>
                      <option value="inactive">{t('Pasif')}</option>
                      <option value="on_leave">{t('İzinli')}</option>
                      <option value="terminated">{t('İşten Ayrıldı')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Personel Listesi - Desktop View */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    <TranslatedText>Personel Listesi</TranslatedText> ({filteredStaff.length})
                  </h3>
                </div>

                <div className="divide-y divide-gray-200">
                  {filteredStaff.map(member => (
                    <div key={member.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-purple-600 text-lg">
                              {member.name.split(' ').map((n: string) => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{member.name}</h4>
                            <p className="text-sm text-gray-500">{member.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                                {getRoleText(member.role)}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                                {getStatusText(member.status)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            {/* Departman bilgisi gizlendi - tek rol yeterli */}
                          </div>

                          <button
                            onClick={() => handleGoToPanel(member)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors text-xs font-semibold"
                            title={t('Panelini Aç')}
                          >
                            <FaSignOutAlt className="rotate-180" />
                            <TranslatedText>Paneline Gir</TranslatedText>
                          </button>

                          <div className="flex items-center gap-2">
                            {individualStaffPanelsEnabled && (
                              <button
                                onClick={() => {
                                  setSelectedStaff(member);
                                  setShowPanelModal(true);
                                }}
                                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Panel Bilgileri"
                              >
                                <FaCog />
                              </button>
                            )}
                            <button
                              onClick={() => handleEditStaff(member)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(member.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Ek Bilgiler */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-gray-400" />
                          <span>{member.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          <span><TranslatedText>İşe Başlama</TranslatedText>: {member.startDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaClock className="text-gray-400" />
                          <span><TranslatedText>Son Giriş</TranslatedText>: {member.lastLogin}</span>
                        </div>
                      </div>

                      {member.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 italic">
                            <strong><TranslatedText>Not</TranslatedText>:</strong> {member.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredStaff.length === 0 && (
                  <div className="text-center py-12">
                    <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg"><TranslatedText>Personel bulunamadı</TranslatedText></p>
                    <p className="text-gray-400 text-sm mt-2"><TranslatedText>Filtreleri değiştirerek tekrar deneyin</TranslatedText></p>
                  </div>
                )}
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {filteredStaff.map(member => (
                  <div key={member.id} className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-purple-600 text-sm">
                          {member.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {member.name}
                            </h3>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {member.email}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                                {getRoleText(member.role)}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                                {getStatusText(member.status)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <FaPhone className="text-gray-400" />
                            <span className="truncate">{member.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaClock className="text-gray-400" />
                            <span className="truncate">Son Giriş: {member.lastLogin}</span>
                          </div>
                        </div>

                        {member.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-700 italic">
                              <strong><TranslatedText>Not</TranslatedText>:</strong> {member.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <button
                            onClick={() => handleGoToPanel(member)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-[11px] font-bold"
                          >
                            <FaSignOutAlt className="rotate-180" />
                            <TranslatedText>Paneline Gir</TranslatedText>
                          </button>

                          <div className="flex gap-1">
                            {individualStaffPanelsEnabled && (
                              <button
                                onClick={() => {
                                  setSelectedStaff(member);
                                  setShowPanelModal(true);
                                }}
                                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Panel Bilgileri"
                              >
                                <FaCog className="text-sm" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEditStaff(member)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(member.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredStaff.length === 0 && (
                <div className="text-center py-8">
                  <FaUsers className="text-3xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm"><TranslatedText>Personel bulunamadı</TranslatedText></p>
                  <p className="text-gray-400 text-xs mt-1"><TranslatedText>Filtreleri değiştirerek tekrar deneyin</TranslatedText></p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Personel Ekleme Modal */}
        {
          showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
              <div className="bg-white rounded-xl max-w-md w-full max-h-[95vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg sm:text-xl font-bold"><TranslatedText>Yeni Personel Ekle</TranslatedText></h3>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <FaTimes size={18} />
                    </button>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        <TranslatedText>Ad Soyad *</TranslatedText>
                      </label>
                      <input
                        type="text"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder={t('Personel adı')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        <TranslatedText>Kullanıcı Adı *</TranslatedText>
                      </label>
                      <input
                        type="text"
                        value={newStaff.username}
                        onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder={t('Kullanıcı adı')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        <TranslatedText>Şifre *</TranslatedText>
                      </label>
                      <input
                        type="password"
                        value={newStaff.password}
                        onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        <TranslatedText>E-posta *</TranslatedText>
                      </label>
                      <input
                        type="email"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        <TranslatedText>Telefon</TranslatedText>
                      </label>
                      <input
                        type="text"
                        value={newStaff.phone}
                        onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="0532 123 45 67"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          <TranslatedText>Rol *</TranslatedText>
                        </label>
                        <select
                          value={newStaff.role}
                          onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        >
                          <option value="waiter">{t('Garson')}</option>
                          <option value="chef">{t('Aşçı')}</option>
                          <option value="cashier">{t('Kasiyer')}</option>
                          {/* Yönetici seçeneği kaldırıldı - sadece operasyonel personel */}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        <TranslatedText>Notlar</TranslatedText>
                      </label>
                      <textarea
                        value={newStaff.notes}
                        onChange={(e) => setNewStaff({ ...newStaff, notes: e.target.value })}
                        rows={3}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder={t('Personel hakkında notlar...')}
                      />
                    </div>

                    <button
                      onClick={handleAddStaff}
                      className="w-full py-2.5 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <FaUserPlus className="text-sm" />
                      <TranslatedText>Personel Ekle</TranslatedText>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Personel Düzenleme Modal */}
        {
          showEditModal && selectedStaff && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
              <div className="bg-white rounded-xl max-w-md w-full max-h-[95vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg sm:text-xl font-bold"><TranslatedText>Personel Düzenle</TranslatedText></h3>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <FaTimes size={18} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Ad Soyad *</TranslatedText>
                      </label>
                      <input
                        type="text"
                        value={selectedStaff.name}
                        onChange={(e) => setSelectedStaff({ ...selectedStaff, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>E-posta *</TranslatedText>
                      </label>
                      <input
                        type="email"
                        value={selectedStaff.email}
                        onChange={(e) => setSelectedStaff({ ...selectedStaff, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Telefon</TranslatedText>
                      </label>
                      <input
                        type="text"
                        value={selectedStaff.phone}
                        onChange={(e) => setSelectedStaff({ ...selectedStaff, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <TranslatedText>Rol *</TranslatedText>
                        </label>
                        <select
                          value={selectedStaff.role}
                          onChange={(e) => setSelectedStaff({ ...selectedStaff, role: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="waiter">{t('Garson')}</option>
                          <option value="chef">{t('Aşçı')}</option>
                          <option value="cashier">{t('Kasiyer')}</option>
                          {/* Yönetici seçeneği kaldırıldı - sadece operasyonel personel */}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <TranslatedText>Durum</TranslatedText>
                        </label>
                        <select
                          value={selectedStaff.status}
                          onChange={(e) => setSelectedStaff({ ...selectedStaff, status: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="active">{t('Aktif')}</option>
                          <option value="inactive">{t('Pasif')}</option>
                          <option value="on_leave">{t('İzinli')}</option>
                          <option value="terminated">{t('İşten Ayrıldı')}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Notlar</TranslatedText>
                      </label>
                      <textarea
                        value={selectedStaff.notes}
                        onChange={(e) => setSelectedStaff({ ...selectedStaff, notes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3"><TranslatedText>Giriş Bilgileri</TranslatedText></h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <TranslatedText>Kullanıcı Adı</TranslatedText>
                          </label>
                          <input
                            type="text"
                            value={selectedStaff.username || ''}
                            onChange={(e) => setSelectedStaff({ ...selectedStaff, username: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder={t('Kullanıcı adı')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <TranslatedText>Şifre</TranslatedText>
                          </label>
                          <input
                            type="password"
                            value={selectedStaff.password || ''}
                            onChange={(e) => setSelectedStaff({ ...selectedStaff, password: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder={t('Yeni şifre')}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowEditModal(false)}
                        className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        <TranslatedText>İptal</TranslatedText>
                      </button>
                      <button
                        onClick={handleUpdateStaff}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                      >
                        <FaUserEdit />
                        <TranslatedText>Güncelle</TranslatedText>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Panel Bilgileri Modal */}
        {
          individualStaffPanelsEnabled && showPanelModal && selectedStaff && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold"><TranslatedText>Panel Bilgileri</TranslatedText> - {selectedStaff.name}</h3>
                    <button
                      onClick={() => setShowPanelModal(false)}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <FaTimes size={18} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Mevcut Panel Bilgileri */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3"><TranslatedText>Mevcut Panel Bilgileri</TranslatedText></h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <TranslatedText>Panel URL</TranslatedText>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={settings.staffCredentials[selectedStaff.id]?.panelUrl || ''}
                              readOnly
                              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={() => {
                                const url = settings.staffCredentials[selectedStaff.id]?.panelUrl;
                                if (url) {
                                  navigator.clipboard.writeText(url);
                                  alert(t('URL kopyalandı!'));
                                }
                              }}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              <TranslatedText>Kopyala</TranslatedText>
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <TranslatedText>Kullanıcı Adı</TranslatedText>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={settings.staffCredentials[selectedStaff.id]?.username || ''}
                              readOnly
                              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={() => {
                                const username = settings.staffCredentials[selectedStaff.id]?.username;
                                if (username) {
                                  navigator.clipboard.writeText(username);
                                  alert(t('Kullanıcı adı kopyalandı!'));
                                }
                              }}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              <TranslatedText>Kopyala</TranslatedText>
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <TranslatedText>Şifre</TranslatedText>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="password"
                              value={settings.staffCredentials[selectedStaff.id]?.password || ''}
                              readOnly
                              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={() => {
                                const password = settings.staffCredentials[selectedStaff.id]?.password;
                                if (password) {
                                  navigator.clipboard.writeText(password);
                                  alert(t('Şifre kopyalandı!'));
                                }
                              }}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              <TranslatedText>Kopyala</TranslatedText>
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <TranslatedText>Durum</TranslatedText>
                          </label>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-2 rounded-lg text-sm font-medium ${settings.staffCredentials[selectedStaff.id]?.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}>
                              {settings.staffCredentials[selectedStaff.id]?.isActive ? t('Aktif') : t('Pasif')}
                            </span>
                            <button
                              onClick={() => {
                                updateStaffCredentials(selectedStaff.id, {
                                  ...settings.staffCredentials[selectedStaff.id],
                                  isActive: !settings.staffCredentials[selectedStaff.id]?.isActive
                                });
                              }}
                              className={`px-3 py-2 rounded-lg text-sm font-medium ${settings.staffCredentials[selectedStaff.id]?.isActive
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                              {settings.staffCredentials[selectedStaff.id]?.isActive ? t('Pasif Yap') : t('Aktif Yap')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Yeni Panel Oluştur */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3"><TranslatedText>Yeni Panel Oluştur</TranslatedText></h4>
                      <p className="text-sm text-gray-600 mb-4">
                        <TranslatedText>Bu personel için yeni panel bilgileri oluşturmak istiyorsanız aşağıdaki butona tıklayın.</TranslatedText>
                      </p>
                      <button
                        onClick={() => {
                          generateStaffCredentials(selectedStaff.id, selectedStaff.role);
                          alert(t('Yeni panel bilgileri oluşturuldu!'));
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                      >
                        <FaCog />
                        <TranslatedText>Yeni Panel Oluştur</TranslatedText>
                      </button>
                    </div>

                    {/* Panel Erişim Bilgileri */}
                    {/* Panel Erişim Yetkileri */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3"><TranslatedText>Panel Giriş Yetkileri</TranslatedText></h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                              <FaUser size={16} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800"><TranslatedText>Garson Paneli Girişi</TranslatedText></p>
                              <p className="text-xs text-gray-500"><TranslatedText>Garson paneline giriş yapabilir</TranslatedText></p>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              const currentPerms = selectedStaff.permissions || {};
                              const newPerms = { ...currentPerms, canAccessWaiterPanel: !currentPerms.canAccessWaiterPanel };
                              const updatedStaff = { ...selectedStaff, permissions: newPerms };
                              setSelectedStaff(updatedStaff);
                              try {
                                await apiService.updateStaff(selectedStaff.id, { permissions: newPerms });
                                setStaff(staff.map(s => s.id === selectedStaff.id ? updatedStaff : s));
                              } catch (err) {
                                console.error('Error updating permissions:', err);
                                alert(t('Yetki güncellenirken hata oluştu'));
                              }
                            }}
                            className={`w-12 h-6 rounded-full transition-colors relative ${selectedStaff.permissions?.canAccessWaiterPanel ? 'bg-green-500' : 'bg-gray-300'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${selectedStaff.permissions?.canAccessWaiterPanel ? 'left-7' : 'left-1'}`}></div>
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                              <FaMoneyBillWave size={16} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800"><TranslatedText>Kasa Paneli Girişi</TranslatedText></p>
                              <p className="text-xs text-gray-500"><TranslatedText>Kasa paneline giriş yapabilir</TranslatedText></p>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              const currentPerms = selectedStaff.permissions || {};
                              const newPerms = { ...currentPerms, canAccessCashierPanel: !currentPerms.canAccessCashierPanel };
                              const updatedStaff = { ...selectedStaff, permissions: newPerms };
                              setSelectedStaff(updatedStaff);
                              try {
                                await apiService.updateStaff(selectedStaff.id, { permissions: newPerms });
                                setStaff(staff.map(s => s.id === selectedStaff.id ? updatedStaff : s));
                              } catch (err) {
                                console.error('Error updating permissions:', err);
                                alert(t('Yetki güncellenirken hata oluştu'));
                              }
                            }}
                            className={`w-12 h-6 rounded-full transition-colors relative ${selectedStaff.permissions?.canAccessCashierPanel ? 'bg-green-500' : 'bg-gray-300'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${selectedStaff.permissions?.canAccessCashierPanel ? 'left-7' : 'left-1'}`}></div>
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                              <FaUtensils size={16} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800"><TranslatedText>Mutfak Paneli Girişi</TranslatedText></p>
                              <p className="text-xs text-gray-500"><TranslatedText>Mutfak paneline giriş yapabilir</TranslatedText></p>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              const currentPerms = selectedStaff.permissions || {};
                              const newPerms = { ...currentPerms, canAccessKitchenPanel: !currentPerms.canAccessKitchenPanel };
                              const updatedStaff = { ...selectedStaff, permissions: newPerms };
                              setSelectedStaff(updatedStaff);
                              try {
                                await apiService.updateStaff(selectedStaff.id, { permissions: newPerms });
                                setStaff(staff.map(s => s.id === selectedStaff.id ? updatedStaff : s));
                              } catch (err) {
                                console.error('Error updating permissions:', err);
                                alert(t('Yetki güncellenirken hata oluştu'));
                              }
                            }}
                            className={`w-12 h-6 rounded-full transition-colors relative ${selectedStaff.permissions?.canAccessKitchenPanel ? 'bg-green-500' : 'bg-gray-300'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${selectedStaff.permissions?.canAccessKitchenPanel ? 'left-7' : 'left-1'}`}></div>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowPanelModal(false)}
                        className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        <TranslatedText>Kapat</TranslatedText>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
