'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaLock, FaUtensils, FaUserTie, FaMoneyBillWave } from 'react-icons/fa';
import apiService from '@/services/api';

export default function StaffLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Backend'den staff login
      const response = await apiService.staffLogin({
        username: username.trim(),
        password: password
      });

      if (response.success && response.data) {
        // Staff bilgilerini localStorage'a kaydet
        localStorage.setItem('staff_user', JSON.stringify(response.data));
        localStorage.setItem('staff_token', response.data.token || 'authenticated');
        
        // Role göre yönlendir
        const role = response.data.role;
        if (role === 'chef') {
          router.push('/mutfak');
        } else if (role === 'waiter') {
          router.push('/garson');
        } else if (role === 'cashier') {
          router.push('/kasa');
        } else {
          router.push('/garson'); // Default
        }
      } else {
        setError('Kullanıcı adı veya şifre hatalı!');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Giriş yapılırken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-4xl text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Personel Girişi</h1>
          <p className="text-gray-600">Hesabınıza giriş yapın</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="kullanici_adi"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        {/* Panel Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-4">Paneller:</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <FaUtensils className="text-2xl text-orange-600 mx-auto mb-1" />
              <p className="text-xs text-gray-700 font-medium">Mutfak</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <FaUserTie className="text-2xl text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-700 font-medium">Garson</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <FaMoneyBillWave className="text-2xl text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-700 font-medium">Kasa</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
