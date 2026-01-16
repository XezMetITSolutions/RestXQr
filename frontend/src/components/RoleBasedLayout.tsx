import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
  FaUtensils,
  FaUser,
  FaSignOutAlt,
  FaClipboardList,
  FaBell,
  FaCashRegister,
  FaHome,
  FaCog,
  FaQuestionCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import TranslatedText, { useTranslation } from '@/components/TranslatedText';

interface RoleBasedLayoutProps {
  children: ReactNode;
  requiredRole?: string | string[];
  title: string;
  description?: string;
}

const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({
  children,
  requiredRole,
  title,
  description
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { authenticatedStaff, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Check role authorization if required
    if (requiredRole) {
      const staffRole = authenticatedStaff?.role;
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      
      if (!staffRole || !requiredRoles.includes(staffRole)) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
    }

    setAuthorized(true);
    setLoading(false);
  }, [isAuthenticated, authenticatedStaff, requiredRole, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Get role-specific navigation items
  const getNavItems = () => {
    const role = authenticatedStaff?.role;
    
    const commonItems = [
      {
        name: t('Ana Sayfa'),
        icon: <FaHome className="text-lg" />,
        href: '/business/dashboard',
        roles: ['waiter', 'kitchen', 'cashier', 'manager', 'admin']
      },
      {
        name: t('Profil'),
        icon: <FaUser className="text-lg" />,
        href: '/business/profile',
        roles: ['waiter', 'kitchen', 'cashier', 'manager', 'admin']
      }
    ];

    const roleSpecificItems = [
      // Waiter specific items
      {
        name: t('Siparişler'),
        icon: <FaClipboardList className="text-lg" />,
        href: '/business/waiter',
        roles: ['waiter', 'manager', 'admin']
      },
      {
        name: t('Çağrılar'),
        icon: <FaBell className="text-lg" />,
        href: '/business/waiter/calls',
        roles: ['waiter', 'manager', 'admin']
      },
      
      // Kitchen specific items
      {
        name: t('Mutfak Paneli'),
        icon: <FaUtensils className="text-lg" />,
        href: '/business/kitchen',
        roles: ['kitchen', 'manager', 'admin']
      },
      
      // Cashier specific items
      {
        name: t('Kasa'),
        icon: <FaCashRegister className="text-lg" />,
        href: '/business/cashier',
        roles: ['cashier', 'manager', 'admin']
      },
      {
        name: t('Onay Bekleyenler'),
        icon: <FaExclamationTriangle className="text-lg" />,
        href: '/business/cashier/pending',
        roles: ['cashier', 'manager', 'admin']
      }
    ];

    // Filter items based on role
    return [...commonItems, ...roleSpecificItems].filter(
      item => !item.roles || item.roles.includes(role || '')
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <FaExclamationTriangle className="text-red-500 text-5xl mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2"><TranslatedText>Yetkisiz Erişim</TranslatedText></h1>
        <p className="text-gray-600 mb-4 text-center">
          <TranslatedText>Bu sayfaya erişim yetkiniz bulunmamaktadır.</TranslatedText>
        </p>
        <button
          onClick={() => router.push('/business/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <TranslatedText>Ana Sayfaya Dön</TranslatedText>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">RestXQR</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md lg:hidden hover:bg-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600">{authenticatedStaff?.name}</p>
              <div className="flex items-center mt-1">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {authenticatedStaff?.role === 'waiter' && t('Garson')}
                  {authenticatedStaff?.role === 'kitchen' && t('Mutfak')}
                  {authenticatedStaff?.role === 'cashier' && t('Kasiyer')}
                  {authenticatedStaff?.role === 'manager' && t('Yönetici')}
                  {authenticatedStaff?.role === 'admin' && t('Admin')}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {getNavItems().map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                  >
                    <span className="mr-3 text-gray-500">{item.icon}</span>
                    <span>{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FaSignOutAlt className="mr-3" />
              <TranslatedText>Çıkış Yap</TranslatedText>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-500 mt-1">{description}</p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default RoleBasedLayout;
