'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaChartBar, FaBuilding, FaTimes, FaBars, FaSignOutAlt } from 'react-icons/fa';

interface CompaniesLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function CompaniesLayout({
  children,
  title,
  description = 'Şirket paneli'
}: CompaniesLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_access_token');
    const raw = localStorage.getItem('admin_user');
    if (!token || !raw) {
      router.replace('/companies/login');
      return;
    }
    try {
      const u = JSON.parse(raw);
      if (u.role !== 'company_admin') {
        router.replace('/admin/dashboard');
        return;
      }
      setCompanyName(u.companyName || null);
    } catch (_) {
      router.replace('/companies/login');
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    router.push('/companies/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <div className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-br from-slate-800 via-emerald-900 to-teal-900 text-white transform transition-all duration-300 z-50 shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-emerald-500 rounded-xl flex items-center justify-center mr-3">
              <FaBuilding className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">RestXQr</h1>
              <p className="text-xs text-emerald-200 font-medium">{companyName || 'Şirket Paneli'}</p>
            </div>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-white">
            <FaTimes className="text-xl" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          <Link
            href="/companies/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${title === 'Şirket Dashboard' ? 'bg-emerald-600 text-white' : 'text-emerald-100 hover:bg-white/10'}`}
          >
            <FaChartBar className="text-lg" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link
            href="/companies/restaurants"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${title === 'Restoranlar' ? 'bg-emerald-600 text-white' : 'text-emerald-100 hover:bg-white/10'}`}
          >
            <FaBuilding className="text-lg" />
            <span className="font-medium">Restoranlar</span>
          </Link>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-emerald-100 hover:bg-red-500/20 hover:text-red-200 transition-all"
          >
            <FaSignOutAlt className="text-lg" />
            <span className="font-medium">Çıkış</span>
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="lg:pl-72">
        <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center gap-4">
            <button type="button" onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <FaBars className="text-xl" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 text-sm">{description}</p>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
