'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FaChartBar,
  FaBuilding,
  FaTimes,
  FaBars,
  FaSignOutAlt,
  FaUtensils,
  FaUsers,
  FaQrcode,
  FaChartLine,
  FaCog,
  FaHeadset,
  FaPrint,
  FaEye,
  FaVideo,
  FaGlobe,
  FaStore
} from 'react-icons/fa';

const COMPANY_SELECTED_RESTAURANT_KEY = 'company_selected_restaurant_id';
const COMPANY_SELECTED_RESTAURANT_NAME_KEY = 'company_selected_restaurant_name';

interface RestaurantOption {
  id: string;
  name: string;
  username: string;
}

interface CompaniesLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

function getApiUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';
  const base = (raw.startsWith('http') ? raw : `https://${raw}`).replace(/\/+$/, '');
  return base + (raw.endsWith('/api') || raw.endsWith('/api/') ? '' : '/api');
}

export default function CompaniesLayout({
  children,
  title,
  description = 'Şirket paneli'
}: CompaniesLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

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

  useEffect(() => {
    if (isLoading) return;
    const token = localStorage.getItem('admin_access_token');
    if (!token) return;
    fetch(`${getApiUrl()}/admin/dashboard/restaurants`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) {
          const list = data.data.map((r: { id: string; name: string; username: string }) => ({ id: r.id, name: r.name, username: r.username }));
          setRestaurants(list);
          const savedId = typeof window !== 'undefined' ? localStorage.getItem(COMPANY_SELECTED_RESTAURANT_KEY) : null;
          const savedName = typeof window !== 'undefined' ? localStorage.getItem(COMPANY_SELECTED_RESTAURANT_NAME_KEY) : null;
          if (savedId && list.some((r) => r.id === savedId)) {
            setSelectedId(savedId);
            setSelectedName(savedName || list.find((r) => r.id === savedId)?.name || null);
          } else if (list.length > 0) {
            const first = list[0];
            setSelectedId(first.id);
            setSelectedName(first.name);
            if (typeof window !== 'undefined') {
              localStorage.setItem(COMPANY_SELECTED_RESTAURANT_KEY, first.id);
              localStorage.setItem(COMPANY_SELECTED_RESTAURANT_NAME_KEY, first.name);
            }
          }
        }
      })
      .catch(() => {});
  }, [isLoading]);

  useEffect(() => {
    if (restaurants.length === 0 || selectedId) return;
    const first = restaurants[0];
    setSelectedId(first.id);
    setSelectedName(first.name);
    if (typeof window !== 'undefined') {
      localStorage.setItem(COMPANY_SELECTED_RESTAURANT_KEY, first.id);
      localStorage.setItem(COMPANY_SELECTED_RESTAURANT_NAME_KEY, first.name);
    }
  }, [restaurants, selectedId]);

  const handleSelectRestaurant = (id: string, name: string) => {
    setSelectedId(id);
    setSelectedName(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem(COMPANY_SELECTED_RESTAURANT_KEY, id);
      localStorage.setItem(COMPANY_SELECTED_RESTAURANT_NAME_KEY, name);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(COMPANY_SELECTED_RESTAURANT_KEY);
      localStorage.removeItem(COMPANY_SELECTED_RESTAURANT_NAME_KEY);
    }
    router.push('/companies/login');
  };

  const viewAs = selectedId ? `viewAs=${encodeURIComponent(selectedId)}` : '';
  const business = (path: string) => (viewAs ? `/business${path}?${viewAs}` : '#');

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

  const navItems: { href: string; icon: typeof FaChartBar; label: string; pathMatch?: string }[] = [
    { href: '/companies/dashboard', icon: FaChartBar, label: 'Kontrol Paneli', pathMatch: '/companies/dashboard' },
    { href: '/companies/restaurants', icon: FaStore, label: 'Restoran Listesi', pathMatch: '/companies/restaurants' },
    { href: business('/dashboard'), icon: FaChartLine, label: 'Restoran Paneli', pathMatch: '/business/dashboard' },
    { href: business('/menu'), icon: FaUtensils, label: 'Menü Yönetimi', pathMatch: '/business/menu' },
    { href: business('/staff'), icon: FaUsers, label: 'Personel', pathMatch: '/business/staff' },
    { href: business('/menu/preview'), icon: FaEye, label: 'Menü Önizleme', pathMatch: '/business/menu/preview' },
    { href: business('/qr-codes'), icon: FaQrcode, label: 'QR Kodlar', pathMatch: '/business/qr-codes' },
    { href: business('/reports'), icon: FaChartBar, label: 'Raporlar', pathMatch: '/business/reports' },
    { href: business('/settings'), icon: FaCog, label: 'Ayarlar', pathMatch: '/business/settings' },
    { href: business('/printers'), icon: FaPrint, label: 'Yazıcı Yönetimi', pathMatch: '/business/printers' },
    { href: business('/support'), icon: FaHeadset, label: 'Destek', pathMatch: '/business/support' },
    { href: business('/video-menu'), icon: FaVideo, label: 'Video Menü', pathMatch: '/business/video-menu' },
    { href: business('/online-orders'), icon: FaGlobe, label: 'Online Siparişler', pathMatch: '/business/online-orders' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <div className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-br from-slate-800 via-emerald-900 to-teal-900 text-white transform transition-all duration-300 z-50 shadow-2xl flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between h-20 px-4 border-b border-white/10 shrink-0">
          <div className="flex items-center min-w-0">
            <div className="h-12 w-12 bg-emerald-500 rounded-xl flex items-center justify-center mr-3 shrink-0">
              <FaBuilding className="text-xl text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white truncate">RestXQr</h1>
              <p className="text-xs text-emerald-200 font-medium truncate">{companyName || 'Şirket Paneli'}</p>
            </div>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-white shrink-0">
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-white/10 shrink-0">
          <label className="block text-xs font-medium text-emerald-200 mb-2">Restoran seçin</label>
          <select
            value={selectedId || ''}
            onChange={(e) => {
              const r = restaurants.find((x) => x.id === e.target.value);
              if (r) handleSelectRestaurant(r.id, r.name);
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Seçiniz</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id} className="text-gray-900">
                {r.name} (@{r.username})
              </option>
            ))}
          </select>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.pathMatch ? pathname?.startsWith(item.pathMatch) : title === item.label;
            const isExternal = item.href.startsWith('/business');
            const href = item.href === '#' ? undefined : item.href;
            const content = (
              <span className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-emerald-600 text-white' : 'text-emerald-100 hover:bg-white/10'}`}>
                <Icon className="text-lg shrink-0" />
                <span className="font-medium truncate">{item.label}</span>
              </span>
            );
            if (href) {
              return (
                <Link key={item.href} href={href} className="block">
                  {content}
                </Link>
              );
            }
            return (
              <span key={item.href} className="block opacity-70 cursor-not-allowed" title="Önce restoran seçin">
                {content}
              </span>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
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
          <div className="px-6 py-4 flex flex-wrap items-center gap-4">
            <button type="button" onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <FaBars className="text-xl" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{title}</h1>
              <p className="text-gray-600 text-sm truncate">{description}{selectedName ? ` · ${selectedName}` : ''}</p>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
