'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaCog, 
  FaShieldAlt, 
  FaBell, 
  FaDatabase,
  FaUser,
  FaSignOutAlt,
  FaStore,
  FaCheckCircle,
  FaTimesCircle,
  FaKey
} from 'react-icons/fa';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  twoFactorEnabled?: boolean;
}

interface TwoFactorStatus {
  twoFactorEnabled: boolean;
  backupCodesCount: number;
}

export default function AdminSettings() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [disableCode, setDisableCode] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'https://masapp-backend.onrender.com';

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
      fetch2FAStatus(accessToken);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/admin/login');
    }
  }, [router]);

  const fetch2FAStatus = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/2fa/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTwoFactorStatus(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${API_URL}/api/admin/2fa/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: disableCode })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTwoFactorStatus({ twoFactorEnabled: false, backupCodesCount: 0 });
        setShowDisableForm(false);
        setDisableCode('');
        const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
        adminUser.twoFactorEnabled = false;
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
      } else {
        setError(data.message || '2FA devre dışı bırakılamadı');
      }
    } catch (error) {
      setError('Bağlantı hatası oluştu');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white transform transition-transform duration-300 ease-in-out z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold">RestXQr Admin</h1>
          <p className="text-blue-200 text-sm mt-1">Sistem Yönetimi</p>
        </div>

        <nav className="mt-6">
          <Link href="/admin/dashboard" className="flex items-center px-6 py-3 hover:bg-blue-700 transition-colors">
            <FaDatabase className="mr-3" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/restaurants" className="flex items-center px-6 py-3 hover:bg-blue-700 transition-colors">
            <FaStore className="mr-3" />
            <span className="font-medium">Restoranlar</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center px-6 py-3 bg-blue-700 bg-opacity-50 border-l-4 border-white">
            <FaCog className="mr-3" />
            <span className="font-medium">Ayarlar</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="border-t border-blue-700 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-blue-200">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="p-2 hover:bg-blue-700 rounded-lg">
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="ml-0 lg:ml-64">
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <FaCog className="text-lg text-gray-600" />
              </button>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Ayarlar</h2>
                <p className="text-sm text-gray-500 mt-1">Hesap ve güvenlik ayarları</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-800">
                <FaBell />
              </button>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        <div className="px-6 py-4">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaUser className="mr-2" />
                Profil
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'security' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaShieldAlt className="mr-2" />
                Güvenlik & 2FA
              </button>
            </nav>
          </div>
        </div>

        <div className="px-6 py-6">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-6">Profil Bilgileri</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                  <input type="text" value={user?.name || ''} disabled className="w-full px-4 py-2 border rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kullanıcı Adı</label>
                  <input type="text" value={user?.username || ''} disabled className="w-full px-4 py-2 border rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-2 border rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                  <input type="text" value={user?.role || ''} disabled className="w-full px-4 py-2 border rounded-lg bg-gray-50" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-6">İki Faktörlü Doğrulama (2FA)</h3>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg mr-4 ${twoFactorStatus?.twoFactorEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {twoFactorStatus?.twoFactorEnabled ? (
                            <FaCheckCircle className="text-green-600 text-xl" />
                          ) : (
                            <FaTimesCircle className="text-gray-400 text-xl" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">2FA Durumu</p>
                          <p className="text-sm text-gray-600">
                            {twoFactorStatus?.twoFactorEnabled 
                              ? 'Hesabınız iki faktörlü doğrulama ile korunuyor' 
                              : 'Hesabınızı korumak için 2FA aktif edin'}
                          </p>
                          {twoFactorStatus?.twoFactorEnabled && twoFactorStatus.backupCodesCount > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {twoFactorStatus.backupCodesCount} yedek kod mevcut
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        twoFactorStatus?.twoFactorEnabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {twoFactorStatus?.twoFactorEnabled ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>

                    {!twoFactorStatus?.twoFactorEnabled ? (
                      <button
                        onClick={() => router.push('/admin/2fa-setup')}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                      >
                        <FaShieldAlt />
                        2FA Aktif Et
                      </button>
                    ) : (
                      <div className="space-y-4">
                        {!showDisableForm ? (
                          <button
                            onClick={() => setShowDisableForm(true)}
                            className="w-full bg-red-50 text-red-600 py-3 px-4 rounded-lg font-semibold hover:bg-red-100 transition-all border border-red-200"
                          >
                            2FA Devre Dışı Bırak
                          </button>
                        ) : (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-semibold text-red-900 mb-3">2FA Devre Dışı Bırak</h4>
                            <p className="text-sm text-red-800 mb-4">Authenticator uygulamanızdan doğrulama kodunu girin</p>
                            <form onSubmit={handleDisable2FA} className="space-y-3">
                              <input
                                type="text"
                                value={disableCode}
                                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                                className="w-full px-4 py-2 border rounded-lg text-center text-lg tracking-widest font-mono"
                                placeholder="000000"
                                maxLength={6}
                                required
                              />
                              {error && <div className="text-red-600 text-sm">{error}</div>}
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowDisableForm(false);
                                    setDisableCode('');
                                    setError('');
                                  }}
                                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                                >
                                  İptal
                                </button>
                                <button
                                  type="submit"
                                  disabled={disableCode.length !== 6}
                                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                  Devre Dışı Bırak
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <FaKey className="mr-2" />
                  2FA Nedir?
                </h4>
                <p className="text-sm text-blue-800">
                  İki faktörlü doğrulama (2FA), hesabınıza ekstra bir güvenlik katmanı ekler. 
                  Giriş yaparken şifrenizin yanı sıra telefonunuzdaki authenticator uygulamasından 
                  bir kod girmeniz gerekir. Bu sayede şifreniz çalınsa bile hesabınız güvende kalır.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
