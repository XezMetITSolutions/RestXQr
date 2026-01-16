'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCog, FaShieldAlt, FaBell, FaDatabase, FaUser, FaSignOutAlt, FaStore } from 'react-icons/fa';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminSettings() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const adminUser = localStorage.getItem('admin_user');
    const accessToken = localStorage.getItem('admin_access_token');
    if (!adminUser || !accessToken) {
      router.push('/admin/login');
      return;
    }
    try {
      const userData = JSON.parse(adminUser);
      setUser(userData);
    } catch (error) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white transform transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6"><h1 className="text-2xl font-bold">RestXQr Admin</h1></div>
        <nav className="mt-6">
          <Link href="/admin/dashboard" className="flex items-center px-6 py-3 hover:bg-blue-700"><FaDatabase className="mr-3" /><span>Dashboard</span></Link>
          <Link href="/admin/restaurants" className="flex items-center px-6 py-3 hover:bg-blue-700"><FaStore className="mr-3" /><span>Restoranlar</span></Link>
          <Link href="/admin/settings" className="flex items-center px-6 py-3 bg-blue-700 border-l-4 border-white"><FaCog className="mr-3" /><span>Ayarlar</span></Link>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-6"><div className="border-t border-blue-700 pt-4"><button onClick={handleLogout} className="p-2 hover:bg-blue-700 rounded-lg"><FaSignOutAlt /></button></div></div>
      </div>
      <div className="ml-0 lg:ml-64">
        <header className="bg-white shadow-sm border-b"><div className="px-6 py-4"><h2 className="text-2xl font-semibold">Ayarlar</h2></div></header>
        <div className="px-6 py-4"><nav className="flex space-x-8">
          <button onClick={() => setActiveTab('profile')} className={`py-2 px-1 border-b-2 ${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent'}`}><FaUser className="inline mr-2" />Profil</button>
          <button onClick={() => setActiveTab('security')} className={`py-2 px-1 border-b-2 ${activeTab === 'security' ? 'border-blue-500 text-blue-600' : 'border-transparent'}`}><FaShieldAlt className="inline mr-2" />Güvenlik</button>
        </nav></div>
        <div className="px-6 py-6">
          {activeTab === 'profile' && <div className="bg-white rounded-lg border p-6"><h3 className="text-lg font-semibold mb-4">Profil</h3><div className="space-y-4"><div><label className="block text-sm font-medium mb-2">Ad</label><input type="text" value={user?.name || ''} disabled className="w-full px-4 py-2 border rounded-lg bg-gray-50" /></div></div></div>}
          {activeTab === 'security' && <div className="bg-white rounded-lg border p-6"><h3 className="text-lg font-semibold mb-4">Güvenlik</h3><p>2FA ayarları</p></div>}
        </div>
      </div>
    </div>
  );
}
