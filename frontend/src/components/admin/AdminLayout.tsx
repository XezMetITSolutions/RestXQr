'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaChartBar,
  FaUsers,
  FaBuilding,
  FaBell,
  FaCreditCard,
  FaExclamationTriangle,
  FaUserCheck,
  FaSignOutAlt,
  FaShieldAlt,
  FaTimes,
  FaBars,
  FaGlobe,
  FaBox,
  FaCog,
  FaQrcode,
  FaChartLine,
  FaCogs,
  FaDatabase,
  FaFileAlt,
  FaCrown,
  FaRocket,
  FaHeadset
} from 'react-icons/fa';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  headerActions?: React.ReactNode;
}

export default function AdminLayout({ 
  children, 
  title, 
  description = "Sistem yönetim paneli",
  headerActions 
}: AdminLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white transform transition-all duration-300 ease-in-out z-50 shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="h-14 w-14 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mr-4 shadow-lg">
              <FaRocket className="text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">RestXQr</h1>
              <p className="text-sm text-blue-200 font-medium">Süper Yönetici</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        
        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto p-6">
          <nav className="space-y-3">
            {/* Ana Menü */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-4 flex items-center">
                <FaRocket className="mr-2" />
                Ana Menü
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/admin" 
                    className={`group flex items-center p-4 rounded-xl hover:bg-white/10 text-blue-100 hover:text-white transition-all duration-200 ${
                      title === 'Süper Yönetici Paneli' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-4 transition-all ${title === 'Süper Yönetici Paneli' ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                      <FaChartBar className="text-lg" />
                    </div>
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/restaurants" 
                    className={`group flex items-center p-4 rounded-xl hover:bg-white/10 text-blue-100 hover:text-white transition-all duration-200 ${
                      title === 'Restoran Yönetimi' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-4 transition-all ${title === 'Restoran Yönetimi' ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                      <FaBuilding className="text-lg" />
                    </div>
                    <span className="font-medium">Restoran Yönetimi</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/plans" 
                    className={`group flex items-center p-4 rounded-xl hover:bg-white/10 text-blue-100 hover:text-white transition-all duration-200 ${
                      title === 'Plan Yönetimi' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-4 transition-all ${title === 'Plan Yönetimi' ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                      <FaCrown className="text-lg" />
                    </div>
                    <span className="font-medium">Plan Yönetimi</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/restaurant-features" 
                    className={`group flex items-center p-4 rounded-xl hover:bg-white/10 text-blue-100 hover:text-white transition-all duration-200 ${
                      title === 'Restoran Özellik Yönetimi' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-4 transition-all ${title === 'Restoran Özellik Yönetimi' ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                      <FaCogs className="text-lg" />
                    </div>
                    <span className="font-medium">Özellik Yönetimi</span>
                  </Link>
                </li>
                {/* Kullanıcı Yönetimi - Restoran Yönetimi'ne entegre edildi */}
                {/* QR Kod Yönetimi - Admin panelinden kaldırıldı, restoranlar kendi QR kodlarını oluşturur */}
                <li>
                  <Link 
                    href="/admin/notifications" 
                    className={`group flex items-center p-4 rounded-xl hover:bg-white/10 text-blue-100 hover:text-white transition-all duration-200 ${
                      title === 'Bildirim Yönetimi' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-4 transition-all ${title === 'Bildirim Yönetimi' ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                      <FaBell className="text-lg" />
                    </div>
                    <span className="font-medium">Bildirimler</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Raporlar ve Analitik */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-4 flex items-center">
                <FaChartLine className="mr-2" />
                Raporlar & Analitik
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/admin/subscriptions" 
                    className={`group flex items-center p-4 rounded-xl hover:bg-white/10 text-blue-100 hover:text-white transition-all duration-200 ${
                      title === 'Abonelik Yönetimi' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-4 transition-all ${title === 'Abonelik Yönetimi' ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                      <FaCreditCard className="text-lg" />
                    </div>
                    <span className="font-medium">Abonelik Yönetimi</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/support" 
                    className={`group flex items-center p-4 rounded-xl hover:bg-white/10 text-blue-100 hover:text-white transition-all duration-200 ${
                      title === 'Destek Talepleri' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-4 transition-all ${title === 'Destek Talepleri' ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                      <FaHeadset className="text-lg" />
                    </div>
                    <span className="font-medium">Destek Talepleri</span>
                  </Link>
                </li>
                {/* Ödeme Hataları, Kullanıcı Onayları, Sistem Yönetimi, Dokümantasyon - Kaldırıldı */}
              </ul>
            </div>

            {/* Çıkış */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <button 
                onClick={handleLogout}
                className="group flex items-center p-4 rounded-xl hover:bg-red-500/20 text-blue-100 hover:text-red-200 w-full transition-all duration-200"
              >
                <div className="p-2 rounded-lg mr-4 bg-red-500/10 group-hover:bg-red-500/20 transition-all">
                  <FaSignOutAlt className="text-lg" />
                </div>
                <span className="font-medium">Çıkış Yap</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-80">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden mr-6 p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <FaBars className="text-xl" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{title}</h1>
                  <p className="text-gray-600 mt-2 font-medium">{description}</p>
                </div>
              </div>
              {headerActions && (
                <div className="flex space-x-4">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
